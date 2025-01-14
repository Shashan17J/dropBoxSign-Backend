import { Test, TestingModule } from '@nestjs/testing';
import { DropboxSignService } from './dropbox-sign.service';

describe('DropboxSignService', () => {
  let service: DropboxSignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DropboxSignService],
    }).compile();

    service = module.get<DropboxSignService>(DropboxSignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
