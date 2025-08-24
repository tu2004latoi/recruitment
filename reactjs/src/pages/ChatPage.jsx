import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import api, { authApis, endpoints, BASE_URL } from "../configs/Apis";
import { MyUserContext } from "../configs/MyContexts";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const wsBase = BASE_URL.replace("/api", "");

const ChatPage = () => {
    const currentUser = useContext(MyUserContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [partners, setPartners] = useState([]);
    const [activePartnerId, setActivePartnerId] = useState(null);
    const [messagesByPartner, setMessagesByPartner] = useState({});
    const [input, setInput] = useState("");
    const stompRef = useRef(null);
    const [activePartnerName, setActivePartnerName] = useState("");

    const messagesEndRef = useRef(null); 
    const activePartnerIdRef = useRef(null); 
    const currentUserIdRef = useRef(null);

    const partnerParamId = useMemo(() => {
        const p = new URLSearchParams(location.search).get("partnerId");
        const num = Number(p);
        return Number.isNaN(num) ? null : num;
    }, [location.search]);

    useEffect(() => {
        if (currentUser === null) navigate("/login");
    }, [currentUser, navigate]);

    // Load conversation partners
    useEffect(() => {
        if (!currentUser?.userId) return;
        const loadPartners = async () => {
            try {
                const res = await authApis().get(endpoints.messagesPartners(currentUser.userId));
                setPartners(res.data || []);
            } catch (e) {
                console.error("Failed to load partners", e);
                if (partnerParamId) {
                    setPartners((prev) => {
                        if (prev.some((p) => (p.id ?? p.userId) === partnerParamId)) return prev;
                        return [
                            ...prev,
                            { id: partnerParamId, userId: partnerParamId, firstName: "Người dùng", lastName: String(partnerParamId) },
                        ];
                    });
                }
            }
        };
        loadPartners();
    }, [currentUser, partnerParamId]);

    // Auto-select partner
    useEffect(() => {
        if (partnerParamId) setActivePartnerId(partnerParamId);
    }, [partnerParamId]);

    // Load messages
    useEffect(() => {
        if (!currentUser?.userId || !activePartnerId) return;
        (async () => {
            try {
                const res = await authApis().get(endpoints.messagesByPartner(activePartnerId));
                setMessagesByPartner((prev) => ({ ...prev, [activePartnerId]: res.data || [] }));
                setPartners((prev) =>
                    prev.map((p) =>
                        (p.userId === activePartnerId || p.id === activePartnerId)
                            ? { ...p, unreadCount: 0 }
                            : p
                    )
                );
            } catch (e) {
                console.warn("History not available", e);
            }
        })();
    }, [currentUser, activePartnerId]);

    // Update partner name
    useEffect(() => {
        if (!activePartnerId) {
            setActivePartnerName("");
            return;
        }
        const p = partners.find((x) => (x.userId ?? x.id) === activePartnerId);
        if (p) {
            const name = `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.username || `#${activePartnerId}`;
            setActivePartnerName(name);
            return;
        }
        (async () => {
            try {
                const res = await api.get(endpoints.publicUserDetails(activePartnerId));
                const u = res.data || {};
                const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || `#${activePartnerId}`;
                setActivePartnerName(name);
            } catch {
                setActivePartnerName(`#${activePartnerId}`);
            }
        })();
    }, [activePartnerId, partners]);

    // Luôn cập nhật ref khi activePartnerId thay đổi để callback của STOMP đọc được giá trị mới nhất
    useEffect(() => {
        activePartnerIdRef.current = activePartnerId;
    }, [activePartnerId]);

    // Luôn cập nhật ref khi currentUser thay đổi
    useEffect(() => {
        currentUserIdRef.current = currentUser?.userId ?? null;
    }, [currentUser]);

    // WebSocket connection
    const authToken = useMemo(() => {
        return Cookies.get("token") || localStorage.getItem("token") || sessionStorage.getItem("token");
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser?.userId) return;
        if (!authToken) return; // đợi có token rồi mới kết nối để backend map Principal đúng

        const client = new Client({
            webSocketFactory: () => new SockJS(`${wsBase}/ws`, null, { withCredentials: true }),
            reconnectDelay: 5000,
            debug: () => { },
            connectHeaders: { Authorization: `Bearer ${authToken}` },
            onConnect: () => {
                console.log("✅ STOMP connected");

                const handleIncoming = (frame) => {
                    try {
                        const msg = JSON.parse(frame.body);
                        const senderId = msg?.sender?.userId ?? msg?.senderId;
                        const receiverId = msg?.receiver?.userId ?? msg?.receiverId;
                        const myId = currentUserIdRef.current;
                        const partnerId = (senderId === myId) ? receiverId : senderId;
                        if (!partnerId) return;

                        setMessagesByPartner((prev) => {
                            const list = prev[partnerId] || [];
                            return { ...prev, [partnerId]: [...list, msg] };
                        });

                        setPartners((prev) => {
                            const exists = prev.some((p) => (p.userId ?? p.id) === partnerId);
                            const updated = prev.map((p) =>
                                (p.userId === partnerId || p.id === partnerId)
                                    ? {
                                        ...p,
                                        lastMessage: msg.content,
                                        unreadCount: (activePartnerIdRef.current === partnerId) ? 0 : (p.unreadCount || 0) + 1,
                                    }
                                    : p
                            );
                            return exists
                                ? updated
                                : [
                                    ...updated,
                                    { id: partnerId, userId: partnerId, lastMessage: msg.content, unreadCount: 1 },
                                ];
                        });
                    } catch (e) {
                        console.error("Incoming message parse error", e);
                    }
                };

                client.subscribe("/user/queue/messages", handleIncoming);
                client.subscribe("/queue/messages", handleIncoming);
            },
            onStompError: (frame) => {
                console.error("STOMP error", frame.headers["message"], frame.body);
            },
            onWebSocketClose: (evt) => {
                console.warn("WebSocket closed", evt?.reason || evt);
            },
            onWebSocketError: (evt) => {
                console.error("WebSocket error", evt);
            },
        });

        stompRef.current = client;
        client.activate();

        return () => {
            try {
                client.deactivate();
            } catch { }
        };
    }, [currentUser, authToken]);

    // Auto-scroll xuống cuối mỗi khi có tin nhắn mới
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messagesByPartner, activePartnerId]);

    const sendMessage = () => {
        const text = input.trim();
        if (!text || !activePartnerId || !stompRef.current || !currentUser?.userId) return;

        const optimistic = {
            messageId: `tmp-${Date.now()}`,
            sender: { userId: currentUser.userId },
            receiver: { userId: activePartnerId },
            content: text,
            createdAt: new Date().toISOString(),
            status: "SENT",
        };
        setMessagesByPartner((prev) => {
            const list = prev[activePartnerId] || [];
            return { ...prev, [activePartnerId]: [...list, optimistic] };
        });
        setPartners((prev) =>
            prev.map((p) =>
                (p.userId === activePartnerId || p.id === activePartnerId)
                    ? { ...p, lastMessage: text }
                    : p
            )
        );
        setInput("");

        if (stompRef.current?.connected) {
            const dto = {
                senderId: currentUser.userId,
                receiverId: activePartnerId,
                content: text,
            };
            stompRef.current.publish({
                destination: "/app/chat.sendMessage",
                body: JSON.stringify(dto),
            });
        }
    };

    const displayName = (p) => {
        const fn = p.firstName || "";
        const ln = p.lastName || "";
        return `${fn} ${ln}`.trim() || p.username || `#${p.userId || p.id}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 h-[70vh]">
                    {/* Sidebar */}
                    <div className="col-span-4 border-r overflow-y-auto">
                        <div className="p-4 font-semibold text-gray-700">Tin nhắn</div>
                        {partners.map((p) => {
                            const pid = p.userId ?? p.id;
                            return (
                                <div
                                    key={pid}
                                    onClick={() => setActivePartnerId(pid)}
                                    className={`px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${activePartnerId === pid ? "bg-gray-50" : ""
                                        }`}
                                >
                                    <div className="min-w-0">
                                        <div className="font-medium text-gray-900 truncate">{displayName(p)}</div>
                                        <div className="text-sm text-gray-600 truncate">{p.lastMessage}</div>
                                    </div>
                                    {p.unreadCount > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                            {p.unreadCount}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Chat window */}
                    <div className="col-span-8 flex flex-col h-[70vh]">
                        <div className="px-4 py-3 border-b font-semibold text-gray-700">
                            {activePartnerId
                                ? `Đang chat với ${activePartnerName || `#${activePartnerId}`}`
                                : "Chọn người để bắt đầu"}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {(messagesByPartner[activePartnerId] || []).map((m) => (
                                <div
                                    key={m.messageId || m.createdAt}
                                    className={`flex ${m.sender?.userId === currentUser?.userId || m.senderId === currentUser?.userId
                                            ? "justify-end"
                                            : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[70%] px-3 py-2 rounded-lg ${m.sender?.userId === currentUser?.userId || m.senderId === currentUser?.userId
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100"
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap break-words">{m.content}</div>
                                        <div className="text-[10px] opacity-70 mt-1 text-right">
                                            {new Date(m.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} /> {/* 👈 scroll anchor */}
                        </div>

                        <div className="p-3 border-t flex gap-2">
                            <input
                                className="flex-1 border rounded px-3 py-2"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") sendMessage();
                                }}
                            />
                            <button
                                className="bg-blue-600 text-white px-4 rounded"
                                onClick={sendMessage}
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
