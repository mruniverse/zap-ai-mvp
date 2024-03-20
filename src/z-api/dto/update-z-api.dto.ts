import { PartialType } from '@nestjs/mapped-types';
import { CreateZApiDto } from './create-z-api.dto';

export class UpdateZApiDto extends PartialType(CreateZApiDto) {}
