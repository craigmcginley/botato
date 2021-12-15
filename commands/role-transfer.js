const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

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
        .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
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
      let count = 0;

      members.forEach(member => {
        const roles = member.roles;

        if (roles.cache.some(role => role.id === fromRoleId)) {
          member.roles.remove(fromRoleId);
          member.roles.add(toRoleId);
          count += 1;
        }
      });

      await interaction.reply(`Finished! Transfered ${count} users from '${fromRole.name}' to '${toRole.name}'`);
  },
};