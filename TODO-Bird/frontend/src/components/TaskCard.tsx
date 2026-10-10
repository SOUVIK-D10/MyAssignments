import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LightTask } from '../store/useTaskStore';

interface Props {
  task: LightTask;
  onPress: () => void;
  onComplete: () => void;
}

export const TaskCard: React.FC<Props> = ({ task, onPress, onComplete }) => {
  const formattedDeadline = new Date(task.deadline).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Border Color Rules based on priority / status
  const getBorderColor = () => {
    if (task.is_completed) return '#22C55E'; // GREEN if completed
    switch (task.priority) {
      case 1:
        return '#3B82F6'; // BLUE for Priority 1
      case 2:
        return '#EAB308'; // YELLOW for Priority 2
      case 0:
      default:
        return '#1F2433'; // Slate for Priority 0
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, { borderColor: getBorderColor() }]}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          {task.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
          )}
        </View>
        <Text style={styles.deadline}>{formattedDeadline}</Text>
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={[styles.completeBtn, task.is_completed && styles.completedBtn]}
          onPress={onComplete}
          disabled={task.is_completed}
        >
          <Text style={styles.completeText}>
            {task.is_completed ? '✓ COMPLETED' : 'MARK COMPLETE'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141722',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    width: '94%',
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: '#F3F4F6',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: '#1F2433',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    color: '#3B82F6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deadline: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
  },
  bottomRow: {
    alignItems: 'flex-end',
  },
  completeBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  completedBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22C55E',
  },
  completeText: {
    color: '#F3F4F6',
    fontSize: 10,
    fontWeight: '800',
  },
});