import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const PostForm = ({ onPostSuccess }) => {
  const { session } = useAuth();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase.from('tags').select('*');
        if (error) {
          console.error('タグの取得に失敗しました:', error);
        } else {
          setTags(data || []);
        }
      } catch (error) {
        console.error('タグの取得中にエラーが発生しました:', error);
      }
    };

    fetchTags();
  }, []);

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
        user_id: session.user.id,
        tag_id: selectedTagId
      }]);
      setContent('');
      setSelectedTagId('');
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
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="tag-select-label">タグを選択</InputLabel>
        <Select
          labelId="tag-select-label"
          value={selectedTagId}
          label="タグを選択"
          onChange={(e) => setSelectedTagId(e.target.value)}
        >
          {tags.map((tag) => (
            <MenuItem key={tag.id} value={tag.id}>
              {tag.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button 
          type="submit" 
          variant="contained" 
          startIcon={<SportsBaseballIcon />}
          disabled={isLoading || !content.trim() || !selectedTagId}
        >
          {isLoading ? '投稿中...' : '投稿する'}
        </Button>
      </Box>
    </Box>
  );
};

export default PostForm;
