import { useState, useEffect, useRef, useCallback } from 'react';
import { buildWhatsAppLink, GOOGLE_SHEETS_URL } from '../constants';

// ─── Etapas do fluxo ────────────────────────────────────────
const STEP = {
  NOME: 0,
  MODALIDADE: 1,
  CONDICOES: 2,
  WHATSAPP: 3,
  FINALIZADO: 4,
};

// ─── Opções de modalidade ────────────────────────────────────
const MODALIDADE_OPTIONS = [
  { id: 'brasilia', label: '🏥 Presencial — Brasília', value: 'Presencial — Brasília/DF' },
  { id: 'goiania', label: '🏥 Presencial — Goiânia', value: 'Presencial — Goiânia/GO' },
  { id: 'online', label: '💻 Online (Telemedicina)', value: 'Online — Telemedicina' },
];

// ─── Componente de bolha de mensagem ─────────────────────────
function Bubble({ from, children }) {
  const isLia = from === 'lia';
  return (
    <div
      className={`flex ${isLia ? 'justify-start' : 'justify-end'} animate-message-appear`}
    >
      <div
        className={`
          max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-inter
          ${isLia
            ? 'bg-violet-900/40 border border-violet-500/30 text-slate-100 rounded-tl-sm'
            : 'bg-violet-600/70 text-white rounded-tr-sm'
          }
        `}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Indicador de digitação ──────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start animate-message-appear">
      <div className="bg-violet-900/40 border border-violet-500/30 px-4 py-3 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Envio para Google Sheets ────────────────────────────────
function sendToSheets(payload) {
  if (!GOOGLE_SHEETS_URL) return;
  fetch(GOOGLE_SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    // silencia erros de rede — no-cors não retorna resposta
  });
}

// ─── PatientChat ─────────────────────────────────────────────
export default function PatientChat({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(STEP.NOME);
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [userData, setUserData] = useState({
    nome: '',
    modalidade: '',
    respostaValor: '',
    whatsapp: '',
  });
  const [viewportHeight, setViewportHeight] = useState('100dvh');
  const [waLink, setWaLink] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initialized = useRef(false);

  // ── Ajuste de altura para teclado virtual no mobile ─────────
  useEffect(() => {
    function handleResize() {
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
      }
    }
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    handleResize();
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  // ── Scroll automático ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ── Adicionar mensagem com delay de digitação ────────────────
  const addLiaMessage = useCallback((text, delay = 700) => {
    return new Promise((resolve) => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, { from: 'lia', text }]);
        resolve();
      }, delay);
    });
  }, []);

  // ── Mensagem de boas-vindas (etapa 0) ───────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function welcome() {
      await addLiaMessage(
        'Olá! Sou a Lia 🧠, assistente virtual do Dr. Andrey Rocca.\nVou agilizar o seu pré-agendamento. Para começar, qual é o seu nome completo?',
        800
      );
    }
    welcome();
  }, [addLiaMessage]);

  // ── Foco no input após mensagem ──────────────────────────────
  useEffect(() => {
    if (!typing && (step === STEP.NOME || step === STEP.WHATSAPP)) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [typing, step]);

  // ── Submeter nome ────────────────────────────────────────────
  async function handleNomeSubmit(e) {
    e.preventDefault();
    const nome = inputValue.trim();
    if (!nome) return;

    setMessages((prev) => [...prev, { from: 'user', text: nome }]);
    setInputValue('');
    setUserData((prev) => ({ ...prev, nome }));
    setStep(STEP.MODALIDADE);

    await addLiaMessage(
      `Prazer, ${nome}! O Dr. Andrey atende presencialmente em Brasília e Goiânia, e online para todo o Brasil.\n\nQual modalidade você prefere?`,
      900
    );
  }

  // ── Selecionar modalidade ────────────────────────────────────
  async function handleModalidade(option) {
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: option.label },
    ]);
    setUserData((prev) => ({ ...prev, modalidade: option.value }));
    setStep(STEP.CONDICOES);

    await addLiaMessage(
      `Ótima escolha! Veja o que está incluso:\n\n✅ Consulta completa com o Dr. Andrey Rocca\n✅ Acesso ao WhatsApp do Dr. Andrey durante o acompanhamento\n💳 Valor: R$ 1.100,00 (à vista ou 2x sem juros)\n⚠️  Não inclui consulta de retorno\n\nPodemos prosseguir com o pré-agendamento?`,
      1000
    );
  }

  // ── Resposta sobre valor ─────────────────────────────────────
  async function handleRespostaValor(resposta) {
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: resposta === 'sim' ? '✅ Sim, quero agendar' : '🤔 Tenho uma dúvida' },
    ]);
    setUserData((prev) => ({ ...prev, respostaValor: resposta }));
    setStep(STEP.WHATSAPP);

    if (resposta === 'sim') {
      await addLiaMessage('Perfeito! Qual é o seu WhatsApp com DDD?', 700);
    } else {
      await addLiaMessage(
        'Sem problemas! Informe seu WhatsApp que nossa equipe entra em contato para tirar suas dúvidas.',
        700
      );
    }
  }

  // ── Submeter WhatsApp e finalizar ────────────────────────────
  async function handleWhatsAppSubmit(e) {
    e.preventDefault();
    const whatsapp = inputValue.trim();
    if (!whatsapp) return;

    setMessages((prev) => [...prev, { from: 'user', text: whatsapp }]);
    setInputValue('');

    const finalData = { ...userData, whatsapp };
    setUserData(finalData);
    setStep(STEP.FINALIZADO);

    // Gerar link WhatsApp
    const link = buildWhatsAppLink({
      nome: finalData.nome,
      modalidade: finalData.modalidade,
      whatsapp: finalData.whatsapp,
    });
    setWaLink(link);

    // Enviar para Google Sheets
    sendToSheets({
      Nome: finalData.nome,
      Modalidade: finalData.modalidade,
      WhatsApp: finalData.whatsapp,
      Resposta_Valor: finalData.respostaValor,
      Origem: 'Lia ChatBot - Link Bio',
      Data: new Date().toLocaleString('pt-BR'),
    });

    await addLiaMessage(
      `Tudo pronto, ${finalData.nome}! 📋 Clique abaixo para enviar seu pedido pelo WhatsApp e escolher o melhor horário.`,
      900
    );
  }

  // ── Altura do modal ──────────────────────────────────────────
  const modalHeight = window.innerWidth < 640 ? viewportHeight : '580px';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-md flex flex-col bg-gray-950 border border-violet-500/30 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-violet-900/30"
        style={{ height: modalHeight }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-violet-500/20 bg-black/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-lg">
              🧠
            </div>
            <div>
              <p className="text-sm font-semibold text-white font-exo">Lia</p>
              <p className="text-xs text-violet-400 font-inter">Assistente do Dr. Andrey Rocca</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            aria-label="Fechar chat"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Mensagens ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {messages.map((msg, i) => (
            <Bubble key={i} from={msg.from}>
              {msg.text.split('\n').map((line, j) => (
                <span key={j}>
                  {line}
                  {j < msg.text.split('\n').length - 1 && <br />}
                </span>
              ))}
            </Bubble>
          ))}

          {typing && <TypingIndicator />}

          {/* Botões de ação inline */}
          {!typing && step === STEP.MODALIDADE && (
            <div className="flex flex-col gap-2 animate-message-appear pt-1">
              {MODALIDADE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleModalidade(opt)}
                  className="text-left px-4 py-2.5 rounded-xl bg-violet-900/30 border border-violet-500/30 text-slate-200 text-sm hover:bg-violet-800/40 hover:border-violet-400/50 transition-all font-inter"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {!typing && step === STEP.CONDICOES && (
            <div className="flex gap-2 animate-message-appear pt-1">
              <button
                onClick={() => handleRespostaValor('sim')}
                className="flex-1 px-3 py-2.5 rounded-xl bg-violet-600/30 border border-violet-500/40 text-slate-200 text-sm hover:bg-violet-600/50 transition-all font-inter"
              >
                ✅ Sim, quero agendar
              </button>
              <button
                onClick={() => handleRespostaValor('duvida')}
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all font-inter"
              >
                🤔 Tenho uma dúvida
              </button>
            </div>
          )}

          {!typing && step === STEP.FINALIZADO && waLink && (
            <div className="flex flex-col gap-3 animate-message-appear pt-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-all animate-pulse hover:animate-none font-inter shadow-lg shadow-green-900/40"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Agendar pelo WhatsApp
              </a>
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm hover:text-slate-200 hover:bg-white/10 transition-all font-inter"
              >
                Voltar aos Links
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        {(step === STEP.NOME || step === STEP.WHATSAPP) && !typing && (
          <form
            onSubmit={step === STEP.NOME ? handleNomeSubmit : handleWhatsAppSubmit}
            className="flex items-center gap-2 px-4 py-3 border-t border-violet-500/20 bg-black/30 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type={step === STEP.WHATSAPP ? 'tel' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                step === STEP.NOME ? 'Seu nome completo...' : 'WhatsApp com DDD...'
              }
              className="flex-1 bg-white/5 border border-violet-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-400/60 focus:bg-white/8 transition-all font-inter"
              autoComplete={step === STEP.WHATSAPP ? 'tel' : 'name'}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
              aria-label="Enviar"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
