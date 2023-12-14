import { Test, TestingModule } from '@nestjs/testing';
import { AppuService } from './appu.service';

describe('AppuService', () => {
  let service: AppuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppuService],
    }).compile();

    service = module.get<AppuService>(AppuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
