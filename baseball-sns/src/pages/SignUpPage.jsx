import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'パスワードは8文字以上で、大文字、小文字、数字をそれぞれ1文字以上含めてください';
    }
    if (!/[A-Z]/.test(password)) {
      return 'パスワードは8文字以上で、大文字、小文字、数字をそれぞれ1文字以上含めてください';
    }
    if (!/[a-z]/.test(password)) {
      return 'パスワードは8文字以上で、大文字、小文字、数字をそれぞれ1文字以上含めてください';
    }
    if (!/[0-9]/.test(password)) {
      return 'パスワードは8文字以上で、大文字、小文字、数字をそれぞれ1文字以上含めてください';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // パスワードバリデーション
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username
          }
        }
      });
      if (error) throw error;
      alert('登録が完了しました。ログインページに移動します。');
      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          新規登録
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="表示名"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="メールアドレス"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="パスワード"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(validatePassword(e.target.value));
            }}
            error={!!passwordError}
            helperText={passwordError}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            登録する
          </Button>
          <Link component={RouterLink} to="/login" variant="body2">
            すでにアカウントをお持ちの方はこちら
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUpPage;