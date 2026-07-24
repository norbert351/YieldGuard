import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProtocolsService } from './protocols.service';

@Controller('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get()
  getAll() {
    return this.protocolsService.getAll();
  }

  @Post()
  getAllPost(@Body() body: any) {
    return this.protocolsService.getAll();
  }

  @Get('rates')
  getRates() {
    return this.protocolsService.getRates();
  }
}
