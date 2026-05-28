import { useState } from 'react';
import OrderCard from '../components/OrderCard';
import type { OrderData } from '../components/OrderCard';

type Tab = 'andamento' | 'historico';

const sampleOrders: OrderData[] = [
  {
    orderNumber: '40028922',
    status: 'andamento',
    dateLabel: '10 janeiro',
    createdAt: '10 janeiro 2026 - 12:02',
    total: '1398,99',
  },
  {
    orderNumber: '40028921',
    status: 'entregue',
    dateLabel: '01 janeiro',
    createdAt: '01 janeiro 2026 - 12:42',
    deliveredAt: '02 janeiro 2026 - 10:05',
    total: '358,50',
  },
  {
    orderNumber: '40028922',
    status: 'cancelado',
    dateLabel: '01 janeiro',
    createdAt: '01 janeiro 2026 - 12:32',
    cancelledAt: '01 janeiro 2026 - 13:02',
    total: '999,99',
  },
];

function SadBagIllustration() {
  return (
    <svg viewBox="0 0 280 230" className="w-60 h-52" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* Left cloud - outline style */}
      <g opacity="0.45" stroke="#b0b5bc" strokeWidth="1.2" fill="white">
        <path d="M30 100 Q30 88 42 86 Q40 76 52 74 Q64 72 66 82 Q76 78 78 88 Q82 98 72 100 Z" />
      </g>

      {/* Right cloud - outline style */}
      <g opacity="0.45" stroke="#b0b5bc" strokeWidth="1.2" fill="white">
        <path d="M198 88 Q198 76 210 74 Q208 64 220 62 Q232 60 234 70 Q244 66 246 76 Q250 86 240 88 Z" />
      </g>

      {/* Small cloud top-right */}
      <g opacity="0.3" stroke="#c0c4ca" strokeWidth="1" fill="white">
        <path d="M216 46 Q216 38 224 36 Q222 30 230 28 Q238 27 239 33 Q245 30 247 36 Q249 42 243 44 Z" />
      </g>

      {/* Ground line left */}
      <line x1="42" y1="192" x2="72" y2="192" stroke="#d0d0d0" strokeWidth="1" strokeLinecap="round" />
      {/* Ground line right */}
      <line x1="208" y1="192" x2="238" y2="192" stroke="#d0d0d0" strokeWidth="1" strokeLinecap="round" />

      {/* Bag shadow */}
      <ellipse cx="140" cy="194" rx="52" ry="4" fill="#e8e8e8" />

      {/* Bag body */}
      <path
        d="M88 92 L84 180 Q84 190 94 190 L186 190 Q196 190 196 180 L192 92 Z"
        fill="#f7f7f7"
        stroke="#a3a3a3"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Bag fold/crease at top */}
      <line x1="90" y1="98" x2="190" y2="98" stroke="#d4d4d4" strokeWidth="0.8" />

      {/* Bag handles */}
      <path
        d="M108 92 C108 68 118 58 140 58"
        fill="none" stroke="#a3a3a3" strokeWidth="1.6" strokeLinecap="round"
      />
      <path
        d="M172 92 C172 68 162 58 140 58"
        fill="none" stroke="#a3a3a3" strokeWidth="1.6" strokeLinecap="round"
      />

      {/* Face - left eye */}
      <circle cx="118" cy="132" r="3" fill="#8a8a8a" />
      {/* Face - right eye */}
      <circle cx="162" cy="132" r="3" fill="#8a8a8a" />

      {/* Face - disappointed squiggly mouth */}
      <path
        d="M124 155 Q130 150 136 154 Q140 156 144 152 Q148 149 156 154"
        fill="none" stroke="#8a8a8a" strokeWidth="1.8" strokeLinecap="round"
      />

    </svg>
  );
}

export default function Order() {
  const [activeTab, setActiveTab] = useState<Tab>('andamento');

  return (
    <div className="min-h-full bg-gray-100 px-4 py-5 flex flex-col">

      {/* Tabs */}
      <div className="relative flex bg-gray-200 rounded-full mb-6 p-1">
        {/* Sliding indicator */}
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#5c2e2e] rounded-full transition-all duration-300 ease-in-out"
          style={{ left: activeTab === 'andamento' ? '4px' : 'calc(50% + 0px)' }}
        />
        <button
          onClick={() => setActiveTab('andamento')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors duration-300 rounded-full ${
            activeTab === 'andamento'
              ? 'text-white'
              : 'text-gray-500'
          }`}
        >
          <span className="material-icons text-[1.2rem]">local_shipping</span>
          Em andamento
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors duration-300 rounded-full ${
            activeTab === 'historico'
              ? 'text-white'
              : 'text-gray-500'
          }`}
        >
          <span className="material-icons text-[1.2rem]">schedule</span>
          Histórico
        </button>
      </div>

      {activeTab === 'historico' ? (
        /* Order history list */
        <div className="flex flex-col gap-4 pb-4">
          {sampleOrders.map((order, index) => (
            <OrderCard key={index} order={order} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-10">
          <p className="text-gray-500 text-sm mb-6">
            Você não tem nenhum pedido em entrega
          </p>

          <SadBagIllustration />

          <button
            onClick={() => window.history.back()}
            className="mt-8 bg-red-600 text-white font-semibold py-3 rounded-full w-[60%] text-sm hover:bg-red-700 transition-colors"
          >
            ← Voltar
          </button>
        </div>
      )}

    </div>
  );
}
