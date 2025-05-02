import { Navigate } from "react-router-dom";

const PrivateRoute = ({ isAllowed, redirectTo = "/", children }) => {
  const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
  
  if (carrito.length === 0) {
    return <Navigate to={redirectTo} />;
  }

  return children;
};

export default PrivateRoute;
