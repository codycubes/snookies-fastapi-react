import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import TournamentList from './components/tournament/TournamentList';
import CreateTournament from './components/tournament/CreateTournament';
import TournamentDetail from './components/tournament/TournamentDetail';
import Navbar from './components/layout/Navbar';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/tournaments" element={<TournamentList />} />
          <Route path="/tournaments/new" element={<CreateTournament />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/tournaments/:id/join" element={<TournamentDetail join={true} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
