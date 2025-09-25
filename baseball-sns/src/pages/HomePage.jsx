import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import PostForm from '../components/PostForm';
import Timeline from '../components/Timeline';
import { Container } from '@mui/material';


const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('post_highlights_view')
        .select('*, profiles ( username, favorite_team ), tags ( * )')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <PostForm onPostSuccess={fetchPosts} />
      <Timeline posts={posts} selectedTeam={selectedTeam} onTeamChange={setSelectedTeam} filter={filter} onFilterChange={setFilter} />
    </Container>
  );
};

export default HomePage;
