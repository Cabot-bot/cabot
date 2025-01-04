import { init } from "i18next";
import { resources } from "@locales/settings";
import { type Interaction } from "discord.js";


export async function detectLocale(interaction: Interaction): Promise<string> {
    let lang = interaction.locale;

    if (lang.startsWith('en-')) return 'en';
    if (lang.startsWith('es-')) return 'es';
    if (lang.startsWith('pt-')) return 'pt';

    return lang || 'en';
}

export function loadLanguages() {
    init({
        fallbackLng: "en",
        defaultNS: "system",
        ns: ["system", "command", "component", "data"],
        interpolation: {
            escapeValue: false,
        },
        resources,
    });
}