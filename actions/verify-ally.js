const { MessageEmbed } = require('discord.js');

const { models } = require('../db/sequelize.js');
const { buildEmbed } = require('../helpers/embed.js');

const {
  CHANNEL_TYPES,
  REJECTION_REASONS,
  ROLE_TYPES
} = require('../constants.js');

const { Guild, Channel, Role, Member } = models;

const verifyAlly = async (interaction, userId) => {
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

  const channels = await guildModel.getChannels();
  const approvedChannel = channels.find(channel => channel.type === CHANNEL_TYPES.APPROVED);
  const roles = await guildModel.getRoles();
  const roleModel = roles.find(role => role.type === ROLE_TYPES.ALLY);
  const allyRole = await guild.roles.cache.get(roleModel.discord_id);

  try {
    const images = [];
    interaction.message.embeds.forEach(embed => {
      images.push(embed.image);
    });

    const embeds = buildEmbed('Approved Ally', 'FUCHSIA', guild, applicant.user, images, interaction.user);

    // Delete the message from the pending channel
    await interaction.message.delete();

    // Summarize approval as an embed in the approved channel
    guild.channels.cache.get(approvedChannel.discord_id).send({
      embeds: embeds
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
    await interaction.reply({ content: `Oops! Something went wrong.`, ephemeral: true });
  }
}

module.exports = {
  verifyAlly
};
