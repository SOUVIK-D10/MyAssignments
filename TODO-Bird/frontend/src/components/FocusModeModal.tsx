import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';

interface FocusModeModalProps {
  visible: boolean;
  onClose: () => void;
  taskTitle?: string;
}

const AMBIENT_SOUNDSCAPES = [
  { id: 'lofi', title: '🎧 Lo-Fi Chill Beats' },
  { id: 'rain', title: '🌧️ Ambient Rain & Thunder' },
  { id: 'synth', title: '🌌 Deep Space Synth' },
];

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  visible,
  onClose,
  taskTitle,
}) => {
  // --- Pomodoro Timer State ---
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // --- Soundscape State (Visual Only) ---
  const [activeSoundscape, setActiveSoundscape] = useState<string | null>(null);

  // --- Hydration Reminder State ---
  const [waterIntervalMin, setWaterIntervalMin] = useState('30');
  const [waterTimeLeft, setWaterTimeLeft] = useState<number | null>(null);
  const [isWaterActive, setIsWaterActive] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waterRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeLeft(timerMinutes * 60);
  }, [timerMinutes]);

  // Pomodoro Countdown
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      Alert.alert('⚡ Focus Cycle Complete', 'Great work! Take a break.');
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  // Hydration Countdown
  useEffect(() => {
    if (isWaterActive && waterTimeLeft !== null && waterTimeLeft > 0) {
      waterRef.current = setTimeout(() => {
        setWaterTimeLeft((prev) => (prev ? prev - 1 : 0));
      }, 1000);
    } else if (waterTimeLeft === 0 && isWaterActive) {
      Alert.alert('💧 Hydration Reminder', 'Time to drink water and stay sharp!');
      const mins = parseInt(waterIntervalMin, 10) || 30;
      setWaterTimeLeft(mins * 60);
    }
    return () => {
      if (waterRef.current) clearTimeout(waterRef.current);
    };
  }, [isWaterActive, waterTimeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartWaterReminder = () => {
    const mins = parseInt(waterIntervalMin, 10);
    if (isNaN(mins) || mins <= 0) {
      return Alert.alert('Invalid Input', 'Please enter a valid duration in minutes.');
    }
    setWaterTimeLeft(mins * 60);
    setIsWaterActive(true);
    Alert.alert('Reminder Set', `You will be reminded to drink water every ${mins} minutes.`);
  };

  const handleToggleSoundscape = (id: string) => {
    setActiveSoundscape(activeSoundscape === id ? null : id);
  };

  const handleClose = () => {
    setIsTimerRunning(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>⚡ FOCUS MODE</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {taskTitle && (
            <Text style={styles.activeTaskText} numberOfLines={1}>
              Active Objective: {taskTitle}
            </Text>
          )}

          {/* 1. Pomodoro Timer */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>POMODORO TIMER</Text>
            <Text style={styles.timerDisplay}>{formatTime(timeLeft)}</Text>

            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  isTimerRunning ? styles.pauseBtn : styles.startBtn,
                ]}
                onPress={() => setIsTimerRunning(!isTimerRunning)}
              >
                <Text style={styles.btnText}>
                  {isTimerRunning ? 'PAUSE' : 'START'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => {
                  setIsTimerRunning(false);
                  setTimeLeft(timerMinutes * 60);
                }}
              >
                <Text style={styles.secondaryBtnText}>RESET</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.presetRow}>
              {[15, 25, 45, 60].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.chip,
                    timerMinutes === m && styles.chipActive,
                  ]}
                  onPress={() => {
                    setIsTimerRunning(false);
                    setTimerMinutes(m);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      timerMinutes === m && styles.chipTextActive,
                    ]}
                  >
                    {m}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 2. Ambient Soundscapes Section (Visual Only) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>AMBIENT SOUNDSCAPES (VISUAL MODE)</Text>
            <View style={styles.trackList}>
              {AMBIENT_SOUNDSCAPES.map((soundscape) => {
                const isSelected = activeSoundscape === soundscape.id;
                return (
                  <TouchableOpacity
                    key={soundscape.id}
                    style={[
                      styles.trackBtn,
                      isSelected && styles.trackBtnActive,
                    ]}
                    onPress={() => handleToggleSoundscape(soundscape.id)}
                  >
                    <Text
                      style={[
                        styles.trackText,
                        isSelected && styles.trackTextActive,
                      ]}
                    >
                      {soundscape.title}
                    </Text>
                    <Text style={styles.statusIndicator}>
                      {isSelected ? '▶ ACTIVE' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. Hydration Reminder Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>HYDRATION REMINDER</Text>
            <View style={styles.waterRow}>
              <TextInput
                style={styles.waterInput}
                keyboardType="numeric"
                value={waterIntervalMin}
                onChangeText={setWaterIntervalMin}
                placeholder="Mins"
                placeholderTextColor="#4B5563"
              />
              <Text style={styles.waterUnit}>MINS</Text>

              {!isWaterActive ? (
                <TouchableOpacity
                  style={styles.waterStartBtn}
                  onPress={handleStartWaterReminder}
                >
                  <Text style={styles.waterBtnText}>SET ALARM</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.waterStopBtn}
                  onPress={() => {
                    setIsWaterActive(false);
                    setWaterTimeLeft(null);
                  }}
                >
                  <Text style={styles.waterBtnText}>
                    STOP ({formatTime(waterTimeLeft || 0)})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#141722',
    width: '90%',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1F2433',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTaskText: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: '#0A0B10',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1F2433',
    marginBottom: 12,
  },
  sectionLabel: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  timerDisplay: {
    color: '#F3F4F6',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    marginVertical: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  primaryBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  startBtn: {
    backgroundColor: '#22C55E',
  },
  pauseBtn: {
    backgroundColor: '#EAB308',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#1F2433',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#9CA3AF',
    fontWeight: '800',
    fontSize: 11,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1F2433',
    backgroundColor: '#141722',
  },
  chipActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  chipText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#3B82F6',
  },
  trackList: {
    gap: 6,
  },
  trackBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#141722',
    borderWidth: 1,
    borderColor: '#1F2433',
    padding: 8,
    borderRadius: 6,
  },
  trackBtnActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  trackText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  trackTextActive: {
    color: '#F3F4F6',
  },
  statusIndicator: {
    color: '#3B82F6',
    fontSize: 9,
    fontWeight: '800',
  },
  waterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waterInput: {
    backgroundColor: '#141722',
    borderColor: '#1F2433',
    borderWidth: 1,
    borderRadius: 6,
    color: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 60,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  waterUnit: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '800',
  },
  waterStartBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  waterStopBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  waterBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
  },
});