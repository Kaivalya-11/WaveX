import YTMusic from 'ytmusic-api';

const globalWithYTMusic = global as typeof globalThis & {
  _ytmusic?: YTMusic;
  _ytmusicInit?: Promise<unknown>;
};

export async function getYTMusic(): Promise<YTMusic> {
  if (!globalWithYTMusic._ytmusic) {
    const ytmusic = new YTMusic();
    globalWithYTMusic._ytmusic = ytmusic;
    globalWithYTMusic._ytmusicInit = ytmusic.initialize().catch(err => {
      console.error('[YTMusic] Init error:', err);
    });
  }
  if (globalWithYTMusic._ytmusicInit) {
    await globalWithYTMusic._ytmusicInit;
  }
  return globalWithYTMusic._ytmusic!;
}

