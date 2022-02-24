const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { models } = require('../db/sequelize.js');
const { Guild, Role } = models;

const {
  ROLE_TYPES
} = require('../constants.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('associate-server')
    .setDescription('Automatically verify new users who join, who are already verified in the associated server.')
    .addStringOption(option =>
      option.setName('foreign-server')
        .setDescription('(Server ID string) The server to associate.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('addition-role')
        .setDescription('An optional additional role to apply when applying the verified role.')),
    async execute(interaction) {
      if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        await interaction.reply("You don't have permission to use this.");
        return;
      }
      const guild = interaction.guild;
      let foreignServerId = await interaction.options.getString('foreign-server');
      let guildInstance = null;
      let additionalRole = await interaction.options.getRole('additional-role');

      // Find the foreign server instance in the database
      try {
        guildInstance = await Guild.findOne({
          where: {
            discord_id: foreignServerId
          }
        });

        if (!guildInstance) {
          throw new Error("Couldn't find guild");
        }

      } catch(e) {
        console.log(e);
        await interaction.reply(`Couldn't find the specified foreign server in the botato database!`);
        return;
      }

      // If there's an additional role to set, add it in the database
      if (additionalRole) {
        const additionalRoleInstance = await Role.findOrCreate({
          where: {
            GuildId: guildInstance.id,
            type: ROLE_TYPES.ADDITIONAL
          },
          defaults: {
            discord_id: additionalRole.id,
            type: ROLE_TYPES.ADDITIONAL
          }
        });

        additionalRoleInstance[0].discord_id = additionalRole.id;
        await additionalRoleInstance[0].setGuild(guildInstance);
        await additionalRoleInstance[0].save();
      }

      // Register this guild as something to check against when member is added
      // TODO: Need to associate guilds... best way? Guilds need many to many relationship
      // guildInstance.set

      await interaction.reply(`Finished! Please allow time for rate-limiting restrictions to remove all applicable users from the role '${targetRole.name}'`);
  },
};
