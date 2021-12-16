const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Permissions
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { models } = require('../db/sequelize.js');

const {
  CHANNEL_TYPES
} = require('../constants.js');

const { Guild, Channel } = models;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-send-join-message')
    .setDescription(`WARNING: Only works AFTER 'verify-create' command! Resends the join message to the join channel.`),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES) || !interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }

      try {
        const embed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Verify to join the SPUDs!')
          .setDescription(`Click the **Join the SPUDs** button below to get instructions for the SPUD verification process in order to join.`);

        const action = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('verify')
              .setLabel('Join the SPUDs')
              .setStyle('PRIMARY')
          );

        const guild = interaction.guild;
        const guildInstance = await Guild.findOne({
          where: {
            discord_id: guild.id
          }
        });
        const channels = await guildInstance.getChannels()
        const channelModel = channels.find(channel => channel.type === CHANNEL_TYPES.JOIN);
        const discordChannels = await interaction.guild.channels.fetch();
        const joinChannel = await discordChannels.find(channel => channel.id === channelModel.discord_id);

        joinChannel.send({
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
