import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getMobileApiBaseUrl, setMobileApiBaseUrl, mobileApi } from '../services/api';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onUrlChanged: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onUrlChanged,
}) => {
  const [url, setUrl] = useState(getMobileApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMobileApiBaseUrl(url);
    onUrlChanged();
    onClose();
  };

  const handleTestConnection = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTesting(true);
      setTestResult(null);
      setMobileApiBaseUrl(url);
      const res = await mobileApi.testConnection();
      setTestResult(`Enchanted! (${res.service})`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setTestResult(`Failed: ${err.message}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setTesting(false);
    }
  };

  const handleApplyPreset = (presetUrl: string) => {
    Haptics.selectionAsync();
    setUrl(presetUrl);
    setTestResult(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Feather name="settings" size={20} color={colors.brass.light} />
              <Text style={styles.title}>Arcane Link Configuration</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.cream.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.description}>
              Configure the FastAPI server endpoint for local Wi-Fi hackathon demo or Android emulator.
            </Text>

            {/* Presets */}
            <Text style={styles.sectionLabel}>Quick Presets</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => handleApplyPreset('http://10.0.2.2:8000')}
              >
                <Text style={styles.presetBtnText}>Android Emulator</Text>
                <Text style={styles.presetSub}>10.0.2.2:8000</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => handleApplyPreset('http://localhost:8000')}
              >
                <Text style={styles.presetBtnText}>Localhost</Text>
                <Text style={styles.presetSub}>localhost:8000</Text>
              </TouchableOpacity>
            </View>

            {/* Custom Input */}
            <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Server Base URL</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={(text) => {
                setUrl(text);
                setTestResult(null);
              }}
              placeholder="http://192.168.1.X:8000"
              placeholderTextColor={colors.cream.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Test Connection Button */}
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator size="small" color={colors.brass.light} />
              ) : (
                <MaterialCommunityIcons name="broadcast" size={16} color={colors.brass.light} />
              )}
              <Text style={styles.testBtnText}>
                {testing ? 'Testing Ping...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>

            {testResult && (
              <Text
                style={[
                  styles.resultText,
                  testResult.startsWith('Enchanted')
                    ? { color: colors.toxic.DEFAULT }
                    : { color: colors.magenta.DEFAULT },
                ]}
              >
                {testResult}
              </Text>
            )}

            {/* Save Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save & Apply Endpoint</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 7, 13, 0.85)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.ink.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderColor: colors.brass.border,
    borderTopWidth: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: 'rgba(198, 161, 91, 0.15)',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingTop: 16,
  },
  description: {
    fontSize: 12,
    color: colors.cream.muted,
    lineHeight: 18,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    color: colors.cream.muted,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: colors.ink.elevated,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  presetSub: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.brass.light,
    marginTop: 2,
  },
  input: {
    backgroundColor: colors.ink.elevated,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    color: colors.cream.DEFAULT,
    fontFamily: 'monospace',
    fontSize: 13,
    marginBottom: 10,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.ink.elevated,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 12,
    height: 40,
    marginBottom: 10,
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brass.light,
  },
  resultText: {
    fontSize: 11,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: colors.brass.DEFAULT,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink.deep,
  },
});
