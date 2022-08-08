const secrets = require('./secrets.json');
const commands = require('./commands.json');
const axios = require('axios');

const headers = {
 headers: {
  "Authorization": `Bot ${secrets.DISCORD.BOT_TOKEN}`
 }
};

console.log('Started refreshing application commands.');

axios.put(`https://discord.com/api/v9/applications/${secrets.DISCORD.APPLICATION_ID}/guilds/${secrets.DISCORD.GUILD_ID}/commands`, commands, headers).then(async (response) => {
 console.log('Successfully reloaded server commands.');
 process.exit(0);
}).catch((err) => {
 console.error(err.toJSON());
 process.exit(0);
});