import React, { useEffect, useState } from 'react';
import { Text, View, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from './src/state/useStore';
import HomeScreen from './src/screen/HomeScreen';
import ConfigModal from './src/modal/ConfigModal';
import { useWebSocket } from './src/api/WebSockets';
import { AppStyle } from './Styles';

export default function App() {
  const { 
    activeWsUrl, 
    theme, 
    initializeConfig, 
    setIsConnected, 
    setStatusText, 
    statusText,
    isConnected,
    addLead 
  } = useStore();

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // 1. Load initial persisted configuration on app startup
  useEffect(() => {
    initializeConfig();
  }, []);

  // 2. Consume the custom WebSocket hook from src/api/WebSockets.tsx
  const wsStatus = useWebSocket({
    url: activeWsUrl,
    onMessage: (newLead) => {
      addLead(newLead);
    },
  });

  // Sync hook status back to Zustand store if needed across components
  useEffect(() => {
    setIsConnected(wsStatus.isConnected);
    setStatusText(wsStatus.statusText);
  }, [wsStatus.isConnected, wsStatus.statusText]);

  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[AppStyle.container, isDark ? AppStyle.darkBg : AppStyle.lightBg]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[AppStyle.header, isDark ? AppStyle.darkHeader : AppStyle.lightHeader]}>
        <View>
          <Text style={[AppStyle.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>LANS Mobile</Text>
          <View style={AppStyle.statusRow}>
            <View style={[AppStyle.statusDot, { backgroundColor: isConnected ? '#10b981' : '#f43f5e' }]} />
            <Text style={AppStyle.statusText}>{statusText}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => setIsConfigOpen(true)} 
          style={[AppStyle.settingsBtn, isDark ? AppStyle.darkSettingsBtn : AppStyle.lightSettingsBtn]}
        >
          <Ionicons name="settings-outline" size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
        </TouchableOpacity>
      </View>

      {/* Main Screen Content */}
      <HomeScreen />

      {/* Configuration Modal */}
      <ConfigModal visible={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </SafeAreaView>
  );
}