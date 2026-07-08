import { LLMProvider, LLMProviderName } from '../../types';
import config from '../../config';
import GeminiProvider from './GeminiProvider';
import { AppError } from '../../middleware/errorHandler';

export class LLMProviderFactory {
  public static getProvider(name?: LLMProviderName): LLMProvider {
    const providerName = name || config.llmProvider;

    switch (providerName) {
      case 'gemini':
        return new GeminiProvider();
      case 'openai':
      case 'claude':
        // Fallback or future provider expansions can be easily wired here.
        // For this assignment, we use Gemini as the primary fully implemented provider.
        throw new AppError(
          `LLM Provider [${providerName}] is not yet fully configured or supported in this workspace. Please use 'gemini'.`,
          501,
          'PROVIDER_NOT_IMPLEMENTED'
        );
      default:
        throw new AppError(`Unknown LLM provider specified: [${providerName}]`, 400, 'INVALID_PROVIDER_NAME');
    }
  }
}

export default LLMProviderFactory;
