const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Permissions
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { models } = require('../db/sequelize.js');

const {
  CHANNEL_TYPES,
  ROLE_TYPES
} = require('../constants.js');

const { Guild, Role } = models;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-set-ally-role')
    .setDescription(`WARNING: Only works AFTER 'verify-create' command! Sets the ally role.`)
    .addRoleOption(option =>
      option.setName('ally-role')
        .setDescription('The role to apply to users that are approved as allies.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('ambassador-role')
        .setDescription('The role to apply to users that are approved as ambassador.')
        .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }

      try {
        const allyRole = await interaction.options.getRole('ally-role');
        const ambassadorRole = await interaction.options.getRole('ambassador-role');

        const guild = interaction.guild;
        const guildInstance = await Guild.findOne({
          where: {
            discord_id: guild.id
          }
        });

        const allyInstance = await Role.create({
          discord_id: allyRole.id,
          type: ROLE_TYPES.ALLY
        });

        const ambassadorInstance = await Role.create({
          discord_id: ambassadorRole.id,
          type: ROLE_TYPES.AMBASSADOR
        });

        await allyInstance.setGuild(guildInstance);
        await ambassadorInstance.setGuild(guildInstance);

        await interaction.reply(`Finished!`);
      } catch(e) {
        console.log(e);
        await interaction.reply(`Oops! Something went wrong.`);
      }
  },
};
