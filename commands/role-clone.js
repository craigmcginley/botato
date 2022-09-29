const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { Flags } = PermissionsBitField;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-clone')
    .setDescription('Clones a role and its default permissions to new role.')
    .addRoleOption(option =>
      option.setName('target')
        .setDescription('The role you want to clone.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the new role.')
        .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Flags.ManageRoles)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }

      const guild = interaction.guild;
      const targetRole = await interaction.options.getRole('target');
      const newRoleName = await interaction.options.getString('name');

      // Make the new role with defaults
      const newRole = await guild.roles.create({
        name: newRoleName,
        color: targetRole.color,
        // position: targetRole.rawPosition,
        permissions: targetRole.permissions
      });

      const channels = await guild.channels.fetch();

      // For every channel, apply the same permission overwrites
      await channels.forEach(async channel => {
        const perms = await channel.permissionOverwrites.resolve(targetRole.id);

        if (perms) {
          let currentPerms = await channel.permissionOverwrites.cache.clone();
          const permsToCopy = currentPerms.find(perm => perm.id === targetRole.id);
          const newPermsObj = Object.assign({}, permsToCopy);

          delete newPermsObj['id'];
          newPermsObj.id = newRole.id;
          let newPerms = await currentPerms.set(newRole.id, newPermsObj);

          channel.permissionOverwrites.set(newPerms);
        }
      });

      await interaction.reply(`Finished! Created new role '${newRole.name}' cloned from '${targetRole.name}'`);
  },
};
