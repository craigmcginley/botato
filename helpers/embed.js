const {
  EmbedBuilder
} = require('discord.js');

const buildEmbed = (title, color, guild, applicant, images, reviewer=null, reason=null) => {
  // TODO: what does user.toString() actually output? Could I get better results by manually using <@{user-id}>?
  let fields = [
    { name: 'Profile', value: applicant.toString(), inline: true},
    { name: 'Username', value: `${applicant.user.username}#${applicant.user.discriminator}`, inline: true },
    { name: 'Nickname', value: `${applicant.nickname}`, inline: true },
  ];

  if (reviewer) {
    fields.push({ name: '\u200B', value: '\u200B' });
    fields.push({ name: 'Reviewed by', value: reviewer.toString(), inline: true });
  }

  if (reason) {
    fields.push({ name: 'Reason', value: reason, inline: true });
  }

  const embeds = images.map(image => {
    return embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(color)
      .setURL(`https://spud-botato.herokuapp.com/${guild.id}/${applicant.id}`)
      .addFields(fields)
      .setImage(image.url)
      .setTimestamp();
  });

  return embeds;
}

module.exports = {
  buildEmbed
};
