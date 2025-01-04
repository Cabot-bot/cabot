import { ActionRowBuilder, StringSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { updateTarotSettings, db } from "@/database/db";
import { correspondence } from "@/utils/Tarot";
import { RowDataPacket } from "mysql2";

import Component from "@/handlers/components/Component";

// noinspection JSUnusedGlobalSymbols
export default class TarotSettingsSelectMenu extends Component {
    constructor() {
        super("tarot-settings-menu");
    }

    private async getUserSettings(userId: string): Promise<{
        reversals: boolean;
        selectedDeckId: string;
        reversalFrequency: number;
        showKeywords: boolean;
        showDescription: boolean;
        embedded: boolean;
        bannedDecks: string[];
    }> {
        const defaultSettings = {
            reversals: true, // If card reversals are enabled
            selectedDeckId: "", // Base deck to always pull from
            reversalFrequency: 3, // How often reversals show up
            showKeywords: true, // If keywords are shown
            showDescription: true, // If descriptions are shown
            embedded: true, // If cards are embedded
            bannedDecks: [], // Banned decks
        };
    
        try {
            // Query for the user's tarot settings from the database
            const [rows] = await db.promise().query<RowDataPacket[]>(
                `SELECT tarot_settings FROM users WHERE id = ?`, [userId]
            );
    
            // If no rows are returned, return default settings
            if (rows.length === 0 || !rows[0].tarot_settings) {
                return defaultSettings;
            }
    
            // Parse the user's tarot settings if found
            const userSettingsRaw = rows[0].tarot_settings;
    
            try {
                const userSettings = JSON.parse(userSettingsRaw);
                return { ...defaultSettings, ...userSettings };
            } catch (error) {
                console.error(`Error parsing tarot settings for user ${userId}:`, error);
                return defaultSettings;
            }
        } catch (error) {
            console.error(`Error retrieving tarot settings for user ID: ${userId}:`, error);
            return defaultSettings;
        }
    }

    async execute(interaction: StringSelectMenuInteraction): Promise<void> {
        const { values } = interaction;
        const selectedOption = values[0];
        const userId = interaction.user.id;
        const userSettings = await this.getUserSettings(userId);

        switch (selectedOption) {
            case "basedeck":
                const deckOptions = this.getDeckOptions();
                const baseDeckMenu = new StringSelectMenuBuilder()
                    .setCustomId("selectBaseDeck")
                    .setPlaceholder("Choose a base deck")
                    .addOptions(deckOptions);

                await interaction.reply({
                    content: "Please select your base deck.",
                    components: [new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(baseDeckMenu)],
                    ephemeral: true,
                });
                break;

            case "reversalfrequency":
                const frequencyOptions = Array.from({ length: 5 }, (_, i) => ({
                    label: `Frequency ${i + 1}`,
                    value: (i + 1).toString(),
                }));

                const reversalFrequencyMenu = new StringSelectMenuBuilder()
                    .setCustomId("selectReversalFrequency")
                    .setPlaceholder("Select reversal frequency")
                    .addOptions(frequencyOptions);

                await interaction.reply({
                    content: "Please select a reversal frequency.",
                    components: [new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(reversalFrequencyMenu)],
                    ephemeral: true,
                });
                break;

            case "bannedDecks":
                const bannedDeckOptions = this.getDeckOptions(userSettings.bannedDecks);

                const bannedDeckMenu = new StringSelectMenuBuilder()
                    .setCustomId("manageBannedDecks")
                    .setPlaceholder("Select decks to ban/unban")
                    .setMinValues(1)
                    .setMaxValues(bannedDeckOptions.length)
                    .addOptions(bannedDeckOptions);

                await interaction.reply({
                    content: "Select decks to add/remove from banned list.",
                    components: [new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(bannedDeckMenu)],
                    ephemeral: true,
                });
                break;

            case "reversals":
            case "showKeywords":
            case "showDescription":
            case "embedded":
                userSettings[selectedOption] = !userSettings[selectedOption];
                await updateTarotSettings(userId, userSettings);
                await interaction.reply({
                    content: `${selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)} is now ${
                        userSettings[selectedOption] ? "enabled" : "disabled"
                    }.`,
                    ephemeral: true,
                });
                break;

            default:
                await interaction.reply({ content: "Invalid option selected.", ephemeral: true });
                break;
        }
    }

    private getDeckOptions(bannedDecks: string[] = []): StringSelectMenuOptionBuilder[] {
        const deckNames = correspondence.map((deck) => deck.name);
        return deckNames.map((deck) => 
            new StringSelectMenuOptionBuilder()
                .setLabel(deck)
                .setValue(deck)
                .setDefault(bannedDecks.includes(deck))
        );
    }
}