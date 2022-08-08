module.exports = async function(interaction) {
  const user = interaction.options.getUser('user');

  if (user.id == interaction.client.user.id) {
    interaction.editReply({
      content: "That's *me*, you twat.",
      ephemeral: true
    });
  } else {
    interaction.guild.channels.fetch('993970235499626546').then((channel) => {
      channel.messages.fetch().then((messages) => {
        var intro = messages.find((message) => message.author.id == user.id);

        interaction.editReply({
          content: intro ? `<@${user.id}>\r\n\`\`\`\r\n${intro.content}\r\n\`\`\`` : "I can't find an intro for that user.",
          ephemeral: true
        });
      });
    });
  }
}