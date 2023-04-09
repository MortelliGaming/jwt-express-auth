import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo, AllowNull, Unique } from 'sequelize-typescript';
import { LoginToken } from './loginToken';

@Table
export class RefreshToken extends Model {
    @PrimaryKey
    @Column
    id: number;

    @ForeignKey(() => LoginToken)
    @Column
    loginTokenId: number;

    @Column
    token: string;

    @BelongsTo(() => LoginToken, 'loginTokenId')
    loginToken: LoginToken;
}