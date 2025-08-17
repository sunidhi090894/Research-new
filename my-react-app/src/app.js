import React, { useState, useEffect } from 'react';

// Main App component
export default function App() {
  const [videos, setVideos] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Define the URL of your Flask backend
  const FLASK_API_URL = 'http://127.0.0.1:3005';

  // Fetch the initial list of videos from the Flask backend on component mount
  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch(`${FLASK_API_URL}/api/recommendations`);
        if (!response.ok) {
          throw new Error('Failed to fetch videos from the backend.');
        }
        const videoData = await response.json();
        setVideos(videoData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching initial videos:", err);
      }
    }
    fetchVideos();
  }, []);

  // Function to fetch recommendations for a specific video
  const fetchRecommendations = async (videoId) => {
    setLoading(true);
    setSelectedVideo(videoId);
    setRecommendedVideos([]);
    try {
      const response = await fetch(`${FLASK_API_URL}/api/recommendations`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations.');
      }
      const data = await response.json();
      setRecommendedVideos(data);
      if (data.length > 0) {
        // Scroll to the recommendations section after loading
        const recSection = document.getElementById('recommendations-section');
        if (recSection) {
          recSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Component to render a single video card
  const VideoCard = ({ video, onClick, isSelected }) => (
    <div
      onClick={() => onClick(video.id)}
      className={`relative rounded-xl cursor-pointer overflow-hidden transform transition-all duration-300
                  ${isSelected ? 'ring-4 ring-indigo-500 ring-offset-2 ring-offset-gray-900' : 'hover:scale-105 hover:shadow-2xl'}`}
    >
      <img
        src={video.imageUrl.replace('1280x720', '480x270')}
        alt={video.title}
        className="w-full h-40 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
      <div className="absolute bottom-0 left-0 p-3 w-full text-white">
        <h3 className="font-semibold text-sm leading-tight mb-1">{video.title}</h3>
        <p className="text-xs text-gray-300">By: {video.channelName}</p>
      </div>
    </div>
  );

  // Component to render a recommended video card
  const RecommendationCard = ({ video }) => (
    <div className="rounded-xl overflow-hidden shadow-lg bg-gray-800 transition-shadow duration-300 hover:shadow-xl">
      <img
        src={video.imageUrl}
        alt={video.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-md font-semibold text-white mb-1 leading-tight">{video.title}</h3>
        <p className="text-sm text-gray-400">By: {video.channelName}</p>
        <p className="text-xs text-gray-500 mt-2">Views: {video.views}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 font-sans antialiased">
      <header className="bg-gray-800 shadow-md p-4 sticky top-0 z-50">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-center text-white">Video Recommendation System</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && <div className="bg-red-500 text-white p-4 rounded-lg mb-6">{error}</div>}

        <section id="main-videos" className="mb-12">
          <h2 className="text-xl font-bold mb-6 text-center text-gray-200">
            Select a video to get recommendations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.length > 0 ? (
              videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={fetchRecommendations}
                  isSelected={selectedVideo === video.id}
                />
              ))
            ) : (
              <p className="text-center col-span-full">Loading videos...</p>
            )}
          </div>
        </section>

        {selectedVideo && (
          <section id="recommendations-section" className="pt-12 border-t border-gray-700">
            <h2 className="text-xl font-bold mb-6 text-center text-gray-200">
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p className="text-center text-gray-400 col-span-full">Loading recommendations...</p>
              ) : recommendedVideos.length > 0 ? (
                recommendedVideos.map((video) => (
                  <RecommendationCard key={video.id} video={video} />
                ))
              ) : (
                <p className="text-center text-gray-400 col-span-full">No similar videos found.</p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}