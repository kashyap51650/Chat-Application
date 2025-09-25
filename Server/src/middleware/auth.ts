import { AuthenticationError } from "apollo-server-express";
import { Context } from "../types";
import { verifyToken, extractTokenFromHeader } from "../utils/auth";
import { User } from "../models";

export const getUser = async (req: any): Promise<Context> => {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return { isAuth: false };
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return { isAuth: false };
    }

    return {
      user,
      isAuth: true,
    };
  } catch (error) {
    return { isAuth: false };
  }
};

export const requireAuth = (context: Context) => {
  if (!context.isAuth || !context.user) {
    throw new AuthenticationError(
      "You must be logged in to perform this action"
    );
  }
  return context.user;
};
