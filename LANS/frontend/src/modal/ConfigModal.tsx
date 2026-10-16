import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../state/useStore';
import {darkStyles, lightStyles} from '../../Styles'

interface ConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ConfigModal({ visible, onClose }: ConfigModalProps) {
  const { targetHost, updateTargetHost, theme, toggleTheme } = useStore();
  const [inputHost, setInputHost] = useState(targetHost);
  
  useEffect(() => {
    setInputHost(targetHost);
  }, [targetHost, visible]);

  const handleSave = async () => {
    Keyboard.dismiss();
    await updateTargetHost(inputHost);
    onClose();
  };

  const isDark = theme === 'dark';
  const styles = isDark ? darkStyles : lightStyles;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            {/* Modal Header */}
            <View style={styles.headerRow}>
              <View style={styles.titleContainer}>
                <Ionicons name="settings-outline" size={20} color={isDark ? '#818cf8' : '#4f46e5'} />
                <Text style={styles.modalTitle}>Gateway Settings</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Configure your backend WebSocket domain. Changes apply immediately upon saving.
            </Text>

            {/* Input Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Domain / IP</Text>
              <TextInput
                style={styles.textInput}
                value={inputHost}
                onChangeText={setInputHost}
                placeholder="e.g. zack-submammary-jacquiline.ngrok-free.dev"
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.hintText}>Protocol `wss://` and path `/ws` are added automatically.</Text>
            </View>

            {/* Theme Preference Row */}
            <View style={styles.prefRow}>
              <View>
                <Text style={styles.prefTitle}>Interface Theme</Text>
                <Text style={styles.prefSubtitle}>Currently using {theme} mode</Text>
              </View>
              <TouchableOpacity style={styles.themeToggleBtn} onPress={toggleTheme}>
                <Ionicons 
                  name={isDark ? 'sunny-outline' : 'moon-outline'} 
                  size={18} 
                  color={isDark ? '#f8fafc' : '#0f172a'} 
                />
                <Text style={styles.themeToggleText}>{isDark ? 'Light' : 'Dark'}</Text>
              </TouchableOpacity>
            </View>

            {/* Footer Action Buttons */}
            <View style={styles.footerActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save & Connect</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}