import { UserRole } from "../../database";

export enum TokenType {
    Login = 'Login',
    Refresh = 'Refresh'
}

export interface TokenUser {
    id: number,
    username: string,
    role: UserRole,
}

export interface TokenContent {
    user: TokenUser,
    type: TokenType
}

export interface LoginDto {
    loginToken: string,
    refreshToken: string,
}

export {
    UserRole
}