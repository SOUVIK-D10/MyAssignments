import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { CreateTaskScreen } from '../screens/tasks/CreateTaskScreen';
import { BinScreen } from '../screens/tasks/BinScreen';

export type RootStackParamList = {
  TaskList: undefined;
  TaskDetail: { id: string };
  CreateTask: undefined;
  Bin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, 
        contentStyle: { backgroundColor: '#0A0B10' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
      <Stack.Screen name="Bin" component={BinScreen} />
    </Stack.Navigator>
  );
};