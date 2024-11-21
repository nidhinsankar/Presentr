import { CONTENT_ARRAY_TEXT } from "@/lib/constants";
import { GetImproveContent } from "@/lib/presentation";
import { GET_IMPROVE_CONTENT } from "@/lib/useGraphQL";
import { gql, useQuery } from "@apollo/client";

export default function ImproveContent() {
  // const { data, loading, error } = useQuery(GET_IMPROVE_CONTENT, {
  //   variables: {
  //     data: JSON.stringify(JSON.parse(CONTENT_ARRAY_TEXT), null, 2), // Changed from 'input' to 'data'
  //   },
  //   fetchPolicy: "network-only",
  // });

  const { data, loading, error } = GetImproveContent();
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

  console.log("data improve content", data);

  // Success state
  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Modus GraphQL</h3>
      {data?.improvePresentationContent && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <h4 className="font-semibold">Cleaned Transcript:</h4>
          </div>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
            {typeof data.improvePresentationContent === "string" &&
              data.improvePresentationContent}
          </pre>
        </div>
      )}
    </div>
  );
}
