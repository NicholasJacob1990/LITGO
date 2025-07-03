import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { createSupportTicket, SupportTicket } from '@/lib/services/support';
import { useSupport } from '@/lib/contexts/SupportContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { X } from 'lucide-react-native';

interface SupportTicketFormProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function SupportTicketForm({ isVisible, onClose }: SupportTicketFormProps) {
  const { user } = useAuth();
  const { refetchTickets } = useSupport();
  const [subject, setSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !user) return;

    setIsSubmitting(true);
    const newTicket: SupportTicket = {
      subject: subject.trim(),
      creator_id: user.id,
      status: 'open',
      priority: 'medium', // Prioridade padrão
    };

    try {
      await createSupportTicket(newTicket);
      await refetchTickets();
      onClose();
      setSubject('');
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      alert('Erro ao criar ticket de suporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Novo Ticket de Suporte</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>Assunto</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Ex: Dúvida sobre o caso XPTO"
          />

          <View style={styles.buttonContainer}>
            <Button
              title={isSubmitting ? 'Abrindo...' : 'Abrir Ticket'}
              onPress={handleSubmit}
              disabled={isSubmitting || !subject.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    label: {
        fontSize: 16,
        color: '#475569',
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1E293B',
    },
    buttonContainer: {
      marginTop: 30,
    }
}); 