import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createLogger } from '../utils/logger';

const logger = createLogger('auth-controller');

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // TODO: Save user to database
      const user = {
        id: 'uuid-placeholder',
        email,
        name,
        role: 'student',
        locale: 'bn-BD',
      };

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        success: true,
        data: user,
        message: 'User registered successfully',
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // TODO: Fetch user from database
      // const user = await getUserByEmail(email);

      // Mock user for demo
      const user = {
        id: 'uuid-placeholder',
        email,
        password: await bcrypt.hash('password123', 10),
        role: 'student',
      };

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'dev_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
      );

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          expiresIn: 7 * 24 * 60 * 60,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token required',
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret'
      ) as any;

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET || 'dev_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        data: {
          accessToken,
          expiresIn: 7 * 24 * 60 * 60,
        },
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      // TODO: Invalidate refresh token in Redis
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      // TODO: Get user from JWT token
      res.json({
        success: true,
        data: {
          id: 'uuid-placeholder',
          email: 'user@example.com',
          name: 'User Name',
          role: 'student',
        },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile',
      });
    }
  }
}
