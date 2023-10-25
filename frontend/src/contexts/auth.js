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
  passwordResetSent: false
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
  const [organizations, setOrganizations] = useState([]);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [settings, setSettings] = useState([]);

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
    return data?.user;
  };

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
  
    // Check if the user exists in the profiles table
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
  
    if (profileError) {
      console.error("Error checking profile:", profileError);
      return;
    }
  
    // If profile doesn't exist, create one
    if (existingProfile?.length === 0) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          username: user.user_metadata.name,
          photo_url: user.user_metadata.avatar_url
        }]);
  
      if (insertError) {
        console.error("Error inserting new profile:", insertError);
      } else {
        console.log("New profile created:", newProfile);
      }
    } else {
      console.log("User profile already exists.");
    }
  
    dispatch({
      type: HANDLERS.INITIALIZE,
      payload: user
    });
  
    setHaveFetchedOrganizations(false);

    // Fetch organizations using JSON-RPC
    try {
      const fetchedOrganizations = await getAllOrganizations();
      setOrganizations(fetchedOrganizations); // Set the organizations
      if (fetchedOrganizations.length > 0) {
        setActiveOrganization(fetchedOrganizations[0].id);
      }
      // ... (rest of the logic remains the same)
    } catch (error) {
      console.log('Error fetching organizations:', error);
    }
    setHaveFetchedOrganizations(true);
  };

  
  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    initialize();

    // Fetch the first role whenever activeOrganization changes
    if (activeOrganization) {
      const fetchRole = async () => {
        try {
          const roleData = await getFirstRole(activeOrganization);
          if (roleData) {
            setRole(roleData?.name?.toLowerCase()); // Assume the response has a property called "role"
          }
        } catch (error) {
          console.error('Error fetching role:', error);
        }
      };
      const fetchSettings = async () => {
        // Fetch settings using JSON-RPC
        try {
          const fs = await getAllSettings(activeOrganization);
          setSettings(fs);
        } catch (error) {
          console.log('Error fetching settings:', error);
        }
      };
      fetchSettings();
      fetchRole();
    }
  }, [activeOrganization]);

  const signIn = async (email, password) => {
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }
      
      dispatch({
        type: HANDLERS.SIGN_IN,
        payload: user
      });
    } catch (err) {
      console.error(err);
      throw new Error('Please check your email and password');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { user, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })

      if (error) {
        throw new Error(error.message);
      }

      dispatch({
        type: HANDLERS.SIGN_IN_WITH_GOOGLE,
        payload: user
      });
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
      const { user, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      dispatch({
        type: HANDLERS.SIGN_UP,
        payload: user
      });
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
      throw new Error('Error sending password reset link. Please check your email.');
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
