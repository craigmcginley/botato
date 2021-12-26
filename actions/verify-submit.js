const {
  MessageActionRow,
  MessageButton
} = require('discord.js');

const { models } = require('../db/sequelize.js');
const { buildEmbed } = require('../helpers/embed.js');

const { CHANNEL_TYPES } = require('../constants.js');

const { Guild, Channel } = models;

const sortByCreatedTimestamp = (a, b) => {
  b.createdTimestamp - a.createdTimestamp;
};

const verifySubmit = async (interaction, guildId) => {
  const { client, channelId, user } = interaction;
  const guild = interaction.client.guilds.cache.get(guildId);
  let applicant = null;
  const dmChannel = await client.channels.fetch(channelId);
  const guildModel = await Guild.findOne({
    where: {
      discord_id: guild.id
    }
  });
  const channels = await guildModel.getChannels()
  const channelModel = channels.find(channel => channel.type === CHANNEL_TYPES.PENDING);

  try {
    applicant = await guild.members.fetch(user.id);
  } catch {
    await interaction.reply({
      content: `You left The Dawg House server! You must join the server to verify as a SPUD.`,
      ephemeral: true
    });
    return;
  }

  let messages = await dmChannel.messages.fetch();
  messages =  messages.sort(sortByCreatedTimestamp);
  let images = [];
  let botMessageTime = null;

  messages.some(message => {
    if (message.author.bot && !message.ephemeral) {
      botMessageTime = message.createdTimestamp;
      return true;
    };
  });

  messages.forEach(message => {
    if (message.author.id === user.id && message.attachments) {
      let sortedAttachments = message.attachments.sort(sortByCreatedTimestamp);
      sortedAttachments.forEach(attachment => {
        if (attachment.contentType.includes('image') && message.createdTimestamp > botMessageTime) {
          images.push(attachment);
        }
      })
    }
  });

  if (!images.length) {
    await interaction.reply({
      content: 'You didn\'t attach any images! Please try again after uploading your screenshot directly to this DM channel.',
      ephemeral: true
    });
    return;
  }

  const embeds = buildEmbed('New verification submission', 'GREEN', guild, applicant, images);

  const reviewRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId(`verify-approve--${user.id}`)
        .setLabel('Approve')
        .setStyle('SUCCESS')
        .setDisabled(true)
    )
    .addComponents(
      new MessageButton()
        .setCustomId(`verify-reject--${user.id}`)
        .setLabel('Reject')
        .setStyle('DANGER')
        .setDisabled(true)
    )
    .addComponents(
      new MessageButton()
        .setCustomId(`verify-ally--${user.id}`)
        .setLabel('Royal Ally')
        .setStyle('SECONDARY')
        .setDisabled(true)
      );

  guild.channels.cache.get(channelModel.discord_id).send({
    embeds: embeds,
    components: [reviewRow],
  }).then(message => {
    reviewRow.components.forEach(component => {
      component.setDisabled(false);
    });

    setTimeout(() => {
      message.edit({
        components: [reviewRow]
      })
    }, 5000);
  });

  await interaction.update({
    components: []
  });

  await interaction.followUp({
    content: 'Great! We\'ll review your submission soon and get back to you.'
  });
}

module.exports = {
  verifySubmit
};
