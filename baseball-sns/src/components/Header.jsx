import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          野球SNS
        </Typography>
        <Box>
          {/* 将来のナビゲーションボタン用 */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
