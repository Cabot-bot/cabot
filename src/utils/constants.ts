import { ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } from "discord.js";

export const DEFAULT_COMMAND_PERMISSIONS: readonly bigint[] = [PermissionFlagsBits.ManageGuild];

export const DEFAULT_COMMAND_CONTEXTS: readonly InteractionContextType[] = [
    InteractionContextType.Guild
];

export const DEFAULT_INTEGRATION_TYPES: readonly ApplicationIntegrationType[] = [
    ApplicationIntegrationType.GuildInstall
];