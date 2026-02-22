// ─── Perfil do médico ────────────────────────────────────────
export const DOCTOR = {
  name: 'Dr. Andrey Rocca',
  specialty: 'Psiquiatra',
  crm: 'CRM-DF 32154 | RQE 23030',
  description: 'Psiquiatra da Câmara dos Deputados · transtornobipolar.net',
  icon: '🧠',
  whatsapp: '5561993381313',

  bio: [
    'Residência em Psiquiatria — UFG / Hospital das Clínicas de Goiânia',
    'Residência em Terapia Comportamental — PUC-RS',
    'Psiquiatra da Câmara dos Deputados (aprovado em 1º lugar nacional)',
    'Supervisor de residentes — UFG e Universidade de Brasil',
    'Especialista em Transtornos de Humor: depressão e bipolaridade',
    'Fundador do portal transtornobipolar.net',
    'Criador do app Eixo Bipolar (monitoramento de humor com IA)',
  ],

  locations: [
    'Presencial — Brasília/DF',
    'Presencial — Goiânia/GO',
    'Online — Telemedicina para todo o Brasil',
  ],

  consultaValor: 'R$ 1.100,00',
  consultaInfo: [
    'À vista: Pix ou cartão de crédito',
    'Parcelado: 2x sem juros no cartão',
    'Não inclui consulta de retorno',
    'Inclui acesso ao WhatsApp do Dr. Andrey durante todo o acompanhamento',
  ],
};

// ─── Botões do link bio ──────────────────────────────────────
export const LINK_BUTTONS = [
  {
    id: 'consulta',
    label: 'Agendar Consulta Particular',
    subLabel: 'Atendimento Presencial e Online · Brasília e Goiânia',
    url: '#',
    primary: true,
    openChat: true,
  },
];

// ─── Mensagem WhatsApp pré-preenchida ────────────────────────
export function buildWhatsAppLink({ nome, modalidade, whatsapp }) {
  const texto = `Olá, sou ${nome}. Vim pelo site e finalizei o pré-agendamento com a Lia.\nModalidade: ${modalidade}\nMeu WhatsApp: ${whatsapp}`;
  return `https://api.whatsapp.com/send?phone=${DOCTOR.whatsapp}&text=${encodeURIComponent(texto)}`;
}

// ─── Variáveis de ambiente ───────────────────────────────────
export const GOOGLE_SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || '';
