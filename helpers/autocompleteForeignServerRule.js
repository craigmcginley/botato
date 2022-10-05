const { models } = require('../db/sequelize.js');
const { Guild } = models;

const autocompleteForeignServerRule = async (interaction) => {
  const focusedOption = interaction.options.getFocused(true);
  let choices = [];

  if (focusedOption.name === 'server') {
    let guildInstance = await Guild.findOne({
      where: {
        discord_id: interaction.guild.id
      },
      include: 'AssociatedGuild'
    });

    let associatedGuilds = await guildInstance.getAssociatedGuild();

    let servers = await Promise.all(associatedGuilds.map(async associatedGuild => {
      let discordGuild = await interaction.client.guilds.fetch(associatedGuild.discord_id);
      return {
        name: discordGuild.name,
        value: discordGuild.id,
      }
    }))

    choices = servers;
  }

  if (focusedOption.name === 'qualifier-role' || focusedOption.name === 'conjunction-role') {
    let guild = await interaction.client.guilds.fetch(interaction.options.getString('server'));

    choices = guild.roles.cache.map(role => {
      return {
        name: role.name,
        value: role.id
      }
    });
  }

  const filtered = choices.filter(choice => choice.name.startsWith(focusedOption.value));

  await interaction.respond(filtered);
}

module.exports = {
  autocompleteForeignServerRule
};
