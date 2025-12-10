import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import * as Database from '../utils/Database';
import { formatDateTime, parseDate } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

export default function EditTaskScreen() {
  const { user } = useAuth();
  const { id, title: initialTitle, description: initialDescription, priority: initialPriority, deadline: initialDeadline, isNew } = useLocalSearchParams();
  
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [priority, setPriority] = useState(initialPriority || 'Baixa');
  const [deadline, setDeadline] = useState(initialDeadline || '');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());

  const priorities = ['Baixa', 'Média', 'Alta'];

  useEffect(() => {
    // Inicializar data se houver prazo anterior
    if (initialDeadline && initialDeadline !== 'Sem prazo') {
      const parsedDate = parseDate(initialDeadline);
      if (parsedDate) {
        setSelectedDate(parsedDate);
        setTempDate(parsedDate);
        setTempTime(parsedDate);
      }
    }
  }, []);

  const handleDateSelect = (day) => {
    const newDate = new Date(day.dateString);
    // Ajustar para timezone local
    const offset = new Date().getTimezoneOffset();
    newDate.setMinutes(newDate.getMinutes() + offset);
    newDate.setHours(tempDate.getHours());
    newDate.setMinutes(tempDate.getMinutes());
    setTempDate(newDate);
  };

  const handleTimeChange = (event, time) => {
    if (event.type === 'set' && time) {
      setTempTime(time);
      if (Platform.OS === 'android') {
        setShowTimePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowTimePicker(false);
    }
  };

  const confirmDateTime = () => {
    const finalDate = new Date(tempDate);
    finalDate.setHours(tempTime.getHours());
    finalDate.setMinutes(tempTime.getMinutes());
    setSelectedDate(finalDate);
    setDeadline(finalDate.toISOString());
    setShowCalendarModal(false);
    setShowTimePicker(false);
  };

  const handleQuickDate = (days) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    newDate.setHours(9);
    newDate.setMinutes(0);
    setTempDate(newDate);
    setSelectedDate(newDate);
    setDeadline(newDate.toISOString());
    setShowCalendarModal(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, digite um título para a tarefa');
      return;
    }

    const statusMap = {
      'Alta': 'alta',
      'Média': 'media',
      'Baixa': 'baixa'
    };

    try {
      // Usar deadline em formato ISO ou 'Sem prazo'
      const finalDeadline = deadline || 'Sem prazo';
      
      if (isNew === 'true' || isNew === true) {
        // Criar nova tarefa
        const newTask = await Database.createTask({
          title: title.trim(),
          description: description.trim(),
          status: statusMap[priority],
          time: finalDeadline,
          user_email: user?.email
        });
        Alert.alert('✅ Sucesso!', 'Nova tarefa criada com sucesso!');
      } else {
        // Atualizar tarefa existente
        await Database.updateTask(parseInt(id), {
          title: title.trim(),
          description: description.trim(),
          status: statusMap[priority],
          time: finalDeadline,
          completed: false
        });
        Alert.alert('✅ Sucesso!', 'Tarefa atualizada com sucesso!');
      }
      
      // Voltar para a tela principal
      router.back();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      Alert.alert('Erro', 'Não foi possível salvar a tarefa');
    }
  };

  const handleComplete = async () => {
    Alert.alert(
      'Concluir Tarefa',
      'Deseja marcar esta tarefa como concluída?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Concluir', 
          onPress: async () => {
            try {
              await Database.toggleTaskCompletion(parseInt(id), true);
              Alert.alert('✅ Parabéns!', 'Tarefa concluída com sucesso!');
              router.back();
            } catch (error) {
              console.error('Erro ao concluir tarefa:', error);
              Alert.alert('Erro', 'Não foi possível concluir a tarefa');
            }
          }
        }
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      'Excluir Tarefa',
      'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await Database.deleteTask(parseInt(id));
              Alert.alert('✅ Sucesso!', 'Tarefa excluída com sucesso!');
              router.back();
            } catch (error) {
              console.error('Erro ao excluir tarefa:', error);
              Alert.alert('Erro', 'Não foi possível excluir a tarefa');
            }
          }
        }
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
    <View style={styles.container}>
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
              placeholderTextColor="#b8936d"
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
              placeholderTextColor="#b8936d"
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
              onPress={() => setShowCalendarModal(true)}
            >
              <Text style={styles.editIconText}>📅</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.deadlineContainer}
            onPress={() => setShowCalendarModal(true)}
          >
            <Text style={styles.deadlineText}>
              {deadline ? formatDateTime(selectedDate) : 'Toque para selecionar data e hora'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botão de Ação Estilizado */}
        <TouchableOpacity 
          style={[styles.addButton, !isNew && styles.editButton]} 
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <View style={styles.addButtonContent}>
            <Text style={styles.addButtonIcon}>{isNew ? '➕' : '✓'}</Text>
            <Text style={styles.addButtonText}>
              {isNew ? 'Adicionar Tarefa' : 'Salvar Alterações'}
            </Text>
          </View>
        </TouchableOpacity>

        {!isNew && (
          <TouchableOpacity 
            style={styles.completeButton} 
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>✓ Marcar como Concluído</Text>
          </TouchableOpacity>
        )}

        {!isNew && (
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>🗑️ Excluir Tarefa</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal do Calendário */}
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.calendarModalOverlay}>
          <View style={styles.calendarModalContainer}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.calendarScrollContent}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>📅 Selecione a Data</Text>
              <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Calendar
              current={tempDate.toISOString().split('T')[0]}
              minDate={new Date().toISOString().split('T')[0]}
              onDayPress={handleDateSelect}
              markedDates={{
                [tempDate.toISOString().split('T')[0]]: {
                  selected: true,
                  selectedColor: '#874a24',
                  selectedTextColor: '#FFF'
                }
              }}
              theme={{
                backgroundColor: '#FFFFF2',
                calendarBackground: '#FFFFF2',
                textSectionTitleColor: '#874a24',
                selectedDayBackgroundColor: '#874a24',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#FF9500',
                dayTextColor: '#874a24',
                textDisabledColor: '#d9d9d9',
                dotColor: '#874a24',
                selectedDotColor: '#ffffff',
                arrowColor: '#874a24',
                monthTextColor: '#874a24',
                indicatorColor: '#874a24',
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '400',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
            />

            <View style={styles.timeSection}>
              <Text style={styles.timeSectionTitle}>⏰ Horário</Text>
              <TouchableOpacity 
                style={styles.timeSelectButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeSelectText}>
                  {tempTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time Picker */}
            {showTimePicker && Platform.OS !== 'web' && (
              <View style={styles.timePickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  is24Hour={true}
                  textColor="#874a24"
                  themeVariant="light"
                  style={styles.timePicker}
                />
              </View>
            )}

            <View style={styles.calendarActions}>
              <TouchableOpacity 
                style={styles.calendarCancelButton}
                onPress={() => setShowCalendarModal(false)}
              >
                <Text style={styles.calendarCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.calendarConfirmButton}
                onPress={confirmDateTime}
              >
                <Text style={styles.calendarConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFF2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
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
    backgroundColor: '#FFFFFF',
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
  deadlineContainer: {
    backgroundColor: '#fff8e6ff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e8ba7f',
    marginBottom: 10,
  },
  deadlineText: {
    fontSize: 16,
    color: '#874a24',
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#874a24',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  editButton: {
    backgroundColor: '#FF9500',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  addButtonIcon: {
    fontSize: 20,
    color: '#fff',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  completeButton: {
    backgroundColor: '#34C759',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 5,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalContainer: {
    width: '90%',
    backgroundColor: '#FFFFF2',
    borderRadius: 20,
    padding: 20,
    maxHeight: '75%',
  },
  calendarScrollContent: {
    paddingBottom: 30,
    flexGrow: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#874a24',
  },
  closeButton: {
    fontSize: 24,
    color: '#874a24',
    fontWeight: 'bold',
  },
  timeSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff8e6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8ba7f',
  },
  timeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#874a24',
    marginBottom: 10,
  },
  timeSelectButton: {
    backgroundColor: '#874a24',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5a2f15',
  },
  timeSelectText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timePickerContainer: {
    backgroundColor: '#FFFFF2',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#874a24',
    maxHeight: 150,
    overflow: 'hidden',
  },
  timePicker: {
    backgroundColor: '#FFFFF2',
    height: 100,
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  calendarCancelButton: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  calendarCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calendarConfirmButton: {
    flex: 1,
    backgroundColor: '#874a24',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  calendarConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});