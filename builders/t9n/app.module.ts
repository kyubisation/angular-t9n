import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import {
  AppController,
  SourceUnitsController,
  TargetOrphansController,
  TargetsController,
  TargetUnitsController,
} from './controllers';
import { Xlf2Deserializer, XlfDeserializer, XmlParser } from './deserialization';
import { LinkHelper } from './link-helper';
import { Xlf2Serializer, XlfSerializer } from './serialization';
import { SerializationStrategy } from './serialization-strategy';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'client'),
      exclude: ['/api*'],
    }),
  ],
  controllers: [
    AppController,
    SourceUnitsController,
    TargetsController,
    TargetOrphansController,
    TargetUnitsController,
  ],
  providers: [
    LinkHelper,
    SerializationStrategy,
    XmlParser,
    XlfDeserializer,
    Xlf2Deserializer,
    XlfSerializer,
    Xlf2Serializer,
  ],
})
export class AppModule {
  static forRoot(providers: Provider[]): DynamicModule {
    return {
      module: AppModule,
      providers,
    };
  }
}
