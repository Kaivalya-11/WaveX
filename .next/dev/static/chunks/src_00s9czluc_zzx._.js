(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/NotificationPortal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NotificationPortal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$NotificationContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/NotificationContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function NotificationPortal() {
    _s();
    const { notification, hidePrompt } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$NotificationContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotification"])();
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationPortal.useEffect": ()=>{
            if (notification.isOpen) {
                setIsVisible(true);
            } else {
                const timer = setTimeout({
                    "NotificationPortal.useEffect.timer": ()=>setIsVisible(false)
                }["NotificationPortal.useEffect.timer"], 300);
                return ({
                    "NotificationPortal.useEffect": ()=>clearTimeout(timer)
                })["NotificationPortal.useEffect"];
            }
        }
    }["NotificationPortal.useEffect"], [
        notification.isOpen
    ]);
    if (!isVisible && !notification.isOpen) return null;
    const getIcon = ()=>{
        switch(notification.type){
            case 'success':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    size: 32,
                    color: "#4ade80"
                }, void 0, false, {
                    fileName: "[project]/src/components/NotificationPortal.tsx",
                    lineNumber: 24,
                    columnNumber: 30
                }, this);
            case 'error':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    size: 32,
                    color: "#f87171"
                }, void 0, false, {
                    fileName: "[project]/src/components/NotificationPortal.tsx",
                    lineNumber: 25,
                    columnNumber: 28
                }, this);
            case 'warning':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                    size: 32,
                    color: "#fbbf24"
                }, void 0, false, {
                    fileName: "[project]/src/components/NotificationPortal.tsx",
                    lineNumber: 26,
                    columnNumber: 30
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                    size: 32,
                    color: "#60a5fa"
                }, void 0, false, {
                    fileName: "[project]/src/components/NotificationPortal.tsx",
                    lineNumber: 27,
                    columnNumber: 23
                }, this);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            opacity: notification.isOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
            padding: '24px'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                width: 'min(420px, 90%)',
                background: '#050B14',
                border: '1px solid #10283e',
                borderRadius: 24,
                padding: '32px 24px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                color: '#fff',
                transform: notification.isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'absolute',
                        top: -50,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 200,
                        height: 100,
                        background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 180, 216, 0.15)',
                        filter: 'blur(40px)',
                        borderRadius: '50%',
                        zIndex: 0
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/NotificationPortal.tsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'relative',
                        zIndex: 1
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'center'
                            },
                            children: getIcon()
                        }, void 0, false, {
                            fileName: "[project]/src/components/NotificationPortal.tsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 13,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: 2,
                                color: '#8d99ae',
                                marginBottom: 12
                            },
                            children: "Notification"
                        }, void 0, false, {
                            fileName: "[project]/src/components/NotificationPortal.tsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 18,
                                fontWeight: 700,
                                lineHeight: 1.5,
                                marginBottom: 32,
                                color: '#f1f5f9'
                            },
                            children: notification.message
                        }, void 0, false, {
                            fileName: "[project]/src/components/NotificationPortal.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: 12
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        if (notification.onConfirm) notification.onConfirm();
                                        hidePrompt();
                                    },
                                    style: {
                                        flex: 1,
                                        padding: '14px 20px',
                                        borderRadius: 16,
                                        border: 'none',
                                        background: notification.type === 'error' ? '#ef4444' : '#00b4d8',
                                        color: '#fff',
                                        fontWeight: 800,
                                        fontSize: 15,
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 20px rgba(0, 180, 216, 0.3)',
                                        transition: 'transform 0.1s, background 0.2s'
                                    },
                                    children: "OK"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/NotificationPortal.tsx",
                                    lineNumber: 86,
                                    columnNumber: 13
                                }, this),
                                notification.onConfirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: hidePrompt,
                                    style: {
                                        flex: 1,
                                        padding: '14px 20px',
                                        borderRadius: 16,
                                        border: '1px solid #10283e',
                                        background: 'transparent',
                                        color: '#8d99ae',
                                        fontWeight: 800,
                                        fontSize: 15,
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    },
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/NotificationPortal.tsx",
                                    lineNumber: 109,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/NotificationPortal.tsx",
                            lineNumber: 85,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/NotificationPortal.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: hidePrompt,
                    "aria-label": "Close notification",
                    style: {
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'none',
                        border: 'none',
                        color: '#4b5563',
                        cursor: 'pointer',
                        padding: 8,
                        transition: 'color 0.2s'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        size: 20
                    }, void 0, false, {
                        fileName: "[project]/src/components/NotificationPortal.tsx",
                        lineNumber: 145,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/NotificationPortal.tsx",
                    lineNumber: 130,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/NotificationPortal.tsx",
            lineNumber: 45,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/NotificationPortal.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_s(NotificationPortal, "f8RLYCU1IVqQAFILEbthf9Zt6IQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$NotificationContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotification"]
    ];
});
_c = NotificationPortal;
var _c;
__turbopack_context__.k.register(_c, "NotificationPortal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$NotificationContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/NotificationContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$PlaylistContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/PlaylistContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$PlayerContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/PlayerContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$NotificationPortal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/NotificationPortal.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$NotificationContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NotificationProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$PlaylistContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlaylistProvider"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$PlayerContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlayerProvider"], {
                    children: [
                        children,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$NotificationPortal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/components/Providers.tsx",
                            lineNumber: 17,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Providers.tsx",
                    lineNumber: 15,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Providers.tsx",
                lineNumber: 14,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/Providers.tsx",
            lineNumber: 13,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Providers.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__z__as__onAuthStateChanged$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index-dfb5c973.js [app-client] (ecmascript) <export z as onAuthStateChanged>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__signOut$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index-dfb5c973.js [app-client] (ecmascript) <export D as signOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/firebase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    currentUser: null,
    userPreferences: null,
    loginWithGoogle: async ()=>{
        throw new Error("Auth not initialized");
    },
    logout: async ()=>{}
});
const useAuth = ()=>{
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
};
_s(useAuth, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
function AuthProvider({ children }) {
    _s1();
    const [currentUser, setCurrentUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [userPreferences, setUserPreferences] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__z__as__onAuthStateChanged$3e$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], {
                "AuthProvider.useEffect.unsubscribe": async (user)=>{
                    setCurrentUser(user);
                    if (user) {
                        try {
                            const res = await fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/users`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    googleId: user.uid,
                                    name: user.displayName,
                                    email: user.email,
                                    avatar: user.photoURL
                                })
                            });
                            const data = await res.json();
                            if (data && data.preferences) {
                                setUserPreferences(data.preferences);
                                localStorage.setItem("soundify_search_view", data.preferences.searchView || "list");
                            }
                        } catch (err) {
                            console.error("Failed to sync user with MongoDB:", err);
                        }
                    } else {
                        setUserPreferences(null);
                    }
                    setLoading(false);
                }
            }["AuthProvider.useEffect.unsubscribe"]);
            return unsubscribe;
        }
    }["AuthProvider.useEffect"], []);
    const logout = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__signOut$3e$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"]);
    const value = {
        currentUser,
        userPreferences,
        loginWithGoogle: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loginWithGoogle"],
        logout
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: !loading && children
    }, void 0, false, {
        fileName: "[project]/src/context/AuthContext.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s1(AuthProvider, "1eY3df3Y4EES4XPqlsQdF8QAtl4=");
_c = AuthProvider;
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/NotificationContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationProvider",
    ()=>NotificationProvider,
    "useNotification",
    ()=>useNotification
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const NotificationContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    notification: {
        isOpen: false,
        message: '',
        type: 'info',
        onConfirm: null
    },
    showPrompt: ()=>{},
    hidePrompt: ()=>{}
});
function useNotification() {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(NotificationContext);
}
_s(useNotification, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
function NotificationProvider({ children }) {
    _s1();
    const [notification, setNotification] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        isOpen: false,
        message: '',
        type: 'info',
        onConfirm: null
    });
    const showPrompt = (message, type = 'info', onConfirm = null)=>{
        setNotification({
            isOpen: true,
            message,
            type,
            onConfirm
        });
    };
    const hidePrompt = ()=>{
        setNotification((prev)=>({
                ...prev,
                isOpen: false
            }));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NotificationContext.Provider, {
        value: {
            showPrompt,
            hidePrompt,
            notification
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/NotificationContext.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
_s1(NotificationProvider, "RzHKRD8EY4f4ZfMQd37WG0X+ESc=");
_c = NotificationProvider;
var _c;
__turbopack_context__.k.register(_c, "NotificationProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/PlayerContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlayerProvider",
    ()=>PlayerProvider,
    "usePlayer",
    ()=>usePlayer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const PlayerContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    currentTrack: null,
    isPlaying: false,
    togglePlay: ()=>{},
    playTrack: ()=>{},
    progress: 0,
    duration: 0,
    seek: ()=>{},
    shuffle: false,
    setShuffle: ()=>{},
    repeat: "off",
    setRepeat: ()=>{},
    liked: new Set(),
    toggleLike: ()=>{},
    recentlyPlayed: [],
    playNext: ()=>{},
    playPrev: ()=>{},
    isBuffering: false,
    hasError: false,
    volume: 1,
    setVolume: ()=>{},
    isMuted: false,
    setIsMuted: ()=>{}
});
const PlayerProvider = ({ children })=>{
    _s();
    const audioRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [currentTrack, setCurrentTrack] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [queue, setQueue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isPlaying, setIsPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [duration, setDuration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [shuffle, setShuffle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [repeat, setRepeat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("off");
    const { currentUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [liked, setLiked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [recentlyPlayed, setRecentlyPlayed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isBuffering, setIsBuffering] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasError, setHasError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [volume, setVolume] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [isMuted, setIsMuted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const playRequestIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const handleNextRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        "PlayerProvider.useRef[handleNextRef]": ()=>{}
    }["PlayerProvider.useRef[handleNextRef]"]);
    // Fetch user data from DB on load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerProvider.useEffect": ()=>{
            if (currentUser) {
                fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/likes?userId=${currentUser.uid}`).then({
                    "PlayerProvider.useEffect": (res)=>res.json()
                }["PlayerProvider.useEffect"]).then({
                    "PlayerProvider.useEffect": (data)=>{
                        if (Array.isArray(data)) {
                            setLiked(new Set(data.map({
                                "PlayerProvider.useEffect": (item)=>item.trackId || item.id
                            }["PlayerProvider.useEffect"])));
                        }
                    }
                }["PlayerProvider.useEffect"]).catch(console.error);
                fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/history?userId=${currentUser.uid}`).then({
                    "PlayerProvider.useEffect": (res)=>res.json()
                }["PlayerProvider.useEffect"]).then({
                    "PlayerProvider.useEffect": (data)=>{
                        if (Array.isArray(data)) {
                            setRecentlyPlayed(data);
                        }
                    }
                }["PlayerProvider.useEffect"]).catch(console.error);
            } else {
                setLiked(new Set());
                setRecentlyPlayed([]);
            }
        }
    }["PlayerProvider.useEffect"], [
        currentUser
    ]);
    // Initialize HTML5 Audio instance ONCE on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerProvider.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const audio = new Audio();
            audioRef.current = audio;
            audio.volume = isMuted ? 0 : volume;
            audio.muted = isMuted;
            const onPlay = {
                "PlayerProvider.useEffect.onPlay": ()=>setIsPlaying(true)
            }["PlayerProvider.useEffect.onPlay"];
            const onPause = {
                "PlayerProvider.useEffect.onPause": ()=>setIsPlaying(false)
            }["PlayerProvider.useEffect.onPause"];
            const onWaiting = {
                "PlayerProvider.useEffect.onWaiting": ()=>setIsBuffering(true)
            }["PlayerProvider.useEffect.onWaiting"];
            const onPlaying = {
                "PlayerProvider.useEffect.onPlaying": ()=>{
                    setIsBuffering(false);
                    setHasError(false);
                }
            }["PlayerProvider.useEffect.onPlaying"];
            const onEnded = {
                "PlayerProvider.useEffect.onEnded": ()=>{
                    setIsPlaying(false);
                    handleNextRef.current();
                }
            }["PlayerProvider.useEffect.onEnded"];
            const onLoadedMetadata = {
                "PlayerProvider.useEffect.onLoadedMetadata": ()=>{
                    setDuration(audio.duration || 0);
                }
            }["PlayerProvider.useEffect.onLoadedMetadata"];
            const onTimeUpdate = {
                "PlayerProvider.useEffect.onTimeUpdate": ()=>{
                    setProgress(audio.currentTime);
                }
            }["PlayerProvider.useEffect.onTimeUpdate"];
            const onError = {
                "PlayerProvider.useEffect.onError": ()=>{
                    if (!audio.src || audio.src === '' || audio.src === window.location.href) {
                        return;
                    }
                    const err = audio.error;
                    const codeNames = {
                        1: 'MEDIA_ERR_ABORTED',
                        2: 'MEDIA_ERR_NETWORK',
                        3: 'MEDIA_ERR_DECODE',
                        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
                    };
                    const networkStates = [
                        'NETWORK_EMPTY',
                        'NETWORK_IDLE',
                        'NETWORK_LOADING',
                        'NETWORK_NO_SOURCE'
                    ];
                    const readyStates = [
                        'HAVE_NOTHING',
                        'HAVE_METADATA',
                        'HAVE_CURRENT_DATA',
                        'HAVE_FUTURE_DATA',
                        'HAVE_ENOUGH_DATA'
                    ];
                    const codeDesc = err?.code ? `${err.code} (${codeNames[err.code] || 'UNKNOWN'})` : 'none';
                    console.warn(`[WaveX Player] Audio playback error:\n` + `code=${codeDesc}\n` + `message="${err?.message || ''}"\n` + `src="${audio.src}"\n` + `currentSrc="${audio.currentSrc || 'none'}"\n` + `networkState=${audio.networkState} (${networkStates[audio.networkState] || 'UNKNOWN'})\n` + `readyState=${audio.readyState} (${readyStates[audio.readyState] || 'UNKNOWN'})`);
                    setIsPlaying(false);
                    setIsBuffering(false);
                    setHasError(true);
                }
            }["PlayerProvider.useEffect.onError"];
            audio.addEventListener('play', onPlay);
            audio.addEventListener('pause', onPause);
            audio.addEventListener('waiting', onWaiting);
            audio.addEventListener('playing', onPlaying);
            audio.addEventListener('ended', onEnded);
            audio.addEventListener('loadedmetadata', onLoadedMetadata);
            audio.addEventListener('timeupdate', onTimeUpdate);
            audio.addEventListener('error', onError);
            return ({
                "PlayerProvider.useEffect": ()=>{
                    audio.removeEventListener('play', onPlay);
                    audio.removeEventListener('pause', onPause);
                    audio.removeEventListener('waiting', onWaiting);
                    audio.removeEventListener('playing', onPlaying);
                    audio.removeEventListener('ended', onEnded);
                    audio.removeEventListener('loadedmetadata', onLoadedMetadata);
                    audio.removeEventListener('timeupdate', onTimeUpdate);
                    audio.removeEventListener('error', onError);
                    audio.pause();
                }
            })["PlayerProvider.useEffect"];
        }
    }["PlayerProvider.useEffect"], []); // Run strictly once on mount
    // Sync volume and mute changes to active audio element
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerProvider.useEffect": ()=>{
            if (audioRef.current) {
                audioRef.current.volume = volume;
                audioRef.current.muted = isMuted;
            }
        }
    }["PlayerProvider.useEffect"], [
        volume,
        isMuted
    ]);
    const togglePlay = ()=>{
        if (!currentTrack || !audioRef.current) return;
        if (hasError) {
            playTrack(currentTrack, queue);
            return;
        }
        if (audioRef.current.paused) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((err)=>{
                    if (err.name !== 'AbortError') {
                        console.warn("[WaveX Player] Toggle play error:", err.message || err);
                    }
                });
            }
        } else {
            audioRef.current.pause();
        }
    };
    const seek = (time)=>{
        if (audioRef.current && Number.isFinite(time)) {
            try {
                audioRef.current.currentTime = Math.max(0, Math.min(time, duration || time));
                setProgress(time);
            } catch (e) {
                console.warn("[WaveX Player] Seek error:", e);
            }
        }
    };
    const playTrack = (track, trackList = [])=>{
        if (!track) return;
        const trackId = track.id || track.trackId;
        if (!trackId) return;
        const normalizedTrack = {
            ...track,
            id: trackId,
            trackId: trackId
        };
        setRecentlyPlayed((prevHistory)=>{
            const remainingHistory = prevHistory.filter((t)=>t.id !== trackId && t.trackId !== trackId);
            return [
                normalizedTrack,
                ...remainingHistory
            ].slice(0, 10);
        });
        setProgress(0);
        setQueue(trackList.length > 0 ? trackList : [
            normalizedTrack
        ]);
        if (currentTrack?.id === trackId && audioRef.current && audioRef.current.src) {
            if (hasError) {
            // Retry playing
            } else if (isBuffering) {
                return;
            } else {
                togglePlay();
                return;
            }
        }
        setCurrentTrack(normalizedTrack);
        setHasError(false);
        setIsBuffering(true);
        if (audioRef.current) {
            const streamUrl = `/api/stream?videoId=${encodeURIComponent(trackId)}`;
            console.log("[WaveX Player] Track:", normalizedTrack.title);
            console.log("[WaveX Player] Playable ID:", trackId);
            console.log("[WaveX Player] Audio URL:", streamUrl);
            const requestId = ++playRequestIdRef.current;
            let effectiveVolume = volume;
            if (volume <= 0.01 && !isMuted) {
                effectiveVolume = 1;
                setVolume(1);
            }
            audioRef.current.src = streamUrl;
            audioRef.current.volume = isMuted ? 0 : effectiveVolume;
            audioRef.current.muted = isMuted;
            audioRef.current.load();
            console.log("[WaveX Player] Playback Volume:", audioRef.current.volume, "Muted:", audioRef.current.muted);
            setDuration(normalizedTrack.duration || 0);
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(()=>{
                    if (requestId !== playRequestIdRef.current) return;
                    console.log("[WaveX Player] Play started successfully:", normalizedTrack.title);
                    setIsPlaying(true);
                    setIsBuffering(false);
                    setHasError(false);
                    if (currentUser) {
                        fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/history`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                userId: currentUser.uid,
                                track: normalizedTrack
                            })
                        }).catch((err)=>console.warn("History sync failed", err));
                    }
                }).catch((err)=>{
                    if (requestId !== playRequestIdRef.current) return;
                    if (err.name === 'AbortError') {
                        return;
                    }
                    console.warn(`[WaveX Player] Play rejected for "${normalizedTrack.title}":`, err.message || err);
                    setIsPlaying(false);
                    setIsBuffering(false);
                    setHasError(true);
                });
            }
        }
    };
    const handleNext = ()=>{
        if (!queue.length) return;
        let nextIndex = queue.findIndex((t)=>t.id === currentTrack?.id);
        if (shuffle) {
            nextIndex = Math.floor(Math.random() * queue.length);
        } else {
            nextIndex = nextIndex + 1;
        }
        if (nextIndex >= queue.length) {
            if (repeat === "all") nextIndex = 0;
            else return;
        }
        playTrack(queue[nextIndex], queue);
    };
    const handlePrev = ()=>{
        if (!queue.length) return;
        let prevIndex = queue.findIndex((t)=>t.id === currentTrack?.id) - 1;
        if (prevIndex < 0) prevIndex = 0;
        playTrack(queue[prevIndex], queue);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerProvider.useEffect": ()=>{
            handleNextRef.current = handleNext;
        }
    }["PlayerProvider.useEffect"]);
    const toggleLike = (track)=>{
        if (!currentUser || !track || !track.id) return;
        const isLiked = liked.has(track.id);
        setLiked((prev)=>{
            const newSet = new Set(prev);
            isLiked ? newSet.delete(track.id) : newSet.add(track.id);
            return newSet;
        });
        if (isLiked) {
            fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/likes/${track.id}?userId=${currentUser.uid}`, {
                method: 'DELETE'
            }).catch(console.error);
        } else {
            fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    track
                })
            }).catch(console.error);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlayerContext.Provider, {
        value: {
            currentTrack,
            isPlaying,
            togglePlay,
            playTrack,
            progress,
            duration,
            seek,
            shuffle,
            setShuffle,
            repeat,
            setRepeat,
            liked,
            toggleLike,
            recentlyPlayed,
            playNext: handleNext,
            playPrev: handlePrev,
            isBuffering,
            hasError,
            volume,
            setVolume,
            isMuted,
            setIsMuted
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/PlayerContext.tsx",
        lineNumber: 361,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(PlayerProvider, "b93RfGRD3HgYzcLVh0Av7QHVtOg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = PlayerProvider;
const usePlayer = ()=>{
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(PlayerContext);
};
_s1(usePlayer, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "PlayerProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/PlaylistContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlaylistProvider",
    ()=>PlaylistProvider,
    "usePlaylists",
    ()=>usePlaylists
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$NotificationContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/NotificationContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const PlaylistContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    customPlaylists: [],
    downloadedTracks: [],
    loading: true,
    addTrack: async ()=>{},
    createPlaylist: async ()=>undefined,
    deletePlaylist: async ()=>{},
    addDownload: async ()=>{},
    removeDownload: async ()=>{}
});
function usePlaylists() {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(PlaylistContext);
}
_s(usePlaylists, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
function PlaylistProvider({ children }) {
    _s1();
    const { currentUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { showPrompt } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$NotificationContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotification"])();
    const [customPlaylists, setCustomPlaylists] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [downloadedTracks, setDownloadedTracks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlaylistProvider.useEffect": ()=>{
            try {
                localStorage.setItem("wavex_downloads", JSON.stringify(downloadedTracks));
            } catch  {}
        }
    }["PlaylistProvider.useEffect"], [
        downloadedTracks
    ]);
    const fetchPlaylists = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlaylistProvider.useCallback[fetchPlaylists]": async ()=>{
            if (!currentUser) {
                setCustomPlaylists([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [plRes, dlRes] = await Promise.all([
                    fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/playlists?userId=${currentUser.uid}`),
                    fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/downloads?userId=${currentUser.uid}`)
                ]);
                const plData = await plRes.json();
                const dlData = await dlRes.json();
                setCustomPlaylists(Array.isArray(plData) ? plData : []);
                if (Array.isArray(dlData)) {
                    setDownloadedTracks(dlData.map({
                        "PlaylistProvider.useCallback[fetchPlaylists]": (t)=>({
                                ...t,
                                id: t.trackId || t.id,
                                src: t.src?.startsWith('blob:') ? '' : t.src || ''
                            })
                    }["PlaylistProvider.useCallback[fetchPlaylists]"]));
                }
            } catch (err) {
                console.error("Data Sync Error:", err);
                showPrompt("Failed to sync data with cloud.", "error");
            } finally{
                setLoading(false);
            }
        }
    }["PlaylistProvider.useCallback[fetchPlaylists]"], [
        currentUser,
        showPrompt
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlaylistProvider.useEffect": ()=>{
            fetchPlaylists();
        }
    }["PlaylistProvider.useEffect"], [
        fetchPlaylists
    ]);
    const addTrack = async (playlistId, track)=>{
        try {
            const res = await fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    track
                })
            });
            if (!res.ok) throw new Error("Failed");
            await fetchPlaylists();
            showPrompt("Added to playlist!", "success");
        } catch (err) {
            console.error(err);
            showPrompt("Failed to add track.", "error");
            throw err;
        }
    };
    const createPlaylist = async (name)=>{
        if (!currentUser) return;
        try {
            const res = await fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/playlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    name
                })
            });
            if (!res.ok) throw new Error("Failed");
            const newPl = await res.json();
            await fetchPlaylists();
            showPrompt(`Playlist "${name}" created!`, "success");
            return newPl;
        } catch (err) {
            console.error(err);
            showPrompt("Failed to create playlist.", "error");
            throw err;
        }
    };
    const deletePlaylist = async (playlistId)=>{
        try {
            const res = await fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/playlists/${playlistId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error("Failed");
            await fetchPlaylists();
            showPrompt("Playlist deleted.", "success");
        } catch (err) {
            console.error(err);
            showPrompt("Failed to delete playlist.", "error");
            throw err;
        }
    };
    const addDownload = async (track)=>{
        if (!downloadedTracks.find((t)=>t.id === track.id)) {
            setDownloadedTracks((prev)=>[
                    track,
                    ...prev
                ]);
            if (currentUser) {
                fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/downloads`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: currentUser.uid,
                        track
                    })
                }).catch(console.error);
            }
        }
    };
    const removeDownload = async (trackId)=>{
        setDownloadedTracks((prev)=>prev.filter((t)=>t.id !== trackId));
        if (currentUser) {
            fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/api/downloads/${trackId}?userId=${currentUser.uid}`, {
                method: 'DELETE'
            }).catch(console.error);
        }
    };
    const value = {
        customPlaylists,
        downloadedTracks,
        loading,
        addTrack,
        createPlaylist,
        deletePlaylist,
        addDownload,
        removeDownload
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlaylistContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/PlaylistContext.tsx",
        lineNumber: 169,
        columnNumber: 5
    }, this);
}
_s1(PlaylistProvider, "7kgIgh4m0MJeN78xaMWKq2HF8k0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$NotificationContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotification"]
    ];
});
_c = PlaylistProvider;
var _c;
__turbopack_context__.k.register(_c, "PlaylistProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_BASE_URL",
    ()=>API_BASE_URL,
    "FALLBACK_TRACKS",
    ()=>FALLBACK_TRACKS,
    "PLAYLISTS",
    ()=>PLAYLISTS,
    "fetchFeaturedTracks",
    ()=>fetchFeaturedTracks,
    "fetchLyrics",
    ()=>fetchLyrics,
    "fetchTracksByIds",
    ()=>fetchTracksByIds,
    "getDefaultTracks",
    ()=>getDefaultTracks,
    "searchSongs",
    ()=>searchSongs,
    "searchTracks",
    ()=>searchTracks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE_URL = ("TURBOPACK compile-time truthy", 1) ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || '' : "TURBOPACK unreachable";
const YT_API = `${API_BASE_URL}/api/search`;
const searchTracks = async (query)=>{
    if (!query) return [];
    const requestUrl = `${YT_API}?q=${encodeURIComponent(query)}`;
    const requestOptions = {
        method: 'GET'
    };
    try {
        const response = await fetch(requestUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Search request failed:', err);
        throw err;
    }
};
const searchSongs = searchTracks;
const FALLBACK_TRACKS = [
    {
        id: "JGwWNGJdvx8",
        title: "Shape of You",
        artist: "Ed Sheeran",
        cover: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg",
        duration: 233,
        src: `/api/stream?videoId=JGwWNGJdvx8`
    },
    {
        id: "4NRXx6U8ABQ",
        title: "Blinding Lights",
        artist: "The Weeknd",
        cover: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
        duration: 200,
        src: `/api/stream?videoId=4NRXx6U8ABQ`
    },
    {
        id: "TUVcZfQe-Kw",
        title: "Levitating",
        artist: "Dua Lipa",
        cover: "https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg",
        duration: 203,
        src: `/api/stream?videoId=TUVcZfQe-Kw`
    }
];
const fetchFeaturedTracks = async ()=>{
    try {
        const tracks = await searchTracks("trending songs india");
        if (tracks && tracks.length > 0) return tracks;
    } catch (err) {
        console.error(err);
    }
    return FALLBACK_TRACKS;
};
const getDefaultTracks = async ()=>{
    try {
        const tracks = await searchTracks("top hits 2024");
        if (tracks && tracks.length > 0) return tracks;
    } catch (err) {
        console.error(err);
    }
    return FALLBACK_TRACKS;
};
const fetchTracksByIds = async (ids = [])=>{
    if (!ids || ids.length === 0) return [];
    try {
        const promises = ids.map((id)=>fetch(`${API_BASE_URL}/api/track?id=${id}`).then((res)=>res.ok ? res.json() : null));
        const results = await Promise.all(promises);
        return results.filter((track)=>track !== null);
    } catch (err) {
        console.error("Failed to fetch tracks by IDs:", err);
        return [];
    }
};
const PLAYLISTS = [
    {
        id: "trending",
        name: "Trending Now",
        songs: FALLBACK_TRACKS
    },
    {
        id: "top",
        name: "Top Hits",
        songs: FALLBACK_TRACKS
    }
];
const fetchLyrics = async (title, artist)=>{
    if (!title) return `[00:00.00] No lyrics found.`;
    try {
        const cleanTitle = title.replace(/\(.*?\)|\[.*?\]|(official.*)/gi, '').trim();
        const cleanArtist = artist ? artist.split(',')[0].trim() : '';
        const res = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`);
        const data = await res.json();
        if (data && data.length > 0) {
            const synced = data.find((d)=>d.syncedLyrics);
            if (synced) return synced.syncedLyrics;
            if (data[0].plainLyrics) {
                return `[00:00.00] (Lyrics are not synced)\n` + data[0].plainLyrics.split('\n').map((line, i)=>`[00:0${i % 9 + 1}.00] ${line}`).join('\n');
            }
        }
    } catch (err) {
        console.error("Lyrics fetch failed:", err);
    }
    return `[00:00.00] No lyrics available for "${title}".`;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/firebase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "googleProvider",
    ()=>googleProvider,
    "loginWithGoogle",
    ()=>loginWithGoogle,
    "logoutUser",
    ()=>logoutUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__p__as__getAuth$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index-dfb5c973.js [app-client] (ecmascript) <export p as getAuth>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Y__as__GoogleAuthProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index-dfb5c973.js [app-client] (ecmascript) <export Y as GoogleAuthProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__d__as__signInWithPopup$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index-dfb5c973.js [app-client] (ecmascript) <export d as signInWithPopup>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__signOut$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index-dfb5c973.js [app-client] (ecmascript) <export D as signOut>");
;
;
const firebaseConfig = {
    apiKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBEWkp2f2r_Bvv9cHgY_hoB7OvuzFya82c",
    authDomain: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "wavex-new.firebaseapp.com",
    projectId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "wavex-new",
    storageBucket: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "wavex-new.firebasestorage.app",
    messagingSenderId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "436498550744",
    appId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:436498550744:web:123177db56c9bd528eacad",
    measurementId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-9ZE4M5T2TX"
};
const app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApps"])().length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApp"])() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["initializeApp"])(firebaseConfig);
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__p__as__getAuth$3e$__["getAuth"])(app);
const googleProvider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Y__as__GoogleAuthProvider$3e$__["GoogleAuthProvider"]();
const loginWithGoogle = async ()=>{
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__d__as__signInWithPopup$3e$__["signInWithPopup"])(auth, googleProvider);
    return result.user;
};
const logoutUser = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2d$dfb5c973$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__signOut$3e$__["signOut"])(auth);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=src_00s9czluc_zzx._.js.map