import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../modules/User';
import { AppError } from '../../utils/AppError';
import TokenBlacklist from '../modules/TokenBlacklist';

// REGISTRATION SERVICE. (Email Not verified and treated as username instead for simplicity)
async function registerService(email: string, password: string): Promise<any> {
    if (!email || !password) {
        throw new AppError('Email and password are required.', 400);
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('User with this email already exists.', 400);
    }
    //---------------PASSWORD HASHING-------------
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await User.create({ email, passwordHash });
    //-------------------------------------
    const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
    );
    return { token, user: { id: newUser._id, email: newUser.email } };
}

// LOGIN SERVICE. (MATCHES Password and email and generate access token)
async function loginService(email: string, password: string): Promise<any> {
    if (!email || !password) {
        throw new AppError('Email and password are required.', 400);
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('Invalid email or password.', 401);
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new AppError('Invalid email or password.', 401);
    }
    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
    );
    return { token, user: { id: user._id, email: user.email } };
}

// LOGOUT SERVICE. (MATCH TOKEN, PUT TOKEN IN Blacklist and then)
async function logoutService(token: string): Promise<void> {
  if (!token) {
    throw new AppError('Token is required for logout.', 400);
  }
  await TokenBlacklist.create({ token });
}

// CHANGE PASSWORD. 
/* 
    TAKES OLD AND NEW PASSWORD then COMPARES THEM IF SAME throws error,
    IF not matches old password with current and updates accordingly
 */
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
    throw new AppError('User not found.', 404);
  }

  const isMatch = await bcrypt.compare(oldPasswordInput, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Incorrect current password.', 401);
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPasswordInput, salt);
  await user.save();
}

// PUSH NOTIFICATION TOKEN UPDATE/OVERRIDE
async function updatePushTokenService(userId: string, pushToken: string): Promise<void> {
    if (!pushToken) {
        throw new AppError('Push token is required.', 400);
    }
    const user = await User.findByIdAndUpdate(
        userId, 
        { pushToken }, 
        { new: true, runValidators: true }
    );
    if (!user) {
        throw new AppError('User not found.', 404);
    }
}

export { registerService, loginService, logoutService, changePasswordService, updatePushTokenService };