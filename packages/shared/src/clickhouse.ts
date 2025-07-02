import { createClient, ClickHouseClient, QueryResult } from '@clickhouse/client';

interface ClickHouseConfig {
  url?: string;
  username?: string;
  password?: string;
  database?: string;
  compression?: boolean;
  session_timeout?: number;
  query_timeout?: number;
  max_open_connections?: number;
}

interface QueryOptions {
  format?: 'JSON' | 'JSONEachRow' | 'CSV' | 'TSV' | 'Parquet' | 'Arrow';
  settings?: Record<string, string | number>;
  query_params?: Record<string, any>;
  session_id?: string;
  timeout?: number;
}

interface InsertOptions {
  format?: 'JSONEachRow' | 'CSV' | 'TSV' | 'Parquet';
  settings?: Record<string, string | number>;
  timeout?: number;
}

interface TableSchema {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable?: boolean;
    default_value?: any;
  }>;
  engine: string;
  order_by?: string[];
  partition_by?: string[];
  primary_key?: string[];
  settings?: Record<string, any>;
}

interface QueryBuilder {
  select(columns: string | string[]): QueryBuilder;
  from(table: string): QueryBuilder;
  where(condition: string, params?: Record<string, any>): QueryBuilder;
  groupBy(columns: string | string[]): QueryBuilder;
  orderBy(column: string, direction?: 'ASC' | 'DESC'): QueryBuilder;
  limit(count: number): QueryBuilder;
  offset(count: number): QueryBuilder;
  having(condition: string, params?: Record<string, any>): QueryBuilder;
  join(table: string, condition: string, type?: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'): QueryBuilder;
  build(): string;
  execute(options?: QueryOptions): Promise<QueryResult<any>>;
}

export class ClickHouseService {
  private client: ClickHouseClient;
  private config: ClickHouseConfig;

  constructor(config: ClickHouseConfig = {}) {
    this.config = {
      url: config.url || process.env.CLICKHOUSE_URL || 'http://localhost:8123',
      username: config.username || process.env.CLICKHOUSE_USERNAME || 'default',
      password: config.password || process.env.CLICKHOUSE_PASSWORD || '',
      database: config.database || process.env.CLICKHOUSE_DATABASE || 'default',
      compression: config.compression ?? true,
      session_timeout: config.session_timeout || 60000,
      query_timeout: config.query_timeout || 30000,
      max_open_connections: config.max_open_connections || 10,
      ...config,
    };

    this.client = createClient({
      url: this.config.url,
      username: this.config.username,
      password: this.config.password,
      database: this.config.database,
      compression: {
        response: this.config.compression,
        request: this.config.compression,
      },
      session_timeout: this.config.session_timeout,
      request_timeout: this.config.query_timeout,
      max_open_connections: this.config.max_open_connections,
    });
  }

  // Basic query execution
  async query<T = any>(
    sql: string, 
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    try {
      const result = await this.client.query({
        query: sql,
        format: options.format || 'JSON',
        query_params: options.query_params,
        clickhouse_settings: options.settings,
        session_id: options.session_id,
        abort_signal: options.timeout ? 
          AbortSignal.timeout(options.timeout) : undefined,
      });

      return result;
    } catch (error) {
      console.error('ClickHouse query error:', error);
      throw new Error(`Failed to execute query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Streaming query for large datasets
  async *queryStream<T = any>(
    sql: string,
    options: QueryOptions = {}
  ): AsyncGenerator<T[], void, unknown> {
    try {
      const stream = this.client.query({
        query: sql,
        format: 'JSONEachRow',
        query_params: options.query_params,
        clickhouse_settings: options.settings,
        session_id: options.session_id,
      });

      const result = await stream.stream();
      
      for await (const chunk of result) {
        const lines = chunk.text.trim().split('\n').filter(line => line);
        const rows = lines.map(line => JSON.parse(line) as T);
        yield rows;
      }
    } catch (error) {
      console.error('ClickHouse streaming query error:', error);
      throw new Error(`Failed to stream query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Insert data
  async insert<T = any>(
    table: string,
    data: T[],
    options: InsertOptions = {}
  ): Promise<void> {
    try {
      await this.client.insert({
        table,
        values: data,
        format: options.format || 'JSONEachRow',
        clickhouse_settings: options.settings,
        abort_signal: options.timeout ? 
          AbortSignal.timeout(options.timeout) : undefined,
      });
    } catch (error) {
      console.error('ClickHouse insert error:', error);
      throw new Error(`Failed to insert data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Batch insert with automatic chunking
  async batchInsert<T = any>(
    table: string,
    data: T[],
    options: InsertOptions & { chunkSize?: number } = {}
  ): Promise<void> {
    const chunkSize = options.chunkSize || 10000;
    
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await this.insert(table, chunk, options);
    }
  }

  // Create table
  async createTable(schema: TableSchema): Promise<void> {
    const columns = schema.columns.map(col => {
      let columnDef = `${col.name} ${col.type}`;
      if (col.nullable) columnDef += ' NULL';
      if (col.default_value !== undefined) {
        columnDef += ` DEFAULT ${typeof col.default_value === 'string' ? `'${col.default_value}'` : col.default_value}`;
      }
      return columnDef;
    }).join(',\n  ');

    let sql = `CREATE TABLE IF NOT EXISTS ${schema.name} (\n  ${columns}\n)`;
    sql += ` ENGINE = ${schema.engine}`;

    if (schema.order_by) {
      sql += ` ORDER BY (${schema.order_by.join(', ')})`;
    }

    if (schema.partition_by) {
      sql += ` PARTITION BY (${schema.partition_by.join(', ')})`;
    }

    if (schema.primary_key) {
      sql += ` PRIMARY KEY (${schema.primary_key.join(', ')})`;
    }

    if (schema.settings) {
      const settings = Object.entries(schema.settings)
        .map(([key, value]) => `${key} = ${value}`)
        .join(', ');
      sql += ` SETTINGS ${settings}`;
    }

    await this.query(sql);
  }

  // Drop table
  async dropTable(tableName: string, ifExists: boolean = true): Promise<void> {
    const sql = `DROP TABLE ${ifExists ? 'IF EXISTS' : ''} ${tableName}`;
    await this.query(sql);
  }

  // Get table info
  async getTableInfo(tableName: string): Promise<any> {
    const sql = `DESCRIBE TABLE ${tableName}`;
    const result = await this.query(sql);
    return result.json();
  }

  // Get database info
  async getDatabaseInfo(): Promise<any> {
    const sql = 'SHOW TABLES';
    const result = await this.query(sql);
    return result.json();
  }

  // Optimize table
  async optimizeTable(tableName: string, partition?: string): Promise<void> {
    let sql = `OPTIMIZE TABLE ${tableName}`;
    if (partition) {
      sql += ` PARTITION ${partition}`;
    }
    await this.query(sql);
  }

  // Check table exists
  async tableExists(tableName: string): Promise<boolean> {
    try {
      const sql = `EXISTS TABLE ${tableName}`;
      const result = await this.query(sql);
      const data = await result.json();
      return data.data[0]['result'] === 1;
    } catch {
      return false;
    }
  }

  // Query builder
  createQueryBuilder(): QueryBuilder {
    return new ClickHouseQueryBuilder(this);
  }

  // Analytical functions
  async getTableStats(tableName: string): Promise<{
    rows: number;
    size_bytes: number;
    columns: number;
    partitions: number;
  }> {
    const sql = `
      SELECT 
        sum(rows) as rows,
        sum(bytes_on_disk) as size_bytes,
        uniq(column) as columns,
        uniq(partition) as partitions
      FROM system.parts_columns 
      WHERE table = '${tableName}' AND active = 1
    `;
    
    const result = await this.query(sql);
    const data = await result.json();
    return data.data[0];
  }

  // Execute multiple queries in a transaction-like manner
  async batch(queries: string[]): Promise<QueryResult<any>[]> {
    const results: QueryResult<any>[] = [];
    
    try {
      for (const sql of queries) {
        const result = await this.query(sql);
        results.push(result);
      }
      return results;
    } catch (error) {
      console.error('ClickHouse batch execution error:', error);
      throw new Error(`Batch execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Health check
  async healthCheck(): Promise<{
    isHealthy: boolean;
    version: string;
    uptime: number;
    queries_executed: number;
  }> {
    try {
      const sql = `
        SELECT 
          version() as version,
          uptime() as uptime,
          getCurrentMetric('Query') as current_queries
      `;
      
      const result = await this.query(sql);
      const data = await result.json();
      
      return {
        isHealthy: true,
        version: data.data[0].version,
        uptime: data.data[0].uptime,
        queries_executed: data.data[0].current_queries,
      };
    } catch (error) {
      return {
        isHealthy: false,
        version: 'unknown',
        uptime: 0,
        queries_executed: 0,
      };
    }
  }

  // Close connection
  async close(): Promise<void> {
    await this.client.close();
  }
}

// Query Builder Implementation
class ClickHouseQueryBuilder implements QueryBuilder {
  private selectClause: string = '';
  private fromClause: string = '';
  private whereClause: string = '';
  private groupByClause: string = '';
  private orderByClause: string = '';
  private limitClause: string = '';
  private offsetClause: string = '';
  private havingClause: string = '';
  private joinClause: string = '';
  private params: Record<string, any> = {};

  constructor(private clickhouse: ClickHouseService) {}

  select(columns: string | string[]): QueryBuilder {
    this.selectClause = Array.isArray(columns) ? columns.join(', ') : columns;
    return this;
  }

  from(table: string): QueryBuilder {
    this.fromClause = table;
    return this;
  }

  where(condition: string, params?: Record<string, any>): QueryBuilder {
    this.whereClause = this.whereClause ? 
      `${this.whereClause} AND ${condition}` : condition;
    if (params) {
      Object.assign(this.params, params);
    }
    return this;
  }

  groupBy(columns: string | string[]): QueryBuilder {
    this.groupByClause = Array.isArray(columns) ? columns.join(', ') : columns;
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    const orderClause = `${column} ${direction}`;
    this.orderByClause = this.orderByClause ? 
      `${this.orderByClause}, ${orderClause}` : orderClause;
    return this;
  }

  limit(count: number): QueryBuilder {
    this.limitClause = count.toString();
    return this;
  }

  offset(count: number): QueryBuilder {
    this.offsetClause = count.toString();
    return this;
  }

  having(condition: string, params?: Record<string, any>): QueryBuilder {
    this.havingClause = this.havingClause ? 
      `${this.havingClause} AND ${condition}` : condition;
    if (params) {
      Object.assign(this.params, params);
    }
    return this;
  }

  join(table: string, condition: string, type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' = 'INNER'): QueryBuilder {
    this.joinClause += ` ${type} JOIN ${table} ON ${condition}`;
    return this;
  }

  build(): string {
    let sql = `SELECT ${this.selectClause || '*'}`;
    
    if (this.fromClause) {
      sql += ` FROM ${this.fromClause}`;
    }
    
    if (this.joinClause) {
      sql += this.joinClause;
    }
    
    if (this.whereClause) {
      sql += ` WHERE ${this.whereClause}`;
    }
    
    if (this.groupByClause) {
      sql += ` GROUP BY ${this.groupByClause}`;
    }
    
    if (this.havingClause) {
      sql += ` HAVING ${this.havingClause}`;
    }
    
    if (this.orderByClause) {
      sql += ` ORDER BY ${this.orderByClause}`;
    }
    
    if (this.limitClause) {
      sql += ` LIMIT ${this.limitClause}`;
    }
    
    if (this.offsetClause) {
      sql += ` OFFSET ${this.offsetClause}`;
    }
    
    return sql;
  }

  async execute(options?: QueryOptions): Promise<QueryResult<any>> {
    const sql = this.build();
    return this.clickhouse.query(sql, {
      ...options,
      query_params: { ...this.params, ...options?.query_params },
    });
  }
}

// Analytics service with common patterns
export class AnalyticsService extends ClickHouseService {
  constructor(config?: ClickHouseConfig) {
    super(config);
  }

  // Track events
  async trackEvent(event: {
    event_name: string;
    user_id?: string;
    session_id?: string;
    timestamp?: Date;
    properties?: Record<string, any>;
  }): Promise<void> {
    const eventData = {
      event_name: event.event_name,
      user_id: event.user_id || '',
      session_id: event.session_id || '',
      timestamp: event.timestamp || new Date(),
      properties: JSON.stringify(event.properties || {}),
    };

    await this.insert('events', [eventData]);
  }

  // Get user activity
  async getUserActivity(userId: string, days: number = 30): Promise<any[]> {
    const sql = `
      SELECT 
        event_name,
        count() as count,
        max(timestamp) as last_seen
      FROM events 
      WHERE user_id = {userId:String}
        AND timestamp >= today() - {days:UInt32}
      GROUP BY event_name
      ORDER BY count DESC
    `;

    const result = await this.query(sql, {
      query_params: { userId, days },
    });

    return result.json().then(data => data.data);
  }

  // Get funnel analysis
  async getFunnelAnalysis(events: string[], timeWindow: number = 24): Promise<any[]> {
    const eventsList = events.map((e, i) => `'${e}' as event_${i}`).join(', ');
    
    const sql = `
      WITH funnel_events AS (
        SELECT user_id, event_name, timestamp
        FROM events 
        WHERE event_name IN (${events.map(e => `'${e}'`).join(', ')})
          AND timestamp >= now() - INTERVAL {timeWindow:UInt32} HOUR
      )
      SELECT 
        ${eventsList},
        windowFunnel({timeWindow:UInt32} * 3600)(timestamp, ${events.map((e, i) => `event_name = '${e}'`).join(', ')}) as level
      FROM funnel_events
      GROUP BY user_id
    `;

    const result = await this.query(sql, {
      query_params: { timeWindow },
    });

    return result.json().then(data => data.data);
  }

  // Get cohort analysis
  async getCohortAnalysis(startDate: string, endDate: string): Promise<any[]> {
    const sql = `
      SELECT 
        toDayOfYear(min_timestamp) as cohort_day,
        toDayOfYear(timestamp) - toDayOfYear(min_timestamp) as period_number,
        uniq(user_id) as users
      FROM (
        SELECT 
          user_id,
          timestamp,
          min(timestamp) OVER (PARTITION BY user_id) as min_timestamp
        FROM events
        WHERE timestamp BETWEEN {startDate:String} AND {endDate:String}
      )
      GROUP BY cohort_day, period_number
      ORDER BY cohort_day, period_number
    `;

    const result = await this.query(sql, {
      query_params: { startDate, endDate },
    });

    return result.json().then(data => data.data);
  }
}

// Singleton instances
export const clickhouseService = new ClickHouseService();
export const analyticsService = new AnalyticsService();