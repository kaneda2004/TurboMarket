import { EmailQueueService } from './services/queue.js';
import { bedrockService } from './services/bedrock.js';
import { openaiService } from './services/openai.js';
import { sesService } from './services/ses.js';
import { analyticsService } from './services/clickhouse.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🚀 Starting TurboMarket Worker...');

// Initialize services
const emailQueueService = EmailQueueService.getInstance();

// Email content generation functions
async function generateEmailContent(prompt: string, type: 'claude' | 'openai' = 'claude') {
  try {
    if (type === 'claude') {
      const result = await bedrockService.generateText([
        { role: 'user', content: prompt }
      ], {
        max_tokens: 2048,
        temperature: 0.7,
      });
      return result.content;
    } else {
      const result = await openaiService.generateText([
        { role: 'user', content: prompt }
      ], {
        max_tokens: 2048,
        temperature: 0.7,
      });
      return result.content;
    }
  } catch (error) {
    console.error(`Error generating content with ${type}:`, error);
    throw error;
  }
}

async function generateEmailImage(prompt: string) {
  try {
    const images = await openaiService.generateImage(prompt, {
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'hd',
      style: 'vivid',
    });
    return images[0]?.url;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

// Enhanced email processing functions
async function processEmailGeneration(jobData: any) {
  const { emailType, audienceType, goal, customPrompt, userId } = jobData;
  
  console.log(`Generating ${emailType} email for ${audienceType} users with goal: ${goal}`);
  
  // Track event
  await analyticsService.trackEvent({
    event_name: 'email_generation_started',
    user_id: userId,
    properties: { emailType, audienceType, goal }
  });

  // Generate email content using Claude 3.7 Sonnet
  const contentPrompt = `
    Create a compelling marketing email for ${emailType} campaign.
    Target audience: ${audienceType}
    Primary goal: ${goal}
    
    ${customPrompt ? `Additional requirements: ${customPrompt}` : ''}
    
    Structure the response as JSON with the following format:
    {
      "subject": "Email subject line",
      "preheader": "Preview text",
      "content": {
        "hook": "Opening hook",
        "body": "Main email body in HTML format",
        "cta": "Call to action text",
        "footer": "Footer content"
      }
    }
    
    Make it engaging, personalized, and optimized for conversions.
  `;

  const generatedContent = await generateEmailContent(contentPrompt);
  
  let emailData;
  try {
    emailData = JSON.parse(generatedContent);
  } catch (error) {
    console.error('Failed to parse generated content as JSON:', error);
    throw new Error('Failed to generate properly formatted email content');
  }

  // Generate hero image if needed
  let heroImageUrl = null;
  if (emailType === 'launch' || emailType === 'newsletter') {
    const imagePrompt = `Create a professional, modern hero image for a ${emailType} email campaign. Style: clean, corporate, engaging, high-quality.`;
    heroImageUrl = await generateEmailImage(imagePrompt);
  }

  // Track successful generation
  await analyticsService.trackEvent({
    event_name: 'email_generation_completed',
    user_id: userId,
    properties: { 
      emailType, 
      audienceType, 
      goal,
      hasImage: !!heroImageUrl,
      contentLength: emailData.content.body.length
    }
  });

  return {
    ...emailData,
    heroImageUrl,
    metadata: {
      generatedAt: new Date().toISOString(),
      emailType,
      audienceType,
      goal,
      userId
    }
  };
}

async function processEmailSending(jobData: any) {
  const { emailContent, recipients, from, trackingOptions } = jobData;
  
  console.log(`Sending email to ${recipients.length} recipients`);
  
  try {
    // Send emails using SES
    const results = await Promise.all(
      recipients.map(async (recipient: any) => {
        const result = await sesService.sendEmail({
          from: from,
          to: [{ email: recipient.email, name: recipient.name }],
          content: {
            subject: emailContent.subject,
            html: emailContent.content.body,
            text: emailContent.content.body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
          },
          tags: {
            campaign_type: emailContent.metadata.emailType,
            user_id: emailContent.metadata.userId,
            recipient_id: recipient.id,
          },
          configurationSet: trackingOptions?.configurationSet,
        });
        
        // Track email sent event
        await analyticsService.trackEvent({
          event_name: 'email_sent',
          user_id: emailContent.metadata.userId,
          properties: {
            recipient_email: recipient.email,
            email_type: emailContent.metadata.emailType,
            message_id: result.messageId,
            status: result.status,
          }
        });
        
        return result;
      })
    );
    
    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.length - successCount;
    
    console.log(`Email sending completed: ${successCount} successful, ${failedCount} failed`);
    
    return {
      success: true,
      sent: successCount,
      failed: failedCount,
      results,
    };
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
}

async function processTemplateSending(jobData: any) {
  const { templateName, templateData, recipients, from } = jobData;
  
  console.log(`Sending template ${templateName} to ${recipients.length} recipients`);
  
  try {
    // Use bulk email sending for efficiency
    const destinations = recipients.map((recipient: any) => ({
      destination: {
        to: [{ email: recipient.email, name: recipient.name }]
      },
      templateData: {
        ...templateData,
        recipient_name: recipient.name,
        recipient_email: recipient.email,
        ...recipient.customData
      }
    }));
    
    const result = await sesService.sendBulkEmail({
      from,
      templateName,
      destinations,
      defaultTemplateData: templateData,
    });
    
    // Track bulk send event
    await analyticsService.trackEvent({
      event_name: 'bulk_email_sent',
      user_id: jobData.userId,
      properties: {
        template_name: templateName,
        recipient_count: recipients.length,
        success_count: result.results.filter(r => r.status === 'success').length,
        failed_count: result.results.filter(r => r.status === 'failed').length,
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error sending template emails:', error);
    throw error;
  }
}

// Initialize analytics tables
async function initializeAnalytics() {
  try {
    // Create events table for tracking
    await analyticsService.createTable({
      name: 'events',
      columns: [
        { name: 'event_name', type: 'String' },
        { name: 'user_id', type: 'String' },
        { name: 'session_id', type: 'String' },
        { name: 'timestamp', type: 'DateTime' },
        { name: 'properties', type: 'String' }, // JSON string
      ],
      engine: 'MergeTree()',
      order_by: ['timestamp', 'user_id'],
      partition_by: ['toYYYYMM(timestamp)'],
    });
    
    console.log('✅ Analytics tables initialized');
  } catch (error) {
    console.error('Failed to initialize analytics tables:', error);
  }
}

// Health check endpoint
async function healthCheck() {
  try {
    const [clickhouseHealth, queueHealth] = await Promise.all([
      analyticsService.healthCheck(),
      emailQueueService.getQueueHealth('email-processing')
    ]);
    
    return {
      status: 'healthy',
      services: {
        clickhouse: clickhouseHealth,
        emailQueue: queueHealth,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('📧 Shutting down worker gracefully...');
  
  try {
    await emailQueueService.closeAll();
    await analyticsService.close();
    console.log('✅ Worker shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Main initialization
async function main() {
  try {
    // Initialize analytics
    await initializeAnalytics();
    
    // Start processing jobs
    console.log('✅ Worker started successfully');
    console.log('� Monitoring email queue for jobs...');
    
    // Log health check every 30 seconds
    setInterval(async () => {
      const health = await healthCheck();
      console.log('� Health check:', health.status);
    }, 30000);
    
  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
}

// Start the worker
main().catch(console.error);