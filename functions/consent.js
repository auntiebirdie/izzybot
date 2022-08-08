module.exports = async function(interaction) {
  const role = "994221799359389716";

  if (interaction.member.roles.resolve(role)) {
    interaction.member.roles.remove(role);

    interaction.editReply({
      content: 'You have revoked your consent to go below deck.',
      ephemeral: true
    });
  } else {
    interaction.member.roles.add(role);

    interaction.editReply({
      content: 'Your consent to go below deck has been acknowledged. Remember to still mark explicit images with spoiler tags.',
      ephemeral: true
    });
  }
}