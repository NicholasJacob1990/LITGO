import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, MapPin, Clock, Award, MessageCircle, Video, Users, CheckCircle, ArrowRight } from 'lucide-react-native';
import { LawyerSearchResult } from '@/lib/supabase';

interface LawyerMatchCardProps {
  lawyer: LawyerSearchResult;
  onSelect: () => void;
}

const LawyerMatchCard: React.FC<LawyerMatchCardProps> = ({ lawyer, onSelect }) => {
  return (
    <TouchableOpacity onPress={onSelect}>
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: lawyer.avatar_url || 'https://via.placeholder.com/80' }} style={styles.avatar} />
            {lawyer.is_available && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{lawyer.name}</Text>
            <Text style={styles.area}>{lawyer.primary_area}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.ratingText}>{lawyer.rating?.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.details}>
            <View style={styles.detailItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.detailText}>{lawyer.distance_km.toFixed(1)} km</Text>
            </View>
        </View>
        
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    nameContainer: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    area: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400E',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#4B5563',
    }
});

export default LawyerMatchCard;