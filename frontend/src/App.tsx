import { Route, Routes } from "react-router-dom"
import './App.css'
import Layout from "./components/Layout.tsx"
import Home from "./pages/Home"

function App() {
  return (
    <Routes>
      <Route element={<Layout/>}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
