"use client";

import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { runGraphQLPresentationCreationProcess } from "@/lib/presentation-graphql";

const PresentationCreator = () => {
  const [transcriptText, setTranscriptText] = useState("");
  const [slideCount, setSlideCount] = useState("3");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const client = useApolloClient();
  const { user } = useKindeAuth();
  console.log("transcript", transcriptText);
  console.log("user", user);

  const handleCreatePresentation = async () => {
    // if (!transcriptText || !user) return;

    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const presentationResult = await runGraphQLPresentationCreationProcess(
        client,
        transcriptText,
        slideCount,
        user
      );

      if (presentationResult.success) {
        setStatus("success");
        setResult(presentationResult);
      } else {
        setStatus("error");
        setError(presentationResult.error || "Failed to create presentation");
      }
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Test Presentation Creation</h1>

        {/* Input for transcript */}
        <div className="space-y-2">
          <label className="block font-medium">Transcript Text:</label>
          <textarea
            className="w-full h-40 p-2 border rounded-md"
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            placeholder="Enter your transcript text here..."
          />
        </div>

        {/* Input for slide count */}
        <div className="space-y-2">
          <label className="block font-medium">Number of Slides:</label>
          <input
            type="number"
            className="w-full p-2 border rounded-md"
            value={slideCount}
            onChange={(e) => setSlideCount(e.target.value)}
            min="1"
            max="20"
          />
        </div>

        {/* Create button */}
        <button
          onClick={handleCreatePresentation}
          disabled={status === "loading" || !transcriptText}
          className={`px-4 py-2 rounded-md ${
            status === "loading"
              ? "bg-gray-400"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {status === "loading" ? "Creating..." : "Create Presentation"}
        </button>

        {/* Status and results display */}
        {status === "loading" && (
          <div className="p-4 bg-blue-50 rounded-md">
            Processing presentation...
          </div>
        )}

        {status === "error" && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            Error: {error}
          </div>
        )}

        {status === "success" && result && (
          <div className="p-4 bg-green-50 rounded-md space-y-4">
            <h2 className="font-bold text-green-700">
              Presentation Created Successfully!
            </h2>
            <div className="space-y-2">
              <p>
                <strong>File Name:</strong> {result.presentationName}
              </p>
              <p>
                <strong>Title:</strong> {result.content.title}
              </p>
              <p>
                <strong>Description:</strong> {result.content.description}
              </p>

              <div className="mt-4">
                <h3 className="font-bold mb-2">Content Preview:</h3>
                <pre className="bg-white p-4 rounded-md overflow-auto max-h-60">
                  {JSON.stringify(result.content.arrayOfObjects, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationCreator;
