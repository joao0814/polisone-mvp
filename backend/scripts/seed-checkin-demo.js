const { Client } = require('pg');
const { randomUUID } = require('crypto');

const SEED_TAG = '[seed-checkin-demo]';
const TARGET_EMAIL = 'joaopmfranca@gmail.com';

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'polisone',
  });

  await client.connect();

  try {
    await client.query('BEGIN');

    const campaign = await getTargetCampaign(client);
    const teams = await getTeams(client, campaign.id);

    if (!teams.length) {
      throw new Error('Nenhuma equipe encontrada para a campanha alvo.');
    }

    await cleanupPreviousSeed(client, campaign.id);

    const leaders = await ensureSeedLeaders(client, campaign.id, teams);
    const representatives = teams.flatMap((team) =>
      team.members.map((member) => ({
        kind: 'REPRESENTATIVE',
        id: member.id,
        name: member.name,
        memberId: member.id,
        teamId: team.id,
        cityIbgeCode: team.cityIbgeCode,
        cityName: team.cityName,
        state: team.state,
      })),
    );

    if (!representatives.length) {
      throw new Error('Nenhum representante encontrado para semear check-ins.');
    }

    const leaderPeople = leaders.map((leader) => ({
      kind: 'LEADER',
      id: leader.id,
      name: leader.name,
      memberId: null,
      teamId: findTeamForCity(teams, leader.cityIbgeCode)?.id || teams[0].id,
      cityIbgeCode: leader.cityIbgeCode,
      cityName: leader.cityName,
      state: leader.state,
    }));

    const openPeople = uniquePeople([...leaderPeople, ...representatives]).slice(0, 14);
    const closedPeople = uniquePeople([...representatives.slice(14), ...leaderPeople]).slice(0, 12);
    const historyPeople = uniquePeople([...representatives.slice(30), ...leaderPeople]).slice(0, 8);

    const checkIns = [
      ...openPeople.map((person, index) =>
        buildCheckInRow(campaign.id, person, {
          status: 'CHECKED_IN',
          activityType: activityTypeFor(index),
          checkedInAt: dateWithOffset({ dayOffset: 0, hour: 8 + (index % 6), minute: (index * 7) % 60 }),
          notes: `${SEED_TAG} check-in aberto ${index + 1}`,
        }),
      ),
      ...closedPeople.slice(0, 8).map((person, index) => {
        const checkedInAt = dateWithOffset({
          dayOffset: 0,
          hour: 7 + (index % 5),
          minute: (index * 9) % 60,
        });

        return buildCheckInRow(campaign.id, person, {
          status: 'CHECKED_OUT',
          activityType: activityTypeFor(index + 20),
          checkedInAt,
          checkedOutAt: addHours(checkedInAt, 3 + (index % 3)),
          notes: `${SEED_TAG} check-out concluido ${index + 1}`,
        });
      }),
      ...closedPeople.slice(8, 12).map((person, index) =>
        buildCheckInRow(campaign.id, person, {
          status: 'CANCELED',
          activityType: activityTypeFor(index + 40),
          checkedInAt: dateWithOffset({
            dayOffset: 0,
            hour: 9 + index,
            minute: (index * 11) % 60,
          }),
          checkedOutAt: dateWithOffset({
            dayOffset: 0,
            hour: 10 + index,
            minute: (index * 11) % 60,
          }),
          notes: `${SEED_TAG} check-in cancelado ${index + 1}`,
        }),
      ),
      ...historyPeople.map((person, index) => {
        const checkedInAt = dateWithOffset({
          dayOffset: -1 - (index % 2),
          hour: 8 + (index % 7),
          minute: (index * 5) % 60,
        });

        return buildCheckInRow(campaign.id, person, {
          status: index % 3 === 0 ? 'CHECKED_IN' : 'CHECKED_OUT',
          activityType: activityTypeFor(index + 60),
          checkedInAt,
          checkedOutAt:
            index % 3 === 0 ? null : addHours(checkedInAt, 2 + (index % 4)),
          notes: `${SEED_TAG} historico ${index + 1}`,
        });
      }),
    ];

    for (const row of checkIns) {
      await client.query(
        `
          INSERT INTO campaign_check_ins (
            id, campaign_id, team_id, person_type, person_id, person_name, member_id,
            city_ibge_code, city_name, state, type, notes, checked_in_at, checked_out_at,
            status, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, $13, $14,
            $15, $16, $17
          )
        `,
        [
          row.id,
          row.campaignId,
          row.teamId,
          row.personType,
          row.personId,
          row.personName,
          row.memberId,
          row.cityIbgeCode,
          row.cityName,
          row.state,
          row.activityType,
          row.notes,
          row.checkedInAt,
          row.checkedOutAt,
          row.status,
          row.createdAt,
          row.updatedAt,
        ],
      );
    }

    const activities = buildActivities(campaign.id, representatives, teams);
    for (const activity of activities) {
      await client.query(
        `
          INSERT INTO field_activities (
            id, campaign_id, team_id, member_id, city_ibge_code, city_name, state,
            activity_type, quantity, notes, happened_at, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, $13
          )
        `,
        [
          activity.id,
          activity.campaignId,
          activity.teamId,
          activity.memberId,
          activity.cityIbgeCode,
          activity.cityName,
          activity.state,
          activity.activityType,
          activity.quantity,
          activity.notes,
          activity.happenedAt,
          activity.createdAt,
          activity.updatedAt,
        ],
      );
    }

    await client.query('COMMIT');

    console.log(
      JSON.stringify(
        {
          campaign: {
            id: campaign.id,
            name: campaign.name,
            candidate_name: campaign.candidateName,
            email: campaign.email,
          },
          inserted: {
            leaders: leaders.filter((item) => item.isSeed).length,
            check_ins: checkIns.length,
            activities: activities.length,
          },
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

async function getTargetCampaign(client) {
  const result = await client.query(
    `
      SELECT c.id, c.name, c.candidate_name AS "candidateName", u.email
      FROM campaigns c
      LEFT JOIN users u ON u.id = c.owner_user_id
      WHERE u.email = $1
      LIMIT 1
    `,
    [TARGET_EMAIL],
  );

  if (!result.rows[0]) {
    throw new Error(`Campanha do usuário ${TARGET_EMAIL} não encontrada.`);
  }

  return result.rows[0];
}

async function getTeams(client, campaignId) {
  const teamsResult = await client.query(
    `
      SELECT id, name, city_ibge_code AS "cityIbgeCode", city_name AS "cityName", state
      FROM teams
      WHERE campaign_id = $1
      ORDER BY city_name, name
    `,
    [campaignId],
  );

  const teamIds = teamsResult.rows.map((team) => team.id);
  const membersResult = teamIds.length
    ? await client.query(
        `
          SELECT id, team_id AS "teamId", name
          FROM team_members
          WHERE team_id = ANY($1::uuid[])
          ORDER BY created_at, name
        `,
        [teamIds],
      )
    : { rows: [] };

  return teamsResult.rows.map((team) => ({
    ...team,
    members: membersResult.rows.filter((member) => member.teamId === team.id),
  }));
}

async function cleanupPreviousSeed(client, campaignId) {
  await client.query(
    `DELETE FROM campaign_check_ins WHERE campaign_id = $1 AND notes LIKE $2`,
    [campaignId, `%${SEED_TAG}%`],
  );
  await client.query(
    `DELETE FROM field_activities WHERE campaign_id = $1 AND notes LIKE $2`,
    [campaignId, `%${SEED_TAG}%`],
  );
  await client.query(
    `DELETE FROM campaign_leaders WHERE campaign_id = $1 AND source = $2`,
    [campaignId, SEED_TAG],
  );
}

async function ensureSeedLeaders(client, campaignId, teams) {
  const existingLeaders = await client.query(
    `
      SELECT id, name, city_ibge_code AS "cityIbgeCode", city_name AS "cityName", state
      FROM campaign_leaders
      WHERE campaign_id = $1
      ORDER BY created_at DESC
    `,
    [campaignId],
  );

  const missingCities = teams
    .filter(
      (team, index, list) =>
        list.findIndex((item) => item.cityIbgeCode === team.cityIbgeCode) === index,
    )
    .filter(
      (team) =>
        !existingLeaders.rows.some(
          (leader) => leader.cityIbgeCode === team.cityIbgeCode,
        ),
    )
    .slice(0, 4);

  const seedNames = [
    'Patricia Nunes',
    'Eduardo Tavares',
    'Simone Batista',
    'Felipe Azevedo',
  ];

  const inserted = [];
  for (let index = 0; index < missingCities.length; index += 1) {
    const city = missingCities[index];
    const leader = {
      id: randomUUID(),
      campaignId,
      name: seedNames[index] || `Lideranca Seed ${index + 1}`,
      phone: `1199000${String(index + 1).padStart(4, '0')}`,
      cityIbgeCode: city.cityIbgeCode,
      cityName: city.cityName,
      state: city.state,
      source: SEED_TAG,
      status: 'ACTIVE',
      notes: `${SEED_TAG} liderança criada para massa de teste`,
      createdAt: dateWithOffset({ dayOffset: 0, hour: 9 + index, minute: 15 }),
      updatedAt: new Date(),
      isSeed: true,
    };

    await client.query(
      `
        INSERT INTO campaign_leaders (
          id, campaign_id, name, phone, city_ibge_code, city_name, state,
          source, status, notes, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12
        )
      `,
      [
        leader.id,
        leader.campaignId,
        leader.name,
        leader.phone,
        leader.cityIbgeCode,
        leader.cityName,
        leader.state,
        leader.source,
        leader.status,
        leader.notes,
        leader.createdAt,
        leader.updatedAt,
      ],
    );

    inserted.push(leader);
  }

  return [...inserted, ...existingLeaders.rows.map((item) => ({ ...item, isSeed: false }))];
}

function uniquePeople(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.kind}:${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildCheckInRow(campaignId, person, overrides) {
  const checkedInAt = overrides.checkedInAt || new Date();
  return {
    id: randomUUID(),
    campaignId,
    teamId: person.teamId,
    personType: person.kind,
    personId: person.id,
    personName: person.name,
    memberId: person.memberId,
    cityIbgeCode: person.cityIbgeCode,
    cityName: person.cityName,
    state: person.state,
    activityType: overrides.activityType,
    notes: overrides.notes,
    checkedInAt,
    checkedOutAt: overrides.checkedOutAt || null,
    status: overrides.status,
    createdAt: checkedInAt,
    updatedAt: overrides.checkedOutAt || checkedInAt,
  };
}

function buildActivities(campaignId, representatives, teams) {
  const base = representatives.slice(0, 18);
  const history = representatives.slice(18, 26);
  const rows = [];

  base.forEach((person, index) => {
    const happenedAt = dateWithOffset({
      dayOffset: 0,
      hour: 8 + (index % 8),
      minute: (index * 13) % 60,
    });

    rows.push({
      id: randomUUID(),
      campaignId,
      teamId: person.teamId,
      memberId: person.memberId,
      cityIbgeCode: person.cityIbgeCode,
      cityName: person.cityName,
      state: person.state,
      activityType: activityTypeFor(index),
      quantity: 4 + (index % 7),
      notes: `${SEED_TAG} atividade do dia ${index + 1}`,
      happenedAt,
      createdAt: happenedAt,
      updatedAt: happenedAt,
    });
  });

  history.forEach((person, index) => {
    const happenedAt = dateWithOffset({
      dayOffset: -1 - (index % 2),
      hour: 9 + (index % 6),
      minute: (index * 17) % 60,
    });

    rows.push({
      id: randomUUID(),
      campaignId,
      teamId: person.teamId || teams[0].id,
      memberId: person.memberId,
      cityIbgeCode: person.cityIbgeCode,
      cityName: person.cityName,
      state: person.state,
      activityType: activityTypeFor(index + 40),
      quantity: 2 + (index % 4),
      notes: `${SEED_TAG} atividade historica ${index + 1}`,
      happenedAt,
      createdAt: happenedAt,
      updatedAt: happenedAt,
    });
  });

  return rows;
}

function findTeamForCity(teams, cityIbgeCode) {
  return teams.find((team) => team.cityIbgeCode === cityIbgeCode) || null;
}

function activityTypeFor(index) {
  const activityTypes = [
    'PANFLETAGEM',
    'ADESIVAGEM',
    'VISITA',
    'REUNIAO',
    'EVENTO',
    'PESQUISA_CAMPO',
    'OUTRO',
  ];

  return activityTypes[index % activityTypes.length];
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function dateWithOffset({ dayOffset = 0, hour = 8, minute = 0 }) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
