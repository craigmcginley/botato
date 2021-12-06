const {
  guildId,
  verificationChannelId
} = require('../variables.js');

const sortByCreatedTimestamp = (a, b) => {
  b.createdTimestamp - a.createdTimestamp;
};

const verifySubmit = async (interaction) => {
  const { client, channelId, user } = interaction;
  const guild = client.guilds.cache.get(guildId);
  const guildMember = guild.members.cache.get(user.id);
  const channel = client.channels.cache.get(channelId);
  const messages = await channel.messages.fetch();
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

  let message = `**New verification submission**
    ${user.username}#${user.discriminator}
    ${guildMember.nickname}
  `;

  guild.channels.cache.get(verificationChannelId).send({
    content: message,
    files: [file]
  });

  // TODO: How to clean up the button after submitted
  await interaction.update({
    content: 'Submitted!'
  });
}

module.exports = {
  verifySubmit
};
