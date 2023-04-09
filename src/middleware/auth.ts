import { NextFunction, Request, Response } from "express";
import { User } from "../database";
import { LoginToken } from '../database/loginToken';
import { RefreshToken } from "../database/refreshToken";
import { type LoginDto, type TokenContent, TokenType } from "./types";

const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWTKEY || '<ASECRETKEYTOENCRYPTJWT>'

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
        const loginToken = jwt.sign({ user: tokenUser, type: TokenType.Login }, SECRET_KEY, {
            expiresIn: '2 days',
        });
        const refreshToken = jwt.sign({ user: tokenUser, type: TokenType.Refresh }, SECRET_KEY, {
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

async function extractUserFromHeaderIfInDB(req: Request): Promise<TokenContent|null> {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = jwt.verify(token, SECRET_KEY) as TokenContent;
        if(!decoded) {
            throw new Error();
        }
        let dbToken = '';
        switch(decoded.type) {
            case TokenType.Login: 
                dbToken = (await LoginToken.findOne({
                where: {
                    token: token,
                }
            }))?.token;
                break;
            case TokenType.Refresh:
                dbToken = (await RefreshToken.findOne({
                    where: {
                        token: token,
                    }
                }))?.token;
                break;
        }
        if(dbToken === token) {
            return Promise.resolve(decoded as TokenContent)
        } else {
            return Promise.resolve(null)
        }
    } catch (err: any) {
        return Promise.resolve(null)
    }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded = await extractUserFromHeaderIfInDB(req);
        if (!decoded || decoded.type !== TokenType.Login) {
            throw new Error();
        }
        req.header['user'] = decoded.user;
        next();
    } catch (err) {
        res.status(401).send('Please authenticate');
    }
};

export async function refreshToken(req: Request, res: Response) {
    try {
        const decoded = await extractUserFromHeaderIfInDB(req);
        if (!decoded || decoded.type !== TokenType.Refresh) {
            throw new Error();
        }
        const authTokens = await createAuthTokens(decoded.user.id)
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
        const authTokens = await createAuthTokens(dbUser.id)
        if(!authTokens) {
            throw new Error();
        }
        const dbLoginToken = await LoginToken.create({
            userId: dbUser.id, 
            token: authTokens.loginToken
        })
        await RefreshToken.create({
            loginTokenId: dbLoginToken.id,
            token: authTokens.refreshToken
        })
        res.status(200).send({ message: authTokens });
    } catch (err) {
        res.status(401).send('Please authenticate');
    }
}

export async function logout(req: Request, res: Response, logoutAll=false) {
    try {
        const tokenInfo = await extractUserFromHeaderIfInDB(req)
        const where = logoutAll
            ? {
                userId: tokenInfo.user.id
            }
            : {
                token: req.header('Authorization')?.replace('Bearer ', ''),
                userId: tokenInfo.user.id
            }
        if(tokenInfo) {
            const loginTokens = await LoginToken.findAll({
                where,
            })
            if(loginTokens) {
                for(let loginToken of loginTokens) {
                    const refreshToken = loginToken.refreshToken
                    await LoginToken.destroy({
                        where: {
                            id: loginToken.id
                        }
                    })
                    if(refreshToken) {
                        await LoginToken.destroy({
                            where: {
                                id: refreshToken.id,
                            }
                        })
                    }
                }
                res.status(200).send({ message: 'logout sucessful' })
            } else {
                throw new Error('no tokeninfo')
            }
        } else {
            throw new Error('no tokeninfos')
        }
    } catch(err: any) {
        res.status(401).send('Please authenticate')
    }
}