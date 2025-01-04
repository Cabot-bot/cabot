import { ChatInputCommandInteraction, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType, AutocompleteInteraction, StringSelectMenuBuilder, type APIEmbedField } from "discord.js";

import Command from "@/handlers/commands/Command";

import { drawRandomTarotCards } from "@/utils/Tarot";
import { db } from "@/database/db";
import Logger from "@/utils/logger";
import { detectLocale } from "@/utils/Language";
import { t } from "i18next";
import { createEmbedFromData } from "@/utils/Embed";
import { createSelectMenuFromData } from "@/utils/SelectMenu";
import { createButtonFromData } from "@/utils/Button";

const drawnCardsMap = new Map<string, string[]>();

interface ButtonData {
    id: string;
    label: string;
    style: string;
}

interface SelectMenuData {
    id: string;
    placeholder: string;
    options: { label: string; description: string; value: string }[];
}

export default class Tarot extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "tarot",
            description: "Cabot tarot pulls and settings",
            options: [
                {
                    name: "pull",
                    description: "pull tarot cards",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "amount",
                            description: "how many cards you want pulled",
                            required: false,
                            type: ApplicationCommandOptionType.Integer,
                            maxValue: 5,
                            minValue: 1,
                        },
                        {
                            name: "specific",
                            description: "pull from a specific deck",
                            required: false,
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true
                        }
                    ]
                },
                {
                    name: "settings",
                    description: "change and check your tarot pull settings",
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ]
        },
        [
            
        ]);
    }

    private async getUserSettings(userId: string): Promise<Record<string, any>> {
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
            const [rows] = await db.promise().query<any[]>(
                `SELECT tarot_settings FROM users WHERE id = ?`, [userId]
            );
    
            // If user settings are not found, insert default settings
            if (rows.length === 0) {
                const insertStmt = `
                    INSERT INTO users (id, username, tarot_settings) 
                    VALUES (?, ?, ?)
                `;
                await db.promise().execute(insertStmt, [userId, "username", JSON.stringify(defaultSettings)]);
                return defaultSettings;
            }
    
            const userSettingsRaw = rows[0] as { tarot_settings: string };
    
            try {
                // Parse and return tarot settings if found
                return JSON.parse(userSettingsRaw.tarot_settings || JSON.stringify(defaultSettings));
            } catch (error) {
                Logger.error(`Failed to parse tarot settings for user ID: ${userId}\n${error}`);
                return defaultSettings;
            }
        } catch (error) {
            Logger.error(`Error retrieving tarot settings for user ID: ${userId}\n${error}`);
            return defaultSettings;
        }
    }

    private async handleTarotReadingRequest(interaction: ChatInputCommandInteraction, userId: string, chosenDeck?: string, numCards: number = 1): Promise<void> {
        const lang = await detectLocale(interaction);
        try {
            const userSettings = await this.getUserSettings(userId);
            const { showKeywords, showDescription, embedded } = userSettings;

            const drawnCards = await drawRandomTarotCards(userId, lang, chosenDeck, numCards);
            const drawnCardNames: string[] = [];

            for (const [index, card] of drawnCards.entries()) {
                const imageAttachment = new AttachmentBuilder(card.imageUrl, { name: 'image.jpg' });
                const cardTitle = `__**<a:tarotcards:888583701280194581> ${card.name} - ${card.number} | ${card.reversed} <a:tarotcards:888583701280194581>**__`;
                const avatarUrl = interaction.client.user?.avatarURL() || "";

                if (embedded) {
                    const embedData = t("command:tarot.embed", { lng: lang, returnObjects: true, cardTitle, card, avatarUrl }) as Record<string, any>;
                    const embed  = createEmbedFromData(interaction, embedData);

                    if (showKeywords) embed.addFields(t("command:tarot.ifKeywords", { lng: lang, returnObjects: true, card}) as APIEmbedField[]);
                    if (showDescription) embed.setDescription(t("command:tarot.ifDescription", { lng: lang, card }));
                    embed.setImage(`attachment://image.jpg`);

                    if (index === 0) {
                        await interaction.reply({ embeds: [embed], files: [imageAttachment] });
                    } else {
                        await interaction.followUp({ embeds: [embed], files: [imageAttachment] });
                    }
                } else {
                    let tarotMessage = t("command:tarot.context.tarotMessage", { lng: lang, cardTitle, card });

                    if (showDescription) tarotMessage += t("command:tarot.context.showDescription", { lng: lang, card });
                    if (showKeywords) tarotMessage += t("command:tarot.context.showKeywords", { lng: lang, card });

                    if (index === 0) {
                        await interaction.reply({ content: tarotMessage, files: [imageAttachment] });
                    } else {
                        await interaction.followUp({ content: tarotMessage, files: [imageAttachment] });
                    }
                }

                drawnCardNames.push(card.name);
            }

            drawnCardsMap.set(userId, drawnCardNames);

        } catch (error) {
            Logger.error(`Failed to handle tarot reading request for user ID: ${userId}\n${error}`);
        }
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);
        const subcommand = interaction.options.getSubcommand();
        const UserID = interaction.user.id;

        if (subcommand === "pull") {
            const num = interaction.options.getInteger("amount") || 1;
            const chosenDeck = interaction.options.getString("specific") || undefined;

            await this.handleTarotReadingRequest(interaction, UserID, chosenDeck, num);
        } else if (subcommand === "settings") {
            const userSettings = await this.getUserSettings(UserID)
            const userIcon = interaction.user.avatarURL()?.toString();

            const selectMenuData = t("component:selectMenu.tarot-settings-menu", { lng: lang, returnObjects: true }) as SelectMenuData;
            const selectMenu = createSelectMenuFromData(selectMenuData);

            const buttonData = t("component:button.resetButton", { lng: lang, returnObjects: true }) as ButtonData;
            const resetButton = createButtonFromData(buttonData);
            
            const buttonActionRow = new ActionRowBuilder<ButtonBuilder>()
                .setComponents(resetButton)

            const selectMenuActionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
                .setComponents(selectMenu);

            const bannedDecks = userSettings.bannedDecks.length ? `\`${userSettings.bannedDecks.join(", ")}\`` : "None";

            const embedData = t("command:tarot.settingsEmbed", { lng: lang, returnObjects: true, userSettings: {...userSettings, bannedDecks, selectedDeckId: userSettings.selectedDeckId || "None"}, interaction, userIcon }) as Record<string, any>;
            const embed  = createEmbedFromData(interaction, embedData);

            await interaction.reply({ embeds: [embed], components: [buttonActionRow, selectMenuActionRow], ephemeral: true });
            setTimeout(async () => {
                await interaction.editReply({ components: [] });
            }, 120_000);
        }
    }

    override async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'pull':
                await handleSubcommand(interaction, subcommand);
        }
    }
}

async function handleSubcommand(interaction: AutocompleteInteraction, subcommand: string): Promise<void> {
    const focusedOption = interaction.options.getFocused(true);
    
    if (!focusedOption) return;
    let choices: string[] | undefined;

    switch (focusedOption.name) {
        case 'specific':
            choices = [
                'AlchTarot', 'AngelTarot', 'AnimalCrossingTarot', 'ArtofAdventureTarot', 'BlackSaltTarot',  
                'BumbleberryTarot', 'BurntWonderlandTarot', 'CheesPixelTarot', 'ChubbyDragonTarot', 'DarkExactTarot',  
                'DavinciTarot', 'EssentialTarot', 'FablemakersTarot', 'ForestTarot', 'GuildedTarot',  
                'MangaTarot', 'MarigoldTarot', 'OccultTarot', 'PastelJourneyTarot', 'WanderersTarot'
            ];
            break;

        default:
            return; 
    }

    if (choices) {
        const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedOption.value));
        const optionsToSend = filtered.slice(0, 25);

        await interaction.respond(
            optionsToSend.map(choice => ({ name: choice, value: choice }))
        );
    }
};