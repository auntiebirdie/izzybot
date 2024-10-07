module.exports = async function(interaction) {
  if (interaction.customId) {
    switch (interaction.customId) {
      case 'join':
        joinSprint(interaction.channel.id);
        break;
      case 'leave':
        leaveSprint(interaction.channel.id);
        break;
    }
  } else {
    if (interaction.client.sprint[interaction.channel.id]) {
      joinSprint(interaction.channel.id);
    } else {
      startSprint(interaction.channel.id);
    }
  }

  function startSprint(channel) {
    interaction.reply({
      content: `<@&1231629840508260503>, a new sprint has started! ⏳ 15 minutes\r\n\r\nSprinters: <@${interaction.user.id}>`,
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
      interaction.client.sprint[channel] = {
        message: message,
        sprinters: [interaction.user.id]
      };
    });
  }

  function joinSprint(channel) {
    if (interaction.client.sprint[channel]) {
      if (interaction.client.sprint[channel].sprinters.includes(interaction.user.id)) {
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

        interaction.client.sprint[channel].sprinters.push(interaction.user.id);
        updateSprinters(channel);
      }
    } else {
      startSprint(channel);
    }
  }

  function leaveSprint(channel) {
    if (interaction.client.sprint[channel]) {
      if (interaction.client.sprint[channel].sprinters.includes(interaction.user.id)) {
        interaction.deferUpdate();
        interaction.client.sprint[channel].sprinters = interaction.client.sprint[channel].sprinters.filter((sprinter) => sprinter != interaction.user.id);
        updateSprinters(channel);
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

  function updateSprinters(channel) {
    interaction.client.sprint[channel].message.content = interaction.client.sprint[channel].message.content.split('Sprinters:').shift() + `Sprinters: ${interaction.client.sprint[channel].sprinters.length > 0 ? interaction.client.sprint[channel].sprinters.map((sprinter) => '<@' + sprinter + '>').join(' ') : '*No one... cowards.*'}`;

    interaction.client.sprint[channel].message.edit({
      content: interaction.client.sprint[channel].message.content
    });
  }
}
