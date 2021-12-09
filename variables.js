const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
};
