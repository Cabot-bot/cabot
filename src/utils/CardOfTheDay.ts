import cardOfTheDayData from "@data/TestData/cardOfTheDay.json";
import { TechnoRandomizer } from "./TechnoRandomizer";
import Logger from "./logger";
import path from "path";
import fs from "fs";

interface TarotCard {
    name: string;
    arcana: string | null;
    suit: string | null;
    number: number;
    keywords: string[];
    description: {
        upright: string;
        reversed: string;
    },
    advice: {
        dailyMessage: string;
        upright: string;
        reversed: string;
    },
    numerology: {
        value: number | null;
        meaning: string;
    },
    element: string;
    astrology: {
        zodiacSign: string | null;
        planet: string | null;
    },
    affirmation: string;
    connections: {
        relatedColors: string[];
        crystals: string[];
        herbs: string[];
    }
};

const drawnCardsPath = path.join(__dirname, "drawnCards.json");

const loadDrawnCards = (): string[] => {
    try {
        if (fs.existsSync(drawnCardsPath)) {
            const data = fs.readFileSync(drawnCardsPath, "utf-8");
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        Logger.error("Failed to load drawn cards. Resetting history.");
        return [];
    }
};

const saveDrawnCards = (cards: string[]) => {
    try {
        fs.writeFileSync(drawnCardsPath, JSON.stringify(cards, null, 2), "utf-8");
    } catch (err) {
        Logger.error("Failed to save drawn cards.");
    }
};  

const tarotDeck: TarotCard[] = Object.values(cardOfTheDayData);

let drawnCards: string[] = loadDrawnCards();

const getRandomIndex = (max: number): number => {
    return Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) *  max);
};

const resetDeck = () => {
    Logger.warn("All cards have been drawn. Resetting for a new cycle.");
    drawnCards = [];
    saveDrawnCards(drawnCards);
};

export const drawCardOfTheDay = (): {
    card: TarotCard;
    orientation: "Upright" | "Reversed";
} => {
    if (drawnCards.length >= tarotDeck.length) resetDeck();
  
    const remainingCards = tarotDeck.filter(
        (card) => !drawnCards.includes(card.name)
    );
  
    const randomIndex = getRandomIndex(remainingCards.length);
    const selectedCard = remainingCards[randomIndex];
  
    const isUpright = Math.random() < 0.5;
    const orientation = isUpright ? "Upright" : "Reversed";
  
    drawnCards.push(selectedCard.name);
    saveDrawnCards(drawnCards);
  
    return {
        card: selectedCard,
        orientation: orientation,
    };
};

