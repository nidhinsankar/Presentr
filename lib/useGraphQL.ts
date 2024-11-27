"use client";

import { ApolloClient, ApolloError, gql, useQuery } from "@apollo/client";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { DocumentNode } from "graphql";

export function useGraphQLQuery<T = any>(
  query: DocumentNode,
  variables?: Record<string, any>
) {
  const { data, loading, error } = useQuery<T>(query, {
    variables,
  });

  return { data, loading, error };
}

export const GET_TRANSCRIPT_QUERY = gql`
  query GetTranscript($data: String!) {
    cleanTranscript(data: $data) # Changed from 'input' to 'data'
  }
`;
export const GET_CONVERT_TO_TEXT_ARRAY = gql`
  query GetTextToArray($text: String!, $slideCount: String!) {
    convertTextToArray(text: $text, slideCount: $slideCount)
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

// interface ProcessResult<T> {
//   success: boolean;
//   data?: T;
//   error?: string;
// }

// async function processGraphQLQuery<T>(
//   queryFn: Promise<any>,
//   errorMessage: string
// ): Promise<ProcessResult<T>> {
//   try {
//     const response = await queryFn;
//     if (!response?.data) {
//       return { success: false, error: `${errorMessage}: No data returned` };
//     }
//     return { success: true, data: response.data };
//   } catch (error) {
//     const errorDetails =
//       error instanceof ApolloError ? error.message : "Unknown error occurred";
//     return { success: false, error: `${errorMessage}: ${errorDetails}` };
//   }
// }

// export async function runGraphQLPresentationCreationProcess(
//   client: ApolloClient<any>,
//   transcript: string,
//   slideCount: string,
//   user: KindeUser
// ) {
//   try {
//     // Step 1: Clean transcript
//     const cleanTranscriptResult = await processGraphQLQuery(
//       client.query({
//         query: GET_TRANSCRIPT_QUERY,
//         variables: { data: transcript },
//       }),
//       "Failed to cleanse transcript"
//     );

//     if (
//       !cleanTranscriptResult.success ||
//       !cleanTranscriptResult.data?.cleanTranscript
//     ) {
//       throw new Error(
//         cleanTranscriptResult.error || "Failed to cleanse transcript"
//       );
//     }

//     console.log("clean-transcript=>", cleanTranscriptResult);

//     // Step 2: Convert to array
//     const convertToArrayResult = await processGraphQLQuery(
//       client.query({
//         query: GET_CONVERT_TO_TEXT_ARRAY,
//         variables: { text: cleanTranscriptResult.data?.cleanTranscript },
//       }),
//       "Failed to convert text to array"
//     );

//     if (
//       !convertToArrayResult.success ||
//       !convertToArrayResult.data?.convertTextToArray
//     ) {
//       throw new Error(
//         convertToArrayResult.error || "Failed to convert text to array"
//       );
//     }

//     console.log("converttexttoarray =>", convertToArrayResult);

//     // Step 3: Run title/description and content improvement in parallel
//     const [titleDescResult, improveContentResult] = await Promise.all([
//       processGraphQLQuery(
//         client.query({
//           query: GET_TITLE_AND_DESCRIPTION,
//           variables: {
//             data: JSON.stringify(convertToArrayResult.data.convertTextToArray),
//           },
//         }),
//         "Failed to generate title and description"
//       ),
//       processGraphQLQuery(
//         client.query({
//           query: GET_IMPROVE_CONTENT,
//           variables: {
//             data: JSON.stringify(convertToArrayResult.data.convertTextToArray),
//           },
//         }),
//         "Failed to improve presentation content"
//       ),
//     ]);

//     // Check results
//     if (
//       !titleDescResult.success ||
//       !titleDescResult.data?.generateTitleAndDescription
//     ) {
//       throw new Error(
//         titleDescResult.error || "Failed to generate title and description"
//       );
//     }

//     if (
//       !improveContentResult.success ||
//       !improveContentResult.data?.improvePresentationContent
//     ) {
//       throw new Error(
//         improveContentResult.error || "Failed to improve content"
//       );
//     }

//     // Prepare final data structure
//     const finalContent = {
//       arrayOfObjects: JSON.parse(
//         improveContentResult.data?.improvePresentationContent
//       ),
//       title: JSON.parse(titleDescResult.data?.generateTitleAndDescription)
//         .title,
//       description: JSON.parse(titleDescResult.data?.generateTitleAndDescription)
//         .description,
//     };

//     // Create presentation
//     // const presentationResult = await CreatePresentationFromArrayOfObjects(finalContent, user);
//     console.log("final result", finalContent);

//     return {
//       success: true,
//       // presentationPath: presentationResult.filePath,
//       // presentationName: presentationResult.fileName,
//       content: finalContent,
//     };
//   } catch (error) {
//     console.error("Presentation creation process failed:", error);
//     return {
//       success: false,
//       error:
//         error instanceof Error
//           ? error.message
//           : "Unknown error occurred during presentation creation",
//     };
//   }
// }
