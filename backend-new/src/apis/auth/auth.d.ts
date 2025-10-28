import { Request } from "express";

export interface AuthRequest extends Request {
  creator?: {
    id: string;
    role: "user" | "organization";
    [key: string]: any;
  };
}
