require('dotenv').config();
import { ShardingManager } from 'discord.js';
import path from 'path';

const manager = new ShardingManager(path.resolve(__dirname, 'cabot.ts'), {
    token: process.env.DISCORD_TOKEN || '',
    totalShards: "auto",
    respawn: true,
    //execArgv: ['-r', 'ts-node/register', '-r', 'tsconfig-paths/register']
});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
manager.spawn().catch(error => {
    console.error('Error while spawning shards:', error);
});