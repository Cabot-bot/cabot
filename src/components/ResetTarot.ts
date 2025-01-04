import { ButtonInteraction } from "discord.js";
import Component from "@/handlers/components/Component";
import { resetTarotSettings } from "@/database/schema";

// noinspection JSUnusedGlobalSymbols
export default class ExampleButton extends Component {
    constructor() {
        super("resetTarot");
    }

    async execute(interaction: ButtonInteraction): Promise<void> {
        const userId = interaction.user.id;
        await resetTarotSettings(userId);

        await interaction.reply({
            content: `Your tarot settings have been reset.`,
            ephemeral: true,
        });
    }
}