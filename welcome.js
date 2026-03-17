import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeSplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('LoginPage');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation]);

  function goToLogin() {
    navigation.navigate("LoginPage");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.content}>
        <View style={styles.animationWrapper}>
          <LottieView
            source={{
              uri: 'https://lottie.host/29f23007-0b4c-4497-8cce-8931e18cf71e/FhziKQcUG6.lottie',
            }}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        <Text style={styles.title}>Welcome</Text>

        <Text style={styles.subtitle}>
          Get ready to start your journey
        </Text>

        <Pressable style={styles.button} onPress={goToLogin}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  content: {
    alignItems: 'center',
    width: '100%',
  },

  animationWrapper: {
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 12,
  },

  animation: {
    width: 180,
    height: 180,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
    marginBottom: 40,
  },

  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});