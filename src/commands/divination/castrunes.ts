import { EmbedBuilder, ChatInputCommandInteraction, ApplicationCommandOptionType } from "discord.js";

import { TechnoRandomizer } from "@/utils/TechnoRandomizer";
import Command from "@/handlers/commands/Command";

import runesEmoji from "@data/Divination/emojiRunes.json";

import futharkData from "@data/Divination/runes.json";
import oghamData from "@data/Divination/runesOgham.json";
import witchesData from "@data/Divination/runeWitches.json";

interface Rune {
    name: string;
    meaning: string;
    phonetic?: string | null;
    magick?: string;
    type: any;
}

export default class CastRunes extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "castrunes",
            description: "Cabot returns a dynamic rune casting grid",
            options: [
                {
                    name: "pull-count",
                    description: "How many runes do you want pulled?",
                    required: false,
                    type: ApplicationCommandOptionType.Number,
                    max_value: 8,
                    min_value: 1
                },
                {
                    name: "type",
                    description: "Rune type: Mixed, Futhark, Ogham, Witches",
                    required: false,
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: `Mixed`, value: `type_mixed` },
                        { name: `Futhark`, value: `type_futhark` },
                        { name: `Ogham`, value: `type_ogham` },
                        { name: `Witches`, value: `type_witches` }
                    ]
                }
            ]
        },
        [
            
        ]);
    }

    private static getActiveDeck(type: string) {
        switch(type) {
            case "type_mixed": return [...futharkData, ...oghamData, ...witchesData];
            case "type_futhark": return futharkData;
            case "type_ogham": return oghamData;
            case "type_witches": return witchesData;
            default: return futharkData;

        }
    }

    static itemPull(pullCount: number, deck: any[], type: string): Rune[] {
        const selectedRunes: Rune[] = [];
        const deckKeys = deck.map((_, index) => index);
    
        while (selectedRunes.length < pullCount) {
            const randomIndex = TechnoRandomizer.RandomNumber(0, deckKeys.length, true);
            const runeData = deck[deckKeys.splice(randomIndex, 1)[0]];
            
            let runeType;
            if(futharkData.includes(runeData)) {runeType = "Futhark";} else if (oghamData.includes(runeData)) {runeType = "Ogham";} else if (witchesData.includes(runeData)) {runeType = "Witches";}
    
            selectedRunes.push({
                name: runeData.rune_title,
                meaning: runeData.meaning,
                phonetic: runeData.phonetic || null,
                magick: runeData.magick || undefined,
                type: type === "type_mixed" ? runeType : type.replace("type_", "").charAt(0).toUpperCase() + type.slice(6)
            });
        }
    
        return selectedRunes;
    }

    static getEmoji(runeName: string): string {
        const emojis = runesEmoji as { [key: string]: string };
        return emojis[runeName] || ":white_large_square:";
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const pullCount = interaction.options.getNumber('pull-count') || 4;
        const runeType = interaction.options.getString("type") || "type_futhark";
    
        const deck = CastRunes.getActiveDeck(runeType);
        const runes = CastRunes.itemPull(pullCount, deck, runeType);
    
        const runeGrid = Array.from({ length: 13 }, () => Array(13).fill("⬛"));
        const embedFields = runes.map(rune => {
            return `__**${CastRunes.getEmoji(rune.name)} ${rune.name} (${rune.type})**__  ${rune.phonetic ? ` | ${rune.phonetic}` : ''}\n**Meaning:** ${rune.meaning}${rune.magick ? `\n**Magic:** ${rune.magick}` : ''}`;
        });
    
        runes.forEach(rune => {
            let rCoord, cCoord;
            do {
                rCoord = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * 13);
                cCoord = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * 13);
            } while (runeGrid[rCoord][cCoord] !== "⬛")
            
            runeGrid[rCoord][cCoord] = CastRunes.getEmoji(rune.name);
        });
    
        const runeGridStrings = runeGrid.map(row => row.join("")).join("\n");
        const avatarURL = interaction.client.user?.avatarURL() || "";
    
        const embed = new EmbedBuilder()
            .setColor("#EEB8B6")
            .setTitle("ᛟ __Cabot's Rune Casting Grid__ ᛟ")
            .setDescription(`${runeGridStrings}\n\n${embedFields.join("\n\n")}`)
            .setFooter({
                text: `Pull Count: ${pullCount} | Type: ${runeType.replace("type_", "").charAt(0).toUpperCase() + runeType.slice(6)}\nUse '/rune search' for in-depth rune data!\nᚲᚨᛒᛟᛏᛊ ᚱᚢᚾᛖ ᚲᚨᛊᛏᛁᛜ ᚷᚱᛁᛞ`,
                iconURL: avatarURL
            });
    
        await interaction.reply({
            embeds: [embed]
        });
    }
}