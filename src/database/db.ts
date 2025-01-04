import mysql from "mysql2";
import Logger from "@/utils/logger";

const db = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: '',
});

const DEFAULT_TAROT_SETTINGS = JSON.stringify({
    reversals: true, // If card reversals are enabled
    selectedDeckId: "", // Base deck to always pull from
    reversalFrequency: 3, // How often reversals show up
    showKeywords: true, // If keywords are shown
    showDescription: true, // If descriptions are shown
    embedded: true, // If cards are embedded
    bannedDecks: [], // Banned decks
});

export function initializeDb() {
    db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            username VARCHAR(255),
            usage_count INT DEFAULT 0 NOT NULL,
            tarot_settings TEXT DEFAULT '${DEFAULT_TAROT_SETTINGS}'
        )
    `, (err) => {
        if (err) {
            Logger.error("Error initializing database: " + err.message);
        } else {
            Logger.info("Database initialized and tables created successfully.");
        }
    });
}

/**
 * Upserts a user into the database.
 * @param {string} id The ID of the user to upsert.
 * @param {string} username The username of the user to upsert.
 */
export function upsertUser(id: string, username: string) {
    const stmt = `
        INSERT INTO users (id, username, usage_count, tarot_settings) 
        VALUES (?, ?, 0, ?)
        ON DUPLICATE KEY UPDATE username = VALUES(username)
    `;
    
    db.execute(stmt, [id, username, DEFAULT_TAROT_SETTINGS], (err, results) => {
        if (err) {
            Logger.error("Error upserting user: " + err.message);
        } else {
            Logger.info(`User ${username} added/updated successfully.`);
        }
    });
}

/**
 * Updates a user's tarot settings in the database.
 * @param {string} userId The ID of the user to update.
 * @param {object} settings The settings to update.
 */
export function updateTarotSettings(userId: string, settings: object) {
    const newSettings = JSON.stringify(settings);
    const stmt = `UPDATE users SET tarot_settings = ? WHERE id = ?`;

    db.execute(stmt, [newSettings, userId], (err, results) => {
        if (err) {
            Logger.error("Error updating tarot settings: " + err.message);
        } else {
            Logger.info(`Tarot settings updated for user ID: ${userId}`);
        }
    });
}

export { db };