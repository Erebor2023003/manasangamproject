import { Test, TestingModule } from '@nestjs/testing';
import { SanghamdepositsController } from './sanghamdeposits.controller';
import { SanghamdepositsService } from './sanghamdeposits.service';

describe('SanghamdepositsController', () => {
  let controller: SanghamdepositsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SanghamdepositsController],
      providers: [SanghamdepositsService],
    }).compile();

    controller = module.get<SanghamdepositsController>(SanghamdepositsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
