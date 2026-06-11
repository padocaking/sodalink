import { useState } from 'react';
import { login, type AuthUser } from '../auth';

export default function Login({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-dvh overflow-y-auto bg-red-600 flex flex-col items-center justify-center px-4 py-8">
      {/* Brand */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-white tracking-wide">Sodalink</h1>
        <p className="mt-2 text-red-100 text-sm">Bebidas geladas até você</p>
      </div>

      {/* Form card */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Entrar</h2>

          <div>
            <label htmlFor="email" className="block text-xs text-gray-500 mb-1">Email</label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-red-600">
              <span className="material-icons text-gray-500 text-[1.3rem]">email</span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                className="w-full text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-gray-500 mb-1">Senha</label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-red-600">
              <span className="material-icons text-gray-500 text-[1.3rem]">lock</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0"
              >
                <span className="material-icons text-gray-400 text-[1.3rem]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-xl shadow-sm active:scale-[0.98] transition disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <button type="button" className="w-full text-sm text-gray-500 underline py-1">
            Esqueci minha senha
          </button>
        </form>
      </div>
    </div>
  );
}
