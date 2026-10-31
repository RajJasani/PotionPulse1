import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { mobileApi } from '../services/api';
import { Ingredient, Shelf } from '../types/api.types';
import { PotionBottleGaugeNative } from '../components/PotionBottleGaugeNative';
import { BubblingCauldronNative } from '../components/BubblingCauldronNative';

export const ShelvesScreen: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dispense Modal State
  const [saleModalReagent, setSaleModalReagent] = useState<Ingredient | null>(null);
  const [saleQty, setSaleQty] = useState<number>(1);
  const [customerType, setCustomerType] = useState<string>('Sorcerer');
  const [submittingSale, setSubmittingSale] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [ings, shlfs] = await Promise.all([
        mobileApi.getIngredients(),
        mobileApi.getShelves(),
      ]);
      setIngredients(ings);
      setShelves(shlfs);
    } catch (err: any) {
      Alert.alert('Shelf Error', err.message);
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

  const handleOpenSaleModal = (ing: Ingredient) => {
    Haptics.selectionAsync();
    setSaleModalReagent(ing);
    setSaleQty(1);
  };

  const handleConfirmSale = async () => {
    if (!saleModalReagent) return;

    if (saleQty <= 0) {
      Alert.alert('Invalid Scoop', 'Quantity must be greater than zero.');
      return;
    }

    if (saleQty > saleModalReagent.current_stock) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Insufficient Reagents',
        `Requested ${saleQty} ${saleModalReagent.unit}, but only ${saleModalReagent.current_stock.toFixed(1)} remain on shelf.`
      );
      return;
    }

    try {
      setSubmittingSale(true);
      const goldTotal = Math.round(saleQty * saleModalReagent.unit_cost_gold * 1.6 * 100) / 100;
      const res = await mobileApi.recordSale({
        ingredient_id: saleModalReagent.id,
        quantity: saleQty,
        sale_price_gold: goldTotal,
        customer_type: customerType,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Optimistic update
      setIngredients((prev) =>
        prev.map((i) =>
          i.id === saleModalReagent.id ? { ...i, current_stock: res.remaining_stock } : i
        )
      );

      Alert.alert(
        'Potion Dispensed!',
        `Sold ${saleQty} ${saleModalReagent.unit}. Remaining: ${res.remaining_stock.toFixed(1)} ${saleModalReagent.unit}.${res.warning ? ` (${res.warning})` : ''}`
      );
      setSaleModalReagent(null);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Transaction Failed', err.message);
    } finally {
      setSubmittingSale(false);
    }
  };

  const categories = ['ALL', 'Herb', 'Fauna Reagent', 'Mineral', 'Essence'];

  const filtered = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(search.toLowerCase()) ||
      ing.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || ing.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <View style={styles.container}>
      {/* Top Search & Filter Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchRow}>
          <Feather name="search" size={18} color={colors.cream.muted} />
          <TextInput
            placeholder="Search reagents or essence..."
            placeholderTextColor={colors.cream.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Category Filter Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryScroll}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(item);
                }}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
              >
                <Text
                  style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}
                >
                  {item === 'ALL' ? 'All' : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Reagents List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <BubblingCauldronNative caption="Auditing jars on the shelves..." />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.toxic.DEFAULT} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="package" size={40} color={colors.amber.DEFAULT} />
              <Text style={styles.emptyTitle}>The Shelves are Bare!</Text>
              <Text style={styles.emptySubtitle}>
                No reagents match your current filter. Tap the '+' button below to catalog a new ingredient.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isStockedOut = item.current_stock <= 0;
            const isCritical = item.current_stock <= item.minimum_threshold;

            return (
              <View style={styles.reagentCard}>
                <View style={styles.cardLeft}>
                  <PotionBottleGaugeNative
                    currentStock={item.current_stock}
                    maxCapacity={item.reorder_point * 2.5}
                    unit={item.unit}
                    minimumThreshold={item.minimum_threshold}
                    reorderPoint={item.reorder_point}
                    size="sm"
                    showLabels={false}
                  />

                  <View style={styles.reagentInfo}>
                    <Text style={styles.reagentName}>{item.name}</Text>
                    <Text style={styles.reagentSub}>
                      {item.category} &bull; {item.shelf_name || 'Shelf Vault'}
                    </Text>
                    <Text style={styles.reagentCost}>
                      {item.unit_cost_gold.toFixed(1)} Gold / {item.unit}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardRight}>
                  <Text
                    style={[
                      styles.stockQuantity,
                      isStockedOut
                        ? { color: colors.magenta.DEFAULT }
                        : isCritical
                        ? { color: colors.magenta.DEFAULT }
                        : { color: colors.toxic.DEFAULT },
                    ]}
                  >
                    {item.current_stock.toFixed(1)} {item.unit}
                  </Text>

                  <TouchableOpacity
                    style={[styles.dispenseButton, isStockedOut && styles.dispenseDisabled]}
                    onPress={() => handleOpenSaleModal(item)}
                    disabled={isStockedOut}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="cart-plus" size={16} color={colors.cream.DEFAULT} />
                    <Text style={styles.dispenseButtonText}>Dispense</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* DISPENSE MODAL */}
      <Modal visible={saleModalReagent !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Customer Sale</Text>
              <TouchableOpacity onPress={() => setSaleModalReagent(null)} style={styles.closeBtn}>
                <Feather name="x" size={20} color={colors.cream.muted} />
              </TouchableOpacity>
            </View>

            {saleModalReagent && (
              <View style={styles.modalBody}>
                <Text style={styles.modalReagentName}>{saleModalReagent.name}</Text>
                <Text style={styles.modalStockNotice}>
                  Remaining in pantry: {saleModalReagent.current_stock.toFixed(1)} {saleModalReagent.unit}
                </Text>

                {/* Stepper */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSaleQty((q) => Math.max(0.5, q - 0.5));
                    }}
                  >
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.stepValue}>
                    {saleQty} <Text style={styles.stepUnit}>{saleModalReagent.unit}</Text>
                  </Text>

                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSaleQty((q) => Math.min(saleModalReagent.current_stock, q + 0.5));
                    }}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Total Gold Display */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Gold Total:</Text>
                  <Text style={styles.totalAmount}>
                    {(saleQty * saleModalReagent.unit_cost_gold * 1.6).toFixed(2)} Gold
                  </Text>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmSale}
                  disabled={submittingSale || saleQty <= 0 || saleQty > saleModalReagent.current_stock}
                >
                  <Text style={styles.confirmBtnText}>
                    {submittingSale ? 'Dispensing...' : 'Confirm & Deduct Stock'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  searchBarContainer: {
    padding: 16,
    paddingBottom: 8,
    borderBottomColor: colors.brass.border,
    borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink.surface,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.cream.DEFAULT,
    fontSize: 14,
  },
  categoryScroll: {
    paddingTop: 10,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.ink.surface,
    borderColor: 'rgba(198, 161, 91, 0.2)',
    borderWidth: 1,
    minHeight: 34,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: colors.brass.DEFAULT,
    borderColor: colors.brass.DEFAULT,
  },
  categoryChipText: {
    fontSize: 12,
    color: colors.cream.muted,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: colors.ink.deep,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  reagentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.ink.surface,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reagentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reagentName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  reagentSub: {
    fontSize: 11,
    color: colors.cream.muted,
    marginTop: 2,
  },
  reagentCost: {
    fontSize: 10,
    color: colors.brass.light,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  stockQuantity: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
  },
  dispenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.ink.elevated,
    borderColor: colors.brass.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  dispenseDisabled: {
    opacity: 0.3,
  },
  dispenseButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.toxic.DEFAULT,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 7, 13, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.ink.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  closeBtn: {
    padding: 6,
  },
  modalBody: {
    paddingTop: 16,
  },
  modalReagentName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  modalStockNotice: {
    fontSize: 12,
    color: colors.cream.muted,
    marginTop: 2,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ink.elevated,
    borderRadius: 16,
    borderColor: colors.brass.border,
    borderWidth: 1,
    padding: 6,
    marginBottom: 16,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.ink.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: {
    color: colors.cream.DEFAULT,
    fontSize: 22,
    fontWeight: '700',
  },
  stepValue: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.cream.DEFAULT,
  },
  stepUnit: {
    fontSize: 12,
    color: colors.cream.muted,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.ink.deep,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  totalLabel: {
    color: colors.cream.muted,
    fontSize: 13,
  },
  totalAmount: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    color: colors.brass.light,
  },
  confirmBtn: {
    backgroundColor: colors.toxic.DEFAULT,
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.ink.deep,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.cream.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 260,
  },
});
