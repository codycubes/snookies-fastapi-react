import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournamentMatches, updateMatchResult, joinTournament } from '../../store/slices/tournamentSlice';

export default function TournamentDetail({ join = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { matches, loading, error } = useSelector((state) => state.tournament);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchResult, setMatchResult] = useState({
    score_player1: '',
    score_player2: '',
  });

  useEffect(() => {
    dispatch(getTournamentMatches(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (join) {
      handleJoinTournament();
    }
  }, [join, id]);

  const handleJoinTournament = async () => {
    try {
      await dispatch(joinTournament(id)).unwrap();
      navigate(`/tournaments/${id}`);
    } catch (error) {
      console.error('Failed to join tournament:', error);
    }
  };

  const handleUpdateResult = async (matchId) => {
    const winner_id = parseInt(matchResult.score_player1) > parseInt(matchResult.score_player2)
      ? selectedMatch.player1_id
      : selectedMatch.player2_id;

    await dispatch(updateMatchResult({
      matchId,
      matchData: {
        ...matchResult,
        score_player1: parseInt(matchResult.score_player1),
        score_player2: parseInt(matchResult.score_player2),
        winner_id,
      },
    }));

    setSelectedMatch(null);
    setMatchResult({ score_player1: '', score_player2: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tournament Matches</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {matches.map((match) => (
              <li key={match.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">
                      {match.player1.username}
                    </span>
                    <span className="text-sm text-gray-500">vs</span>
                    <span className="text-sm font-medium text-gray-900">
                      {match.player2.username}
                    </span>
                  </div>

                  {match.status === 'completed' ? (
                    <div className="text-sm text-gray-500">
                      {match.score_player1} - {match.score_player2}
                      <span className="ml-2 text-green-600">
                        Winner: {match.winner.username}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Update Result
                    </button>
                  )}
                </div>

                {selectedMatch?.id === match.id && (
                  <div className="mt-4 flex items-center space-x-4">
                    <input
                      type="number"
                      placeholder="Player 1 Score"
                      className="block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                      value={matchResult.score_player1}
                      onChange={(e) => setMatchResult({ ...matchResult, score_player1: e.target.value })}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Player 2 Score"
                      className="block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                      value={matchResult.score_player2}
                      onChange={(e) => setMatchResult({ ...matchResult, score_player2: e.target.value })}
                    />
                    <button
                      onClick={() => handleUpdateResult(match.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Save Result
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 