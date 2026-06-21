import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models/user.model';
import { env } from '../../config/env';

const SALT_ROUNDS = 12;

export class AuthService {
  async register(email: string, password: string, name: string): Promise<{ user: IUser; token: string }> {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.create({ email: normalizedEmail, passwordHash, name });
    return { user, token: this.generateToken(user.id) };
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Deliberately generic error for BOTH "no such user" and "wrong password".
    // If these returned different messages, an attacker could enumerate which
    // emails have accounts on this system just by trying logins. Same message,
    // same response shape, regardless of which check actually failed.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new Error('Invalid email or password');
    }

    return { user, token: this.generateToken(user.id) };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  }
}