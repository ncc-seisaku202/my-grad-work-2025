import React from 'react';
import { Box, Typography } from '@mui/material';
import PostCard from './PostCard';

const Timeline = ({ posts }) => {
  return (
    <Box>
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <Typography>投稿はまだありません</Typography>
      )}
    </Box>
  );
};

export default Timeline;
