import React, { useState, useEffect } from 'react'
import { Container } from '@mui/material'
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Header />
      <PostForm />
      <Timeline posts={posts} />
    </Container>
  )
}

export default App
