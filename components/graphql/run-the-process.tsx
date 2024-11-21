"use client";

import React, { useEffect, useState } from "react";
import {
  CONTENT_ARRAY_TEXT,
  RESULT_IN_PARSE,
  TITLE_AND_DESCRIPTION,
} from "@/lib/constants";
import {
  GET_CONVERT_TO_TEXT_ARRAY,
  GET_IMPROVE_CONTENT,
  GET_TITLE_AND_DESCRIPTION,
  GET_TRANSCRIPT_QUERY,
} from "@/lib/useGraphQL";
import { useQuery } from "@apollo/client";
import { parseClean } from "@/lib/utils";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { checkAndProcess, RunCreationProcess } from "@/lib/actions";
import {
  CreatePresentationFromArrayOfObjects,
  UploadPowerpointToToUploadThing,
} from "@/lib/helpers";
import { UploadFileResult } from "uploadthing/types";
import { TitleAndDescription } from "@/types";

interface ProcessState {
  cleanedTranscript: string | null;
  textArray: any | null;
  improvedContent: any | null;
  titleDescription: any | null;
}

export default function RunTheProcess({ user }: { user: KindeUser }) {
  const [processState, setProcessState] = useState<ProcessState>({
    cleanedTranscript: null,
    textArray: null,
    improvedContent: null,
    titleDescription: null,
  });

  const [finalImprovedContent, setFinalImprovedContent] = useState([]);
  const [finalDetails, setFinalDetails] = useState<TitleAndDescription>({
    description: "",
    title: "",
  });

  // Step 1: Get cleaned transcript
  const {
    data: transcriptData,
    loading: transcriptLoading,
    error: transcriptError,
  } = useQuery(GET_TRANSCRIPT_QUERY, {
    variables: {
      data: JSON.stringify(RESULT_IN_PARSE),
    },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log("Transcript completed:", data);
      if (data?.cleanTranscript) {
        setProcessState((prev) => ({
          ...prev,
          cleanedTranscript: data.cleanTranscript,
        }));
      }
    },
    onError: (error) => {
      console.error("Transcript error:", error);
    },
  });

  // useEffect(() => {
  //   const processFinalContent = async () => {
  //     // Check if both finalImprovedContent and finalDetails are populated
  //     if (
  //       finalImprovedContent.length > 0 &&
  //       Object.keys(finalDetails).length > 0
  //     ) {
  //       try {
  //         const Presentation = await checkAndProcess(
  //           RunCreationProcess(finalImprovedContent, finalDetails),
  //           "Failed to create presentation"
  //         );

  //         console.log("presentation =>", Presentation);
  //       } catch (error) {
  //         console.error("Error processing presentation:", error);
  //         // Optional: Handle error (e.g., show error message to user)
  //       }
  //     }
  //   };

  //   processFinalContent();
  // }, [finalImprovedContent, finalDetails, user]);

  // Step 2: Convert to text array
  const {
    data: arrayData,
    loading: arrayLoading,
    error: arrayError,
    refetch: refetchArray,
  } = useQuery(GET_CONVERT_TO_TEXT_ARRAY, {
    variables: {
      text: processState.cleanedTranscript,
    },
    skip: !processState.cleanedTranscript,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log("Array conversion completed:", data);
      if (data?.convertTextToArray) {
        setProcessState((prev) => ({
          ...prev,
          textArray: data.convertTextToArray,
        }));
      }
    },
    onError: (error) => {
      console.error("Array conversion error:", error);
    },
  });

  // Step 3 & 4: Get improved content and title/description in parallel
  const {
    data: improvedData,
    loading: improvedLoading,
    error: improvedError,
    refetch: refetchImproved,
  } = useQuery(GET_IMPROVE_CONTENT, {
    variables: {
      data: processState.textArray ? processState.textArray : null,
    },
    skip: !processState.textArray,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log("Content improvement completed:", data);
      if (data?.improvePresentationContent) {
        setProcessState((prev) => ({
          ...prev,
          improvedContent: parseClean(data.improvePresentationContent),
        }));
        setFinalImprovedContent(JSON.parse(data.improvePresentationContent));
      }
      console.log(
        "improved content parse clean=>",
        JSON.parse(data.improvePresentationContent)
      );
      console.log(
        "improved content parse clean=>",
        typeof parseClean(data.improvePresentationContent)
      );
    },
    onError: (error) => {
      console.error("Content improvement error:", error);
    },
  });

  const {
    data: titleData,
    loading: titleLoading,
    error: titleError,
    refetch: refetchTitle,
  } = useQuery(GET_TITLE_AND_DESCRIPTION, {
    variables: {
      data: processState.textArray
        ? JSON.stringify(processState.textArray)
        : null,
    },
    skip: !processState.textArray,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log("Title generation completed:", data);
      if (data?.generateTitleAndDescription) {
        setProcessState((prev) => ({
          ...prev,
          titleDescription: parseClean(data.generateTitleAndDescription),
        }));
        setFinalDetails(JSON.parse(data.generateTitleAndDescription));
      }
      console.log(
        "title-and-desxcription parse clean=>",
        JSON.parse(data.generateTitleAndDescription)
      );
      console.log(
        "title-and-desxcription parse clean=>",
        typeof parseClean(data.generateTitleAndDescription)
      );
    },
    onError: (error) => {
      console.error("Title generation error:", error);
    },
  });

  // Manual retry function
  const retryProcess = async () => {
    if (!processState.textArray && processState.cleanedTranscript) {
      await refetchArray();
    }
    if (!processState.improvedContent && processState.textArray) {
      await refetchImproved();
    }
    if (!processState.titleDescription && processState.textArray) {
      await refetchTitle();
    }
  };

  const getStatusMessage = () => {
    if (transcriptLoading) return "Getting cleaned transcript...";
    if (arrayLoading) return "Converting to text array...";
    if (improvedLoading) return "Improving content...";
    if (titleLoading) return "Generating title and description...";
    return "Processing complete";
  };

  console.log("finalDescription", finalDetails);
  console.log("finalimpr0ce", finalImprovedContent);

  // Loading states
  const isLoading =
    transcriptLoading || arrayLoading || improvedLoading || titleLoading;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Blog Processing State</h2>

      {/* Status Section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">
          Current Status: {getStatusMessage()}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div
              className={`w-4 h-4 rounded-full mr-2 ${
                transcriptLoading
                  ? "bg-yellow-400"
                  : processState.cleanedTranscript
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            ></div>
            <span>
              Transcript{" "}
              {transcriptLoading
                ? "(Processing...)"
                : processState.cleanedTranscript
                ? "(Complete)"
                : ""}
            </span>
          </div>
          <div className="flex items-center">
            <div
              className={`w-4 h-4 rounded-full mr-2 ${
                arrayLoading
                  ? "bg-yellow-400"
                  : processState.textArray
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            ></div>
            <span>
              Text Array{" "}
              {arrayLoading
                ? "(Processing...)"
                : processState.textArray
                ? "(Complete)"
                : ""}
            </span>
          </div>
          <div className="flex items-center">
            <div
              className={`w-4 h-4 rounded-full mr-2 ${
                improvedLoading
                  ? "bg-yellow-400"
                  : processState.improvedContent
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            ></div>
            <span>
              Improved Content{" "}
              {improvedLoading
                ? "(Processing...)"
                : processState.improvedContent
                ? "(Complete)"
                : ""}
            </span>
          </div>
          <div className="flex items-center">
            <div
              className={`w-4 h-4 rounded-full mr-2 ${
                titleLoading
                  ? "bg-yellow-400"
                  : processState.titleDescription
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            ></div>
            <span>
              Title & Description{" "}
              {titleLoading
                ? "(Processing...)"
                : processState.titleDescription
                ? "(Complete)"
                : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(transcriptError || arrayError || improvedError || titleError) && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="text-red-700 font-semibold">Errors:</h3>
          {transcriptError && (
            <p className="text-red-600">
              Transcript: {transcriptError.message}
            </p>
          )}
          {arrayError && (
            <p className="text-red-600">
              Array Conversion: {arrayError.message}
            </p>
          )}
          {improvedError && (
            <p className="text-red-600">
              Content Improvement: {improvedError.message}
            </p>
          )}
          {titleError && (
            <p className="text-red-600">
              Title Generation: {titleError.message}
            </p>
          )}
          <button
            onClick={retryProcess}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Failed Steps
          </button>
        </div>
      )}

      {/* Current State Display */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Current State:</h3>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(processState, null, 2)}
        </pre>
      </div>
    </div>
  );
}
// "use client";

// import {
//   CONTENT_ARRAY_TEXT,
//   RESULT_IN_PARSE,
//   TITLE_AND_DESCRIPTION,
// } from "@/lib/constants";
// import {
//   GET_CONVERT_TO_TEXT_ARRAY,
//   GET_IMPROVE_CONTENT,
//   GET_TITLE_AND_DESCRIPTION,
//   GET_TRANSCRIPT_QUERY,
// } from "@/lib/useGraphQL";
// import { useQuery } from "@apollo/client";

// interface TranscriptResponse {
//   cleanTranscript: string; // Scalar type response
// }

// // Define the variables interface with correct argument name
// interface TranscriptVariables {
//   data: string; // Changed from 'input' to 'data'
// }

// export default function RunTheProcess() {
//   function GetConvertTextArray(cleanData: any) {
//     const { data, loading, error } = useQuery(GET_CONVERT_TO_TEXT_ARRAY, {
//       variables: {
//         text: JSON.stringify(cleanData), // Changed from 'input' to 'data'
//       },
//       fetchPolicy: "network-only",
//     });

//     return { data, loading, error };
//   }

//   function GetCleanedTranscript() {
//     const { data, loading, error } = useQuery<
//       TranscriptResponse,
//       TranscriptVariables
//     >(GET_TRANSCRIPT_QUERY, {
//       variables: {
//         data: JSON.stringify(RESULT_IN_PARSE), // Changed from 'input' to 'data'
//       },
//       fetchPolicy: "network-only",
//     });

//     return { data, loading, error };
//   }

//   function GetImproveContent() {
//     const { data, loading, error } = useQuery(GET_IMPROVE_CONTENT, {
//       variables: {
//         data: JSON.stringify(JSON.parse(CONTENT_ARRAY_TEXT), null, 2), // Changed from 'input' to 'data'
//       },
//       fetchPolicy: "network-only",
//     });

//     return { data, loading, error };
//   }

//   function GetTitleAndDescription() {
//     const { data, loading, error } = useQuery(GET_TITLE_AND_DESCRIPTION, {
//       variables: {
//         data: JSON.stringify(JSON.parse(TITLE_AND_DESCRIPTION), null, 2), // Changed from 'input' to 'data'
//       },
//       fetchPolicy: "network-only",
//     });

//     return { data, loading, error };
//   }
//   function GetRunTheProcess() {
//     const {
//       data: cleanData,
//       loading: cleanloading,
//       error: cleanError,
//     } = GetCleanedTranscript();

//     const {
//       data: arrayData,
//       loading: arrayLoading,
//       error: arrayError,
//     } = GetConvertTextArray(cleanData);
//     //   const {
//     //     data: improveData,
//     //     loading: improveLoading,
//     //     error: improveError,
//     //   } = GetImproveContent();
//     //   const {
//     //     data: titleData,
//     //     loading: titleLoading,
//     //     error: titleError,
//     //   } = GetTitleAndDescription();

//     return { data: arrayData };
//   }

//   const { data } = GetRunTheProcess();

//   console.log("data ru thepricess", data);

//   return (
//     <div>
//       <h2>Run the profcess</h2>
//     </div>
//   );
// }
