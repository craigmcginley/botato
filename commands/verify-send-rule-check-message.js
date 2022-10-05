const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { models } = require('../db/sequelize.js');

const {
  CHANNEL_TYPES
} = require('../constants.js');

const { Guild, Channel } = models;

const { Flags } = PermissionsBitField;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-send-rule-check-message')
    .setDescription(`Send the message for users to verify themselves against foreign server rule configuration.`)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the message to.')
        .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Flags.ManageRoles) || !interaction.member.permissions.has(Flags.ManageChannels)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }

      try {
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('SPUD only')
          .setDescription(`Click the button below to verify yourself.`);

        const action = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('run-rules')
              .setLabel('Verify')
              .setStyle('Primary')
          );

        const discordChannels = await interaction.guild.channels.fetch();
        const channel = await discordChannels.find(channel => channel.id === interaction.options.getChannel('channel').id);

        channel.send({
          embeds: [embed],
          components: [action]
        });

        await interaction.reply(`Finished!`);
      } catch(e) {
        console.log(e);
        await interaction.reply(`Oops! Something went wrong.`);
      }
  },
};
