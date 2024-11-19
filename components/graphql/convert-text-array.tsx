"use client";
import { CONTENT_ARRAY_TEXT, CONVERT_TEXT_ARRAY } from "@/lib/constants";
import { gql, useQuery } from "@apollo/client";

const GET_CONVERT_TO_TEXT_ARRAY = gql`
  query GetTextToArray($text: String!) {
    convertTextToArray(text: $text)
  }
`;

export default function ConvertTextToArray() {
  const { data, loading, error } = useQuery(GET_CONVERT_TO_TEXT_ARRAY, {
    variables: {
      text: JSON.stringify(CONVERT_TEXT_ARRAY), // Changed from 'input' to 'data'
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

  console.log("data text to array content", data.convertTextToArray);

  // Success state
  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Modus GraphQL</h3>
      {data?.convertTextToArray && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <h4 className="font-semibold">Cleaned Transcript:</h4>
          </div>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
            {data.convertTextToArray}
          </pre>
        </div>
      )}
    </div>
  );
}
