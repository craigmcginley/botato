const { MessageEmbed } = require('discord.js');

const { models } = require('../db/sequelize.js');

const {
  CHANNEL_TYPES,
  REJECTION_REASONS,
  ROLE_TYPES
} = require('../constants.js');

const { Guild, Channel, Role, Member } = models;

const verifyAlly = async (interaction, userId) => {
  const applicant = await interaction.guild.members.fetch(userId);
  const guild = interaction.guild;

  const guildModel = await Guild.findOne({
    where: {
      discord_id: guild.id
    }
  });

  const members = await guildModel.getMembers();
  const member = members.find(member => member.discord_id === userId);

  if (!applicant) {
    member.destroy();
    await interaction.message.delete();
    await interaction.reply(`That user left the server. RIP.`);
    return;
  }

  const channels = await guildModel.getChannels();
  const approvedChannel = channels.find(channel => channel.type === CHANNEL_TYPES.APPROVED);
  const roles = await guildModel.getRoles();
  const roleModel = roles.find(role => role.type === ROLE_TYPES.ALLY);
  const allyRole = await guild.roles.cache.get(roleModel.discord_id);

  try {
    let imageUrl = await interaction.message.attachments.first().url;

    const approveEmbedVerifiedChannel = new MessageEmbed()
      .setColor('FUCHSIA')
      .setTitle('Approved Ally')
      .addFields(
        { name: 'Profile', value: `<@${applicant.id}>`, inline: true},
        { name: 'Username', value: `${applicant.user.username}#${applicant.user.discriminator}`, inline: true },
        { name: 'Nickname', value: `${applicant.nickname}`, inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: 'Reviewed by', value: `<@${interaction.user.id}>`, inline: true },
      )
      .setImage(imageUrl)
      .setTimestamp();

    // Delete the message from the pending channel
    await interaction.message.delete();

    // Summarize approval as an embed in the approved channel
    guild.channels.cache.get(approvedChannel.discord_id).send({
      embeds: [approveEmbedVerifiedChannel]
    });

    const approveEmbedUserDM = new MessageEmbed()
      .setColor('GREEN')
      .setTitle('Verified')
      .setDescription(`You've been verified and are now a Royal Ally! You have access to the royal-allies chat and our voice channels.`)
      .setTimestamp();

    // Give the user the ally role
    await applicant.roles.add(allyRole.id);

    // Notify user of approval and next steps
    await applicant.send({
      embeds: [approveEmbedUserDM]
    });

    // Close member application process in database so they can open another
    member.destroy();

  } catch(e) {
    console.log(e);
    await interaction.reply(`Oops! Something went wrong.`);
  }
}

module.exports = {
  verifyAlly
};
