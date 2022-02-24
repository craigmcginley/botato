// WIP
// const { models } = require('../db/sequelize.js');
//
// const {
//   CHANNEL_TYPES,
//   ROLE_TYPES
// } = require('../constants.js');
//
// const { Guild, Channel, Role } = models;
//
// module.exports = {
//   name: 'guildMemberAdd',
//   async execute(user) {
//     // console.log(`${interaction.user.tag} triggered ${interaction.commandName || interaction.customId} from ${interaction.channel && interaction.channel.name ? '#' + interaction.channel.name : 'DM'}`);
//
//     const guildInstance = await Guild.findOne({
//       where: {
//         discord_id: foreignServerId
//       }
//     });
//     const foreignGuild = await interaction.client.guilds.fetch(guildInstance.discord_id);
//
//     // Guild.findOne()
//   },
// };
