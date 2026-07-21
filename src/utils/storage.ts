import i18n from '#/i18n';
import { useToastStore } from '#/store/toastStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    useToastStore.getState().show(i18n.t('errors.loadFailed'));
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    useToastStore.getState().show(i18n.t('errors.persistFailed'));
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    useToastStore.getState().show(i18n.t('errors.persistFailed'));
  }
}
