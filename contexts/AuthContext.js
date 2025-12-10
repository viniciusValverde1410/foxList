import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getUser,
  saveUser,
  removeUser,
  validateLogin,
  saveNewUser,
  updateUser,
  deleteUser,
} from "../utils/storage";
import * as Database from "../utils/Database";
import { useRouter, useSegments } from "expo-router";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Carregar usuário do AsyncStorage ao iniciar
  useEffect(() => {
    loadUser();
  }, []);

  // Proteger rotas baseado em autenticação
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Redirecionar para login se não estiver autenticado
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Redirecionar para home se já estiver autenticado
      router.replace("/(tabs)/home");
    }
  }, [user, segments, isLoading]);

  const loadUser = async () => {
    try {
      const storedUser = await getUser();
      setUser(storedUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const result = await validateLogin(email, password);

      if (result.success) {
        setUser(result.user);
        await saveUser(result.user);
        return { success: true };
      }

      return { success: false, message: result.message };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return { success: false, message: "Erro ao fazer login" };
    }
  };

  const signUp = async (name, email, password) => {
    try {
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // Em produção, use hash!
        createdAt: new Date().toISOString(),
      };

      const result = await saveNewUser(newUser);

      if (result.success) {
        // Fazer login automático após cadastro
        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        await saveUser(userWithoutPassword);
        return { success: true };
      }

      return { success: false, message: result.message };
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      return { success: false, message: "Erro ao cadastrar usuário" };
    }
  };

  const signOut = async () => {
    try {
      await removeUser();
      setUser(null);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const result = await updateUser(user.id, updatedData);

      if (result.success) {
        setUser(result.user);
        return { success: true };
      }

      return { success: false, message: result.message };
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { success: false, message: "Erro ao atualizar perfil" };
    }
  };

  const deleteAccount = async () => {
    try {
      console.log(`🗑️ Deletando conta e tarefas do usuário: ${user.email}`);
      
      // Primeiro, deleta todas as tarefas do usuário
      await Database.deleteUserTasks(user.email);
      
      const result = await deleteUser(user.id);

      if (result.success) {
        setUser(null);
        router.replace("/(auth)/login");
        return { success: true };
      }

      return { success: false, message: result.message };
    } catch (error) {
      console.error("Erro ao deletar conta:", error);
      return { success: false, message: "Erro ao deletar conta" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
