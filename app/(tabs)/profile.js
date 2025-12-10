import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, signOut, updateProfile, deleteAccount } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const handleEditProfile = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    const result = await updateProfile({
      name: editName.trim(),
      email: editEmail.trim(),
    });

    if (result.success) {
      Alert.alert("✅ Sucesso!", "Perfil atualizado com sucesso!");
      setIsEditModalVisible(false);
    } else {
      Alert.alert("Erro", result.message || "Não foi possível atualizar o perfil");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "⚠️ Excluir Conta",
      "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita!",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const result = await deleteAccount();
            if (result.success) {
              Alert.alert("✅ Conta Excluída", "Sua conta foi excluída com sucesso");
            } else {
              Alert.alert("Erro", result.message || "Não foi possível excluir a conta");
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>👤</Text>
        </View>

        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>ID do Usuário</Text>
          <Text style={styles.infoValue}>{user?.id}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Membro desde</Text>
          <Text style={styles.infoValue}>
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("pt-BR")
              : "N/A"}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>✅</Text>
          <Text style={styles.statusText}>Conta Ativa</Text>
          <Text style={styles.statusDescription}>
            Suas credenciais estão salvas no AsyncStorage
          </Text>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>✏️ Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🔒 Sair da Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>🗑️ Excluir Conta</Text>
        </TouchableOpacity>

        <View style={styles.versionCard}>
          <Text style={styles.versionText}>
            Versão 2.0 - Com Expo Router + AsyncStorage
          </Text>
        </View>
      </View>

      {/* Modal de Edição */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>

            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Digite seu nome"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff4d5",
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatar: {
    fontSize: 50,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  infoLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  statusCard: {
    width: "100%",
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#81C784",
  },
  statusEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 5,
  },
  statusDescription: {
    fontSize: 12,
    color: "#388E3C",
    textAlign: "center",
  },
  editButton: {
    width: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    width: "100%",
    backgroundColor: "#FF9500",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    width: "100%",
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  versionCard: {
    width: "100%",
    padding: 15,
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#E5E5E5",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
