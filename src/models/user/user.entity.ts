import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from 'typeorm';

import { RecoveryKey } from '../recovery-key/recovery-key.entity';
import { RefreshToken } from '../refresh-token/refresh-token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 3,
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 3,
  })
  public updated_at: Date;

  /**
   * ! info
   */

  @Index()
  @Column('character varying', { nullable: false })
  public username: string;

  /**
   * ! relations
   */

  @OneToMany(() => RefreshToken, (refresh_token) => refresh_token.user)
  public refresh_tokens?: Relation<RefreshToken>[];

  @OneToMany(() => RecoveryKey, (recovery_key) => recovery_key.user)
  public recovery_keys?: Relation<RecoveryKey>[];
}
