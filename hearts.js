const {
  GoogleSpreadsheet
} = require('google-spreadsheet');

const secrets = require('./secrets.json');

const doc = new GoogleSpreadsheet(secrets.DATA.RESPONSES);

(async () => {
	  await doc.useApiKey(secrets.GOOGLE.API_KEY);

  await doc.loadInfo();

var sheet = doc.sheetsByTitle['hearts'];

	var rows = await sheet.getRows();

let hearts = ['💚', '💚', 'a'];
let message = {
  author: {
    id: "173972466912198656"
  }
}

var generic = [];
var specific = [];

for (let row of rows) {
  if (row.match?.trim() && (!row.users || row.users?.split(',').includes(message.author.id))) {
    switch (row.match) {
      case 'all':
        if (hearts[0] == hearts[1] && hearts[1] == hearts[2]) {
          if (row.heart == "*") {
            generic.push(row.response);
          } else if (row.heart == hearts[0]) {
            specific.push(row.response)
          }
        }
        break;
      case 'two':
        if (hearts[0] == hearts[1] || hearts[1] == hearts[2] || hearts[0] == hearts[2]) {
          if (row.heart == "*") {
            generic.push(row.response)
          } else if (hearts.filter((heart) => heart == row.heart).length > 1) {
            specific.push(row.response)
          }
        }
        case 'none':
          if (hearts[0] != hearts[1] && hearts[1] != hearts[2] && hearts[0] != hearts[2]) {
            generic.push(row.response)
          }
    }
  }
}

console.log(generic)
console.log(specific)
})()
