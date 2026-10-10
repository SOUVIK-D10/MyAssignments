import React, { useEffect, useState, useMemo } from 'react';
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
import {
  FilterModal,
  CompletionFilter,
  PriorityFilter,
  CategoryFilter,
  SortField,
  SortOrder,
} from '../../components/FilterModel';
import { FocusModeModal } from '../../components/FocusModeModal';

export const TaskListScreen = ({ navigation }: any) => {
  const { tasks, isLoading, fetchTasks, markCompleted } = useTaskStore();
  const logout = useAuthStore((s) => s.logout);

  const [showFocusModal, setShowFocusModal] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showChooseMenu, setShowChooseMenu] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter and Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [completedFilter, setCompletedFilter] = useState<CompletionFilter>('PENDING');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchTasks("priority", false);
  }, []);

  const isFilterActive =
    completedFilter !== 'PENDING' ||
    priorityFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    searchQuery.trim() !== '' ||
    sortField !== 'deadline' ||
    sortOrder !== 'asc';

  // Client-side filtering & multi-level sorting logic
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search Filter
        if (
          searchQuery &&
          !task.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Completion Status Filter
        if (completedFilter === 'COMPLETED' && !task.is_completed) return false;
        if (completedFilter === 'PENDING' && task.is_completed) return false;

        // Priority Filter
        if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;

        // Category Filter
        if (categoryFilter !== 'ALL' && task.category !== categoryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let diff = 0;

        // 1. Primary Sort Criteria
        if (sortField === 'deadline') {
          diff = new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
          // Tie-breaker: Default sort by Category
          if (diff === 0) {
            diff = (a.category || '').localeCompare(b.category || '');
          }
        } else if (sortField === 'priority') {
          diff = a.priority - b.priority;
          // Tie-breaker: Default sort by Category
          if (diff === 0) {
            diff = (a.category || '').localeCompare(b.category || '');
          }
        } else if (sortField === 'category') {
          diff = (a.category || '').localeCompare(b.category || '');
          // Tie-breaker: Default sort by Priority
          if (diff === 0) {
            diff = a.priority - b.priority;
          }
        } else if (sortField === 'title') {
          diff = a.title.localeCompare(b.title);
        }

        // Apply Order Direction
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [tasks, searchQuery, completedFilter, priorityFilter, categoryFilter, sortField, sortOrder]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCompletedFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
    setSortField('deadline');
    setSortOrder('asc');
    setShowFilterModal(false);
  };

  const handleRefresh = async () => {
    await fetchTasks("priority", false);
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
            style={styles.focusHeaderBtn}
            onPress={() => setShowFocusModal(true)}
          >
            <Text style={styles.focusHeaderBtnText}>⚡ FOCUS</Text>
          </TouchableOpacity>

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
            data={filteredAndSortedTasks}
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
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
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

        {/* Standalone Filter & Sort Modal */}
        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          completedFilter={completedFilter}
          setCompletedFilter={setCompletedFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortField={sortField}
          setSortField={setSortField}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onReset={handleResetFilters}
        />
        <ChangePasswordModal
          visible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
        <FocusModeModal
          visible={showFocusModal}
          onClose={() => setShowFocusModal(false)}
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
  logoutBtn: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 12,
  },
  focusHeaderBtn: {
    backgroundColor: '#141722',
    borderWidth: 1,
    borderColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  focusHeaderBtnText: {
    color: '#3B82F6',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});