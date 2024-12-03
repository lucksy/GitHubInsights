import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CommitHistory from './pages/CommitHistory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/commits/:repo" element={<CommitHistory />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;


// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import MainLayout from './layouts/MainLayout';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import CommitHistory from './pages/CommitHistory';

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('github_token');
//     setIsAuthenticated(!!token);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('github_token');
//     setIsAuthenticated(false);
//   };

//   return (
//     <Router>
//       <Routes>
//         <Route 
//           path="/login" 
//           element={
//             !isAuthenticated ? 
//             <Login onLogin={() => setIsAuthenticated(true)} /> : 
//             <Navigate to="/dashboard" replace />
//           } 
//         />
//         <Route 
//           element={
//             isAuthenticated ? 
//             <MainLayout onLogout={handleLogout} /> : 
//             <Navigate to="/login" replace />
//           }
//         >
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/commits/:repo" element={<CommitHistory />} />
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />
//         </Route>
//       </Routes>
//     </Router>
//   );
// }

// export default App;