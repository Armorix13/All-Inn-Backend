import { Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

export const sendSuccessResponse = (
  res: Response,
  statusCode: number,
  data: any | null,
  message: string = "Request was successful"
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  details: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    details,
  });
};

export const encryptPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

export const generateToken = (payload: object): string => {
  const secretKey: string | undefined = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
  }
  return jwt.sign(payload, secretKey, { expiresIn: "1d" });
};

export const validateToken = (token: string): JwtPayload | null => {
  const secretKey: string | undefined = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
  }
  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const generateRandomString = (length: number): string => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset.charAt(randomIndex);
  }
  return result;
};

export const generateOtp = (): number => {
  const min = 1000;
  const max = 9999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const addMinutesToCurrentTime = (minutes: any) => {
  return new Date().getTime() + minutes * 60000;
};


