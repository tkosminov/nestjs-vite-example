import { Module } from '@nestjs/common';

import { ReplCustomService } from './repl.service';

@Module({
  providers: [ReplCustomService],
})
export class ReplCustomModule {}
