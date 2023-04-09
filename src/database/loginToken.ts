import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { User } from './user';
import { RefreshToken } from './refreshToken';

@Table
export class LoginToken extends Model {
    @PrimaryKey
    @Column
    id: number;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @Column
    token: string;
    
    @BelongsTo(() => User, 'userId')
    user: User;

    @HasOne(() => RefreshToken)
    refreshToken: RefreshToken
}