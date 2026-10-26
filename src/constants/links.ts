import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

/** Replace placeholders before App Store submit */
export const LINKS = {
  privacy:
    (extra.privacyPolicyUrl as string) ||
    'https://zhangkaiwu222.github.io/shared-ledger/privacy/',
  support:
    (extra.supportUrl as string) ||
    'https://zhangkaiwu222.github.io/shared-ledger/support/',
  /** Apple Standard EULA — acceptable for simple subscription apps */
  terms:
    (extra.termsUrl as string) ||
    'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
};

export const IAP_PRODUCT_IDS = {
  monthly: 'com.sharedledger.app.pro.monthly',
  yearly: 'com.sharedledger.app.pro.yearly',
} as const;
