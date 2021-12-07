const { MessageEmbed } = require('discord.js');
const {
  guildId,
  welcomeChannelId,
  verifiedRole
} = require('../variables.js');

const verifyApprove = async (interaction, userId) => {
  try {
    const approveEmbedVerifyChannel = new MessageEmbed()
      .setColor('GREEN')
      .setTitle('Approved')
      .setTimestamp();

    // Summarize approval to signify it's finished
    interaction.update({
      embeds: [approveEmbedVerifyChannel],
      components: [],
    });

    const approveEmbedUserDM = new MessageEmbed()
      .setColor('GREEN')
      .setTitle('Verified')
      .setDescription(`You've been verified! Please read the instructions in <#${welcomeChannelId}> to finish your join process, and we'll see you out there!`)
      .setTimestamp();

    // Notify user of approval and next steps
    interaction.client.guilds.fetch(guildId).then(guild => {
      guild.members.fetch(userId)
        .then(member => {
          member.roles.add(verifiedRole)
          member.send({
            embeds: [approveEmbedUserDM]
          });
        })
        .catch(err => {
          console.log(err);
        });
    });


  } catch(e) {
    console.log(e);
    await interaction.reply(`Oops! Something went wrong.`);
  }
}

module.exports = {
  verifyApprove
};
