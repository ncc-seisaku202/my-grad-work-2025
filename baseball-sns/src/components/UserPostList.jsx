import React from 'react';
import { Typography } from '@mui/material';
import PostCard from './PostCard';

const UserPostList = ({ posts }) => {
  // postsが存在しないか、空の配列の場合
  if (!posts || posts.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
        このユーザーの投稿はまだありません
      </Typography>
    );
  }

  // 受け取ったposts配列をmapでループ処理し、PostCardコンポーネントをリスト表示
  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} showUserInfo={false} />
      ))}
    </>
  );
};

export default UserPostList;