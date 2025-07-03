import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LifeBuoy, Plus } from 'lucide-react-native';
import { useSupport } from '@/lib/contexts/SupportContext';
import SupportTicketForm from '@/components/organisms/SupportTicketForm';
import { Link } from 'expo-router';

const TicketItem = ({ item }: { item: any }) => (
  <Link href={`/support/${item.id}`} asChild>
    <TouchableOpacity style={styles.ticketItem}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
        <Text style={[styles.statusBadge, { backgroundColor: item.status === 'open' ? '#DBEAFE' : '#D1FAE5', color: item.status === 'open' ? '#1E40AF' : '#065F46' }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.ticketMeta}>
        Ticket #{item.id.substring(0, 8)} • Criado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
      </Text>
    </TouchableOpacity>
  </Link>
);

export default function SupportScreen() {
  const { tickets, isLoading, error } = useSupport();
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Suporte Interno</Text>
      </View>

      {isLoading && <ActivityIndicator size="large" color="#0F172A" style={{ marginTop: 20 }} />}
      
      {error && <Text style={styles.errorText}>Erro ao carregar tickets: {error.message}</Text>}

      {!isLoading && !error && (
        <FlatList
          data={tickets}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => <TicketItem item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <LifeBuoy size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>Nenhum ticket de suporte aberto.</Text>
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
        <Plus size={28} color="white" />
      </TouchableOpacity>
      
      <SupportTicketForm 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingTop: 50,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        margin: 20,
    },
    ticketItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketSubject: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        flex: 1,
    },
    statusBadge: {
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    ticketMeta: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748B',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#0F172A',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
}); 