import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from "discord.js";

import Command from "@/handlers/commands/Command";
import { getMoonInformations } from "@/utils/Moon";
import { t } from "i18next";
import { createEmbedFromData } from "@/utils/Embed";
import { detectLocale } from "@/utils/Language";

export default class Moon extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "moon",
            description: "Get the moons phase, correspondence, and more",
            options: []
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);
        const avatarUrl = interaction.client.user?.avatarURL() || "";

        const DATE = new Date();
        const moonData = getMoonInformations(DATE);

        const { phase, emoji, date, ecliptic, trajectory, age, distance, constellation, description, percentage } = moonData;

        const embedData = t("command:moon.embed", { lng: lang, returnObjects: true, phase, emoji, date, ecliptic, trajectory, age, distance, constellation, description, percentage, avatarUrl }) as Record<string, any>;
        const embed  = createEmbedFromData(interaction, embedData);

        const aboutMoonMagic = new ButtonBuilder()
        .setCustomId("about-moonmagic")
        .setLabel("Learn Lunar Magic")
        .setStyle(ButtonStyle.Secondary);

        const aboutMoonMagicActionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(aboutMoonMagic);
    
        interaction.reply({ 
            embeds: [embed],
            components: [aboutMoonMagicActionRow]
         });
    }
}