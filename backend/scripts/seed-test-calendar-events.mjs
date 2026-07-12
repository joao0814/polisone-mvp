const baseUrl = process.env.API_URL ?? 'http://localhost:3000';
const credentials = {
  email: 'comunicados.e2e.20260710@polisone.local',
  password: 'Teste@123456',
};

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${JSON.stringify(data)}`);
  return data;
}

const session = await request('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(credentials),
});

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  Authorization: `Bearer ${session.access_token}`,
};

const items = [
  {
    title: 'Treinamento com coordenadores',
    description: 'Alinhar metas da semana e revisar os materiais da campanha.',
    eventDate: '2026-07-16',
    allDay: false,
    startTime: '09:00',
    endTime: '10:30',
    category: 'Campanha',
    status: 'active',
  },
  {
    title: 'Visita a liderancas locais',
    description: 'Agenda externa com equipe de articulacao.',
    eventDate: '2026-07-18',
    allDay: false,
    startTime: '14:00',
    endTime: '16:00',
    category: 'Agenda externa',
    status: 'completed',
  },
  {
    title: 'Revisao de planejamento',
    description: 'Fechamento do cronograma da semana seguinte.',
    eventDate: '2026-07-26',
    allDay: true,
    category: 'Interno',
    status: 'canceled',
  },
];

for (const item of items) {
  const created = await request('/admin/calendar-events', {
    method: 'POST',
    headers,
    body: JSON.stringify(item),
  });
  console.log(`${created.id} ${created.title}`);
}
