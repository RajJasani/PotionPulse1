import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { colors } from '../theme/colors';

interface PotionBottleGaugeNativeProps {
  currentStock: number;
  maxCapacity?: number;
  unit?: string;
  minimumThreshold?: number;
  reorderPoint?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export const PotionBottleGaugeNative: React.FC<PotionBottleGaugeNativeProps> = ({
  currentStock,
  maxCapacity = 100,
  unit = 'g',
  minimumThreshold = 10,
  reorderPoint = 25,
  size = 'md',
  showLabels = true,
}) => {
  const fillPercentage = Math.max(0, Math.min(100, (currentStock / maxCapacity) * 100));

  let primaryColor: string = colors.lime.DEFAULT;
  let surfaceColor: string = colors.lime.surface;
  let statusText = 'Healthy';

  if (currentStock <= 0) {
    primaryColor = '#5C5468';
    surfaceColor = 'rgba(92, 84, 104, 0.15)';
    statusText = 'Depleted';
  } else if (currentStock <= minimumThreshold) {
    primaryColor = colors.magenta.DEFAULT;
    surfaceColor = colors.magenta.surface;
    statusText = 'Critical';
  } else if (currentStock <= reorderPoint) {
    primaryColor = colors.amber.DEFAULT;
    surfaceColor = colors.amber.surface;
    statusText = 'Low Stock';
  }

  const dimensions = {
    sm: { bottleWidth: 42, bottleHeight: 56, neckWidth: 14, neckHeight: 8, corkWidth: 10, corkHeight: 6 },
    md: { bottleWidth: 64, bottleHeight: 84, neckWidth: 20, neckHeight: 12, corkWidth: 14, corkHeight: 8 },
    lg: { bottleWidth: 90, bottleHeight: 120, neckWidth: 28, neckHeight: 16, corkWidth: 20, corkHeight: 10 },
  }[size];

  const liquidHeightPercent = `${fillPercentage}%`;

  return (
    <View style={styles.container}>
      {/* Cork Stopper */}
      <View
        style={[
          styles.cork,
          {
            width: dimensions.corkWidth,
            height: dimensions.corkHeight,
          },
        ]}
      />

      {/* Glass Neck with Brass Ring */}
      <View
        style={[
          styles.neck,
          {
            width: dimensions.neckWidth,
            height: dimensions.neckHeight,
          },
        ]}
      />

      {/* Main Flask Body */}
      <View
        style={[
          styles.bottle,
          {
            width: dimensions.bottleWidth,
            height: dimensions.bottleHeight,
            borderColor: colors.brass.border,
            backgroundColor: surfaceColor,
          },
        ]}
      >
        {/* Liquid Reservoir */}
        <View
          style={[
            styles.liquid,
            {
              height: liquidHeightPercent as DimensionValue,
              backgroundColor: primaryColor,
            },
          ]}
        >
          {/* Surface Meniscus Line */}
          {fillPercentage > 0 && (
            <View
              style={[
                styles.meniscus,
                {
                  backgroundColor: colors.cream.DEFAULT,
                },
              ]}
            />
          )}
        </View>

        {/* Volumetric Hash Marks */}
        <View style={styles.hashContainer}>
          <View style={[styles.hashMark, { width: 6, top: '25%' }]} />
          <View style={[styles.hashMark, { width: 10, top: '50%' }]} />
          <View style={[styles.hashMark, { width: 6, top: '75%' }]} />
        </View>
      </View>

      {/* Labels */}
      {showLabels && (
        <View style={styles.labelContainer}>
          <Text style={styles.stockText}>
            {currentStock.toFixed(1)}
            <Text style={styles.unitText}> {unit}</Text>
          </Text>
          <View style={[styles.badge, { backgroundColor: surfaceColor, borderColor: primaryColor }]}>
            <Text style={[styles.badgeText, { color: primaryColor }]}>{statusText}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cork: {
    backgroundColor: '#84652A',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderColor: '#C6A15B',
    borderWidth: 0.5,
  },
  neck: {
    backgroundColor: 'rgba(23, 21, 36, 0.7)',
    borderColor: '#C6A15B',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 0,
    zIndex: 2,
  },
  bottle: {
    borderWidth: 1.8,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    position: 'relative',
    shadowColor: '#C6A15B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  liquid: {
    width: '100%',
    opacity: 0.88,
  },
  meniscus: {
    width: '100%',
    height: 2,
    opacity: 0.4,
  },
  hashContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingRight: 4,
    alignItems: 'flex-end',
  },
  hashMark: {
    height: 1,
    backgroundColor: '#C6A15B',
    opacity: 0.6,
    position: 'absolute',
    right: 2,
  },
  labelContainer: {
    marginTop: 6,
    alignItems: 'center',
  },
  stockText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: colors.cream.DEFAULT,
  },
  unitText: {
    fontSize: 9,
    color: colors.cream.muted,
  },
  badge: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
