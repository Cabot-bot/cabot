import { EmbedBuilder, ChatInputCommandInteraction, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";

import Command from "@/handlers/commands/Command";

interface BibleApiResponse {
    reference: string;
    verses: Verse[];
    text: string;
    translation_name: string;
}

interface Verse {
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
}

const BOOK_CHOICES: string[] = [
    'Esther', 'Nahum', 'Philippians', 'Genesis', 'Job', 'Habakkuk',
    'Colossians', 'Exodus', 'Psalms', 'Zephaniah', '1 Thessalonians',
    'Leviticus', 'Proverbs', 'Haggai', '2 Thessalonians', 'Numbers',
    'Ecclesiastes', 'Zechariah', '1 Timothy', 'Deuteronomy', 'Song of Solomon',
    'Malachi', '2 Timothy', 'Joshua', 'Isaiah', 'Titus', 'Judges',
    'Jeremiah', 'Matthew', 'Philemon', 'Ruth', 'Lamentations', 'Mark',
    'Hebrews', '1 Samuel', 'Ezekiel', 'Luke', 'James', '2 Samuel',
    'Daniel', 'John', '1 Peter', '1 Kings', 'Hosea', 'Acts', '2 Peter',
    '2 Kings', 'Joel', 'Romans', '1 John', '1 Chronicles', 'Amos',
    '1 Corinthians', '2 John', '2 Chronicles', 'Obadiah', '2 Corinthians',
    '3 John', 'Ezra', 'Jonah', 'Galatians', 'Jude', 'Nehemiah',
    'Micah', 'Ephesians', 'Revelation'
];

export default class Bible extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "bible",
            description: "Search the bible to get a religious text script",
            options: [
                {
                    name: "book",
                    description: "specify book",
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: true
                },
                {
                    name: "chapter",
                    description: "specify chapter",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                },
                {
                    name: "verse",
                    description: "specify verse",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                },
                {
                    name: "translation",
                    description: "specify a translation | default: World English Bible",
                    required: false,
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: "Bible-in-Basic-English", value: "bbe"},
                        { name: "King-James-Version", value: "kjv"},
                        { name: "World-English-Bible", value: "web"},
                        { name: "Open-English-Bible_Commonwealth-Edition", value: "oeb-cw"},
                        { name: "World-English-Bible_British-Edition", value: "webbe"},
                        { name: "Open-English-Bible_US-Edition", value: "oeb-us"}
                    ]
                },
            ],
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const avatarUrl = interaction.client.user?.avatarURL() || "";

        const bookInput = interaction.options.getString("book");
        const chapterInput = interaction.options.getInteger("chapter");
        const verseInput = interaction.options.getInteger("verse");
        const translationInput = interaction.options.getString("translation");

        const textTranslation = translationInput || 'web';

        const apiUrl = `https://bible-api.com/${bookInput}+${chapterInput}:${verseInput}?translation=${textTranslation}`;
        const response = await fetch(apiUrl, { method: 'get' });

        if (!response.ok) {
            throw new Error(`Api request failed with status ${response.status}`);
        }

        const { reference, text, translation_name }: BibleApiResponse = await response.json();

        const embed = new EmbedBuilder()
            .setTitle(reference)
            .setColor("#EEB8B6")
            .setDescription(text)
            .setFooter({ text: `From: ${translation_name}`, iconURL: avatarUrl })
        await interaction.reply({
            embeds: [embed]
        });
    }

    override async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const query = interaction.options.getFocused().toLowerCase();

        const filteredSuggestions = BOOK_CHOICES
            .filter(choice => choice.toLowerCase().startsWith(query))
            .map(choice => ({ name: choice, value: choice }));
        await interaction.respond(filteredSuggestions.slice(0, 25));
    }
}