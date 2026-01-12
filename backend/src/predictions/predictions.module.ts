import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { OpenAIProvider } from './providers/openai.provider';

@Module({
    imports: [ConfigModule],
    controllers: [PredictionsController],
    providers: [PredictionsService, OpenAIProvider],
    exports: [PredictionsService],
})
export class PredictionsModule { }
