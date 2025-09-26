import { UserInputError, AuthenticationError } from "apollo-server-express";
import { Context } from "../types";
import { User } from "../models";
import { hashPassword, comparePasswords, generateToken } from "../utils/auth";
import { requireAuth } from "../middleware/auth";

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      return user;
    },

    users: async (_: any, __: any, context: Context) => {
      requireAuth(context);
      return await User.find({}).sort({ createdAt: -1 });
    },

    user: async (_: any, { id }: { id: string }, context: Context) => {
      requireAuth(context);
      const user = await User.findById(id);
      if (!user) {
        throw new UserInputError("User not found");
      }
      return user;
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: any }) => {
      const { username, email, password } = input;

      // Validate input
      if (!username || username.length < 3) {
        throw new UserInputError("Username must be at least 3 characters long");
      }

      if (!email || !email.includes("@")) {
        throw new UserInputError("Please provide a valid email address");
      }

      if (!password || password.length < 6) {
        throw new UserInputError("Password must be at least 6 characters long");
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        throw new UserInputError(
          "User with this email or username already exists"
        );
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });

      await user.save();

      // Generate token
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      return {
        token,
        user,
      };
    },

    login: async (_: any, { input }: { input: any }) => {
      const { email, password } = input;
      // Find user
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        throw new AuthenticationError("Invalid email or password");
      }

      // Check password
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError("Invalid email or password");
      }

      // Update online status
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      // Generate token
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      return {
        token,
        user,
      };
    },

    updateOnlineStatus: async (
      _: any,
      { isOnline }: { isOnline: boolean },
      context: Context
    ) => {
      const user = requireAuth(context);

      user.isOnline = isOnline;
      user.lastSeen = new Date();
      await user.save();

      return user;
    },
  },
};
