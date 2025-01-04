import { BaseError, ensureError, ErrorType } from "@/utils/errors";
import { pluralize } from "@/utils";

import Component, { type ComponentInteraction, type CustomID } from "./Component";
import Logger, { AnsiColor } from "@/utils/logger";
import path from "path";
import fs from "fs";
import * as assert from "node:assert";

/** Utility class for handling component interactions. */
export default class ComponentManager {
    /** Cached components mapped by their custom IDs. */
    private static _cache = new Map<CustomID, Component>;

    /** Caches all components from the components directory. */
    static async cache(): Promise<void> {
        const dirpath = path.resolve("src/components");

        if (!fs.existsSync(dirpath)) {
            Logger.warn("Skipping component caching, path src/components not found");
            return;
        }

        Logger.info("Caching components...");
        const filenames = ComponentManager._getFilesRecursively(dirpath);

        try {
            for (const filename of filenames) {
                const filepath = path.resolve(dirpath, filename);

                // Import and initiate the component
                const componentModule = await import(filepath);
                const componentClass = componentModule.default;
                const component = new componentClass();

                // Ensure the component is an instance of the Component class
                assert.ok(component instanceof Component, `Expected default export of Component in ${filepath}`);

                // Cache the component
                ComponentManager._cache.set(component.customId, component);

                Logger.log("GLOBAL", `Cached component "${component.customId}"`, {
                    color: AnsiColor.Purple
                });
            }
        } catch (_error: unknown) {
            const cause = ensureError(_error);

            throw new BaseError("Failed to cache components", {
                name: ErrorType.ComponentCachingError,
                cause
            });
        }

        Logger.info(`Cached ${filenames.length} ${pluralize(filenames.length, "component")}`);
    }

    static async handle(interaction: ComponentInteraction): Promise<void> {
        // Retrieve the component's instance from cache by its custom ID
        const component = ComponentManager._cache.get(interaction.customId);

        if (!component) {
            throw new Error(`Component "${interaction.customId}" not found`);
        }

        await component.execute(interaction);
    }

    /** Recrusively retrieves all file paths in a directory */
    private static _getFilesRecursively(dir: string): string[] {
        const files: string[] = [];
        for (const file of fs.readdirSync(dir)) {
            const filepath = path.join(dir, file);
            if (fs.statSync(filepath).isDirectory()) {
                files.push(...ComponentManager._getFilesRecursively(filepath));
            } else if (file.endsWith(".ts") || file.endsWith(".js")) {
                files.push(filepath);
            }
        }
        return files;
    }
}