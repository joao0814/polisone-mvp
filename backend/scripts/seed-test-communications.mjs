const baseUrl = process.env.API_URL ?? 'http://localhost:3000';
const credentials = { email: 'comunicados.e2e.20260710@polisone.local', password: 'Teste@123456' };

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${JSON.stringify(data)}`);
  return data;
}

const session = await request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(credentials) });
const headers = { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${session.access_token}` };
const categories = await request('/communications/categories', { headers });
const categoryBySlug = Object.fromEntries(categories.map((category) => [category.slug, category.id]));
const items = [
  { title: 'Encontro regional reúne lideranças e equipes', description: 'Confira os principais encaminhamentos definidos durante o encontro regional desta semana.', content: '<p>O encontro reuniu lideranças, coordenadores e equipes de campo para alinhar prioridades e organizar as próximas ações.</p><p>Durante a reunião, foram apresentadas as demandas dos municípios e definidos os responsáveis por cada frente de trabalho.</p>', categoryId: categoryBySlug.agenda, tags: ['agenda', 'equipes', 'municípios'] },
  { title: 'Novas orientações para as atividades de campo', description: 'As equipes devem conferir os horários, pontos de encontro e materiais necessários para as próximas ações.', content: '<p>Antes de iniciar as atividades, confirme o horário e o ponto de encontro com a coordenação da sua região.</p><p>Em caso de dúvida, procure o responsável local para receber as orientações atualizadas.</p>', categoryId: categoryBySlug.avisos, tags: ['aviso', 'campo', 'orientações'] },
  { title: 'PolisOne amplia recursos para organização da campanha', description: 'A plataforma passa a concentrar comunicados, chamados e informações estratégicas em um único ambiente.', content: '<p>O PolisOne continua evoluindo para facilitar a rotina das equipes e melhorar o acesso às informações oficiais.</p><p>Os novos recursos permitem acompanhar comunicados, registrar chamados e consultar dados importantes com mais agilidade.</p>', categoryId: categoryBySlug.institucional, tags: ['institucional', 'plataforma', 'novidades'] },
];

for (const item of items) {
  const created = await request('/admin/communications', { method: 'POST', headers, body: JSON.stringify(item) });
  await request(`/admin/communications/${created.id}/publish`, { method: 'POST', headers });
  console.log(`${created.id} ${created.title}`);
}
