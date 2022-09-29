const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { models } = require('../db/sequelize.js');

const {
  CHANNEL_TYPES,
  ROLE_TYPES
} = require('../constants.js');

const { Guild, Role } = models;

const { Flags } = PermissionsBitField;

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
      if (!interaction.member.permissions.has(Flags.ManageRoles)) {
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

        const allyInstance = await Role.findOrCreate({
          where: {
            GuildId: guildInstance.id,
            type: ROLE_TYPES.ALLY
          },
          defaults: {
            discord_id: allyRole.id,
            type: ROLE_TYPES.ALLY
          }
        });

        const ambassadorInstance = await Role.findOrCreate({
          where: {
            GuildId: guildInstance.id,
            type: ROLE_TYPES.AMBASSADOR
          },
          defaults: {
            discord_id: ambassadorRole.id,
            type: ROLE_TYPES.AMBASSADOR
          }
        });

        allyInstance[0].discord_id = allyRole.id;
        ambassadorInstance[0].discord_id = ambassadorRole.id;

        await allyInstance[0].setGuild(guildInstance);
        await ambassadorInstance[0].setGuild(guildInstance);

        await allyInstance[0].save();
        await ambassadorInstance[0].save();

        await interaction.reply(`Finished!`);
      } catch(e) {
        console.log(e);
        await interaction.reply(`Oops! Something went wrong.`);
      }
  },
};
