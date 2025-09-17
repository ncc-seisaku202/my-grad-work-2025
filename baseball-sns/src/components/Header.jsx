import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Header = () => {
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
          <Button color="inherit" component={RouterLink} to="/login">
            ログイン
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
