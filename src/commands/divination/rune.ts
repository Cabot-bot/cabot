import { EmbedBuilder, ChatInputCommandInteraction, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";

import { detectLocale } from "@/utils/Language";
import { t } from "i18next";
import { createEmbedFromData } from "@/utils/Embed";

export default class Rune extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "rune",
            description: "Cabots rune reading and rune search",
            options: [
                {
                    name: "random",
                    description: "sends a random rune or random from type",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "type",
                            description: "specify the rune type: Futhark, Ogham, Witches",
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            choices: [
                                { name: "Futhark", value: "type_futhark" },
                                { name: "Ogham", value: "type_ogham" },
                                { name: "Witches", value: "type_witches" },

                            ]
                        }
                    ]
                },
                {
                    name: "search",
                    description: "search for a specific rune across all rune types",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "rune",
                            description: "what rune do you want to search?",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete: true
                        }
                    ]
                }
            ]
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);

        const futharkRunes = t("data:divination/runes", { lng: lang, returnObjects: true }) as any[];
        const witchesRunes = t("data:divination/runeWitches", { lng: lang, returnObjects: true }) as any[];
        const oghamRunes = t("data:divination/runesOgham", { lng: lang, returnObjects: true }) as any[];

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "search") {
            const runeOption = interaction.options.getString("rune");
            const runeData = this.searchRuneData(runeOption, futharkRunes, witchesRunes, oghamRunes);

            if (!runeData) {
                await interaction.reply(t("command:runes.!runeData", { lng: lang }));
                return;
            }

            const runeType = runeData.source;
            const embed = createDetailedRuneEmbed(runeData, runeType, lang, interaction);
            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === "random") {
            const runeType =
                interaction.options.getString("type") ||
                ["type_futhark", "type_ogham", "type_witches"][
                    Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * 3)
                ];
            const runeData = fetchRandomRune(runeType, futharkRunes, witchesRunes, oghamRunes);

            if (!runeData) {
                await interaction.reply(t("command:runes.!fetch", { lng: lang }));
                return;
            }

            const embed = createDetailedRuneEmbed(runeData, runeType, lang, interaction);
            await interaction.reply({ embeds: [embed] });
        }
    }

    override async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const query = interaction.options.getFocused().toLowerCase();
        
        const futharkRunes = t("data:divination/runes", { lng: "en", returnObjects: true }) as any[];
        const witchesRunes = t("data:divination/runeWitches", { lng: "en", returnObjects: true }) as any[];
        const oghamRunes = t("data:divination/runesOgham", { lng: "en", returnObjects: true }) as any[];

        const futharklist = futharkRunes[0]?.list || [];
        const witchesList = witchesRunes[0]?.list || [];
        const oghamList = oghamRunes[0]?.list || [];

        const allSuggestions = [...futharklist, ...witchesList, ...oghamList];

        const filteredSuggestions = allSuggestions
            .filter(suggestion => suggestion.toLowerCase().startsWith(query))
            .map(suggestion => ({ name: suggestion, value: suggestion }));
        await interaction.respond(filteredSuggestions.slice(0, 25));
    }

    private searchRuneData(
        runeTitle: string | null,
        futharkRunes: any[],
        witchesRunes: any[],
        oghamRunes: any[]
    ): any | null {
        const futharkMatch = futharkRunes.find(rune => rune.rune_title === runeTitle);
        const witchesMatch = witchesRunes.find(rune => rune.rune_title && rune.rune_title.includes(runeTitle || ""));
        const oghamMatch = oghamRunes.find(rune => rune.rune_title === runeTitle);
        return futharkMatch
            ? { ...futharkMatch, source: "type_futhark" }
            : witchesMatch
            ? { ...witchesMatch, source: "type_witches" }
            : oghamMatch
            ? { ...oghamMatch, source: "type_ogham" }
            : null;
    }
}

function fetchRandomRune(type: string, futharkRunes: any[], witchesRunes: any[], oghamRunes: any[]): any {
    const runes = type === "type_futhark" ? futharkRunes : type === "type_witches" ? witchesRunes : oghamRunes;
    return runes[Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * runes.length)];
}

function createDetailedRuneEmbed(runeData: any, type: string, lang: string, interaction: ChatInputCommandInteraction): EmbedBuilder {
    const embedType = type === "type_futhark" ? "futharkEmbed" : type === "type_witches" ? "witchesEmbed" : "oghamEmbed";

    if (Array.isArray(runeData.keywords)) {
        runeData.keywords = runeData.keywords.join(", ");
    }

    const embedData = t(`command:runes.${embedType}`, { lng: lang, ...runeData, returnObjects: true }) as Record<string, any>;

    if (type === "type_ogham") {
        if (!runeData.season) {
            embedData.fields = embedData.fields.filter((field: any) => field.name !== "Season");
        }
        if (!runeData.element) {
            embedData.fields = embedData.fields.filter((field: any) => field.name !== "Element");
        }
    }
    return createEmbedFromData(interaction, embedData);
}