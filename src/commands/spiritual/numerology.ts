import { ChatInputCommandInteraction, ApplicationCommandOptionType } from "discord.js";

import Command from "@/handlers/commands/Command";
import { t } from "i18next";
import { createEmbedFromData } from "@/utils/Embed";
import { detectLocale } from "@/utils/Language";

interface AngelNumberData {
    numbers: Record<string, 
    { 
        id: string; 
        meaning: string; 
        image: string;
        keywords: string[];
        affirmation: string;
        colors: string[];
        crystals:string[];
        astrology: { planet: string, zodiac: string };
        numerology: { Chinese: string, Pythagorean: string };
        tarot:string[];
        angels: string[];
        actions: string[];
    }>;
}

interface MeaningData {
    general: Record<string, string>;
    destiny: Record<string, string>;
    personality: Record<string, string>;
    attitude: Record<string, string>;
    character: Record<string, string>;
    soul: Record<string, string>;
    agenda: Record<string, string>;
    purpose: Record<string, string>;
}

export default class Numerology extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "numerology",
            description: "Search and get your personal numerology numbers",
            options: [
                {
                    name: "search",
                    description: "Search a specific angel number",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "number",
                            description: "Enter the angel number you want to search",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: Array.from({ length: 10 }, (_, i) => ({
                                name: String(i * 111),
                                value: String(i * 111),
                            })),
                        },
                    ],
                },
                {
                    name: "calculate",
                    description: "Calculate your personal angel number + more",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "name",
                            description: "Enter your full name (all inputs are private)",
                            required: true,
                            type: ApplicationCommandOptionType.String,
                        },
                        {
                            name: "date",
                            description: "Enter your birthday (MM/DD/YY) all inputs are private!",
                            required: true,
                            type: ApplicationCommandOptionType.String,
                        },
                    ],
                },
            ],
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);
        const avatarUrl = interaction.client.user?.avatarURL() || "";

        const meaningDataPath = t("data:spiritual/meaning", { lng: lang, returnObjects: true }) as MeaningData;
        const angelDataPath = t("data:spiritual/angelnumber", { lng: lang, returnObjects: true }) as AngelNumberData;

        const angelNumberData: AngelNumberData = angelDataPath;
        const meaningData: MeaningData = meaningDataPath;

        const subcommand = interaction.options.getSubcommand();

        const handleNumber = (number: string) => {
            const angelNumber = angelNumberData.numbers[number];
            if (angelNumber) {
                const { id, meaning, image, keywords, affirmation, colors, crystals, astrology, numerology, tarot, angels, actions } = angelNumber;

                const embedData = t("command:numerology.embed", { lng: lang, returnObjects: true, id, image, meaning, keywords, affirmation, colors, crystals, astrology, numerology, tarot, angels, actions }) as Record<string, any>;
                const embed  = createEmbedFromData(interaction, embedData);

                interaction.reply({ embeds: [embed] });
            } else {
                interaction.reply(t("command:numerology.!angelNumber", { lng: lang, number }));
            }
        };

        if (subcommand === "search") {
            const number = interaction.options.getString("number")!;
            handleNumber(number);
        } else if (subcommand === "calculate") {
            const name = interaction.options.getString("name")!;
            const birthdate = interaction.options.getString("date")!;

            const letterToNumber: Record<string, number> = {
                A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
                J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
                S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
            };

            const letterCategory: Record<string, number> = {
                A: 0, B: 1, C: 1, D: 1, E: 0, F: 1, G: 1, H: 1, I: 0,
                J: 1, K: 1, L: 1, M: 1, N: 1, O: 0, P: 1, Q: 1, R: 1,
                S: 1, T: 1, U: 0, V: 1, W: 1, X: 1, Y: 0, Z: 1,
            };

            const nameUpper = name.toUpperCase();
            const num: number[] = [];
            const numV: number[] = [];
            const numC: number[] = [];

            let prevLetterCat: number | null = null;

            for (const letter of nameUpper) {
                const letterValue = letterToNumber[letter] || 0;
                const cv = letterCategory[letter];
                num.push(letterValue);

                if (cv === 1) {
                    numC.push(letterValue);
                } else if (cv === 0) {
                    if (letter === "Y") {
                        if (prevLetterCat === 1) {
                            numV.push(letterValue);
                        } else {
                            numC.push(letterValue);
                        }
                    } else {
                        numV.push(letterValue);
                    }
                }
                prevLetterCat = cv;
            }

            const sumOfNumbers = num.reduce((total, current) => total + current, 0).toString();
            const firstSum = +sumOfNumbers.charAt(0) + +sumOfNumbers.charAt(1);
            
            const firstSoulSum = numV.reduce((total, current) => total + current, 0).toString();
            const finalSoulSum = +firstSoulSum.charAt(0) + +firstSoulSum.charAt(1);

            const firstAgendaSum = numC.reduce((total, current) => total + current, 0).toString();
            const finalAgendaSum = +firstAgendaSum.charAt(0) + +firstAgendaSum.charAt(1);

            const [month, day, year] = birthdate.split("/").map(Number);

            // Destiny Number Calculation
            const destinyNumberString = (month + day + year).toString();
            const destinyFinalNumber = (
                +destinyNumberString.charAt(0) + 
                +destinyNumberString.charAt(1) +
                +destinyNumberString.charAt(2) + 
                +destinyNumberString.charAt(3) +
                +destinyNumberString.charAt(4) + 
                +destinyNumberString.charAt(5) +
                +destinyNumberString.charAt(6) + 
                +destinyNumberString.charAt(7)
            ).toString();

            const destinyFinal = +destinyFinalNumber.charAt(0) + +destinyFinalNumber.charAt(1);

            // Personality Number Calculation
            const personalityNumber = (+day).toString();
            const persFinalNumber = (
                +personalityNumber.charAt(0) + 
                +personalityNumber.charAt(1)
            ).toString();

            // Attitude Number Calculation
            const attitudeNumber = (month + day).toString();
            const attentionFinalNumber = (
                +attitudeNumber.charAt(0) + 
                +attitudeNumber.charAt(1)
            ).toString();

            const divineFinalNumber = destinyFinal + firstSum;

            const embedData = t("command:numerology.calculateEmbed", { lng: lang, returnObjects: true, destinyFinal, general: meaningData.general[destinyFinal], destiny: meaningData.destiny[destinyFinal], personality: meaningData.personality[persFinalNumber], attitude: meaningData.attitude[attentionFinalNumber], character: meaningData.character[firstSum], soul: meaningData.soul[finalSoulSum], agenda: meaningData.agenda[finalAgendaSum], purpose: meaningData.purpose[divineFinalNumber], meaningData, persFinalNumber, attentionFinalNumber, firstSum, finalSoulSum, finalAgendaSum, divineFinalNumber, avatarUrl }) as Record<string, any>;
            const embed  = createEmbedFromData(interaction, embedData);

            await interaction.reply({ embeds: [embed] });
        }
    }
}