import React from 'react';
import { Card, CardContent, Typography, Box, Chip, CardActions } from '@mui/material';

const PostCard = ({ post }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* ユーザー情報エリア */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography fontWeight="bold">
            {post?.profiles?.username || '匿名ユーザー'}
          </Typography>
          <Chip
            label={post?.profiles?.favorite_team || '未設定'}
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
      </CardContent>

      {/* アクションボタンエリア（将来用） */}
      <CardActions>
        <Box>
          {/* 将来のアクションボタン用 */}
        </Box>
      </CardActions>
    </Card>
  );
};

export default PostCard;
