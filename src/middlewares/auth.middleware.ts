import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongoose";
import { sendErrorResponse, validateToken } from "../utils";
import { getUserById } from "../services/user.service";

declare global {
    namespace Express {
        interface Request {
            userId?: ObjectId | string;
        }
    }
}

const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return sendErrorResponse(res, 401, "Authorization header token missing");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return sendErrorResponse(res, 401, "Token is missing");
        }

        const verify = validateToken(token);

        if (!verify) {
            return sendErrorResponse(res, 400, "InValid token payload");
        }
        const user = await getUserById(verify._id);
        if (user?.jti !== verify.jti || user?.jti === null) {
            return sendErrorResponse(res, 401, "Please authenticate");
        }
        req.userId = verify._id;
        next();
    } catch (error: any) {
        sendErrorResponse(
            res,
            400,
            "Authentication failed",
            error.message || error
        );
    }
};

export default authenticate;
