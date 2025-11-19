import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Header = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6">
            野球SNS
          </Typography>
        </RouterLink>
        <Box sx={{ flexGrow: 1 }} />
        <Box>
          {session ? (
            <>
              <Button color="inherit" component={RouterLink} to="/predictions/new">
                順位予想
              </Button>
              <Button color="inherit" component={RouterLink} to="/predictions/titles">
                個人タイトル予想
              </Button>
              <Button color="inherit" component={RouterLink} to="/predictions/titles/all">
                タイトル予想一覧
              </Button>
              <Button color="inherit" component={RouterLink} to="/predictions">
                みんなの順位予想
              </Button>
              <Button color="inherit" component={RouterLink} to="/profile">
                プロフィール
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                ログアウト
              </Button>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              ログイン
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
