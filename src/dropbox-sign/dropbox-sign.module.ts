import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DropboxSignController } from './dropbox-sign.controller';
import { DropboxSignService, SignatureService } from './dropbox-sign.service';
import { Signer } from './signer.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Signer],
        synchronize: true,
        // migrationsRun: true,
      }),
    }),
    TypeOrmModule.forFeature([Signer]),
  ],
  controllers: [DropboxSignController],
  providers: [DropboxSignService, SignatureService],
})
export class DropboxSignModule {}
