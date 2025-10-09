import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const MAX_BIO_LENGTH = 200;

const ProfilePage = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
      const { user } = session;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, favorite_team, bio')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUsername(data.username || '');
          setFavoriteTeam(data.favorite_team || '');
          setBio(data.bio || '');
        }
      } catch (error) {
        console.error('プロフィール取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      getProfile();
    }
  }, [session]);

  const handleUpdate = async () => {
    const { user } = session;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username,
          favorite_team: favoriteTeam,
          bio: bio,
          updated_at: new Date()
        });

      if (error) throw error;

      alert('プロフィールを更新しました！');
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      alert('プロフィールの更新に失敗しました。');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          プロフィール設定
        </Typography>

        <TextField
          label="表示名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          variant="outlined"
        />

        <FormControl fullWidth>
          <InputLabel id="favorite-team-label">応援球団</InputLabel>
          <Select
            labelId="favorite-team-label"
            id="favorite-team-select"
            value={favoriteTeam}
            onChange={(e) => setFavoriteTeam(e.target.value)}
            label="応援球団"
          >
            <MenuItem value="">選択してください</MenuItem>
            <MenuItem value="giants">読売ジャイアンツ</MenuItem>
            <MenuItem value="tigers">阪神タイガース</MenuItem>
            <MenuItem value="carp">広島東洋カープ</MenuItem>
            <MenuItem value="dragons">中日ドラゴンズ</MenuItem>
            <MenuItem value="swallows">東京ヤクルトスワローズ</MenuItem>
            <MenuItem value="baystars">横浜DeNAベイスターズ</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="自己紹介"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          inputProps={{ maxLength: MAX_BIO_LENGTH }}
          helperText={`${bio.length}/${MAX_BIO_LENGTH}`}
          error={bio.length > MAX_BIO_LENGTH}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          sx={{ alignSelf: 'flex-start' }}
        >
          更新
        </Button>
      </Box>
    </Container>
  );
};

export default ProfilePage;