import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../store/useTaskStore';
import { TaskCard } from '../../components/TaskCard';
import { useAuthStore } from '../../store/useAuthStore';
import { ChangePasswordModal } from '../../components/ChangePasswordModal';

export const TaskListScreen = ({ navigation }: any) => {
  const { tasks, isLoading, fetchTasks, markCompleted } = useTaskStore();
  const logout = useAuthStore((s) => s.logout);

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [showChooseMenu, setShowChooseMenu] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [completedFilter, setCompletedFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('PENDING');
  const [priorityFilter, setPriorityFilter] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    fetchTasks("priority", false);
  }, []);

  const isFilterActive = completedFilter !== 'PENDING' || priorityFilter !== 'ALL';

  const filteredTasks = tasks.filter((task) => {
    if (completedFilter === 'COMPLETED' && !task.is_completed) return false;
    if (completedFilter === 'PENDING' && task.is_completed) return false;
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
    return true;
  });

  const handleRefresh = async () => {
    await fetchTasks("priority", false);
  };

  const onRefreshHandler = () => {
    handleRefresh();
  };

  const handleLogout = async () => {
    setShowChooseMenu(false);
    await logout();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B10" />
      <View style={styles.mainContainer}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowChooseMenu(true)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          <Text style={styles.title}>TASK LIST</Text>

          <TouchableOpacity
            style={[styles.funnelBtn, isFilterActive && styles.funnelActiveBtn]}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={[styles.funnelText, isFilterActive && styles.funnelActiveText]}>
              Y
            </Text>
          </TouchableOpacity>
        </View>

        {/* Full-Height Scrollable Task List */}
        <View style={styles.listWrapper}>
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
                onComplete={() => markCompleted(item.id)}
              />
            )}
            refreshControl={
              //  Fixed
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => { handleRefresh(); }}
              />

            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No objectives found.</Text>
            }
          />
        </View>

        {/* Fixed Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CreateTask')}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        {/* Choose Navigation Overlay Modal */}
        <Modal visible={showChooseMenu} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowChooseMenu(false)}
          >
            <View style={styles.chooseBox}>
              <Text style={styles.chooseTitle}>NAVIGATION</Text>
              <TouchableOpacity
                style={styles.chooseBtn}
                onPress={() => setShowChooseMenu(false)}
              >
                <Text style={styles.chooseBtnText}>Task List</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chooseBtn}
                onPress={() => {
                  setShowChooseMenu(false);
                  navigation.navigate('Bin');
                }}
              >
                <Text style={styles.chooseBtnText}>Recycle Bin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chooseBtn, styles.logoutBtn]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chooseBtn}
                onPress={() => {
                  setShowChooseMenu(false);
                  setShowPasswordModal(true);
                }}
              >
                <Text style={styles.chooseBtnText}>Change Password</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chooseBtn, styles.leaveBtn]}
                onPress={() => setShowChooseMenu(false)}
              >
                <Text style={styles.leaveText}>{'=>'}</Text>
              </TouchableOpacity>

            </View>
          </TouchableOpacity>
        </Modal>

        {/* Filter Form Modal */}
        <Modal visible={showFilterModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.filterBox}>
              <Text style={styles.filterTitle}>FILTER FORM</Text>

              <Text style={styles.filterLabel}>COMPLETION STATUS</Text>
              <View style={styles.row}>
                {(['ALL', 'PENDING', 'COMPLETED'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      completedFilter === status && styles.filterChipActive,
                    ]}
                    onPress={() => setCompletedFilter(status)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        completedFilter === status && styles.chipTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>PRIORITY LEVEL</Text>
              <View style={styles.row}>
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 0, label: '0 (Low)' },
                  { key: 1, label: '1 (Mid)' },
                  { key: 2, label: '2 (High)' },
                ].map((p) => (
                  <TouchableOpacity
                    key={p.key.toString()}
                    style={[
                      styles.filterChip,
                      priorityFilter === p.key && styles.filterChipActive,
                    ]}
                    onPress={() => setPriorityFilter(p.key as any)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        priorityFilter === p.key && styles.chipTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.deactivateBtn}
                onPress={() => {
                  setCompletedFilter('ALL');
                  setPriorityFilter('ALL');
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.deactivateText}>DEACTIVATE FILTERS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.closeModalText}>APPLY & CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <ChangePasswordModal
          visible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0B10',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#141722',
  },
  title: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  iconBtn: {
    backgroundColor: '#141722',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1F2433',
  },
  menuIcon: {
    color: '#F3F4F6',
    fontSize: 14,
  },
  funnelBtn: {
    backgroundColor: '#141722',
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  funnelActiveBtn: {
    borderColor: '#22C55E',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  funnelText: {
    color: '#9CA3AF',
    fontWeight: '800',
    fontSize: 12,
  },
  funnelActiveText: {
    color: '#22C55E',
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 80,
  },
  emptyText: {
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 60,
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chooseBox: {
    backgroundColor: '#141722',
    width: '80%',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2433',
  },
  chooseTitle: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 1,
  },
  chooseBtn: {
    backgroundColor: '#0A0B10',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1F2433',
  },
  chooseBtnText: {
    color: '#F3F4F6',
    fontWeight: '700',
    fontSize: 12,
  },
  leaveBtn: {
    borderColor: '#374151',
  },
  leaveText: {
    color: '#6B7280',
    fontSize: 11,
  },
  filterBox: {
    backgroundColor: '#141722',
    width: '88%',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2433',
  },
  filterTitle: {
    color: '#F3F4F6',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
  },
  filterLabel: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1F2433',
    backgroundColor: '#0A0B10',
  },
  filterChipActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  chipText: {
    color: '#6B7280',
    fontSize: 10,
  },
  chipTextActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  deactivateBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  deactivateText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 10,
  },
  closeModalBtn: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  closeModalText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
  },
  logoutBtn: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 12,
  },
});