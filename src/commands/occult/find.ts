import { EmbedBuilder, ChatInputCommandInteraction, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";

import Command from "@/handlers/commands/Command";
import { TechnoRandomizer } from "@/utils/TechnoRandomizer";

import colorDataPath from '@data/Occult/colors.json';
import crystalsData from '@data/Occult/crystals.json';
import botanicalsData from '@data/Occult/botanicals.json';

export default class Find extends Command<ChatInputCommandInteraction> {
    constructor() {
        super({
            name: "find",
            description: "Search or get random botanicals, crystals, or colors",
            options: [
                {
                    name: "botanicals",
                    description: "search or get a random botanical",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{ name: "search" , description: "specify botanical to look up",  required: false, type: ApplicationCommandOptionType.String, autocomplete: true }]
                },
                {
                    name: "crystals",
                    description: "search or get a random crystal",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{ name: "search", description: "specify crystal to look up", required: false, type: ApplicationCommandOptionType.String, autocomplete: true }]
                },
                {
                    name: "colors",
                    description: "search or get a random color",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{ name: "search", description: "specify color to look up", required: false, type: ApplicationCommandOptionType.String, autocomplete: true }]
                }
            ]
        },
        [
            
        ]);
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();
        const search = interaction.options.getString("search");

        const getRandomElement = (array: any[]) => array[Math.floor(TechnoRandomizer.RandomNumber(0, 1, true) * array.length)];

        const createBotanicalEmbed = (botanical: any) => {
            const embed = new EmbedBuilder()
                .setTitle(botanical.HerbName)
                .setColor("#EEB8B6")
                .setDescription(botanical.Description)
                .setThumbnail(botanical.Thumbnail);
            
            if (botanical.AlsoCalled) embed.addFields({ name: 'Also Called:', value: botanical.AlsoCalled });
            if (botanical.Gender) embed.addFields(
                { name: 'Gender:', value: botanical.Gender, inline: true },
                { name: 'Planet:', value: botanical.Planet, inline: true },
                { name: 'Element:', value: botanical.Element, inline: true }
            );
            if (botanical.Sign) embed.addFields({ name: 'Sign:', value: botanical.Sign });
            if (botanical.Deities) embed.addFields({ name: 'Deities:', value: botanical.Deities });
            if (botanical.Warning) embed.addFields({ name: 'Warning:', value: `\`\`\`diff\n-${botanical.Warning}\`\`\`` });

            if (botanical.Family) {
                embed.addFields(
                    { name: '\u200B', value: '**__Classifications__**' },
                    { name: 'Native to:', value: botanical.NativeTo || "Unknown", inline: true },
                    { name: 'Family:', value: botanical.Family || "Unknown", inline: true },
                    { name: 'Genus:', value: botanical.Genus || "Unknown", inline: true },
                    { name: 'Species:', value: botanical.Species || "Unknown", inline: true }
                );
            }

            return embed;
        };

        const createCrystalEmbed = (crystal: any) => {
            const embed = new EmbedBuilder()
                .setTitle(crystal.crystalName)
                .setColor("#EEB8B6")
                .setDescription(crystal.properties)
                .setThumbnail(crystal.image);

            embed.addFields(
                { name: 'Attributes:', value: crystal.attribute, inline: true },
                { name: 'Element:', value: crystal.element, inline: true },
                { name: 'Color:', value: crystal.color, inline: true }
            );

            embed.addFields(
                { name: 'Habitat:', value: crystal.habitat || "Unknown", inline: true },
                { name: 'Tenacity:', value: crystal.tenacity || "Unknown", inline: true },
                { name: 'Mohs Hardness:', value: crystal.mohs || "Unknown", inline: true },
                { name: 'Other Info:', value: crystal.otherInfo || "None" }
            );
            return embed;
        };

        const createColorEmbed = (color: any) => {
            const embed = new EmbedBuilder()
                .setTitle(color.name)
                .setDescription(color.description)
                .setThumbnail(color.thumbnail)
                .setColor("#EEB8B6");

            embed.addFields(
                { name: 'Element', value: color.element, inline: true },
                { name: 'Direction', value: color.direction, inline: true },
                { name: 'Planet', value: color.planet, inline: true },
                { name: 'Day', value: color.day, inline: true },
                { name: 'Botanical/s', value: color.plant },
                { name: 'Tarot', value: color.tarot }
            );
            return embed;
        };

        const data = subcommand === "botanicals" ? botanicalsData : subcommand === "crystals" ? crystalsData : colorDataPath;

        if (!search) {
            const embed = subcommand === "botanicals" ? createBotanicalEmbed(getRandomElement(data)) :
                subcommand === "crystals" ? createCrystalEmbed(getRandomElement(data)) : createColorEmbed(getRandomElement(data));
            await interaction.reply({ embeds: [embed] });
        } else {
            const item = data.find((i: any) => 
                (subcommand === "botanicals" && i.HerbName?.toLowerCase() === search.toLowerCase()) ||
                (subcommand === "crystals" && i.crystalName?.toLowerCase() === search.toLowerCase()) ||
                (subcommand === "colors" && i.name?.toLowerCase() === search.toLowerCase())
            );
            
            if (!item) {
                await interaction.reply({ content: `${subcommand} not found.`, ephemeral: true });
                return;
            }

            const embed = subcommand === "botanicals" ? createBotanicalEmbed(item) :
                subcommand === "crystals" ? createCrystalEmbed(item) : createColorEmbed(item);

            await interaction.reply({ embeds: [embed] });
        }
    }

    override async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();
        const focusedOption = interaction.options.getFocused(true);
        const query = focusedOption.value.toLowerCase();

        let choices: string[] = [];
        switch (subcommand) {
            case "botanicals":
                choices = botanicalsData.map((item: any) => item.HerbName);
                break;
            case "crystals":
                choices = crystalsData.map((item: any) => item.crystalName);
                break;
            case "colors":
                choices = colorDataPath.map((item: any) => item.name);
                break;
        }

        const filteredChoices = choices.filter(choice => choice.toLowerCase().startsWith(query)).slice(0, 25);
        await interaction.respond(filteredChoices.map(choice => ({ name: choice, value: choice })));
    }
}