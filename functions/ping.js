module.exports = async function(interaction) {
  const role = "1231629840508260503";

  if (interaction.member.roles.resolve(role)) {
    interaction.member.roles.remove(role);

    interaction.editReply({
      content: 'You will no longer be pinged for new sprints.',
      ephemeral: true
    });
  } else {
    interaction.member.roles.add(role);

    interaction.editReply({
      content: 'You will be pinged for new sprints.',
      ephemeral: true
    });
  }
}
