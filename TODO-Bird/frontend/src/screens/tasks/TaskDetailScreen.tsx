import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskStore, TaskCategory } from '../../store/useTaskStore';

export const TaskDetailScreen = ({ route, navigation }: any) => {
  const priorityWrap = ['LOW', 'MID', 'HIGH'];
  const categories: TaskCategory[] = ['WORK', 'PERSONAL', 'ACADEMIC', 'HEALTH', 'SYSTEM'];

  const { id } = route.params;
  const {
    selectedTask,
    fetchTaskById,
    addToBin,
    markCompleted,
    updateTask,
    isLoading,
    removeFromBin,
    fetchTasks,
    restoreFromBin,
  } = useTaskStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState(1);
  const [editCategory, setEditCategory] = useState<TaskCategory>('PERSONAL');
  const [editDeadline, setEditDeadline] = useState(new Date());

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  useEffect(() => {
    fetchTaskById(id);
  }, [id]);

  useEffect(() => {
    if (selectedTask) {
      setEditTitle(selectedTask.title);
      setEditDesc(selectedTask.description || '');
      setEditPriority(selectedTask.priority);
      setEditCategory(selectedTask.category || 'PERSONAL');
      if (selectedTask.deadline) {
        setEditDeadline(new Date(selectedTask.deadline));
      }
    }
  }, [selectedTask]);

  if (isLoading || !selectedTask) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.loadingText}>LOADING DETAILS...</Text>
      </SafeAreaView>
    );
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setEditDeadline(selectedDate);
    }
  };

  const openPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateTask(id, {
        title: editTitle,
        description: editDesc,
        priority: editPriority,
        category: editCategory,
        deadline: editDeadline.toISOString(),
      });
      setIsEditing(false);
      Alert.alert('Success', 'Objective updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Update failed.');
    }
  };

  const handleAction = async () => {
    if (selectedTask.is_deleted) {
      Alert.alert('Restore', 'Restoring task...');
      await restoreFromBin(selectedTask.id);
      navigation.goBack();
      return;
    }

    if (!selectedTask.is_completed) {
      await markCompleted(id);
      fetchTaskById(id);
    }
  };

  const handleSoftDelete = async () => {
    Alert.alert(
      'MOVE THIS ITEM TO BIN',
      'Move This item to bin.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'MOVED TO BIN',
          style: 'destructive',
          onPress: async () => {
            await addToBin(id);
            fetchTasks('deadline', true);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleHardDelete = async () => {
    Alert.alert(
      'DELETE THIS ITEM',
      'Permanently remove this soft-deleted item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE PERMANENT',
          style: 'destructive',
          onPress: async () => {
            await removeFromBin(id);
            fetchTasks('deadline', true);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{!isEditing ? 'Details' : 'Editing'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Title */}
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={editTitle}
            onChangeText={setEditTitle}
          />
        ) : (
          <View style={styles.box}>
            <Text style={styles.boxLabel}>TITLE</Text>
            <Text style={styles.titleText}>{selectedTask.title}</Text>
          </View>
        )}

        {/* Description */}
        {isEditing ? (
          <TextInput
            style={[styles.editInput, { height: 80 }]}
            multiline
            value={editDesc}
            onChangeText={setEditDesc}
          />
        ) : (
          <View style={styles.box}>
            <Text style={styles.boxLabel}>Description</Text>
            <Text style={styles.descText}>
              {selectedTask.description || 'No description provided.'}
            </Text>
          </View>
        )}

        {/* Category Selection / View */}
        {isEditing ? (
          <View style={styles.box}>
            <Text style={styles.boxLabel}>CATEGORY</Text>
            <View style={styles.categoryRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    editCategory === cat && styles.categoryBtnActive,
                  ]}
                  onPress={() => setEditCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryBtnText,
                      editCategory === cat && styles.categoryBtnTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.box}>
            <Text style={styles.boxLabel}>CATEGORY</Text>
            <Text style={styles.valueText}>{selectedTask.category || 'PERSONAL'}</Text>
          </View>
        )}

        {/* Priority & Deadline Row */}
        <View style={styles.row}>
          {isEditing ? (
            <View style={[styles.box, { flex: 2, marginRight: 8 }]}>
              <Text style={styles.boxLabel}>PRIORITY</Text>
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
                      editPriority === item.level && styles.priorityBtnActive,
                    ]}
                    onPress={() => setEditPriority(item.level)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        editPriority === item.level && styles.priorityTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={[styles.box, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.boxLabel}>PRIORITY</Text>
              <Text style={styles.valueText}>{priorityWrap[selectedTask.priority]}</Text>
            </View>
          )}

          {isEditing ? (
            <View style={[styles.box, { flex: 1.5 }]}>
              <Text style={styles.boxLabel}>DEADLINE</Text>
              <View style={styles.editDateTimeRow}>
                <TouchableOpacity style={styles.miniPickerBtn} onPress={() => openPicker('date')}>
                  <Text style={styles.miniPickerText}>📅 {editDeadline.toISOString().split('T')[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniPickerBtn} onPress={() => openPicker('time')}>
                  <Text style={styles.miniPickerText}>⏰ {editDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.box, { flex: 1.5 }]}>
              <Text style={styles.boxLabel}>DEADLINE</Text>
              <Text style={styles.valueText}>
                {new Date(selectedTask.deadline).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Native DateTimePicker Component */}
        {showPicker && (
          <DateTimePicker
            value={editDeadline}
            mode={pickerMode}
            is24Hour={true}
            display="default"
            onValueChange={handleDateChange}
          />
        )}

        {/* Completion Status & Timestamps Row */}
        <View style={styles.row}>
          <View style={[styles.box, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.boxLabel}>Completion Status</Text>
            <Text
              style={[
                styles.valueText,
                { color: selectedTask.is_completed ? '#22C55E' : '#EAB308' },
              ]}
            >
              {selectedTask.is_completed ? 'Completed' : 'TODO'}
            </Text>
          </View>

          <View style={[styles.box, { flex: 1 }]}>
            <Text style={styles.boxLabel}>Created / Updated</Text>
            <Text style={styles.metaText}>
              C: {new Date(selectedTask.createdAt || (selectedTask as any).created_at || Date.now()).toLocaleDateString()}
            </Text>
            <Text style={styles.metaText}>
              U: {new Date(selectedTask.updatedAt || (selectedTask as any).updated_at || Date.now()).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Bottom Action Controls */}
        <View style={styles.bottomBar}>
          {!isEditing &&
            (selectedTask.is_deleted || !selectedTask.completed_at) && (
              <TouchableOpacity
                style={[
                  styles.mainActionBtn,
                  selectedTask.is_completed ? styles.redBtn : styles.greenBtn,
                ]}
                onPress={handleAction}
              >
                <Text style={styles.actionBtnText}>
                  {selectedTask.is_deleted
                    ? '♻️ RESTORE'
                    : '✓ MARK COMPLETE'}
                </Text>
              </TouchableOpacity>
            )}

          {!selectedTask?.is_completed && !selectedTask?.is_deleted && (
            <View style={styles.rightActionGroup}>
              {isEditing && (
                <TouchableOpacity
                  style={[
                    styles.cancelBtn,
                    styles.mainActionBtn
                  ]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.cancelText}>✕</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.pencilBtn,
                  isEditing && styles.mainActionBtn
                ]}
                onPress={() => {
                  if (isEditing) handleSaveEdit();
                  else setIsEditing(true);
                }}
              >
                <Text style={styles.pencilText}>{isEditing ? '💾' : '✏️'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isEditing && !selectedTask?.is_deleted && (
            <TouchableOpacity
              style={[
                styles.redBtn,
                selectedTask?.is_completed ? styles.mainActionBtn : styles.pencilBtn
              ]}
              onPress={() => handleSoftDelete()}
            >
              <Text style={styles.actionBtnText}>🗑️{selectedTask?.is_completed ? ' Move To Bin' : ''}</Text>
            </TouchableOpacity>
          )}

          {selectedTask?.is_deleted && (
            <TouchableOpacity
              style={[styles.mainActionBtn, styles.redBtn]}
              onPress={handleHardDelete}
            >
              <Text style={styles.actionBtnText}>🗑️ DELETE</Text>
            </TouchableOpacity>
          )}
        </View>
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
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  box: {
    backgroundColor: '#141722',
    borderWidth: 1,
    borderColor: '#1F2433',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  boxLabel: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleText: {
    color: '#F3F4F6',
    fontSize: 15,
    fontWeight: '700',
  },
  descText: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
  },
  valueText: {
    color: '#F3F4F6',
    fontSize: 12,
    fontWeight: '600',
  },
  metaText: {
    color: '#6B7280',
    fontSize: 10,
  },
  editInput: {
    backgroundColor: '#141722',
    borderColor: '#3B82F6',
    borderWidth: 1,
    color: '#F3F4F6',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  editDateTimeRow: {
    gap: 4,
  },
  miniPickerBtn: {
    backgroundColor: '#0A0B10',
    borderColor: '#1F2433',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 4,
    alignItems: 'center',
  },
  miniPickerText: {
    color: '#F3F4F6',
    fontSize: 10,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  mainActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginRight: 0,
  },
  greenBtn: {
    backgroundColor: '#22C55E',
  },
  redBtn: {
    backgroundColor: '#EF4444',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  pencilBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#141722',
    borderColor: '#1F2433',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pencilText: {
    fontSize: 16,
  },
  loadingText: {
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 100,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
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
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  categoryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1F2433',
    borderRadius: 6,
    backgroundColor: '#0A0B10',
  },
  categoryBtnActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  categoryBtnText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 10,
  },
  categoryBtnTextActive: {
    color: '#3B82F6',
  },
  rightActionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#381414',
    borderColor: '#592525',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: 'bold',
  },
});