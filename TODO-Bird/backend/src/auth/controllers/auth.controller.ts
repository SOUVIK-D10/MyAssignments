import { Request, Response } from 'express';
import { changePasswordService, loginService, logoutService, registerService, updatePushTokenService } from '../services/auth.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

// USER REGISTRATION
const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const { token, user } = await registerService(email, password);

        res.status(201).json({
            message: 'User registered successfully.',
            token,
            user: { id: user.id, email: user.email },
        });
    } catch (error) {
        const statusCode = (error as any).statusCode || 500;
        res.status(statusCode).json({ message: error instanceof Error ? error.message : 'Server error.' });
    }
};

// USER LOGIN
const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const { token, user } = await loginService(email, password);

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: { id: user._id, email: user.email },
        });
    } catch (error) {
        const statusCode = (error as any).statusCode || 500;
        res.status(statusCode).json({ message: error instanceof Error ? error.message : 'Server error.' });
    }
};

// USER LOGOUT
const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const token = req.token;
        if (token) {
            await logoutService(token);
        }

        res.status(200).json({
            message: 'Logout successful. Token invalidated.',
        });
    } catch (error) {
        const statusCode = (error as any).statusCode || 500;
        res.status(statusCode).json({ message: error instanceof Error ? error.message : 'Server error.' });
    }
};

// RESET / CHANGE PASSWORD
const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { oldPassword, newPassword } = req.body;

        await changePasswordService(userId, oldPassword, newPassword);

        res.status(200).json({
            message: 'Password changed successfully.',
        });
    } catch (error) {
        const statusCode = (error as any).statusCode || 500;
        res.status(statusCode).json({ message: error instanceof Error ? error.message : 'Server error.' });
    }
};

const updatePushToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { pushToken } = req.body;

        await updatePushTokenService(userId, pushToken);

        res.status(200).json({
            message: 'Push token registered successfully.',
        });
    } catch (error) {
        const statusCode = (error as any).statusCode || 500;
        res.status(statusCode).json({ 
            message: error instanceof Error ? error.message : 'Server error during push token registration.' 
        });
    }
};

export { register, login, logout, changePassword, updatePushToken };