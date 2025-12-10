import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db = null;
let mockData = []; // Fallback para web

const isWeb = Platform.OS === 'web';

/**
 * Inicializa o banco de dados e cria a tabela de tarefas se não existir
 */
export const initDatabase = async () => {
  try {
    if (isWeb) {
      // No web, usar localStorage como fallback
      const stored = localStorage.getItem('foxlist_tasks');
      mockData = stored ? JSON.parse(stored) : [];
      console.log('✅ Banco de dados web inicializado com sucesso!');
      return true;
    }

    // Abre ou cria o banco de dados
    db = await SQLite.openDatabaseAsync('foxlist.db');
    
    // Verifica se a coluna user_email existe
    const tableInfo = await db.getAllAsync('PRAGMA table_info(tasks)');
    const hasUserEmail = tableInfo.some(col => col.name === 'user_email');
    
    if (!hasUserEmail && tableInfo.length > 0) {
      // Migração: adiciona coluna user_email
      await db.execAsync('ALTER TABLE tasks ADD COLUMN user_email TEXT');
      console.log('✅ Migração: coluna user_email adicionada');
    }
    
    // Cria a tabela de tarefas se não existir
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        time TEXT,
        completed INTEGER DEFAULT 0,
        user_email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

/**
 * Busca o banco de dados (garante que está inicializado)
 */
const getDatabase = async () => {
  if (isWeb) {
    return null; // Web usa mockData
  }
  if (!db) {
    await initDatabase();
  }
  return db;
};

// Funções auxiliares para Web
const saveToLocalStorage = () => {
  if (isWeb) {
    localStorage.setItem('foxlist_tasks', JSON.stringify(mockData));
  }
};

const getNextId = () => {
  if (mockData.length === 0) return 1;
  return Math.max(...mockData.map(t => t.id)) + 1;
};

/**
 * Cria uma nova tarefa no banco de dados
 * @param {Object} task - Objeto com os dados da tarefa (title, description, status, time)
 * @returns {Object} - Tarefa criada com o ID gerado
 */
export const createTask = async (task) => {
  try {
    const { title, description, status, time, user_email } = task;
    
    if (isWeb) {
      const newTask = {
        id: getNextId(),
        title,
        description: description || '',
        status,
        time: time || 'Sem prazo',
        completed: false,
        user_email: user_email || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockData.push(newTask);
      saveToLocalStorage();
      return newTask;
    }

    const database = await getDatabase();
    
    const result = await database.runAsync(
      'INSERT INTO tasks (title, description, status, time, completed, user_email) VALUES (?, ?, ?, ?, 0, ?)',
      [title, description || '', status, time || 'Sem prazo', user_email || null]
    );
    
    // Retorna a tarefa criada com o ID gerado
    return {
      id: result.lastInsertRowId,
      title,
      description: description || '',
      status,
      time: time || 'Sem prazo',
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Erro ao criar tarefa:', error);
    throw error;
  }
};

/**
 * Busca todas as tarefas do banco de dados (opcionalmente filtradas por usuário)
 * @param {string} userEmail - Email do usuário (opcional)
 * @returns {Array} - Array com todas as tarefas
 */
export const getAllTasks = async (userEmail = null) => {
  try {
    if (isWeb) {
      const filtered = userEmail 
        ? mockData.filter(t => t.user_email === userEmail)
        : mockData;
      return filtered.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
    }

    const database = await getDatabase();
    
    const query = userEmail
      ? 'SELECT * FROM tasks WHERE user_email = ? OR user_email IS NULL ORDER BY created_at DESC'
      : 'SELECT * FROM tasks ORDER BY created_at DESC';
    
    const params = userEmail ? [userEmail] : [];
    const tasks = await database.getAllAsync(query, params);
    
    // Converte o campo completed de INTEGER para boolean
    return tasks.map(task => ({
      ...task,
      completed: task.completed === 1
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar tarefas:', error);
    throw error;
  }
};

/**
 * Busca uma tarefa específica por ID
 * @param {number} id - ID da tarefa
 * @returns {Object|null} - Objeto da tarefa ou null se não encontrada
 */
export const getTaskById = async (id) => {
  try {
    if (isWeb) {
      const task = mockData.find(t => t.id === id);
      return task || null;
    }

    const database = await getDatabase();
    const task = await database.getFirstAsync('SELECT * FROM tasks WHERE id = ?', [id]);
    
    if (task) {
      return {
        ...task,
        completed: task.completed === 1
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar tarefa:', error);
    throw error;
  }
};

/**
 * Atualiza uma tarefa existente
 * @param {number} id - ID da tarefa
 * @param {Object} updates - Objeto com os campos a serem atualizados
 * @returns {boolean} - true se atualizado com sucesso
 */
export const updateTask = async (id, updates) => {
  try {
    const { title, description, status, time, completed } = updates;
    
    if (isWeb) {
      const index = mockData.findIndex(t => t.id === id);
      if (index !== -1) {
        mockData[index] = {
          ...mockData[index],
          title,
          description: description || '',
          status,
          time: time || 'Sem prazo',
          completed: completed || false,
          updated_at: new Date().toISOString()
        };
        saveToLocalStorage();
      }
      return true;
    }

    const database = await getDatabase();
    
    await database.runAsync(
      `UPDATE tasks 
       SET title = ?, description = ?, status = ?, time = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title, 
        description || '', 
        status, 
        time || 'Sem prazo', 
        completed ? 1 : 0, 
        id
      ]
    );
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar tarefa:', error);
    throw error;
  }
};

/**
 * Marca uma tarefa como concluída ou não concluída
 * @param {number} id - ID da tarefa
 * @param {boolean} completed - Status de conclusão
 * @returns {boolean} - true se atualizado com sucesso
 */
export const toggleTaskCompletion = async (id, completed) => {
  try {
    if (isWeb) {
      const index = mockData.findIndex(t => t.id === id);
      if (index !== -1) {
        mockData[index].completed = completed;
        mockData[index].updated_at = new Date().toISOString();
        saveToLocalStorage();
      }
      return true;
    }

    const database = await getDatabase();
    
    await database.runAsync(
      'UPDATE tasks SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [completed ? 1 : 0, id]
    );
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao alterar status da tarefa:', error);
    throw error;
  }
};

/**
 * Deleta uma tarefa do banco de dados
 * @param {number} id - ID da tarefa
 * @returns {boolean} - true se deletado com sucesso
 */
export const deleteTask = async (id) => {
  try {
    if (isWeb) {
      mockData = mockData.filter(t => t.id !== id);
      saveToLocalStorage();
      return true;
    }

    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar tarefa:', error);
    throw error;
  }
};

/**
 * Deleta todas as tarefas de um usuário
 * @param {string} userEmail - Email do usuário
 * @returns {boolean} - true se deletado com sucesso
 */
export const deleteUserTasks = async (userEmail) => {
  try {
    if (isWeb) {
      mockData = mockData.filter(t => t.user_email !== userEmail);
      saveToLocalStorage();
      return true;
    }

    const database = await getDatabase();
    // Deleta tarefas com o email do usuário OU sem email (tarefas antigas)
    await database.runAsync('DELETE FROM tasks WHERE user_email = ? OR user_email IS NULL', [userEmail]);
    
    console.log(`✅ Tarefas do usuário ${userEmail} deletadas`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar tarefas do usuário:', error);
    throw error;
  }
};

/**
 * Atualiza tarefas sem user_email para o usuário atual
 * @param {string} userEmail - Email do usuário
 * @returns {boolean} - true se atualizado com sucesso
 */
export const updateOrphanTasks = async (userEmail) => {
  try {
    if (isWeb) {
      mockData = mockData.map(t => 
        t.user_email ? t : { ...t, user_email: userEmail }
      );
      saveToLocalStorage();
      return true;
    }

    const database = await getDatabase();
    await database.runAsync(
      'UPDATE tasks SET user_email = ? WHERE user_email IS NULL',
      [userEmail]
    );
    
    console.log(`✅ Tarefas órfãs vinculadas ao usuário ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar tarefas órfãs:', error);
    throw error;
  }
};

/**
 * Busca tarefas por status de conclusão
 * @param {boolean} completed - Status de conclusão
 * @returns {Array} - Array com as tarefas filtradas
 */
export const getTasksByStatus = async (completed) => {
  try {
    if (isWeb) {
      return mockData.filter(t => t.completed === completed)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const database = await getDatabase();
    const tasks = await database.getAllAsync(
      'SELECT * FROM tasks WHERE completed = ? ORDER BY created_at DESC',
      [completed ? 1 : 0]
    );
    
    return tasks.map(task => ({
      ...task,
      completed: task.completed === 1
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar tarefas por status:', error);
    throw error;
  }
};

/**
 * Busca tarefas por texto (título ou descrição)
 * @param {string} searchText - Texto a ser buscado
 * @returns {Array} - Array com as tarefas encontradas
 */
export const searchTasks = async (searchText) => {
  try {
    if (isWeb) {
      const search = searchText.toLowerCase();
      return mockData.filter(t => 
        t.title.toLowerCase().includes(search) || 
        t.description.toLowerCase().includes(search)
      ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const database = await getDatabase();
    const tasks = await database.getAllAsync(
      'SELECT * FROM tasks WHERE title LIKE ? OR description LIKE ? ORDER BY created_at DESC',
      [`%${searchText}%`, `%${searchText}%`]
    );
    
    return tasks.map(task => ({
      ...task,
      completed: task.completed === 1
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar tarefas:', error);
    throw error;
  }
};

/**
 * Limpa todas as tarefas do banco de dados (use com cuidado!)
 * @returns {boolean} - true se limpo com sucesso
 */
export const clearAllTasks = async () => {
  try {
    if (isWeb) {
      mockData = [];
      saveToLocalStorage();
      return true;
    }

    const database = await getDatabase();
    await database.runAsync('DELETE FROM tasks');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar tarefas:', error);
    throw error;
  }
};

/**
 * Conta o total de tarefas
 * @returns {number} - Número total de tarefas
 */
export const getTasksCount = async () => {
  try {
    if (isWeb) {
      return mockData.length;
    }

    const database = await getDatabase();
    const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM tasks');
    return result.count;
  } catch (error) {
    console.error('❌ Erro ao contar tarefas:', error);
    throw error;
  }
};
