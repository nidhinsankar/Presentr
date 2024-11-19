"use client";

import { useQuery } from "@apollo/client";
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
