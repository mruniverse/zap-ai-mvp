import { Controller } from '@nestjs/common';
import { ContextService } from './context.service';

@Controller('context')
export class ContextController {
  constructor(private readonly contextService: ContextService) {}
}
