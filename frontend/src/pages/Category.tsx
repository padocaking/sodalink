import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchProducts, formatPrice, type Product } from '../api';

function ProductCard({ product }: { product: Product }) {
  const [qty, setQty] = useState(0);
  const [fav, setFav] = useState(false);

  const [reais, centavos] = Number(product.price).toFixed(2).split('.');

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-col">
      <div className="relative h-32 bg-gray-50 rounded-xl flex items-center justify-center mb-2">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <span className="material-icons text-gray-300 text-6xl">local_drink</span>
        )}
        <button
          aria-label="Favoritar"
          onClick={() => setFav((v) => !v)}
          className="absolute top-1 right-1"
        >
          <span className={`material-icons text-[1.4rem] ${fav ? 'text-red-600' : 'text-gray-400'}`}>
            {fav ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      </div>

      <p className="text-sm font-medium text-gray-800 line-clamp-2 min-h-10">{product.name}</p>

      <p className="text-xl font-extrabold text-gray-900 leading-tight">
        R$ {reais}<sup className="text-xs">,{centavos}</sup>
      </p>
      <p className="text-[0.65rem] text-gray-500">
        ({formatPrice(product.price)} preço por unidade)
      </p>
      {product.comparePrice && (
        <p className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</p>
      )}

      <span className="self-start mt-2 text-[0.65rem] font-semibold text-blue-700 bg-blue-100 rounded-full px-2.5 py-0.5 uppercase">
        {product.unit === 'un' ? 'Unidade' : product.unit}
      </span>

      {/* Quantity stepper */}
      <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-full px-1 py-1">
        <button
          aria-label="Diminuir"
          onClick={() => setQty((q) => Math.max(0, q - 1))}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${qty > 0 ? 'bg-red-600' : 'bg-gray-300'}`}
        >
          <span className="material-icons text-[1.1rem]">remove</span>
        </button>
        <span className="text-sm font-semibold text-gray-800">{qty}</span>
        <button
          aria-label="Aumentar"
          onClick={() => setQty((q) => q + 1)}
          className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white"
        >
          <span className="material-icons text-[1.1rem]">add</span>
        </button>
      </div>
    </div>
  );
}

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProducts({ categorySlug: slug })
      .then(setProducts)
      .catch(() => setError('Não foi possível carregar os produtos.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const categoryName = products[0]?.category.name
    ?? (slug ?? '').replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="min-h-full bg-gray-100">
      {/* Top bar */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-200 sticky top-0 z-20">
        <button aria-label="Voltar" onClick={() => navigate(-1)}>
          <span className="material-icons text-gray-800">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-2xl font-semibold text-gray-900 capitalize">{categoryName}</h1>
        <button aria-label="Buscar">
          <span className="material-icons text-gray-800">search</span>
        </button>
        <Link to="/pedido" aria-label="Carrinho">
          <span className="material-icons text-gray-800">shopping_cart</span>
        </Link>
      </header>

      {/* Filter chips */}
      <div className="bg-white px-4 py-2.5 flex items-center gap-2 overflow-x-auto border-b border-gray-100">
        <button aria-label="Filtros" className="shrink-0">
          <span className="material-icons text-gray-600 text-[1.3rem]">tune</span>
        </button>
        {['Marca', 'Preço', 'Tamanho', 'Embalagem'].map((f) => (
          <button key={f} className="shrink-0 text-xs text-gray-600 border border-gray-200 rounded-full px-4 py-1.5">
            {f}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {/* Banner */}
        <div className="bg-emerald-400 rounded-2xl px-5 py-6 mb-4">
          <p className="text-white font-semibold">Banner</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Carregando produtos...</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">São {products.length} produtos</p>
            <div className="grid grid-cols-2 gap-3 pb-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {products.length === 0 && !error && (
              <p className="text-sm text-gray-400 py-6 text-center">Nenhum produto nesta categoria.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
