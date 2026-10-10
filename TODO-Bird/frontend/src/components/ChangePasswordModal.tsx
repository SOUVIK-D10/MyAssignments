import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axiosInstance from '../api/axiosInstance';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in both password fields.');
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert('Error', 'New password cannot be identical to the old password.');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });

      Alert.alert('Success', response.data.message || 'Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      onClose();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update password.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>CHANGE PASSWORD</Text>

          <Text style={styles.label}>CURRENT PASSWORD</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Enter current password"
            placeholderTextColor="#4B5563"
            value={oldPassword}
            onChangeText={setOldPassword}
          />

          <Text style={styles.label}>NEW PASSWORD</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Enter new password"
            placeholderTextColor="#4B5563"
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => {
                setOldPassword('');
                setNewPassword('');
                onClose();
              }}
            >
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.submitBtn]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? 'SAVING...' : 'UPDATE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#141722',
    width: '85%',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2433',
  },
  modalTitle: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
  },
  label: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0A0B10',
    borderColor: '#1F2433',
    borderWidth: 1,
    color: '#F3F4F6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 14,
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#0A0B10',
    borderWidth: 1,
    borderColor: '#1F2433',
  },
  cancelText: {
    color: '#6B7280',
    fontWeight: '800',
    fontSize: 11,
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
});