"use client";

import React, { useEffect, useState } from "react";
import { RESULT_IN_PARSE, TITLE_AND_DESCRIPTION } from "@/lib/constants";
import {
  GET_CONVERT_TO_TEXT_ARRAY,
  GET_IMPROVE_CONTENT,
  GET_TITLE_AND_DESCRIPTION,
  GET_TRANSCRIPT_QUERY,
} from "@/lib/useGraphQL";
import { useQuery } from "@apollo/client";
import { parseClean } from "@/lib/utils";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { checkAndProcess } from "@/lib/actions";
import { CheckVideoDetails, ParseXML } from "@/lib/helpers";
import { RunCreationProcess } from "@/lib/actions";
import { Tips, TitleAndDescription } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { tips } from "@/data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProcessState {
  isSubmitting: boolean;
  error: string | null;
  cleanedTranscript: string | null;
  parsedTranscript: string | null;
  textArray: any | null;
  improvedContent: any | null;
  titleDescription: any | null;
}

interface RunTheProcessProps {
  user: KindeUser;
}

export default function RunTheProcess({ user }: RunTheProcessProps) {
  const [processState, setProcessState] = useState<ProcessState>({
    isSubmitting: false,
    error: null,
    cleanedTranscript: null,
    parsedTranscript: null,
    textArray: null,
    improvedContent: null,
    titleDescription: null,
  });

  const [finalImprovedContent, setFinalImprovedContent] = useState([]);
  const [finalDetails, setFinalDetails] = useState<TitleAndDescription>({
    description: "",
    title: "",
  });
  const [videoID, setVideoID] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  // Validation function
  const validateInput = (formData: FormData) => {
    const link = formData.get("link");
    const brandColour = formData.get("brandColour");
    let slideCount = formData.get("slideCount");

    if (!link) {
      throw new Error("Link is required");
    }

    // Validate brand colour if provided
    if (brandColour) {
      const isHex = /^#[0-9A-F]{6}$/i.test(brandColour.toString());
      if (!isHex) {
        throw new Error("Invalid hex colour");
      }
    }

    // Validate and set default slide count
    if (!slideCount || parseInt(slideCount as string) > 20) {
      slideCount = "5";
    }

    // YouTube URL validation regex
    const validLinkRegex =
      /^(http(s)?:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_]+)$/;
    const isValidUrl = validLinkRegex.test(link as string);

    if (!isValidUrl) {
      throw new Error("Invalid YouTube URL");
    }

    return {
      link: link.toString(),
      brandColour: brandColour?.toString() || null,
      slideCount: parseInt(slideCount as string),
    };
  };

  // Submit handler
  const handleSubmit = async (formData: FormData) => {
    // Reset previous state
    setProcessState({
      isSubmitting: true,
      cleanedTranscript: null,
      error: null,
      parsedTranscript: null,
      textArray: null,
      improvedContent: null,
      titleDescription: null,
    });

    toast({
      title: "Starting Process",
      description: "Validating YouTube link and fetching video details...",
    });

    try {
      // Validate inputs
      const { link, brandColour, slideCount } = validateInput(formData);

      // Extract video ID
      const id = link.split("v=")[1];

      if (!id) {
        throw new Error("Invalid YouTube URL");
      }
      setVideoID(id);
      // Check video details
      const videoDetails = await checkAndProcess(
        CheckVideoDetails(id),
        "Failed to get video length"
      );
      console.log("video lenght", videoDetails);

      // Validate video length
      if (videoDetails.lengthSeconds > 1800) {
        throw new Error(
          "Video is too long. Video needs to be shorter than 30 minutes."
        );
      }

      // Find English subtitles
      const englishSubtitls = videoDetails.subtitles.subtitles.find(
        (sub: { languageCode: string }) => sub.languageCode === "en"
      );

      if (!englishSubtitls) {
        throw new Error("No English subtitles found");
      }

      // Parse transcript
      const parsedTranscript = await checkAndProcess(
        ParseXML(englishSubtitls.url),
        "Failed to parse transcript"
      );

      // Update state with parsed transcript
      setProcessState((prev) => ({
        ...prev,
        parsedTranscript: JSON.stringify(parsedTranscript),
      }));
      toast({
        title: "Parsed transcript",
        description: "Successfully parsed the video transcriptions.",
      });
    } catch (error) {
      // Handle any errors during submission
      setProcessState((prev) => ({
        ...prev,
        isSubmitting: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message,
      });
    }
  };

  const {
    data: transcriptData,
    loading: transcriptLoading,
    error: transcriptError,
  } = useQuery(GET_TRANSCRIPT_QUERY, {
    variables: {
      data: processState.parsedTranscript,
    },
    skip: !processState.parsedTranscript,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log("Transcript completed:", data);
      if (data?.cleanTranscript) {
        setProcessState((prev) => ({
          ...prev,
          cleanedTranscript: data.cleanTranscript,
        }));
      }
      toast({
        title: "Transcript Cleaned",
        description: "Successfully cleaned and processed the transcript.",
      });
    },
    onError: (error) => {
      console.error("Transcript error:", error);
      toast({
        variant: "destructive",
        title: "Transcript Error",
        description: error.message,
      });
    },
  });

  // Step 1: Convert parsed transcript to text array
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
      toast({
        title: "Text Converted",
        description: "Successfully converted transcript to structured format.",
      });
    },
    onError: (error) => {
      console.error("Array conversion error:", error);
      toast({
        variant: "destructive",
        title: "Conversion Error",
        description: error.message,
      });
    },
  });

  // Step 2: Get improved content
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
        const parsedContent = parseClean(data.improvePresentationContent);
        setProcessState((prev) => ({
          ...prev,
          improvedContent: parsedContent,
        }));
        setFinalImprovedContent(JSON.parse(data.improvePresentationContent));
      }
      toast({
        title: "Content Improved",
        description: "Successfully enhanced presentation content.",
      });
    },
    onError: (error) => {
      console.error("Content improvement error:", error);
      toast({
        variant: "destructive",
        title: "Content Improvement Error",
        description: error.message,
      });
    },
  });

  // Step 3: Get title and description
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
        const parsedTitleDesc = parseClean(data.generateTitleAndDescription);
        setProcessState((prev) => ({
          ...prev,
          titleDescription: parsedTitleDesc,
        }));
        setFinalDetails(JSON.parse(data.generateTitleAndDescription));
      }
      toast({
        title: "Title Generated",
        description: "Successfully generated title and description.",
      });
    },
    onError: (error) => {
      console.error("Title generation error:", error);
      toast({
        variant: "destructive",
        title: "Title Generation Error",
        description: error.message,
      });
    },
  });

  // Final presentation creation
  useEffect(() => {
    const processFinalContent = async () => {
      // Check if both finalImprovedContent and finalDetails are populated
      if (
        finalImprovedContent.length > 0 &&
        Object.keys(finalDetails).length > 0 &&
        videoID !== ""
      ) {
        try {
          const Presentation = await checkAndProcess(
            RunCreationProcess(finalImprovedContent, finalDetails, videoID),
            "Failed to create presentation"
          );
          toast({
            title: "Success!",
            description: "Your presentation has been created successfully.",
          });
          router.push("/dashboard");
        } catch (error) {
          console.error("Error processing presentation:", error);
          toast({
            variant: "destructive",
            title: "Creation Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to create presentation",
          });
        }
      }
    };

    processFinalContent();
  }, [finalImprovedContent, finalDetails, user]);

  // Manual retry function
  const retryProcess = async () => {
    if (!processState.textArray && processState.parsedTranscript) {
      await refetchArray();
    }
    if (!processState.improvedContent && processState.textArray) {
      await refetchImproved();
    }
    if (!processState.titleDescription && processState.textArray) {
      await refetchTitle();
    }
  };

  // Loading and status tracking
  const isLoading =
    processState.isSubmitting ||
    arrayLoading ||
    improvedLoading ||
    titleLoading;

  const getStatusMessage = () => {
    if (processState.isSubmitting) return "Submitting YouTube link...";
    if (arrayLoading) return "Converting to text array...";
    if (improvedLoading) return "Improving content...";
    if (titleLoading) return "Generating title and description...";
    return "Processing complete";
  };

  return (
    <div className="mt-16">
      <div className="w-full p-6 max-w-3xl">
        <h2 className="text-2xl font-bold text-center text-gradient">
          Hi, {user?.given_name}! Enter A YouTube URL. We will generate an
          amazing presentation for you!
        </h2>
        <p className="text-center text-gray-500 mt-4">
          Make sure you follow all the tips below before submitting the video
          URL.
        </p>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips?.map((tip: Tips) => (
            <div
              className="p-4 rounded-lg mt-4 border border-gray-300 bg-white"
              key={tip.icon}
            >
              <p className="text-gray-900">{tip.description}</p>
              <div className="text-2xl mt-2">{tip.icon}</div>
            </div>
          ))}
        </div>

        {/* Form Section */}
        <div className="mt-8">
          <form action={handleSubmit} className="flex flex-col gap-4">
            <Input
              placeholder="Enter YouTube URL"
              className="w-full p-8 text-gray-400 bg-white rounded-lg focus:outline-none"
              type="text"
              name="link"
              required
            />

            <Input
              placeholder="Your brand colour (Optional)"
              className="w-full p-8 text-gray-400 bg-white rounded-lg focus:outline-none"
              type="text"
              name="brandColour"
            />

            <Select name="slideCount">
              <SelectTrigger className="w-full text-gray-400 bg-white rounded-lg focus:outline-none px-8 border border-gray-200 h-16">
                <SelectValue placeholder="How many slides do you want approximately?" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="5">5 (minimum)</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20 (maximum)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Status Indicators */}
            {(isLoading || processState.parsedTranscript) && (
              <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-4 text-gray-800">
                  Status: {getStatusMessage()}
                </h3>
                <div className="space-y-3">
                  <StatusIndicator
                    isActive={processState.isSubmitting}
                    isComplete={processState.parsedTranscript !== null}
                    label="YouTube Link Processing"
                  />
                  <StatusIndicator
                    isActive={arrayLoading}
                    isComplete={processState.textArray !== null}
                    label="Content Analysis"
                  />
                  <StatusIndicator
                    isActive={improvedLoading}
                    isComplete={processState.improvedContent !== null}
                    label="Content Enhancement"
                  />
                  <StatusIndicator
                    isActive={titleLoading}
                    isComplete={processState.titleDescription !== null}
                    label="Finalizing Presentation"
                  />
                </div>
              </div>
            )}

            {/* Error Display */}
            {(processState.error ||
              arrayError ||
              improvedError ||
              titleError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <div className="text-red-800">
                  {processState.error && <p>{processState.error}</p>}
                  {arrayError && <p>{arrayError.message}</p>}
                  {improvedError && <p>{improvedError.message}</p>}
                  {titleError && <p>{titleError.message}</p>}
                </div>
                {(arrayError || improvedError || titleError) && (
                  <button
                    onClick={retryProcess}
                    className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Retry Failed Steps
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-4 rounded-lg font-semibold text-white transition-colors ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              {isLoading ? "Processing..." : "Generate Presentation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Helper component for status indicators
const StatusIndicator = ({
  isActive,
  isComplete,
  label,
}: {
  isActive: boolean;
  isComplete: boolean;
  label: string;
}) => (
  <div className="flex items-center space-x-3">
    <div
      className={`w-4 h-4 rounded-full transition-colors ${
        isActive ? "bg-yellow-400" : isComplete ? "bg-green-500" : "bg-gray-200"
      }`}
    />
    <span className="text-gray-700">
      {label}{" "}
      {isActive ? (
        <span className="text-yellow-600">(Processing...)</span>
      ) : isComplete ? (
        <span className="text-green-600">(Complete)</span>
      ) : (
        ""
      )}
    </span>
  </div>
);

// {/* <div className="p-4">
//       {/* Form Section */}
//       <form action={handleSubmit} className="space-y-4 mb-6">
//         <div>
//           <label
//             htmlFor="link"
//             className="block text-sm font-medium text-gray-700"
//           >
//             YouTube Video Link
//           </label>
//           <input
//             type="text"
//             id="link"
//             name="link"
//             required
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
//             placeholder="Enter YouTube video URL"
//           />
//         </div>

//         <div>
//           <label
//             htmlFor="brandColour"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Brand Colour (Optional)
//           </label>
//           <input
//             type="text"
//             id="brandColour"
//             name="brandColour"
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
//             placeholder="#HEXCOLOR"
//           />
//         </div>

//         <div>
//           <label
//             htmlFor="slideCount"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Number of Slides (Max 20)
//           </label>
//           <input
//             type="number"
//             id="slideCount"
//             name="slideCount"
//             min="1"
//             max="20"
//             defaultValue="5"
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={isLoading}
//           className={`w-full px-4 py-2 rounded-md ${
//             isLoading
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-blue-500 hover:bg-blue-600 text-white"
//           }`}
//         >
//           {isLoading ? "Processing..." : "Generate Presentation"}
//         </button>
//       </form>

//       {/* Error Display */}
//       {processState.error && (
//         <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded">
//           <p className="text-red-700">{processState.error}</p>
//         </div>
//       )}

//       {/* Status Section */}
//       <div className="mb-6">
//         <h3 className="font-semibold mb-2">
//           Current Status: {getStatusMessage()}
//         </h3>
//         <div className="space-y-2">
//           <div className="flex items-center">
//             <div
//               className={`w-4 h-4 rounded-full mr-2 ${
//                 processState.isSubmitting
//                   ? "bg-yellow-400"
//                   : processState.parsedTranscript
//                   ? "bg-green-500"
//                   : "bg-gray-300"
//               }`}
//             ></div>
//             <span>
//               YouTube Link{" "}
//               {processState.isSubmitting
//                 ? "(Processing...)"
//                 : processState.parsedTranscript
//                 ? "(Complete)"
//                 : ""}
//             </span>
//           </div>
//           <div className="flex items-center">
//             <div
//               className={`w-4 h-4 rounded-full mr-2 ${
//                 arrayLoading
//                   ? "bg-yellow-400"
//                   : processState.textArray
//                   ? "bg-green-500"
//                   : "bg-gray-300"
//               }`}
//             ></div>
//             <span>
//               Text Array{" "}
//               {arrayLoading
//                 ? "(Processing...)"
//                 : processState.textArray
//                 ? "(Complete)"
//                 : ""}
//             </span>
//           </div>
//           <div className="flex items-center">
//             <div
//               className={`w-4 h-4 rounded-full mr-2 ${
//                 improvedLoading
//                   ? "bg-yellow-400"
//                   : processState.improvedContent
//                   ? "bg-green-500"
//                   : "bg-gray-300"
//               }`}
//             ></div>
//             <span>
//               Improved Content{" "}
//               {improvedLoading
//                 ? "(Processing...)"
//                 : processState.improvedContent
//                 ? "(Complete)"
//                 : ""}
//             </span>
//           </div>
//           <div className="flex items-center">
//             <div
//               className={`w-4 h-4 rounded-full mr-2 ${
//                 titleLoading
//                   ? "bg-yellow-400"
//                   : processState.titleDescription
//                   ? "bg-green-500"
//                   : "bg-gray-300"
//               }`}
//             ></div>
//             <span>
//               Title & Description{" "}
//               {titleLoading
//                 ? "(Processing...)"
//                 : processState.titleDescription
//                 ? "(Complete)"
//                 : ""}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Retry Button */}
//       {(arrayError || improvedError || titleError) && (
//         <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded">
//           <h3 className="text-red-700 font-semibold">Errors:</h3>
//           {arrayError && (
//             <p className="text-red-600">
//               Array Conversion: {arrayError.message}
//             </p>
//           )}
//           {improvedError && (
//             <p className="text-red-600">
//               Content Improvement: {improvedError.message}
//             </p>
//           )}
//           {titleError && (
//             <p className="text-red-600">
//               Title Generation: {titleError.message}
//             </p>
//           )}
//           <button
//             onClick={retryProcess}
//             className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             Retry Failed Steps
//           </button>
//         </div>
//       )}

//       <div className="mt-4">
//         <h3 className="font-semibold mb-2">Current State:</h3>
//         <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
//           {JSON.stringify(processState, null, 2)}
//         </pre>
//       </div>
//     </div> */}
