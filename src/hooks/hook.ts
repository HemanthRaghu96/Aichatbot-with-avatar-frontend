export const sendMessageToChatbot = async (message: string): Promise<string> => {
    const response = await fetch('https://aichatbot-with-avatar.onrender.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
  
    const data = await response.json();
    return data.reply;
  };