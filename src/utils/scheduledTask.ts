import fs from "fs/promises";
import cron from "node-cron";
import { TextChannel, EmbedBuilder, ChannelType } from "discord.js";
import { client } from "@/cabot";
import Logger from "@/utils/logger";

import { getMoonInformations } from "@/utils/Moon";

const scheduledEmbedsFile = "./data/TestData/scheduledEmbeds.json";

export interface ScheduledEmbed {
    serverId: string;
    channelId: string;
    embedType: string;
    roleId?: string | null;
}

export function setupScheduledTask(): void {
    cron.schedule("0 9 * * *", async () => {
        Logger.info("Running scheduled embed task...");

        const entries: ScheduledEmbed[] = await fs
            .readFile(scheduledEmbedsFile, "utf-8")
            .then((data) => JSON.parse(data))
            .catch(() => []);

        for (const { serverId, channelId, embedType, roleId } of entries) {
            const guild = client.guilds.cache.get(serverId);
            if(!guild) {
                Logger.error(`Guild ${serverId} not found.`);
                continue;
            }

            const channel = guild.channels.cache.get(channelId) as TextChannel;
            if (!channel || channel.type !== ChannelType.GuildText) {
                Logger.error(`Channel ${channelId} not found or is not a text channel.`);
                continue;
            }

            const embed = createEmbed(embedType);

            try {
                await channel.send({
                    content: roleId? `<@$${roleId}>` : undefined,
                    embeds: [embed]
                });
                Logger.info(`Embed sent to ${channelId} in ${serverId}`);
            } catch (error) {
                Logger.error(`Failed to send embed to ${channelId} in ${serverId}: ${error}`);
            }
        }
    });

    Logger.info("Scheduled test initialized.");
}

function createEmbed(embedType: string): EmbedBuilder {
    const DATE = new Date();
    const moonData = getMoonInformations(DATE);

    const { phase, emoji, date, ecliptic, trajectory, age, distance, constellation, description, percentage } = moonData;

    const embeds: Record<string, EmbedBuilder> = {
        moon_embed: new EmbedBuilder()
            .setColor("#EEB8B6")
            .setTitle(`${emoji} __Cabot's Moon Calculator__ ${emoji}`)
            .setDescription(`- Current Moon Phase: **${phase}** ${emoji} | ${percentage}%`)
            .addFields([
                { name: "__Date & Age__", value: `**Date:** \`${date.year}-${date.month}-${date.day}\`\n**Age:** \`${age}\` days`, inline: true },
                { name: "__Ecliptic Coordinates__", value: `**Latitude:** \`${ecliptic.latitude}\`\n**Longitude:** \`${ecliptic.longitude}\`\n**Distance:** \`${distance}\``, inline: true },
                { name: "__Other Details__", value: `**Phase:** ${phase}\n**Trajectory:** ${trajectory}\n**Constellation:** ${constellation}`, inline: false },
                { name: "__Description__", value: `${description}`, inline: false }
            ])
            .setFooter({
                text: "Data provided by Cabot\'s Moon Calculator\nLearn more about lunar magic below \'Learn Lunar Magic!\'\nTo remove this scheduled embed use /schedule",
            })
            .setTimestamp(),
    };
    return embeds[embedType];
}

export async function runScheduledTaskOnce(): Promise<void> {
    Logger.info("Running manual scheduled task...");

    const entries: ScheduledEmbed[] = await fs
        .readFile(scheduledEmbedsFile, "utf-8")
        .then((data) => JSON.parse(data))
        .catch(() => []);

    for (const { serverId, channelId, embedType, roleId } of entries) {
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            Logger.error(`Guild ${serverId} not found.`);
            continue;
        }

        const channel = guild.channels.cache.get(channelId) as TextChannel;
        if (!channel || channel.type !== ChannelType.GuildText) {
            Logger.error(`Channel ${channelId} not found or is not a text channel.`);
            continue;
        }

        const embed = createEmbed(embedType);

        try {
            await channel.send({
                content: roleId ? `<@&${roleId}>` : undefined,
                embeds: [embed],
            });
            Logger.info(`Embed sent to ${channelId} in ${serverId}`);
        } catch (error) {
            Logger.error(`Failed to send embed to ${channelId} in ${serverId}: ${error}`);
        }
    }
}

export function testCronSchedule(cronTime: string): void {
    cron.schedule(cronTime, async () => {
        Logger.info("Testing cron task...");
        await runScheduledTaskOnce();
    });
}