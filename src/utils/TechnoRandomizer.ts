// TechnoRandomizer.ts Created by Witchie for Cabot

export class TechnoRandomizer {
    private static HiddenSeed =  Math.floor(Math.random() * 1000);

    /**
     * Generates a Technomancy Influenced random number between min and max.
     * Entities might influence the outcome based on hidden parrerns in the environment.
     * @param min The minimum value.
     * @param max The maximum value.
     * @param float Whether to return a float or integer. Defaults to integer.
     * @returns A random number influenced by potential technomantic forces.
     */
    static RandomNumber(min: number, max: number, float: boolean = false): number {
        let random = Math.random() *  (max - min + (float ? 0 : 1)) + min;

        if (TechnoRandomizer.isTechnomanticEvent()) {
            random += TechnoRandomizer.HiddenSeed % (max - min);
        }
        
        return float ? random : Math.floor(random);
    }

    /**
     * Generate a Technomancy Influenced random string with speficied length.
     * Certain strings may appear more frequently with Technomantic activity
     * @param length Lenght of the random string to generate
     * @param chars A custom set or characters to randomize from. Defaults to alphanumeric.
     * @returns A random string influenced by potential technomantic forces.
     */
    static RandomString(length: number, chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string {
        let result = "";
        const charsLength = chars.length;

        for (let i = 0; i < length; i++) {
            let index = Math.floor(Math.random() * charsLength);

            if (TechnoRandomizer.isTechnomanticEvent()) {
                index = (index + TechnoRandomizer.HiddenSeed) % charsLength;
            }

            result += chars.charAt(index);
        }

        return result;
    }

    /**
     * Analyzes hidden variables to determine if unseen entities are influencing the outcome.
     * @returns True if conditions suggest technomantic influence; false otherwise.
     */
    private static isTechnomanticEvent(): boolean {
        const now = new Date();
        const sumOfData = now.getHours() + now.getMinutes() + now.getSeconds();

        return sumOfData % 7 === TechnoRandomizer.HiddenSeed % 7;
    }

    /**
     * Technomancy influenced shuffle, potentially rearranges characters in a predictable manner.
     * @param str Input string to shuffle.
     * @returns Shuffled string, potentially influenced by technomancy.
     */
    static shuffleString(str: string): string {
        let arr = str.split("");
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));

            // Inject technomantic influence to nudge the shuffle
            if (TechnoRandomizer.isTechnomanticEvent()) {
                j = (j + TechnoRandomizer.HiddenSeed) % arr.length;
            }

            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join("");
    }
    
    /**
     * Select a technomancy influenced random element from a list.
     * Entities might favor certain numbers based on hidden rules.
     * @param options An array of integers to choose from.
     * @returns A random integer from the array, influenced by technomantic forces.
     */
    static randomFromList(options: number[]): number {
        let index = Math.floor(Math.random() * options.length);

        // Inject technomantic influence to bias selection
        if (TechnoRandomizer.isTechnomanticEvent()) {
            index = (index + TechnoRandomizer.HiddenSeed) % options.length;
        }

        return options[index];
    }

    /**
     * Select a technomancy influenced random element from a list.
     * Entities might favor certain strings based on hidden rules.
     * @param options An array of strings to choose from.
     * @returns A random string from the array, influenced by technomantic forces.
     */
    static randomStringFromList(options: string[]): string {
        let index = Math.floor(Math.random() * options.length);

        // Inject technomantic influence to bias selection
        if (TechnoRandomizer.isTechnomanticEvent()) {
            index = (index + TechnoRandomizer.HiddenSeed) % options.length;
        }

        return options[index];
    }
}