import { Module } from '@nestjs/common';
import { RootController } from './root.controller';

/**
 * Landing page da raiz "/" (fora do prefixo /v1).
 */
@Module({
  controllers: [RootController],
})
export class RootModule {}