'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Like {
  id: number;
  username: string;
}

interface Tweet {
  id: number;
  username: string;
  content: string;
  createdAt: Date;
  likes: Like[];
}

function getYouTubeVideoId(url: string): string | null {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?(?:\S+)/;
  const match = url.match(regExp);
  console.log('Checking URL:', url, 'Match:', match); // Debug log
  if (match) {
    const fullUrl = match[0];
    const videoId = fullUrl.split(/[\/=]/g).pop();
    console.log('Extracted Video ID:', videoId); // Debug log
    return videoId || null;
  }
  return null;
}

function TweetContent({ content }: { content: string }) {
  console.log('Tweet content:', content); // Debug log
  const words = content.split(' ');
  return (
    <div>
      {words.map((word, index) => {
        const videoId = getYouTubeVideoId(word);
        console.log('Word:', word, 'Video ID:', videoId); // Debug log
        if (videoId) {
          return (
            <div key={index} className="my-4">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          );
        }
        return <span key={index}>{word} </span>;
      })}
    </div>
  );
}

export default function TweetsPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [newTweet, setNewTweet] = useState('');
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState('light');
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      router.push('/');
    } else {
      setUsername(storedUsername);
      fetchTweets();
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, [router]);

  const fetchTweets = async () => {
    const response = await fetch('/api/tweets');
    const data = await response.json();
    console.log('Fetched tweets:', data); // Debug log
    setTweets(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTweet.trim()) {
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newTweet.trim(), username }),
      });

      if (response.ok) {
        setNewTweet('');
        fetchTweets();
      }
    }
  };

  const handleLike = async (id: number) => {
    const response = await fetch('/api/tweets', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, username }),
    });

    if (response.ok) {
      fetchTweets();
    }
  };

  const isLikedByUser = (tweet: Tweet) => {
    return tweet.likes.some(like => like.username === username);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    router.push('/');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Tweets</h1>
          <div className="space-x-4">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
            >
              Sair
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newTweet}
            onChange={(e) => setNewTweet(e.target.value)}
            placeholder="O que está acontecendo?"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={3}
            required
          />
          <button
            type="submit"
            className="mt-4 px-6 py-3 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Tweetar
          </button>
        </form>
        <div className="space-y-6">
          {tweets.map((tweet) => (
            <div key={tweet.id} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
              <p className="font-bold text-gray-800 dark:text-white mb-2">{tweet.username}</p>
              <div className="text-gray-600 dark:text-gray-300 mb-4">
                <TweetContent content={tweet.content} />
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleLike(tweet.id)}
                  className={`flex items-center space-x-2 ${isLikedByUser(tweet) ? 'text-blue-500' : 'text-gray-500'
                    } hover:text-blue-600 transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{tweet.likes.length}</span>
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(tweet.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}