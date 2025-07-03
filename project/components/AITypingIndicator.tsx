import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';

interface AITypingIndicatorProps {
  visible: boolean;
}

export default function AITypingIndicator({ visible }: AITypingIndicatorProps) {
  const dot1Scale = useSharedValue(1);
  const dot2Scale = useSharedValue(1);
  const dot3Scale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Staggered animation for each dot
      dot1Scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        false
      );
      
      dot2Scale.value = withDelay(
        150,
        withRepeat(
          withSequence(
            withTiming(1.2, { duration: 400 }),
            withTiming(1, { duration: 400 })
          ),
          -1,
          false
        )
      );
      
      dot3Scale.value = withDelay(
        300,
        withRepeat(
          withSequence(
            withTiming(1.2, { duration: 400 }),
            withTiming(1, { duration: 400 })
          ),
          -1,
          false
        )
      );
    } else {
      dot1Scale.value = withTiming(1);
      dot2Scale.value = withTiming(1);
      dot3Scale.value = withTiming(1);
    }
  }, [visible]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
    marginHorizontal: 3,
  },
});