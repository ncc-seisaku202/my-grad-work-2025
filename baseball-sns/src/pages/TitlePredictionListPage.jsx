import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Card,
  CardContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { supabase } from '../lib/supabaseClient';

// タイトル名の日本語マッピング
const titleNames = {
  mvp: 'MVP',
  rookie: '新人王',
  batting_champion: '首位打者',
  home_run_king: 'ホームラン王',
  rbi_king: '打点王',
  stolen_base_king: '盗塁王',
  era_champion: '防御率王',
  wins_leader: '最多勝',
  saves_leader: '最多セーブ'
};

const TitlePredictionListPage = () => {
  // State定義
  const [allPredictions, setAllPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  // データ取得
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const { data, error } = await supabase
          .from('title_predictions')
          .select('*, profiles(username)')
          .eq('season', 2026);

        if (error) {
          console.error('Error fetching title predictions:', error);
          return;
        }

        setAllPredictions(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  // データの整形（ユーザーごと、リーグごとにグループ化）
  const groupedPredictions = useMemo(() => {
    return allPredictions.reduce((acc, prediction) => {
      const userId = prediction.user_id;
      const league = prediction.league;
      const titleName = prediction.title_name;
      const playerName = prediction.player_name;
      const username = prediction.profiles?.username || '不明なユーザー';

      // ユーザーが存在しない場合は初期化
      if (!acc[userId]) {
        acc[userId] = {
          username: username,
          central: {},
          pacific: {}
        };
      }

      // リーグごとにタイトル予想を格納
      if (league === 'central' || league === 'pacific') {
        acc[userId][league][titleName] = playerName;
      }

      return acc;
    }, {});
  }, [allPredictions]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          個人タイトル予想一覧
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        個人タイトル予想一覧
      </Typography>

      <Box sx={{ mt: 4 }}>
        {Object.entries(groupedPredictions).length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              まだ予想が投稿されていません
            </Typography>
          </Paper>
        ) : (
          Object.entries(groupedPredictions).map(([userId, userPredictions]) => (
            <Card key={userId} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {userPredictions.username}の予想
                </Typography>

                {/* セ・リーグのアコーディオン */}
                <Accordion sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">セ・リーグ</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {Object.keys(userPredictions.central).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          予想なし
                        </Typography>
                      ) : (
                        Object.entries(userPredictions.central).map(([titleKey, playerName]) => (
                          <Box key={titleKey} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {titleNames[titleKey] || titleKey}:
                            </Typography>
                            <Typography variant="body2">
                              {playerName}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* パ・リーグのアコーディオン */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">パ・リーグ</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {Object.keys(userPredictions.pacific).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          予想なし
                        </Typography>
                      ) : (
                        Object.entries(userPredictions.pacific).map(([titleKey, playerName]) => (
                          <Box key={titleKey} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {titleNames[titleKey] || titleKey}:
                            </Typography>
                            <Typography variant="body2">
                              {playerName}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Container>
  );
};

export default TitlePredictionListPage;