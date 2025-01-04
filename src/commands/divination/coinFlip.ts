import { ChatInputCommandInteraction } from "discord.js";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";
import { detectLocale } from "@/utils/Language";
import { createEmbedFromData } from "@/utils/Embed";
import { t } from "i18next";

export default class CoinFlip extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "coin",
            description: "Cabot flips a magical coin",
            options: []
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);

        const headsAsset = t("command:coinFlip.headsAsset", { lng: lang, returnObjects: true }) as Record<string, any>;
        const tailsAsset = t("command:coinFlip.tailsAsset", { lng: lang, returnObjects: true }) as Record<string, any>;

        const isHeads = TechnoRandomizer.RandomNumber(0, 1, true) < 0.5;
        const { result, thumb, emoji } = isHeads ? headsAsset : tailsAsset;
  
        const embedData = t("command:coinFlip.embed", { lng: lang, returnObjects: true, result: result, thumb: thumb, emoji: emoji }) as Record<string, any>;
        const embed = createEmbedFromData(interaction, embedData);

          await interaction.reply({
            embeds: [embed]
        });
    }
}