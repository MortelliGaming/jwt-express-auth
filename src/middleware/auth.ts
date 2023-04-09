import { NextFunction, Request, Response } from "express";
import { resolve } from "path";
import { User } from "../database";
import { Session, TokenType } from "../database/session";

const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWTKEY || '<ASECRETKEYTOENCRYPTJWT>'

export enum UserRole {
    User,
    Admin
}

export interface TokenUser {
    id: number,
    username: string,
    role: UserRole,
}

export interface LoginDto {
    loginToken: string,
    refreshToken: string,
}

async function createAuthTokens(userId: number) : Promise<LoginDto | null> {
    try {
        const dbUser = await User.findOne({
            where: {
                id: userId,
            }
        })
        if(!dbUser) { 
            throw new Error('user not found')
        }
        const tokenUser = Object.assign({}, {
            user: {
                id: dbUser.id,
                username: dbUser.username,
                role: dbUser.role,
            }
        })
        const loginToken = jwt.sign({ tokenUser, type: TokenType.RefreshToken.toString() }, SECRET_KEY, {
            expiresIn: '2 days',
        });
        const refreshToken = jwt.sign({ tokenUser, type: TokenType.LoginToken.toString() }, SECRET_KEY, {
            expiresIn: '7 days',
        });
        return Promise.resolve({
            loginToken,
            refreshToken
        })
    } catch (err: any) {
        return Promise.resolve(null)
    }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        if(decoded.type !== TokenType.LoginToken.toString()) {
            throw new Error();
        }
        req.header['user'] = decoded.user;
        const userSessionToken = await Session.findOne({
            where: {
                token: token,
                userId: decoded.user.id,
                tokenType: TokenType.LoginToken
            }
        })
        if(!userSessionToken) {
            throw new Error();
        }
        next();
    } catch (err) {
        res.status(401).send('Please authenticate');
    }
};

export async function refreshToken(req: Request, res: Response) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        if(decoded.type !== TokenType.RefreshToken.toString()) {
            throw new Error();
        }
        const userSessionToken = await Session.findOne({
            where: {
                token: token,
                userId: decoded.user.id,
                tokenType: TokenType.RefreshToken
            }
        })
        if(!userSessionToken) {
            throw new Error();
        }
        const authTokens = await createAuthTokens(decoded.user.id, decoded.user.username)
        if(!authTokens) {
            throw new Error();
        }
        res.status(200).send({ message: authTokens });
    } catch (err) {
        res.status(401).send('Please authenticate');
    }
}

export async function login(req: Request, res: Response) {
    try {
        if(!req.body.username || !req.body.password) {
            throw new Error();
        }
        const dbUser = await User.findOne({
            where: {
                username: req.body.username,
                password: req.body.password,
            }
        })
        if(!dbUser) {
            throw new Error();
        }
        const authTokens = await createAuthTokens(dbUser.id, dbUser.username)
        if(!authTokens) {
            throw new Error();
        }
        res.status(200).send({ message: authTokens });
    } catch (err) {
        res.status(401).send('Please authenticate');
    }
}