import { type Interaction, EmbedBuilder, type APIEmbedField } from "discord.js";

export function createEmbedFromData(interaction: Interaction, embedData: {
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    fields?: { name: string; value: string; inline?: boolean }[];
    footer?: { text: string; iconURL?: string };
    image?: { url: string };
    thumbnail?: { url: string };
    timestamp?: boolean | string | Date;
    author?: { name: string; iconURL?: string };
}): EmbedBuilder {
    const embed = new EmbedBuilder();
    const avatarUrl = interaction.client.user?.avatarURL() || "";

    embed.setColor("#EEB8B6");

    if (embedData.title) embed.setTitle(embedData.title);
    if (embedData.description) embed.setDescription(embedData.description);
    if (embedData.url) embed.setURL(embedData.url);
    if (embedData.fields) embed.addFields(embedData.fields as APIEmbedField[]);
    if (embedData.footer) embed.setFooter({ text: embedData.footer.text, iconURL: avatarUrl });
    if (embedData.image) embed.setImage(embedData.image.url);

    if (embedData.thumbnail && /^https?:\/\/[^\s]+$/.test(embedData.thumbnail.url)) {
        embed.setThumbnail(embedData.thumbnail.url);
    }
    
    if (embedData.author) embed.setAuthor(embedData.author);
    if (embedData.timestamp === true) {embed.setTimestamp(new Date())}  
    return embed;
}