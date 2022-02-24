const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test whatever is actively being developed.'),
    async execute(interaction) {
      console.log("testing.....");
      console.log(interaction);

      // Can change which event is emited here to test it
      // interaction.client.emit("guildMemberAdd", interaction.user);

      interaction.reply("tested.");
    }
};
