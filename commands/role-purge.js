const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { models } = require('../db/sequelize.js');
const { Guild, Role } = models;

const {
  ROLE_TYPES
} = require('../constants.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-purge')
    .setDescription('Removes all users from the specified role.')
    .addRoleOption(option =>
      option.setName('target')
        .setDescription('The role you want to remove users from.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('exemption')
        .setDescription('Optional, exempt users who have this role.'))
    .addRoleOption(option =>
      option.setName('qualifier')
        .setDescription('Users must have this role in order to be evaluated by the command.'))
    .addStringOption(option =>
      option.setName('foreign-server-exemption')
        .setDescription('(Server ID string) Optional, exempt users who are verified in this server.')),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }
      const guild = interaction.guild;
      const members = await guild.members.fetch();
      console.log(`Checking roles of ${members.size} members`);

      const targetRole = await interaction.options.getRole('target');
      const targetRoleId = targetRole.id;
      let exemptionRole = await interaction.options.getRole('exemption');
      let exemptionRoleId = null;
      let qualifierRole = await interaction.options.getRole('qualifier');
      let qualifierRoleId = null;

      let foreignServerId = await interaction.options.getString('foreign-server-exemption');
      let foreignGuild = null;
      let foreignRole = null;

      let count = 0;

      if (exemptionRole) {
        exemptionRoleId = exemptionRole.id;
      }

      if (qualifierRole) {
        qualifierRoleId = qualifierRole.id;
      }

      if (foreignServerId) {
        try {
          const guildInstance = await Guild.findOne({
            where: {
              discord_id: foreignServerId
            }
          });
          foreignGuild = await interaction.client.guilds.fetch(guildInstance.discord_id);
          const foreignRoles = await guildInstance.getRoles();
          foreignRole = foreignRoles.find(role => role.type === ROLE_TYPES.VERIFIED);

          if (!foreignGuild || !foreignRole) {
            throw new Error("Couldn't find guild or role");
          }
        } catch(e) {
          console.log(e);
          await interaction.reply(`Couldn't find the specified foreign server in the botato database!`);
          return;
        }
      }

      members.forEach(async member => {
        const roles = member.roles;

        // Skip this member if they have the exemption role
        if (exemptionRoleId && roles.cache.some(role => role.id === exemptionRoleId)) {
          return;
        }

        // Skip this member if they don't have the qualifier role
        if (qualifierRoleId && !(roles.cache.some(role => role.id === qualifierRoleId))) {
          return;
        }

        // Skip this member if they are verified in the specific foreign server
        if (foreignServerId) {
          let foreignUser = null;

          try {
            foreignUser = await foreignGuild.members.fetch(member.id);
          } catch(e) {
            console.log(e);
          }

          if (foreignUser && foreignUser.roles.cache.some(role => role.id === foreignRole.discord_id)) {
            return;
          }
        }

        // Otherwise, remove the target role if they have it
        if (roles.cache.some(role => role.id === targetRoleId)) {
          member.roles.remove(targetRoleId);
          count += 1;
        }
      });

      await interaction.reply(`Finished! Please allow time for rate-limiting restrictions to remove all applicable users from the role '${targetRole.name}'`);
  },
};
