import { 
  BedrockRuntimeClient, 
  InvokeModelCommand, 
  InvokeModelWithResponseStreamCommand 
} from '@aws-sdk/client-bedrock-runtime';

interface BedrockConfig {
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface BedrockResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface StreamResponse {
  content: string;
  done: boolean;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class BedrockService {
  private client: BedrockRuntimeClient;
  private modelId = 'anthropic.claude-3-7-sonnet-20241022-v1:0';

  constructor(config: BedrockConfig = {}) {
    this.client = new BedrockRuntimeClient({
      region: config.region || process.env.AWS_REGION || 'us-east-1',
      credentials: config.credentials || {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async generateText(
    messages: ChatMessage[],
    options: {
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      system?: string;
    } = {}
  ): Promise<BedrockResponse> {
    const {
      max_tokens = 4096,
      temperature = 0.7,
      top_p = 0.9,
      system
    } = options;

    // Format messages for Claude 3.7 Sonnet
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: [{ type: 'text', text: msg.content }]
    }));

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens,
      temperature,
      top_p,
      messages: formattedMessages,
      ...(system && { system })
    };

    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return {
        content: responseBody.content[0].text,
        usage: {
          input_tokens: responseBody.usage.input_tokens,
          output_tokens: responseBody.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('Bedrock API error:', error);
      throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *streamText(
    messages: ChatMessage[],
    options: {
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      system?: string;
    } = {}
  ): AsyncGenerator<StreamResponse, void, unknown> {
    const {
      max_tokens = 4096,
      temperature = 0.7,
      top_p = 0.9,
      system
    } = options;

    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: [{ type: 'text', text: msg.content }]
    }));

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens,
      temperature,
      top_p,
      messages: formattedMessages,
      ...(system && { system })
    };

    try {
      const command = new InvokeModelWithResponseStreamCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      });

      const response = await this.client.send(command);
      
      if (!response.body) {
        throw new Error('No response body received');
      }

      let accumulatedContent = '';

      for await (const chunk of response.body) {
        if (chunk.chunk?.bytes) {
          const chunkData = JSON.parse(new TextDecoder().decode(chunk.chunk.bytes));
          
          if (chunkData.type === 'content_block_delta') {
            const deltaText = chunkData.delta?.text || '';
            accumulatedContent += deltaText;
            
            yield {
              content: deltaText,
              done: false,
            };
          } else if (chunkData.type === 'message_stop') {
            yield {
              content: '',
              done: true,
              usage: chunkData.usage ? {
                input_tokens: chunkData.usage.input_tokens,
                output_tokens: chunkData.usage.output_tokens,
              } : undefined,
            };
          }
        }
      }
    } catch (error) {
      console.error('Bedrock streaming error:', error);
      throw new Error(`Failed to stream text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateWithTools(
    messages: ChatMessage[],
    tools: Array<{
      name: string;
      description: string;
      input_schema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
      };
    }>,
    options: {
      max_tokens?: number;
      temperature?: number;
      system?: string;
    } = {}
  ): Promise<BedrockResponse & { tool_calls?: Array<{ name: string; input: any }> }> {
    const {
      max_tokens = 4096,
      temperature = 0.7,
      system
    } = options;

    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: [{ type: 'text', text: msg.content }]
    }));

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens,
      temperature,
      messages: formattedMessages,
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema
      })),
      ...(system && { system })
    };

    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      const result: BedrockResponse & { tool_calls?: Array<{ name: string; input: any }> } = {
        content: responseBody.content.find((c: any) => c.type === 'text')?.text || '',
        usage: {
          input_tokens: responseBody.usage.input_tokens,
          output_tokens: responseBody.usage.output_tokens,
        },
      };

      // Extract tool calls if present
      const toolUse = responseBody.content.find((c: any) => c.type === 'tool_use');
      if (toolUse) {
        result.tool_calls = [{
          name: toolUse.name,
          input: toolUse.input
        }];
      }

      return result;
    } catch (error) {
      console.error('Bedrock tool use error:', error);
      throw new Error(`Failed to generate with tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
export const bedrockService = new BedrockService();