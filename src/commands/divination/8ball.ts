import { ChatInputCommandInteraction, ApplicationCommandOptionType } from "discord.js";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";
import { t } from "i18next";
import { detectLocale } from "@/utils/Language";
import { createEmbedFromData } from "@/utils/Embed";

export default class EightBall extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "8ball",
            description: "Cabot's magical 8-Ball answers your question",
            options: [{
                name: "question",
                description: "enter your question",
                type: ApplicationCommandOptionType.String
            }],
        },
        [

        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        let lang = await detectLocale(interaction);

        const question = interaction.options.getString('question') || t("command:8ball.!question", { lng: lang });
        const avatarUrl = interaction.client.user?.avatarURL() || "";

        const answers = t("command:8ball.answers", { lng: lang, returnObjects: true}) as string[];
        const playfulResponses = t("command:8ball.playfulResponses", { lng: lang, returnObjects: true }) as string[];

        const answer = TechnoRandomizer.randomStringFromList(answers);
        const footer = TechnoRandomizer.randomStringFromList(playfulResponses);

        const embedData = t("command:8ball.embed", { lng: lang, returnObjects: true, question, answer, footer, avatarUrl }) as Record<string, any>;
        const embed = createEmbedFromData(interaction, embedData)

        await interaction.reply({
            embeds: [embed]
        });
    }
}