import { SkyBackground } from '#/components/SkyBackground';
import { authStyles } from '#/styles/authStyles';
import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignIn() {
    const { error } = await signIn.password({
      emailAddress: email,
      password: password,
    });

    if (error) {
      Alert.alert('Sign in failed', 'Incorrect email or password.');
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          router.replace('/');
        },
      });
    }
  }

  return (
    <KeyboardAvoidingView
      style={authStyles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={authStyles.container}>
          <SkyBackground isDay={false} />
          {/* Header */}
          <View style={authStyles.header}>
            <Text style={authStyles.title}>Howdy!</Text>
            <Text style={authStyles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={authStyles.form}>
            <View style={authStyles.inputWrapper}>
              <Text style={authStyles.inputLabel}>Email</Text>
              <TextInput
                style={authStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.3)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>

            <View style={authStyles.inputWrapper}>
              <Text style={authStyles.inputLabel}>Password</Text>
              <TextInput
                style={authStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry
                textContentType="password"
              />
            </View>

            <Pressable
              style={[
                authStyles.button,
                (!email || !password || fetchStatus === 'fetching') && authStyles.buttonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={!email || !password || fetchStatus === 'fetching'}
            >
              {fetchStatus === 'fetching' ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={authStyles.buttonText}>Sign in</Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>Don&apos;t have an account? </Text>
            <Link href="/sign-up" asChild>
              <Pressable>
                <Text style={authStyles.footerLink}>Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
