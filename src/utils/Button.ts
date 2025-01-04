import { ButtonBuilder, ButtonStyle } from "discord.js";

interface ButtonData {
    id: string;
    label: string;
    style: string;
}

export function createButtonFromData(ButtonData: ButtonData): ButtonBuilder {
    const button = new ButtonBuilder()
        .setCustomId(ButtonData.id)
        .setLabel(ButtonData.label)
        .setStyle(ButtonStyle[ButtonData.style as keyof typeof ButtonStyle]);

    return button;
}