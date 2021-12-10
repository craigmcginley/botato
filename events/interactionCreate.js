const { verify } = require('../actions/verify.js');
const { verifySubmit } = require('../actions/verify-submit.js');
const { verifyApprove } = require('../actions/verify-approve.js');
const { verifyReject } = require('../actions/verify-reject.js');


module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!(interaction.isCommand() || interaction.isButton())) return;
    console.log(`${interaction.user.tag} triggered ${interaction.commandName || interaction.customId} from ${interaction.channel && interaction.channel.name ? '#' + interaction.channel.name : 'DM'}`);

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
      const params = customId.split('--');
      const action = params[0];

      try {
        switch (action) {
          case 'verify':
            verify(interaction);
            break;
          case 'verify-submit':
            if (!params[1]) {
              await interaction.reply({ content: 'There was an error while executing this action.', ephemeral: true });
              return;
            }
            verifySubmit(interaction, params[1]);
            break;
          case 'verify-approve':
            if (!params[1]) {
              await interaction.reply({ content: 'There was an error while executing this action.', ephemeral: true });
              return;
            }
            verifyApprove(interaction, params[1]);
            break;
          case 'verify-reject':
            if (!params[1]) {
              await interaction.reply({ content: 'There was an error while executing this action.', ephemeral: true });
              return;
            }
            verifyReject(interaction, params[1]);
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
