#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/cb77ab94d987a3fc92b6b872ac2ebe03b83365b4a217074127fd7694c3b3f921/contract';
import startContract from '../../snapshots/cb77ab94d987a3fc92b6b872ac2ebe03b83365b4a217074127fd7694c3b3f921/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e9bd9f825b61504e671a50f48375f0d5f7756a4d747e382a88e4c260019b83a5/contract';
import endContract from '../../snapshots/e9bd9f825b61504e671a50f48375f0d5f7756a4d747e382a88e4c260019b83a5/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  placeholder,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'message',
        columns: [
          col('body', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('recipientUserId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('senderUserId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('password_hash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-user-password_hash', {
        check: () => placeholder('backfill-user-password_hash:check'),
        run: () => placeholder('backfill-user-password_hash:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'user', column: 'password_hash' }),
      this.createIndex({
        schema: 'public',
        table: 'message',
        index: 'message_recipientUserId_idx_fd367dfa',
        columns: ['recipientUserId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'message',
        index: 'message_senderUserId_idx_64078a57',
        columns: ['senderUserId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'message',
        foreignKey: {
          name: 'message_senderUserId_fkey',
          columns: ['senderUserId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'message',
        foreignKey: {
          name: 'message_recipientUserId_fkey',
          columns: ['recipientUserId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
