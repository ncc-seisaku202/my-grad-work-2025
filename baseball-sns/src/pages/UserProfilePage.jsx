import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  ButtonGroup
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import UserPostList from '../components/UserPostList';
import { Link as RouterLink } from 'react-router-dom';

const UserProfilePage = () => {
  const { userId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState(null);
  const [totalHighlights, setTotalHighlights] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    else {
      console.log("useEffect is running with userId:", userId);
    }
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        console.log("Calling supabase.rpc with arguments:", { user_id_input: userId });
        
        const { data, error } = await supabase.rpc('get_user_profile_and_posts', {
          user_id_input: userId
        });
        
        if (error) {
          console.error('Error fetching user data:', error);
        } else {
          setProfile(data.profile);
          setUserPosts(data.posts || []);
        }

        // 総ハイライト数、フォロワー数、フォロー数を並行取得
        try {
          const [highlightResult, followerResult, followingResult] = await Promise.all([
            supabase.rpc('get_total_highlights_for_user', { user_id_input: userId }),
            supabase.rpc('get_follower_count', { user_id_input: userId }),
            supabase.rpc('get_following_count', { user_id_input: userId })
          ]);

          if (highlightResult.error) throw highlightResult.error;
          if (followerResult.error) throw followerResult.error;
          if (followingResult.error) throw followingResult.error;
          
          setTotalHighlights(highlightResult.data || 0);
          setFollowerCount(followerResult.data || 0);
          setFollowingCount(followingResult.data || 0);
        } catch (error) {
          console.error('Error fetching counts:', error);
        }

        // フォロー状態を確認
        if (session && session.user.id !== userId) {
          try {
            const { count, error: followError } = await supabase
              .from('follows')
              .select('*', { count: 'exact' })
              .eq('follower_id', session.user.id)
              .eq('following_id', userId);

            if (followError) throw followError;
            
            setIsFollowing(count > 0);
          } catch (followError) {
            console.error('Error checking follow status:', followError);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, session]);

  // フォロー関数
  const handleFollow = async () => {
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: session.user.id,
          following_id: userId
        });

      if (error) throw error;
      
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  // アンフォロー関数
  const handleUnfollow = async () => {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', session.user.id)
        .eq('following_id', userId);

      if (error) throw error;
      
      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  // 自分のプロフィールかどうかを判定
  const isOwnProfile = session && session.user.id === userId;

  // 表示用にソート済みの投稿データを作成
  const sortedPosts = useMemo(() => {
    if (!userPosts) return [];
    
    const posts = [...userPosts];
    
    if (sortBy === 'highlight_count') {
      return posts.sort((a, b) => (b.highlight_count || 0) - (a.highlight_count || 0));
    } else {
      // デフォルトは created_at で降順ソート
      return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }, [userPosts, sortBy]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // プロフィールが見つからない場合
  if (!loading && !profile) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            ユーザーが見つかりません
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            このユーザーは存在しません。
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
          >
            ホームページに戻る
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* プロフィール情報エリア */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {profile?.username || '匿名ユーザー'}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              応援チーム: {profile?.favorite_team || '未設定'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <StarIcon sx={{ color: '#FFD700', mr: 0.5 }} />
              <Typography variant="body1" color="text.secondary">
                総ハイライト: {totalHighlights}
              </Typography>
            </Box>
            {profile?.bio && (
              <Typography variant="body2" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                {profile.bio}
              </Typography>
            )}
            
            {/* フォロー数とフォロワー数 */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>{followingCount}</strong> フォロー
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{followerCount}</strong> フォロワー
              </Typography>
            </Box>
          </Box>
          
          {/* ボタンエリア */}
          <Box>
            {isOwnProfile ? (
              <Button
                variant="outlined"
                onClick={() => navigate('/profile')}
              >
                プロフィールを編集
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "outlined" : "contained"}
                onClick={isFollowing ? handleUnfollow : handleFollow}
              >
                {isFollowing ? "フォロー中" : "フォローする"}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* 投稿一覧エリア */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            投稿一覧
          </Typography>
          <ButtonGroup variant="outlined" size="small">
            <Button
              variant={sortBy === 'created_at' ? 'contained' : 'outlined'}
              onClick={() => setSortBy('created_at')}
            >
              新着順
            </Button>
            <Button
              variant={sortBy === 'highlight_count' ? 'contained' : 'outlined'}
              onClick={() => setSortBy('highlight_count')}
            >
              ハイライト順
            </Button>
          </ButtonGroup>
        </Box>
        <UserPostList posts={sortedPosts} />
      </Box>
    </Container>
  );
};

export default UserProfilePage;