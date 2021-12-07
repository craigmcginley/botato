const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID_ME,
  verificationChannelId: process.env.VERIFICATION_CHANNEL_ID,
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID,
  verifiedRole: process.env.VERIFIED_ROLE,
};
