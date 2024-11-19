import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseClean(rawString: string) {
  try {
    // Step 1: Remove unwanted characters
    const cleanedString = rawString
      .replace(/^"|"$/g, "") // Remove leading and trailing quotes
      .replace(/'/g, '"') // Replace single quotes with double quotes for JSON compliance
      .replace(/\\n/g, "") // Remove newline escape characters
      .replace(/\\/g, ""); // Remove unnecessary backslashes

    // Step 2: Parse the cleaned string into JSON
    const parsedArray = JSON.parse(cleanedString);

    return parsedArray;
  } catch (error) {
    console.error("Error parsing the string:", error);
    return [];
  }
}
