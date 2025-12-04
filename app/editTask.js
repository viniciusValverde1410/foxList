import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function EditTaskScreen() {
  const { id, title: initialTitle, description: initialDescription, priority: initialPriority, deadline: initialDeadline, isNew } = useLocalSearchParams();
  
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [priority, setPriority] = useState(initialPriority || 'Baixa');
  const [deadline, setDeadline] = useState(initialDeadline || 'Hoje, 14:00');
  const [showCalendar, setShowCalendar] = useState(false);
  const [customDate, setCustomDate] = useState('');

  const priorities = ['Baixa', 'Média', 'Alta'];
  
  const quickDates = [
    'Hoje, 14:00',
    'Amanhã, 09:00',
    'Próxima semana',
    '25 de Dezembro',
    '26 de Dezembro',
    '27 de Dezembro'
  ];

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, digite um título para a tarefa');
      return;
    }

    const statusMap = {
      'Alta': 'alta',
      'Média': 'media',
      'Baixa': 'baixa'
    };

    // Preparar dados da tarefa
    const taskData = {
      id: id,
      title: title.trim(),
      description: description.trim(),
      status: statusMap[priority],
      deadline: deadline,
      isNew: isNew
    };

    if (isNew) {
      router.replace({
        pathname: '/(tabs)/home',
        params: {
          newTask: JSON.stringify(taskData)
        }
      });
    } else {
      router.replace({
        pathname: '/(tabs)/home',
        params: {
          updateTask: JSON.stringify(taskData)
        }
      });
    }
  };

  const handleComplete = () => {
    Alert.alert(
      'Concluir Tarefa',
      'Deseja marcar esta tarefa como concluída?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Concluir', onPress: () => {
          // Marcar como concluída e voltar
          router.replace({
            pathname: '/(tabs)/home',
            params: {
              completeTaskId: id
            }
          });
        }}
      ]
    );
  };

  const getPriorityColor = (priorityLevel) => {
    switch (priorityLevel) {
      case 'Alta': return '#ff4d4dff';
      case 'Média': return '#ffa82fff';
      case 'Baixa': return '#358535ff';
      default: return '#358535ff';
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isNew ? 'Nova tarefa:' : 'Editar tarefa:'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content}>
        {/* Título da Tarefa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Título da Tarefa</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder={isNew ? "Digite o título da tarefa" : "Digite o título da tarefa"}
            />
            <TouchableOpacity style={styles.editIcon}>
              <Text style={styles.editIconText}>✎</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder={isNew ? "Descreva sua nova tarefa..." : "Digite a descrição da tarefa"}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.editIcon}>
              <Text style={styles.editIconText}>✎</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Prioridade */}
        <View style={styles.section}>
          <View style={styles.priorityHeader}>
            <Text style={styles.sectionTitle}>Edite a Prioridade</Text>
            <TouchableOpacity style={styles.editIcon}>
              <Text style={styles.editIconText}>✎</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.priorityContainer}>
            {priorities.map((priorityLevel) => (
              <TouchableOpacity
                key={priorityLevel}
                style={[
                  styles.priorityButton,
                  { backgroundColor: getPriorityColor(priorityLevel) },
                  priority === priorityLevel && styles.selectedPriority
                ]}
                onPress={() => setPriority(priorityLevel)}
              >
                <Text style={styles.priorityText}>{priorityLevel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prazo Final */}
        <View style={styles.section}>
          <View style={styles.priorityHeader}>
            <Text style={styles.sectionTitle}>Prazo Final</Text>
            <TouchableOpacity 
              style={styles.editIcon}
              onPress={() => setShowCalendar(!showCalendar)}
            >
              <Text style={styles.editIconText}>📅</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Text style={styles.deadlineText}>{deadline}</Text>
          </TouchableOpacity>

          {/* Mini Calendário */}
          {showCalendar && (
            <View style={styles.calendarContainer}>
              <Text style={styles.calendarTitle}>Selecionar Data</Text>
              
              {/* Datas Rápidas */}
              <View style={styles.quickDateContainer}>
                {quickDates.map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.quickDateButton,
                      deadline === date && styles.selectedDate
                    ]}
                    onPress={() => {
                      setDeadline(date);
                      setShowCalendar(false);
                    }}
                  >
                    <Text style={[
                      styles.quickDateText,
                      deadline === date && styles.selectedDateText
                    ]}>
                      {date}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Campo de Data Personalizada */}
              <View style={styles.customDateSection}>
                <Text style={styles.customDateLabel}>Ou escreva sua data:</Text>
                <View style={styles.customDateInputContainer}>
                  <TextInput
                    style={styles.customDateInput}
                    value={customDate}
                    onChangeText={setCustomDate}
                    placeholder="Ex: 15 de Janeiro, 16:30"
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.customDateButton}
                    onPress={() => {
                      if (customDate.trim()) {
                        setDeadline(customDate.trim());
                        setCustomDate('');
                        setShowCalendar(false);
                      }
                    }}
                  >
                    <Text style={styles.customDateButtonText}>✓</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>Concluído</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFF2',
    borderRadius: 20,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFF2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFF2',
    borderBottomWidth: 1,
    borderBottomColor: '#FFEFBC',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#874a24',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#874a24',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#874a24',
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: '#FFEFBC',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e8ba7f',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleInput: {
    fontSize: 16,
    color: '#874a24',
    fontWeight: '600',
    flex: 1,
  },
  descriptionInput: {
    fontSize: 14,
    color: '#874a24',
    flex: 1,
    textAlignVertical: 'top',
  },
  editIcon: {
    marginLeft: 10,
  },
  editIconText: {
    fontSize: 18,
    color: '#874a24',
    fontWeight: 'bold',
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  selectedPriority: {
    borderWidth: 3,
    borderColor: '#874a24',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deadlineText: {
    fontSize: 16,
    color: '#874a24',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#874a24',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  calendarContainer: {
    backgroundColor: '#fff4d5',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e8ba7f',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#874a24',
    marginBottom: 15,
    textAlign: 'center',
  },
  quickDateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickDateButton: {
    backgroundColor: '#fbd77f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8ba7f',
    minWidth: '48%',
    alignItems: 'center',
  },
  selectedDate: {
    backgroundColor: '#874a24',
    borderColor: '#874a24',
  },
  quickDateText: {
    fontSize: 12,
    color: '#874a24',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedDateText: {
    color: '#fff',
    fontWeight: '600',
  },
  customDateSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e8ba7f',
    paddingTop: 15,
  },
  customDateLabel: {
    fontSize: 14,
    color: '#874a24',
    fontWeight: '600',
    marginBottom: 10,
  },
  customDateInputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  customDateInput: {
    flex: 1,
    backgroundColor: '#fbd77f',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#874a24',
    borderWidth: 1,
    borderColor: '#e8ba7f',
  },
  customDateButton: {
    backgroundColor: '#874a24',
    borderRadius: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customDateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});