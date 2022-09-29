const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { models } = require('../db/sequelize.js');

const { CHANNEL_TYPES } = require('../constants.js');

const { Guild, Channel, Role } = models;

const { Flags } = PermissionsBitField;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-destroy')
    .setDescription('WARNING: Removes the entire verification system from your server.'),
    async execute(interaction) {
      // TODO: Maybe add a confirmation since this is a highly destructive command.

      if (!interaction.member.permissions.has(Flags.ManageRoles) || !interaction.member.permissions.has(Flags.ManageChannels)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }

      try {
        const guild = interaction.guild;

        const guildInstance = await Guild.findOne({
          where: {
            discord_id: guild.id
          }
        });

        const channels = await guildInstance.getChannels();
        const roles = await guildInstance.getRoles();
        const members = await guildInstance.getMembers();

        channels.filter(channel => {
          return channel.type === CHANNEL_TYPES.CATEGORY
            || channel.type === CHANNEL_TYPES.PENDING
            || channel.type === CHANNEL_TYPES.APPROVED
            || channel.type === CHANNEL_TYPES.REJECTED;
        }).forEach(async (channel) => {
          let discordChannel = await guild.channels.cache.get(channel.discord_id);
          discordChannel.delete();
        });

        channels.map(async channel => await channel.destroy());
        roles.map(async role => await role.destroy());
        members.map(async member => await member.destroy());

        guildInstance.destroy();

        await interaction.reply(`Finished!`);
      } catch(e) {
        console.log(e);
        await interaction.reply(`Oops! Something went wrong.`);
      }
  },
};
