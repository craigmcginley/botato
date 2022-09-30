const {
  ActionRowBuilder,
  ButtonBuilder
} = require('discord.js');

const { models } = require('../db/sequelize.js');
const { buildEmbed } = require('../helpers/embed.js');

const {
  CHANNEL_TYPES,
  ROLE_TYPES
} = require('../constants.js');

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
    if (message.createdTimestamp > botMessageTime && message.author.id === user.id && message.attachments) {
      let sortedAttachments = message.attachments.sort(sortByCreatedTimestamp);
      sortedAttachments.forEach(attachment => {
        if (attachment && attachment.contentType && attachment.contentType.includes('image')) {
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

  const embeds = buildEmbed('New verification submission', 'Blue', guild, applicant, images);

  const reviewRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`verify-approve--${user.id}`)
        .setLabel('Approve')
        .setStyle('Success')
        .setDisabled(true)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`verify-reject--${user.id}`)
        .setLabel('Reject')
        .setStyle('Danger')
        .setDisabled(true)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`verify-ally--${ROLE_TYPES.ALLY}--${user.id}`)
        .setLabel('Ally')
        .setStyle('Secondary')
        .setDisabled(true)
      )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`verify-ally--${ROLE_TYPES.AMBASSADOR}--${user.id}`)
        .setLabel('Ambassador')
        .setStyle('Secondary')
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
