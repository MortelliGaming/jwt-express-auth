import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo, AllowNull, Unique } from 'sequelize-typescript';
import { User } from './user';

export enum TokenType {
    LoginToken,
    RefreshToken
}

@Table
export class Session extends Model {
    @PrimaryKey
    @Column
    id: number;

    @ForeignKey(() => User)
    @Column
    userId: number;
    
    @BelongsTo(() => User, 'userId')
    user: User;

    @Column
    tokenType: TokenType;

    @Column
    token: string;
}