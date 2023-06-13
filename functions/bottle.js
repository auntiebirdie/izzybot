const Discord = require('discord.js');
const Secrets = require('../secrets.json');

const {
  Datastore
} = require('@google-cloud/datastore');

const DB = new Datastore({
  namespace: 'izzybot'
});

module.exports = async function(interaction) {
  if (interaction.type == Discord.InteractionType.ApplicationCommand) {
    const user = interaction.options.getUser('user');

    if (user.id == interaction.client.user.id) {
      interaction.reply({
        content: "... Keep it.",
        ephemeral: true
      });
    } else {
      const modal = new Discord.ModalBuilder()
        .setCustomId(`bottle_${user.id}`)
        .setTitle(`Send a message to ${user.username}`)
        .addComponents(
          new Discord.ActionRowBuilder().addComponents(
            new Discord.TextInputBuilder()
            .setCustomId('message')
            .setStyle('Paragraph')
            .setLabel('Say something nice...')
            .setRequired(true)
          ));

      interaction.showModal(modal);
    }
  } else if (interaction.type == Discord.InteractionType.ModalSubmit) {
    await interaction.deferReply({
      ephemeral: true
    });

    const to = interaction.client.guilds.cache.get(Secrets.DISCORD.GUILD_ID).members.cache.get(interaction.customId);
    const from = interaction.user.id;
    const message = interaction.fields.getTextInputValue('message')

    console.log(to.id, from, message);

    if (to) {
      to.send({
        embeds: [{
          title: 'Someone sent you a message in a bottle!',
          description: message,
          thumbnail: {
            url: 'https://thumbs.dreamstime.com/b/ink-black-white-illustration-bottle-message-inside-floating-sea-water-message-bottle-111077839.jpg'
          }
        }]
      }).then((sent) => {
        /*
        DB.save({
          key: DB.key(['Bottles', message.id]),
          data: {
            to: to.id,
            from: from,
            message: message
          }
        });
        */

        interaction.editReply({
          content: `Your message in a bottle has been sent to <@${to.id}>.`,
          ephemeral: true
        });
      }).catch((err) => {
        interaction.client.channels.fetch(Secrets.DISCORD.SPAM_CHANNEL_ID).then((channel) => {
          channel.send({
            content: `<@${to.id}>`,
            embeds: [{
              title: 'Someone sent you a message in a bottle!',
              description: message,
              thumbnail: {
                url: 'https://thumbs.dreamstime.com/b/ink-black-white-illustration-bottle-message-inside-floating-sea-water-message-bottle-111077839.jpg'
              }
            }]
          });
        });
      });
    } else {
      interaction.editReply({
        content: `I wasn't able to send your message to <@${to.id}>, but here is a copy of what you tried to send.`,
        embeds: [{
          description: message
        }],
        ephemeral: true
      });
    }
  }
}
