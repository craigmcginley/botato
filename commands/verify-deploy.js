const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Permissions
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinChannelId } = require('../variables.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-deploy')
    .setDescription('Deploy the verification system.')
    .addChannelOption(option =>
      option.setName('join-channel')
        .setDescription('The channel where users will initiate their verification process.')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('review-channel')
        .setDescription('The channel where moderators review the verification submissions.')
        .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
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

        const joinChannel = await interaction.options.getChannel('join-channel');

        joinChannel.send({
          embeds: [embed],
          components: [action]
        });

        await interaction.reply(`Deployed!`);
      } catch(e) {
        console.log(e);
        await interaction.reply(`Oops! Something went wrong.`);
      }
  },
};
