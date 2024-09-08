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
  const [showImage, setShowImage] = useState<boolean>(true); // State to control image display
  const api_key = 'zg90ytjwawdhbwluz0bnbwfpbc5jb20:9eE8-qQTBPEXojsDu0Bkp';
  const videoRef = useRef<HTMLVideoElement>(null);
console.log(isLoading)
console.log(talkId)
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
      url: '/api/talks', // Proxy endpoint
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
          url: `/api/talks/${talkId}`, // Proxy endpoint
          headers: {
            accept: 'application/json',
            Authorization: `Basic ${api_key}`,
          },
        };

        const response = await axios.request(options);
        if (response.data.status === 'done') {
          setVideoUrl(response.data.result_url);
          setShowImage(false); // Show the video when it's done
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

  // Handle video end event to switch back to the image
  const handleVideoEnd = () => {
    setShowImage(true); // Show the image again after the video ends
  };

  // Automatically trigger the avatar creation when a new message is received
  useEffect(() => {
    if (messages.length > 0) {
      createAvatar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]); // Re-run when messages change
console.log(videoUrl)
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Live Chat Avatar</h1>
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      {/* Display the image or the video based on the showImage state */}
      {showImage && (
        <div className="mt-4">
          <img
            src="https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg"
            alt="Avatar Placeholder"
            className="w-full max-w-md h-96 object-contain"
          />
        </div>
      )}

      {videoUrl && !showImage && (
        <div className="mt-4">
          <video
            ref={videoRef}
            src={videoUrl}
           
             className="w-full max-w-md h-96 object-contain"
            onEnded={handleVideoEnd} // Event listener for video end
          ></video>
        </div>
      )}
    </div>
  );
};

export default AvatarComponent;
