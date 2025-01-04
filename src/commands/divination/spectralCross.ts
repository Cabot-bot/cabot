import { ChatInputCommandInteraction, AttachmentBuilder } from "discord.js";
import { createCanvas } from "@napi-rs/canvas";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";

import { detectLocale } from "@/utils/Language";
import { t } from "i18next";
import { createEmbedFromData } from "@/utils/Embed";

interface PairMeaning {
    word: string;
    elaboration: string;
}

interface Color {
    shades: Record<string, string>;
    spectrum: string;
    name: string;
    pairMeanings: Record<string, PairMeaning>;
}

interface ColorData {
    colors: Color[];
}

export default class SpectralCross extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "spectralcross",
            description: "Cabot color based divination system",
            options: []
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lang = await detectLocale(interaction);
        
        const colorData = t("data:divination/colorData", { lng: lang, returnObjects: true }) as ColorData[];
        const colorDataTyped: ColorData = colorData as unknown as ColorData;

        const result = await generateCross(colorDataTyped);
        const { color1Spectrum, color2Spectrum, pairMeanings, attachment } = result;

        const embedData = t("command:spectralcross.embed", { lng: lang, returnObjects: true, color1Spectrum, color2Spectrum, pairMeanings, attachment }) as Record<string, any>;
        const embed  = createEmbedFromData(interaction, embedData);

        interaction.reply({ embeds: [embed], files: [attachment] });
    }
}

async function generateCross(colorDataTyped: ColorData) {
    const canvas = createCanvas(300, 200);
    const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colorIndex1 = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * colorDataTyped.colors.length);
    let colorIndex2 = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * colorDataTyped.colors.length);

    while (colorIndex1 === colorIndex2) {
        colorIndex2 = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * colorDataTyped.colors.length);
    }

    const color1 = colorDataTyped.colors[colorIndex1];
    const color2 = colorDataTyped.colors[colorIndex2];
    const color1Spectrum = color1.spectrum;
    const color2Spectrum = color2.spectrum;

    const middleColumn = 3;
    const randomRow = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * 4);
    const randomColumn = Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * 4);
    const squareSize = 50;

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 7; j++) {
            const x = j * squareSize;
            const y = i * squareSize;

            if (j === middleColumn && i === randomRow) {
                const quad1 = createRoundedQuadrant(color1.shades, i, color1Spectrum, squareSize);
                const quad2 = createRoundedQuadrant(color2.shades, i, color2Spectrum, squareSize);

                ctx.fillStyle = quad1.topLeftColor;
                ctx.beginPath();
                drawRoundedRect(ctx, x, y, squareSize / 2, squareSize / 2, quad1.radius);
                ctx.fill();

                ctx.fillStyle = quad2.topLeftColor;
                ctx.beginPath();
                drawRoundedRect(ctx, x + squareSize / 2, y, squareSize / 2, squareSize / 2, quad2.radius);
                ctx.fill();

                ctx.fillStyle = quad2.topLeftColor;
                ctx.beginPath();
                drawRoundedRect(ctx, x, y + squareSize / 2, squareSize / 2, squareSize / 2, quad2.radius);
                ctx.fill();

                ctx.fillStyle = quad1.topLeftColor;
                ctx.beginPath();
                drawRoundedRect(ctx, x + squareSize / 2, y + squareSize / 2, squareSize / 2, squareSize / 2, quad1.radius);
                ctx.fill();

            } else if (j === middleColumn) {
                ctx.fillStyle = Object.values(color1.shades)[i];
                ctx.beginPath();
                drawRoundedRect(ctx, x, y, squareSize, squareSize);
                ctx.fill();
            } else if (i === randomRow && j >= randomColumn && j < randomColumn + 4) {
                ctx.fillStyle = Object.values(color2.shades)[j - randomColumn];
                ctx.beginPath();
                drawRoundedRect(ctx, x, y, squareSize, squareSize);
                ctx.fill();
            } else {
                ctx.fillStyle = '#ffffff00';
                ctx.beginPath();
                drawRoundedRect(ctx, x, y, squareSize, squareSize);
                ctx.fill();
            }
        }
    }

    const buffer = canvas.toBuffer("image/png");
    const attachment = new AttachmentBuilder(buffer, { name: "cross.png" });

    return {
        attachment,
        color1Spectrum,
        color2Spectrum,
        color1,
        color2,
        pairMeanings: {
            color1: color1.pairMeanings[color2.name],
            color2: color2.pairMeanings[color1.name]
        }
    };
}

function createRoundedQuadrant(
    shades: Record<string, string> | undefined,
    index: number,
    spectrum: string,
    size: number
) {
    const baseColor = shades ? Object.values(shades)[index] : "#ffffff00";
    const lightenFactor = 20;

    return {
        topLeftColor: lightenColor(baseColor, lightenFactor),
        radius: size * 0.2,
        spectrum: spectrum || ""
    };
}

function lightenColor(color: string, factor: number): string {
    const hex = color.replace(/^#/, "");
    const num = parseInt(hex, 16);

    const r = (num >> 16) + factor;
    const g = ((num >> 8) & 0x00ff) + factor;
    const b = (num & 0x0000ff) + factor;

    const newR = Math.min(255, Math.max(0, r));
    const newG = Math.min(255, Math.max(0, g));
    const newB = Math.min(255, Math.max(0, b));

    return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, "0")}`;
}

function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius = 10
) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}