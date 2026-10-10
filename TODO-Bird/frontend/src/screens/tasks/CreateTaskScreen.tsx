import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskStore } from '../../store/useTaskStore';

export const CreateTaskScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(1);

  // Single deadline state storing a full Date object
  const defaultDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const [deadline, setDeadline] = useState<Date>(defaultDate);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const createTask = useTaskStore((s) => s.createTask);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const openPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  // Quick preset helper buttons
  const setQuickDeadline = (hoursAhead: number) => {
    const d = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
    setDeadline(d);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      return Alert.alert('Validation Error', 'Title cannot be empty.');
    }

    if (isNaN(deadline.getTime())) {
      return Alert.alert('Validation Error', 'Invalid date/time format.');
    }

    if (deadline.getTime() < Date.now()) {
      return Alert.alert('Validation Error', 'Deadline cannot be set in the past.');
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      assigned_at: new Date().toISOString(),
      deadline: deadline.toISOString(),
      priority: priority,
    };

    try {
      await createTask(payload);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not create task.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Add Task</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.formContainer} contentContainerStyle={styles.content}>
        <Text style={styles.label}>NAME *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter task name"
          placeholderTextColor="#4B5563"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter description"
          placeholderTextColor="#4B5563"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>PRIORITY</Text>
        <View style={styles.priorityRow}>
          {[
            { level: 0, label: 'Low' },
            { level: 1, label: 'Mid' },
            { level: 2, label: 'High' },
          ].map((item) => (
            <TouchableOpacity
              key={item.level}
              style={[
                styles.priorityBtn,
                priority === item.level && styles.priorityBtnActive,
              ]}
              onPress={() => setPriority(item.level)}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === item.level && styles.priorityTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>DEADLINE</Text>
        
        {/* Quick Presets */}
        <View style={styles.presetsRow}>
          <TouchableOpacity style={styles.presetChip} onPress={() => setQuickDeadline(2)}>
            <Text style={styles.presetText}>+2 Hours</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.presetChip} onPress={() => setQuickDeadline(24)}>
            <Text style={styles.presetText}>Tomorrow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.presetChip} onPress={() => setQuickDeadline(168)}>
            <Text style={styles.presetText}>Next Week</Text>
          </TouchableOpacity>
        </View>

        {/* Date & Time Selection Triggers */}
        <View style={styles.dateTimeRow}>
          <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('date')}>
            <Text style={styles.pickerButtonLabel}>DATE</Text>
            <Text style={styles.pickerButtonValue}>
              📅 {deadline.toISOString().split('T')[0]}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('time')}>
            <Text style={styles.pickerButtonLabel}>TIME</Text>
            <Text style={styles.pickerButtonValue}>
              ⏰ {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Native DateTimePicker Component */}
        {showPicker && (
          <DateTimePicker
            value={deadline}
            mode={pickerMode}
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
          />
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>SUBMIT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0B10',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#141722',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 12,
  },
  topBarTitle: {
    color: '#F3F4F6',
    fontWeight: '800',
    fontSize: 14,
  },
  formContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#141722',
    borderColor: '#1F2433',
    borderWidth: 1,
    color: '#F3F4F6',
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
    fontSize: 13,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1F2433',
    borderRadius: 6,
    alignItems: 'center',
  },
  priorityBtnActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  priorityText: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: 12,
  },
  priorityTextActive: {
    color: '#3B82F6',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  presetChip: {
    backgroundColor: '#141722',
    borderColor: '#1F2433',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  presetText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: '#141722',
    borderColor: '#1F2433',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
  },
  pickerButtonLabel: {
    color: '#4B5563',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 4,
  },
  pickerButtonValue: {
    color: '#F3F4F6',
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 12,
  },
});