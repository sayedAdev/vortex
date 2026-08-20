const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`[CINEMA BOT] The reels are spinning. Logged in as ${client.user.tag}`);
    },
};