import './App.css';
import Login from './pages/auth/Login';
import {Routes, Route} from 'react-router-dom';
import TTGenerator from './pages/auth/TTGenerator';

function App() {
  return (
    <>
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/' element={<TTGenerator />} />
    </Routes>
    
    </>
  );
}

export default App;
