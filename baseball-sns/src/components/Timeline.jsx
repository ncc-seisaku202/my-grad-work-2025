import React from 'react';
import { Box, Typography, ButtonGroup, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import PostCard from './PostCard';

const Timeline = ({ posts, selectedTeam, onTeamChange, filter, onFilterChange }) => {

  return (
    <Box>
      {posts && posts.length > 0 ? (
        <>
          {/* ソートとフィルターの操作UI */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            {/* 左側: ソートボタン群 */}
            <ButtonGroup variant="outlined" size="small">
              <Button onClick={() => console.log('Sort by: Newest')}>新着順</Button>
              <Button onClick={() => console.log('Sort by: Highlights')}>ハイライト順</Button>
            </ButtonGroup>
            
            {/* 中央: 球団で絞り込み */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="team-select-label" shrink>球団で絞り込み</InputLabel>
              <Select 
                labelId="team-select-label"
                id="team-select"
                value={selectedTeam} 
                onChange={(e) => {
                  console.log('Selected Team:', e.target.value);
                  onTeamChange(e.target.value);
                }}
                label="球団で絞り込み"
                displayEmpty
              >
                <MenuItem value="">すべての球団</MenuItem>
                <MenuItem value="giants">読売ジャイアンツ</MenuItem>
                <MenuItem value="tigers">阪神タイガース</MenuItem>
                <MenuItem value="carp">広島東洋カープ</MenuItem>
                <MenuItem value="dragons">中日ドラゴンズ</MenuItem>
                <MenuItem value="swallows">東京ヤクルトスワローズ</MenuItem>
                <MenuItem value="baystars">横浜DeNAベイスターズ</MenuItem>
              </Select>
            </FormControl>
            
            {/* 右側: フィルター選択 */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="filter-select-label" shrink>フィルター</InputLabel>
              <Select 
                labelId="filter-select-label"
                id="filter-select"
                value={filter}
                onChange={(e) => {
                  console.log('Selected Filter:', e.target.value);
                  onFilterChange(e.target.value);
                }}
                label="フィルター"
                displayEmpty
              >
                <MenuItem value="all">すべて</MenuItem>
                <MenuItem value="today">今日</MenuItem>
                <MenuItem value="week">今週</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 投稿リスト */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </>
      ) : (
        <Typography>投稿はまだありません</Typography>
      )}
    </Box>
  );
};

export default Timeline;
