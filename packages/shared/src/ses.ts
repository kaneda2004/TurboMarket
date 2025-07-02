import {
  SESv2Client,
  SendEmailCommand,
  SendBulkEmailCommand,
  CreateEmailTemplateCommand,
  UpdateEmailTemplateCommand,
  GetEmailTemplateCommand,
  DeleteEmailTemplateCommand,
  ListEmailTemplatesCommand,
  PutConfigurationSetEventDestinationCommand,
  CreateConfigurationSetCommand,
  GetAccountCommand,
  PutAccountSendingEnabledCommand,
} from '@aws-sdk/client-sesv2';

interface SESConfig {
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

interface EmailAddress {
  email: string;
  name?: string;
}

interface EmailContent {
  subject: string;
  html?: string;
  text?: string;
}

interface EmailTemplate {
  templateName: string;
  subject: string;
  html?: string;
  text?: string;
}

interface SendEmailOptions {
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress[];
  content: EmailContent;
  tags?: Record<string, string>;
  configurationSet?: string;
}

interface SendTemplateEmailOptions {
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  templateName: string;
  templateData: Record<string, any>;
  tags?: Record<string, string>;
  configurationSet?: string;
}

interface BulkEmailDestination {
  destination: {
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
  };
  templateData: Record<string, any>;
  tags?: Record<string, string>;
}

interface SendBulkEmailOptions {
  from: EmailAddress;
  templateName: string;
  destinations: BulkEmailDestination[];
  defaultTemplateData?: Record<string, any>;
  configurationSet?: string;
  tags?: Record<string, string>;
}

interface EmailSendResult {
  messageId: string;
  status: 'success' | 'failed';
  error?: string;
}

interface BulkEmailResult {
  results: Array<{
    messageId?: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
}

export class SESService {
  private client: SESv2Client;

  constructor(config: SESConfig = {}) {
    this.client = new SESv2Client({
      region: config.region || process.env.AWS_REGION || 'us-east-1',
      credentials: config.credentials || {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  private formatEmailAddress(emailAddr: EmailAddress): string {
    return emailAddr.name ? `${emailAddr.name} <${emailAddr.email}>` : emailAddr.email;
  }

  private formatEmailAddresses(addresses: EmailAddress[]): string[] {
    return addresses.map(addr => this.formatEmailAddress(addr));
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    const {
      from,
      to,
      cc,
      bcc,
      replyTo,
      content,
      tags,
      configurationSet,
    } = options;

    try {
      const command = new SendEmailCommand({
        FromEmailAddress: this.formatEmailAddress(from),
        Destination: {
          ToAddresses: this.formatEmailAddresses(to),
          CcAddresses: cc ? this.formatEmailAddresses(cc) : undefined,
          BccAddresses: bcc ? this.formatEmailAddresses(bcc) : undefined,
        },
        ReplyToAddresses: replyTo ? this.formatEmailAddresses(replyTo) : undefined,
        Content: {
          Simple: {
            Subject: {
              Data: content.subject,
              Charset: 'UTF-8',
            },
            Body: {
              Html: content.html ? {
                Data: content.html,
                Charset: 'UTF-8',
              } : undefined,
              Text: content.text ? {
                Data: content.text,
                Charset: 'UTF-8',
              } : undefined,
            },
          },
        },
        EmailTags: tags ? Object.entries(tags).map(([key, value]) => ({
          Name: key,
          Value: value,
        })) : undefined,
        ConfigurationSetName: configurationSet,
      });

      const response = await this.client.send(command);

      return {
        messageId: response.MessageId!,
        status: 'success',
      };
    } catch (error) {
      console.error('SES send email error:', error);
      return {
        messageId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendTemplateEmail(options: SendTemplateEmailOptions): Promise<EmailSendResult> {
    const {
      from,
      to,
      cc,
      bcc,
      templateName,
      templateData,
      tags,
      configurationSet,
    } = options;

    try {
      const command = new SendEmailCommand({
        FromEmailAddress: this.formatEmailAddress(from),
        Destination: {
          ToAddresses: this.formatEmailAddresses(to),
          CcAddresses: cc ? this.formatEmailAddresses(cc) : undefined,
          BccAddresses: bcc ? this.formatEmailAddresses(bcc) : undefined,
        },
        Content: {
          Template: {
            TemplateName: templateName,
            TemplateData: JSON.stringify(templateData),
          },
        },
        EmailTags: tags ? Object.entries(tags).map(([key, value]) => ({
          Name: key,
          Value: value,
        })) : undefined,
        ConfigurationSetName: configurationSet,
      });

      const response = await this.client.send(command);

      return {
        messageId: response.MessageId!,
        status: 'success',
      };
    } catch (error) {
      console.error('SES send template email error:', error);
      return {
        messageId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendBulkEmail(options: SendBulkEmailOptions): Promise<BulkEmailResult> {
    const {
      from,
      templateName,
      destinations,
      defaultTemplateData,
      configurationSet,
      tags,
    } = options;

    try {
      const command = new SendBulkEmailCommand({
        FromEmailAddress: this.formatEmailAddress(from),
        Template: templateName,
        DefaultTemplateData: defaultTemplateData ? JSON.stringify(defaultTemplateData) : undefined,
        Destinations: destinations.map(dest => ({
          Destination: {
            ToAddresses: this.formatEmailAddresses(dest.destination.to),
            CcAddresses: dest.destination.cc ? this.formatEmailAddresses(dest.destination.cc) : undefined,
            BccAddresses: dest.destination.bcc ? this.formatEmailAddresses(dest.destination.bcc) : undefined,
          },
          ReplacementTemplateData: JSON.stringify(dest.templateData),
          ReplacementTags: dest.tags ? Object.entries(dest.tags).map(([key, value]) => ({
            Name: key,
            Value: value,
          })) : undefined,
        })),
        DefaultEmailTags: tags ? Object.entries(tags).map(([key, value]) => ({
          Name: key,
          Value: value,
        })) : undefined,
        ConfigurationSetName: configurationSet,
      });

      const response = await this.client.send(command);

      return {
        results: response.Status?.map(status => ({
          messageId: status.MessageId,
          status: status.Status === 'Success' ? 'success' : 'failed',
          error: status.Error,
        })) || [],
      };
    } catch (error) {
      console.error('SES send bulk email error:', error);
      throw new Error(`Failed to send bulk email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createTemplate(template: EmailTemplate): Promise<void> {
    try {
      const command = new CreateEmailTemplateCommand({
        TemplateName: template.templateName,
        TemplateContent: {
          Subject: template.subject,
          Html: template.html,
          Text: template.text,
        },
      });

      await this.client.send(command);
    } catch (error) {
      console.error('SES create template error:', error);
      throw new Error(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateTemplate(template: EmailTemplate): Promise<void> {
    try {
      const command = new UpdateEmailTemplateCommand({
        TemplateName: template.templateName,
        TemplateContent: {
          Subject: template.subject,
          Html: template.html,
          Text: template.text,
        },
      });

      await this.client.send(command);
    } catch (error) {
      console.error('SES update template error:', error);
      throw new Error(`Failed to update template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTemplate(templateName: string): Promise<EmailTemplate> {
    try {
      const command = new GetEmailTemplateCommand({
        TemplateName: templateName,
      });

      const response = await this.client.send(command);
      const content = response.TemplateContent!;

      return {
        templateName,
        subject: content.Subject!,
        html: content.Html,
        text: content.Text,
      };
    } catch (error) {
      console.error('SES get template error:', error);
      throw new Error(`Failed to get template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteTemplate(templateName: string): Promise<void> {
    try {
      const command = new DeleteEmailTemplateCommand({
        TemplateName: templateName,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('SES delete template error:', error);
      throw new Error(`Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listTemplates(maxItems?: number, nextToken?: string): Promise<{
    templates: Array<{ name: string; createdTimestamp?: Date }>;
    nextToken?: string;
  }> {
    try {
      const command = new ListEmailTemplatesCommand({
        PageSize: maxItems,
        NextToken: nextToken,
      });

      const response = await this.client.send(command);

      return {
        templates: response.TemplatesMetadata?.map(template => ({
          name: template.TemplateName!,
          createdTimestamp: template.CreatedTimestamp,
        })) || [],
        nextToken: response.NextToken,
      };
    } catch (error) {
      console.error('SES list templates error:', error);
      throw new Error(`Failed to list templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createConfigurationSet(name: string, options: {
    trackingOptions?: {
      customRedirectDomain?: string;
    };
    deliveryOptions?: {
      tlsPolicy?: 'Require' | 'Optional';
    };
  } = {}): Promise<void> {
    try {
      const command = new CreateConfigurationSetCommand({
        ConfigurationSetName: name,
        TrackingOptions: options.trackingOptions ? {
          CustomRedirectDomain: options.trackingOptions.customRedirectDomain,
        } : undefined,
        DeliveryOptions: options.deliveryOptions ? {
          TlsPolicy: options.deliveryOptions.tlsPolicy,
        } : undefined,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('SES create configuration set error:', error);
      throw new Error(`Failed to create configuration set: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAccountSendingStatus(): Promise<{
    sendingEnabled: boolean;
    maxSendRate: number;
    maxDailyVolume: number;
  }> {
    try {
      const command = new GetAccountCommand({});
      const response = await this.client.send(command);

      return {
        sendingEnabled: response.SendingEnabled || false,
        maxSendRate: response.MaxSendRate || 0,
        maxDailyVolume: response.MaxDailyVolume || 0,
      };
    } catch (error) {
      console.error('SES get account status error:', error);
      throw new Error(`Failed to get account status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async setSendingEnabled(enabled: boolean): Promise<void> {
    try {
      const command = new PutAccountSendingEnabledCommand({
        SendingEnabled: enabled,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('SES set sending enabled error:', error);
      throw new Error(`Failed to set sending enabled: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
export const sesService = new SESService();