import './App.css';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-[90vh] bg-gray-100 rounded-xl">
      <header className="text-center p-4 text-3xl font-bold text-indigo-600">VeloScope</header>
      <Home />
    </div>
  );
}

export default App;
