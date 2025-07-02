import { Queue, Worker, QueueEvents, Job, JobsOptions, WorkerOptions, QueueOptions } from 'bullmq';
import { Redis } from 'ioredis';

interface QueueConfig {
  redis?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    maxRetriesPerRequest?: number;
  };
  defaultJobOptions?: JobsOptions;
}

interface JobData {
  [key: string]: any;
}

interface JobResult {
  [key: string]: any;
}

interface JobProgress {
  completed: number;
  total: number;
  data?: any;
}

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

type JobProcessor<T = JobData, R = JobResult> = (job: Job<T, R>) => Promise<R>;

export class QueueService {
  private redis: Redis;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private queueEvents: Map<string, QueueEvents> = new Map();

  constructor(config: QueueConfig = {}) {
    // Initialize Redis connection
    this.redis = new Redis({
      host: config.redis?.host || process.env.REDIS_HOST || 'localhost',
      port: config.redis?.port || parseInt(process.env.REDIS_PORT || '6379'),
      password: config.redis?.password || process.env.REDIS_PASSWORD,
      db: config.redis?.db || parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: config.redis?.maxRetriesPerRequest ?? 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }

  createQueue(name: string, options: QueueOptions = {}): Queue {
    if (this.queues.has(name)) {
      return this.queues.get(name)!;
    }

    const queue = new Queue(name, {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        ...options.defaultJobOptions,
      },
      ...options,
    });

    this.queues.set(name, queue);
    return queue;
  }

  createWorker<T = JobData, R = JobResult>(
    queueName: string,
    processor: JobProcessor<T, R>,
    options: WorkerOptions = {}
  ): Worker<T, R> {
    const workerKey = `${queueName}-worker`;
    
    if (this.workers.has(workerKey)) {
      return this.workers.get(workerKey)! as Worker<T, R>;
    }

    const worker = new Worker<T, R>(queueName, processor, {
      connection: this.redis,
      concurrency: options.concurrency || 1,
      limiter: options.limiter || {
        max: 10,
        duration: 1000,
      },
      ...options,
    });

    // Add error handling
    worker.on('error', (error) => {
      console.error(`Worker error for queue ${queueName}:`, error);
    });

    worker.on('failed', (job, error) => {
      console.error(`Job ${job?.id} failed in queue ${queueName}:`, error);
    });

    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed in queue ${queueName}`);
    });

    this.workers.set(workerKey, worker as Worker);
    return worker;
  }

  createQueueEvents(queueName: string): QueueEvents {
    if (this.queueEvents.has(queueName)) {
      return this.queueEvents.get(queueName)!;
    }

    const queueEvents = new QueueEvents(queueName, {
      connection: this.redis,
    });

    // Add event handlers
    queueEvents.on('waiting', ({ jobId }) => {
      console.log(`Job ${jobId} is waiting in queue ${queueName}`);
    });

    queueEvents.on('active', ({ jobId, prev }) => {
      console.log(`Job ${jobId} is now active in queue ${queueName}. Previous state: ${prev}`);
    });

    queueEvents.on('completed', ({ jobId, returnvalue }) => {
      console.log(`Job ${jobId} completed in queue ${queueName} with result:`, returnvalue);
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`Job ${jobId} failed in queue ${queueName}:`, failedReason);
    });

    queueEvents.on('progress', ({ jobId, data }) => {
      console.log(`Job ${jobId} progress in queue ${queueName}:`, data);
    });

    this.queueEvents.set(queueName, queueEvents);
    return queueEvents;
  }

  async addJob<T = JobData>(
    queueName: string,
    jobName: string,
    data: T,
    options: JobsOptions = {}
  ): Promise<Job<T>> {
    const queue = this.createQueue(queueName);
    
    return queue.add(jobName, data, {
      priority: options.priority || 0,
      delay: options.delay,
      repeat: options.repeat,
      attempts: options.attempts || 3,
      backoff: options.backoff || {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: options.removeOnComplete ?? 100,
      removeOnFail: options.removeOnFail ?? 50,
      ...options,
    });
  }

  async addBulkJobs<T = JobData>(
    queueName: string,
    jobs: Array<{
      name: string;
      data: T;
      options?: JobsOptions;
    }>
  ): Promise<Job<T>[]> {
    const queue = this.createQueue(queueName);
    
    return queue.addBulk(jobs.map(job => ({
      name: job.name,
      data: job.data,
      opts: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
        ...job.options,
      },
    })));
  }

  async getJob<T = JobData, R = JobResult>(
    queueName: string,
    jobId: string
  ): Promise<Job<T, R> | undefined> {
    const queue = this.createQueue(queueName);
    return queue.getJob(jobId);
  }

  async getQueueStats(queueName: string): Promise<QueueStats> {
    const queue = this.createQueue(queueName);
    
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
      queue.isPaused(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: paused ? 1 : 0,
    };
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.createQueue(queueName);
    await queue.pause();
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.createQueue(queueName);
    await queue.resume();
  }

  async retryFailedJobs(queueName: string, limit = 100): Promise<void> {
    const queue = this.createQueue(queueName);
    const failedJobs = await queue.getFailed(0, limit - 1);
    
    for (const job of failedJobs) {
      await job.retry();
    }
  }

  async cleanQueue(
    queueName: string,
    grace: number,
    status: 'completed' | 'failed' | 'active' | 'waiting' | 'delayed',
    limit = 100
  ): Promise<string[]> {
    const queue = this.createQueue(queueName);
    return queue.clean(grace, limit, status);
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.createQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  async getJobLogs(queueName: string, jobId: string): Promise<{
    logs: string[];
    count: number;
  }> {
    const queue = this.createQueue(queueName);
    const job = await queue.getJob(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found in queue ${queueName}`);
    }

    const logs = await queue.getJobLogs(jobId);
    return logs;
  }

  async updateJobProgress(
    queueName: string,
    jobId: string,
    progress: number | JobProgress
  ): Promise<void> {
    const queue = this.createQueue(queueName);
    const job = await queue.getJob(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found in queue ${queueName}`);
    }

    await job.updateProgress(progress);
  }

  async promoteJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.createQueue(queueName);
    const job = await queue.getJob(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found in queue ${queueName}`);
    }

    await job.promote();
  }

  async getQueueHealth(queueName: string): Promise<{
    isHealthy: boolean;
    stats: QueueStats;
    workers: number;
    errors: string[];
  }> {
    try {
      const stats = await this.getQueueStats(queueName);
      const workerKey = `${queueName}-worker`;
      const worker = this.workers.get(workerKey);
      
      const errors: string[] = [];
      
      // Check for high failure rate
      if (stats.failed > stats.completed * 0.1) {
        errors.push('High failure rate detected');
      }
      
      // Check for stuck jobs
      if (stats.active > 0 && !worker?.isRunning()) {
        errors.push('Active jobs detected but no running workers');
      }
      
      // Check for too many waiting jobs
      if (stats.waiting > 1000) {
        errors.push('Too many waiting jobs');
      }

      return {
        isHealthy: errors.length === 0,
        stats,
        workers: worker?.isRunning() ? 1 : 0,
        errors,
      };
    } catch (error) {
      return {
        isHealthy: false,
        stats: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0 },
        workers: 0,
        errors: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  async closeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    const workerKey = `${queueName}-worker`;
    const worker = this.workers.get(workerKey);
    const queueEvents = this.queueEvents.get(queueName);

    await Promise.all([
      queue?.close(),
      worker?.close(),
      queueEvents?.close(),
    ]);

    this.queues.delete(queueName);
    this.workers.delete(workerKey);
    this.queueEvents.delete(queueName);
  }

  async closeAll(): Promise<void> {
    const queueNames = Array.from(this.queues.keys());
    await Promise.all(queueNames.map(name => this.closeQueue(name)));
    await this.redis.quit();
  }
}

// Email queue service for specific email processing
export class EmailQueueService extends QueueService {
  private static instance: EmailQueueService;
  private emailQueue: Queue;
  private emailWorker: Worker;

  constructor(config: QueueConfig = {}) {
    super(config);
    this.emailQueue = this.createQueue('email-processing');
    this.setupEmailWorker();
  }

  static getInstance(config?: QueueConfig): EmailQueueService {
    if (!EmailQueueService.instance) {
      EmailQueueService.instance = new EmailQueueService(config);
    }
    return EmailQueueService.instance;
  }

  private setupEmailWorker(): void {
    this.emailWorker = this.createWorker(
      'email-processing',
      async (job) => {
        const { type, data } = job.data;
        
        switch (type) {
          case 'send-email':
            return this.processSendEmail(job);
          case 'send-bulk-email':
            return this.processBulkEmail(job);
          case 'send-template-email':
            return this.processTemplateEmail(job);
          default:
            throw new Error(`Unknown email job type: ${type}`);
        }
      },
      {
        concurrency: 5,
        limiter: {
          max: 100,
          duration: 60000, // 100 emails per minute
        },
      }
    );
  }

  private async processSendEmail(job: Job): Promise<any> {
    await job.updateProgress(10);
    
    // Import SES service dynamically to avoid circular dependency
    const { sesService } = await import('./ses');
    const result = await sesService.sendEmail(job.data.emailOptions);
    
    await job.updateProgress(100);
    return result;
  }

  private async processBulkEmail(job: Job): Promise<any> {
    await job.updateProgress(10);
    
    const { sesService } = await import('./ses');
    const result = await sesService.sendBulkEmail(job.data.bulkOptions);
    
    await job.updateProgress(100);
    return result;
  }

  private async processTemplateEmail(job: Job): Promise<any> {
    await job.updateProgress(10);
    
    const { sesService } = await import('./ses');
    const result = await sesService.sendTemplateEmail(job.data.templateOptions);
    
    await job.updateProgress(100);
    return result;
  }

  async queueEmail(emailOptions: any, options: JobsOptions = {}): Promise<Job> {
    return this.addJob('email-processing', 'send-email', {
      type: 'send-email',
      emailOptions,
    }, {
      priority: 1,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      ...options,
    });
  }

  async queueBulkEmail(bulkOptions: any, options: JobsOptions = {}): Promise<Job> {
    return this.addJob('email-processing', 'send-bulk-email', {
      type: 'send-bulk-email',
      bulkOptions,
    }, {
      priority: 2,
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 10000,
      },
      ...options,
    });
  }

  async queueTemplateEmail(templateOptions: any, options: JobsOptions = {}): Promise<Job> {
    return this.addJob('email-processing', 'send-template-email', {
      type: 'send-template-email',
      templateOptions,
    }, {
      priority: 1,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      ...options,
    });
  }
}

// Singleton instances
export const queueService = new QueueService();
export const emailQueueService = EmailQueueService.getInstance();