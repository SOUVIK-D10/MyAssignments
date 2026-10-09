import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../modules/User';
import { AppError } from '../../utils/AppError';
import TokenBlacklist from '../modules/TokenBlacklist';

async function registerService(email: string, password: string): Promise<any> {
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User with this email already exists.');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await User.create({ email, passwordHash });
    const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
    );
    return { token, user: { id: newUser._id, email: newUser.email } };
}

async function loginService(email: string, password: string): Promise<any> {
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password.');
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new Error('Invalid email or password.');
    }
    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
    );
    return { token, user: { id: user._id, email: user.email } };
}

async function logoutService(token: string): Promise<void> {
  if (!token) {
    throw new AppError('Token is required for logout.', 400);
  }
  await TokenBlacklist.create({ token });
}

async function changePasswordService(
  userId: string,
  oldPasswordInput: string,
  newPasswordInput: string
): Promise<void> {
  if (!oldPasswordInput || !newPasswordInput) {
    throw new AppError('Both old and new passwords are required.', 400);
  }

  if (oldPasswordInput === newPasswordInput) {
    throw new AppError('New password cannot be identical to the old password.', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 440);
  }

  // Verify old password against DB passwordHash
  const isMatch = await bcrypt.compare(oldPasswordInput, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Incorrect current password.', 401);
  }

  // Hash new password and update DB
  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPasswordInput, salt);
  await user.save();
}

export { registerService, loginService, logoutService, changePasswordService };