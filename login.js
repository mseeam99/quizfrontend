import { StatusBar } from 'expo-status-bar';

import {
  Alert,
  Pressable,
  TextInput,
  StyleSheet,
  Text,
  View,
  Modal,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {themes} from './themes'

export default function LoginPage() {
  const navigation = useNavigation();
  const currentTheme = themes.dark;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCodeSent, setResetCodeSent] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  async function loginUser() {
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const result = await response.json();

      console.log('Login response:', result);

      if (response.ok) {

        navigation.navigate('HomePage');
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Error', 'Could not login');
    }
  }

  async function sendResetCode() {
    try {
      const response = await fetch('http://localhost:4000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetEmail.trim(),
        }),
      });

      const result = await response.json();

      console.log('Forgot password response:', result);

      if (response.ok) {
        setResetCodeSent(true);
        Alert.alert('Success', 'Reset code sent to your email');
      } else {
        Alert.alert('Reset Failed', result.error || 'Could not send reset code');
      }
    } catch (error) {
      console.log('Forgot password error:', error);
      Alert.alert('Error', 'Could not send reset code');
    }
  }

  async function confirmResetPassword() {
    try {
      const response = await fetch(
        'http://localhost:4000/confirm-forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: resetEmail.trim(),
            code: resetCode.trim(),
            newPassword: newPassword,
          }),
        }
      );

      const result = await response.json();

      console.log('Confirm forgot password response:', result);

      if (response.ok) {
        Alert.alert('Success', 'Password reset successfully');

        setShowResetModal(false);
        setResetCodeSent(false);
        setResetEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        Alert.alert('Reset Failed', result.error || 'Could not reset password');
      }
    } catch (error) {
      console.log('Confirm forgot password error:', error);
      Alert.alert('Error', 'Could not reset password');
    }
  }

  function handleLoginPress() {
    if (email.trim() === '') {
      Alert.alert('Email is empty!');
      return;
    }

    if (password.trim() === '') {
      Alert.alert('Password is empty!');
      return;
    }

    loginUser();
  }

  function handleSendResetCode() {
    if (resetEmail.trim() === '') {
      Alert.alert('Email is empty!');
      return;
    }

    sendResetCode();
  }

  function handleConfirmResetPassword() {
    if (resetEmail.trim() === '') {
      Alert.alert('Email is empty!');
      return;
    }

    if (resetCode.trim() === '') {
      Alert.alert('Reset code is empty!');
      return;
    }

    if (newPassword.trim() === '') {
      Alert.alert('New password is empty!');
      return;
    }

    if (confirmNewPassword.trim() === '') {
      Alert.alert('Confirm new password is empty!');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Passwords do not match!');
      return;
    }

    confirmResetPassword();
  }

  function closeResetModal() {
    setShowResetModal(false);
    setResetCodeSent(false);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentTheme.background,
        },
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
      </View>

      <View style={styles.forgotPasswordContainer}>
        <Pressable
          onPress={() => {
            setResetEmail(email);
            setShowResetModal(true);
          }}
        >
          <Text
            style={[
              styles.forgotPasswordText,
              { color: currentTheme.secondary },
            ]}
          >
            Forgot password? Reset
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={[
          styles.loginButton,
          {
            backgroundColor: currentTheme.activeButton,
            borderColor: currentTheme.activeBorder,
          },
        ]}
        onPress={handleLoginPress}
      >
        <Text style={[styles.loginButtonText, { color: currentTheme.text }]}>
          Login
        </Text>
      </Pressable>

      <View style={styles.registerRouteViewStyle}>
        <Text
          style={[
            styles.registerRouteTextStyle,
            { color: currentTheme.subtext },
          ]}
        >
          Don't have an account?
        </Text>

        <Pressable onPress={() => navigation.navigate('RegisterPage')}>
          <Text
            style={[
              styles.registerLinkText,
              { color: currentTheme.secondary },
            ]}
          >
            {' '}
            Register
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeResetModal}
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
              Reset Password
            </Text>

            {!resetCodeSent ? (
              <>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: currentTheme.subtext },
                  ]}
                >
                  Enter your email to receive a reset code
                </Text>

                <TextInput
                  placeholder="Email"
                  placeholderTextColor={currentTheme.subtext}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: currentTheme.resultBackground,
                      borderColor: currentTheme.cardBorder,
                      color: currentTheme.text,
                    },
                  ]}
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                    onPress={closeResetModal}
                  >
                    <Text
                      style={[
                        styles.cancelButtonText,
                        { color: currentTheme.text },
                      ]}
                    >
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
                    onPress={handleSendResetCode}
                  >
                    <Text
                      style={[
                        styles.confirmButtonText,
                        { color: currentTheme.text },
                      ]}
                    >
                      Send Code
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: currentTheme.subtext },
                  ]}
                >
                  Enter the code from your email and your new password
                </Text>

                <TextInput
                  placeholder="Email"
                  placeholderTextColor={currentTheme.subtext}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: currentTheme.resultBackground,
                      borderColor: currentTheme.cardBorder,
                      color: currentTheme.text,
                    },
                  ]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  placeholder="Reset Code"
                  placeholderTextColor={currentTheme.subtext}
                  value={resetCode}
                  onChangeText={setResetCode}
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

                <TextInput
                  placeholder="New Password"
                  placeholderTextColor={currentTheme.subtext}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: currentTheme.resultBackground,
                      borderColor: currentTheme.cardBorder,
                      color: currentTheme.text,
                    },
                  ]}
                  secureTextEntry={true}
                  autoCapitalize="none"
                />

                <TextInput
                  placeholder="Confirm New Password"
                  placeholderTextColor={currentTheme.subtext}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: currentTheme.resultBackground,
                      borderColor: currentTheme.cardBorder,
                      color: currentTheme.text,
                    },
                  ]}
                  secureTextEntry={true}
                  autoCapitalize="none"
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
                    onPress={closeResetModal}
                  >
                    <Text
                      style={[
                        styles.cancelButtonText,
                        { color: currentTheme.text },
                      ]}
                    >
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
                    onPress={handleConfirmResetPassword}
                  >
                    <Text
                      style={[
                        styles.confirmButtonText,
                        { color: currentTheme.text },
                      ]}
                    >
                      Reset
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  style={styles.resendButton}
                  onPress={handleSendResetCode}
                >
                  <Text
                    style={[
                      styles.resendButtonText,
                      { color: currentTheme.secondary },
                    ]}
                  >
                    Resend Code
                  </Text>
                </Pressable>
              </>
            )}
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
    width: 250,
    height: 250,
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
    marginBottom: 10,
  },

  input: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
  },

  forgotPasswordContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'flex-end',
    marginBottom: 20,
  },

  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  loginButton: {
    height: 52,
    width: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },

  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  registerRouteViewStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  registerRouteTextStyle: {
    fontSize: 16,
  },

  registerLinkText: {
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
    lineHeight: 20,
  },

  modalInput: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
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