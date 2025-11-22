// leaveAllGuilds.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Guild count: ${client.guilds.cache.size}`);

    for (const [guildId, guild] of client.guilds.cache) {
        try {
            console.log(`Leaving guild: ${guild.name} (${guild.id})`);
            await guild.leave();
        } catch (err) {
            console.error(`Failed to leave guild ${guildId}:`, err);
        }
    }

    console.log('Finished leaving all guilds.');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
