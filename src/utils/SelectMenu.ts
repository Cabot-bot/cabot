import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

export function createSelectMenuFromData(selectMenuData: {
    id: string;
    placeholder: string;
    options: { label: string; description: string; value: string }[];
}): StringSelectMenuBuilder {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(selectMenuData.id)
        .setPlaceholder(selectMenuData.placeholder);

    const options = selectMenuData.options.map(option => 
        new StringSelectMenuOptionBuilder()
            .setLabel(option.label)
            .setDescription(option.description)
            .setValue(option.value)
    );

    selectMenu.setOptions(options);
    return selectMenu;
}