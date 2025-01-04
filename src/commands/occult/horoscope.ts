import { EmbedBuilder, ChatInputCommandInteraction, ApplicationCommandOptionType } from "discord.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import axios from "axios";
import { load } from "cheerio";
import path from "path";

import Command from "@/handlers/commands/Command";

const DATA_FILE_PATH = path.join(__dirname, "../../../data/Occult/horoscope_data.json");

const zodiacPairs: Record<string, number> = {
    aries: 1,
    taurus: 2,
    gemini: 3,
    cancer: 4,
    leo: 5,
    virgo: 6,
    libra: 7,
    scorpio: 8,
    sagittarius: 9,
    capricorn: 10,
    aquarius: 11,
    pisces: 12,
};

type HoroscopeSource = "horoscopecom" | "astrologycom" | "all";

export default class Horoscope extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "horoscope",
            description: "Get your astrological horoscope reading",
            options: [
                {
                    name: "zodiac",
                    description: "Specify what zodiac you want horoscope for",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: Object.keys(zodiacPairs).map((sign) => ({
                        name: sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase(),
                        value: sign,
                    })),
                },
                {
                    name: "source",
                    description: "Specify the source",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: "Horoscope.com", value: "horoscopecom" },
                        { name: "Astrology.com", value: "astrologycom" },
                        { name: "All", value: "all" },
                    ],
                },
            ]
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const zodiac = interaction.options.getString("zodiac") as string;
        const source = interaction.options.getString("source") as HoroscopeSource;

        const horoscope = await getHoroscope(zodiac, source);

        const embed = new EmbedBuilder()
            .setColor("#EEB8B6")
            .setTitle(`${zodiac.toUpperCase()} Horoscope - ${new Date().toLocaleDateString()}`)
            .setDescription(
                horoscope ?.text
                    ? horoscope.text 
                    : "No horoscope data found for today. Please check back later!"
            )
            .setFooter({
                text: `source: ${source}\n✨ "The stars guide you, but you chart your course."\nCheck back daily for your next astrological horoscope!`,
            })
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
}

async function getHoroscope(
    sign: string,
    source: HoroscopeSource
): Promise<{ source: string; text: string } | null> {
    try {
        const todayDate = new Date().toISOString().split("T")[0];
        const storedData = existsSync(DATA_FILE_PATH)
            ? JSON.parse(readFileSync(DATA_FILE_PATH, "utf-8"))
            : { allData: {} };

        cleanupOldData(storedData);

        if (
            storedData.allData[todayDate] &&
            storedData.allData[todayDate][sign] &&
            storedData.allData[todayDate][sign].source === source
        ) {
            return storedData.allData[todayDate][sign];
        }

        const horoscopeUrls = {
            horoscopecom: `https://www.horoscope.com/us/horoscopes/general/horoscope-general-daily-today.aspx?sign=${zodiacPairs[sign]}`,
            astrologycom: `https://www.astrology.com/horoscope/daily/${sign}.html`,
        };

        const horoscopeData = await fetchHoroscopeData(horoscopeUrls, source);

        storedData.allData[todayDate] = storedData.allData[todayDate] || {};
        storedData.allData[todayDate][sign] = horoscopeData;
        writeFileSync(DATA_FILE_PATH, JSON.stringify(storedData, null, 2));

        return horoscopeData;
    } catch (error) {
        console.error("Error fetching horoscope:", error);
        return null;
    }
}

async function fetchHoroscopeData(
    urls: Record<string, string>,
    source: HoroscopeSource
): Promise<{ source: string; text: string }> {
    const [horoscopecomData, astrologycomData] = await Promise.all([
        source !== "astrologycom"
            ? scrapeWebsite(urls.horoscopecom, ".main-horoscope > p")
            : null,
        source !== "horoscopecom"
            ? scrapeWebsite(urls.astrologycom, "#content")
            : null,
    ]);

    const text =
        source === "all"
            ? `**Astrology.com**\n${astrologycomData?.text || "_No data available._"}\n\n**Horoscope.com**\n${horoscopecomData?.text || "_No data available._"}`
            : source === "horoscopecom"
            ? horoscopecomData?.text || "_No horoscope data found._"
            : astrologycomData?.text || "_No horoscope data found._";

    return { source, text };
}

async function scrapeWebsite(
    url: string,
    selector: string
): Promise<{ source: string; text: string }> {
    const response = await axios.get(url);
    const $ = load(response.data);

    const rawText = $(selector)
        .filter((_, element) => {
            const $element = $(element);
            return (
                !$element.hasClass("show-small") &&
                !$element.hasClass("hide-small") &&
                !$element.find('a[rel="sponsored"]').length
            );
        })
        .text();

    const cleanText = rawText
        .replace(/\s+/g, " ")
        .trim();

    return { 
        source: url.includes("horoscope.com") ? "Horoscope.com" : "Astrology.com", 
        text: cleanText
    };
}

function cleanupOldData(storedData: { allData: Record<string, any> }) {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0];

    Object.keys(storedData.allData).forEach((date) => {
        if (date !== today && date !== yesterday) {
            delete storedData.allData[date];
        }
    });
}