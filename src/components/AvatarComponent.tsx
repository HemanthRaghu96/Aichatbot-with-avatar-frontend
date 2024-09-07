import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface AvatarComponentProps {
  messages: { user?: string; chatbot?: string }[];
}

const AvatarComponent: React.FC<AvatarComponentProps> = ({ messages }) => {
   
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [talkId, setTalkId] = useState<string | null>(null);
  const api_key = 'aGVtYW50aHJhZ2h1OTZAZ21haWwuY29t:2eqExFobhlXNvr5MRFu4r';
  const videoRef = useRef<HTMLVideoElement>(null);

  const truncateMessage = (message: string, wordLimit: number) => {
    const words = message.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...'; // Adding ellipsis if truncated
    }
    return message;
  };
  // Function to create the avatar
  const createAvatar = async () => {
    if (messages.length === 0) {
      setError('No messages available to create avatar');
      return;
    }

    setIsLoading(true);
    setError(null);

    const lastMessage = messages[messages.length - 1].chatbot || ''; // Use the last chatbot message
    const truncatedMessage = truncateMessage(lastMessage, 50);
    const options = {
      method: 'POST',
      url: 'https://api.d-id.com/talks', // Proxy endpoint
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Basic ${api_key}`,
      },
      data: {
        source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg',
        script: {
          type: 'text',
          subtitles: 'false',
          provider: { type: 'microsoft', voice_id: 'Sara' },
          input: truncatedMessage,
        },
        config: { fluent: 'false', pad_audio: '0.0' },
      },
    };

    try {
      const response = await axios.request(options);
      setTalkId(response.data.id);
      await pollStatus(response.data.id); // Poll status after creation
    } catch (err) {
      setError('Error creating avatar');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to poll the status of the video creation
  const pollStatus = async (talkId: string) => {
    const pollInterval = 5000; // Poll every 5 seconds

    const intervalId = setInterval(async () => {
      try {
        const options = {
          method: 'GET',
          url: `https://api.d-id.com/talks/${talkId}`, // Proxy endpoint
          headers: {
            accept: 'application/json',
            Authorization: `Basic ${api_key}`,
          },
        };

        const response = await axios.request(options);
        if (response.data.status === 'done') {
          setVideoUrl(response.data.result_url);
          clearInterval(intervalId);
        } else if (response.data.status === 'failed') {
          setError('Video creation failed');
          clearInterval(intervalId);
        }
      } catch (err) {
        setError('Error fetching video status');
        clearInterval(intervalId);
      }
    }, pollInterval);
  };

  // Automatically play the video when videoUrl is available
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.play();
    }
  }, [videoUrl]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Avatar Video</h1>
      {!videoUrl && (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={createAvatar}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Avatar'}
        </button>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {videoUrl && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Generated Video:</h2>
          <video ref={videoRef} src={videoUrl} controls className="w-full max-w-md"></video>
        </div>
      )}
    </div>
  );
};

export default AvatarComponent;
