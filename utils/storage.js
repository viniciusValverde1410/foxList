import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER: "@rotas_privadas:user",
  USERS_DB: "@rotas_privadas:users_db",
};

// Salvar usuário logado
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    return false;
  }
};

// Obter usuário logado
export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Erro ao obter usuário:", error);
    return null;
  }
};

// Remover usuário logado (logout)
export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    return true;
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return false;
  }
};

// Obter todos os usuários cadastrados
export const getAllUsers = async () => {
  try {
    const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error("Erro ao obter usuários:", error);
    return [];
  }
};

// Salvar novo usuário no banco de dados
export const saveNewUser = async (user) => {
  try {
    const users = await getAllUsers();

    // Verificar se email já existe
    const emailExists = users.some((u) => u.email === user.email);
    if (emailExists) {
      return { success: false, message: "Email já cadastrado" };
    }

    // Adicionar novo usuário
    users.push(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar novo usuário:", error);
    return { success: false, message: "Erro ao cadastrar usuário" };
  }
};

// Validar login
export const validateLogin = async (email, password) => {
  try {
    const users = await getAllUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Não retornar a senha
      const { password: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, message: "Credenciais inválidas" };
  } catch (error) {
    console.error("Erro ao validar login:", error);
    return { success: false, message: "Erro ao fazer login" };
  }
};

// Atualizar dados do usuário
export const updateUser = async (userId, updatedData) => {
  try {
    const users = await getAllUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: "Usuário não encontrado" };
    }

    // Verificar se o novo email já existe em outro usuário
    if (updatedData.email) {
      const emailExists = users.some(
        (u) => u.email === updatedData.email && u.id !== userId
      );
      if (emailExists) {
        return { success: false, message: "Email já está em uso" };
      }
    }

    // Atualizar usuário
    users[userIndex] = { ...users[userIndex], ...updatedData };
    await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

    // Atualizar usuário logado
    const { password: _, ...userWithoutPassword } = users[userIndex];
    await saveUser(userWithoutPassword);

    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return { success: false, message: "Erro ao atualizar usuário" };
  }
};

// Deletar usuário
export const deleteUser = async (userId) => {
  try {
    const users = await getAllUsers();
    const filteredUsers = users.filter((u) => u.id !== userId);

    await AsyncStorage.setItem(
      STORAGE_KEYS.USERS_DB,
      JSON.stringify(filteredUsers)
    );
    await removeUser(); // Remove o usuário logado

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return { success: false, message: "Erro ao deletar usuário" };
  }
};

// Limpar todos os dados (útil para debug)
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.USERS_DB]);
    return true;
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    return false;
  }
};
