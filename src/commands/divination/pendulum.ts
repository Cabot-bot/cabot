import { ChatInputCommandInteraction, ApplicationCommandOptionType } from "discord.js";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";
import { t } from "i18next";
import { createEmbedFromData } from "@/utils/Embed";
import { detectLocale } from "@/utils/Language";

export default class Pendulum extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "pendulum",
            description: "Cabots pendulum reading",
            options: [
                {
                    name: `question`,
                    description: `enter a yes or no question`,
                    required: false,
                    type: ApplicationCommandOptionType.String,
                }
            ]
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);
        const question = interaction.options.getString('question') || t("command:pendulum.!question", { lng: lang });

        const outcomes = t("command:pendulum.outcomes", { lng: lang, returnObjects: true } ) as string[];
        const selectedOutcome = TechnoRandomizer.randomStringFromList(outcomes);

        const footers = t("command:pendulum.footers", { lng: lang, returnObjects: true } ) as string[];
        const footer = TechnoRandomizer.randomStringFromList(footers);

        const embedData = t("command:pendulum.embed", { lng: lang, returnObjects: true, question, answer: selectedOutcome, footer }) as Record<string, any>;
        const embed = createEmbedFromData(interaction, embedData);
    
        await interaction.reply({ embeds: [embed] });
    }
}