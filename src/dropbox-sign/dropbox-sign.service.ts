import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signer } from './signer.entity';

@Injectable()
export class DropboxSignService {
  constructor(
    @InjectRepository(Signer)
    private readonly signerRepository: Repository<Signer>,
  ) {}

  async saveSignerData(data: {
    name: string;
    emailAddress: string;
    role: string;
    templateId: string;
  }): Promise<Signer> {
    const signer = this.signerRepository.create(data);
    return await this.signerRepository.save(signer);
  }
}

@Injectable()
export class SignatureService {
  private signatureId: string | null = null;

  setSignatureId(id: string): void {
    this.signatureId = id;
  }

  getSignatureId(): string | null {
    return this.signatureId;
  }
}
