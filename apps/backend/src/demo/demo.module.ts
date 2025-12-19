import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

@Module({
  controllers: [DemoController],
  providers: [DemoService],
  exports: [DemoService], // Export for use in other modules if needed
})
export class DemoModule {}
