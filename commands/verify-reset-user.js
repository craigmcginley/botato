const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { models } = require('../db/sequelize.js');

const { Guild, Member } = models;

const { Flags } = PermissionsBitField;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-reset-user')
    .setDescription('Reset the user\'s application so they can trigger the bot again.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to reset.')
        .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Flags.ManageRoles)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }

      const discordUser = await interaction.options.getUser('user');

      const member = await Member.findOne({
        where: {
          discord_id: discordUser.id
        }
      });

      if (member) {
        await member.destroy();

        await interaction.reply(`Finished! Removed ${discordUser.username} from database`);
      } else {
        await interaction.reply(`Couldn't find that user in the database!`);
      }
  },
};
