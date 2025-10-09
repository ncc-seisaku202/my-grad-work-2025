import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => {
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
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          お探しのページは見つかりませんでした。
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
};

export default NotFoundPage;