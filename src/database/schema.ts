import { db } from "./db"; // Ensure db is connected to MySQL
import Logger from "@/utils/logger";

const DEFAULT_TAROT_SETTINGS = JSON.stringify({
    reversals: true, // If card reversals are enabled
    selectedDeckId: "", // Base deck to always pull from
    reversalFrequency: 3, // How often reversals show up
    showKeywords: true, // If keywords are shown
    showDescription: true, // If descriptions are shown
    embedded: true, // If cards are embedded
    bannedDecks: [], // Banned decks
});

// Reset tarot settings to default for a user
export async function resetTarotSettings(userId: string): Promise<void> {
    try {
        const stmt = `UPDATE users SET tarot_settings = ? WHERE id = ?`;
        await db.promise().execute(stmt, [DEFAULT_TAROT_SETTINGS, userId]);
        Logger.info(`Tarot settings reset to default for user ID: ${userId}`);
    } catch (error) {
        Logger.error(`Failed to reset tarot settings for user ID: ${userId}\n${error}`);
        throw error;
    }
}

// Update tarot settings for a user
export async function updateTarotSettings(userId: string, settings: object): Promise<void> {
    try {
        const newSettings = JSON.stringify(settings);
        const stmt = `UPDATE users SET tarot_settings = ? WHERE id = ?`;
        await db.promise().execute(stmt, [newSettings, userId]);
        Logger.info(`Tarot settings updated for user ID: ${userId}`);
    } catch (error) {
        Logger.error(`Failed to update tarot settings for user ID: ${userId}\n${error}`);
        throw error;
    }
}