import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { VaultPostController } from './vault-post.controller';
import { X402Guard } from '../x402.guard';

@Module({
  controllers: [BlockchainController, VaultPostController],
  providers: [
    BlockchainService,
    { provide: APP_GUARD, useClass: X402Guard },
  ],
  exports: [BlockchainService],
})
export class BlockchainModule {}
