import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const PostForm = ({ onPostSuccess }) => {
  const { session } = useAuth();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session) {
      alert('ログインしてください');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await supabase.from('posts').insert([{
        content: content,
        user_id: session.user.id
      }]);
      setContent('');
      if (onPostSuccess) {
        onPostSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        label="いまどうしてる？"
        multiline
        rows={4}
        fullWidth
        value={content}
        onChange={(e) => setContent(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button 
          type="submit" 
          variant="contained" 
          startIcon={<SportsBaseballIcon />}
          disabled={isLoading || !content.trim()}
        >
          {isLoading ? '投稿中...' : '投稿する'}
        </Button>
      </Box>
    </Box>
  );
};

export default PostForm;
