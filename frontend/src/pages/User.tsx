import { useNavigate } from 'react-router-dom';
import type { AuthUser } from '../auth';

const mi = (name: string) => (
  <span className="material-icons text-gray-500 text-[1.3rem]">{name}</span>
);

const miLg = (name: string) => (
  <span className="material-icons text-gray-700 text-[2rem]">{name}</span>
);

function AvatarPlaceholder() {
  return (
    <div className="w-28 h-28 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="white">
        <circle cx="50" cy="36" r="20" />
        <ellipse cx="50" cy="90" rx="34" ry="24" />
      </svg>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function AccountRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="shrink-0">{icon}</div>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
      <span className="text-gray-400 font-medium">&rsaquo;</span>
    </button>
  );
}

export default function User({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const navigate = useNavigate();
  const userData = user;
  return (
    <div className="min-h-full bg-gray-100 px-4 py-5 space-y-5">

      {/* Perfil section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Perfil</h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm">

          <div className="flex flex-col items-center mb-5">
            <AvatarPlaceholder />
            <p className="mt-3 text-sm text-gray-500">Olá,</p>
            <p className="text-xl font-bold text-gray-800 tracking-wide">{userData.name}</p>
          </div>

          <div>
            <InfoRow icon={mi('badge')}          label="Número de cliente:" value={userData.clientNumber} />
            <InfoRow icon={mi('verified_user')}  label="CNPJ ou CPF:"       value={userData.document} />
            <InfoRow icon={mi('email')}           label="Email:"             value={userData.email} />
            <InfoRow icon={mi('smartphone')}      label="Telefone:"          value={userData.phone} />
          </div>
        </div>
      </section>

      {/* Minha conta section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Minha conta</h2>
        <div className="bg-white rounded-2xl px-5 shadow-sm">
          <AccountRow icon={miLg('monetization_on')} label="Meu crédito" />
          <AccountRow icon={miLg('local_shipping')}  label="Meus pedidos" onClick={() => navigate('/pedido')} />
          <AccountRow icon={miLg('receipt')}          label="Meus Boletos" />
          <AccountRow icon={miLg('star_border')}      label="Premia" />
          <AccountRow icon={miLg('chat_bubble_outline')} label="Mudar idioma" />
        </div>
      </section>

      {/* Suporte section */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Suporte</h2>
        <div className="bg-white rounded-2xl px-5 shadow-sm">
          <AccountRow icon={miLg('help_outline')} label="Central de Ajuda" />
          <AccountRow icon={miLg('phone')}         label="Contato" />
          <AccountRow icon={miLg('settings')}      label="Configuração" />
        </div>
      </section>

      {/* Legal section */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Legal</h2>
        <div className="bg-white rounded-2xl px-5 shadow-sm">
          <AccountRow icon={miLg('info_outline')} label="Aviso de Privacidade" />
          <AccountRow icon={miLg('info_outline')} label="Termos e condições" />
        </div>
      </section>

      {/* Footer */}
      <div className="pt-1 pb-4">
        <button onClick={onLogout} className="text-base font-bold underline text-gray-800 mb-1">Sair</button>
        <p className="text-sm text-gray-400">Versão 0.0.1.000000</p>
      </div>

    </div>
  );
}
