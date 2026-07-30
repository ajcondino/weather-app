import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

export function formatVersionLabel(
  version: string | undefined,
  channel: string | null,
  isEmbeddedLaunch: boolean,
  updateId: string | null,
): string {
  const v = version ?? 'unknown';
  const ch = channel ?? 'dev';
  const update = isEmbeddedLaunch ? 'embedded' : (updateId?.slice(0, 8) ?? 'unknown');
  return `v${v} · ${ch} · ${update}`;
}

export const versionLabel = formatVersionLabel(
  Constants.expoConfig?.version,
  Updates.channel,
  Updates.isEmbeddedLaunch,
  Updates.updateId,
);
