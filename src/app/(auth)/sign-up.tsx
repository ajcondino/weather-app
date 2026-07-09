import { SkyBackground } from '#/components/SkyBackground';
import { authStyles } from '#/styles/authStyles';
import { useAuth, useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  async function handleSubmit() {
    const { error } = await signUp.password({
      emailAddress: email.trim(),
      password,
    });

    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }

    await signUp.verifications.sendEmailCode();
  }

  async function handleVerify() {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return;
          router.replace('/');
        },
      });
    }
  }

  if (signUp.status === 'complete' || isSignedIn) return null;

  // Email Verification
  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <KeyboardAvoidingView
        style={authStyles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={authStyles.container}>
            <SkyBackground isDay={false} />
            <View style={authStyles.header}>
              <Text style={authStyles.title}>Check your email</Text>
              <Text style={authStyles.subtitle}>Enter your verification code to continue.</Text>
            </View>

            <View style={authStyles.form}>
              <View style={authStyles.inputWrapper}>
                <Text style={authStyles.inputLabel}>Verification code</Text>
                <TextInput
                  style={authStyles.input}
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter code"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                />
                {errors.fields.code && (
                  <Text style={authStyles.errorText}>{errors.fields.code.longMessage}</Text>
                )}
              </View>

              <Pressable
                style={[authStyles.button, fetchStatus === 'fetching' && authStyles.buttonDisabled]}
                onPress={handleVerify}
                disabled={fetchStatus === 'fetching'}
              >
                {fetchStatus === 'fetching' ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={authStyles.buttonText}>Verify email</Text>
                )}
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => signUp.verifications.sendEmailCode()}
              >
                <Text style={styles.secondaryButtonText}>Resend code</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  // Sign up form
  return (
    <KeyboardAvoidingView
      style={authStyles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={authStyles.container}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <SkyBackground isDay={false} />
        <View style={authStyles.header}>
          <Text style={authStyles.title}>Create account</Text>
          <Text style={authStyles.subtitle}>Sign up to get started</Text>
        </View>

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
            {errors.fields.emailAddress && (
              <Text style={authStyles.errorText}>{errors.fields.emailAddress.longMessage}</Text>
            )}
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
              textContentType="newPassword"
            />
            {errors.fields.password && (
              <Text style={authStyles.errorText}>{errors.fields.password.message}</Text>
            )}
          </View>

          <Pressable
            style={[
              authStyles.button,
              (!email || !password || fetchStatus === 'fetching') && authStyles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!email || !password || fetchStatus === 'fetching'}
          >
            {fetchStatus === 'fetching' ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={authStyles.buttonText}>Create account</Text>
            )}
          </Pressable>
        </View>

        <View style={authStyles.footer}>
          <Text style={authStyles.footerText}>Already have an account? </Text>
          <Link href="/sign-in" asChild>
            <Pressable>
              <Text style={authStyles.footerLink}>Sign in</Text>
            </Pressable>
          </Link>
        </View>

        {/* Required — Clerk bot protection */}
        <View nativeID="clerk-captcha" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
});
