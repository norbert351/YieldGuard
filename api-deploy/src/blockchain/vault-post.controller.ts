import { Controller, Post, Param, Body } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

// Separate controller for POST routes only — avoids NestJS 11 multi-decorator bug
@Controller('blockchain/vaults')
export class VaultPostController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post(':address')
  postVault(@Param('address') address: string) {
    return this.blockchainService.getVaultInfo(address);
  }

  @Post(':address/deposit')
  deposit(@Param('address') address: string, @Body() body: { amount: string }) {
    return this.blockchainService.depositToVault(address, body.amount);
  }

  @Post(':address/withdraw')
  withdraw(@Param('address') address: string, @Body() body: { shares: string }) {
    return this.blockchainService.withdrawFromVault(address, body.shares);
  }

  @Post(':address/balance/:user')
  postBalance(@Param('address') address: string, @Param('user') user: string) {
    return this.blockchainService.getUserBalance(address, user);
  }
}
