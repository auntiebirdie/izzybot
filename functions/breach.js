const secrets = require('../secrets.json');

module.exports = async function(interaction) {
  interaction.editReply({
    content: "There's been a breach of the <#998570299656261672>... someone better clean up the fooking mess, and it's not going to be me.",
    files: [{
      attachment: "https://cdn.discordapp.com/attachments/993948164346364008/1055952528174489611/containment_breach.png",
      name: "containment_breach.png"
    }]
  });
}