import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider } from '../../types';
import config from '../../config';
import logger from '../../logger';
import { AppError } from '../../middleware/errorHandler';

export class GeminiProvider implements LLMProvider {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    if (!config.aiApiKey) {
      throw new AppError('Gemini API key is not configured', 500, 'PROVIDER_CONFIG_ERROR');
    }
    this.genAI = new GoogleGenerativeAI(config.aiApiKey);
    this.modelName = config.aiModelName || 'gemini-2.0-flash';
  }

  async extractBatch(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      logger.debug(`Sending request to Gemini model [${this.modelName}]`);
      
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemPrompt,
      });

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: config.aiTemperature,
          maxOutputTokens: config.aiMaxTokens,
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingBudget: 0,
          },
        } as any,
      });

      const resultText = response.response.text();
      if (!resultText) {
        throw new AppError('Empty response returned from Gemini API', 502, 'EMPTY_PROVIDER_RESPONSE');
      }

      return resultText;
    } catch (error: any) {
      logger.error('Gemini API failure:', { error: error.message || error });
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Gemini API Error: ${error.message || 'Unknown provider error'}`,
        502,
        'PROVIDER_CALL_FAILED'
      );
    }
  }
}

export default GeminiProvider;
