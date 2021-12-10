const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require('discord.js');

const { models } = require('../db/sequelize.js');

const {
  CHANNEL_TYPES,
  REJECTION_REASONS
} = require('../constants.js');

const { Guild, Channel } = models;

const verifyReject = async (interaction, userId) => {
  try {
    let imageUrl = await interaction.message.attachments.first().url;

    const rejectReason = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('verify-reject-reason')
          .setPlaceholder('Reason for rejection')
          .addOptions(REJECTION_REASONS),
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

      const applicant = await interaction.guild.members.fetch(userId);

      const rejectEmbedVerificationChannel = new MessageEmbed()
        .setColor('RED')
        .setTitle('Rejected')
        .addFields(
          { name: 'Profile', value: `<@${applicant.id}>`, inline: true},
          { name: 'Username', value: `${applicant.user.username}#${applicant.user.discriminator}`, inline: true },
          { name: 'Nickname', value: `${applicant.nickname}`, inline: true },
          { name: '\u200B', value: '\u200B' },
          { name: 'Reviewed by', value: `<@${i.user.id}>`, inline: true },
          { name: 'Reason', value: reasonId, inline: true }
        )
        .setImage(imageUrl)
        .setTimestamp();

      const guild = interaction.guild;

      const guildModel = await Guild.findOne({
        where: {
          discord_id: guild.id
        }
      });
      const channels = await guildModel.getChannels()
      const channelModel = channels.find(channel => channel.type === CHANNEL_TYPES.REJECTED);
      const members = await guildModel.getMembers();
      const member = members.find(member => member.discord_id === userId);

      // Delete the message from the pending channel
      await i.message.delete();

      // Summarize rejection as an embed in the rejected channel
      guild.channels.cache.get(channelModel.discord_id).send({
        embeds: [rejectEmbedVerificationChannel]
      });

      const reason = REJECTION_REASONS.find(reason => reason.value === reasonId);

      const rejectEmbedUserDM = new MessageEmbed()
        .setColor('RED')
        .setTitle('Failed verification')
        .setDescription(reason.explanation)
        .setTimestamp();

      // Notify user why they were rejected
      await applicant.send({
        embeds: [rejectEmbedUserDM]
      });

      // Close member application process in database so they can open another
      member.destroy();
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
