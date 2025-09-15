'use client';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
} from '@livekit/components-react';
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import '@fortawesome/fontawesome-free/css/all.css'; // Ensure Font Awesome is available

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConnected) {
      timer = setInterval(() => {
        setCallDuration(prevDuration => prevDuration + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isConnected]);

  const handleConnect = async () => {
    const { id } = router.query;
    if (!id) {
      console.error("No ID found in the URL");
      return;
    }

    const response = await fetch(`/api/token?id=${id}`);
    const { accessToken, url } = await response.json();

    setToken(accessToken);
    setUrl(url);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setToken(null);
    setUrl(null);
    setIsConnected(false);
    setCallDuration(0);
  };

  return (
    <>
      <main className="flex flex-col items-center justify-center h-screen">
        <i className="fas fa-user-circle text-5xl"></i>
        <div className="flex mt-5">
          <button 
            onClick={handleConnect}
            className="mr-2"
            disabled={isConnected}
          >
            <i className="fas fa-phone fa-2x"></i>
          </button>
          <button 
            onClick={handleDisconnect}
            className="mr-0"
            disabled={!isConnected}
          >
            <i className="fas fa-phone-slash fa-2x"></i>
          </button>
        </div>
        {isConnected && <div className="mt-2">Call Duration: {Math.floor(callDuration / 60)}:{callDuration % 60 < 10 ? '0' : ''}{callDuration % 60}</div>}
        {token && url && (
          <LiveKitRoom
            token={token}
            serverUrl={url}
            connectOptions={{ autoSubscribe: true }}
            onDisconnected={() => setIsConnected(false)}
          >
            <ActiveRoom />
          </LiveKitRoom>
        )}
      </main>
    </>
  );
}

const ActiveRoom = () => {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  return (
    <>
      <RoomAudioRenderer />
      <button onClick={() => {
        localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled)
      }}>
        Toggle Microphone
      </button>
      <div>Audio Enabled: { isMicrophoneEnabled ? 'Unmuted' : 'Muted' }</div>
    </>
  );
};
