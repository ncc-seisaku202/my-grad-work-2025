import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';
import UserPostList from '../components/UserPostList';

const UserProfilePage = () => {
  const { userId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState(null);
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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
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
        <Typography variant="h6" gutterBottom>
          投稿一覧
        </Typography>
        <UserPostList posts={userPosts} />
      </Box>
    </Container>
  );
};

export default UserProfilePage;