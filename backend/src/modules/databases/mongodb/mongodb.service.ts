import { Injectable, OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class MongoDBService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    if (this.isConnected()) {
      console.log('✅ MongoDB connected successfully!');
    } else {
      console.log('⚠️ MongoDB not connected yet.');
      this.connection.once('open', () => {
        console.log('✅ MongoDB connected successfully (event listener)!');
      });
    }
  }

  getConnection(): Connection {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection.readyState === 1;
  }
}
