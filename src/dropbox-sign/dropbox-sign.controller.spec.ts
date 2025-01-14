import { Test, TestingModule } from '@nestjs/testing';
import { DropboxSignController } from './dropbox-sign.controller';

describe('DropboxSignController', () => {
  let controller: DropboxSignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DropboxSignController],
    }).compile();

    controller = module.get<DropboxSignController>(DropboxSignController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
