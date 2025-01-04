import { ButtonInteraction } from "discord.js";

import Component from "@/handlers/components/Component";
import { detectLocale } from "@/utils/Language";
import { t } from "i18next";
import { createEmbedFromData } from "@/utils/Embed";

// noinspection JSUnusedGlobalSymbols
export default class AboutSigilButton extends Component {
    constructor() {
        super("about-sigils");
    }

    async execute(interaction: ButtonInteraction): Promise<void> {
        const avatarUrl = interaction.client.user?.avatarURL() || "";
        const lang = await detectLocale(interaction);

        const embedData = t("data:CabotLearnSystem.Sigil.embed", { lng: lang, returnObjects: true, avatarUrl }) as Record<string, any>;
        const embed = createEmbedFromData(interaction, embedData);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}