import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth/auth.service';
import { User } from '../models/user.model';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middleware/requireAuth';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const authService = new AuthService();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = registerSchema.parse(req.body);
      const { user, token } = await authService.register(email, password, name);
      res.cookie(env.COOKIE_NAME, token, COOKIE_OPTIONS);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { user, token } = await authService.login(email, password);
      res.cookie(env.COOKIE_NAME, token, COOKIE_OPTIONS);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.clearCookie(env.COOKIE_NAME , {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
    });
    res.json({ success: true, message: 'Logged out' });
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}