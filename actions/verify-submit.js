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
  const guildMember = guild.members.cache.get(user.id);
  const dmChannel = client.channels.cache.get(channelId);
  const guildModel = await Guild.findOne({
    where: {
      discord_id: guild.id
    }
  });
  const channels = await guildModel.getChannels()
  const channelModel = channels.find(channel => channel.type === CHANNEL_TYPES.PENDING);

  const messages = await dmChannel.messages.fetch();
  let file = null;

  messages.sort(sortByCreatedTimestamp).some(message => {
    if (message.author.id === user.id && message.attachments) {
      let sortedAttachments = message.attachments.sort(sortByCreatedTimestamp)
      file = sortedAttachments.first();
      return true;
    }
  });

  if (!file) {
    await interaction.reply(`You didn't attach any images! Please try again after uploading your screenshot.`);
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
    )
    .addComponents(
      new MessageButton()
        .setCustomId(`verify-reject--${user.id}`)
        .setLabel('Reject')
        .setStyle('DANGER')
      );

  guild.channels.cache.get(channelModel.discord_id).send({
    content: message,
    files: [file],
    components: [reviewRow]
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
