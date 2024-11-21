import { useQuery } from "@apollo/client";
import {
  GET_CONVERT_TO_TEXT_ARRAY,
  GET_IMPROVE_CONTENT,
  GET_TITLE_AND_DESCRIPTION,
  GET_TRANSCRIPT_QUERY,
} from "./useGraphQL";
import {
  CONTENT_ARRAY_TEXT,
  CONVERT_TEXT_ARRAY,
  RESULT_IN_PARSE,
  TITLE_AND_DESCRIPTION,
} from "./constants";

// Define the TypeScript interface for the query response
interface TranscriptResponse {
  cleanTranscript: string; // Scalar type response
}

// Define the variables interface with correct argument name
interface TranscriptVariables {
  data: string; // Changed from 'input' to 'data'
}

export function GetConvertTextArray(cleanData: any) {
  const { data, loading, error } = useQuery(GET_CONVERT_TO_TEXT_ARRAY, {
    variables: {
      text: JSON.stringify(cleanData), // Changed from 'input' to 'data'
    },
    fetchPolicy: "network-only",
  });

  return { data, loading, error };
}

export function GetCleanedTranscript() {
  const { data, loading, error } = useQuery<
    TranscriptResponse,
    TranscriptVariables
  >(GET_TRANSCRIPT_QUERY, {
    variables: {
      data: JSON.stringify(RESULT_IN_PARSE), // Changed from 'input' to 'data'
    },
    fetchPolicy: "network-only",
  });

  return { data, loading, error };
}

export function GetImproveContent() {
  const { data, loading, error } = useQuery(GET_IMPROVE_CONTENT, {
    variables: {
      data: JSON.stringify(JSON.parse(CONTENT_ARRAY_TEXT), null, 2), // Changed from 'input' to 'data'
    },
    fetchPolicy: "network-only",
  });

  return { data, loading, error };
}

export function GetTitleAndDescription() {
  const { data, loading, error } = useQuery(GET_TITLE_AND_DESCRIPTION, {
    variables: {
      data: JSON.stringify(JSON.parse(TITLE_AND_DESCRIPTION), null, 2), // Changed from 'input' to 'data'
    },
    fetchPolicy: "network-only",
  });

  return { data, loading, error };
}

export function RunTheProcess() {
  const {
    data: cleanData,
    loading: cleanloading,
    error: cleanError,
  } = GetCleanedTranscript();
  const {
    data: arrayData,
    loading: arrayLoading,
    error: arrayError,
  } = GetConvertTextArray(cleanData);
  //   const {
  //     data: improveData,
  //     loading: improveLoading,
  //     error: improveError,
  //   } = GetImproveContent();
  //   const {
  //     data: titleData,
  //     loading: titleLoading,
  //     error: titleError,
  //   } = GetTitleAndDescription();

  return { data: arrayData };
}
