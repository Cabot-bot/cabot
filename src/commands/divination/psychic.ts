import { ChatInputCommandInteraction, ApplicationCommandOptionType } from "discord.js";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";
import { createEmbedFromData } from "@/utils/Embed";
import { t } from "i18next";
import { detectLocale } from "@/utils/Language";

export default class Psychic extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "psychic",
            description: "Cabot's psychic number training",
            options: [{
                name: "guess",
                description: "enter your guess 1-10!",
                type: ApplicationCommandOptionType.Integer,
                maxValue: 10,
                minValue: 1,
                required: true
            }],
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);

        const random = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * 10) + 1;
        const userGuess = interaction.options.getInteger("guess");
        const correctProbablility = 0.4;
  
        const isCorrect = userGuess === random || TechnoRandomizer.RandomNumber(0, 1, true) < correctProbablility;

        const fieldKey = isCorrect ? "correct" : "incorrect";
        const footerKey = isCorrect ? "correct" : "incorrect";

        const embedData = t("command:psychic.embed", { lng: lang, returnObjects: true, userGuess, random, fieldKey, footerKey  }) as Record<string, any>;
        const embed = createEmbedFromData(interaction, {
            title: embedData.title,
            fields: [
                {
                    name: embedData.fields[fieldKey].name,
                    value: embedData.fields[fieldKey].value
                }
            ],
            footer: {
                text: embedData.footer[footerKey].text,
                iconURL: embedData.footer[footerKey].iconURL
            }
        });

        await interaction.reply({
            embeds: [embed]
        });
    }
}