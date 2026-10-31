import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { mobileApi } from '../services/api';
import { Ingredient, ForecastResponse, PotionEvent } from '../types/api.types';
import { PotionBottleGaugeNative } from '../components/PotionBottleGaugeNative';

export const CrystalBallScreen: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [horizonDays, setHorizonDays] = useState<number>(14);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [events, setEvents] = useState<PotionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInitial = useCallback(async () => {
    try {
      const [ings, evts] = await Promise.all([
        mobileApi.getIngredients(),
        mobileApi.getEvents(false),
      ]);
      setIngredients(ings);
      setEvents(evts);
      if (ings.length > 0 && !selectedId) {
        const wolf = ings.find((i) => i.id === 'ing_wolfsbane') || ings[0];
        setSelectedId(wolf.id);
      }
    } catch (err: any) {
      Alert.alert('Scrying Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadForecast = useCallback(async () => {
    if (!selectedId) return;
    try {
      setLoading(true);
      const res = await mobileApi.getForecast(selectedId, horizonDays);
      setForecast(res);
    } catch (err: any) {
      Alert.alert('Forecast Clouded', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedId, horizonDays]);

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadForecast();
  };

  const currentIng = ingredients.find((i) => i.id === selectedId);
  const activeEvent = events.find(
    (e) => e.is_active && e.affected_ingredient_ids.includes(selectedId)
  );

  const maxVal = forecast
    ? Math.max(...forecast.forecast.map((f) => f.upper_bound), 10)
    : 10;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.toxic.DEFAULT} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>The Crystal Ball</Text>
        <Text style={styles.subtitle}>Touch-friendly ML demand trajectory & prediction bounds</Text>
      </View>

      {/* Ingredient Horizontal Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.ingScroll}
      >
        {ingredients.map((ing) => {
          const isSelected = ing.id === selectedId;
          return (
            <TouchableOpacity
              key={ing.id}
              style={[styles.ingChip, isSelected && styles.ingChipActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedId(ing.id);
              }}
            >
              <Text style={[styles.ingChipText, isSelected && styles.ingChipTextActive]}>
                {ing.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Horizon Controls */}
      <View style={styles.horizonRow}>
        {[7, 14, 30].map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => {
              Haptics.selectionAsync();
              setHorizonDays(d);
            }}
            style={[styles.horizonBtn, horizonDays === d && styles.horizonBtnActive]}
          >
            <Text style={[styles.horizonBtnText, horizonDays === d && styles.horizonBtnTextActive]}>
              {d} Days
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reagent Snapshot Card */}
      {currentIng && (
        <View style={styles.snapshotCard}>
          <PotionBottleGaugeNative
            currentStock={currentIng.current_stock}
            maxCapacity={currentIng.reorder_point * 2.5}
            unit={currentIng.unit}
            minimumThreshold={currentIng.minimum_threshold}
            reorderPoint={currentIng.reorder_point}
            size="sm"
            showLabels={false}
          />

          <View style={styles.snapshotInfo}>
            <Text style={styles.snapshotName}>{currentIng.name}</Text>
            <Text style={styles.snapshotStock}>
              Current: {currentIng.current_stock.toFixed(1)} {currentIng.unit}
            </Text>
            {activeEvent && (
              <View style={styles.eventActivePill}>
                <MaterialCommunityIcons name="moon-full" size={12} color={colors.amber.DEFAULT} />
                <Text style={styles.eventActiveText}>
                  {activeEvent.name} ({activeEvent.multiplier}x Surge)
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Touch-Friendly Visual Forecast Timeline */}
      <View style={styles.forecastCard}>
        <Text style={styles.cardHeading}>Prophesied Daily Trajectory</Text>
        <Text style={styles.cardSub}>
          Bar height = predicted demand &bull; Amber outline = 3x celestial event surge
        </Text>

        {loading ? (
          <ActivityIndicator size="small" color={colors.toxic.DEFAULT} style={{ marginVertical: 30 }} />
        ) : forecast && forecast.forecast.length > 0 ? (
          <View style={styles.chartContainer}>
            {forecast.forecast.map((item) => {
              const heightPercent = Math.max(12, Math.min(100, (item.predicted_demand / maxVal) * 100));
              const isSurged = item.event_multiplier > 1.0;

              return (
                <View key={item.date} style={styles.barColumn}>
                  <Text style={styles.barValue}>{item.predicted_demand.toFixed(1)}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: isSurged ? colors.amber.DEFAULT : colors.toxic.DEFAULT,
                          borderColor: isSurged ? colors.amber.light : colors.toxic.light,
                          borderWidth: isSurged ? 1.5 : 0,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barDate}>{item.date.slice(5)}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>No prophecy data returned.</Text>
        )}
      </View>

      {/* Summary Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>14-Day Cumulative</Text>
          <Text style={styles.metricVal}>
            {forecast
              ? forecast.forecast.reduce((a, b) => a + b.predicted_demand, 0).toFixed(1)
              : '...'}{' '}
            {currentIng?.unit}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Daily Burn Rate</Text>
          <Text style={[styles.metricVal, { color: colors.toxic.DEFAULT }]}>
            {forecast && forecast.forecast.length > 0
              ? (
                  forecast.forecast.reduce((a, b) => a + b.predicted_demand, 0) /
                  forecast.forecast.length
                ).toFixed(2)
              : '...'}{' '}
            {currentIng?.unit}/d
          </Text>
        </View>
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
  ingScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  ingChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.ink.surface,
    borderColor: 'rgba(198, 161, 91, 0.2)',
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  ingChipActive: {
    backgroundColor: colors.witchy.DEFAULT,
    borderColor: colors.witchy.light,
  },
  ingChipText: {
    color: colors.cream.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  ingChipTextActive: {
    color: colors.cream.DEFAULT,
    fontWeight: '700',
  },
  horizonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  horizonBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.ink.surface,
    borderColor: colors.brass.border,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizonBtnActive: {
    backgroundColor: colors.brass.DEFAULT,
    borderColor: colors.brass.DEFAULT,
  },
  horizonBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.cream.muted,
  },
  horizonBtnTextActive: {
    color: colors.ink.deep,
    fontWeight: '700',
  },
  snapshotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink.surface,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  snapshotInfo: {
    marginLeft: 14,
    flex: 1,
  },
  snapshotName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  snapshotStock: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.cream.muted,
    marginTop: 2,
  },
  eventActivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 122, 0, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  eventActiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.amber.DEFAULT,
  },
  forecastCard: {
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
  },
  cardSub: {
    fontSize: 11,
    color: colors.cream.muted,
    marginTop: 2,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    gap: 6,
    paddingVertical: 8,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: colors.cream.muted,
    marginBottom: 4,
  },
  barTrack: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.ink.elevated,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barDate: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: colors.cream.muted,
    marginTop: 4,
  },
  emptyText: {
    color: colors.cream.muted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    backgroundColor: colors.ink.surface,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.cream.muted,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.cream.DEFAULT,
    marginTop: 4,
  },
});
