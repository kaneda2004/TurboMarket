import OpenAI from 'openai';

interface OpenAIConfig {
  apiKey?: string;
  organization?: string;
  baseURL?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
      detail?: 'low' | 'high' | 'auto';
    };
  }>;
}

interface ImageGenerationOptions {
  model?: 'dall-e-2' | 'dall-e-3';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  response_format?: 'url' | 'b64_json';
  n?: number;
}

interface ImageGenerationResponse {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

interface CompletionResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  finish_reason: string;
}

interface StreamResponse {
  content: string;
  done: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  private client: OpenAI;

  constructor(config: OpenAIConfig = {}) {
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      organization: config.organization || process.env.OPENAI_ORGANIZATION,
      baseURL: config.baseURL,
    });
  }

  async generateText(
    messages: ChatMessage[],
    options: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stream?: false;
    } = {}
  ): Promise<CompletionResponse> {
    const {
      model = 'gpt-4o',
      max_tokens = 4096,
      temperature = 0.7,
      top_p = 1,
      frequency_penalty = 0,
      presence_penalty = 0,
    } = options;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        max_tokens,
        temperature,
        top_p,
        frequency_penalty,
        presence_penalty,
        stream: false,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error('No content in response');
      }

      return {
        content: choice.message.content,
        usage: {
          prompt_tokens: response.usage?.prompt_tokens || 0,
          completion_tokens: response.usage?.completion_tokens || 0,
          total_tokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
        finish_reason: choice.finish_reason || 'unknown',
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *streamText(
    messages: ChatMessage[],
    options: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
    } = {}
  ): AsyncGenerator<StreamResponse, void, unknown> {
    const {
      model = 'gpt-4o',
      max_tokens = 4096,
      temperature = 0.7,
      top_p = 1,
      frequency_penalty = 0,
      presence_penalty = 0,
    } = options;

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        max_tokens,
        temperature,
        top_p,
        frequency_penalty,
        presence_penalty,
        stream: true,
      });

      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        
        if (choice?.delta?.content) {
          yield {
            content: choice.delta.content,
            done: false,
          };
        }

        if (choice?.finish_reason) {
          yield {
            content: '',
            done: true,
            usage: chunk.usage ? {
              prompt_tokens: chunk.usage.prompt_tokens,
              completion_tokens: chunk.usage.completion_tokens,
              total_tokens: chunk.usage.total_tokens,
            } : undefined,
          };
        }
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw new Error(`Failed to stream text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenerationResponse[]> {
    const {
      model = 'dall-e-3',
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
      response_format = 'url',
      n = 1,
    } = options;

    try {
      const response = await this.client.images.generate({
        model,
        prompt,
        size,
        quality: model === 'dall-e-3' ? quality : undefined,
        style: model === 'dall-e-3' ? style : undefined,
        response_format,
        n: model === 'dall-e-3' ? 1 : n, // DALL-E 3 only supports n=1
      });

      return response.data.map(image => ({
        url: image.url,
        b64_json: image.b64_json,
        revised_prompt: image.revised_prompt,
      }));
    } catch (error) {
      console.error('OpenAI image generation error:', error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeImage(
    imageUrl: string,
    prompt: string = "What do you see in this image?",
    options: {
      model?: string;
      max_tokens?: number;
      detail?: 'low' | 'high' | 'auto';
    } = {}
  ): Promise<CompletionResponse> {
    const {
      model = 'gpt-4o',
      max_tokens = 4096,
      detail = 'auto',
    } = options;

    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail,
            },
          },
        ],
      },
    ];

    return this.generateText(messages, { model, max_tokens });
  }

  async generateEmbeddings(
    input: string | string[],
    options: {
      model?: string;
      encoding_format?: 'float' | 'base64';
      dimensions?: number;
    } = {}
  ): Promise<{ embeddings: number[][]; usage: { prompt_tokens: number; total_tokens: number } }> {
    const {
      model = 'text-embedding-3-small',
      encoding_format = 'float',
      dimensions,
    } = options;

    try {
      const response = await this.client.embeddings.create({
        model,
        input,
        encoding_format,
        dimensions,
      });

      return {
        embeddings: response.data.map(item => item.embedding),
        usage: {
          prompt_tokens: response.usage.prompt_tokens,
          total_tokens: response.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('OpenAI embeddings error:', error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async moderateContent(input: string): Promise<{
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }> {
    try {
      const response = await this.client.moderations.create({
        input,
      });

      const result = response.results[0];
      return {
        flagged: result.flagged,
        categories: result.categories,
        category_scores: result.category_scores,
      };
    } catch (error) {
      console.error('OpenAI moderation error:', error);
      throw new Error(`Failed to moderate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transcribeAudio(
    audioFile: File,
    options: {
      model?: string;
      language?: string;
      prompt?: string;
      response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
      temperature?: number;
    } = {}
  ): Promise<{ text: string }> {
    const {
      model = 'whisper-1',
      language,
      prompt,
      response_format = 'json',
      temperature,
    } = options;

    try {
      const response = await this.client.audio.transcriptions.create({
        file: audioFile,
        model,
        language,
        prompt,
        response_format,
        temperature,
      });

      return { text: typeof response === 'string' ? response : response.text };
    } catch (error) {
      console.error('OpenAI transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async translateAudio(
    audioFile: File,
    options: {
      model?: string;
      prompt?: string;
      response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
      temperature?: number;
    } = {}
  ): Promise<{ text: string }> {
    const {
      model = 'whisper-1',
      prompt,
      response_format = 'json',
      temperature,
    } = options;

    try {
      const response = await this.client.audio.translations.create({
        file: audioFile,
        model,
        prompt,
        response_format,
        temperature,
      });

      return { text: typeof response === 'string' ? response : response.text };
    } catch (error) {
      console.error('OpenAI translation error:', error);
      throw new Error(`Failed to translate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
export const openaiService = new OpenAIService();