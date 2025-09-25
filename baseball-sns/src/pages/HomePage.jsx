import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import PostForm from '../components/PostForm';
import Timeline from '../components/Timeline';
import { Container } from '@mui/material';


const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    fetchPosts();
  }, [sortBy, selectedTeam, filter]);

  const fetchPosts = async () => {
    try {
      let query;

      if (selectedTeam) {
        // 球団が選択されている場合
        query = supabase.rpc('filter_posts_by_team', { team_name: selectedTeam });
      } else {
        // すべての球団が選択されている場合
        query = supabase.rpc('get_posts_with_details');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      let processedData = data;

      // 期間フィルター処理（JavaScriptで実行）
      if (filter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        processedData = processedData.filter(post => new Date(post.created_at) >= today);
      } else if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        processedData = processedData.filter(post => new Date(post.created_at) >= weekAgo);
      }

      // ソート処理（JavaScriptで実行）
      processedData = processedData.sort((a, b) => {
        if (sortBy === 'created_at') {
          return new Date(b.created_at) - new Date(a.created_at);
        } else if (sortBy === 'highlight_count') {
          return (b.highlight_count || 0) - (a.highlight_count || 0);
        }
        return 0;
      });

      setPosts(processedData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <PostForm onPostSuccess={fetchPosts} />
      <Timeline
        posts={posts}
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
    </Container>
  );
};

export default HomePage;
