const secrets = require('./secrets.json');
const commands = require('./commands.json');

const Discord = require('discord.js');

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
   if (row.quote?.trim()) {
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
});