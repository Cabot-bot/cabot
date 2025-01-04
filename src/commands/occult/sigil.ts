import { ChatInputCommandInteraction, ApplicationCommandOptionType, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { createCanvas } from '@napi-rs/canvas';

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";
import { t } from "i18next";
import { createEmbedFromData } from "@/utils/Embed";
import { detectLocale } from "@/utils/Language";

export default class Sigil extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "sigil",
            description: "Cabot creates a sigil based on your affirmation",
            options: [
                {
                    name: "affirmation",
                    description: "enter your affirmation",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ],
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const userAffirmation = interaction.options.getString("affirmation")!;
        await generateSigilImage(interaction, userAffirmation);
    }
}

const drawConsonantsOnCircle = (consonants: string, radius: number, ctx: CanvasRenderingContext2D) => {
    const angleStep = 360 / consonants.length;
  
    consonants.split('').forEach((char, i) => {
        const angle = angleStep * i;
        const radian = angle * (Math.PI / 180);
    
        const x = radius * (1 + 0.95 * Math.cos(radian)) - 6;
        const y = radius * (1 - 0.93 * Math.sin(radian)) - 2;
    
        ctx.fillText(char, x, y);
    });
};

const shuffle = <T>(array: T[]): T[] => {
    let currentIndex = array.length;
    while (currentIndex > 0) {
      const randomIndex = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * currentIndex--);
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

const generateRandomConsonants = (length: number): string => {
    const consonants = 'bcdfghjklmnpqrstvwxz';
    return Array.from({ length }, () => consonants[Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * consonants.length)]).join('');
};
  
const generateSigilImage = async (interaction: ChatInputCommandInteraction, userAffirmation: string) => {
    const lang = await detectLocale(interaction);

    const uniqueConsonants = Array.from(
      new Set(userAffirmation.replace(/[^a-z]/gi, '').replace(/[aeiouy]/gi, '').toLowerCase())
    );
  
    if (uniqueConsonants.length <= 1) {
      await interaction.reply({ content: t("command:sigil.!uniqueConsonants", { lng: lang }) });
      return;
    }
  
    const consonants = 'bcdfghjklmnpqrstvwxz';
    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
    const radius = canvas.width / 2;
    const angleStep = 360 / consonants.length;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#EEB8B6';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 15px';
  
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 2, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.stroke();
  
    const shuffledConsonants = shuffle(consonants.split('')).join('');
    const totalPositions = Math.ceil(360 / angleStep);
    const filledConsonants = shuffledConsonants.padEnd(totalPositions, generateRandomConsonants(totalPositions - shuffledConsonants.length));
  
    drawConsonantsOnCircle(filledConsonants, radius, ctx);
  
    const letterPositions: Record<string, { x: number; y: number }> = {};
    filledConsonants.split('').forEach((char, i) => {
        const angle = angleStep * i;
        const radian = angle * (Math.PI / 180);
        letterPositions[char] = {
            x: radius * (1 + 1.1 * Math.cos(radian)) - 4,
            y: radius * (1 - 1.1 * Math.sin(radian)) - 13
        };
    });
  
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };
  
    const drawHollowCircle = (x: number, y: number, radius: number) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#EEB8B6';
        ctx.stroke();
    };
  
    const drawSmallCircle = (x: number, y: number, radius: number) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    };
  
    const inputCharacters = uniqueConsonants.join("");

    inputCharacters.split('').forEach((char, i) => {
        const nextChar = inputCharacters[i + 1];
        if (nextChar && letterPositions[char] && letterPositions[nextChar]) {
            const { x: x1, y: y1 } = letterPositions[char];
            const { x: x2, y: y2 } = letterPositions[nextChar];
            
            const adjustedX1 = radius + (x1 - radius) * .80;
            const adjustedY1 = radius + (y1 - radius) * .80;
            const adjustedX2 = radius + (x2 - radius) * .80;
            const adjustedY2 = radius + (y2 - radius) * .80;

            drawLine(adjustedX1, adjustedY1, adjustedX2, adjustedY2);
    
            if (i === 0) drawHollowCircle(adjustedX1, adjustedY1, 7);
            if (i === inputCharacters.length - 2) drawSmallCircle(adjustedX2, adjustedY2, 5);
        }
    });

    const aboutSigils = new ButtonBuilder()
        .setCustomId("about-sigils")
        .setLabel("Learn Sigils")
        .setStyle(ButtonStyle.Secondary);

    const aboutSigilsActionRow = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(aboutSigils);

    const avatarUrl = interaction.client.user?.avatarURL() || "";

    const embedData = t("command:sigil.embed", { lng: lang, returnObjects: true, userAffirmation, uniqueConsonants: uniqueConsonants.join(', '), avatarUrl }) as Record<string, any>;
    const embed  = createEmbedFromData(interaction, embedData);

    await interaction.reply({
        embeds: [embed],
        components: [aboutSigilsActionRow],
        files: [new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'sigil.png'})]
    });
};