module.exports = async function(interaction) {
  if (interaction.customId) {
    switch (interaction.customId) {
      case 'join':
        joinSprint();
        break;
      case 'leave':
        leaveSprint();
        break;
    }
  } else {
    if (interaction.client.sprint) {
      joinSprint();
    } else {
      startSprint();
    }
  }

  function startSprint() {
    interaction.reply({
      content: `A new sprint has started! ⏳ 15 minutes\r\n\r\nSprinters: <@${interaction.user.id}>`,
      components: [{
        type: 1,
        components: [{
          type: 2,
          style: 1,
          customId: 'sprint_join',
          label: 'Join'
        }, {
          type: 2,
          style: 2,
          customId: 'sprint_leave',
          label: 'Leave'
        }]
      }],
      fetchReply: true
    }).then((message) => {
      interaction.client.sprint = {
        message: message,
        sprinters: [interaction.user.id]
      };
    });
  }

  function joinSprint() {
    if (interaction.client.sprint) {
      if (interaction.client.sprint.sprinters.includes(interaction.user.id)) {
        interaction.reply({
          content: 'You already joined this sprint!',
          ephemeral: true
        });
      } else {
        if (interaction.deferUpdate) {
          interaction.deferUpdate();
        } else {
          interaction.reply({
            content: "You've been added to the active sprint.",
            ephemeral: true
          });
        }

        interaction.client.sprint.sprinters.push(interaction.user.id);
        updateSprinters();
      }
    } else {
      startSprint();
    }
  }

  function leaveSprint() {
    if (interaction.client.sprint) {
      if (interaction.client.sprint.sprinters.includes(interaction.user.id)) {
        interaction.deferUpdate();
        interaction.client.sprint.sprinters = interaction.client.sprint.sprinters.filter((sprinter) => sprinter != interaction.user.id);
        updateSprinters();
      } else {
        interaction.reply({
          content: "You haven't joined this sprint, you twat.",
          ephemeral: true
        });
      }
    } else {
      interaction.reply({
        content: "There isn't an active sprint right now.",
        ephemeral: true
      });
    }
  }

  function updateSprinters() {
    interaction.client.sprint.message.content = interaction.client.sprint.message.content.split('Sprinters:').shift() + `Sprinters: ${interaction.client.sprint.sprinters.length > 0 ? interaction.client.sprint.sprinters.map((sprinter) => '<@' + sprinter + '>').join(' ') : '*No one... cowards.*'}`;

    interaction.client.sprint.message.edit({
      content: interaction.client.sprint.message.content
    });
  }
}
