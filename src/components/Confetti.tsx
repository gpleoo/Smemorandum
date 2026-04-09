import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#C9B1FF', '#FF9A9E', '#FFECD2', '#6C5CE7'];
const PIECE_COUNT = 28;

interface PieceConfig {
  startX: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  isRect: boolean;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function buildPieces(): PieceConfig[] {
  return Array.from({ length: PIECE_COUNT }, () => ({
    startX: randomBetween(0, SCREEN_W),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: randomBetween(0, 600),
    duration: randomBetween(2200, 3400),
    size: randomBetween(6, 14),
    isRect: Math.random() > 0.5,
  }));
}

function ConfettiPiece({ cfg }: { cfg: PieceConfig }) {
  const y = useRef(new Animated.Value(-20)).current;
  const x = useRef(new Animated.Value(cfg.startX)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const drift = randomBetween(-80, 80);
    Animated.parallel([
      Animated.timing(y, {
        toValue: SCREEN_H + 40,
        duration: cfg.duration,
        delay: cfg.delay,
        useNativeDriver: true,
      }),
      Animated.timing(x, {
        toValue: cfg.startX + drift,
        duration: cfg.duration,
        delay: cfg.delay,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: randomBetween(-6, 6),
        duration: cfg.duration,
        delay: cfg.delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        delay: cfg.delay + cfg.duration - 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [-6, 6],
    outputRange: ['-720deg', '720deg'],
  });

  return (
    <Animated.View
      style={[
        cfg.isRect ? styles.rect : styles.circle,
        {
          backgroundColor: cfg.color,
          width: cfg.size,
          height: cfg.isRect ? cfg.size * 0.5 : cfg.size,
          position: 'absolute',
          left: 0,
          top: 0,
          opacity,
          transform: [{ translateX: x }, { translateY: y }, { rotate: spin }],
        },
      ]}
    />
  );
}

interface ConfettiProps {
  visible: boolean;
}

export function Confetti({ visible }: ConfettiProps) {
  const pieces = useRef(buildPieces()).current;

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((cfg, i) => (
        <ConfettiPiece key={i} cfg={cfg} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { borderRadius: 999 },
  rect: { borderRadius: 2 },
});
