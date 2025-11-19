const { AuditLogEvent } = require('discord.js');

const config = {
    threshold: 3,
    timeWindow: 10000,
    action: 'kick',
};

const kickCache = new Map();

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(member, client) {
        const guild = member.guild;
        const guildId = guild.id;

        if (!kickCache.has(guildId)) {
            kickCache.set(guildId, []);
        }

        const kicks = kickCache.get(guildId);

        kicks.push({ userId: member.id, timestamp: Date.now() });

        const now = Date.now();
        const recentKicks = kicks.filter(entry => now - entry.timestamp <= config.timeWindow);
        kickCache.set(guildId, recentKicks);

        if (recentKicks.length >= config.threshold) {
            console.log(`[ALERT] Mass kick detected in guild ${guild.name}`);

            let kickExecutor;
            try {
                const auditLogs = await guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberKick,
                    limit: 1,
                });
                const kickEntry = auditLogs.entries.first();
                kickExecutor = kickEntry?.executor;
            } catch (err) {
                console.error('Failed to fetch audit logs:', err);
            }

            try {
                const owner = await guild.fetchOwner();
                owner.send(
                    `[ALERT] Mass kick detected!\nExecutor: ${kickExecutor?.tag || 'Unknown'}\nGuild: ${guild.name}`
                );
            } catch (err) {
                console.error('Could not DM guild owner:', err);
            }

            if (config.action === 'kick' && kickExecutor) {
                const memberToKick = await guild.members.fetch(kickExecutor.id).catch(() => null);
                if (memberToKick && memberToKick.kickable) {
                    memberToKick.kick('Mass kick prevention');
                } else {
                  const owner = await guild.fetchOwner();
                  owner.send(
                      `[ALERT] Flagged user cannot be kicked!\nExecutor: ${kickExecutor?.tag || 'Unknown'}\nGuild: ${guild.name}`
                  );
                }
            }

            kickCache.set(guildId, []);
        }
    },
};
