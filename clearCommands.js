require('dotenv').config();
const { REST, Routes } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
    console.error("Missing DISCORD_TOKEN or CLIENT_ID in .env");
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`🔄 Removing ALL application commands for bot ${CLIENT_ID}...`);

        // -----------------------------------------
        // 1. Remove GLOBAL commands
        // -----------------------------------------
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: [] }
        );
        console.log("✔ Cleared GLOBAL slash commands");

        // -----------------------------------------
        // 2. Remove GUILD commands from every server
        // -----------------------------------------
        // You must fetch guilds using OAuth2:
        // Bot must have "Guilds" intent (you already do)

        // NOTE: You cannot fetch guilds via REST; must do bot login —
        // But Render can't run an extra runtime here.
        // So we require the user to list guilds manually or via ENV.
        //
        // BEST PRACTICE:
        // Use the bot token to fetch guilds, then unregister.

        const { Client, GatewayIntentBits } = require('discord.js');
        const tempClient = new Client({
            intents: [GatewayIntentBits.Guilds]
        });

        tempClient.once('ready', async () => {
            console.log(`🤖 Logged in as ${tempClient.user.tag}`);
            const guilds = tempClient.guilds.cache;

            console.log(`🔍 Found ${guilds.size} guild(s).`);

            for (const [guildId, guild] of guilds) {
                console.log(`→ Clearing commands in guild: ${guild.name} (${guildId})`);

                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, guildId),
                    { body: [] }
                );

                console.log(`Cleared guild commands for ${guild.name}`);
            }

            console.log("🎉 All slash commands removed from all guilds.");
            process.exit(0);
        });

        tempClient.login(TOKEN);

    } catch (err) {
        console.error("Error clearing commands:");
        console.error(err);
        process.exit(1);
    }
})();
