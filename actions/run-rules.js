const { models } = require('../db/sequelize.js');

const { Guild } = models;

const hasRole = async (guildMember, roleId) => {
  let answer = await guildMember.roles.cache.some(role => role.id === roleId);
  return answer;
}

const runRules = async (interaction) => {
  let passes = 0;

  try {
    const user = interaction.user;

    const guild = await Guild.findOne({
      where: {
        discord_id: interaction.guild.id
      }
    });

    const rules = await guild.getRules();

    await Promise.all(rules.map(async (rule) => {
      const foreignGuild = await interaction.client.guilds.fetch(rule.foreignServerId);
      const guildMember = await interaction.guild.members.fetch(user.id);
      const foreignGuildMember = await foreignGuild.members.fetch(user.id);

      const {
        qualifierRoleId,
        conjunction,
        conjunctionRoleId,
        resultAddRoleId,
        resultRemoveRoleId,
      } = rule;

      if ((conjunction && !conjunctionRoleId) || !guildMember || !foreignGuildMember) {
        return;
      }

      let pass = false;

      switch (conjunction) {
        case 'AND':
          pass = await hasRole(foreignGuildMember, qualifierRoleId) && await hasRole(foreignGuildMember, conjunctionRoleId);
          break;
        case 'AND_NOT':
          pass = await hasRole(foreignGuildMember, qualifierRoleId) && !(await hasRole(foreignGuildMember, conjunctionRoleId));
          break;
        default:
          console.log('DEFAULT');
          pass = hasRole(foreignGuildMember, qualifierRoleId);
      }

      if (pass) {
        passes += 1;

        if (resultAddRoleId) {
          const resultAddRole = await interaction.guild.roles.fetch(resultAddRoleId);
          await guildMember.roles.add(resultAddRole)
        }
        if (resultRemoveRoleId) {
          const resultRemoveRole = await interaction.guild.roles.fetch(resultRemoveRoleId);
          await guildMember.roles.remove(resultRemoveRole)
        }
      }
    }))
  } catch (e) {
    console.log(e);
  }

  if (passes > 0) {
    await interaction.reply({
      content: `Your roles have been updated.`,
      ephemeral: true
    });
  } else {
    await interaction.reply({
      content: `Couldn't update your roles. Please follow up with a vetter.`,
      ephemeral: true
    });
  }
}

module.exports = {
  runRules
};
