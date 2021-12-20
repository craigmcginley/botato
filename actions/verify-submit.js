const {
  MessageActionRow,
  MessageButton
} = require('discord.js');

const { models } = require('../db/sequelize.js');

const { CHANNEL_TYPES } = require('../constants.js');

const { Guild, Channel } = models;

const sortByCreatedTimestamp = (a, b) => {
  b.createdTimestamp - a.createdTimestamp;
};

const verifySubmit = async (interaction, guildId) => {
  const { client, channelId, user } = interaction;
  const guild = interaction.client.guilds.cache.get(guildId);
  const guildMember = await guild.members.fetch(user.id);
  const dmChannel = await client.channels.fetch(channelId);
  const guildModel = await Guild.findOne({
    where: {
      discord_id: guild.id
    }
  });
  const channels = await guildModel.getChannels()
  const channelModel = channels.find(channel => channel.type === CHANNEL_TYPES.PENDING);

  let messages = await dmChannel.messages.fetch();
  messages =  messages.sort(sortByCreatedTimestamp);
  let file = null;
  let botMessageTime = null;

  messages.some(message => {
    if (message.author.bot) {
      botMessageTime = message.createdTimestamp;
      return true;
    };
  });

  messages.some(message => {
    if (message.author.id === user.id && message.attachments) {
      let sortedAttachments = message.attachments.sort(sortByCreatedTimestamp);
      return sortedAttachments.some(attachment => {
        if (attachment.contentType.includes('image') && message.createdTimestamp > botMessageTime) {
          file = attachment;
          return true;
        }
      })
    }
  });

  if (!file) {
    await interaction.reply({
      content: 'You didn\'t attach any images! Please try again after uploading your screenshot directly to this DM channel.',
      ephemeral: true
    });
    return;
  }

  let message = `
    **New verification submission**
    \`Username:        ${user.username}#${user.discriminator}\`
    \`Server Nickname: ${guildMember.nickname}\`
    <@${user.id}>
  `;

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
    content: message,
    files: [file],
    components: [reviewRow]
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
