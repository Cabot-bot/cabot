import { ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

import Command from "@/handlers/commands/Command";
import { detectLocale } from "@/utils/Language";
import { t } from "i18next";
import { createEmbedFromData } from "@/utils/Embed";

export default class Bibliomancy extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "bibliomancy",
            description: "Cabot returns a random religious text script",
            options: []
        },
        [
            
        ]);
    }

    private async fetchVerse(): Promise<{ reference: string, text: string, translation_name: string } | null> {
        try {
            const response = await fetch('https://bible-api.com/?random=verse');
            if (!response.ok) {
                console.error(`Error fetching verse: ${response.statusText}`);
                return null;
            }
            return response.json();
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Fetch error: ${error.message}`);
            } else {
                console.error(`Unknown Error: ${error}`)
            }
            return null;
        }
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        let lang = await detectLocale(interaction);

        const verseData = await this.fetchVerse();
        if (!verseData) {
            await interaction.reply({
                content: t("command:bibliomancy.!verseData", { lng: lang }),
                ephemeral: true
            });
            return;
        }
        const { reference, text, translation_name } = verseData;

        const aboutBibliomancy = new ButtonBuilder()
            .setCustomId("about-bibliomancy")
            .setLabel("Learn Bibliomancy")
            .setStyle(ButtonStyle.Secondary);

        const aboutBibliomancyActionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(aboutBibliomancy);

        const embedData = t("command:bibliomancy.embed", { 
            lng: lang, 
            returnObjects: true, 
            reference: reference, 
            text: text, 
            translation_name: translation_name 
        }) as Record<string, any>;

        const embed = createEmbedFromData(interaction, embedData);

        await interaction.reply({
            embeds: [embed],
            components: [aboutBibliomancyActionRow]
        });
    }
}