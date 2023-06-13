const Discord = require('discord.js');
const Colors = require('color-name-list');

module.exports = async function(interaction) {
  const customRole = interaction.member.roles.cache.find((role) => role.permissions.equals(Discord.PermissionFlagsBits.ViewChannel));

  if (interaction.type == Discord.InteractionType.ApplicationCommand) {
    var hex = customRole ? `#${customRole.color.toString(16)}` : 'RANDOM';
    var color = Colors.find(color => color.hex === hex);

    const modal = new Discord.ModalBuilder()
      .setCustomId(`role_${Date.now()}`)
      .setTitle('Who the fock are you?')
      .addComponents(
        new Discord.ActionRowBuilder().addComponents(
          new Discord.TextInputBuilder()
          .setCustomId('name')
          .setStyle('Short')
          .setLabel('Role Name')
          .setValue(customRole ? customRole.name : 'Crewmate')
          .setRequired(true)
        ),
        new Discord.ActionRowBuilder().addComponents(
          new Discord.TextInputBuilder()
          .setCustomId('color')
          .setStyle('Short')
          .setLabel('Role Color (#hex or color name)')
          .setValue(color ? color.name : hex)
          .setRequired(true)
        ),
        new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.TextInputBuilder()
          .setCustomId('color-names-list')
          .setStyle('Short')
          .setLabel('A list of color names can be found at:')
          .setValue('https://codepen.io/meodai/full/pXNpXe')
        ));

    interaction.showModal(modal);
  } else if (interaction.type == Discord.InteractionType.ModalSubmit) {
    await interaction.deferReply({
      ephemeral: true
    });

    const data = {
      name: interaction.fields.getTextInputValue('name'),
      color: interaction.fields.getTextInputValue('color')
    };

    var color = Colors.find(color => color.name.toLowerCase() === data.color.toLowerCase());

    if (color) {
      data.color = color.hex;
    }

    if (customRole) {
      customRole.setName(data.name);
      customRole.setColor(data.color);

      interaction.editReply({
        content: "Your role has been updated.",
        ephemeral: true
      });
    } else {
      interaction.guild.roles.create({
        name: data.name,
        color: data.color,
        hoist: true,
        position: 14,
        permissions: [Discord.PermissionFlagsBits.ViewChannel]
      }).then((role) => {
        interaction.member.roles.add(role).then(() => {
          interaction.editReply({
            content: "Your role has been updated.",
            ephemeral: true
          });
        });
      }).catch((err) => {
        console.log(err);
      });
    }
  }
}
