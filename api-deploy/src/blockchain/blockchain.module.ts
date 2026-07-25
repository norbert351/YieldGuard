import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { VaultPostController } from './vault-post.controller';

@Module({
  controllers: [BlockchainController, VaultPostController],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
