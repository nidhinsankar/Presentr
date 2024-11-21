"use client";

import { ApolloClient, ApolloError, gql, useQuery } from "@apollo/client";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { DocumentNode } from "graphql";

export function useGraphQLQuery<T = any>(
  query: DocumentNode,
  variables?: Record<string, any>
) {
  const { data, loading, error } = useQuery<T>(query, { variables });
  return { data, loading, error };
}

export const GET_TRANSCRIPT_QUERY = gql`
  query GetTranscript($data: String!) {
    cleanTranscript(data: $data)
  }
`;

export const GET_CONVERT_TO_TEXT_ARRAY = gql`
  query GetTextToArray($text: String!) {
    convertTextToArray(text: $text)
  }
`;

export const GET_IMPROVE_CONTENT = gql`
  query GetImprovePresentationContent($data: String!) {
    improvePresentationContent(content: $data)
  }
`;

export const GET_TITLE_AND_DESCRIPTION = gql`
  query GetTitleAndDescription($data: String!) {
    generateTitleAndDescription(contentArray: $data)
  }
`;

interface ProcessResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface PresentationContent {
  arrayOfObjects: any[];
  title: string;
  description: string;
}

interface SlideContent {
  slideNumber: number;
  content: string;
}

function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ");
}

function formatArrayForImprovement(array: string[]): SlideContent[] {
  return array.map((content, index) => ({
    slideNumber: index + 1,
    content: content.trim(),
  }));
}

async function processGraphQLQuery<T>(
  queryFn: Promise<any>,
  errorMessage: string
): Promise<ProcessResult<T>> {
  try {
    const response = await queryFn;
    if (!response?.data) {
      console.error(`${errorMessage}: No data returned`, response);
      return { success: false, error: `${errorMessage}: No data returned ` };
    }
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    const errorDetails =
      error instanceof ApolloError ? error.message : "Unknown error";
    return { success: false, error: `${errorMessage}: ${errorDetails}` };
  }
}

async function convertToArray(
  text: string,
  client: ApolloClient<any>
): Promise<string[]> {
  try {
    const response = await client.query({
      query: GET_CONVERT_TO_TEXT_ARRAY,
      variables: { text },
    });

    if (!response?.data?.convertTextToArray) {
      throw new Error("No array data returned from conversion");
    }

    let result = response.data.convertTextToArray;

    if (typeof result === "string") {
      try {
        result = JSON.parse(result);
      } catch {
        result = result.split("\n").filter((line: string) => line.trim());
      }
    }

    if (!Array.isArray(result)) {
      throw new Error("Conversion result is not an array");
    }

    if (result.length === 0) {
      throw new Error("Conversion resulted in an empty array");
    }

    return result.map((item) =>
      typeof item === "string" ? item : JSON.stringify(item)
    );
  } catch (error) {
    console.error("Error in convertToArray:", error);
    throw new Error(`Array conversion failed: ${error.message}`);
  }
}

async function improveContent(
  contentArray: string[],
  client: ApolloClient<any>
): Promise<any[]> {
  try {
    const formattedArray = formatArrayForImprovement(contentArray);
    const stringifiedArray = JSON.stringify(formattedArray);

    const response = await client.query({
      query: GET_IMPROVE_CONTENT,
      variables: { data: stringifiedArray },
    });

    if (!response?.data?.improvePresentationContent) {
      throw new Error("No improved content returned");
    }

    let improvedContent = response.data.improvePresentationContent;

    if (typeof improvedContent === "string") {
      try {
        improvedContent = JSON.parse(improvedContent.replace(/'/g, '"'));
      } catch {
        throw new Error("Improved content parsing failed");
      }
    }

    if (!Array.isArray(improvedContent)) {
      throw new Error("Improved content is not an array");
    }

    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error(`Content improvement failed: ${error.message}`);
  }
}

export async function runGraphQLPresentationCreationProcess(
  client: ApolloClient<any>,
  transcript: string,
  slideCount: string,
  user: KindeUser
): Promise<{
  success: boolean;
  content?: PresentationContent;
  error?: string;
}> {
  try {
    if (!transcript?.trim()) {
      throw new Error("Transcript is required");
    }

    const cleanTranscriptResult = await processGraphQLQuery(
      client.query({
        query: GET_TRANSCRIPT_QUERY,
        variables: { data: sanitizeText(transcript) },
      }),
      "Transcript cleansing"
    );

    if (
      !cleanTranscriptResult.success ||
      !cleanTranscriptResult.data?.cleanTranscript
    ) {
      throw new Error(
        cleanTranscriptResult.error || "Failed to cleanse transcript"
      );
    }

    const cleanedTranscript = cleanTranscriptResult.data.cleanTranscript;

    const convertedArray = await convertToArray(cleanedTranscript, client);

    const [titleDescResult, improvedContent] = await Promise.all([
      processGraphQLQuery(
        client.query({
          query: GET_TITLE_AND_DESCRIPTION,
          variables: { data: JSON.stringify(convertedArray) },
        }),
        "Title and description generation"
      ),
      improveContent(convertedArray, client),
    ]);

    if (
      !titleDescResult.success ||
      !titleDescResult.data?.generateTitleAndDescription
    ) {
      throw new Error(
        titleDescResult.error || "Failed to generate title and description"
      );
    }

    const titleDesc = titleDescResult.data.generateTitleAndDescription;
    const title = titleDesc.title || "Untitled Presentation";
    const description = titleDesc.description || "No description available";

    return {
      success: true,
      content: {
        arrayOfObjects: improvedContent,
        title,
        description,
      },
    };
  } catch (error) {
    console.error("Presentation creation process failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
