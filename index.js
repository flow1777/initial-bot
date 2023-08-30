const { Client, Intents, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');
const fs = require('fs');

const { token, clientId, guildId } = require('./config.json');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
});

client.commands = new Collection();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        commands.push(command.data);
        client.commands.set(command.data.name, command);
    }
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('[+] Realizando tentativa para iniciar slash commands (/).');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('[+] O slash commands foi iniciado com sucesso (/).');
    } catch (error) {
        console.error(error);
    }
})();

const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Ocorreu um erro ao utilizar o ultimo comando.', ephemeral: true });
    }
});

client.login(token);
