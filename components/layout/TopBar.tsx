import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Share , LucideIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface ActionButtonProps {
  icon: LucideIcon;
  onPress: () => void;
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showShare?: boolean;
  rightActions?: ActionButtonProps[];
  onShare?: () => void;
}

export default function TopBar({ title, subtitle, showBack = false, showShare = false, rightActions, onShare }: TopBarProps) {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={['#006CFF', '#4EA2FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <SafeAreaView>
        <View style={styles.container}>
          <View style={styles.leftSection}>
            {showBack && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          
          <View style={styles.rightSection}>
            {rightActions && rightActions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.iconButton}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <ActionIcon size={22} color="#FFFFFF" />
                </TouchableOpacity>
              );
            })}
            {(showShare || onShare) && !rightActions && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onShare}
                activeOpacity={0.7}
              >
                <Share size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingTop: 32, // Account for status bar
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: 60,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  rightSection: {
    minWidth: 44,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
}); 
