import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

// ドラッグ可能な球団コンポーネント
const DraggableTeam = ({ team }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: team.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      sx={{
        padding: '10px',
        marginBottom: '8px',
        cursor: 'grab',
        backgroundColor: 'grey.800',
        '&:hover': {
          backgroundColor: 'grey.700',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      {team.name}
    </Paper>
  );
};

// ドロップ可能な順位枠コンポーネント
const DroppableRank = ({ rank, rankedTeams }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `rank-${rank}`,
  });

  // この順位に配置されている球団を取得
  const teamAtRank = rankedTeams.find(item => item.rank === rank);

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        padding: '16px',
        marginBottom: '8px',
        minHeight: '60px',
        border: '2px dashed',
        borderColor: isOver ? 'primary.main' : (teamAtRank ? 'success.main' : 'grey.700'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isOver ? 'primary.dark' : (teamAtRank ? 'success.dark' : 'grey.900'),
        flexDirection: teamAtRank ? 'column' : 'row',
      }}
    >
      {!teamAtRank && (
        <Typography variant="body2" color="text.secondary">
          {rank}位
        </Typography>
      )}
      {teamAtRank && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {rank}位
          </Typography>
          <DraggableTeam team={teamAtRank.team} />
        </>
      )}
    </Paper>
  );
};

// 球団リストに戻すためのドロップエリア
const DroppableTeamList = ({ children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'team-list',
  });

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        p: 2,
        minHeight: 400,
        backgroundColor: isOver ? '#f3e5f5' : 'white',
        border: isOver ? '2px solid #9c27b0' : '1px solid #e0e0e0',
      }}
    >
      {children}
    </Paper>
  );
};

const PredictionPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  // セ・リーグ6球団のデータ
  const centralLeagueTeams = [
    { id: 'giants', name: '読売ジャイアンツ' },
    { id: 'tigers', name: '阪神タイガース' },
    { id: 'carp', name: '広島東洋カープ' },
    { id: 'baystars', name: '横浜DeNAベイスターズ' },
    { id: 'swallows', name: '東京ヤクルトスワローズ' },
    { id: 'dragons', name: '中日ドラゴンズ' }
  ];

  // State定義
  const [unrankedTeams, setUnrankedTeams] = useState(centralLeagueTeams);
  const [rankedTeams, setRankedTeams] = useState([]);

  // 6位まで埋まっているかチェック
  const isComplete = rankedTeams.length === 6;

  // 既存の予想データを取得
  useEffect(() => {
    const fetchMyPredictions = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('predictions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('season', 2026)
          .eq('league', 'central');

        if (error) {
          console.error('Error fetching predictions:', error);
          return;
        }

        if (data && data.length > 0) {
          const prediction = data[0];
          const rankingsData = JSON.parse(prediction.rankings);
          
          // 球団IDから球団オブジェクトを取得するマッピング
          const teamMap = {};
          centralLeagueTeams.forEach(team => {
            teamMap[team.id] = team;
          });

          // rankedTeamsを復元
          const restoredRankedTeams = rankingsData.map((teamId, index) => ({
            rank: index + 1,
            team: teamMap[teamId]
          })).filter(item => item.team); // 存在しない球団IDを除外

          // unrankedTeamsから既に順位付けされた球団を除外
          const rankedTeamIds = restoredRankedTeams.map(item => item.team.id);
          const restoredUnrankedTeams = centralLeagueTeams.filter(
            team => !rankedTeamIds.includes(team.id)
          );

          setRankedTeams(restoredRankedTeams);
          setUnrankedTeams(restoredUnrankedTeams);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchMyPredictions();
  }, [session?.user?.id]);

  // ドラッグ&ドロップのイベントハンドラ
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over) {
      const draggedTeamId = active.id;
      const dropTargetId = over.id;
      
      // ドラッグされた球団を取得
      const draggedTeam = unrankedTeams.find(team => team.id === draggedTeamId) ||
                          rankedTeams.find(item => item.team.id === draggedTeamId)?.team;
      
      if (!draggedTeam) return;
      
      // 順位枠にドロップされた場合
      if (dropTargetId.startsWith('rank-')) {
        const targetRank = parseInt(dropTargetId.replace('rank-', ''));
        
        // その順位に既に球団がある場合は何もしない
        const existingTeamAtRank = rankedTeams.find(item => item.rank === targetRank);
        if (existingTeamAtRank && existingTeamAtRank.team.id !== draggedTeamId) {
          return;
        }
        
        // 未選択リストから削除
        setUnrankedTeams(prev => prev.filter(team => team.id !== draggedTeamId));
        
        // 既存の順位付けリストからも削除（順位変更の場合）
        setRankedTeams(prev => prev.filter(item => item.team.id !== draggedTeamId));
        
        // 新しい順位に追加
        setRankedTeams(prev => [...prev, { rank: targetRank, team: draggedTeam }]);
      }
      // 球団リストにドロップされた場合（順位から戻す）
      else if (dropTargetId === 'team-list') {
        // 順位付けリストから削除
        setRankedTeams(prev => prev.filter(item => item.team.id !== draggedTeamId));
        
        // 未選択リストに追加（重複チェック）
        setUnrankedTeams(prev => {
          const exists = prev.some(team => team.id === draggedTeamId);
          if (!exists) {
            return [...prev, draggedTeam];
          }
          return prev;
        });
      }
    }
  };

  // 順位予想をSupabaseに保存
  const handleSubmit = async () => {
    if (!session?.user?.id) {
      alert('ログインが必要です');
      return;
    }

    if (!isComplete) {
      alert('すべての順位を埋めてください');
      return;
    }

    try {
      // 順位順にソートして球団IDの配列を作成
      const sortedRankings = rankedTeams
        .sort((a, b) => a.rank - b.rank)
        .map(item => item.team.id);

      const predictionData = {
        user_id: session.user.id,
        season: 2026,
        league: 'central',
        rankings: JSON.stringify(sortedRankings)
      };

      const { error } = await supabase
        .from('predictions')
        .upsert([predictionData]);

      if (error) {
        console.error('Error saving prediction:', error);
        alert('予想の保存に失敗しました');
        return;
      }

      alert('予想を保存しました！');
      navigate('/predictions');
    } catch (error) {
      console.error('Error:', error);
      alert('予想の保存に失敗しました');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        セ・リーグ順位予想
      </Typography>
      
      <DndContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 4, mt: 4 }}>
          {/* 左側：球団リスト */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              球団リスト
            </Typography>
            <DroppableTeamList>
              {unrankedTeams.map((team) => (
                <DraggableTeam key={team.id} team={team} />
              ))}
            </DroppableTeamList>
          </Box>

          {/* 右側：順位枠 */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              順位予想
            </Typography>
            <Paper sx={{ p: 2, minHeight: 400 }}>
              {[1, 2, 3, 4, 5, 6].map((rank) => (
                <DroppableRank key={rank} rank={rank} rankedTeams={rankedTeams} />
              ))}
            </Paper>
          </Box>
        </Box>
      </DndContext>
      
      {/* 決定ボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={!isComplete}
          onClick={handleSubmit}
          sx={{ px: 4, py: 2 }}
        >
          この内容で予想を決定する
        </Button>
      </Box>
    </Container>
  );
};

export default PredictionPage;