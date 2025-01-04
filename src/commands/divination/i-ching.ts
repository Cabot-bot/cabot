import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from "discord.js";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";

//import IChingData from '@data/Divination/iching.json';

import { t } from "i18next";
import { createEmbedFromData } from "@/utils/Embed";
import { detectLocale } from "@/utils/Language";

interface Iching {
    name: { zh: string, en: string };
    symbol: string;
    number: number;
    pattern: number;
    judgment: string;
    lines: string[];
    image?: string;
    img: string;
}

function getRandomIChing(count: number = 1, lang: any): Iching[] {
    const IChingData = t("data:divination/iching", { lng: lang, returnObjects: true }) as Iching[];

    const selectedHexagrams: Iching[] = [];
    count = Math.max(1, Math.min(count, 5));

    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * IChingData.length);
        const hexagram = IChingData[randomIndex];
        selectedHexagrams.push(hexagram);
    }

    return selectedHexagrams;
}

export default class IChing extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "i-ching",
            description: "Cabots indepth i-ching reading",
            options: []
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);
        const [hexagram] = getRandomIChing(1, lang);

        const embedData = t("command:iching.embed", { 
            lng: lang, returnObjects: true, 
            hexagram: {
                name: {
                    en: hexagram.name.en,
                    zh: hexagram.name.zh
                },
                symbol: hexagram.symbol,
                number: hexagram.number.toString(),
                pattern: hexagram.pattern.toString(),
                judgment: hexagram.judgment,
                image: hexagram.image,
                lines: hexagram.lines.join("\n")
            }
        }) as Record<string, any>;
        const embed = createEmbedFromData(interaction, embedData);

        const files: AttachmentBuilder[] = [];
        const imageAttchment = new AttachmentBuilder(hexagram.img, { name: "hexagram.jpg" });
        files.push(imageAttchment);

        embed.setImage("attachment://hexagram.jpg");

        const aboutIching = new ButtonBuilder()
        .setCustomId("about-iching")
        .setLabel("Learn I-Ching")
        .setStyle(ButtonStyle.Secondary);

        const aboutIchingActionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(aboutIching);
        
        await interaction.reply({ 
            embeds: [embed], 
            components: [aboutIchingActionRow],
            files 
        });
    }
}