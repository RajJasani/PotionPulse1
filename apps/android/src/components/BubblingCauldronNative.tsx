import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Ellipse, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

interface BubblingCauldronNativeProps {
  caption?: string;
}

export const BubblingCauldronNative: React.FC<BubblingCauldronNativeProps> = ({
  caption = 'Madam Hexley is scrying the inventory runes...',
}) => {
  return (
    <View style={styles.container}>
      <Svg width={72} height={72} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="cauldronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#1F1B30" />
            <Stop offset="100%" stopColor="#08070D" />
          </LinearGradient>
          <LinearGradient id="brewGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#2EFFA3" />
            <Stop offset="100%" stopColor="#9D4EDD" />
          </LinearGradient>
        </Defs>

        {/* Feet */}
        <Path d="M 28 82 Q 22 92 18 94 Q 28 92 34 82" fill="#C6A15B" />
        <Path d="M 72 82 Q 78 92 82 94 Q 72 92 66 82" fill="#C6A15B" />

        {/* Body */}
        <Ellipse cx="50" cy="62" rx="36" ry="26" fill="url(#cauldronGrad)" stroke="#C6A15B" strokeWidth="1.5" />
        <Ellipse cx="50" cy="38" rx="34" ry="7" fill="#171524" stroke="#C6A15B" strokeWidth="2" />

        {/* Potion Liquid */}
        <Ellipse cx="50" cy="39" rx="30" ry="5.5" fill="url(#brewGrad)" />

        {/* Bubbles */}
        <Circle cx="42" cy="38" r="2.5" fill="#2EFFA3" />
        <Circle cx="56" cy="37" r="2" fill="#FF1389" />
        <Circle cx="50" cy="39" r="1.8" fill="#FAF6EE" />

        {/* Center Emblem */}
        <Circle cx="50" cy="64" r="3.5" fill="#C6A15B" />
      </Svg>

      {caption ? <Text style={styles.captionText}>{caption}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  captionText: {
    marginTop: 12,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.cream.muted,
    textAlign: 'center',
    maxWidth: 240,
  },
});
