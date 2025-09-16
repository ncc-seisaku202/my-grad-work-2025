import React, { useState } from 'react';

const PostForm = () => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(content);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        placeholder="野球について投稿してみましょう..."
        rows="4"
        cols="50"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <br />
      <button type="submit">
        投稿する
      </button>
    </form>
  );
};

export default PostForm;
