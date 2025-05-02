import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductoDetalle from "./pages/ProductoDetalle";
import Carrito from "./pages/Carrito";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import Checkout from "./pages/Checkout";
import EnProceso from "./pages/enProceso";
import HistorialPedidos from "./pages/historialPedidos";
import PrivateRoute from "./components/PrivateRoute";

const carritoTieneProductos = JSON.parse(localStorage.getItem('carrito') || '[]').length > 0;


function App() {
  return (
    <div className="w-full min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/checkout"
            element={
              <PrivateRoute
                isAllowed={true} // deja que el propio componente PrivateRoute valide el carrito
                redirectTo="/carrito"
              >
                <Checkout />
              </PrivateRoute>
            }
          />




          <Route path="/enProceso" element={<EnProceso />} />
          <Route path="/historial-pedidos" element={<HistorialPedidos />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;