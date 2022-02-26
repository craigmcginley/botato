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
    .setDescription('Adds users from the specified role depending on their vetter roles in another server.')
    .addRoleOption(option =>
      option.setName('target') //Sundial Member
        .setDescription('The role you want to add users to.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('secondary') //Royal Spuds in Sundial
        .setDescription('Optional, also grant this role.'))
    .addRoleOption(option =>
      option.setName('unvettedRole') //Unvetted in Sundial
        .setDescription('Users must have the Unvetted role in order to be evaluated by the command.'))
        .setRequired(true)
    .addStringOption(option =>
      option.setName('foreign-server-exemption')
        .setDescription('(Server ID string) required, check for users who are verified in this server.')),
        .setRequired(true)
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
      let secondaryRole = await interaction.options.getRole('secondary');
      let secondaryRoleId = null;
      let unvettedRoleRole = await interaction.options.getRole('unvettedRole');
      let unvettedRoleRoleId = null;

      let foreignServerId = await interaction.options.getString('foreign-server-exemption');
      let foreignGuild = null;
      let foreignRole = null;

      let count = 0;

      if (secondaryRole) {
        secondaryRoleId = secondaryRole.id;
      }

      if (unvettedRoleRole) {
        unvettedRoleRoleId = unvettedRoleRole.id;
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

        // Skip this member if they don't have the unvettedRole role
        if (unvettedRoleRoleId && !(roles.cache.some(role => role.id === unvettedRoleRoleId))) {
          return;
        }

        // Only modify this member if they are verified in the specific foreign server
        if (foreignServerId) {
          let foreignUser = null;

          try {
            foreignUser = await foreignGuild.members.fetch(member.id);
          } catch(e) {
            console.log(e);
          }

          if (foreignUser && foreignUser.roles.cache.some(role => role.id === foreignRole.discord_id)) {
            if (roles.cache.some(role => role.id === targetRoleId)) {
              member.roles.add(targetRoleId);
              count += 1;
            }
          }
        }
      });

      await interaction.reply(`Finished! Please allow time for rate-limiting restrictions to remove all applicable users from the role '${targetRole.name}'`);
  },
};
