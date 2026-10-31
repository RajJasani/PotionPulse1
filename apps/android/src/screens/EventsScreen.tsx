import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { mobileApi } from '../services/api';
import { Ingredient, PotionEvent, EventCreate } from '../types/api.types';

export const EventsScreen: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [events, setEvents] = useState<PotionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const [eventName, setEventName] = useState('Full Moon Festival');
  const [multiplier, setMultiplier] = useState<number>(3.0);
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'ing_wolfsbane',
    'ing_silver_leaf',
    'ing_nightshade',
  ]);

  const loadData = useCallback(async () => {
    try {
      const [ings, evts] = await Promise.all([
        mobileApi.getIngredients(),
        mobileApi.getEvents(false),
      ]);
      setIngredients(ings);
      setEvents(evts);
      if (evts.length > 0) {
        setEventName(evts[0].name);
        setMultiplier(evts[0].multiplier);
        setSelectedIds(evts[0].affected_ingredient_ids);
      }
    } catch (err: any) {
      Alert.alert('Event Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadData();
  };

  const handleToggle = (id: string) => {
    Haptics.selectionAsync();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('Selection Required', 'Select at least one affected reagent.');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSaving(true);
      const payload: EventCreate = {
        name: eventName,
        event_type: 'FESTIVAL',
        multiplier,
        affected_ingredient_ids: selectedIds,
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 4 * 86400000).toISOString(),
        is_active: true,
      };

      if (events.length > 0) {
        await mobileApi.updateEvent(events[0].id, payload);
      } else {
        await mobileApi.createEvent(payload);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Curse Consecrated', `${eventName} set with ${multiplier}x demand surge.`);
      await loadData();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Failed to Cast Event', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.amber.DEFAULT} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>The Midnight Curse</Text>
        <Text style={styles.subtitle}>
          Full Moon Festival and cosmic multipliers dynamically adjust ML forecasts
        </Text>
      </View>

      {/* Event Form Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Festival Configuration</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Event Title</Text>
          <TextInput
            style={styles.textInput}
            value={eventName}
            onChangeText={setEventName}
          />
        </View>

        {/* Multiplier Stepper */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Demand Surge Multiplier</Text>
          <View style={styles.multiplierRow}>
            <TouchableOpacity
              style={styles.multStepBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMultiplier((m) => Math.max(1.0, m - 0.5));
              }}
            >
              <Text style={styles.multStepBtnText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.multValue}>{multiplier.toFixed(1)}x</Text>

            <TouchableOpacity
              style={styles.multStepBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMultiplier((m) => Math.min(5.0, m + 0.5));
              }}
            >
              <Text style={styles.multStepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Targeted Reagents Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Affected Reagents ({selectedIds.length} chosen)
          </Text>
          <View style={styles.chipsWrap}>
            {ingredients.map((ing) => {
              const active = selectedIds.includes(ing.id);
              return (
                <TouchableOpacity
                  key={ing.id}
                  style={[styles.targetChip, active && styles.targetChipActive]}
                  onPress={() => handleToggle(ing.id)}
                >
                  <Text style={[styles.targetChipText, active && styles.targetChipTextActive]}>
                    {ing.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="moon-waning-gibbous" size={18} color={colors.ink.deep} />
          <Text style={styles.saveBtnText}>
            {saving ? 'Casting Surge...' : 'Activate Festival Multiplier'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Live Impact Preview Matrix */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Live Impact Preview</Text>
        <Text style={styles.cardSub}>
          Normal vs. {multiplier}x Curse Consumption comparison
        </Text>

        {loading ? (
          <ActivityIndicator size="small" color={colors.amber.DEFAULT} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.impactList}>
            {ingredients
              .filter((i) => selectedIds.includes(i.id))
              .map((ing) => {
                const baseBurn = Math.max(1.0, ing.reorder_point / 6);
                const surgeBurn = baseBurn * multiplier;
                const normalDays = ing.current_stock / baseBurn;
                const surgedDays = ing.current_stock / surgeBurn;

                return (
                  <View key={ing.id} style={styles.impactItem}>
                    <View style={styles.impactTop}>
                      <Text style={styles.impactName}>{ing.name}</Text>
                      <Text style={styles.impactCurrent}>
                        Stock: {ing.current_stock.toFixed(1)} {ing.unit}
                      </Text>
                    </View>

                    <View style={styles.impactRow}>
                      <View style={styles.impactCol}>
                        <Text style={styles.colLabel}>Normal Burn</Text>
                        <Text style={styles.colVal}>~{baseBurn.toFixed(1)}/d</Text>
                        <Text style={styles.colSub}>{normalDays.toFixed(1)}d runout</Text>
                      </View>

                      <MaterialCommunityIcons name="arrow-right-thick" size={16} color={colors.amber.DEFAULT} />

                      <View style={[styles.impactCol, styles.curseCol]}>
                        <Text style={[styles.colLabel, { color: colors.amber.DEFAULT }]}>
                          Surged Burn ({multiplier}x)
                        </Text>
                        <Text style={[styles.colVal, { color: colors.amber.DEFAULT }]}>
                          ~{surgeBurn.toFixed(1)}/d
                        </Text>
                        <Text style={[styles.colSub, { color: colors.magenta.DEFAULT, fontWeight: '700' }]}>
                          {surgedDays.toFixed(1)}d runout!
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink.deep,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  subtitle: {
    fontSize: 12,
    color: colors.cream.muted,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.ink.surface,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
    marginBottom: 12,
  },
  cardSub: {
    fontSize: 11,
    color: colors.cream.muted,
    marginTop: -8,
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    color: colors.cream.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.ink.elevated,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    color: colors.cream.DEFAULT,
    fontSize: 14,
  },
  multiplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ink.elevated,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 6,
  },
  multStepBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.ink.surface,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multStepBtnText: {
    color: colors.cream.DEFAULT,
    fontSize: 20,
    fontWeight: '700',
  },
  multValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.amber.DEFAULT,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  targetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.ink.elevated,
    borderColor: 'rgba(198, 161, 91, 0.2)',
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  targetChipActive: {
    backgroundColor: colors.amber.DEFAULT,
    borderColor: colors.amber.light,
  },
  targetChipText: {
    fontSize: 11,
    color: colors.cream.muted,
    fontWeight: '600',
  },
  targetChipTextActive: {
    color: colors.ink.deep,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.amber.DEFAULT,
    borderRadius: 14,
    height: 46,
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink.deep,
  },
  impactList: {
    gap: 12,
  },
  impactItem: {
    backgroundColor: colors.ink.elevated,
    borderColor: 'rgba(198, 161, 91, 0.2)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  impactTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  impactCurrent: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.cream.muted,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ink.surface,
    borderRadius: 10,
    padding: 8,
  },
  impactCol: {
    flex: 1,
  },
  curseCol: {
    alignItems: 'flex-end',
  },
  colLabel: {
    fontSize: 9,
    color: colors.cream.faint,
    textTransform: 'uppercase',
  },
  colVal: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.cream.DEFAULT,
    marginVertical: 1,
  },
  colSub: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.cream.muted,
  },
});
