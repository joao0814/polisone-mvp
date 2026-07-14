type CampaignRegion = {
  id: string;
  label: string;
  municipalityIds?: readonly string[];
  statePrefixes?: readonly string[];
};

export const campaignRegions: readonly CampaignRegion[] = [
  {
    id: 'norte',
    label: 'Norte',
    statePrefixes: ['11', '12', '13', '14', '15', '16', '17'],
  },
  {
    id: 'nordeste',
    label: 'Nordeste',
    statePrefixes: ['21', '22', '23', '24', '25', '26', '27', '28', '29'],
  },
  {
    id: 'centro-oeste',
    label: 'Centro-Oeste',
    statePrefixes: ['50', '51', '52', '53'],
  },
  {
    id: 'sudeste',
    label: 'Sudeste',
    statePrefixes: ['31', '32', '33', '35'],
  },
  {
    id: 'sul',
    label: 'Sul',
    statePrefixes: ['41', '42', '43'],
  },
  {
    id: 'metropolitana-sp',
    label: 'Regiao metropolitana de SP',
    municipalityIds: [
      '3550308',
      '3518800',
      '3534401',
      '3547809',
      '3548708',
      '3548807',
      '3513801',
      '3529401',
      '3530607',
      '3505708',
      '3513009',
      '3552809',
    ],
  },
  {
    id: 'campinas',
    label: 'Regiao de Campinas',
    municipalityIds: [
      '3509502',
      '3552403',
      '3501608',
      '3519071',
      '3520509',
      '3536505',
      '3556206',
      '3556701',
      '3526902',
      '3538709',
    ],
  },
  {
    id: 'vale-paraiba',
    label: 'Vale do Paraiba',
    municipalityIds: [
      '3549904',
      '3554102',
      '3524402',
      '3538006',
      '3518404',
      '3527207',
      '3508504',
      '3513405',
      '3502507',
      '3510500',
      '3555406',
      '3550704',
      '3520400',
    ],
  },
  {
    id: 'baixada-santista',
    label: 'Baixada Santista',
    municipalityIds: [
      '3548500',
      '3551009',
      '3541000',
      '3518701',
      '3513504',
      '3522109',
      '3531100',
      '3537602',
      '3542602',
    ],
  },
  {
    id: 'ribeirao-preto',
    label: 'Regiao de Ribeirao Preto',
    municipalityIds: [
      '3543402',
      '3516200',
      '3551702',
      '3505906',
      '3506102',
      '3505500',
      '3524303',
      '3548906',
      '3503208',
    ],
  },
  {
    id: 'sorocaba',
    label: 'Regiao de Sorocaba',
    municipalityIds: [
      '3552205',
      '3523909',
      '3557006',
      '3519709',
      '3507001',
      '3522307',
      '3528403',
      '3550605',
    ],
  },
  {
    id: 'bauru',
    label: 'Regiao de Bauru',
    municipalityIds: [
      '3506003',
      '3526803',
      '3525300',
      '3505302',
      '3519600',
      '3528007',
      '3536703',
    ],
  },
  {
    id: 'rio-preto',
    label: 'Regiao de Sao Jose do Rio Preto',
    municipalityIds: [
      '3549805',
      '3557105',
      '3521150',
      '3533908',
      '3515509',
      '3519402',
      '3534005',
    ],
  },
] as const;

export function matchesRegion(region: CampaignRegion, cityIbgeCode: string) {
  const municipalityIds = region.municipalityIds ?? [];
  const statePrefixes = region.statePrefixes ?? [];

  return (
    municipalityIds.includes(cityIbgeCode) ||
    statePrefixes.some((prefix) => cityIbgeCode.startsWith(prefix))
  );
}
