import type { AddPassResult } from './GenosysWallet.types';

export default {
  isAvailable: false,
  async addPassAsync(): Promise<AddPassResult> {
    return { status: 'unavailable' };
  },
};
