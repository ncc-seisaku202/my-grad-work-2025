import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';

const PredictionListPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 球団IDから球団名へのマッピング
  const teamNames = {
    'giants': '読売ジャイアンツ',
    'tigers': '阪神タイガース',
    'carp': '広島東洋カープ',
    'baystars': '横浜DeNAベイスターズ',
    'swallows': '東京ヤクルトスワローズ',
    'dragons': '中日ドラゴンズ'
  };

  // 予想データを取得
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const { data, error } = await supabase
          .from('predictions')
          .select('*, profiles(username)')
          .eq('league', 'central')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching predictions:', error);
          setError('予想データの取得に失敗しました');
          return;
        }

        setPredictions(data || []);
      } catch (err) {
        console.error('Error:', err);
        setError('予想データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  // 順位予想を表示用にフォーマット
  const formatRankings = (rankingsJson) => {
    try {
      const rankings = JSON.parse(rankingsJson);
      return rankings.map((teamId, index) => ({
        rank: index + 1,
        teamName: teamNames[teamId] || teamId
      }));
    } catch (error) {
      console.error('Error parsing rankings:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          予想データを読み込み中...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        みんなの順位予想
      </Typography>
      
      {predictions.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            まだ予想が投稿されていません
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {predictions.map((prediction) => (
            <Grid item xs={12} md={6} lg={4} key={prediction.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {prediction.profiles?.username || 'Unknown User'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {prediction.season}年 セ・リーグ
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      順位予想:
                    </Typography>
                    {formatRankings(prediction.rankings).map((item) => (
                      <Typography 
                        key={item.rank} 
                        variant="body2" 
                        sx={{ mb: 0.5 }}
                      >
                        {item.rank}位: {item.teamName}
                      </Typography>
                    ))}
                  </Box>
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ mt: 2, display: 'block' }}
                  >
                    投稿日: {new Date(prediction.created_at).toLocaleDateString('ja-JP')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default PredictionListPage;