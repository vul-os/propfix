import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { getFirstRole } from '../api/roles'; // Adjust the path based on your project's structure
import { getAllSettings } from '../api/settings'; // Adjust the path based on your project's structure
import { getAllOrganizations } from '../api/organizations'; // Adjust the path based on your project's structure

import { supabase } from '../api/supabase';

const HANDLERS = {
  INITIALIZE: 'INITIALIZE',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
  SIGN_IN_WITH_GOOGLE: 'SIGN_IN_WITH_GOOGLE',
  SIGN_UP: 'SIGN_UP',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  FETCH_ORGANIZATIONS: 'FETCH_ORGANIZATIONS'
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  passwordResetSent: false,
  organizations: [], // Add organizations state
  role: null,
  settings: [],
  members: []
};

const handlers = {
  [HANDLERS.FORGOT_PASSWORD]: (state) => {
    return {
      ...state,
      passwordResetSent: true
    };
  },
  [HANDLERS.INITIALIZE]: (state, action) => {
    const user = action.payload;
    return {
      ...state,
      ...(user
        ? {
            isAuthenticated: true,
            isLoading: false,
            user
          }
        : {
            isLoading: false
          })
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null
    };
  },
  [HANDLERS.SIGN_IN_WITH_GOOGLE]: (state, action) => {
    const user = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  [HANDLERS.SIGN_UP]: (state, action) => {
    const user = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  [HANDLERS.FETCH_ORGANIZATIONS]: (state, action) => {
    const organizations = action.payload;
    return {
      ...state,
      organizations
    };
  }
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

export const AuthContext = createContext(undefined);

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const [activeOrganization, setActiveOrganization] = useState('');
  const [haveFetchedOrganizations, setHaveFetchedOrganizations] = useState(false);

  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [settings, setSettings] = useState([]);
  const [members, setMembers] = useState([]);

  const [organizations, setOrganizations] = useState([]); // Add organizations state

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
    return data?.user;
  };

  const fetchOrganizations = async (user) => {
    // Check if the user is authenticated
    if (user) {
      setHaveFetchedOrganizations(false);
      try {
        // Fetch organizations using JSON-RPC
        const fetchedOrganizations = await getAllOrganizations();
        setOrganizations(fetchedOrganizations);

        if (fetchedOrganizations.length > 0) {
          setActiveOrganization(fetchedOrganizations[0].id);
        }
      } catch (error) {
        console.log('Error fetching organizations:', error);
      }
      setHaveFetchedOrganizations(true);
    }
  };

  const getRoleAndSettings = async () => {
    if (activeOrganization) {
      try {
        // Fetch the first role whenever activeOrganization changes
        const roleData = await getFirstRole(activeOrganization);
        console.log("roledtaa", roleData)
        setRole(roleData);
      } catch (error) {
        console.error('Error fetching role:', error);
      }

      try {
        // Fetch settings using JSON-RPC
        const fetchedSettings = await getAllSettings(activeOrganization);
        setSettings(fetchedSettings);
      } catch (error) {
        console.log('Error fetching settings:', error);
      }
    }
  }

  const initialize = async () => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;

    let user = null;

    // Try to get user
    const { data: userData, userError } = await supabase.auth.getUser();
    if (userData?.user) {
      user = userData.user;
    } else if (userError) {
      console.error("Error fetching user:", userError);
      // Try refreshing session if fetching user failed
      user = await refreshSession();
    }

    if (!user) {
      console.error("Unable to obtain user details after session refresh.");
      dispatch({
        type: HANDLERS.INITIALIZE
      });
      return;
    }

    await supabase.rpc('update_user_ids_in_job_users', {});

    dispatch({
      type: HANDLERS.INITIALIZE,
      payload: user
    });

    // Fetch organizations, roles, and settings after initializing
    fetchOrganizations(user);
  };

  useEffect(() => {
    initialize();
    getRoleAndSettings();
  }, []);

  useEffect(() => {
    initialize();
    getRoleAndSettings()
  }, [activeOrganization]);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      dispatch({
        type: HANDLERS.SIGN_IN,
        payload: data?.user
      });

      // Fetch organizations, roles, and settings after signing in
      fetchOrganizations(data?.user);
    } catch (err) {
      console.error(err);
      throw new Error('Please check your email and password');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { user, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) {
        throw new Error(error.message);
      }

      dispatch({
        type: HANDLERS.SIGN_IN_WITH_GOOGLE,
        payload: user
      });
      console.log(user, "hereeeeeee")
      // Fetch organizations, roles, and settings after signing in with Google
      fetchOrganizations(user);
    } catch (err) {
      console.error(err);
      throw new Error('There was an error signing in with Google');
    }
  };

  const signOut = () => {
    supabase.auth.signOut();

    dispatch({
      type: HANDLERS.SIGN_OUT
    });
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      dispatch({
        type: HANDLERS.SIGN_UP,
        payload: data?.user
      });

      // Fetch organizations, roles, and settings after signing up
      fetchOrganizations(data?.user);
    } catch (err) {
      console.error(err);
      throw new Error('Error signing up. Please check your input.');
    }
  };

  const sendPasswordResetLink = async (email) => {
    try {
      await supabase.auth.api.resetPasswordForEmail(email);

      dispatch({
        type: HANDLERS.FORGOT_PASSWORD
      });
    } catch (err) {
      console.error(err);
      throw Error('Error sending password reset link. Please check your email.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signInWithGoogle,
        signOut,
        signUp,
        sendPasswordResetLink,
        activeOrganization,
        setActiveOrganization,
        haveFetchedOrganizations,
        organizations,
        role,
        roles,
        setRoles,
        members,
        setMembers,
        settings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
