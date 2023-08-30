const { guildId } = require('../config.json');
const fs = require('fs')

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`[+] Connected sucessfull | ${client.user.tag}`);

        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            console.log(`${guildId} nao encontrada.`);
            return;
        }
    },
};
