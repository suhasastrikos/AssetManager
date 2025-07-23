const mysql = require('mysql2/promise');
const { Client } = require('pg');
const { MongoClient } = require('mongodb');

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.config = null;
    this.type = null;
  }

  async testConnection(config) {
    try {
      switch (config.type) {
        case 'mysql':
          return await this.testMySQLConnection(config);
        case 'postgresql':
          return await this.testPostgreSQLConnection(config);
        case 'mongodb':
          return await this.testMongoDBConnection(config);
        default:
          throw new Error('Unsupported database type');
      }
    } catch (error) {
      console.error('Database test connection error:', error);
      return {
        success: false,
        message: error.message || 'Connection test failed'
      };
    }
  }

  async testMySQLConnection(config) {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl
    });

    await connection.ping();
    await connection.end();

    return {
      success: true,
      message: 'MySQL connection successful'
    };
  }

  async testPostgreSQLConnection(config) {
    const client = new Client({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl
    });

    await client.connect();
    await client.query('SELECT 1');
    await client.end();

    return {
      success: true,
      message: 'PostgreSQL connection successful'
    };
  }

  async testMongoDBConnection(config) {
    const uri = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    const client = new MongoClient(uri);

    await client.connect();
    await client.db().admin().ping();
    await client.close();

    return {
      success: true,
      message: 'MongoDB connection successful'
    };
  }

  async connect(config) {
    try {
      // Test connection first
      const testResult = await this.testConnection(config);
      if (!testResult.success) {
        throw new Error(testResult.message);
      }

      // Store configuration
      this.config = config;
      this.type = config.type;

      // Create persistent connection based on database type
      switch (config.type) {
        case 'mysql':
          this.connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.username,
            password: config.password,
            database: config.database,
            ssl: config.ssl
          });
          break;

        case 'postgresql':
          this.connection = new Client({
            host: config.host,
            port: config.port,
            user: config.username,
            password: config.password,
            database: config.database,
            ssl: config.ssl
          });
          await this.connection.connect();
          break;

        case 'mongodb':
          const uri = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
          this.connection = new MongoClient(uri);
          await this.connection.connect();
          break;
      }

      return {
        isConnected: true,
        config: {
          type: config.type,
          host: config.host,
          port: config.port,
          database: config.database
        },
        connectionTime: new Date().toISOString()
      };
    } catch (error) {
      console.error('Database connection error:', error);
      throw new Error(`Failed to connect to ${config.type}: ${error.message}`);
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        switch (this.type) {
          case 'mysql':
            await this.connection.end();
            break;
          case 'postgresql':
            await this.connection.end();
            break;
          case 'mongodb':
            await this.connection.close();
            break;
        }
      }
      
      this.connection = null;
      this.config = null;
      this.type = null;
    } catch (error) {
      console.error('Database disconnect error:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.connection !== null,
      config: this.config ? {
        type: this.config.type,
        host: this.config.host,
        port: this.config.port,
        database: this.config.database
      } : null,
      connectionTime: this.connection ? new Date().toISOString() : null
    };
  }

  getConnection() {
    return this.connection;
  }

  getType() {
    return this.type;
  }
}

module.exports = new DatabaseManager();