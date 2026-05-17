// ============================================================
//  services/websocket.js
//  WebSocket / STOMP realtime — giám sát thi
//  Backend dùng Spring WebSocket tại ws://localhost:8080/ws
//
//  Dùng native WebSocket (không cần cài sockjs/stomp)
//  với giao thức STOMP text-frame đơn giản
// ============================================================

const WS_URL = "ws://localhost:8080/ws";

// ── STOMP frame builder ───────────────────────────────────
function buildFrame(command, headers = {}, body = "") {
  let frame = `${command}\n`;
  Object.entries(headers).forEach(([k, v]) => { frame += `${k}:${v}\n`; });
  frame += `\n${body}\0`;
  return frame;
}

function parseFrame(raw) {
  const nullIdx = raw.indexOf("\0");
  const content = nullIdx >= 0 ? raw.slice(0, nullIdx) : raw;
  const lines   = content.split("\n");
  const command = lines[0];
  const headers = {};
  let   bodyStart = 1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "") { bodyStart = i + 1; break; }
    const [k, ...rest] = lines[i].split(":");
    headers[k.trim()] = rest.join(":").trim();
  }
  const body = lines.slice(bodyStart).join("\n").trim();
  return { command, headers, body };
}

// ── ExamSocketService class ───────────────────────────────
class ExamSocketService {
  constructor() {
    this.ws          = null;
    this.connected   = false;
    this.listeners   = {}; // topic → [callback]
    this.reconnectMs = 3000;
    this.shouldRecon = false;
    this._pingInterval = null;
  }

  /**
   * Kết nối tới WebSocket và STOMP CONNECT
   * @param {string} token  JWT token
   * @param {Function} onConnect  callback khi kết nối thành công
   */
  connect(token, onConnect) {
    if (this.ws) this.disconnect();
    this.shouldRecon = true;

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      // Gửi STOMP CONNECT
      this.ws.send(buildFrame("CONNECT", {
        "accept-version": "1.1,1.0",
        "heart-beat":     "10000,10000",
        Authorization:    `Bearer ${token}`,
      }));
    };

    this.ws.onmessage = (event) => {
      const frame = parseFrame(event.data);

      if (frame.command === "CONNECTED") {
        this.connected = true;
        // Ping giữ kết nối
        this._pingInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) this.ws.send("\n");
        }, 10000);
        onConnect && onConnect();
        return;
      }

      if (frame.command === "MESSAGE") {
        const topic = frame.headers.destination;
        const body  = (() => {
          try { return JSON.parse(frame.body); }
          catch { return frame.body; }
        })();
        (this.listeners[topic] || []).forEach(cb => cb(body));
      }

      if (frame.command === "ERROR") {
        console.error("[WS] STOMP ERROR:", frame.body);
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      clearInterval(this._pingInterval);
      if (this.shouldRecon) {
        setTimeout(() => {
          if (this.shouldRecon) this.connect(token, onConnect);
        }, this.reconnectMs);
      }
    };

    this.ws.onerror = (err) => {
      console.warn("[WS] Connection error — backend có thể chưa chạy.", err);
    };
  }

  /** Subscribe một topic STOMP */
  subscribe(topic, callback) {
    if (!this.listeners[topic]) this.listeners[topic] = [];
    this.listeners[topic].push(callback);

    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(buildFrame("SUBSCRIBE", {
        destination: topic,
        id:          `sub-${Date.now()}`,
      }));
    }
    // Trả về hàm unsubscribe
    return () => {
      this.listeners[topic] = (this.listeners[topic] || []).filter(cb => cb !== callback);
    };
  }

  /** Gửi message tới server */
  send(destination, body) {
    if (!this.connected) return;
    this.ws.send(buildFrame("SEND", { destination }, JSON.stringify(body)));
  }

  /** Ngắt kết nối hoàn toàn */
  disconnect() {
    this.shouldRecon = false;
    clearInterval(this._pingInterval);
    if (this.ws) {
      if (this.connected) {
        try { this.ws.send(buildFrame("DISCONNECT")); } catch {}
      }
      this.ws.close();
      this.ws = null;
    }
    this.connected  = false;
    this.listeners  = {};
  }
}

// Singleton — dùng chung toàn app
export const examSocket = new ExamSocketService();

// ── Topic constants (khớp với backend) ───────────────────
export const TOPICS = {
  /** Danh sách sinh viên đang online trong phòng thi */
  examStudents: (maBaiThi) => `/topic/exam/${maBaiThi}/students`,
  /** Cảnh báo vi phạm realtime */
  examAlerts:   (maBaiThi) => `/topic/exam/${maBaiThi}/alerts`,
  /** Broadcast toàn hệ thống từ admin */
  systemBroadcast: "/topic/system/broadcast",
};

// ── React hook dùng trong component ──────────────────────
// import { useExamSocket } from '../services/websocket'
// const { students, alerts } = useExamSocket(maBaiThi)
import { useState, useEffect } from "react";
import { getToken } from "./api";

export function useExamSocket(maBaiThi) {
  const [students,  setStudents]  = useState([]);
  const [alerts,    setAlerts]    = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!maBaiThi) return;

    examSocket.connect(getToken(), () => {
      setConnected(true);

      examSocket.subscribe(TOPICS.examStudents(maBaiThi), (data) => {
        setStudents(Array.isArray(data) ? data : []);
      });

      examSocket.subscribe(TOPICS.examAlerts(maBaiThi), (data) => {
        setAlerts(prev => [
          { ...data, id: Date.now() },
          ...prev.slice(0, 49), // giữ tối đa 50 alert
        ]);
      });
    });

    return () => examSocket.disconnect();
  }, [maBaiThi]);

  const clearAlerts = () => setAlerts([]);

  return { students, alerts, connected, clearAlerts };
}