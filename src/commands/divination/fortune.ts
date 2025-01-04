import { ChatInputCommandInteraction } from "discord.js";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";
import { t } from "i18next";
import { detectLocale } from "@/utils/Language";
import { createEmbedFromData } from "@/utils/Embed";

export default class Fortune extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "fortune",
            description: "Cabot gives you a fortune",
            options: []
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);

        const fortuneData = t("data:divination/fortunes", { lng: lang, returnObjects: true }) as string[];
        const randomFortune = TechnoRandomizer.randomStringFromList(fortuneData)

        const embedData = t("command:fortune.embed", { lng: lang, returnObjects: true, randomFortune: randomFortune }) as Record<string, any>;
        const embed = createEmbedFromData(interaction, embedData);
    
        await interaction.reply({
            embeds: [embed]
        });
    }
}