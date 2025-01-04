import { ChatInputCommandInteraction, ApplicationCommandOptionType } from "discord.js";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";
import { createEmbedFromData } from "@/utils/Embed";
import { t } from "i18next";
import { detectLocale } from "@/utils/Language";

export default class Roll extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "roll",
            description: "Cabot rolls a die",
            options: [
                {
                    name: "limit",
                    description: "set die number limit",
                    required: false,
                    type: ApplicationCommandOptionType.Integer,
                    maxValue: 500
                }
            ]
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);
        const limit = interaction.options.getInteger('limit') || 6;
        const result = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * limit + 1);

        const embedData = t("command:roll.embed", { lng: lang, returnObjects: true, result, limit }) as Record<string, any>;
        const embed = createEmbedFromData(interaction, embedData);
    
        await interaction.reply({ embeds: [embed] });
    }
}