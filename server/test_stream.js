// Test multiple video IDs with the innertube player API
const { request } = require('undici');

const testVideos = [
  { name: 'Kesariya (Indian song)', id: 'NJAv_7lHUIU' },
  { name: 'Gangnam Style', id: 'kffacxfA7G4' },
  { name: 'Shape of You', id: 'JGwWNGJdvx8' },
];

async function testVideo(name, videoId) {
  const embedResp = await request('https://www.youtube.com/embed/' + videoId, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  const cookies = embedResp.headers['set-cookie'];
  const html = await embedResp.body.text();
  const vidMatch = html.match(/"VISITOR_DATA":"([^"]+)"/);
  const visitorId = vidMatch ? vidMatch[1] : '';
  const cookieStr = Array.isArray(cookies) 
    ? cookies.map(c => c.split(';')[0]).join('; ')
    : (cookies || '').split(';')[0];
  
  const playerResp = await request('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'X-YouTube-Client-Name': '56',
      'X-YouTube-Client-Version': '1.20231213.01.00',
      'X-Goog-Visitor-Id': visitorId,
      'Origin': 'https://www.youtube.com',
      'Referer': 'https://www.youtube.com/embed/' + videoId,
      'Cookie': cookieStr,
    },
    body: JSON.stringify({
      videoId,
      context: {
        client: {
          clientName: 'WEB_EMBEDDED_PLAYER',
          clientVersion: '1.20231213.01.00',
          hl: 'en', gl: 'US',
          visitorData: visitorId,
        },
        thirdParty: { embedUrl: 'https://www.youtube.com/embed/' + videoId }
      }
    })
  });
  const data = await playerResp.body.json();
  const fmts = data.streamingData?.adaptiveFormats || [];
  const audio = fmts.find(f => f.mimeType?.startsWith('audio/mp4'));
  
  return {
    name,
    videoId,
    play: data.playabilityStatus?.status,
    reason: data.playabilityStatus?.reason,
    fmtCount: fmts.length,
    hasAudio: !!audio,
    audioUrl: !!audio?.url,
    audioCipher: !!audio?.signatureCipher,
    mimeType: audio?.mimeType,
  };
}

async function main() {
  for (const v of testVideos) {
    try {
      const result = await testVideo(v.name, v.id);
      console.log(JSON.stringify(result, null, 2));
    } catch(e) {
      console.error('Error for', v.name, ':', e.message.substring(0, 100));
    }
  }
}

main();
