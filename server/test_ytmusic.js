const YTMusic = require("ytmusic-api").default;

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();

  const songs = await ytmusic.searchSongs("Never gonna give you up");
  console.log(songs.length, songs[0]);
}

test();
