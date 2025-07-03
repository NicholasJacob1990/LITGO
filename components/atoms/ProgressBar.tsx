import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  value: number; // 0-10
  maxValue?: number;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
}

export default function ProgressBar({ 
  value, 
  maxValue = 10, 
  height = 4, 
  backgroundColor = '#E5E7EB',
  fillColor 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(value, 0), maxValue) / maxValue;
  
  const getProgressColor = () => {
    if (fillColor) return fillColor;
    
    if (percentage >= 0.8) return '#E44C2E'; // danger
    if (percentage >= 0.6) return '#F5A623'; // warning
    if (percentage >= 0.4) return '#006CFF'; // primary
    return '#1DB57C'; // success
  };

  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${percentage * 100}%`,
            height,
            backgroundColor: getProgressColor(),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 2,
  },
}); 