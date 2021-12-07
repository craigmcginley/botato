const { MessageEmbed } = require('discord.js');
const {
  guildId,
  welcomeChannelId,
  verifiedRole
} = require('../variables.js');

const verifyApprove = async (interaction, userId) => {
  try {
    const approveEmbedMod = new MessageEmbed()
      .setColor('GREEN')
      .setTitle('Approved application')
      .setTimestamp();

    // Summarize approval to signify it's finished
    interaction.update({
      embeds: [approveEmbedMod],
      components: [],
    });

    const approveEmbedUser = new MessageEmbed()
      .setColor('GREEN')
      .setTitle('Approved application')
      .setDescription(`You've been verified! Please read the instructions in <#${welcomeChannelId}> to finish your join process, and we'll see you out there!`)
      .setTimestamp();

    // Notify user of approval and next steps
    interaction.client.guilds.fetch(guildId).then(guild => {
      guild.members.fetch(userId)
        .then(member => {
          member.roles.add(verifiedRole)
          member.send({
            embeds: [approveEmbedUser]
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
