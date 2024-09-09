import React, { useState, useEffect } from 'react';

import movinghead from "../assets/movinghead.webm";
import takinghead from "../assets/takinghead.webm";

interface TextToSpeechProps {
  messages: { user?: string; chatbot?: string }[];
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ messages }) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [latestChatbotMessage, setLatestChatbotMessage] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [videoSrc, setVideoSrc] = useState<string>(movinghead);

  useEffect(() => {
    // Get the latest chatbot message
    if (messages && messages.length > 0) {
      const lastChatbotMessage = [...messages].reverse().find((msg) => msg.chatbot)?.chatbot;
      if (lastChatbotMessage) {
        setLatestChatbotMessage(lastChatbotMessage);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (latestChatbotMessage && 'speechSynthesis' in window) {
      // Cancel previous speech if any
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(latestChatbotMessage);
      utterance.onstart = () => {
        setIsSpeaking(true);
        setVideoSrc(takinghead); // Change video to takinghead when speaking
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false); // Reset pause state after speech ends
        setVideoSrc(movinghead); // Revert video to movinghead when speech ends
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error', event);
        alert('Speech synthesis error: ' + event.error);
        setIsSpeaking(false);
        setIsPaused(false);
        setVideoSrc(movinghead); // Revert video on error
      };

      window.speechSynthesis.speak(utterance);
    }
  }, [latestChatbotMessage]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setVideoSrc(takinghead); // Change video to takinghead when resuming
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setVideoSrc(movinghead); // Change video to movinghead when pausing
      }
    }
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setLatestChatbotMessage(null);
    setVideoSrc(movinghead); // Revert video to movinghead when stopping
  };

  return (
    <div className='flex flex-col justify-center items-center'>
     
      <video
        src={videoSrc}
        className="w-full max-w-md h-96 object-contain rounded-lg"
        loop
        muted
        autoPlay
        onError={(e) => console.error("Video error:", e)}
      ></video>
         {/* <p className='w-[400px]'>{isSpeaking ? latestChatbotMessage : latestChatbotMessage || 'Waiting for message...'}</p> */}
      {isSpeaking && (
        <div className="flex gap-4 mt-[10px]">
          <button
            onClick={handleToggleSpeech}
            className={`px-6 py-2 rounded-full text-white focus:outline-none mb-4 flex items-center justify-center ${
              isPaused
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isPaused ? "Resume Speech" : "Pause Speech"}
          </button>
          <button
            onClick={handleStopSpeech}
            className="px-6 py-2 rounded-full bg-gray-500 hover:bg-gray-600 text-white focus:outline-none mb-4 flex items-center justify-center"
          >
            Stop Speech
          </button>
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;
