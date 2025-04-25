import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

// Axios instance for tournament endpoints
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Get all tournaments
export const getTournaments = createAsyncThunk(
  'tournament/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/tournaments');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
      return rejectWithValue(error.response?.data || { detail: 'Failed to fetch tournaments' });
    }
  }
);

// Protected endpoints
export const createTournament = createAsyncThunk(
  'tournament/create',
  async (tournamentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/tournaments', tournamentData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
      return rejectWithValue(error.response?.data || { detail: 'Failed to create tournament' });
    }
  }
);

export const getTournamentMatches = createAsyncThunk(
  'tournament/getMatches',
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/tournaments/${tournamentId}/matches`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateMatchResult = createAsyncThunk(
  'tournament/updateMatch',
  async ({ matchId, matchData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/tournaments/matches/${matchId}`, matchData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const joinTournament = createAsyncThunk(
  'tournament/join',
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/tournaments/${tournamentId}/join`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
      return rejectWithValue(error.response?.data || { detail: 'Failed to join tournament' });
    }
  }
);

const initialState = {
  tournaments: [],
  currentTournament: null,
  matches: [],
  loading: false,
  error: null,
};

const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTournament: (state, action) => {
      state.currentTournament = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Tournament
      .addCase(createTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments.push(action.payload);
      })
      .addCase(createTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Failed to create tournament';
      })
      // Get Tournaments
      .addCase(getTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = action.payload;
      })
      .addCase(getTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Failed to fetch tournaments';
      })
      // Get Tournament Matches
      .addCase(getTournamentMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTournamentMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(getTournamentMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Failed to fetch matches';
      })
      // Update Match Result
      .addCase(updateMatchResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMatchResult.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.matches.findIndex(match => match.id === action.payload.id);
        if (index !== -1) {
          state.matches[index] = action.payload;
        }
      })
      .addCase(updateMatchResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Failed to update match';
      })
      // Join Tournament
      .addCase(joinTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinTournament.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tournaments.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tournaments[index] = action.payload;
        }
      })
      .addCase(joinTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Failed to join tournament';
      });
  },
});

export const { clearError, setCurrentTournament } = tournamentSlice.actions;
export default tournamentSlice.reducer; 