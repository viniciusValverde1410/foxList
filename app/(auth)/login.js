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
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CustomModal from "../components/CustomModal";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: "info",
    title: "",
    message: "",
  });
  const { signIn } = useAuth();

  const showModal = (type, title, message) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showModal("error", "Erro", "Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);

      if (!result.success) {
        showModal("error", "Erro de Login" || "Falha ao fazer login");
      } else {
        showModal("success", "Sucesso!", "Login realizado com sucesso!");
      }
    } catch (error) {
      showModal("error", "Erro", "Falha ao fazer login. Tente novamente.");
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
            {/* Logo e título */}
            <View style={styles.logoContainer}>
              <View style={styles.imageWrapper}>
                <Image 
                  source={require('../../assets/FoxList.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text style={styles.welcomeText}>Bem - vindo(a) !</Text>
            <Text style={styles.subtitle}>Pequenas tarefas</Text>
            <Text style={styles.subtitle}>geram grandes resultados.</Text>

            {/* Card de Login */}
            <View style={styles.loginCard}>
              <Text style={styles.loginTitle}>Login</Text>

              {/* Campo de nome/email */}
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#8B4513" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome..."
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
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
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Botão Entrar */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#8B4513" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              {/* Link de cadastro */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Não tem um conta? </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity disabled={loading}>
                    <Text style={styles.registerLink}>Cadastre-se</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <CustomModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
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
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  imageWrapper: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  logoImage: {
    width: 220,
    height: 220,
  },
  logoText: {
    fontSize: 18,
    color: "#D4A574",
    fontWeight: "500",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#D4A574",
    textAlign: "center",
    lineHeight: 24,
  },
  loginCard: {
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
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
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
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 15,
    minHeight: 50,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#904D00",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: "#F5E6D3",
    fontSize: 13,
  },
  registerLink: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
