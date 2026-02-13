import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "Sporton123"

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        res.status(401).json({message: "Authentication Required!"})
        return
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {id: string, email: string}
        req.user = decoded
        next()
    } catch (err) {
        console.error(err)
        res.status(401).json({message: "Invalid Token"})
    }
}