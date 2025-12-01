import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useNavigation = () => {
  const navigate = useNavigate();

  const safeNavigate = useCallback((path: string | number) => {
    try {
      if (typeof path === 'number') {
        if (window.history.length > 1) {
          navigate(path);
        } else {
          navigate('/');
        }
      } else {
        navigate(path);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/');
    }
  }, [navigate]);

  return { safeNavigate };
};