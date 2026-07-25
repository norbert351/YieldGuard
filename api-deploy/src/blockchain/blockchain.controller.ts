import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('status')
  getStatus() {
    return { connected: this.blockchainService.isConnected() };
  }

  @Post('status')
  postStatus() {
    return { connected: this.blockchainService.isConnected(), method: 'POST' };
  }

  @Get('vaults/:address')
  getVault(@Param('address') address: string) {
    return this.blockchainService.getVaultInfo(address);
  }

  @Post('vaults/:address')
  postVault(@Param('address') address: string) {
    return this.blockchainService.getVaultInfo(address);
  }

  @Post('vaults/:address/deposit')
  deposit(@Param('address') address: string, @Body() body: { amount: string }) {
    return this.blockchainService.depositToVault(address, body.amount);
  }

  @Post('vaults/:address/withdraw')
  withdraw(@Param('address') address: string, @Body() body: { shares: string }) {
    return this.blockchainService.withdrawFromVault(address, body.shares);
  }

  @Get('vaults/:address/balance/:user')
  getBalance(@Param('address') address: string, @Param('user') user: string) {
    return this.blockchainService.getUserBalance(address, user);
  }

  @Post('vaults/:address/balance/:user')
  postBalance(@Param('address') address: string, @Param('user') user: string) {
    return this.blockchainService.getUserBalance(address, user);
  }
}
