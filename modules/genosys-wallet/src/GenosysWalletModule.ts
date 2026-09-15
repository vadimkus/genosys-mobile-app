import { NativeModule, requireOptionalNativeModule } from 'expo';
import type { AddPassResult } from './GenosysWallet.types';

declare class GenosysWalletNativeModule extends NativeModule {
  addPassAsync(passBase64: string): Promise<AddPassResult>;
}

const nativeModule =
  requireOptionalNativeModule<GenosysWalletNativeModule>('GenosysWallet');

export default {
  isAvailable: Boolean(nativeModule),
  async addPassAsync(passBase64: string): Promise<AddPassResult> {
    if (!nativeModule) return { status: 'unavailable' };
    return nativeModule.addPassAsync(passBase64);
  },
};
