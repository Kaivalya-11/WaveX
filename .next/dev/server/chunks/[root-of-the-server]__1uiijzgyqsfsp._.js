module.exports = [
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/app/api/stream/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "HEAD",
    ()=>HEAD,
    "OPTIONS",
    ()=>OPTIONS,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ytdlp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ytdlp.ts [app-route] (ecmascript)");
;
const runtime = 'nodejs';
const dynamic = 'force-dynamic';
async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
            'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
            'Access-Control-Max-Age': '86400'
        }
    });
}
async function HEAD(req) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');
    if (!videoId) {
        return new Response(null, {
            status: 400
        });
    }
    try {
        const audioUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ytdlp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStreamUrl"])(videoId);
        const upstreamResp = await fetch(audioUrl, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': '*/*'
            },
            redirect: 'follow'
        });
        const headers = new Headers();
        const contentType = upstreamResp.headers.get('content-type') || 'audio/mp4';
        const contentLength = upstreamResp.headers.get('content-length');
        headers.set('Content-Type', contentType);
        headers.set('Accept-Ranges', 'bytes');
        if (contentLength) headers.set('Content-Length', contentLength);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
        return new Response(null, {
            status: upstreamResp.status === 200 ? 200 : upstreamResp.status,
            headers
        });
    } catch  {
        return new Response(null, {
            status: 500
        });
    }
}
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');
    if (!videoId) {
        return new Response(JSON.stringify({
            error: 'Missing videoId'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
    try {
        let audioUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ytdlp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStreamUrl"])(videoId);
        const clientRange = req.headers.get('range');
        const upstreamHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Encoding': 'identity'
        };
        if (clientRange) {
            upstreamHeaders['Range'] = clientRange;
        }
        let upstreamResp = await fetch(audioUrl, {
            headers: upstreamHeaders,
            redirect: 'follow'
        });
        // Handle upstream 403 (expired signed URL): invalidate cache and retry once
        if (upstreamResp.status === 403) {
            console.warn(`[Stream] 403 from upstream for ${videoId}, invalidating cache and retrying...`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ytdlp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateStreamUrl"])(videoId);
            audioUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ytdlp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStreamUrl"])(videoId);
            upstreamResp = await fetch(audioUrl, {
                headers: upstreamHeaders,
                redirect: 'follow'
            });
        }
        if (!upstreamResp.ok) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ytdlp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateStreamUrl"])(videoId);
            const isNotFound = upstreamResp.status === 404;
            return new Response(JSON.stringify({
                error: isNotFound ? 'Track source not found' : 'Upstream stream error',
                status: upstreamResp.status
            }), {
                status: isNotFound ? 404 : 502,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        const rawContentType = upstreamResp.headers.get('content-type') || 'audio/mp4';
        if (rawContentType.includes('text') || rawContentType.includes('html')) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ytdlp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateStreamUrl"])(videoId);
            return new Response(JSON.stringify({
                error: 'Invalid upstream media content type',
                contentType: rawContentType
            }), {
                status: 502,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        const contentType = rawContentType.startsWith('audio/') || rawContentType.startsWith('video/') ? rawContentType : 'audio/mp4';
        const responseHeaders = new Headers();
        responseHeaders.set('Content-Type', contentType);
        responseHeaders.set('Accept-Ranges', 'bytes');
        responseHeaders.set('Cache-Control', 'public, max-age=3600');
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
        responseHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
        const contentLength = upstreamResp.headers.get('content-length');
        if (contentLength) {
            responseHeaders.set('Content-Length', contentLength);
        }
        const contentRange = upstreamResp.headers.get('content-range');
        if (contentRange) {
            responseHeaders.set('Content-Range', contentRange);
        }
        // Stream upstream body directly to the client without in-memory buffering
        return new Response(upstreamResp.body, {
            status: upstreamResp.status,
            headers: responseHeaders
        });
    } catch (err) {
        const errMsg = err?.message || 'Stream extraction error';
        console.warn('[API Stream Error]:', errMsg);
        // Fallback: If local extraction encountered an error, try forwarding to the active WaveX backend server on port 5000
        try {
            const clientRange = req.headers.get('range');
            const backendUrl = `http://localhost:5000/api/stream?videoId=${encodeURIComponent(videoId)}`;
            const fwdHeaders = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': '*/*'
            };
            if (clientRange) fwdHeaders['Range'] = clientRange;
            const fwdResp = await fetch(backendUrl, {
                headers: fwdHeaders,
                signal: AbortSignal.timeout(5000)
            });
            if (fwdResp.ok) {
                const respHeaders = new Headers();
                const ct = fwdResp.headers.get('content-type') || 'audio/mp4';
                respHeaders.set('Content-Type', ct);
                respHeaders.set('Accept-Ranges', 'bytes');
                respHeaders.set('Cache-Control', 'public, max-age=3600');
                respHeaders.set('Access-Control-Allow-Origin', '*');
                respHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
                respHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
                respHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
                const cl = fwdResp.headers.get('content-length');
                if (cl) respHeaders.set('Content-Length', cl);
                const cr = fwdResp.headers.get('content-range');
                if (cr) respHeaders.set('Content-Range', cr);
                return new Response(fwdResp.body, {
                    status: fwdResp.status,
                    headers: respHeaders
                });
            }
        } catch  {
        // Port 5000 backend not reachable, proceed to error response
        }
        const isUnavailable = errMsg.includes('TRACK_UNAVAILABLE') || errMsg.includes('unavailable');
        const statusCode = isUnavailable ? 404 : 502;
        return new Response(JSON.stringify({
            error: isUnavailable ? 'Track unavailable' : 'Stream extraction failed',
            message: errMsg
        }), {
            status: statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
}),
"[project]/src/lib/ytdlp.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearStreamUrlCache",
    ()=>clearStreamUrlCache,
    "getStreamUrl",
    ()=>getStreamUrl,
    "invalidateStreamUrl",
    ()=>invalidateStreamUrl,
    "resolveYtDlp",
    ()=>resolveYtDlp
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
const globalWithCache = /*TURBOPACK member replacement*/ __turbopack_context__.g;
if (!globalWithCache._streamUrlCache) {
    globalWithCache._streamUrlCache = new Map();
}
const streamUrlCache = globalWithCache._streamUrlCache;
function invalidateStreamUrl(videoId) {
    streamUrlCache.delete(videoId);
}
function clearStreamUrlCache() {
    streamUrlCache.clear();
}
// Clear any stale cached URLs on module reload
clearStreamUrlCache();
function resolveYtDlp() {
    const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\Kaivalya\\AppData\\Local';
    const appData = process.env.APPDATA || 'C:\\Users\\Kaivalya\\AppData\\Roaming';
    const userProfile = process.env.USERPROFILE || 'C:\\Users\\Kaivalya';
    // 1. Direct path from environment
    if (process.env.YTDLP_PATH) {
        const p = process.env.YTDLP_PATH.replace(/^["']|["']$/g, '').trim();
        if (p && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(p)) {
            return {
                executable: p,
                prefixArgs: []
            };
        }
    }
    // 2. Common Windows python script locations for yt-dlp.exe
    const candidateExecutables = [
        'C:\\Users\\Kaivalya\\AppData\\Local\\Python\\pythoncore-3.14-64\\Scripts\\yt-dlp.exe',
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(localAppData, 'Python', 'pythoncore-3.14-64', 'Scripts', 'yt-dlp.exe'),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(localAppData, 'Programs', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(localAppData, 'Programs', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(localAppData, 'Programs', 'Python', 'Python310', 'Scripts', 'yt-dlp.exe'),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(appData, 'Python', 'Scripts', 'yt-dlp.exe'),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(userProfile, 'AppData', 'Roaming', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(userProfile, 'AppData', 'Roaming', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(userProfile, 'AppData', 'Roaming', 'Python', 'Python310', 'Scripts', 'yt-dlp.exe'),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(localAppData, 'Microsoft', 'WindowsApps', 'yt-dlp.exe')
    ];
    for (const candidate of candidateExecutables){
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(candidate)) {
                return {
                    executable: candidate,
                    prefixArgs: []
                };
            }
        } catch  {
        // ignore permission error during existence check and proceed
        }
    }
    // 3. Fallback: run via Python module if python.exe exists
    const pythonBin = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(localAppData, 'Python', 'bin', 'python.exe');
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(pythonBin)) {
            return {
                executable: pythonBin,
                prefixArgs: [
                    '-m',
                    'yt_dlp'
                ]
            };
        }
    } catch  {
    // ignore
    }
    // 4. Default to standard command in system PATH or configured env path
    const fallbackPath = process.env.YTDLP_PATH?.replace(/^["']|["']$/g, '').trim() || 'yt-dlp';
    return {
        executable: fallbackPath,
        prefixArgs: []
    };
}
function executeYtDlp(executable, args) {
    return new Promise((resolve, reject)=>{
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execFile"])(executable, args, {
            timeout: 25000
        }, (err, stdout, stderr)=>{
            if (err) {
                const errorText = (stderr || err.message || '').trim();
                return reject(new Error(errorText));
            }
            const lines = stdout.split(/\r?\n/).map((l)=>l.trim()).filter(Boolean);
            const url = lines.find((l)=>l.startsWith('http'));
            if (!url) {
                return reject(new Error('Invalid URL in yt-dlp output: ' + stdout.substring(0, 100)));
            }
            resolve(url);
        });
    });
}
async function getStreamUrl(videoId) {
    if (!videoId || typeof videoId !== 'string') {
        throw new Error('TRACK_UNAVAILABLE: Empty or invalid track ID');
    }
    const cached = streamUrlCache.get(videoId);
    if (cached && cached.expires > Date.now()) {
        return cached.url;
    }
    const { executable, prefixArgs } = resolveYtDlp();
    const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
    // Priority 1: Android client + pure audio formats (AAC itag 140 or Opus itag 251)
    // The Android client bypasses web PO token challenges and returns direct playable audio streams
    const tier1Args = [
        ...prefixArgs,
        '--extractor-args',
        'youtube:player_client=android,web',
        '--format',
        'ba[ext=m4a]/ba[ext=webm]/ba/b[acodec!=none]',
        '--get-url',
        '--no-playlist',
        '--no-warnings',
        '--quiet',
        ytUrl
    ];
    try {
        const url = await executeYtDlp(executable, tier1Args);
        streamUrlCache.set(videoId, {
            url,
            expires: Date.now() + 90 * 60 * 1000
        });
        return url;
    } catch (err) {
        const msg = err?.message || '';
        if (msg.includes('This video is unavailable') || msg.includes('Private video') || msg.includes('Video unavailable')) {
            throw new Error(`TRACK_UNAVAILABLE: Video ${videoId} is unavailable on YouTube`);
        }
        // Priority 2: Standard client with --js-runtimes node, strictly enforcing audio codec
        const tier2Args = [
            ...prefixArgs,
            '--js-runtimes',
            'node',
            '--format',
            'ba[ext=m4a]/ba[ext=webm]/ba/b[acodec!=none]',
            '--get-url',
            '--no-playlist',
            '--no-warnings',
            '--quiet',
            ytUrl
        ];
        try {
            const url = await executeYtDlp(executable, tier2Args);
            streamUrlCache.set(videoId, {
                url,
                expires: Date.now() + 90 * 60 * 1000
            });
            return url;
        } catch (err2) {
            // Priority 3: Fallback without special flags, strictly requiring non-empty audio codec
            const tier3Args = [
                ...prefixArgs,
                '-f',
                'bestaudio[acodec!=none]/best[acodec!=none]',
                '--get-url',
                '--no-playlist',
                '--no-warnings',
                '--quiet',
                ytUrl
            ];
            const url = await executeYtDlp(executable, tier3Args);
            streamUrlCache.set(videoId, {
                url,
                expires: Date.now() + 90 * 60 * 1000
            });
            return url;
        }
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1uiijzgyqsfsp._.js.map