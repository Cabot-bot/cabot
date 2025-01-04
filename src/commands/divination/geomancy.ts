import { ChatInputCommandInteraction, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";

import { t } from "i18next";
import { detectLocale } from "@/utils/Language";
import { createEmbedFromData } from "@/utils/Embed";

interface GeomancyCard {
    Name: string;
    EnglishName: string;
    Planet: string;
    ZodiacSign: string;
    Portent: string;
    Element: string;
    Image: string;
    Gender: string;
    Meaning: string;
    AdditionalInfo: string;
}[];

export default class Geomancy extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "geomancy",
            description: "Cabot gives you a geomancy card reading",
            options: []
        },
        [
            
        ]);
    }

    static getRandomGeomancy(geoData: GeomancyCard[], pullCount: number = 1): GeomancyCard[] {
        const geomancys: GeomancyCard[] = [];

        while (geomancys.length < pullCount && geoData.length > 0) {
            const randomIndex = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * geoData.length);
            
            geomancys.push(geoData[randomIndex]);
        }

        return geomancys;
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);

        const geoData = t("data:divination/geomancy", { lng: lang, returnObjects: true }) as GeomancyCard[];
        const [randomGeomancy] = Geomancy.getRandomGeomancy(geoData, 1);

        const { Name, EnglishName, Planet, ZodiacSign, Portent, Element, Gender, Meaning, AdditionalInfo, Image } = randomGeomancy;

        const image = new AttachmentBuilder(`${Image}`, { name: 'image.png' });

        const embedData = t("command:geomancy.embed", { lng: lang, returnObjects: true, Name, EnglishName, Planet, ZodiacSign, Portent, Element, Gender, Meaning, AdditionalInfo }) as Record<string, any>;
        const embed = createEmbedFromData(interaction, embedData);
        embed.setImage('attachment://image.png');

        const aboutGeomancy = new ButtonBuilder()
        .setCustomId("about-geomancy")
        .setLabel("Learn Geomancy")
        .setStyle(ButtonStyle.Secondary);

        const aboutGeomancyActionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(aboutGeomancy);

        await interaction.reply({
            embeds: [embed],
            components: [aboutGeomancyActionRow],
            files: [image]
        });
    }
}