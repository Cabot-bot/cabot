import { StringSelectMenuInteraction } from "discord.js";
import { updateTarotSettings, db } from "@/database/db";
import { RowDataPacket } from "mysql2";

import Component from "@/handlers/components/Component";

// noinspection JSUnusedGlobalSymbols
export default class TarotSelectBaseDeck extends Component {
    constructor() {
        super("selectBaseDeck");
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
        const userId = interaction.user.id;
        const userSettings = await this.getUserSettings(userId);

        const selectedDeck = interaction.values[0];
        userSettings.selectedDeckId = selectedDeck;

        updateTarotSettings(userId, userSettings);

        await interaction.reply({
            content: `Base deck set to ${selectedDeck}.`,
            ephemeral: true,
        });
    }
}