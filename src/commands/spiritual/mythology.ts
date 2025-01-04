import { ChatInputCommandInteraction, ApplicationCommandOptionType, EmbedBuilder, AutocompleteInteraction } from "discord.js";

import Command from "@/handlers/commands/Command";
import MythologyData from "@data/Spiritual/mythology.json";
import Logger from "@/utils/logger";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";

interface DeityData {
    name: string;
    pantheon: string;
    image: {
        url: string;
        alt: string;
    };
    description: string;
    history: string;
    titles: string[];
    domains: string[];
    symbols: string[];
    animals: string[];
    correspondences: {
        Colors: string[];
        Gemstones: string[];
        Plants: string[];
        Planet: string[];
        Element: string[];
        Metal: string[];
    };
    relations: {
        parents: string[];
        siblings: string[];
        children: string[];
        myth_events: string[];
    };
    attributes: string[];
    myth_stories: { title: string; summary: string }[];
    modern_references: string[];
    sacred_numbers: number[];
    ritual_practices: { name: string; instructions: string }[];
    sacred_locations: string[];
    worship: {
        Temples: string[];
        Festivals: string[];
        Offerings: string[];
    };
    footer?: string;
}

type MythologyDataType = {
    [pantheon in "Celtic" | "Greek" | "Egyptian" | "Roman" | "Norse"]: {
        [deityName: string]: DeityData;
    };
};

const mythologyData: MythologyDataType = MythologyData;

export default class Mythology extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "mythology",
            description: "Search or get a random deity card",
            options: [
                {
                    name: "search",
                    description: "Search for a specific deity",
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: false
                },
            ],
        },
        [
            
        ]);
    }

    private formatArrayData(data: string[] | number[] | string, defaultValue: string = "none"): string {
        if (Array.isArray(data)) {
            return data.length > 0 ? data.join(", ") : defaultValue;
        }
        return data && data.trim().length > 0 ? data : defaultValue;
    }

    private createDeityEmbed(data: DeityData, avatarUrl: string) {
        const embed = new EmbedBuilder()
            .setThumbnail(data.image.url || "https://cdn.iconscout.com/icon/premium/png-512-thumb/no-data-found-1965030-1662565.png")
            .setTitle(`__Deity: ${data.name || "Unknown"} | Pantheon: ${data.pantheon || "Unknown"}__`)
            .setDescription(data.description || "No description provided.")
            .addFields([
                { name: "History", value: data.history || "No history available." },
                { name: "Titles", value: this.formatArrayData(data.titles), inline: true },
                { name: "Domains", value: this.formatArrayData(data.domains), inline: true },
                { name: "Symbols", value: this.formatArrayData(data.symbols), inline: true },
                { name: "Animals", value: this.formatArrayData(data.animals), inline: true },
                {
                    name: "__Correspondences__",
                    value: [
                        `**Colors:** ${this.formatArrayData(data.correspondences.Colors)}`,
                        `**Gemstones:** ${this.formatArrayData(data.correspondences.Gemstones)}`,
                        `**Plants:** ${this.formatArrayData(data.correspondences.Plants)}`,
                        `**Planet:** ${this.formatArrayData(data.correspondences.Planet)}`,
                        `**Element:** ${this.formatArrayData(data.correspondences.Element)}`,
                        `**Metal:** ${this.formatArrayData(data.correspondences.Metal)}`
                    ].join("\n"),
                },
                { name: "Attributes", value: this.formatArrayData(data.attributes), inline: true },
                {
                    name: "Myth Stories",
                    value: data.myth_stories.length > 0
                    ? data.myth_stories.map((story) => `**${story.title || "Untitled"}:** ${story.summary || "No summary available."}`).join("\n\n")
                    : "None",                },
                {
                    name: "Sacred Numbers",
                    value: this.formatArrayData(data.sacred_numbers),
                    inline: true,
                },
                {
                    name: "Ritual Practices",
                    value: data.ritual_practices.length > 0
                    ? data.ritual_practices.map((ritual) => `**${ritual.name || "Unnamed"}:** ${ritual.instructions || "No instructions available."}`).join("\n\n")
                    : "None",                },
            ])
            .setColor("#EEB8B6")
            .setFooter({
                text: `Image: ${data.image.alt || "No alt text available"}\nData cross-referenced from many sources. Report incorrect data to Cabot's support server!`,
                iconURL: avatarUrl,
            });

        return embed;
    }

    private findDeity(searchTerm: string): DeityData | null {
        searchTerm = searchTerm.toLowerCase();
        for (const pantheonKey in mythologyData) {
            const pantheonData = mythologyData[pantheonKey as keyof MythologyDataType];
            for (const deityName in pantheonData) {
                if (deityName.toLowerCase().includes(searchTerm)) {
                    return pantheonData[deityName];
                }
            }
        }
        return null;
    }

    private getRandomDeity(): DeityData {
        const pantheons = Object.keys(MythologyData) as (keyof MythologyDataType)[];
        const randomPantheon = pantheons[Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * pantheons.length)];
        const deities = Object.values(MythologyData[randomPantheon]);
        return deities[Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * deities.length)];
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const searchTerm = interaction.options.getString("search");
        const avatarUrl = interaction.client.user?.avatarURL() || "";

        try { 
            const deity = searchTerm ? this.findDeity(searchTerm) : this.getRandomDeity();

            if (deity) {
                const embed = this.createDeityEmbed(deity, avatarUrl);
                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply("Deity not found.");
            }
        } catch (error) {
            Logger.error(`Error executing mythology command: ${error}`);
            await interaction.reply("An error occurred while retrieving deity data.");
        }
    }

    override async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const query = interaction.options.getFocused().toLowerCase();
        const deityNames = Object.values(MythologyData).flatMap(pantheon => Object.keys(pantheon));
        const filteredSuggestions = deityNames
            .filter(deityName => deityName.toLowerCase().startsWith(query))
            .map(deityName => ({ name: deityName, value: deityName }));

        await interaction.respond(filteredSuggestions.slice(0, 25));
    }
}