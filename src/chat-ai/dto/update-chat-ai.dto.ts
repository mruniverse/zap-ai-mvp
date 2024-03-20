import { PartialType } from '@nestjs/mapped-types';
import { CreateChatAiDto } from './create-chat-ai.dto';

export class UpdateChatAiDto extends PartialType(CreateChatAiDto) {}
