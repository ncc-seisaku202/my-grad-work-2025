import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Accordion, AccordionSummary, AccordionDetails, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

// 予想対象となるタイトルのリスト
const titles = [
  { key: 'mvp', name: 'MVP' },
  { key: 'rookie', name: '新人王' },
  { key: 'batting_champion', name: '首位打者' },
  { key: 'home_run_king', name: 'ホームラン王' },
  { key: 'rbi_king', name: '打点王' },
  { key: 'stolen_base_king', name: '盗塁王' },
  { key: 'era_champion', name: '防御率王' },
  { key: 'wins_leader', name: '最多勝' },
  { key: 'saves_leader', name: '最多セーブ' }
];

const TitlePredictionPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  // State定義
  const [predictions, setPredictions] = useState({
    central: {
      mvp: '',
      rookie: '',
      batting_champion: '',
      home_run_king: '',
      rbi_king: '',
      stolen_base_king: '',
      era_champion: '',
      wins_leader: '',
      saves_leader: ''
    },
    pacific: {
      mvp: '',
      rookie: '',
      batting_champion: '',
      home_run_king: '',
      rbi_king: '',
      stolen_base_king: '',
      era_champion: '',
      wins_leader: '',
      saves_leader: ''
    }
  });

  const [loading, setLoading] = useState(true);

  // データ読み込み
  useEffect(() => {
    const fetchMyTitlePredictions = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('title_predictions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('season', 2026);

        if (error) {
          console.error('Error fetching title predictions:', error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // 取得したデータを元にpredictions stateを更新
          const updatedPredictions = { ...predictions };
          
          data.forEach(prediction => {
            const league = prediction.league; // 'central' or 'pacific'
            const titleKey = prediction.title_name;
            const playerName = prediction.player_name;
            
            if (updatedPredictions[league] && Object.prototype.hasOwnProperty.call(updatedPredictions[league], titleKey)) {
              updatedPredictions[league][titleKey] = playerName;
            }
          });

          setPredictions(updatedPredictions);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTitlePredictions();
  }, [session?.user?.id]);

  // 入力値変更ハンドラ
  const handleChange = (league, titleKey, value) => {
    setPredictions(prev => ({
      ...prev,
      [league]: {
        ...prev[league],
        [titleKey]: value
      }
    }));
  };

  // 予想保存ハンドラ
  const handleSubmit = async () => {
    if (!session) {
      alert('ログインが必要です。');
      return;
    }

    const dataToUpsert = [];
    const season = 2026; // シーズンを定義

    // predictions stateをループして、upsert用のデータ形式に変換
    for (const league of ['central', 'pacific']) {
      for (const titleKey of Object.keys(predictions[league])) {
        const playerName = predictions[league][titleKey];
        
        // 選手名が入力されている予想のみを対象にする
        if (playerName && playerName.trim() !== '') {
          dataToUpsert.push({
            user_id: session.user.id,
            season: season,
            league: league,
            title_name: titleKey,
            player_name: playerName.trim(),
          });
        }
      }
    }

    // デバッグ用ログ
    console.log("Data to be upserted:", dataToUpsert);

    if (dataToUpsert.length === 0) {
      alert('少なくとも1つ以上の予想を入力してください。');
      return;
    }

    try {
      const { error } = await supabase.from('title_predictions').upsert(dataToUpsert, {
        onConflict: 'user_id, season, league, title_name' // ユニーク制約に違反した場合は更新
      });
      if (error) throw error;
      
      alert('予想を保存しました！');
      navigate('/predictions/titles/all'); // 個人タイトル予想一覧ページに遷移
    } catch (error) {
      console.error('Error saving title predictions:', error);
      alert('予想の保存に失敗しました。');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          個人タイトル予想
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>読み込み中...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        個人タイトル予想
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        {/* セ・リーグのアコーディオン */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">セ・リーグ</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {titles.map((title) => (
                <TextField
                  key={`central-${title.key}`}
                  label={title.name}
                  value={predictions.central[title.key]}
                  onChange={(e) => handleChange('central', title.key, e.target.value)}
                  variant="outlined"
                  fullWidth
                  placeholder="選手名を入力してください"
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* パ・リーグのアコーディオン */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">パ・リーグ</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {titles.map((title) => (
                <TextField
                  key={`pacific-${title.key}`}
                  label={title.name}
                  value={predictions.pacific[title.key]}
                  onChange={(e) => handleChange('pacific', title.key, e.target.value)}
                  variant="outlined"
                  fullWidth
                  placeholder="選手名を入力してください"
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          sx={{ px: 4, py: 2 }}
        >
          予想を決定する
        </Button>
      </Box>
    </Container>
  );
};

export default TitlePredictionPage;