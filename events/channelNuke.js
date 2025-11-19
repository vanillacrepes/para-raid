const { AuditLogEvent } = require('discord.js');

const config = {
    deleteThreshold: 3,
    updateThreshold: 5,
    timeWindow: 10000,
    action: 'kick'
};

const deleteCache = new Map();
const updateCache = new Map();

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log('Channel Nuke Detection is active.');

        // Channel Delete
        client.on('channelDelete', async (channel) => {
            const guild = channel.guild;
            if (!guild) return;
            const guildId = guild.id;

            if (!deleteCache.has(guildId)) deleteCache.set(guildId, []);
            const deletions = deleteCache.get(guildId);

            deletions.push({ channelId: channel.id, timestamp: Date.now() });

            const now = Date.now();
            const recentDeletes = deletions.filter(e => now - e.timestamp <= config.timeWindow);
            deleteCache.set(guildId, recentDeletes);

            if (recentDeletes.length >= config.deleteThreshold) {
                console.log(`[ALERT] Mass channel deletion detected in guild ${guild.name}`);

                let executor;
                try {
                    const logs = await guild.fetchAuditLogs({
                        type: AuditLogEvent.ChannelDelete,
                        limit: 1,
                    });
                    executor = logs.entries.first()?.executor;
                } catch (err) {
                    console.error('Failed to fetch audit logs:', err);
                }

                // Alert owner
                try {
                    const owner = await guild.fetchOwner();
                    owner.send(`[ALERT] Mass channel deletion detected!\nExecutor: ${executor?.tag || 'Unknown'}\nGuild: ${guild.name}`);
                } catch (err) {
                    console.error('Could not DM guild owner:', err);
                }

                if (config.action === 'kick' && executor) {
                    const member = await guild.members.fetch(executor.id).catch(() => null);
                    if (member && member.kickable) member.kick('Mass channel deletion prevention');
                }

                deleteCache.set(guildId, []);
            }
        });

        // Channel Update
        client.on('channelUpdate', async (oldChannel, newChannel) => {
            const guild = newChannel.guild;
            if (!guild) return;
            const guildId = guild.id;

            if (!updateCache.has(guildId)) updateCache.set(guildId, []);
            const updates = updateCache.get(guildId);

            updates.push({ channelId: newChannel.id, timestamp: Date.now() });

            const now = Date.now();
            const recentUpdates = updates.filter(e => now - e.timestamp <= config.timeWindow);
            updateCache.set(guildId, recentUpdates);

            if (recentUpdates.length >= config.updateThreshold) {
                console.log(`[ALERT] Mass channel updates detected in guild ${guild.name}`);

                let executor;
                try {
                    const logs = await guild.fetchAuditLogs({
                        type: AuditLogEvent.ChannelUpdate,
                        limit: 1,
                    });
                    executor = logs.entries.first()?.executor;
                } catch (err) {
                    console.error('Failed to fetch audit logs:', err);
                }

                // Alert owner
                try {
                    const owner = await guild.fetchOwner();
                    owner.send(`[ALERT] Mass channel updates detected!\nExecutor: ${executor?.tag || 'Unknown'}\nGuild: ${guild.name}`);
                } catch (err) {
                    console.error('Could not DM guild owner:', err);
                }

                if (config.action === 'kick' && executor) {
                    const member = await guild.members.fetch(executor.id).catch(() => null);
                    if (member && member.kickable) member.kick('Mass channel update prevention');
                }

                updateCache.set(guildId, []);
            }
        });
    },
};
