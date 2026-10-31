import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { mobileApi } from '../services/api';
import { Anomaly } from '../types/api.types';

export const AnomaliesScreen: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const loadAnomalies = useCallback(async () => {
    try {
      const data = await mobileApi.getAnomalies();
      setAnomalies(data);
    } catch (err: any) {
      Alert.alert('Sentinel Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnomalies();
  }, [loadAnomalies]);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadAnomalies();
  };

  const handleSweepScan = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setScanning(true);
      const res = await mobileApi.scanAnomalies();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Sentinel Sweep Complete',
        `Ledger audited: ${res.total_anomalies_detected} anomalies analyzed (${res.new_anomalies_recorded} newly logged).`
      );
      await loadAnomalies();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sweep Failed', err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!resolvingId) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await mobileApi.resolveAnomaly(resolvingId, notes || 'Resolved via mobile app inspection.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Anomaly Warded', 'The incident has been verified and resolved.');
      setAnomalies((prev) =>
        prev.map((a) => (a.id === resolvingId ? { ...a, status: 'RESOLVED' } : a))
      );
      setResolvingId(null);
      setNotes('');
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Resolution Failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Sweep Trigger */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Strange Happenings</Text>
          <Text style={styles.subtitle}>Sentinel anomaly feed & stock shrinkage detector</Text>
        </View>

        <TouchableOpacity
          style={styles.sweepBtn}
          onPress={handleSweepScan}
          disabled={scanning}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="radar"
            size={18}
            color={scanning ? colors.magenta.DEFAULT : colors.brass.light}
          />
          <Text style={styles.sweepBtnText}>{scanning ? 'Sweeping...' : 'Sweep'}</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.toxic.DEFAULT} />
        </View>
      ) : (
        <FlatList
          data={anomalies}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.toxic.DEFAULT} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isCritical = item.severity === 'CRITICAL';
            const isResolved = item.status === 'RESOLVED';

            return (
              <View
                style={[
                  styles.card,
                  isCritical && styles.criticalBorder,
                  isResolved && styles.resolvedCard,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.nameRow}>
                    <Text style={styles.ingredientName}>{item.ingredient_name || 'Reagent'}</Text>
                    <View
                      style={[
                        styles.badge,
                        item.anomaly_type === 'SPIKE' ? styles.spikeBadge : styles.drainBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          item.anomaly_type === 'SPIKE'
                            ? { color: colors.magenta.DEFAULT }
                            : { color: colors.amber.DEFAULT },
                        ]}
                      >
                        {item.anomaly_type}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.severityText,
                      isCritical ? { color: colors.magenta.DEFAULT } : { color: colors.amber.DEFAULT },
                    ]}
                  >
                    {item.severity}
                  </Text>
                </View>

                <Text style={styles.detailsText}>
                  Consumption: <Text style={styles.boldText}>{item.actual_consumption}</Text> units vs.{' '}
                  <Text style={styles.boldText}>{item.expected_consumption}</Text> expected.
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>
                    {new Date(item.window_start).toLocaleDateString()} &bull; Score:{' '}
                    {(item.anomaly_score * 100).toFixed(0)}%
                  </Text>

                  {!isResolved ? (
                    <TouchableOpacity
                      style={styles.resolveBtn}
                      onPress={() => setResolvingId(item.id)}
                    >
                      <Text style={styles.resolveBtnText}>Ward & Resolve</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.resolvedLabel}>RESOLVED</Text>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Resolve Modal */}
      <Modal visible={resolvingId !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ward Strange Happening</Text>
              <TouchableOpacity onPress={() => setResolvingId(null)}>
                <Feather name="x" size={20} color={colors.cream.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Audit Notes</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={3}
                placeholder="e.g. Cauldron overflow cleaned, stock audited."
                placeholderTextColor={colors.cream.muted}
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleConfirmResolve}>
                <Text style={styles.submitBtnText}>Confirm Resolution</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink.deep,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomColor: colors.brass.border,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  subtitle: {
    fontSize: 11,
    color: colors.cream.muted,
    marginTop: 2,
  },
  sweepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink.surface,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    gap: 6,
  },
  sweepBtnText: {
    color: colors.brass.light,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.ink.surface,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  criticalBorder: {
    borderColor: 'rgba(255, 19, 137, 0.5)',
  },
  resolvedCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  spikeBadge: {
    backgroundColor: 'rgba(255, 19, 137, 0.15)',
    borderColor: colors.magenta.DEFAULT,
  },
  drainBadge: {
    backgroundColor: 'rgba(255, 122, 0, 0.15)',
    borderColor: colors.amber.DEFAULT,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  detailsText: {
    fontSize: 12,
    color: colors.cream.muted,
    lineHeight: 18,
  },
  boldText: {
    color: colors.cream.DEFAULT,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopColor: 'rgba(198, 161, 91, 0.1)',
    borderTopWidth: 1,
  },
  dateText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.cream.faint,
  },
  resolveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.ink.elevated,
    borderColor: colors.brass.border,
    borderWidth: 1,
    minHeight: 34,
    justifyContent: 'center',
  },
  resolveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brass.light,
  },
  resolvedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.toxic.DEFAULT,
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 7, 13, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.ink.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderColor: colors.brass.border,
    borderTopWidth: 1,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: 'rgba(198, 161, 91, 0.15)',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  modalBody: {
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.cream.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.ink.elevated,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    color: colors.cream.DEFAULT,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: colors.toxic.DEFAULT,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: colors.ink.deep,
    fontSize: 14,
    fontWeight: '700',
  },
});
