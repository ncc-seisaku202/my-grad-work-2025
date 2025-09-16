import React from 'react';

const PostForm = () => {
  return (
    <form>
      <textarea 
        placeholder="野球について投稿してみましょう..."
        rows="4"
        cols="50"
      />
      <br />
      <button type="submit">
        投稿する
      </button>
    </form>
  );
};

export default PostForm;
