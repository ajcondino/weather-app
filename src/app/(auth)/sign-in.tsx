import { SkyBackground } from '#/components/SkyBackground';
import { authStyles } from '#/styles/authStyles';
import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignIn() {
    const { error } = await signIn.password({
      emailAddress: email,
      password: password,
    });

    if (error) {
      Alert.alert(t('auth.signIn.signInFailedTitle'), t('auth.signIn.signInFailedMessage'));
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
            <Text style={authStyles.title}>{t('auth.signIn.title')}</Text>
            <Text style={authStyles.subtitle}>{t('auth.signIn.subtitle')}</Text>
          </View>

          {/* Form */}
          <View style={authStyles.form}>
            <View style={authStyles.inputWrapper}>
              <Text style={authStyles.inputLabel}>{t('auth.signIn.emailLabel')}</Text>
              <TextInput
                style={authStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.signIn.emailPlaceholder')}
                placeholderTextColor="rgba(255,255,255,0.3)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>

            <View style={authStyles.inputWrapper}>
              <Text style={authStyles.inputLabel}>{t('auth.signIn.passwordLabel')}</Text>
              <TextInput
                style={authStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth.signIn.passwordPlaceholder')}
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
                <Text style={authStyles.buttonText}>{t('auth.signIn.submitButton')}</Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>{t('auth.signIn.footerText')}</Text>
            <Link href="/sign-up" asChild>
              <Pressable>
                <Text style={authStyles.footerLink}>{t('auth.signIn.footerLink')}</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
