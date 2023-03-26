import { NextFunction, Request, Response } from "express";
import { User } from "../database";

const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWTKEY || '<ASECRETKEYTOENCRYPTJWT>'

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        if(decoded.type !== 'loginToken') {
            throw new Error();
        }
        req.header['user'] = {
            username: decoded.username
        };
        next();
    } catch (err) {
        res.status(401).send('Please authenticate');
    }
};

export function refreshToken(req: Request, res: Response) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        if(decoded.type !== 'refreshToken') {
            throw new Error();
        }
        const loginToken = jwt.sign({ username: decoded.username, type: 'loginToken' }, SECRET_KEY, {
            expiresIn: '2 days',
        });
        const refreshToken = jwt.sign({ username: decoded.username, type: 'refreshToken' }, SECRET_KEY, {
            expiresIn: '7 days',
        });
        res.status(200).send({ message: {
            loginToken,
            refreshToken
        }});
    } catch (err) {
        res.status(401).send('Please authenticate');
    }
}

export function login(req: Request, res: Response) {
    if(!req.body.username || !req.body.password) {
        res.status(401).send({message: 'unauthorized'})
    } else {
        // check the credentials here !
        User.findOne({
            where: {
                username: req.body.username,
                password: req.body.password,
            }
        }).then((user) => {
            if(user /* check the credentials here */) {
                const loginToken = jwt.sign({ username: user.username, type: 'loginToken' }, SECRET_KEY, {
                    expiresIn: '2 days',
                });
                const refreshToken = jwt.sign({ username: user.username, type: 'refreshToken' }, SECRET_KEY, {
                    expiresIn: '7 days',
                });
                res.status(200).send({ message: {
                    loginToken,
                    refreshToken
                }})
            } else {
                res.status(401).send({ message: 'unauthorized'})
            }
        }).catch(() => {
            res.status(401).send({ message: 'unauthorized'})
        })
    }
}