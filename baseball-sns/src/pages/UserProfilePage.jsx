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

        // 総ハイライト数を取得
        try {
          const { data: highlightData, error: highlightError } = await supabase.rpc('get_total_highlights_for_user', {
            user_id_input: userId
          });

          if (highlightError) throw highlightError;
          
          setTotalHighlights(highlightData || 0);
        } catch (highlightError) {
          console.error('Error in highlight calculation:', highlightError);
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

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
              // 将来のフォローボタン用プレースホルダー
              <Box />
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