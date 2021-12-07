const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require('discord.js');

const { rejectionReasons } = require('../constants.js');

const verifyReject = async (interaction, userId) => {
  try {
    const rejectReason = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('verify-reject-reason')
          .setPlaceholder('Reason for rejection')
          .addOptions(rejectionReasons),
      );

    // Ask the mod for the reason for rejection
    await interaction.update({
      components: [rejectReason]
    });

    // Make sure it's the interaction and mod user we want to respond
    const filter = i => {
      return i.user.id === interaction.user.id;
    };

    // Once the mod responds, encapsulate the reason for rejection and notify applicant
    const onSelect = async (i) => {
      const reasonId = i.values[0];

      const rejectEmbedVerifyChannel = new MessageEmbed()
        .setColor('RED')
        .setTitle('Rejected')
        .setDescription(`Reason: ${reasonId}`)
        .setTimestamp();

      // Summarize rejection in embed
      await i.update({
        embeds: [rejectEmbedVerifyChannel],
        components: []
      });

      const reason = rejectionReasons.find(reason => reason.value === reasonId);

      const rejectEmbedUserDM = new MessageEmbed()
        .setColor('RED')
        .setTitle('Failed verification')
        .setDescription(reason.explanation)
        .setTimestamp();

      // Notify user
      interaction.client.users.fetch(userId)
        .then(user => {
          user.send({
            embeds: [rejectEmbedUserDM]
          });
        })
        .catch(err => {
          console.log(err);
        });
    }

    // Wait for the mod to follow up with reason selection
    await interaction.message.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 10000 })
      .then(onSelect)
      .catch(err => {
        console.log(err);
      });

  } catch(e) {
    console.log(e);
    await interaction.reply(`Oops! Something went wrong.`);
  }
}

module.exports = {
  verifyReject
};
