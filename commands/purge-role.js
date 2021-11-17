const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge-role')
    .setDescription('Removes all users from the specified role.')
    .addRoleOption(option =>
      option.setName('target')
        .setDescription('The role you want to remove users from.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('exemption')
        .setDescription('Optional, exempt users who have this role.')),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }
      const guild = interaction.guild;
      const members = await guild.members.list();
      const targetRole = await interaction.options.getRole('target');
      const targetRoleId = targetRole.id;
      let exemptionRole = await interaction.options.getRole('exemption');
      let exemptionRoleId = null;
      let count = 0;

      if (exemptionRole) {
        exemptionRoleId = exemptionRole.id;
      }

      members.forEach(member => {
        const roles = member.roles;

        if (exemptionRoleId && roles.cache.some(role => role.id === exemptionRoleId)) {
          return;
        }

        if (roles.cache.some(role => role.id === targetRoleId)) {
          member.roles.remove(targetRoleId);
          count += 1;
        }
      });

      await interaction.reply(`Finished! Purged ${count} users from the role '${targetRole.name}'`);
  },
};
