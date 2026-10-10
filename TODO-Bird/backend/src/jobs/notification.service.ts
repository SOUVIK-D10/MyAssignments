// backend/src/services/notification.service.ts
import cron from 'node-cron';
import { Expo } from 'expo-server-sdk';
import Task from '../task/modules/Task';
import User from '../auth/modules/User';

const expo = new Expo();

export const initNotificationCron = () => {
  // Executes every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Target window: tasks due between 55 and 65 minutes from now
      const targetStart = new Date(now.getTime() + 55 * 60000);
      const targetEnd = new Date(now.getTime() + 65 * 60000);

      const tasksToNotify = await Task.find({
        is_completed: false,
        is_deleted: false,
        priority: 2, // High Priority
        notification_sent: false,
        deadline: { $gte: targetStart,$lte: targetEnd },
      });

      for (const task of tasksToNotify) {
        const user = await User.findById(task.userId);
        if (user && user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
          const messages = [{
            to: user.pushToken,
            sound: 'default',
            title: ' High Priority Deadline Alert!',
            body: `Objective "${task.title}" is due in 1 hour!`,
            data: { taskId: task._id },
          }];

          await expo.sendPushNotificationsAsync(messages as any);
          
          // Prevent duplicate dispatching
          task.notification_sent = true;
          await task.save();
        }
      }
    } catch (error) {
      console.error('Background notification cron error:', error);
    }
  });
};