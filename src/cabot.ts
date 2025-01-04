require('dotenv').config();
import { ActivityType, Events, Client, GatewayIntentBits, Options } from 'discord.js';
import EventListenerManager from '@/handlers/events/EventListenerManager';
import CommandManager from '@/handlers/commands/CommandManager';
import ComponentManager from '@/handlers/components/ComponentManager';
import Logger from '@/utils/logger';
import { initializeDb } from '@/database/db';
import { loadLanguages } from '@/utils/Language';

export const client: Client<true> = new Client({ 
    intents: [GatewayIntentBits.Guilds],
    partials: [],

    makeCache: Options.cacheWithLimits({}),
});

async function main(): Promise<void> {
    if (!process.env.DISCORD_TOKEN) {
        Logger.error(`DISCORD_TOKEN env variable is not set!`);
        process.exit(1);
    }

    await Promise.all([
        ComponentManager.cache(),
        CommandManager.cache()
    ]);

    await client.login(process.env.DISCORD_TOKEN);
    
    // The client must be logged in for operations to work
    await Promise.all([
        CommandManager.publishGlobalCommands(),
        CommandManager.publishGuildCommands(),
        EventListenerManager.mount()
    ]);

    initializeDb();
    loadLanguages();
    
    client.emit("ready", client);
}

client.once(Events.ClientReady, async (client) => {
    Logger.info(`${client.user.username} is now online!`);

    const activities = [ "Happy New Year!!", "v6.0.0 Released", "Improved Data!", "Use /mythology", "New Tarot Decks Avaliable", "New Features Avaliable!" ];
    let index = 0;

    const updateActivity = () => {
        client.user.setPresence({
            activities: [{ type: ActivityType.Custom, name: activities[index] }],
            status: "dnd"
        });

        index = (index + 1) % activities.length;
    };

    updateActivity();
    setInterval(updateActivity, 60000);
});

main().catch(error => {
    Logger.error(`An error occurred during startup: ${error}`);
    process.exit(1);
});