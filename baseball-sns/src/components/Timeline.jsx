import React from 'react';

const Timeline = ({ posts }) => {
  return (
    <div>
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <p key={post.id}>{post.content}</p>
        ))
      ) : (
        <p>投稿はまだありません</p>
      )}
    </div>
  );
};

export default Timeline;
