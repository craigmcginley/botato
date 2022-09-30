const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require('discord.js');

const { models } = require('../db/sequelize.js');

const { CHANNEL_TYPES } = require('../constants.js');

const { Guild, Member } = models;

const verify = async (interaction) => {
  try {
    const user = interaction.user;
    const verifyEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Verify to join the SPUDs!')
      .setDescription(`
        In order to maintain operational security and prevent sensitive info leaks, we have a nominal verification process for those looking to join The Royal Spuds. If you are from another regiment and looking to be tagged as a Royal Ally on the server, please see the “**Royal Allies**” section of this message.

        The verification requirements are as follows:
          - Character is deployed on **Shard 1/LIVE-1 server**.
          - Character is a **Warden** faction member.
          - Character **Time in Current War** is over **one hour played**.

        **Joining the Royal SPUDs**

        1. Take a screenshot of the login screen that shows the above three critical pieces of information (see attached example). Each of these pieces of information is required to be verified.

        2. Change your Discord nickname for The Dawg House server to be the same as your in-game name if they don't already match (Right click the server icon and select "Edit server profile"). You will not be approved until these names are the same.

        3. Post your screenshot below.

        4. Click the "Submit" button below. An officer will review your screenshot at their earliest convenience, and you will receive a reply here.

        **Royal Allies**

        If you are in an existing Shard 1 Warden regiment and want to hang out here to see/join our operations, we have created a special role for that. The verification process is the same as outlined above with the additional step of posting a screenshot of your in game regiment menu (F1). Other forms of verification are accepted such as linking to your regiment discord, but this is the standard process.`
      )
      .setImage('https://images-ext-2.discordapp.net/external/dzpvSd3hefY-L8SGAAmw2O-t6AMXo9s_g_oXjU6_hVg/https/media.discordapp.net/attachments/891078787138203689/894954670840234034/Login.PNG')
      .setTimestamp()
      .setFooter({ text: `If you have any questions, you can ask a SPUD officer.` });

    const submitAction = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`verify-submit--${interaction.guildId}`)
          .setLabel('Submit')
          .setStyle('Primary')
      );

    const guild = await Guild.findOne({
      where: {
        discord_id: interaction.guild.id
      }
    });

    // Make sure the user doesn't already have an application open for this guild
    const members = await guild.getMembers();
    let memberPending = false;

    members.some(member => {
      if (member.discord_id === user.id) {
        memberPending = true;
        return true;
      }
    })

    if (memberPending) {
      interaction.reply({
        content: "You already have a verification request open!",
        ephemeral: true
      });

      return;
    }

    const member = await Member.create({
      discord_id: user.id
    });

    await member.setGuild(guild);

    user.send({
      embeds: [verifyEmbed],
      components: [submitAction]
    }).then(() => {
      interaction.deferUpdate();
    }).catch(async () => {
      member.destroy();

      interaction.reply({
        content: "Unable to DM you. Please check that your discord settings allow direct messages as outlined in the directions above.",
        ephemeral: true
      });
    });
  } catch(e) {
    console.log(e);
    await interaction.reply({
      content: 'Oops! Something went wrong.',
      ephemeral: true
    });
  }
}

module.exports = {
  verify
};
