import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTournaments } from '../../store/slices/tournamentSlice';
import { Link } from 'react-router-dom';

export default function TournamentList() {
  const dispatch = useDispatch();
  const { tournaments, loading, error } = useSelector((state) => state.tournament);

  useEffect(() => {
    dispatch(getTournaments());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading tournaments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-500">
          {typeof error === 'string' ? error : 'Failed to load tournaments. Please try again.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
          <Link
            to="/tournaments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Tournament
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {tournaments.map((tournament) => (
              <li key={tournament.id}>
                <Link
                  to={`/tournaments/${tournament.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-indigo-600 truncate">
                        {tournament.name}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {tournament.tournament_type}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <div className="sm:flex">
                        <div className="mr-6 flex items-center text-sm text-gray-500">
                          <span>
                            {tournament.players?.length || 0} players
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 