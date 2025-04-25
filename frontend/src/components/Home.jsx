import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTournaments } from '../store/slices/tournamentSlice';

export default function Home() {
  const dispatch = useDispatch();
  const { tournaments, loading, error } = useSelector((state) => state.tournament);
  const { user } = useSelector((state) => state.auth);
  const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing');
  const availableTournaments = tournaments.filter(t => t.status === 'upcoming');

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

  const TournamentList = ({ tournaments, title, emptyMessage }) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {tournaments.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {tournaments.map((tournament) => (
              <li key={tournament.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-indigo-600 truncate">
                        {tournament.name}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex space-x-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {tournament.tournament_type}
                        </span>
                        {tournament.status === 'upcoming' && (
                          <Link
                            to={`/tournaments/${tournament.id}/join`}
                            className="px-3 py-1 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Join
                          </Link>
                        )}
                        <Link
                          to={`/tournaments/${tournament.id}`}
                          className="px-3 py-1 text-xs font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <div className="sm:flex">
                        <div className="mr-6 flex items-center text-sm text-gray-500">
                          <span>
                            Host: {tournament.created_by?.username || 'Unknown'}
                          </span>
                        </div>
                        <div className="mr-6 flex items-center text-sm text-gray-500">
                          <span>
                            {tournament.players?.length || 0} players
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <p className="text-xl text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tournament Hub</h1>
          <Link
            to="/tournaments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Tournament
          </Link>
        </div>

        <TournamentList
          tournaments={availableTournaments}
          title="Available Tournaments"
          emptyMessage="No tournaments available to join"
        />

        <TournamentList
          tournaments={ongoingTournaments}
          title="Ongoing Tournaments"
          emptyMessage="No ongoing tournaments"
        />
      </div>
    </div>
  );
} 