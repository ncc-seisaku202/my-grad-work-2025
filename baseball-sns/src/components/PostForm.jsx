import React, { useState } from 'react';
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
    <form onSubmit={handleSubmit}>
      <textarea 
        placeholder="野球について投稿してみましょう..."
        rows="4"
        cols="50"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <br />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '投稿中...' : '投稿する'}
      </button>
    </form>
  );
};

export default PostForm;
