const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require('discord.js');

const verifyReject = async (interaction, userId) => {
  try {
    const rejectReason = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('verify-reject-reason')
          .setPlaceholder('Reason for rejection')
          .addOptions([
            {
              label: 'Incorrect server',
              description: 'Player is not on "Live-1" server.',
              value: 'incorrect-server',
            },
            {
              label: 'Not a Warden',
              description: 'Player is not a member of the Warden faction.',
              value: 'not-warden',
            },
            {
              label: 'Insufficient time played',
              description: 'Insufficient time played.',
              value: 'insufficient-time',
            },
            {
              label: 'Server nickname mismatch',
              description: 'The player\'s nickname in The Dawg House server does not match their steam name in game.',
              value: 'name-mismatch',
            },
            {
              label: 'Other',
              description: 'You will DM the player with the reason they failed verification.',
              value: 'other',
            },
          ]),
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

      const rejectEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('Rejected application')
        .setDescription(`Reason: ${reasonId}`)
        .setTimestamp();

      // Summarize rejection in embed
      await i.update({
        embeds: [rejectEmbed],
        components: []
      });

      // Notify user
      interaction.client.users.fetch(userId)
        .then(user => {
          user.send(reasonId); // TODO
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
