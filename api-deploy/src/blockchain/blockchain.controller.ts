import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('status')
  async getStatus() {
    const connected = await this.blockchainService.isConnected();
    return { connected };
  }

  @Get('vaults/:address')
  async getVault(@Param('address') address: string, @Body() body?: any) {
    return this.blockchainService.getVaultInfo(address, body?.network);
  }

  @Get('vaults/:address/balance/:user')
  async getBalance(@Param('address') address: string, @Param('user') user: string, @Body() body?: any) {
    return this.blockchainService.getUserBalance(address, user, body?.network);
  }
}
