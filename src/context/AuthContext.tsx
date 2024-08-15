// Packages:
import React, { createContext, useState, useEffect } from 'react'
import localforage from 'localforage'

// Typescript:
export interface AuthContextType {
  isLoading: boolean
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  username: string | undefined
  setUsername: React.Dispatch<React.SetStateAction<string | undefined>>
  password: string | undefined
  setPassword: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  setIsAuthenticated: () => { },
  username: undefined,
  setUsername: () => { },
  password: undefined,
  setPassword: () => { },
})

// Exports:
export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  // State:
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string>()
  const [password, setPassword] = useState<string>()

  // Effects:
  useEffect(() => {
    (async () => {
      const _isAuthenticated = !!await localforage.getItem('isAuthenticated')
      if (_isAuthenticated) {
        setIsAuthenticated(_isAuthenticated)
        setUsername((await localforage.getItem('username')) ?? '')
        setPassword((await localforage.getItem('password')) ?? '')
      }
      setIsLoading(false)
    })()
  }, [])

  // Return:
  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        setIsAuthenticated,
        username,
        setUsername,
        password,
        setPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
