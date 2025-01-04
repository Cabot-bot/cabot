import { EmbedBuilder, ChatInputCommandInteraction, ApplicationCommandOptionType, type APIEmbedField } from "discord.js";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";

import HieroglyphData from '@data/Divination/hieroglyphs.json';
import { Levenshtein } from "@/utils/levenshtein";
import { detectLocale } from "@/utils/Language";

interface Hieroglyph {
    name: string;
    description: string;
    keywords: string;
    gardiner_unicode: string;
    image?: string;
    img?: string;
    diety?: any;
    category?: string;
}

interface HieroglyphCategory {
    category_name: string;
    hieroglyphs: Hieroglyph[];
}

/**
 * Function to get random hieroglyphs
 * @param count - Number of hieroglyphs to pull
 * @param category - Category to pull from
 * @returns Array of pulled hieroglyphs with categories
 */
function getRandomHieroglyphs(count: number = 1, category: string = "mixed"): Hieroglyph[] {
    const hieroglyphs: Hieroglyph[] = [];
    count = Math.max(1, Math.min(count, 5));

    for (let i = 0; i < count; i++) {
        let availableHieroglyphs: Hieroglyph[] = [];

        if (category === "common") {
            const commonCategory = HieroglyphData.categories.find((cat: HieroglyphCategory) => cat.category_name.toLowerCase() === "common");
            availableHieroglyphs = commonCategory ? commonCategory.hieroglyphs : [];
        } else if (category === "uncommon") {
            const uncommonCategory = HieroglyphData.categories.find((cat: HieroglyphCategory) => cat.category_name.toLowerCase() === "uncommon");
            availableHieroglyphs = uncommonCategory ? uncommonCategory.hieroglyphs : [];
        } else {
            availableHieroglyphs = HieroglyphData.categories.flatMap((cat: HieroglyphCategory) =>
                cat.hieroglyphs.map((h: Hieroglyph) => ({ ...h, category: cat.category_name }))
            );
        }

        const randomIndex = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * availableHieroglyphs.length);
        const randomHieroglyph = availableHieroglyphs[randomIndex];

        if (randomHieroglyph) {
            const hieroglyphPushData: Hieroglyph = {
                name: randomHieroglyph.name,
                description: randomHieroglyph.description,
                keywords: randomHieroglyph.keywords,
                gardiner_unicode: randomHieroglyph.gardiner_unicode,
                image: randomHieroglyph.image,
                category: category === "common" || category === "uncommon"
                    ? category.charAt(0).toUpperCase() + category.slice(1)
                    : randomHieroglyph.category
            };

            if (randomHieroglyph.diety) {
                hieroglyphPushData.diety = randomHieroglyph.diety;
            }

            hieroglyphs.push(hieroglyphPushData);
        }
    }

    return hieroglyphs;
}

/**
 * Function to search for a hieroglyph
 * @param name - The name of the hieroglyph
 * @returns The found hieroglyph data or a close match result
 */
function searchHieroglyph(name: string): Hieroglyph | string {
    const searchName = name.trim().toLowerCase();
    const threshold = 3;

    let closestMatch = { name: "", distance: Infinity, hieroglyph: null as Hieroglyph | null, category: "" };

    const normalizeName = (input: string): string => input.replace(/^(the)\s+/i, '').trim();
    const normalizedSearchName = normalizeName(searchName);

    if (!HieroglyphData || !HieroglyphData.categories) {
        return "Error: Hieroglyph data is not loaded properly.";
    }

    for (const category of HieroglyphData.categories) {
        for (const hieroglyph of category.hieroglyphs) {
            const hieroglyphName = hieroglyph.name.toLowerCase();
            const normalizedHieroglyphName = normalizeName(hieroglyphName);

            if (normalizedHieroglyphName === normalizedSearchName || normalizedHieroglyphName.includes(normalizedSearchName)) {
                return {
                    name: hieroglyph.name,
                    description: hieroglyph.description,
                    keywords: hieroglyph.keywords,
                    gardiner_unicode: hieroglyph.gardiner_unicode,
                    image: hieroglyph.image,
                    category: category.category_name,
                    diety: hieroglyph.diety || null
                };
            }

            const distance = Levenshtein.get(normalizedSearchName, normalizedHieroglyphName);

            if (distance < closestMatch.distance) {
                closestMatch = {
                    name: hieroglyph.name,
                    distance,
                    hieroglyph,
                    category: category.category_name
                };
            }
        }
    }

    if (closestMatch.distance <= threshold && closestMatch.hieroglyph) {
        return {
            name: closestMatch.hieroglyph.name,
            description: closestMatch.hieroglyph.description,
            keywords: closestMatch.hieroglyph.keywords,
            gardiner_unicode: closestMatch.hieroglyph.gardiner_unicode,
            image: closestMatch.hieroglyph.image,
            category: closestMatch.category,
            diety: closestMatch.hieroglyph.diety || null
        };
    }

    return `Hieroglyph with the name "${name}" not found in either category.`;
}

export default class Hieroglyphs extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "hieroglyphics",
            description: "Hieroglyphic divination & search",
            options: [
                {
                    name: "rarity",
                    description: "Common or Uncommon | Default: mixed",
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: "common", value: "common" },
                        { name: "uncommon", value: "uncommon" }
                    ]
                },
                {
                    name: "count",
                    description: "Specify how many you want pulled",
                    required: false,
                    type: ApplicationCommandOptionType.Integer,
                },
                {
                    name: "search",
                    description: "Search for a hieroglyph by name",
                    required: false,
                    type: ApplicationCommandOptionType.String,
                }
            ]
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);
        const rarityOption = interaction.options.getString("rarity") || "mixed";
        const searchQuery = interaction.options.getString("search");
        const pullCount = interaction.options.getInteger("count") || 1;

        const avatarUrl = interaction.client.user?.avatarURL() || "";
        let embedFields: APIEmbedField[] = [];
    
        if (searchQuery) {
            const hieroglyph = searchHieroglyph(searchQuery);
    
            if (typeof hieroglyph === "string") {
                embedFields.push({ name: "Error", value: hieroglyph });
            } else {
                embedFields.push(
                    { name: `__Search result: ${searchQuery}__`, value: hieroglyph.description },
                    { name: "Keywords", value: hieroglyph.keywords },
                    { name: "Category", value: `${hieroglyph.category}`, inline: true },
                    { name: "Gardiner & Unicode", value: `\`${hieroglyph.gardiner_unicode}\``, inline: true }
                );
    
                if (hieroglyph.diety) {
                    embedFields.push({ name: "Diety", value: hieroglyph.diety });
                }
            }
        } else {
            const randomHieroglyphs: Hieroglyph[] = getRandomHieroglyphs(pullCount, rarityOption);
    
            randomHieroglyphs.forEach((hieroglyph, index) => {
                const hieroglyphTitle = pullCount > 1 
                    ? `__Hieroglyph ${index + 1}: ${hieroglyph.name}__`
                    : `__Hieroglyph: ${hieroglyph.name}__`;
    
                embedFields.push(
                    { name: hieroglyphTitle, value: hieroglyph.description },
                    { name: "Keywords", value: hieroglyph.keywords },
                    { name: "Category", value: `${hieroglyph.category}`, inline: true },
                    { name: "Gardiner & Unicode", value: `\`${hieroglyph.gardiner_unicode}\``, inline: true }
                );
    
                if (hieroglyph.diety) {
                    embedFields.push({ name: "Diety", value: hieroglyph.diety });
                }
            });
        }

        const embed = new EmbedBuilder()
            .setColor("#EEB8B6")
            .addFields(embedFields)
            .setFooter({
                text: `Rarity: ${rarityOption} - pulled: ${pullCount}\nData Sourced by: kayesconfused - Compiled by: Cabot's System`,
                iconURL: avatarUrl
            });
    
        await interaction.reply({ embeds: [embed] });
    }
}