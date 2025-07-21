import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/twitch";
import { JWTPayload, AuthenticatedRequest } from "../types/auth";

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.get('Authorization');
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as JWTPayload;
    
    // Check if userId is a valid CUID2 format (24-30 character alphanumeric starting with letter)
    const cuid2Pattern = /^[a-z][a-z0-9]{23,29}$/;
    if (!cuid2Pattern.test(decoded.userId)) {
      console.error("Invalid userId format in token:", decoded.userId);
      res.status(403).json({ 
        error: "Invalid token format. Please re-authenticate.", 
        code: "TOKEN_FORMAT_INVALID" 
      });
      return;
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.get('Authorization');
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as JWTPayload;
      req.user = decoded;
    } catch (error) {
      console.error("Optional auth token verification error:", error);
    }
  }

  next();
};
