const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mhin')
        .setDescription('muehehehehe'),
    async execute(interaction) {
        messages = ['si <@1348676065849114675> BUM', 'miss ko na sya guys', '<@1348676065849114675>: hi', 'booooo raid toh', 'BUMALIK KA NA PLEASEEEEEE', '<@1348676065849114675> isa ngang burger and fries tas large coke', 'nilalait ko lang talaga si <@1348676065849114675>']

        message = messages[Math.floor(Math.random() * messages.length)];

        await interaction.reply(message);
    },
};