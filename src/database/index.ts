import { Sequelize } from 'sequelize-typescript';
import { LoginToken } from './loginToken';
import { RefreshToken } from './refreshToken';
import { User, UserRole } from './user';
import { type TokenContent, type TokenUser, TokenType } from '../middleware/types';

export {
  type TokenContent,
  type TokenUser,
  User,
  UserRole,
  LoginToken, 
  RefreshToken,
  TokenType
}

export const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, { 
  host: process.env.MYSQL_HOST, 
  dialect: 'mariadb', /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */ 
  models: [User, LoginToken, RefreshToken]
});
