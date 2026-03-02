import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { Loader } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
}

export default App;
