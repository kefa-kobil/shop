import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
}

// Load cart from localStorage on app start
const savedCart = localStorage.getItem('cart')
if (savedCart) {
  try {
    const parsedCart = JSON.parse(savedCart)
    Object.assign(initialState, parsedCart)
  } catch (error) {
    localStorage.removeItem('cart')
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload
      const existingItem = state.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({
          ...product,
          quantity: 1
        })
      }
      
      // Recalculate totals
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0)
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state))
    },
    removeFromCart: (state, action) => {
      const productId = action.payload
      state.items = state.items.filter(item => item.id !== productId)
      
      // Recalculate totals
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0)
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state))
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload
      const item = state.items.find(item => item.id === productId)
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== productId)
        } else {
          item.quantity = quantity
        }
      }
      
      // Recalculate totals
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0)
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state))
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
      state.itemCount = 0
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state))
    }
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions

export default cartSlice.reducer