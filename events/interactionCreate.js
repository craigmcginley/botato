const { verifySubmit } = require('../actions/verify-submit.js');
const { verify } = require('../actions/verify.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!(interaction.isCommand() || interaction.isButton())) return;
    console.log(`${interaction.user.tag} triggered ${interaction.commandName || interaction.customId} from ${interaction.channel.name ? '#' + interaction.channel.name : 'DM'}`);

    if (interaction.isCommand()) {
      const { client, commandName } = interaction;

      try {
        const command = client.commands.get(commandName);
        if (!command) return;

        command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
      }
    }

    if (interaction.isButton()) {
      const { customId } = interaction;

      try {
        switch (customId) {
          case 'verify':
            verify(interaction);
            break;
          case 'verify-submit':
            verifySubmit(interaction);
            break;
          default:
            await interaction.reply({ content: 'There was an error while executing this action.', ephemeral: true });
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this action.', ephemeral: true });
      }
    }
  },
};
