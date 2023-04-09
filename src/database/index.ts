import { Sequelize } from 'sequelize-typescript';
import { Session } from './session';
import { User } from './user';

export {
  User
}

export const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, { 
  host: process.env.MYSQL_HOST, 
  dialect: 'mariadb', /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */ 
  models: [User, Session]
});
