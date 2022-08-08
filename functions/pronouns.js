const pronouns = [{
  id: "994247886839746560",
  label: "they/them",
}, {
  id: "994247977218613388",
  label: "she/her"
}, {
  id: "994248003982475265",
  label: "he/him"
}, {
  id: "994248026208088154",
  label: "it/its"
}, {
  id: "994248218286227466",
  label: "e/em"
}, {
  id: "994248296392564736",
  label: "xsie/xseirz"
}];

module.exports = async function(interaction) {
  var updated = null;

  if (interaction.customId) {
    updated = interaction.member.roles.resolve(interaction.customId) ? 'remove' : 'add';
    interaction.member.roles[updated](interaction.customId);
  }

  var rows = [{
    type: 1,
    components: []
  }];

  for (var pronoun of pronouns) {
    var row = rows.length - 1;
    var emoji = '⬛';

    if (rows[row].components.length == 4) {
      rows[++row] = {
        type: 1,
        components: []
      };
    }

    if (pronoun.id == interaction.customId) {
      emoji = updated == "add" ? '✅' : '⬛';
    } else {
      emoji = interaction.member.roles.resolve(pronoun.id) ? '✅' : '⬛'
    }

    rows[row].components.push({
      type: 2,
      style: 2,
      label: pronoun.label,
      customId: `pronouns_${pronoun.id}`,
      emoji: {
        name: emoji
      }
    });
  }

  interaction[interaction.customId ? 'update' : 'editReply']({
    content: "Select your pronoun preference. You can pick more than one.",
    components: rows
  });
}