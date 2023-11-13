import { Injectable } from '@nestjs/common';
import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import { loadEnvironmentVariables } from './loader';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    loadEnvironmentVariables();

    return {
      
      //useCreateIndex: true
      keepAlive: true,
      // useNewUrlParser: true,
      autoIndex: true,
      //poolSize: 10,
      //bufferMaxEntries: 0,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      //useFindAndModify: false,
      // useUnifiedTopology: true,
      // maxPoolSize: 50,
      wtimeoutMS: 2500,
    };
  }
}
