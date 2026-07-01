import { Route, Routes } from "react-router-dom"
import './App.css'
import Layout from "./components/Layout.tsx"
import Devv1 from "./pages/Devv1"
import Home from "./pages/Home"
import SpotDetail from "./pages/SpotDetail"
import Test from "./components/Test.tsx"
import Share from "./pages/Share.tsx"

function App() {
  
  return (    
    <Routes>
      <Route element={<Layout/>}>
        <Route path="/" element={<Home />} />
        <Route path="/spot/:id" element={<SpotDetail />} />
        <Route path="/Test" element={<Test />} />
        <Route path="/Devv1" element={<Devv1 />} />
        <Route path="/Share" element={<Share />} />
      </Route>

    </Routes>


  )
}

export default App
