import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  priority: number;
}

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
  const getBadgeDetails = () => {
    switch (priority) {
      case 2:
        return { label: 'HIGH', color: '#EF4444', border: '#7F1D1D' };
      case 1:
        return { label: 'MID', color: '#3B82F6', border: '#1E3A8A' };
      default:
        return { label: 'LOW', color: '#6B7280', border: '#374151' };
    }
  };

  const { label, color, border } = getBadgeDetails();

  return (
    <View style={[styles.badge, { borderColor: border }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(10, 11, 16, 0.6)',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});