import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProductoDetalle from "./pages/ProductoDetalle";
import RegisterPage from "./pages/registerPage";
import Carrito from "./pages/Carrito";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import Checkout from "./pages/Checkout";
import EnProceso from "./pages/enProceso";
import HistorialPedidos from "./pages/historialPedidos";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/enProceso" element={<EnProceso />} />
        <Route path="/historial-pedidos" element={<HistorialPedidos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;