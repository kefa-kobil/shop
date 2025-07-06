import { createSlice } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Load user from localStorage on app start
const savedUser = localStorage.getItem('user')
if (savedUser) {
  try {
    const parsedUser = JSON.parse(savedUser)
    initialState.user = parsedUser
    initialState.isAuthenticated = true
  } catch (error) {
    localStorage.removeItem('user')
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
      state.error = null
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
      state.error = action.payload
    },
    signupStart: (state) => {
      state.loading = true
      state.error = null
    },
    signupSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
      state.error = null
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    signupFailure: (state, action) => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
      state.error = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.error = null
      // Remove from localStorage
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    }
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout,
  clearError
} = authSlice.actions

// Async action creators
export const loginUser = (email, password) => async (dispatch) => {
  dispatch(loginStart())
  
  try {
    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      dispatch(loginFailure(authError.message))
      return
    }

    // Fetch user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      dispatch(loginFailure('Failed to fetch user profile'))
      return
    }

    // Create user object with UUID id and profile data
    const user = {
      id: authData.user.id, // This is a proper UUID from Supabase
      email: authData.user.email,
      fullName: profile.full_name,
      role: profile.role
    }

    dispatch(loginSuccess(user))
  } catch (error) {
    dispatch(loginFailure(error.message || 'Login failed'))
  }
}

export const signupUser = (userData) => async (dispatch) => {
  dispatch(signupStart())
  
  try {
    // Sign up with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password
    })

    if (authError) {
      dispatch(signupFailure(authError.message))
      return
    }

    // Update the user's profile with additional information
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: userData.fullName,
        role: userData.role || 'customer'
      })
      .eq('id', authData.user.id)

    if (profileError) {
      dispatch(signupFailure('Failed to update user profile'))
      return
    }

    // Create user object with UUID id and profile data
    const user = {
      id: authData.user.id, // This is a proper UUID from Supabase
      email: authData.user.email,
      fullName: userData.fullName,
      role: userData.role || 'customer'
    }

    dispatch(signupSuccess(user))
  } catch (error) {
    dispatch(signupFailure(error.message || 'Signup failed'))
  }
}

export const logoutUser = () => async (dispatch) => {
  try {
    await supabase.auth.signOut()
    dispatch(logout())
  } catch (error) {
    // Even if signout fails, clear local state
    dispatch(logout())
  }
}

export default authSlice.reducer