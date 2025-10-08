import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, CardActions, IconButton, Badge } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const MotionIconButton = motion(IconButton);

const PostCard = ({ post, showUserInfo = true }) => {
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
        {showUserInfo && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <RouterLink
              to={`/users/${post.user_id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Typography fontWeight="bold">
                {post.profiles?.username || '匿名ユーザー'}
              </Typography>
            </RouterLink>
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
        )}

        {/* 投稿本文エリア */}
        <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
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
          <MotionIconButton
            onClick={handleHighlight}
            color={isHighlighted ? 'primary' : 'default'}
            disabled={!session?.user?.id}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Badge badgeContent={highlightCount} color="primary">
              {isHighlighted ? <StarIcon /> : <StarBorderIcon />}
            </Badge>
          </MotionIconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default PostCard;
