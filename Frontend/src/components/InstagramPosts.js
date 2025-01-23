import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './InstagramPosts.css'; // Import CSS file for styling

const InstagramPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const response = await axios.get('/api/instagram-posts'); // Your backend endpoint
        setPosts(response.data.posts);
      } catch (error) {
        setError('Error fetching Instagram posts');
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, []);

  return (
    <div className="instagram-posts-container">
      {loading && <p>Loading Instagram posts...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && posts.length > 0 && (
        <div className="posts-list">
          {posts.map((post, index) => (
            <div key={index} className="post-card">
              {post.media_url && (
                <img src={post.media_url} alt={post.caption} className="post-image" />
              )}
              <p className="post-caption">{post.caption}</p>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && posts.length === 0 && <p>No Instagram posts found.</p>}
    </div>
  );
};

export default InstagramPosts;
