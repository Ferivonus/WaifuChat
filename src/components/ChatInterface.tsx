import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface Message {
  content: string;
  isUser: boolean;
}

interface ChatInterfaceProps {
  selectedCharacter: string;
}

const ChatInterface = ({ selectedCharacter }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [characterExpression, setCharacterExpression] = useState('idle');
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognition = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition Setup
  useEffect(() => {
    const setupSpeechRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = false;
        recognition.current.interimResults = false;
        recognition.current.maxAlternatives = 1;
        recognition.current.lang = 'tr-TR';

        recognition.current.onresult = (event: any) => {
          const lastResult = event.results[0][0].transcript;
          setInput(lastResult.trim());
        };

        recognition.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };

        recognition.current.onsoundend = () => {
          if (isRecording) {
            recognition.current?.stop();
            setIsRecording(false);
          }
        };
      }
    };

    setupSpeechRecognition();
  }, [isRecording]);

  // AI Response Handling
  useEffect(() => {
    const unlistenChunk = listen<string>('ai_chunk', (event) => {
      setStreamingResponse(prev => prev + event.payload);
      updateExpression(event.payload);
    });

    const unlistenEnd = listen('ai_end', () => {
      setMessages(prev => [...prev, { 
        content: streamingResponse, 
        isUser: false 
      }]);
      setStreamingResponse('');
      setIsLoading(false);
      setCharacterExpression('idle');
    });

    return () => {
      unlistenChunk.then((f) => f());
      unlistenEnd.then((f) => f());
    };
  }, [streamingResponse]);

  // Scroll Handling
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, streamingResponse]);

  const updateExpression = (response: string) => {
    if (response.includes('?')) {
      setCharacterExpression('confused');
    } else if (response.includes('!')) {
      setCharacterExpression('excited');
    } else {
      setCharacterExpression('talking');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { content: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCharacterExpression('thinking');
    setStreamingResponse('');

    try {
      await invoke('ask_ai', { 
        prompt: input, 
        character: selectedCharacter,
      });
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setCharacterExpression('sad');
      setMessages(prev => [
        ...prev,
        { content: 'Bir hata oluştu. Lütfen tekrar deneyin.', isUser: false }
      ]);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognition.current?.stop();
    } else {
      recognition.current?.abort();
      recognition.current?.start();
      setInput('');
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="container">
      <div className="character-header">
        <h2>{selectedCharacter.toUpperCase()}</h2>
        <div className="character-container">
          <img
            src={`/sprites/${selectedCharacter}-${characterExpression}.png`}
            alt={`${selectedCharacter} ${characterExpression}`}
            className="character-image"
          />
        </div>
      </div>

      <div className="chat-container">
        {messages.map((message, index) => (
          <div key={`${index}-${message.content.substring(0, 5)}`} 
               className={`message ${message.isUser ? 'user' : 'ai'}`}>
            <div className="message-bubble">{message.content}</div>
          </div>
        ))}
        
        {isLoading && streamingResponse && (
          <div className="message ai">
            <div className="message-bubble">{streamingResponse}</div>
          </div>
        )}

        {isLoading && !streamingResponse && (
          <div className="message ai">
            <div className="message-bubble loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-container">
        <button
          type="button"
          onClick={toggleRecording}
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          aria-label={isRecording ? 'Ses kaydını durdur' : 'Ses kaydını başlat'}
        >
          🎤
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Mesaj yazın veya konuşun..."
          disabled={isLoading}
          aria-label="Sohbet girişi"
        />

        <button type="submit" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? 'Yanıt oluşturuluyor...' : 'Gönder'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;