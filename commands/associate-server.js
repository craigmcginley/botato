const { PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { models } = require('../db/sequelize.js');
const { Guild, Role } = models;

const {
  ROLE_TYPES
} = require('../constants.js');

const { Flags } = PermissionsBitField;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('associate-server')
    .setDescription('Set up a foreign server association to enable other functions.')
    .addStringOption(option =>
      option.setName('foreign-server-id')
        .setDescription('(string) The Discord ID of the server to associate.')
        .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Flags.ManageRoles)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }

      const guild = interaction.guild;
      let foreignServerId = await interaction.options.getString('foreign-server-id');
      let associatedGuildInstance = null;

      let guildInstance = await Guild.findOne({
        where: {
          discord_id: guild.id
        }
      });

      // Find the foreign server instance in the database
      try {
        associatedGuildInstance = await Guild.findOne({
          where: {
            discord_id: foreignServerId
          }
        });

        if (!associatedGuildInstance) {
          throw new Error("Couldn't find guild");
        }

      } catch(e) {
        console.log(e);
        await interaction.reply(`Couldn't find the specified foreign server in the botato database!`);
        return;
      }

      guildInstance.addAssociatedGuild(associatedGuildInstance);

      // Register this guild as something to check against when member is added
      // TODO: Need to associate guilds... best way? Guilds need many to many relationship
      // guildInstance.set

      await interaction.reply(`Finished!`);
  },
};
