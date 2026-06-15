import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { fetchCategories, fetchProducts, fetchUsers, type Category, type Product, type AdminUser } from '../api';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export default function Admin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Estados para o formulário de Produto
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodVolume, setProdVolume] = useState('');
  const [prodPackage, setProdPackage] = useState('');
  const [prodUnitCount, setProdUnitCount] = useState('1');
  const [prodIsPromo, setProdIsPromo] = useState(false);
  const [prodPromoPrice, setProdPromoPrice] = useState('');
  const [prodImage, setProdImage] = useState<File | null>(null);
  const [prodPreview, setProdPreview] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Estados para gestão de Usuários
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userDocument, setUserDocument] = useState('');
  const [userDocType, setUserDocType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [userPhone, setUserPhone] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      setLoadingProducts(true);
      setError('');
      fetchProducts({ categorySlug: selectedCategory.slug })
        .then(setCategoryProducts)
        .catch(() => setError('Não foi possível carregar os produtos dessa categoria.'))
        .finally(() => setLoadingProducts(false));
    } else {
      setCategoryProducts([]);
      setError('');
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setError('Não foi possível carregar as categorias.'))
      .finally(() => setLoading(false));
    fetchUsers()
      .then(setUsers)
      .catch(() => { /* lista de usuários é opcional */ });
  }, []);

  const closeUserModal = () => {
    setIsAddUserModalOpen(false);
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserDocument('');
    setUserDocType('CPF');
    setUserPhone('');
  };

  const handleSaveUser = async () => {
    if (!userName.trim() || !userEmail.trim() || !userPassword.trim() || !userDocument.trim() || !userPhone.trim()) {
      alert('Preencha nome, email, senha, documento e telefone.');
      return;
    }
    if (userPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setIsSavingUser(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          password: userPassword,
          document: userDocument,
          documentType: userDocType,
          phone: userPhone,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao criar usuário');

      setUsers((prev) => [data, ...prev]);
      closeUserModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível criar o usuário.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setNewImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProdImage(file);
      setProdPreview(URL.createObjectURL(file));
    }
  };

  const closeProdModal = () => {
    setIsAddProductModalOpen(false);
    setEditingProductId(null);
    setProdName('');
    setProdPrice('');
    setProdVolume('');
    setProdPackage('');
    setProdUnitCount('1');
    setProdIsPromo(false);
    setProdPromoPrice('');
    setProdImage(null);
    setProdPreview(null);
  };

  const openEditProdModal = (product: Product) => {
    setEditingProductId(product.id);
    setProdName(product.name);
    setProdVolume(product.volume ? product.volume.toString() : '');
    setProdPackage(product.packageType || '');
    setProdUnitCount(product.unitCount ? product.unitCount.toString() : '1');
    // Produto em promoção: price = preço promocional, comparePrice = preço normal.
    const onPromo = product.isFeatured && product.comparePrice != null;
    setProdIsPromo(onPromo);
    if (onPromo) {
      setProdPrice(Number(product.comparePrice).toFixed(2));
      setProdPromoPrice(Number(product.price).toFixed(2));
    } else {
      setProdPrice(Number(product.price).toFixed(2));
      setProdPromoPrice('');
    }
    setProdPreview(product.imageUrl || null);
    setProdImage(null);
    setIsAddProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!prodName.trim() || !prodPrice.trim() || !selectedCategory) {
      alert('Nome e preço do produto são obrigatórios.');
      return;
    }
    if (prodIsPromo && !prodPromoPrice.trim()) {
      alert('Informe o preço promocional.');
      return;
    }
    setIsSavingProduct(true);
    try {
      const formData = new FormData();
      formData.append('categoryId', selectedCategory.id.toString());
      formData.append('name', prodName);
      if (prodIsPromo) {
        // Em promoção: price = preço promocional, comparePrice = preço normal (riscado)
        formData.append('price', prodPromoPrice);
        formData.append('comparePrice', prodPrice);
        formData.append('isFeatured', 'true');
      } else {
        formData.append('price', prodPrice);
        formData.append('comparePrice', '');
        formData.append('isFeatured', 'false');
      }
      if (prodVolume) formData.append('volume', prodVolume);
      if (prodPackage) formData.append('packageType', prodPackage);
      if (prodUnitCount) formData.append('unitCount', prodUnitCount);
      if (prodImage) formData.append('image', prodImage);

      const token = localStorage.getItem('token');
      const url = editingProductId 
        ? `${API_URL}/api/products/${editingProductId}` 
        : `${API_URL}/api/products`;

      const res = await fetch(url, {
        method: editingProductId ? 'PUT' : 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error('Erro ao salvar produto');

      const savedProduct = await res.json();
      if (editingProductId) {
        setCategoryProducts((prev) => prev.map(p => p.id === editingProductId ? savedProduct : p));
      } else {
        setCategoryProducts((prev) => [...prev, savedProduct]);
      }
      closeProdModal();
    } catch (err) {
      alert('Não foi possível salvar o produto.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Tem certeza de que deseja excluir este produto?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      setCategoryProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Não foi possível excluir o produto.');
    }
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      alert('O nome da categoria é obrigatório.');
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', newName);
      if (newImage) formData.append('image', newImage);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      const createdCategory = await res.json();
      setCategories((prev) => [...prev, createdCategory]);
      closeModal();
    } catch (err) {
      alert('Não foi possível salvar a categoria.');
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setNewName('');
    setNewImage(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-full bg-gray-100 flex flex-col">
      <Header title="Painel Admin" showBack hideFavorites hideSearch hideCart />
      
      <div className="p-4 flex-1">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-4">{error}</p>}

        {loading ? (
          <p className="text-sm text-gray-500 text-center py-4">Carregando categorias...</p>
        ) : !selectedCategory ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Categorias</h1>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition flex items-center gap-1"
              >
                <span className="material-icons text-[1rem]">add</span>
                Adicionar
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat)}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-contain rounded-md" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <span className="material-icons text-gray-400">category</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                      <p className="text-[0.65rem] text-gray-500 mt-0.5">{cat.slug}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{cat.productCount} produtos</span>
                </div>
              ))}
            </div>

            {/* Usuários */}
            <div className="flex items-center justify-between mb-4 mt-8">
              <h1 className="text-xl font-bold text-gray-900">Usuários</h1>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition flex items-center gap-1"
              >
                <span className="material-icons text-[1rem]">person_add</span>
                Novo usuário
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm">
              {users.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">Nenhum usuário cadastrado.</p>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <span className="material-icons text-[1.2rem]">person</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                        <p className="text-[0.65rem] text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md shrink-0 ml-2">#{u.clientNumber}</span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedCategory(null)} 
                  className="w-8 h-8 rounded-full bg-white shadow-sm text-gray-700 flex items-center justify-center active:scale-95 transition"
                >
                  <span className="material-icons text-[1.2rem]">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-gray-900 truncate max-w-[150px]">{selectedCategory.name}</h1>
              </div>
              <button 
                onClick={() => setIsAddProductModalOpen(true)}
                className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition flex items-center gap-1"
              >
                <span className="material-icons text-[1rem]">add</span>
                Produto
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm">
              {loadingProducts ? (
                <p className="text-sm text-gray-500 text-center py-6">Carregando produtos...</p>
              ) : categoryProducts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">Nenhum produto cadastrado nesta categoria.</p>
              ) : (
                categoryProducts.map((product) => {
                  const [reais, centavos] = Number(product.price).toFixed(2).split('.');
                  return (
                    <div key={product.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-contain rounded-md shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                            <span className="material-icons text-gray-400">local_drink</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate flex items-center gap-1.5">
                            {product.name}
                            {product.isFeatured && product.comparePrice != null && (
                              <span className="shrink-0 text-[0.6rem] font-bold text-red-600 bg-red-50 rounded-full px-1.5 py-0.5 uppercase">Promo</span>
                            )}
                          </p>
                          <p className="text-[0.65rem] text-gray-500 mt-0.5">
                            {product.volume ? (product.volume >= 1000 ? `${(product.volume / 1000).toString().replace('.', ',')} L` : `${product.volume} ml`) : ''}
                            {product.volume && product.packageType ? ' • ' : ''}
                            <span className="capitalize">{product.packageType || (product.unit === 'un' ? 'Unidade' : product.unit)}</span>
                          </p>
                          <p className="text-xs font-bold text-gray-900 mt-0.5">
                            R$ {reais},{centavos}
                            {product.isFeatured && product.comparePrice != null && (
                              <span className="ml-1.5 text-[0.65rem] font-normal text-gray-400 line-through">R$ {Number(product.comparePrice).toFixed(2).replace('.', ',')}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <button 
                          onClick={() => openEditProdModal(product)} 
                          className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center active:scale-95 transition hover:bg-blue-100"
                        >
                          <span className="material-icons text-[1.1rem]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center active:scale-95 transition hover:bg-red-100"
                        >
                          <span className="material-icons text-[1.1rem]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal Adicionar Categoria */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-pop-in">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Nova Categoria</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome</label>
                <input 
                  type="text" 
                  placeholder="Ex: Refrigerantes" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Imagem</label>
                <label className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-red-400 hover:text-red-500 transition cursor-pointer overflow-hidden aspect-square w-48 mx-auto relative">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center p-4 text-center">
                      <span className="material-icons mb-2 text-[2rem] opacity-70">cloud_upload</span>
                      <span className="text-sm font-bold">Escolher imagem</span>
                      <span className="text-[0.7rem] mt-1 opacity-70">PNG, JPG, WEBP (Máx: 2MB)</span>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                </label>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition active:scale-95">Cancelar</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white text-sm font-bold shadow-sm hover:bg-red-700 transition active:scale-95 disabled:opacity-60">
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Produto */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-pop-in my-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-5">{editingProductId ? 'Editar Produto' : 'Novo Produto'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do produto</label>
                <input type="text" placeholder="Ex: Coca-Cola 2L" value={prodName} onChange={e => setProdName(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium" />
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preço (R$)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Volume (ml)</label>
                  <input type="number" placeholder="Ex: 350" value={prodVolume} onChange={e => setProdVolume(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium" />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Embalagem</label>
                  <select value={prodPackage} onChange={e => setProdPackage(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium bg-white">
                    <option value="" disabled>Selecione</option>
                    <option value="pet">Pet</option>
                    <option value="lata">Lata</option>
                    <option value="garrafa">Garrafa</option>
                    <option value="display">Display</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unidades por caixa</label>
                  <input type="number" placeholder="Ex: 12" value={prodUnitCount} onChange={e => setProdUnitCount(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium" />
                </div>
              </div>

              {/* Promoção */}
              <div className="border border-gray-200 rounded-xl p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <span className="material-icons text-red-600 text-[1.2rem]">sell</span>
                    Colocar em promoção
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prodIsPromo}
                    onClick={() => setProdIsPromo(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition ${prodIsPromo ? 'bg-red-600' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prodIsPromo ? 'translate-x-5' : ''}`} />
                  </button>
                </label>
                {prodIsPromo && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preço promocional (R$)</label>
                    <input type="number" step="0.01" placeholder="0.00" value={prodPromoPrice} onChange={e => setProdPromoPrice(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium" />
                    <p className="text-[0.7rem] text-gray-500 mt-1.5">O preço normal (R$ {prodPrice || '0.00'}) aparecerá riscado. O produto será exibido na Home e na categoria Promoções.</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Imagem</label>
                <label className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-red-400 hover:text-red-500 transition cursor-pointer overflow-hidden aspect-square w-32 mx-auto relative">
                  {prodPreview ? (
                    <img src={prodPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center p-4 text-center">
                      <span className="material-icons mb-1 text-[2rem] opacity-70">add_a_photo</span>
                      <span className="text-xs font-bold">Foto</span>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleProdImageChange} />
                </label>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button onClick={closeProdModal} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition active:scale-95">Cancelar</button>
              <button onClick={handleSaveProduct} disabled={isSavingProduct} className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white text-sm font-bold shadow-sm hover:bg-red-700 transition active:scale-95 disabled:opacity-60">
                {isSavingProduct ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Usuário */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-pop-in my-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Novo Usuário</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome</label>
                <input type="text" placeholder="Ex: João da Silva" value={userName} onChange={e => setUserName(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input type="email" placeholder="email@exemplo.com" value={userEmail} onChange={e => setUserEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
                <input type="password" placeholder="Mínimo 6 caracteres" value={userPassword} onChange={e => setUserPassword(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium" />
              </div>

              <div className="flex gap-3">
                <div className="w-28">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo</label>
                  <select value={userDocType} onChange={e => setUserDocType(e.target.value as 'CPF' | 'CNPJ')} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium bg-white">
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Documento</label>
                  <input type="text" placeholder={userDocType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'} value={userDocument} onChange={e => setUserDocument(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone</label>
                <input type="text" placeholder="+55 (41) 99999-9999" value={userPhone} onChange={e => setUserPhone(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm text-gray-900 font-medium" />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={closeUserModal} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition active:scale-95">Cancelar</button>
              <button onClick={handleSaveUser} disabled={isSavingUser} className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white text-sm font-bold shadow-sm hover:bg-red-700 transition active:scale-95 disabled:opacity-60">
                {isSavingUser ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}