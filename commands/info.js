const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('about me ^^'),
    async execute(interaction) {
        message = `
        #2 hater ni mhin \n\n-made with love by <@741989064072495135>\n\n
Features:
        - Mass ban detection
- Mass kick detection
- Mass channel update/deletion detection
- *More tba...*
        `

        await interaction.reply(message);
    },
};