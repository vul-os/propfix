import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "***REMOVED-FIREBASE-WEB-KEY***",
  authDomain: "prop-fix.firebaseapp.com",
  projectId: "prop-fix",
  storageBucket: "prop-fix.appspot.com",
  messagingSenderId: "319029773219",
  appId: "1:319029773219:web:c1a50cb46bb4374bcf1016",
  measurementId: "G-LE895GYYSC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const HANDLERS = {
  INITIALIZE: 'INITIALIZE',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
  SIGN_IN_WITH_GOOGLE: 'SIGN_IN_WITH_GOOGLE'
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null
};

const handlers = {
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
  }
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

export const AuthContext = createContext(undefined);

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const initialize = async () => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;

    onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch({
          type: HANDLERS.INITIALIZE,
          payload: user
        });
      } else {
        dispatch({
          type: HANDLERS.INITIALIZE
        });
      }
    });

    // Restoration of authentication state from browser storage (e.g., localStorage)
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

    dispatch({
      type: HANDLERS.SIGN_OUT
    });
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
        getIdToken
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

