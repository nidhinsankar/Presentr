import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export function parseClean(rawString: string) {
//   try {
//     // Step 1: Remove unwanted characters
//     const cleanedString = rawString
//       .replace(/^"|"$/g, "") // Remove leading and trailing quotes
//       .replace(/'/g, '"') // Replace single quotes with double quotes for JSON compliance
//       .replace(/\\n/g, "") // Remove newline escape characters
//       .replace(/\\/g, ""); // Remove unnecessary backslashes

//     // Step 2: Parse the cleaned string into JSON
//     const parsedArray = JSON.parse(cleanedString);

//     return parsedArray;
//   } catch (error) {
//     console.error("Error parsing the string:", error);
//     return [];
//   }
// }
// export const parseClean = (response: string) => {
//   return response
//     .replace(/\\n/g, "") // Remove newlines
//     .replace(/\\/g, "") // Remove backslashes
//     .replace(/\s+/g, " ") // Replace multiple spaces with single space
//     .trim(); // Remove leading/trailing whitespace
// };

export const parseClean = (response: string) => {
  return response
    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1") // Remove comments
    .replace(/^\s+|\s+$/g, "") // Trim whitespace
    .replace(/\n/g, "") // Remove newlines
    .replace(/,\s*}/g, "}") // Remove trailing commas in objects
    .replace(/,\s*\]/g, "]") // Remove trailing commas in arrays
    .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Quote unquoted keys
    .replace(/:\s*'/g, ': "') // Replace single quotes with double quotes
    .replace(/'\s*([,}])/g, '"$1');
};
