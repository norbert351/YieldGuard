import { Controller, Get, Post, Body } from '@nestjs/common';
import { SimulationService } from './simulation.service';

@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Get()
  getAll() {
    return { simulations: this.simulationService.findAll(), status: 'ready', count: 0 };
  }

  @Post()
  create(@Body() config: any) {
    return this.simulationService.run(config);
  }
}
