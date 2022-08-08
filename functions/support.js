const fs = require('fs');

module.exports = async function(interaction) {
  const roles = [{
      "id": "997225152226017301",
      "tier": "Just the Tip",
      "name": "Tipper",
      "min": 1
    },
    {
      "id": "997225675754832013",
      "tier": "Cop a Feel",
      "name": "Groper",
      "min": 69
    },
    {
      "id": "997225297139224677",
      "tier": "French Kiss",
      "name": "Kisser",
      "min": 185
    },
    {
      "id": "997225782994796614",
      "tier": "Dry Hump",
      "name": "Humper",
      "min": 5780
    },
    {
      "id": "997225865060565063",
      "tier": "Bareback",
      "name": "Backer",
      "min": 107545
    },
    {
      "id": "997225460821926042",
      "tier": "Orgasm",
      "name": "Finisher",
      "min": 2149876
    }
  ];

  var input = interaction.options.getInteger('dollarrs');
  var tierFound = false;

  for (let role of roles.reverse()) {
    if (input >= role.min && !tierFound) {
      tierFound = true;

      if (interaction.member.roles.resolve(role.id)) {
        interaction.editReply({
          content: "That amount of dollARRs doesn't have any impact on your tier."
        });
      } else {
        interaction.member.roles.add(role.id);

        interaction.editReply({
          content: `You're a ${role.name} now.  I'm sure your mother would be very proud of you.`,
          ephemeral: "true"
        });

        interaction.channel.createWebhook("PatreARRn", {
          avatar: 'https://cdn.discordapp.com/attachments/865328600101945404/997228303750529035/DL-1010_2.jpg'
        }).then((webhook) => {
          webhook.send({
            content: `Arrr, mateys! <@${interaction.member.id}> has donated enough booty to become a ${role.name}!`,
          }).then(() => {
            webhook.delete();
          });
        });
      }
    } else if (interaction.member.roles.resolve(role.id)) {
      interaction.member.roles.remove(role.id);
    }
  }

  if (!tierFound) {
    interaction.editReply({
      content: 'You realize 0 means nothing, right? As in literally nothing?',
      ephemeral: "true"
    });
  }
}