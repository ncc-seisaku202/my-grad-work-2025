import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import PostForm from './components/PostForm'
import Timeline from './components/Timeline'
import { supabase } from './lib/supabaseClient'

function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        setPosts(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Header />
      <PostForm />
      <Timeline posts={posts} />
    </>
  )
}

export default App
