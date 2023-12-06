import { Test, TestingModule } from '@nestjs/testing';
import { SanghamdepositsService } from './sanghamdeposits.service';

describe('SanghamdepositsService', () => {
  let service: SanghamdepositsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SanghamdepositsService],
    }).compile();

    service = module.get<SanghamdepositsService>(SanghamdepositsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
