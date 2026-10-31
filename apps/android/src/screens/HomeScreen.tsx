import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { mobileApi } from '../services/api';
import {
  Ingredient,
  ProphecyStockout,
  ReorderRecommendation,
  PotionEvent,
} from '../types/api.types';
import { PotionBottleGaugeNative } from '../components/PotionBottleGaugeNative';
import { BubblingCauldronNative } from '../components/BubblingCauldronNative';
import { getMobileMoonPhase } from '../utils/moonPhase';

interface HomeScreenProps {
  onOpenSettings: () => void;
  onNavigateTab: (tabName: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenSettings, onNavigateTab }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [prophecies, setProphecies] = useState<ProphecyStockout[]>([]);
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
  const [events, setEvents] = useState<PotionEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restockingId, setRestockingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [ings, prophs, recs, evts] = await Promise.all([
        mobileApi.getIngredients(),
        mobileApi.getStockoutProphecies(),
        mobileApi.getReorderRecommendations(),
        mobileApi.getEvents(true),
      ]);
      setIngredients(ings);
      setProphecies(prophs);
      setRecommendations(recs);
      setEvents(evts);
    } catch (err: any) {
      Alert.alert('Divination Error', err.message);
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

  const handleCastRestock = async (rec: ReorderRecommendation) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setRestockingId(rec.ingredient_id);
      await mobileApi.adjustStock({
        ingredient_id: rec.ingredient_id,
        delta: rec.recommended_quantity,
        reason: 'RESTOCK_SPELL_MOBILE',
        notes: `Replenished via Android app: +${rec.recommended_quantity} ${rec.unit}`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Restock Spell Cast!', `Added ${rec.recommended_quantity} ${rec.unit} of ${rec.ingredient_name}.`);
      await loadData();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Spell Interrupted', err.message);
    } finally {
      setRestockingId(null);
    }
  };

  const criticalFlasks = [...ingredients]
    .sort((a, b) => a.current_stock - b.current_stock)
    .slice(0, 5);

  const activeEvent = events.length > 0 ? events[0] : null;
  const moonInfo = getMobileMoonPhase();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <BubblingCauldronNative caption="Madam Hexley is scrying the inventory runes & measuring depletion rates..." />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.toxic.DEFAULT} />
      }
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.mastheadTitle}>Madam Hexley’s</Text>
          <Text style={styles.mastheadSubtitle}>Potion Pantry &bull; Prophecy OS</Text>
        </View>

        <View style={styles.rowAlign}>
          {/* Real Moon Phase Chip */}
          <View style={styles.moonChip}>
            <MaterialCommunityIcons name="moon-waning-gibbous" size={14} color={colors.brass.light} />
            <Text style={styles.moonChipText}>{moonInfo.phase}</Text>
          </View>

          <TouchableOpacity style={styles.settingsButton} onPress={onOpenSettings}>
            <Feather name="settings" size={18} color={colors.brass.light} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Lunar Event Banner */}
      {activeEvent && (
        <TouchableOpacity
          style={styles.eventBanner}
          onPress={() => onNavigateTab('Events')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="moon-waning-gibbous" size={24} color={colors.amber.DEFAULT} />
          <View style={styles.eventBannerText}>
            <Text style={styles.eventBannerTitle}>{activeEvent.name}</Text>
            <Text style={styles.eventBannerSub}>
              {activeEvent.multiplier}x Demand Surge Active on target reagents &rarr;
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Critical Stock Flasks Carousel */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Critical Reagents</Text>
          <TouchableOpacity onPress={() => onNavigateTab('Shelves')}>
            <Text style={styles.sectionLink}>View All &rarr;</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flaskScroll}>
          {criticalFlasks.map((ing) => (
            <TouchableOpacity
              key={ing.id}
              style={styles.flaskCard}
              onPress={() => onNavigateTab('Shelves')}
              activeOpacity={0.8}
            >
              <Text style={styles.flaskName} numberOfLines={1}>
                {ing.name}
              </Text>
              <Text style={styles.flaskCat}>{ing.category}</Text>

              <PotionBottleGaugeNative
                currentStock={ing.current_stock}
                maxCapacity={ing.reorder_point * 2.5}
                unit={ing.unit}
                minimumThreshold={ing.minimum_threshold}
                reorderPoint={ing.reorder_point}
                size="md"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Prophecy Countdown Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>The Prophecy Engine</Text>
          <TouchableOpacity onPress={() => onNavigateTab('CrystalBall')}>
            <Text style={styles.sectionLink}>Scry Details &rarr;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.prophecyList}>
          {prophecies.slice(0, 5).map((p) => {
            const isCritical = p.urgency === 'CRITICAL' || p.is_stocked_out;
            const badgeColor = isCritical ? colors.magenta.DEFAULT : colors.amber.DEFAULT;

            return (
              <View key={p.ingredient_id} style={styles.prophecyRow}>
                <View style={styles.prophecyInfo}>
                  <Text style={styles.prophecyName}>{p.name}</Text>
                  <Text style={styles.prophecySub}>
                    Stock: {p.current_stock.toFixed(1)} {p.unit} &bull; Burn: ~{p.depletion_rate_per_day.toFixed(1)}/d
                  </Text>
                </View>

                <View style={styles.prophecyRight}>
                  <Text style={[styles.prophecyDays, isCritical && { color: colors.magenta.DEFAULT }]}>
                    {p.is_stocked_out ? 'DEPLETED' : `${p.days_until_stockout.toFixed(1)}d left`}
                  </Text>
                  <View style={[styles.urgencyBadge, { borderColor: badgeColor }]}>
                    <Text style={[styles.urgencyBadgeText, { color: badgeColor }]}>
                      {p.is_stocked_out ? 'CRITICAL' : p.urgency}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Top Restock Recommendation */}
      {recommendations.length > 0 && (
        <View style={[styles.sectionCard, styles.restockCard]}>
          <View style={styles.sectionHeader}>
            <View style={styles.rowAlign}>
              <MaterialCommunityIcons name="magic-staff" size={20} color={colors.violet.light} />
              <Text style={[styles.sectionTitle, { marginLeft: 6 }]}>The Restock Spell</Text>
            </View>
            <Text style={styles.goldText}>
              {recommendations[0].estimated_cost_gold} Gold
            </Text>
          </View>

          <Text style={styles.restockHeading}>
            Order +{recommendations[0].recommended_quantity} {recommendations[0].unit} of{' '}
            {recommendations[0].ingredient_name}
          </Text>
          <Text style={styles.restockReasoning}>
            {recommendations[0].reasoning}
          </Text>

          <TouchableOpacity
            style={styles.castButton}
            onPress={() => handleCastRestock(recommendations[0])}
            disabled={restockingId === recommendations[0].ingredient_id}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="auto-fix" size={18} color={colors.cream.DEFAULT} />
            <Text style={styles.castButtonText}>
              {restockingId === recommendations[0].ingredient_id ? 'Brewing Order...' : 'Cast Restock Spell'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  centerContainer: {
    flex: 1,
    backgroundColor: colors.ink.deep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.cream.muted,
    fontSize: 13,
    marginTop: 12,
    fontFamily: 'monospace',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  mastheadTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  mastheadSubtitle: {
    fontSize: 11,
    color: colors.cream.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.ink.surface,
    borderColor: colors.brass.border,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 122, 0, 0.12)',
    borderColor: 'rgba(255, 122, 0, 0.4)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  eventBannerText: {
    marginLeft: 10,
    flex: 1,
  },
  eventBannerTitle: {
    color: colors.cream.DEFAULT,
    fontSize: 14,
    fontWeight: '700',
  },
  eventBannerSub: {
    color: colors.amber.DEFAULT,
    fontSize: 11,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.ink.surface,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  sectionLink: {
    fontSize: 12,
    color: colors.brass.light,
    fontWeight: '600',
  },
  flaskScroll: {
    paddingVertical: 4,
    gap: 12,
  },
  flaskCard: {
    backgroundColor: colors.ink.elevated,
    borderColor: 'rgba(198, 161, 91, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    width: 108,
  },
  flaskName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
    marginBottom: 2,
  },
  flaskCat: {
    fontSize: 9,
    color: colors.cream.muted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  prophecyList: {
    gap: 10,
  },
  prophecyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: 'rgba(198, 161, 91, 0.1)',
    borderBottomWidth: 1,
  },
  prophecyInfo: {
    flex: 1,
  },
  prophecyName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  prophecySub: {
    fontSize: 11,
    color: colors.cream.muted,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  prophecyRight: {
    alignItems: 'flex-end',
  },
  prophecyDays: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.toxic.DEFAULT,
  },
  urgencyBadge: {
    borderWidth: 0.8,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginTop: 2,
  },
  urgencyBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  restockCard: {
    borderColor: colors.violet.glow,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: colors.brass.light,
    fontWeight: '700',
  },
  restockHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
    marginBottom: 4,
  },
  restockReasoning: {
    fontSize: 11,
    color: colors.cream.muted,
    lineHeight: 16,
    marginBottom: 12,
  },
  castButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.violet.DEFAULT,
    borderRadius: 14,
    height: 44,
    gap: 6,
  },
  castButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  moonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.ink.surface,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  moonChipText: {
    fontSize: 10,
    color: colors.brass.light,
    fontWeight: '600',
  },
});
