import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../store/useTaskStore';
import { TaskCard } from '../../components/TaskCard';

export const BinScreen = ({ navigation }: any) => {
  const { tasks, isLoading, fetchTasks, emptyBin } = useTaskStore();

  useEffect(() => {
    fetchTasks("deadline",true);
  }, []);

  // Filter tasks to show only soft-deleted items
  const deletedTasks = tasks.filter((task) => task.is_deleted);

  const handleEmptyBin = async () => {
    if (deletedTasks.length === 0) {
      return Alert.alert('Bin Empty', 'There are no deleted tasks to purge.');
    }

    Alert.alert(
      'Empty Recycle Bin',
      'Permanently remove all soft-deleted items? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty All',
          style: 'destructive',
          onPress: async () => {
            await emptyBin();
            fetchTasks("deadline",true);
          },
        },
      ]
    );
  };

  const handleRefresh = async ()=>{
    await fetchTasks("deadline",true);
  }
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B10" />
      <View style={styles.mainContainer}>
        {/* Top Header matching app theme */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>RECYCLE BIN</Text>
          {deletedTasks.length > 0 ? (
            <TouchableOpacity style={styles.purgeBtn} onPress={handleEmptyBin}>
              <Text style={styles.purgeText}>PURGE</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 45 }} />
          )}
        </View>

        {/* Scrollable List of Soft-Deleted Tasks */}
        <View style={styles.listWrapper}>
          <FlatList
            data={deletedTasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
                onComplete={() => navigation.navigate('TaskDetail', { id: item.id })}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor="#3B82F6" />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Recycle bin is completely empty.</Text>
            }
          />
        </View>
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
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  purgeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  purgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 40,
  },
  emptyText: {
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 60,
    fontSize: 12,
  },
});