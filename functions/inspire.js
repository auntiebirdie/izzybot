const {
  GoogleSpreadsheet
} = require('google-spreadsheet');

const secrets = require('../secrets.json');

const doc = new GoogleSpreadsheet(secrets.DATA.CONSPIRATION);

module.exports = async function(interaction) {
  await doc.useApiKey(secrets.GOOGLE.API_KEY);

  await doc.loadInfo();

  var sheet = doc.sheetsByTitle['Sheet1'];

  var rows = await sheet.getRows();

  var responses = [];

  for (let row of rows) {
    responses.push(row.link);
  }

  for (var i = responses.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = responses[i];
    responses[i] = responses[j];
    responses[j] = temp;
  }

  interaction.editReply(responses[0]);
}