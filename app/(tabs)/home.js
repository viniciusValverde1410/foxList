import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Pressable,
  Image,
  Alert,
  ActivityIndicator
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import * as Database from "../../utils/Database";
import { getDeadlineAlert, formatDateTime } from "../../utils/dateUtils";

export default function HomeScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState("data"); // "data" ou "prioridade"
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = ["Todos", "Pendentes", "Concluídas"];

  // Inicializar banco de dados
  useEffect(() => {
    initDB();
  }, []);

  // Atualizar lista quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const initDB = async () => {
    try {
      await Database.initDatabase();
      // Vincular tarefas órfãs ao usuário atual
      if (user?.email) {
        await Database.updateOrphanTasks(user.email);
      }
      await loadTasks();
    } catch (error) {
      Alert.alert("Erro", "Falha ao inicializar o banco de dados");
      console.error(error);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await Database.getAllTasks(user?.email);
      setTasks(allTasks);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar tarefas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const newStatus = !task.completed;
    
    try {
      await Database.toggleTaskCompletion(taskId, newStatus);
      await loadTasks(); // Recarregar tarefas

      // Feedback visual
      if (newStatus) {
        Alert.alert("✅ Parabéns!", "Tarefa concluída com sucesso!");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar tarefa");
      console.error(error);
    }
  };

  const deleteTaskHandler = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
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
              await Database.deleteTask(taskId);
              await loadTasks(); // Recarregar tarefas
              Alert.alert("✅ Sucesso!", "Tarefa deletada com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Falha ao deletar tarefa");
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    // Filtrar por texto de busca
    if (searchText.trim()) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtrar por status
    if (activeFilter === "Pendentes") {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (activeFilter === "Concluídas") {
      filteredTasks = filteredTasks.filter(task => task.completed);
    }
    // "Todos" mostra todas as tarefas (sem filtro adicional)

    // Ordenar
    if (sortBy === "data") {
      // Ordenar por data (mais recente primeiro)
      filteredTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "prioridade") {
      // Ordenar por prioridade (alta > média > baixa)
      const priorityOrder = { alta: 3, media: 2, baixa: 1 };
      filteredTasks.sort((a, b) => priorityOrder[b.status] - priorityOrder[a.status]);
    }

    return filteredTasks;
  };

  const handleTaskPress = (task) => {
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

  const handleCreateNewTask = () => {
    router.push({
      pathname: '/editTask',
      params: {
        title: '',
        description: '',
        priority: 'Baixa',
        deadline: '',
        isNew: true
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#874a24" />
        <Text style={styles.loadingText}>Carregando tarefas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.taskCounter}>
          <Text style={styles.counterNumber}>{tasks.filter(t => !t.completed).length}</Text>
          <Text style={styles.counterLabel}>Pendentes</Text>
        </View>
        <Text style={styles.title}>Minhas Tarefas</Text>
        <Image 
          source={require('../../assets/FoxList.png')} 
          style={styles.foxLogo}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tarefas..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.activeFilterTab
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter && styles.activeFilterText
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botões de Ordenação */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "data" && styles.activeSortButton
            ]}
            onPress={() => setSortBy("data")}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === "data" && styles.activeSortButtonText
            ]}>
              📅 Data
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "prioridade" && styles.activeSortButton
            ]}
            onPress={() => setSortBy("prioridade")}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === "prioridade" && styles.activeSortButtonText
            ]}>
              ⚠️ Prioridade
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Task List */}
      <ScrollView style={styles.taskList}>
        {getFilteredTasks().map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskContent}>
              <TouchableOpacity 
                style={[
                  styles.checkbox,
                  task.completed && styles.checkedBox
                ]}
                onPress={() => toggleTaskCompletion(task.id)}
              >
                {task.completed && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              
              <View style={styles.taskInfo}>
                <TouchableOpacity 
                  onPress={() => router.push({
                    pathname: '/taskDetails',
                    params: { id: task.id }
                  })}
                  style={styles.taskInfoTouchable}
                >
                  <Text style={[
                    styles.taskTitle,
                    task.completed && styles.completedTask
                  ]}>
                    {task.title}
                  </Text>
                  {/* Alerta de Prazo com Cor */}
                  {task.time && task.time !== 'Sem prazo' && (() => {
                    const alert = getDeadlineAlert(task.time);
                    return (
                      <View style={[styles.deadlineAlert, { backgroundColor: alert.backgroundColor }]}>
                        <Text style={[styles.deadlineAlertText, { color: alert.color }]}>
                          {alert.icon} {alert.message}
                        </Text>
                      </View>
                    );
                  })()}
                  {(!task.time || task.time === 'Sem prazo') && (
                    <Text style={styles.taskTime}>Sem prazo</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.taskActions}>
                <View style={[
                  styles.priorityBadge,
                  task.status === 'alta' && styles.highPriority,
                  task.status === 'media' && styles.mediumPriority,
                  task.status === 'baixa' && styles.lowPriority
                ]}>
                  <Text style={styles.priorityText}>
                    {task.status === 'alta' ? 'Alta' : 
                     task.status === 'media' ? 'Média' : 'Baixa'}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleTaskPress(task)}
                >
                  <Text style={styles.editIcon}>✎</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteTaskHandler(task.id)}
                >
                  <Text style={styles.deleteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Botão Flutuante para Criar Nova Tarefa */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleCreateNewTask}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF2", // Nova cor de fundo
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FFFFF2",
  },
  taskCounter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fbd87fc9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#874a24",
  },
  counterNumber: {
    fontSize: 20,
    color: "#874a24",
    fontWeight: "bold",
  },
  counterLabel: {
    fontSize: 10,
    color: "#874a24",
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#874a24",
    textAlign: "center",
    flex: 1,
  },
  foxLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#fffcf3ff",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: "#874a24",
    borderWidth: 1,
    borderColor: "#e8ba7f",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  filterTab: {
    backgroundColor: "#fbd87fc9",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e8ba7f",
  },
  activeFilterTab: {
    backgroundColor: "#874a24",
  },
  filterText: {
    fontSize: 14,
    color: "#874a24",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#FAF0E6",
    fontWeight: "600",
  },
  sortContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFF2',
  },
  sortLabel: {
    fontSize: 13,
    color: '#874a24',
    fontWeight: '600',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e8ba7f',
    alignItems: 'center',
  },
  activeSortButton: {
    backgroundColor: '#fbd87fc9',
    borderColor: '#874a24',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#874a24',
    fontWeight: '500',
  },
  activeSortButtonText: {
    fontWeight: '700',
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskCard: {
    backgroundColor: "#fff8e6ff",
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e8ba7f",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  taskContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#874a24",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  checkedBox: {
    backgroundColor: "#90EE90",
    borderColor: "#90EE90",
  },
  checkmark: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  taskInfo: {
    flex: 1,
    marginRight: 10,
  },
  taskInfoTouchable: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#874a24",
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskTime: {
    fontSize: 13,
    color: '#874a24',
  },
  deadlineAlert: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  deadlineAlertText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: "center",
  },
  highPriority: {
    backgroundColor: "#ff4d4dff",
  },
  mediumPriority: {
    backgroundColor: "#ffa82fff",
  },
  lowPriority: {
    backgroundColor: "#358535ff",
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFF",
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e8ba7f",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    fontSize: 16,
    color: "#874a24",
    fontWeight: "bold",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e8ba7f",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIcon: {
    fontSize: 16,
    color: "#874a24",
    fontWeight: "bold",
  },
  floatingButton: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonText: {
    fontSize: 40,
    color: '#874a24',
    fontWeight: 'bold',
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
});
