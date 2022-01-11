const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
  MessageButton,
} = require('discord.js');

const { models } = require('../db/sequelize.js');
const { buildEmbed } = require('../helpers/embed.js');

const {
  CHANNEL_TYPES,
  REJECTION_REASONS,
  ROLE_TYPES
} = require('../constants.js');

const { Guild, Channel } = models;

const verifyReject = async (interaction, userId) => {
  try {
    let applicant = null;
    const guild = interaction.guild;
    const guildModel = await Guild.findOne({
      where: {
        discord_id: guild.id
      }
    });
    const members = await guildModel.getMembers();
    const member = members.find(member => member.discord_id === userId);

    try {
      applicant = await interaction.guild.members.fetch(userId)
    } catch {
      member.destroy();
      await interaction.message.delete();
      await interaction.reply({
        content: `That user left the server. RIP.`,
        ephemeral: true
      });
      return;
    }

    const rejectReason = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('verify-reject-reason')
          .setPlaceholder('Reason for rejection')
          .addOptions(REJECTION_REASONS),
      );

    // Ask the mod for the reason for rejection
    const updatedMessage = await interaction.update({
      components: [rejectReason],
      fetchReply: true,
    });

    // Make sure it's the interaction and mod user we want to respond
    const filter = i => {
      return i.user.id === interaction.user.id;
    };

    // Once the mod responds, encapsulate the reason for rejection and notify applicant
    const onSelect = async (i) => {
      const reasonId = i.values[0];

      const images = [];
      interaction.message.embeds.forEach(embed => {
        images.push(embed.image);
      });

      const embeds = buildEmbed('Rejected', 'RED', guild, applicant, images, i.user, reasonId);

      const channels = await guildModel.getChannels()
      const channelModel = channels.find(channel => channel.type === CHANNEL_TYPES.REJECTED);

      // Delete the message from the pending channel
      await i.message.delete();

      // Summarize rejection as an embed in the rejected channel
      guild.channels.cache.get(channelModel.discord_id).send({
        embeds: embeds
      });

      const reason = REJECTION_REASONS.find(reason => reason.value === reasonId);

      const rejectEmbedUserDM = new MessageEmbed()
        .setColor('RED')
        .setTitle('Verification not approved')
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
    await interaction.message.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
      .then(onSelect)
      .catch(async err => {
        // If the mod didn't select a reason in adequate time, revert back to approve/reject buttons
        const reviewRow = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId(`verify-approve--${applicant.id}`)
              .setLabel('Approve')
              .setStyle('SUCCESS')
          )
          .addComponents(
            new MessageButton()
              .setCustomId(`verify-reject--${applicant.id}`)
              .setLabel('Reject')
              .setStyle('DANGER')
            )
          .addComponents(
            new MessageButton()
              .setCustomId(`verify-ally--${ROLE_TYPES.ALLY}--${applicant.id}`)
              .setLabel('Ally')
              .setStyle('SECONDARY')
            )
          .addComponents(
            new MessageButton()
              .setCustomId(`verify-ally--${ROLE_TYPES.AMBASSADOR}--${applicant.id}`)
              .setLabel('Ambassador')
              .setStyle('SECONDARY')
            );

        await updatedMessage.edit({
          components: [reviewRow]
        });
      });

  } catch(e) {
    console.log(e);
    await interaction.reply({ content: `Oops! Something went wrong.`, ephemeral: true });
  }
}

module.exports = {
  verifyReject
};
