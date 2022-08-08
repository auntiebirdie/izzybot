const {
  GoogleSpreadsheet
} = require('google-spreadsheet');

const secrets = require('../secrets.json');
const chance = require('chance').Chance();

const doc = [
  new GoogleSpreadsheet(secrets.DATA.SHIPPING),
  new GoogleSpreadsheet(secrets.DATA.RESPONSES)
];

module.exports = async function(interaction) {
  await Promise.all([
    doc[0].useApiKey(secrets.GOOGLE.API_KEY),
    doc[1].useApiKey(secrets.GOOGLE.API_KEY)
  ]);

  await Promise.all([
    doc[0].loadInfo(),
    doc[1].loadInfo()
  ]);

  var sheet = [
    doc[0].sheetsByTitle['Prompts'],
    doc[1].sheetsByTitle['shipping']
  ];

  var rows = await sheet[0].getRows();

  var characters = [];
  var kinks = [];
  var remarks = await sheet[1].getRows();

  for (let row of rows) {
    if (row.characters)
      characters.push(row.characters);

    if (row.kinks)
      kinks.push(row.kinks);
  }

  var output = {
    characters: chance.pickset(characters, chance.integer({
      min: 2,
      max: 3
    })),
    kink: chance.pickone(kinks)
  };

  interaction.editReply({
    embeds: [{
      title: '⛵ Shipping Time',
      description: chance.pickone(remarks).remark,
      fields: [...output.characters.map((character, i) => {
        return {
          name: 'Character #' + (i + 1),
          value: character
        };
      }), {
        name: 'Kink',
        value: output.kink
      }]
    }]
  });
}