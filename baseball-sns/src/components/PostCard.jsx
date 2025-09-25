import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, CardActions, IconButton, Badge } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post }) => {
  const [highlightCount, setHighlightCount] = useState(post.highlight_count || 0);
  const [isHighlighted, setIsHighlighted] = useState(post.is_highlighted_by_user || false);
  const { session } = useAuth();

  const handleHighlight = async () => {
    if (!session?.user?.id) return;

    try {
      if (!isHighlighted) {
        // ハイライトを追加
        const { error } = await supabase
          .from('highlights')
          .insert({ user_id: session.user.id, post_id: post.id });

        if (!error) {
          setHighlightCount(prev => prev + 1);
          setIsHighlighted(!isHighlighted);
        }
      } else {
        // ハイライトを削除
        const { error } = await supabase
          .from('highlights')
          .delete()
          .eq('user_id', session.user.id)
          .eq('post_id', post.id);

        if (!error) {
          setHighlightCount(prev => prev - 1);
          setIsHighlighted(!isHighlighted);
        }
      }
    } catch (error) {
      if (error.code === '23505') {
        // ユニーク制約違反 = すでにハイライト済み
        // ハイライトを削除
        const { error: deleteError } = await supabase
          .from('highlights')
          .delete()
          .eq('user_id', session.user.id)
          .eq('post_id', post.id);

        if (!deleteError) {
          setHighlightCount(prev => prev - 1);
          setIsHighlighted(!isHighlighted);
        }
      } else {
        console.error('Error handling highlight:', error);
      }
    }
  };
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* ユーザー情報エリア */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography fontWeight="bold">
            {post.profiles?.username || '匿名ユーザー'}
          </Typography>
          <Chip
            label={post.profiles?.favorite_team || '未設定'}
            size="small"
            sx={{ ml: 1 }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ml: 'auto' }}
          >
            {post.created_at}
          </Typography>
        </Box>

        {/* 投稿本文エリア */}
        <Typography sx={{ mt: 1 }}>
          {post.content}
        </Typography>
        
        {/* タグ表示エリア */}
        {post.tags && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label={post.tags.name || ''}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>
        )}
      </CardContent>

      {/* アクションボタンエリア */}
      <CardActions>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={handleHighlight}
            color={isHighlighted ? 'primary' : 'default'}
            disabled={!session?.user?.id}
          >
            <Badge badgeContent={highlightCount} color="primary">
              {isHighlighted ? <StarIcon /> : <StarBorderIcon />}
            </Badge>
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default PostCard;
