import Logger from "./logger";

let collator: Intl.Collator | null = null;
try {
    collator = typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined'
        ? new Intl.Collator('generic', { sensitivity: 'base' })
        : null;
} catch (error) {
    Logger.error("Collator could not be initialized and won't be used.");
}

const prevRow: number[] = [];
const str2Char: number[] = [];

/**
 * Calculate the Levenshtein distance between two strings, with optional locale-sensitive comparison.
 */
export class Levenshtein {
    /**
     * Compute the Levenshtein distance between two strings.
     * 
     * @param str1 - The first string.
     * @param str2 - The second string.
     * @param options - Options for the calculation.
     * @param options.useCollator - Use `Intl.Collator` for locale-sensitive comparison.
     * @returns The Levenshtein distance.
     */
    static get(str1: string, str2: string, options?: { useCollator?: boolean }): number {
        const useCollator = options?.useCollator && collator;
        
        const str1Len = str1.length;
        const str2Len = str2.length;

        // Base cases
        if (str1Len === 0) return str2Len;
        if (str2Len === 0) return str1Len;

        // Initialize previous row and character codes array for str2
        for (let i = 0; i < str2Len; i++) {
            prevRow[i] = i;
            str2Char[i] = str2.charCodeAt(i);
        }
        prevRow[str2Len] = str2Len;

        let nextCol: number = 0; // Initialize nextCol

        // Calculate distance row-by-row
        for (let i = 0; i < str1Len; i++) {
            nextCol = i + 1;

            for (let j = 0; j < str2Len; j++) {
                const curCol = nextCol;

                // Substitution with optional collator
                const isSame = useCollator
                    ? collator!.compare(str1[i], String.fromCharCode(str2Char[j])) === 0
                    : str1.charCodeAt(i) === str2Char[j];

                nextCol = prevRow[j] + (isSame ? 0 : 1);

                // Insertion
                const insertionCost = curCol + 1;
                if (nextCol > insertionCost) nextCol = insertionCost;

                // Deletion
                const deletionCost = prevRow[j + 1] + 1;
                if (nextCol > deletionCost) nextCol = deletionCost;

                // Set current column value to previous row for next iteration
                prevRow[j] = curCol;
            }
            prevRow[str2Len] = nextCol;
        }

        return nextCol;
    }
}