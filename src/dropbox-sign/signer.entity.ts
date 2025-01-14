import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('signers')
export class Signer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role: string;

  @Column()
  name: string;

  @Column()
  emailAddress: string;

  @Column()
  templateId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
