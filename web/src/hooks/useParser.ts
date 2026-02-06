/**
 * useParser — Hook wrapping the client-side markdown parser
 *
 * Provides a function to parse markdown and returns the latest result.
 */

import { useState, useCallback } from 'react';
import { ParseResult } from '../types';
import { parseMarkdown } from '../parsers/markdownParser';

export interface UseParserResult {
  /** Latest parse result, or null if not yet parsed */
  result: ParseResult | null;
  /** Parse a markdown string */
  parse: (markdown: string) => ParseResult;
  /** Whether we have a result */
  parsed: boolean;
  /** Clear the result */
  clear: () => void;
}

export function useParser(): UseParserResult {
  const [result, setResult] = useState<ParseResult | null>(null);

  const parse = useCallback((markdown: string): ParseResult => {
    const r = parseMarkdown(markdown);
    setResult(r);
    return r;
  }, []);

  const clear = useCallback(() => {
    setResult(null);
  }, []);

  return { result, parse, parsed: result !== null, clear };
}
