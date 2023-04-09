import { Table, Column, Model, PrimaryKey, HasMany, AllowNull, Unique } from 'sequelize-typescript';
import { LoginToken } from './loginToken';


export enum UserRole {
  User = 'User',
  Admin = 'Admin'
}

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

  @HasMany(() => LoginToken)
  loginTokens: LoginToken[];
}