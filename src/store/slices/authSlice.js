import { createSlice } from '@reduxjs/toolkit'

// Mock users data - in real app this would come from your API
const mockUsers = [
  {
    id: '1',
    email: 'customer@test.com',
    password: 'password123',
    fullName: 'Test Customer',
    role: 'customer'
  },
  {
    id: '2',
    email: 'manager@test.com',
    password: 'password123',
    fullName: 'Test Manager',
    role: 'manager'
  },
  {
    id: '3',
    email: 'admin@test.com',
    password: 'password123',
    fullName: 'Test Admin',
    role: 'admin'
  }
]

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
export const loginUser = (email, password) => (dispatch) => {
  dispatch(loginStart())
  
  // Simulate API call delay
  setTimeout(() => {
    const user = mockUsers.find(u => u.email === email && u.password === password)
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user
      dispatch(loginSuccess(userWithoutPassword))
    } else {
      dispatch(loginFailure('Invalid email or password'))
    }
  }, 1000)
}

export const signupUser = (userData) => (dispatch) => {
  dispatch(signupStart())
  
  // Simulate API call delay
  setTimeout(() => {
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email)
    
    if (existingUser) {
      dispatch(signupFailure('User with this email already exists'))
      return
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role || 'customer'
    }
    
    // Add to mock users (in real app, this would be an API call)
    mockUsers.push({ ...newUser, password: userData.password })
    
    dispatch(signupSuccess(newUser))
  }, 1000)
}

export const logoutUser = () => (dispatch) => {
  dispatch(logout())
}

export default authSlice.reducer