import { useState, useEffect } from 'react';
import NeuralBackground from './components/NeuralBackground';
import LinkButton from './components/LinkButton';
import PatientChat from './components/PatientChat';
import { DOCTOR, LINK_BUTTONS } from './constants';

// ─── Ícone de localização ────────────────────────────────────
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 inline-block mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ─── App ─────────────────────────────────────────────────────
export default function App() {
  const [activeModal, setActiveModal] = useState(null); // null | 'patient'
  const [loadingId, setLoadingId] = useState(null);     // null | button.id

  // Bloquear scroll quando modal aberto
  useEffect(() => {
    if (activeModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [activeModal]);

  function handleButtonClick(button) {
    if (!button.openChat) {
      window.open(button.url, '_blank', 'noopener,noreferrer');
      return;
    }
    // Loading de 600ms antes de abrir o chat
    setLoadingId(button.id);
    setTimeout(() => {
      setLoadingId(null);
      setActiveModal('patient');
    }, 600);
  }

  function handleCloseModal() {
    setActiveModal(null);
  }

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center px-4 py-10 overflow-x-hidden">
      {/* Canvas animado */}
      <NeuralBackground />

      {/* Conteúdo principal */}
      <main
        className="relative z-10 flex flex-col items-center w-full max-w-sm gap-8"
        style={{ zIndex: 1 }}
      >
        {/* ── Header / Perfil ── */}
        <header className="flex flex-col items-center text-center gap-3 animate-fade-in-down">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600/30 to-purple-900/50 border-2 border-violet-500/50 flex items-center justify-center text-4xl shadow-lg shadow-violet-900/40">
              🧠
            </div>
            {/* Indicador online */}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-black" aria-label="Online" />
          </div>

          {/* Nome com gradiente */}
          <h1 className="text-2xl sm:text-3xl font-bold font-exo bg-gradient-to-r from-white via-purple-100 to-slate-300 bg-clip-text text-transparent leading-tight">
            {DOCTOR.name}
          </h1>

          {/* Badge CRM */}
          <span className="font-orbitron text-xs tracking-widest text-violet-400 border border-violet-500/40 rounded-full px-3 py-1 bg-violet-900/20">
            {DOCTOR.crm}
          </span>

          {/* Especialidade */}
          <p className="text-slate-300 font-exo font-semibold text-lg">
            {DOCTOR.specialty}
          </p>

          {/* Descrição */}
          <p className="text-slate-400 text-sm font-inter max-w-xs leading-relaxed">
            {DOCTOR.description}
          </p>

          {/* Localidades */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
            {DOCTOR.locations.map((loc) => (
              <span key={loc} className="text-xs text-slate-500 font-inter">
                <PinIcon />
                {loc}
              </span>
            ))}
          </div>
        </header>

        {/* ── Divider ── */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

        {/* ── Botões ── */}
        <section
          className="flex flex-col items-center gap-3 w-full"
          aria-label="Links de agendamento"
        >
          {LINK_BUTTONS.map((btn) => (
            <LinkButton
              key={btn.id}
              button={btn}
              loading={loadingId}
              onClick={handleButtonClick}
            />
          ))}
        </section>

        {/* ── Bio / Trajetória ── */}
        <section className="w-full bg-white/3 border border-white/8 rounded-2xl p-4 animate-fade-in-up">
          <h2 className="text-xs font-orbitron tracking-widest text-violet-400 mb-3 uppercase">
            Trajetória
          </h2>
          <ul className="space-y-2">
            {DOCTOR.bio.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400 font-inter">
                <span className="text-violet-500 mt-0.5 flex-shrink-0">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-slate-600 font-inter pb-2">
          © {new Date().getFullYear()} Dr. Andrey Rocca — Psiquiatra
        </footer>
      </main>

      {/* ── Modal PatientChat ── */}
      {activeModal === 'patient' && (
        <PatientChat onClose={handleCloseModal} />
      )}
    </div>
  );
}
