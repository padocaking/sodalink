import { Link, useLocation } from 'react-router-dom';

export default function OrderSuccess() {
  const location = useLocation();
  const orderNumber = (location.state as { orderNumber?: string } | null)?.orderNumber;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-8 text-center">
      <div className="w-24 h-24 rounded-full bg-emerald-400 flex items-center justify-center mb-6">
        <span className="material-icons text-white text-[3.5rem]">check</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Compra concluída!</h1>
      <p className="mt-3 text-sm text-gray-500">
        Seu pedido foi realizado com sucesso e já está sendo preparado.
      </p>
      {orderNumber && (
        <p className="mt-2 text-sm text-gray-700">
          Número do pedido: <span className="font-bold">{orderNumber}</span>
        </p>
      )}

      <Link
        to="/pedido"
        className="mt-10 w-full bg-red-600 text-white text-lg font-semibold py-3.5 rounded-full shadow-sm active:scale-[0.98] transition"
      >
        Acompanhar pedido
      </Link>
      <Link to="/" className="mt-4 text-sm text-gray-500 underline">
        Voltar ao início
      </Link>
    </div>
  );
}
