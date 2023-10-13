import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';

import { jsonRpcRequest } from '../api/jsonrpc/client'; // Adjust the path based on your project's structure
import { getFirstRole } from '../api/roles'; // Adjust the path based on your project's structure

// Initialize Firebase with your configuration
const firebaseConfig = {
  apiKey: "***REMOVED-FIREBASE-WEB-KEY***",
  authDomain: "propfix.firebaseapp.com",
  projectId: "propfix",
  storageBucket: "propfix.appspot.com",
  messagingSenderId: "746591168335",
  appId: "1:746591168335:web:f3cf7df2f1d57596cf073a",
  measurementId: "G-GG76DD6CSR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

  const [activeOrganization, setActiveOrganization] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [haveFetchedOrganizations, setHaveFetchedOrganizations] = useState(false);
  const [role, setRole] = useState(null)
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);

  const initialize = async () => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch({
          type: HANDLERS.INITIALIZE,
          payload: user
        });

        const idToken = await user.getIdToken();
        setHaveFetchedOrganizations(false)
        // Fetch organizations using JSON-RPC
        try {
          const fetchedOrganizations = await jsonRpcRequest('Organizations.GetAllOrganizations', [{}], idToken);
          setOrganizations(fetchedOrganizations?.organizations); // Set the organizations
          if (fetchedOrganizations && fetchedOrganizations.organizations) {
            setActiveOrganization(fetchedOrganizations.organizations[0].id)
          }
          // ... (rest of the logic remains the same)
        } catch (error) {
          console.log('Error fetching organizations:', error);
        }
        setHaveFetchedOrganizations(true)
      } else {
        dispatch({
          type: HANDLERS.INITIALIZE
        });
      }
    });

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      dispatch({
        type: HANDLERS.INITIALIZE,
        payload: JSON.parse(storedUser)
      });
    }
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
          const idToken = await getIdToken();  // Use the existing getIdToken function
          const roleData = await getFirstRole(activeOrganization, idToken);
          if (roleData?.role) {
            setRole(roleData.role?.name?.toLowerCase());  // Assume the response has a property called "role"
          }
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      };
  
      fetchRole();
    }
  }, [activeOrganization]);

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

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
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

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
    firebaseSignOut(auth);
    setRole(null)
    dispatch({
      type: HANDLERS.SIGN_OUT
    });
  };

  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

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
      await sendPasswordResetEmail(auth, email);

      dispatch({
        type: HANDLERS.FORGOT_PASSWORD
      });
    } catch (err) {
      console.error(err);
      throw new Error('Error sending password reset link. Please check your email.');
    }
  };

  const getIdToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        return token;
      }
      throw new Error('No authenticated user');
    } catch (err) {
      console.error(err);
      throw new Error('Error retrieving authentication token');
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
        getIdToken,
        activeOrganization,
        setActiveOrganization,
        haveFetchedOrganizations,
        organizations,
        role,
        roles,
        setRoles,
        members,
        setMembers
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
