const secrets = require('./secrets.json');
const commands = require('./commands.json');

const Cron = require('node-cron');
const Discord = require('discord.js');
const JSONdb = require('simple-json-db');

const client = new Discord.Client({
  intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages],
  partials: ["CHANNEL"]
});

const {
  GoogleSpreadsheet
} = require('google-spreadsheet');

const doc = new GoogleSpreadsheet(secrets.DATA.RESPONSES);

client.login(secrets.DISCORD.BOT_TOKEN);

client.on('ready', async () => {
  await doc.useApiKey(secrets.GOOGLE.API_KEY);

  await doc.loadInfo();

  client.sprint = {}

  setInterval(function() {
    for (let channel in client.sprint) {
      if (client.sprint[channel]) {
        let timeRemaining = 15 - Math.ceil((Date.now() - client.sprint[channel].message.createdTimestamp) / (60 * 1000));

        if (timeRemaining <= 0) {
          client.sprint[channel].message.edit({
            content: 'This sprint has ended.',
            components: []
          });

          if (client.sprint[channel].sprinters.length > 0) {
            client.sprint[channel].message.reply(`All right, the sprint is over.  How did everyone do? ${client.sprint[channel].sprinters.map((sprinter) => '<@' + sprinter + '>').join(' ')}`);
            client.sprint[channel] = null;
          } else {
            client.sprint[channel] = null;
          }
        } else {
          client.sprint[channel].message.content = `There is an ongoing sprint. ${timeRemaining % 2 == 0 ? '⌛' : '⏳'} ${timeRemaining} minute${timeRemaining == 1 ? '' : 's'}` + client.sprint[channel].message.content.split('minutes').pop();

          client.sprint[channel].message.edit({
            content: client.sprint[channel].message.content
          });
        }
      }
    }
  }, 60 * 1000);

  Cron.schedule('0 * * * *', () => {
    const today = new Date()
    const currentMonth = today.getUTCMonth()
    const currentDay = today.getUTCDate()
    const currentHour = today.getUTCHours()

    client.guilds.cache.each(async (guild) => {
      const serverDb = new JSONdb(`db/servers/${guild.id}.json`)
      const announcementTime = serverDb.get('time')

      if (announcementTime && announcementTime == currentHour) {
        const announcementChannel = serverDb.get('channel')

        if (announcementChannel) {
          guild.channels.fetch(announcementChannel).then((channel) => {
            guild.members.fetch().then((members) => {
              members = members.filter((member) => !member.user.bot)
              let birthdayMembers = []

              members.each((member) => {
                const userDb = new JSONdb(`members/${member.id}.json`)
                const birthdayData = userDb.get(guild.id)

                if (birthdayData && birthdayData.month == currentMonth && birthdayData.day == currentDay) {
                  birthdayMembers.push(`<@${member.id}>`)
                }
              })

              if (birthdayMembers.length > 0) {
                let birthdayList = new Intl.ListFormat('en', {
                  style: 'long'
                }).format(birthdayMembers)

                channel.send(`Happy birthday, ${birthdayList}!`)
              }
            })
          }).catch(() => {})
        }
      }
    })
  })
});


client.on('interactionCreate', async (interaction) => {
  if (interaction.type == Discord.InteractionType.MessageComponent || interaction.type == Discord.InteractionType.ModalSubmit) {
    let tmp = interaction.customId.split('-');

    tmp = tmp[0].split('_');
    interaction.commandName = tmp.shift();
    interaction.customId = tmp.join('_');
  }

  let command = commands.find((command) => interaction.commandName == command.name);

  if (command) {
    if (!interaction.customId && !command.doNotAck) {
      await interaction.deferReply({
        ephemeral: command.publicAck || !interaction.member ? false : true
      });
    }

    require(`./functions/${interaction.commandName}.js`)(interaction);
  } else {
    interaction.reply({
      content: "Fock off. Only my captain can command me to do that.",
      ephemeral: true
    });
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.id != client.user.id && message.mentions.users.get(client.user.id)) {
    var responses = [];
    var triggered = new Set();

    var sheet = doc.sheetsByTitle['@'];

    var rows = await sheet.getRows();

    var generic = [];
    var specific = [];

    for (let row of rows) {
      if (row.quote?.trim() && (!row.users || row.users?.split(',').includes(message.author.id))) {
        if (!row.trigger) {
          generic.push(row.quote);
        } else {
          let triggers = row.trigger.split(',');

          for (let trigger of triggers) {
            if (trigger.trim() == "*") {
              generic.push(row.quote);
            } else if (trigger.trim() && message.content.toLowerCase().match(new RegExp(`(^|[^A-Za-z])${trigger.trim()}([^A-Za-z]|$)`, 'gi'))) {
              triggered.add(trigger.trim());
              specific.push(row.quote);
            }
          }
        }
      }
    }

    responses = specific.length > 0 ? [...specific, ...specific] : [...generic, ...generic];

    if (responses.length > 0) {
      for (var i = responses.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = responses[i];
        responses[i] = responses[j];
        responses[j] = temp;
      }

      message.reply(responses[0]).then((msg) => {
        client.channels.fetch(secrets.DISCORD.DEBUG_CHANNEL_ID).then((channel) => {
          channel.send({
            embeds: [{
              title: `#${message.channel.name}`,
              url: message.url,
              description: message.content,
              thumbnail: {
                url: responses[0].startsWith('http') ? responses[0] : null
              },
              fields: [{
                name: 'response',
                value: responses[0].startsWith('http') ? 'gif' : responses[0]
              }, {
                name: 'triggers',
                value: triggered.size > 0 ? [...triggered].join(', ') : '*'
              }]
            }]
          });
        });
      });
    }
  }
});
