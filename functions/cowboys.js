const secrets = require('../secrets.json');
const chance = require('chance').Chance();
const axios = require('axios');

module.exports = async function(interaction) {
  var adjective = await axios.get('https://random-word-form.herokuapp.com/random/adjective').then((response) => {
    return response.data[0];
  }).catch((err) => {
    return "normal";
  });

  var job = await axios.get('https://writingexercises.co.uk/php_WE/job.php').then((response) => {
    return response.data;
  }).catch((err) => {
    return "love interest";
  });

  var cover = chance.pickone(require('../data/cowboys.json'));

  interaction.editReply({
    embeds: [{
      title: `Cowboy's ${adjective} ${job}`.toLowerCase().split(' ').map((word) => word.replace(word[0], word[0].toUpperCase())).join(' '),
      url: cover.source,
      image: {
        url: cover.image
      },
      footer: {
        text: `art ©️ ${cover.credit}`
      }
    }]
  });
}
