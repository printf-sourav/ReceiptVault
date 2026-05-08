import { useEffect } from 'react';
import AppRouter from './AppRouter';

export default function App() {
  useEffect(() => {
    // Enable dark mode
    document.documentElement.classList.add('dark');
    // Smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return <AppRouter />;
}
