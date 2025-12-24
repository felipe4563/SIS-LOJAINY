import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <img src="/logo.png" alt="Boutique Lojainy" className="w-32 mb-6" />

      <h1 className="text-3xl font-bold mb-2">Boutique Lojainy</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Sistema de gestión de ventas, productos y clientes.
      </p>

      <Link
        to="/login"
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
      >
        Ingresar al sistema
      </Link>
    </div>
  );
};

export default Home;
