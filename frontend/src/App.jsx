import { BrowserRouter } from 'react-router-dom'
import Main from './container/Main.jsx'
import './App.css'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    </div>
  )
}

export default App
