import { Table, Column, Model, PrimaryKey, HasMany, AllowNull, Unique } from 'sequelize-typescript';
import { Session } from './session';

@Table
export class User extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column
  id: number;

  @Unique(true)
  @Column
  username: string;

  @Column
  password: string;

  @Column
  role: string;

  @HasMany(() => Session)
  sessionTokens: Session[];
}