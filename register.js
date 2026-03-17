import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, TextInput, StyleSheet, Text, View, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {themes} from './themes'

export default function RegisterPage() {
  const navigation = useNavigation();
  const currentTheme = themes.dark;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  async function registerUser() {
    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: username.trim(),
          email: email.trim(),
          password: password
        })
      });

      const result = await response.json();

      console.log("Register response:", result);

      if (response.ok) {
        setShowConfirmModal(true);
        Alert.alert("Success", "Verification code sent to your email.");
      } else {
        Alert.alert("Register Failed", result.error || "Something went wrong");
      }

    } catch (error) {
      console.log("Register error:", error);
      Alert.alert("Error", "Could not register user");
    }
  }

  async function confirmUser() {
    try {
      const response = await fetch("http://localhost:4000/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username.trim(),
          code: verificationCode.trim()
        })
      });

      const result = await response.json();

      console.log("Confirm response:", result);

      if (response.ok) {
        
        setShowConfirmModal(false);
        setVerificationCode('');
        navigation.navigate("HomePage");
      } else {
        Alert.alert("Verification Failed", result.error || "Invalid verification code");
      }

    } catch (error) {
      console.log("Confirm error:", error);
      Alert.alert("Error", "Could not verify code");
    }
  }

  async function resendCode() {
    try {
      const response = await fetch("http://localhost:4000/resend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username.trim()
        })
      });

      const result = await response.json();

      console.log("Resend code response:", result);

      if (response.ok) {
        Alert.alert("Success", "A new verification code was sent to your email.");
      } else {
        Alert.alert("Resend Failed", result.error || "Could not resend code");
      }

    } catch (error) {
      console.log("Resend code error:", error);
      Alert.alert("Error", "Could not resend verification code");
    }
  }

  function handleRegisterPress() {
    if (username.trim() === '') {
      Alert.alert("Username is empty!");
      return;
    }

    if (username.includes("@")) {
      Alert.alert("Username should not be an email");
      return;
    }

    if (username.includes(" ")) {
      Alert.alert("Username should not have spaces");
      return;
    }

    if (email.trim() === '') {
      Alert.alert("Email is empty!");
      return;
    }

    if (password.trim() === '') {
      Alert.alert("Password is empty!");
      return;
    }

    if (confirmPassword.trim() === '') {
      Alert.alert("Confirm Password is empty!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match!");
      return;
    }

    registerUser();
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.background }
      ]}
    >
      <View style={styles.animationWrapper}>
        <LottieView
          source={{
            uri: 'https://lottie.host/addac654-a514-4a69-8884-5bc48e567f9d/mgbCcDF28h.lottie',
          }}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Username"
          placeholderTextColor={currentTheme.subtext}
          value={username}
          onChangeText={setUsername}
          style={[
            styles.input,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.cardBorder,
              color: currentTheme.text,
            },
          ]}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor={currentTheme.subtext}
          value={email}
          onChangeText={setEmail}
          style={[
            styles.input,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.cardBorder,
              color: currentTheme.text,
            },
          ]}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={currentTheme.subtext}
          value={password}
          onChangeText={setPassword}
          style={[
            styles.input,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.cardBorder,
              color: currentTheme.text,
            },
          ]}
          secureTextEntry={true}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor={currentTheme.subtext}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[
            styles.input,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.cardBorder,
              color: currentTheme.text,
            },
          ]}
          secureTextEntry={true}
          autoCapitalize="none"
        />
      </View>

      <Pressable
        style={[
          styles.registerButton,
          {
            backgroundColor: currentTheme.activeButton,
            borderColor: currentTheme.activeBorder,
          },
        ]}
        onPress={handleRegisterPress}
      >
        <Text style={[styles.registerButtonText, { color: currentTheme.text }]}>
          Register
        </Text>
      </Pressable>

      <View style={styles.loginRouteViewStyle}>
        <Text style={[styles.loginRouteTextStyle, { color: currentTheme.subtext }]}>
          Already have an account?
        </Text>

        <Pressable onPress={() => navigation.navigate('LoginPage')}>
          <Text style={[styles.loginLinkText, { color: currentTheme.secondary }]}>
            {' '}Login
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowConfirmModal(false);
          setVerificationCode('');
        }}
      >
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.cardBorder,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Enter Verification Code
            </Text>

            <Text style={[styles.modalSubtitle, { color: currentTheme.subtext }]}>
              Check your email and enter the code here
            </Text>

            <TextInput
              placeholder="Verification Code"
              placeholderTextColor={currentTheme.subtext}
              value={verificationCode}
              onChangeText={setVerificationCode}
              style={[
                styles.modalInput,
                {
                  backgroundColor: currentTheme.resultBackground,
                  borderColor: currentTheme.cardBorder,
                  color: currentTheme.text,
                },
              ]}
              keyboardType="number-pad"
            />

            <View style={styles.modalButtonRow}>
              <Pressable
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: currentTheme.mutedButton,
                    borderColor: currentTheme.mutedBorder,
                  },
                ]}
                onPress={() => {
                  setShowConfirmModal(false);
                  setVerificationCode('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: currentTheme.text }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.confirmButton,
                  {
                    backgroundColor: currentTheme.activeButton,
                    borderColor: currentTheme.activeBorder,
                  },
                ]}
                onPress={() => {
                  if (verificationCode.trim() === '') {
                    Alert.alert("Verification code is empty!");
                    return;
                  }

                  if (username.trim() === '') {
                    Alert.alert("Missing username. Please register again.");
                    return;
                  }

                  confirmUser();
                }}
              >
                <Text style={[styles.confirmButtonText, { color: currentTheme.text }]}>
                  Confirm
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.resendButton}
              onPress={() => {
                if (username.trim() === '') {
                  Alert.alert("Missing username. Please register again.");
                  return;
                }

                resendCode();
              }}
            >
              <Text style={[styles.resendButtonText, { color: currentTheme.secondary }]}>
                Resend Code
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  animationWrapper: {
    width: 220,
    height: 220,
    marginBottom: 10,
  },

  animation: {
    width: '100%',
    height: '100%',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 1,
  },

  inputContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 15,
    marginBottom: 20,
  },

  input: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
  },

  registerButton: {
    height: 50,
    width: 160,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },

  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  loginRouteViewStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginRouteTextStyle: {
    fontSize: 16,
  },

  loginLinkText: {
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },

  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
  },

  modalInput: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  resendButton: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resendButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});