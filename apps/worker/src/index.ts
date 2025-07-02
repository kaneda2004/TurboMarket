import { Worker, Queue } from 'bullmq'
import { Redis } from 'ioredis'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
})

// Email queue
const emailQueue = new Queue('email-processing', { connection: redis })

// Worker for processing email jobs
const emailWorker = new Worker(
  'email-processing',
  async (job) => {
    console.log(`Processing email job: ${job.id}`)
    console.log('Job data:', job.data)
    
    // TODO: Implement email processing logic
    // - Generate content with Claude 3.7 Sonnet
    // - Generate images with OpenAI
    // - Send via SES
    
    return { success: true, message: 'Email processed successfully' }
  },
  { connection: redis }
)

// Event listeners
emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`)
})

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

emailWorker.on('error', (err) => {
  console.error('Worker error:', err)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down worker...')
  await emailWorker.close()
  await redis.quit()
  process.exit(0)
})

console.log('🚀 TurboMarket Worker started successfully')
console.log('📧 Email processing queue is ready')
console.log('🔗 Redis connection:', process.env.REDIS_URL || 'redis://localhost:6379')