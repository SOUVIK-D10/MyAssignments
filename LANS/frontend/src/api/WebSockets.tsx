import { useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  url: string;
  onMessage: (data: any) => void;
}

export function useWebSocket({ url, onMessage }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Connecting...');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;

    
    const connectWS = () => {
      if (!url) return;
      setStatusText('Connecting...');
      
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setStatusText('Live & Listening');
        //console.log('[WebSocket] Connected to:', url);
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const parsedData = JSON.parse(event.data);
          onMessage(parsedData);
        } catch (err) {
          //console.error('[WebSocket] Parse error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setStatusText('Disconnected. Retrying...');
        reconnectTimer = setTimeout(connectWS, 3000);
      };

      ws.onerror = (error) => {
        //console.error('[WebSocket Error]', error);
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearTimeout(reconnectTimer);
    };
  }, [url]);

  return { isConnected, statusText };
}