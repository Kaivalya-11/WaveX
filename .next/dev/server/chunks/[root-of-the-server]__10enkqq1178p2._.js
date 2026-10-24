module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

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
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

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
    "dynamic",
    ()=>dynamic,
    "maxDuration",
    ()=>maxDuration,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const runtime = 'nodejs';
const dynamic = 'force-dynamic';
const maxDuration = 120;
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const REQUEST_TIMEOUT_MS = 120_000;
const FORWARDED_RESPONSE_HEADERS = [
    'content-type',
    'content-length',
    'content-range',
    'accept-ranges',
    'etag',
    'last-modified'
];
function getBackendUrl() {
    const value = process.env.BACKEND_URL?.trim();
    if (!value) {
        return null;
    }
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
            return null;
        }
        return url;
    } catch  {
        return null;
    }
}
function jsonError(message, status) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: message
    }, {
        status,
        headers: {
            'Cache-Control': 'no-store'
        }
    });
}
async function proxyStream(request, method) {
    const backendUrl = getBackendUrl();
    if (!backendUrl) {
        console.error('[WaveX Stream Proxy] BACKEND_URL is missing or invalid.');
        return jsonError('Streaming backend is not configured.', 500);
    }
    const videoId = request.nextUrl.searchParams.get('videoId');
    if (!videoId || !VIDEO_ID_REGEX.test(videoId)) {
        return jsonError('A valid videoId is required.', 400);
    }
    const target = new URL('/api/stream', backendUrl);
    target.searchParams.set('videoId', videoId);
    const requestHeaders = new Headers();
    // Forward byte-range requests so seeking works in the audio player.
    const range = request.headers.get('range');
    if (range) {
        requestHeaders.set('Range', range);
    }
    const ifRange = request.headers.get('if-range');
    if (ifRange) {
        requestHeaders.set('If-Range', ifRange);
    }
    let upstream;
    try {
        upstream = await fetch(target, {
            method,
            headers: requestHeaders,
            cache: 'no-store',
            redirect: 'error',
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });
    } catch (error) {
        console.error('[WaveX Stream Proxy] Could not reach Render:', error instanceof Error ? error.message : String(error));
        return jsonError('Unable to reach the streaming backend.', 502);
    }
    // Preserve upstream errors instead of returning a false successful audio response.
    if (!upstream.ok) {
        const upstreamStatus = upstream.status;
        // A 416 response can include Content-Range: bytes */length.
        const errorHeaders = new Headers({
            'Cache-Control': 'no-store'
        });
        const contentRange = upstream.headers.get('content-range');
        if (contentRange) {
            errorHeaders.set('Content-Range', contentRange);
        }
        // Do not expose the upstream error body, which may contain internal details.
        await upstream.body?.cancel().catch(()=>{});
        console.error(`[WaveX Stream Proxy] Render returned HTTP ${upstreamStatus} for ${videoId}.`);
        return new Response(null, {
            status: upstreamStatus,
            headers: errorHeaders
        });
    }
    const responseHeaders = new Headers();
    for (const header of FORWARDED_RESPONSE_HEADERS){
        const value = upstream.headers.get(header);
        if (value) {
            responseHeaders.set(header, value);
        }
    }
    // Never cache signed, temporary audio URLs through this proxy.
    responseHeaders.set('Cache-Control', 'private, no-store');
    // Do not force audio/mp4: the backend's Content-Type is authoritative.
    // Do not invent Content-Length or Content-Range when upstream omits them.
    return new Response(method === 'HEAD' ? null : upstream.body, {
        status: upstream.status,
        headers: responseHeaders
    });
}
async function GET(request) {
    return proxyStream(request, 'GET');
}
async function HEAD(request) {
    return proxyStream(request, 'HEAD');
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__10enkqq1178p2._.js.map