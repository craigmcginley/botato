const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { Flags } = PermissionsBitField;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-transfer')
    .setDescription('Transfers all users of one role to another.')
    .addRoleOption(option =>
      option.setName('from')
        .setDescription('The role you want to move users from.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('to')
        .setDescription('The role you want to move users to.')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('keep-original')
        .setDescription(`Optional, keep the 'from' role and just add the 'to' role.`))
    .addRoleOption(option =>
      option.setName('exemption')
        .setDescription('Optional, exempt users who have this role from being transferred.')),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Flags.ManageRoles)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }
      const guild = interaction.guild;
      const members = await guild.members.fetch();
      console.log(`Checking roles of ${members.size} members`);

      const fromRole = await interaction.options.getRole('from');
      const fromRoleId = fromRole.id;
      const toRole = await interaction.options.getRole('to');
      const toRoleId = toRole.id;
      let exemptionRole = await interaction.options.getRole('exemption');
      let keepOriginal = await interaction.options.getBoolean('keep-original');
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

        if (roles.cache.some(role => role.id === fromRoleId)) {
          if (!keepOriginal) {
            member.roles.remove(fromRoleId);
          }
          member.roles.add(toRoleId);
          count += 1;
        }
      });

      await interaction.reply(`Finished! Transfered ${count} users from '${fromRole.name}' to '${toRole.name}'`);
  },
};
