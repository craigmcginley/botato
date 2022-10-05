const { PermissionsBitField } = require('discord.js');
const {
  SlashCommandBuilder,
} = require('@discordjs/builders');

const { models } = require('../db/sequelize.js');
const { Guild, Rule } = models;

const { Flags } = PermissionsBitField;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-foreign-server-rule')
    .setDescription('Create a rule for conditionally applying roles based on the roles of a foreign server.')
    .addStringOption(option =>
      option.setName('server')
        .setDescription('Which associated server does this rule apply to')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
      option.setName('qualifier-role')
        .setDescription('Which role from the foreign server to target')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
      option.setName('conjunction')
        .setDescription('Combine with an additional role')
        .addChoices(
          { name: 'AND', value: 'AND' },
          { name: 'AND NOT', value: 'AND_NOT' },
        ))
    .addStringOption(option =>
      option.setName('conjunction-role')
        .setDescription('Which role from the foreign server to target')
        .setAutocomplete(true))
    .addRoleOption(option =>
      option.setName('result-add-role')
        .setDescription('Which role from this server should be given to the user if they qualify for the rule'))
    .addRoleOption(option =>
      option.setName('result-remove-role')
        .setDescription('Which role from this server should be removed from the user if they qualify for the rule')),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Flags.ManageRoles)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }

      let guildInstance = await Guild.findOne({
        where: {
          discord_id: interaction.guild.id
        }
      });

      const ruleInstance = await Rule.create({
        foreignServerId: interaction.options.getString('server'),
        qualifierRoleId: interaction.options.getString('qualifier-role'),
        conjunction: interaction.options.getString('conjunction'),
        conjunctionRoleId: interaction.options.getString('conjunction-role'),
        resultAddRoleId: interaction.options.getRole('result-add-role').id,
        resultRemoveRoleId: interaction.options.getRole('result-remove-role').id,
      });

      ruleInstance.setGuild(guildInstance);

      interaction.reply("Successfully saved new rule.")
    }
};
