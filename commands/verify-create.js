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

const { Guild, Channel, Role } = models;

const { Flags } = PermissionsBitField;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-create')
    .setDescription('Deploy the verification system.')
    .addChannelOption(option =>
      option.setName('join-channel')
        .setDescription('The channel where users will initiate their verification process.')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('welcome-channel')
        .setDescription('The channel users will be directed to after verification.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('verified-role')
        .setDescription('The role to apply to users when they are verified.')
        .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Flags.ManageRoles) || !interaction.member.permissions.has(Flags.ManageChannels)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }

      try {
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Verify to join the SPUDs!')
          .setDescription(`Click the **Join the SPUDs** button below to get instructions for the SPUD verification process in order to join.`);

        const action = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('verify')
              .setLabel('Join the SPUDs')
              .setStyle('Primary')
          );

        const guild = interaction.guild;
        const joinChannel = await interaction.options.getChannel('join-channel');
        const welcomeChannel = await interaction.options.getChannel('welcome-channel');
        const verifiedRole = await interaction.options.getRole('verified-role');

        const category = await guild.channels.create({
          name: 'Verifications',
          type: 4 // GuildCategory
        });
        const pendingChannel = await guild.channels.create({ name: 'pending' });
        const approvedChannel = await guild.channels.create({ name: 'approved' });
        const rejectedChannel = await guild.channels.create({ name: 'rejected' });

        pendingChannel.setParent(category.id);
        approvedChannel.setParent(category.id);
        rejectedChannel.setParent(category.id);

        const guildInstance = await Guild.create({
          discord_id: guild.id
        });
        const categoryChannelInstance = await Channel.create({
          discord_id: category.id,
          type: CHANNEL_TYPES.CATEGORY,
        });
        const joinChannelInstance = await Channel.create({
          discord_id: joinChannel.id,
          type: CHANNEL_TYPES.JOIN,
        });
        const welcomeChannelInstance = await Channel.create({
          discord_id: welcomeChannel.id,
          type: CHANNEL_TYPES.WELCOME,
        });
        const pendingChannelInstance = await Channel.create({
          discord_id: pendingChannel.id,
          type: CHANNEL_TYPES.PENDING
        })
        const approvedChannelInstance = await Channel.create({
          discord_id: approvedChannel.id,
          type: CHANNEL_TYPES.APPROVED
        })
        const rejectedChannelInstance = await Channel.create({
          discord_id: rejectedChannel.id,
          type: CHANNEL_TYPES.REJECTED
        })
        const roleInstance = await Role.create({
          discord_id: verifiedRole.id,
          type: ROLE_TYPES.VERIFIED
        });

        await categoryChannelInstance.setGuild(guildInstance);
        await joinChannelInstance.setGuild(guildInstance);
        await welcomeChannelInstance.setGuild(guildInstance);
        await pendingChannelInstance.setGuild(guildInstance);
        await approvedChannelInstance.setGuild(guildInstance);
        await rejectedChannelInstance.setGuild(guildInstance);
        await roleInstance.setGuild(guildInstance);

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
