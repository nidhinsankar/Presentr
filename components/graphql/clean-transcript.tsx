"use client";
import { gql, useQuery } from "@apollo/client";
import { RESULT_IN_PARSE } from "@/lib/constants";

// Define the TypeScript interface for the query response
interface TranscriptResponse {
  cleanTranscript: string; // Scalar type response
}

// Define the variables interface with correct argument name
interface TranscriptVariables {
  data: string; // Changed from 'input' to 'data'
}

// Corrected query with proper argument name
const GET_TRANSCRIPT_QUERY = gql`
  query GetTranscript($data: String!) {
    cleanTranscript(data: $data) # Changed from 'input' to 'data'
  }
`;

export default function CleanTranscript() {
  const { data, loading, error } = useQuery<
    TranscriptResponse,
    TranscriptVariables
  >(GET_TRANSCRIPT_QUERY, {
    variables: {
      data: JSON.stringify(RESULT_IN_PARSE), // Changed from 'input' to 'data'
    },
    fetchPolicy: "network-only",
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <p>Loading...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 p-4">
        <h3 className="font-bold">Error Details:</h3>
        <p>{error.message}</p>
        {error.graphQLErrors?.map((err, index) => (
          <p key={index}>GraphQL Error: {err.message}</p>
        ))}
        {error.networkError && (
          <p>Network Error: {error.networkError.message}</p>
        )}
      </div>
    );
  }

  console.log("data", data);

  // Success state
  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Modus GraphQL</h3>
      {data?.cleanTranscript && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <h4 className="font-semibold">Cleaned Transcript:</h4>
          </div>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
            {typeof data.cleanTranscript === "string" && data.cleanTranscript}
          </pre>
        </div>
      )}
    </div>
  );
}
