import logger from '../logger';

/**
 * Extracts and parses a JSON array or object from a raw LLM string response.
 * Handles markdown code blocks, trailing text, and formatting anomalies.
 */
export const extractJSON = <T = any>(rawText: string): T => {
  if (!rawText) {
    throw new Error('Input text is empty');
  }

  let cleaned = rawText.trim();

  // Remove Markdown wrapping (e.g. ```json [...] ```)
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(codeBlockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // Find start and end boundaries of the JSON block
  const firstCurly = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIndex = -1;
  let endIndex = -1;

  if (firstCurly !== -1 && (firstBracket === -1 || firstCurly < firstBracket)) {
    // Looks like an object
    startIndex = firstCurly;
    endIndex = cleaned.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    // Looks like an array
    startIndex = firstBracket;
    endIndex = cleaned.lastIndexOf(']');
  }

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    // Fallback: try parsing directly
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      logger.error('Failed to locate JSON boundaries in text: ', { rawText });
      throw new Error('No valid JSON object or array found in LLM response');
    }
  }

  const jsonSubstring = cleaned.slice(startIndex, endIndex + 1);

  try {
    return JSON.parse(jsonSubstring) as T;
  } catch (error: any) {
    logger.error('JSON parsing failure after boundary extraction:', {
      extracted: jsonSubstring,
      error: error.message,
    });
    throw new Error(`Failed to parse extracted JSON block: ${error.message}`);
  }
};
