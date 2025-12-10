import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Database from '../utils/Database';
import { getDeadlineAlert, formatDateTime } from '../utils/dateUtils';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskDetails();
  }, [id]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const taskData = await Database.getTaskById(parseInt(id));
      setTask(taskData);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar detalhes da tarefa');
      console.error(error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: '/editTask',
      params: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.status === 'alta' ? 'Alta' : task.status === 'media' ? 'Média' : 'Baixa',
        deadline: task.time,
        isNew: false
      }
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Deletar Tarefa',
      `Tem certeza que deseja deletar "${task.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await Database.deleteTask(task.id);
              Alert.alert('✅ Sucesso!', 'Tarefa deletada com sucesso!');
              router.back();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao deletar tarefa');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const handleToggleComplete = async () => {
    try {
      const newStatus = !task.completed;
      await Database.toggleTaskCompletion(task.id, newStatus);
      setTask({ ...task, completed: newStatus });
      Alert.alert(
        '✅ Sucesso!',
        newStatus ? 'Tarefa marcada como concluída!' : 'Tarefa marcada como pendente!'
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar status da tarefa');
      console.error(error);
    }
  };

  const getPriorityColor = () => {
    if (!task) return '#358535ff';
    switch (task.status) {
      case 'alta': return '#ff4d4dff';
      case 'media': return '#ffa82fff';
      case 'baixa': return '#358535ff';
      default: return '#358535ff';
    }
  };

  const getPriorityText = () => {
    if (!task) return 'Baixa';
    switch (task.status) {
      case 'alta': return 'Alta';
      case 'media': return 'Média';
      case 'baixa': return 'Baixa';
      default: return 'Baixa';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não definida';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#874a24" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Tarefa não encontrada</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Tarefa</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
          <Text style={styles.headerIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: task.completed ? '#90EE90' : '#FFA500' }
          ]}>
            <Text style={styles.statusText}>
              {task.completed ? '✓ Concluída' : '⏳ Pendente'}
            </Text>
          </View>
        </View>

        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>Título</Text>
          <View style={styles.infoBox}>
            <Text style={[styles.infoText, task.completed && styles.completedText]}>
              {task.title}
            </Text>
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.label}>Descrição</Text>
          <View style={[styles.infoBox, styles.descriptionBox]}>
            <Text style={[styles.infoText, task.completed && styles.completedText]}>
              {task.description || 'Sem descrição'}
            </Text>
          </View>
        </View>

        {/* Prioridade */}
        <View style={styles.section}>
          <Text style={styles.label}>Prioridade</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
            <Text style={styles.priorityBadgeText}>{getPriorityText()}</Text>
          </View>
        </View>

        {/* Prazo */}
        <View style={styles.section}>
          <Text style={styles.label}>Prazo</Text>
          {task.time && task.time !== 'Sem prazo' ? (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{formatDateTime(new Date(task.time))}</Text>
              </View>
              {/* Alerta de Prazo com Cor */}
              {(() => {
                const alert = getDeadlineAlert(task.time);
                return (
                  <View style={[styles.deadlineAlert, { backgroundColor: alert.backgroundColor }]}>
                    <Text style={[styles.deadlineAlertText, { color: alert.color }]}>
                      {alert.icon} {alert.message}
                    </Text>
                  </View>
                );
              })()}
            </>
          ) : (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Sem prazo definido</Text>
            </View>
          )}
        </View>

        {/* Datas */}
        <View style={styles.section}>
          <Text style={styles.label}>Criada em</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoTextSmall}>{formatDate(task.created_at)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Última atualização</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoTextSmall}>{formatDate(task.updated_at)}</Text>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleToggleComplete}
          >
            <Text style={styles.actionButtonText}>
              {task.completed ? '↺ Marcar como Pendente' : '✓ Marcar como Concluída'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
          >
            <Text style={styles.actionButtonText}>✎ Editar Tarefa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.actionButtonText}>✕ Deletar Tarefa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFF2',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#874a24',
  },
  errorText: {
    fontSize: 18,
    color: '#874a24',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFFFF2',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ba7f',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fbd87fc9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
    color: '#874a24',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#874a24',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#874a24',
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: '#fff8e6ff',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e8ba7f',
  },
  descriptionBox: {
    minHeight: 100,
  },
  infoText: {
    fontSize: 16,
    color: '#874a24',
  },
  infoTextSmall: {
    fontSize: 14,
    color: '#874a24',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  priorityBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  deadlineAlert: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  deadlineAlertText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  completeButton: {
    backgroundColor: '#90EE90',
  },
  editButton: {
    backgroundColor: '#ffa82fff',
  },
  deleteButton: {
    backgroundColor: '#ff4d4dff',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  backButton: {
    backgroundColor: '#874a24',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
