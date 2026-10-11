/*
                            NOTIFICATION SENDING CORN JOB
*/

import cron from 'node-cron';
import { Expo } from 'expo-server-sdk';
import Task from '../task/modules/Task';
import User from '../auth/modules/User';

const expo = new Expo();
//           THE CODE HAS A N+1 Query problem
export const initNotificationCron = () => {
  /*
    Executes every minute to check for lv 2 Task 
  */
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      const targetStart = now;
      const targetEnd = new Date(now.getTime() + 24 * 60 * 60000); // Next 24 hours

      // Fetches tasks to notify
      const tasksToNotify = await Task.find({
        is_completed: false,
        is_deleted: false,
        priority: 2,
        notification_sent: false,
        deadline: { $gte: targetStart, $lte: targetEnd },
      });

      // Main Loop That launches notifications
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

          // await expo.sendPushNotificationsAsync();
          let receipts = await expo.sendPushNotificationsAsync(messages as any);
          console.log("Expo Push Receipts:", receipts);

          // Prevent duplicate dispatching
          task.notification_sent = true;
          await task.save();
        }
      }
    } catch (error) {
      // This one is built for server side logs.
      console.error('Background notification cron error:', error);
    }
  });
};