import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTournament } from '../../store/slices/tournamentSlice';
import { getUsers } from '../../store/slices/userSlice';
import { useNavigate } from 'react-router-dom';

export default function CreateTournament() {
  const [formData, setFormData] = useState({
    name: '',
    tournament_type: 'league',
    player_usernames: [],
  });
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.tournament);
  const { users, loading: usersLoading, error: usersError } = useSelector((state) => state.users);

  useEffect(() => {
    console.log('Fetching users...');
    dispatch(getUsers());
  }, [dispatch]);

  useEffect(() => {
    console.log('Users state:', users);
    console.log('Users loading:', usersLoading);
    console.log('Users error:', usersError);
  }, [users, usersLoading, usersError]);

  const handleChange = (e) => {
    if (e.target.name === 'player_usernames') {
      // Handle multiple select
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({
        ...formData,
        player_usernames: selectedOptions
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (formData.player_usernames.length < 2) {
      setValidationError('At least 2 players are required for a tournament');
      return;
    }

    const result = await dispatch(createTournament(formData));
    if (!result.error) {
      navigate('/tournaments');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Tournament</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tournament Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="tournament_type" className="block text-sm font-medium text-gray-700">
                Tournament Type
              </label>
              <select
                id="tournament_type"
                name="tournament_type"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                value={formData.tournament_type}
                onChange={handleChange}
              >
                <option value="league">League</option>
                <option value="knockout">Knockout</option>
              </select>
            </div>

            <div>
              <label htmlFor="player_usernames" className="block text-sm font-medium text-gray-700">
                Select Players
              </label>
              <select
                id="player_usernames"
                name="player_usernames"
                multiple
                required
                size="5"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                value={formData.player_usernames}
                onChange={handleChange}
              >
                {users.map(user => (
                  <option key={user.id} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Hold Ctrl/Cmd to select multiple players (minimum 2 required)
              </p>
            </div>

            {validationError && (
              <div className="text-red-500 text-sm">{validationError}</div>
            )}

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 