const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const whitelist_role_name = "<3";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('[DANGEROUS] Whitelist a user from risk scans.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to whitelist')
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const guild = interaction.guild;

        // Fetch member
        const member = await guild.members.fetch(targetUser.id);

        // Check if whitelist role exists, otherwise create it
        let whitelistRole = guild.roles.cache.find(r => r.name === whitelist_role_name);

        if (!whitelistRole) {
            whitelistRole = await guild.roles.create({
                name: whitelist_role_name,
                color: 'White',
                reason: 'Whitelist role created automatically'
            });
        }

        // Add role
        await member.roles.add(whitelistRole);

        await interaction.reply({
            content: `✅ **${member.user.tag}** has been whitelisted from risk scans.`,
            ephemeral: true
        });
    },
};