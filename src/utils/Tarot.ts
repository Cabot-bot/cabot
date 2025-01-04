import { db } from '@/database/db';
import { TechnoRandomizer } from './TechnoRandomizer';
import { t } from 'i18next';
import path from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { RowDataPacket } from 'mysql2';

const deckImageUrls = {
    Alch: "./tarot-decks/alch/",
    Angel: "./tarot-decks/Angel Tarot (Travis McHenry)/",
    burntWonderland: "./tarot-decks/BurntWonderlandTarot/", 
    cheesPixel: "./tarot-decks/Chee's Pixel Tarot/",
    Davinci: "./tarot-decks/davinci/",
    Forest: "./tarot-decks/forest/",
    Guilded: "./tarot-decks/guilded/",
    Manga: "./tarot-decks/manga/",
  
    Bumbleberry: "./tarot-decks/Bumbleberry Hollows Tarot/",
    PastelJourney: "./tarot-decks/Pastel Journey Tarot/converted/",
    DarkExact: "./tarot-decks/Dark Exact Tarot/",
    ArtofAdventure: "./tarot-decks/Art of Adventure Tarot/converted/",
    BlackSalt: "./tarot-decks/Black Salt Tarot/converted/",
    Marigold: "./tarot-decks/Marigold Tarot/converted/",

    Fablemakers: "./tarot-decks/Fablemakers Tarot/",
    Occult: "./tarot-decks/Occult Tarot/",
    AnimalCrossing: "./tarot-decks/Animal Crossing Tarot/",
    ChubbyDragon: "./tarot-decks/Chubby Dragon Tarot/",
    Essential: "./tarot-decks/Essential Tarot/",
    Wanderers: "./tarot-decks/Wanderers Tarot/",
};

interface TarotCard {
    name: string;
    number: string;
    arcana: string;
    suit: string | null;
    image: string;
    upright: { description: string; keywords: string[] };
    reversed: { description: string; keywords: string[] };
}

interface Correspondence {
    name: string;
    url: string;
    displayName: string;
}

export const correspondence: Correspondence[] = [
    { name: "AlchTarot", url: deckImageUrls.Alch, displayName: "Alch Tarot" },
    { name: "AngelTarot", url: deckImageUrls.Angel, displayName: "Angel Tarot" },
    { name: "DavinciTarot", url: deckImageUrls.Davinci, displayName: "Davinci Tarot" },
    { name: "ForestTarot", url: deckImageUrls.Forest, displayName: "Forest Tarot" },
    { name: "GuildedTarot", url: deckImageUrls.Guilded, displayName: "Guilded Tarot" },
    { name: "MangaTarot", url: deckImageUrls.Manga, displayName: "Manga Tarot" },
    { name: "BurntWonderlandTarot", url: deckImageUrls.burntWonderland, displayName: "Burnt Wonderland Tarot" },
    { name: "CheesPixelTarot", url: deckImageUrls.cheesPixel, displayName: "Chees Pixel Tarot" },
    { name: "BumbleberryTarot", url: deckImageUrls.Bumbleberry, displayName: "Bumbleberry Hollows Tarot" },
    { name: "PastelJourneyTarot", url: deckImageUrls.PastelJourney, displayName: "Pastel Journey Tarot" },
    { name: "DarkExactTarot", url: deckImageUrls.DarkExact, displayName: "Dark Exact Tarot" },
    { name: "ArtofAdventureTarot", url: deckImageUrls.ArtofAdventure, displayName: "Art of Adventure Tarot" },
    { name: "BlackSaltTarot", url: deckImageUrls.BlackSalt, displayName: "Black Salt Tarot" },
    { name: "MarigoldTarot", url: deckImageUrls.Marigold, displayName: "Marigold Tarot" },

    { name: "FablemakersTarot", url: deckImageUrls.Fablemakers, displayName: "Fablemakers Tarot" },
    { name: "OccultTarot", url: deckImageUrls.Occult, displayName: "Occult Tarot" },
    { name: "AnimalCrossingTarot", url: deckImageUrls.AnimalCrossing, displayName: "Animal Crossing Tarot" },
    { name: "ChubbyDragonTarot", url: deckImageUrls.ChubbyDragon, displayName: "Chubby Dragon Tarot" },
    { name: "EssentialTarot", url: deckImageUrls.Essential, displayName: "Essential Tarot" },
    { name: "WanderersTarot", url: deckImageUrls.Wanderers, displayName: "Wanderers Tarot" },
];

interface DrawnCard {
    name: string;
    number: string;
    arcana: string;
    suit: string | null;
    description: string;
    keywords: string;
    imageUrl: string;
    reversed: string;
    deck: string;
}

async function normalizeImageFileName(imagePath: string, deckPath: string): Promise<string> {
    const nameWithoutExtension = path.basename(imagePath, path.extname(imagePath));

    const possibleNames = [
        nameWithoutExtension.padStart(2, "0"),
        nameWithoutExtension.replace(/^0+/, ""),
    ];

    const checkedPaths: string[] = [];

    for (const name of possibleNames) {
        for (const ext of [".jpg", ".png"]) {
            const filePath = path.join(deckPath, `${name}${ext}`);
            checkedPaths.push(filePath);
            try {
                await fs.access(filePath);
                return `${name}${ext}`;
            } catch (err) {
                console.debug(`File not found: ${filePath} (${err})`);
            }
        }
    }

    throw new Error(
        `Image file not found: ${nameWithoutExtension} (checked paths: ${checkedPaths.join(", ")})`
    );
}
async function reverseImage(imagePath: string): Promise<string> {
    const reversedImagePath = path.join(path.dirname(imagePath), `reversed_${path.basename(imagePath)}`);

    try {
        await fs.access(reversedImagePath);
        return reversedImagePath;
    } catch {
        await sharp(imagePath).flip().toFile(reversedImagePath);
        return reversedImagePath;
    }
}

export async function drawRandomTarotCards( userId: string, lang: string, chosenDeck?: string, numCards: number = 1): Promise<DrawnCard[]> {
    const tarotDeck = t("data:divination/tarot", { lng: lang, returnObjects: true }) as TarotCard[];

    const [rows] = await db.promise().query<RowDataPacket[]>(
        `SELECT tarot_settings FROM users WHERE id = ?`, [userId]
    );
    const user = rows[0];

    const tarotSettings = user?.tarot_settings ? JSON.parse(user.tarot_settings) : {
        reversals: true, // If card reversals are enabled
        selectedDeckId: "", // Base deck to always pull from
        reversalFrequency: 3, // How often reversals show up
        bannedDecks: [], // Banned decks
    };

    const { reversals, selectedDeckId, reversalFrequency, bannedDecks } = tarotSettings;
    const drawnCards: DrawnCard[] = [];
    const drawnDecks = new Set<string>();
    const drawnCardNumbers = new Set<string>();

    for (let i = 0; i < numCards; i++) {
        let selectedDeckUrl: string | undefined;

        if (chosenDeck) {
            selectedDeckUrl = correspondence.find(d => d.name === chosenDeck)?.url;
        } else {
            if (!selectedDeckId) {
                do {
                    selectedDeckUrl = correspondence[Math.floor(Math.random() * correspondence.length)].url;
                } while (
                    Array.isArray(bannedDecks) &&
                    bannedDecks.includes(correspondence.find(d => d.url === selectedDeckUrl)?.name || "") || drawnDecks.has(selectedDeckUrl!)
                );
            } else {
                selectedDeckUrl = correspondence.find(d => d.name === selectedDeckId)?.url;
                if (Array.isArray(bannedDecks) && bannedDecks.includes(selectedDeckId)) {
                    do {
                        selectedDeckUrl = correspondence[Math.floor(Math.random() * correspondence.length)].url;
                    } while (
                        bannedDecks.includes(correspondence.find(d => d.url === selectedDeckUrl)?.name || "") || drawnDecks.has(selectedDeckUrl!)
                    );
                }
            }
        }

        drawnDecks.add(selectedDeckUrl!);
        let randomIndex: number, card: TarotCard;

        do {
            randomIndex = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * tarotDeck.length);
            card = tarotDeck[randomIndex];
        } while (drawnCardNumbers.has(card.number));

        drawnCardNumbers.add(card.number);

        const deckName = correspondence.find(d => d.url === selectedDeckUrl)?.displayName || "Unknown Deck";
        const normalizedImage = await normalizeImageFileName(card.image, selectedDeckUrl!);
        const fullUrl = `${selectedDeckUrl}${normalizedImage}`;
        const reversed = reversals && TechnoRandomizer.RandomNumber(0, 1, true) < 1 / reversalFrequency;

        const imageUrl = reversed ? await reverseImage(fullUrl) : fullUrl;

        drawnCards.push({
            name: card.name,
            number: card.number,
            arcana: card.arcana,
            suit: card.suit,
            description: reversed ? card.reversed.description : card.upright.description,
            keywords: reversed ? card.reversed.keywords.join(", ") : card.upright.keywords.join(", "),
            imageUrl,
            reversed: reversed ? "Reversed" : "Upright",
            deck: deckName
        });
    }

    return drawnCards;
}