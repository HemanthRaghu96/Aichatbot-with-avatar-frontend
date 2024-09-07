import React, { useState, useEffect } from 'react';
import { sendMessageToChatbot } from '../hooks/hook';
import AvatarComponent from './AvatarComponent';

interface ChatPageProps {
  message: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ message }) => {
  const [cleanedMessages, setCleanedMessages] = useState<{ user?: string; chatbot?: string }[]>([]);

  useEffect(() => {
    if (message) {
      handleSendMessage(message);
    }
  }, [message]);

  const handleSendMessage = async (message: string) => {
    const cleanedMessage = cleanText(message);

    

    // Send the message to the chatbot and get the reply
    try {
      const reply = await sendMessageToChatbot(message);
      const cleanedReply = cleanText(reply);

      // Combine user's message and chatbot's reply into one entry
      setCleanedMessages((prev) => [...prev, { user: cleanedMessage, chatbot: cleanedReply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = 'Error getting reply';
      setCleanedMessages((prev) => [...prev, { user: cleanedMessage, chatbot: errorMessage }]);
    }
  };

  // Function to clean the message text
  const cleanText = (text: string) => {
    return text.replace(/[^\w\s]/gi, ''); // Remove all symbols
  };
console.log(cleanedMessages)
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="h-96 border rounded overflow-y-auto mb-4 p-4">
        {cleanedMessages.map((msg, index) => (
          <div key={index} className="mb-2">
            {msg.user && (
              <div className="text-right mb-2">
                <span className="inline-block px-4 py-2 rounded bg-blue-500 text-white">
                  {msg.user}
                </span>
              </div>
            )}
            {msg.chatbot && (
              <div className="text-left">
                <span className="inline-block px-4 py-2 rounded bg-gray-300">
                  {msg.chatbot}
                </span>
              </div>
            )}
          </div>
        ))}
        <AvatarComponent messages={cleanedMessages}/>
      </div>
    </div>
  );
};

export default ChatPage;
