import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Email inválido");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(name, email, password);

      if (result.success) {
        Alert.alert("Sucesso", "Conta criada com sucesso!", [{ text: "OK" }]);
      } else {
        Alert.alert("Erro", result.message || "Falha ao criar conta");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.scrollContent}>
          <View style={styles.innerContent}>
            {/* Botão Voltar */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="#D4A574" />
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.imageWrapper}>
                <Image 
                  source={require('../../assets/FoxList.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text style={styles.welcomeText}>CADASTRE-SE</Text>

            {/* Card de Cadastro */}
            <View style={styles.registerCard}>
              {/* Campo de nome */}
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#8B4513" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome..."
                  placeholderTextColor="#CCC"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              {/* Campo de email */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#8B4513" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail..."
                  placeholderTextColor="#CCC"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              {/* Campo de senha */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#8B4513" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha..."
                  placeholderTextColor="#CCC"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Campo de confirmar senha */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#8B4513" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite a senha novamente..."
                  placeholderTextColor="#CCC"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Botão Sign Up */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#904D00" />
                ) : (
                  <Text style={styles.buttonText}>Criar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF2",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  innerContent: {
    padding: 20,
    paddingBottom: 0,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  imageWrapper: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  logoImage: {
    width: 220,
    height: 220,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#D4A574",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 1,
  },
  registerCard: {
    backgroundColor: "#904D00",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    marginTop: 20,
    marginHorizontal: -20,
    marginBottom: 0,
    paddingBottom: 50,
    minHeight: "60%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  inputContainer: {
    backgroundColor: "#FFFFF2",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 0,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
    outlineStyle: "none",
  },
  button: {
    backgroundColor: "#D4A574",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 25,
    minHeight: 48,
    justifyContent: "center",
    width: "50%",
    alignSelf: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#904D00",
    fontSize: 16,
    fontWeight: "bold",
  },
});
