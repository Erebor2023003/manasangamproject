import { Test, TestingModule } from '@nestjs/testing';
import { AppuController } from './appu.controller';
import { AppuService } from './appu.service';

describe('AppuController', () => {
  let controller: AppuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppuController],
      providers: [AppuService],
    }).compile();

    controller = module.get<AppuController>(AppuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
