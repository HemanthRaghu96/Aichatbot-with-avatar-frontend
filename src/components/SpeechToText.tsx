import React, { useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import ChatPage from './ChatPage';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionError extends Event {
  error: string;
}

const SpeechToText: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any | null>(null);

  const handleStartListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const newRecognition = new (window as any).webkitSpeechRecognition();
    newRecognition.continuous = true;
    newRecognition.interimResults = true;

    newRecognition.onresult = (event: SpeechRecognitionEvent) => {
      let newTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        newTranscript += event.results[i][0].transcript;
      }
      setCurrentTranscript(newTranscript);
    };

    newRecognition.onerror = (event: SpeechRecognitionError) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'network') {
        alert('Network error: Please check your internet connection or try again later.');
      } else {
        alert('Speech recognition error: ' + event.error);
      }
    };

    newRecognition.onend = () => {
      setIsListening(false);
      setRecognition(null); // Clear recognition state
    };

    newRecognition.start();
    setRecognition(newRecognition);
    setIsListening(true);
  };

  const handleStopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setTranscript(currentTranscript); // Save current transcript
    setCurrentTranscript(''); // Clear the current transcript
    setIsListening(false);
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <button
        onClick={isListening ? handleStopListening : handleStartListening}
        className={`px-6 py-2 rounded-full text-white focus:outline-none mb-4 flex items-center justify-center gap-2 ${
          isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isListening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <ChatPage message={transcript} />
    </div>
  );
};

export default SpeechToText;
