const { AuditLogEvent } = require('discord.js');

const config = {
    threshold: 3,
    timeWindow: 10000,
    action: 'kick',
};

const banCache = new Map();

module.exports = {
    name: 'guildBanAdd',
    once: false,
    async execute(ban, client) {
        const guild = ban.guild;
        const guildId = guild.id;

        if (!banCache.has(guildId)) {
            banCache.set(guildId, []);
        }

        const bans = banCache.get(guildId);

        bans.push({ userId: ban.user.id, timestamp: Date.now() });

        const now = Date.now();
        const recentBans = bans.filter(entry => now - entry.timestamp <= config.timeWindow);
        banCache.set(guildId, recentBans);

        if (recentBans.length >= config.threshold) {
            console.log(`[ALERT] Mass ban detected in guild ${guild.name}`);

            let banExecutor;
            try {
                const auditLogs = await guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberBanAdd,
                    limit: 1,
                });
                const banEntry = auditLogs.entries.first();
                banExecutor = banEntry?.executor;
            } catch (err) {
                console.error('Failed to fetch audit logs:', err);
            }

            // Alert owner
            try {
                const owner = await guild.fetchOwner();
                owner.send(
                    `[ALERT] Mass ban detected!\nExecutor: ${banExecutor?.tag || 'Unknown'}\nGuild: ${guild.name}`
                );
            } catch (err) {
                console.error('Could not DM guild owner:', err);
            }

            if (config.action === 'kick' && banExecutor) {
                const member = await guild.members.fetch(banExecutor.id).catch(() => null);
                if (member && member.kickable) {
                    member.kick('Mass ban prevention');
                } else {
                  const owner = await guild.fetchOwner();
                  owner.send(
                      `[ALERT] Flagged user cannot be kicked!\nExecutor: ${banExecutor?.tag || 'Unknown'}\nGuild: ${guild.name}`
                  );
                }
            }

            banCache.set(guildId, []);
        }
    },
};