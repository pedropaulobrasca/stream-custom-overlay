import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Loading...')

  useEffect(() => {
    fetch('/api/overlay')
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(() => setApiStatus('API connection failed'))
  }, [])

  return (
    <div className="App">
      <h1>Stream Custom Overlay</h1>
      <p>API Status: {apiStatus}</p>
    </div>
  )
}

export default App