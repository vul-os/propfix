import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/auth';

export const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading && isMounted.current) {
      navigate('/auth/login', { state: { from: location.pathname } });
    }

    isMounted.current = true;
  }, [isAuthenticated, isLoading, navigate, location]);

  if (isLoading) {
    // Optional: Show loading spinner or skeleton screen while checking authentication state
    return null;
  }

  return isAuthenticated ? children : null;
};

AuthGuard.propTypes = {
  children: PropTypes.node
};
