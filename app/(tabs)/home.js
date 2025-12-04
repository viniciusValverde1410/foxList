import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Pressable,
  Image,
  Alert
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { router, useLocalSearchParams } from "expo-router";

export default function HomeScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Reunião de Projeto",
      time: "Hoje, 14:00",
      status: "alta",
      completed: false,
      description: "A reunião do Projeto Aurora, focará nas novas etapas de desenvolvimento e marketing. O objetivo é alinhar o cronograma e definir as próximas ações para a fase 2, com base no feedback beta."
    },
    {
      id: 2,
      title: "Estudar React Native",
      time: "25 de Dezembro",
      status: "media",
      completed: false,
      description: "Revisar conceitos de hooks, navegação e styling no React Native para o projeto em desenvolvimento."
    },
    {
      id: 3,
      title: "Comprar ingredientes",
      time: "26 de Dezembro",
      status: "baixa",
      completed: true,
      description: "Lista de compras para o jantar de fim de ano: carne, verduras, temperos e sobremesa."
    },
    {
      id: 4,
      title: "Planejar Viagem",
      time: "27 de Dezembro",
      status: "baixa",
      completed: true,
      description: "Organizar roteiro, reservas de hotel e atividades para as férias de janeiro."
    }
  ]);

  const filters = ["Todos", "Pendentes", "Concluídas"];

  // Processar ações vindas da tela de edição
  useEffect(() => {
    if (params.completeTaskId) {
      // Marcar tarefa como concluída
      const taskId = parseInt(params.completeTaskId);
      setTasks(currentTasks => currentTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: true }
          : task
      ));
      Alert.alert("✅ Parabéns!", "Tarefa concluída com sucesso!");
      
      // Limpar parâmetro
      router.replace('/(tabs)/home');
    }
    
    if (params.updateTask) {
      // Atualizar tarefa existente
      try {
        const updatedTask = JSON.parse(params.updateTask);
        setTasks(currentTasks => currentTasks.map(task => 
          task.id === parseInt(updatedTask.id)
            ? { 
                ...task, 
                title: updatedTask.title,
                description: updatedTask.description,
                status: updatedTask.status,
                time: updatedTask.deadline
              }
            : task
        ));
        Alert.alert("✅ Sucesso!", "Tarefa atualizada com sucesso!");
        
        // Limpar parâmetro
        router.replace('/(tabs)/home');
      } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
      }
    }
    
    if (params.newTask) {
      // Adicionar nova tarefa
      try {
        const newTask = JSON.parse(params.newTask);
        const taskToAdd = {
          id: parseInt(newTask.id),
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          time: newTask.deadline,
          completed: false
        };
        setTasks(currentTasks => [...currentTasks, taskToAdd]);
        Alert.alert("✅ Sucesso!", "Nova tarefa criada com sucesso!");
        
        // Limpar parâmetro
        router.replace('/(tabs)/home');
      } catch (error) {
        console.error('Erro ao criar tarefa:', error);
      }
    }
  }, [params.completeTaskId, params.updateTask, params.newTask]);

  const toggleTaskCompletion = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const newStatus = !task.completed;
    
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: newStatus }
        : task
    ));

    // Feedback visual
    if (newStatus) {
      Alert.alert("✅ Parabéns!", "Tarefa concluída com sucesso!", [
        { text: "OK" }
      ]);
    }
  };

  const deleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    Alert.alert(
      'Deletar Tarefa',
      `Tem certeza que deseja deletar "${task.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Deletar', 
          style: 'destructive',
          onPress: () => setTasks(tasks.filter(task => task.id !== taskId))
        }
      ]
    );
  };

  const updateTask = (taskId, updatedData) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updatedData }
        : task
    ));
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
        onUpdate: updateTask
      }
    });
  };

  const handleCreateNewTask = () => {
    const newId = Math.max(...tasks.map(t => t.id)) + 1;
    router.push({
      pathname: '/editTask',
      params: {
        id: newId,
        title: '',
        description: '',
        priority: 'Baixa',
        deadline: 'Hoje, 14:00',
        isNew: true
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
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
                <Text style={[
                  styles.taskTitle,
                  task.completed && styles.completedTask
                ]}>
                  {task.title}
                </Text>
                <Text style={styles.taskTime}>{task.time}</Text>
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
                  onPress={() => deleteTask(task.id)}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFF2",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 18,
    color: "#874a24",
    fontWeight: "bold",
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
    color: "#874a24",
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
});
