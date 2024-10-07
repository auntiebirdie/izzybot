const JSONdb = require('simple-json-db')

module.exports = (interaction) => {
  const db = new JSONdb(`members/${interaction.user.id}.json`)

  switch (interaction.options.getSubcommand()) {
    case 'set':
      const inputMonth = interaction.options.getNumber('month')
      const inputDay = interaction.options.getNumber('day')

      db.set('birthday', {
        month: inputMonth,
        day: inputDay
      })

      const birthday = new Date()
      birthday.setMonth(inputMonth)
      birthday.setDate(inputDay)

      return interaction.editReply({
        content: `Your birthday has been set to ${birthday.toLocaleString('default', { month: 'long', day: 'numeric' })}.`,
        ephemeral: true
      })
    case 'check':
      const targetUser = interaction.options.getUser('member')
      const birthdayData = db.get('birthday')

      if (birthdayData) {
        const birthday = new Date()
        birthday.setMonth(birthdayData.month)
        birthday.setDate(birthdayData.day)

        return interaction.editReply({
          content: `<@${targetUser.id}>'s birthday is ${birthday.toLocaleString('default', { month: 'long', day: 'numeric' })}.`,
          ephemeral: true
        })
      } else {
        return interaction.editReply({
          content: `<@${targetUser.id}> hasn't set their birthday yet.`,
          ephemeral: true
        })
      }
  }
}
