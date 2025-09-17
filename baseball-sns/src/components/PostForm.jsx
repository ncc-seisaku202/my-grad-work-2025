import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import { supabase } from '../lib/supabaseClient';

const PostForm = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await supabase.from('posts').insert([{ content: content }]);
      setContent('');
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
