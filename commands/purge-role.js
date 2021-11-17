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
      const guild = interaction.guild;
      const members = await guild.members.list();
      const targetRoleId = await interaction.options.getRole('target').id;
      let exemptionRole = await interaction.options.getRole('exemption');
      let exemptionRoleId = null;

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
        }
      });

      await interaction.reply('Finished!');
  },
};
