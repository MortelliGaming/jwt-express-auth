import { NextFunction, Request, Response } from "express";
import { extractUserFromHeaderIfInDB } from "../businesslogic/auth";
import { TokenType } from "../database";

const jwt = require("jsonwebtoken");

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