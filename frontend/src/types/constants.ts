// Constantes para usar como valores
export const USER_ROLES = {
  ROOT: 'ROOT',
  GESTAO_DADOS: 'GESTAO_DADOS',
  VISUALIZACAO: 'VISUALIZACAO'
} as const;

export const TIPO_PROJETO = {
  COMUNITARIO: 'COMUNITARIO',
  EMPRESARIAL: 'EMPRESARIAL'
} as const;

export const FONTE_FINANCIAMENTO = {
  AFAP_2: 'AFAP-2',
  FADEPA: 'FADEPA',
  FACRA: 'FACRA',
  PRIVADO: 'PRIVADO'
} as const;

export const ESTADO_PROJETO = {
  PLANEADO: 'PLANEADO',
  EM_EXECUCAO: 'EM_EXECUCAO',
  CONCLUIDO: 'CONCLUIDO',
  SUSPENSO: 'SUSPENSO'
} as const;

export const TRIMESTRE = {
  T1: 'T1',
  T2: 'T2',
  T3: 'T3',
  T4: 'T4'
} as const;

export const PERIODO_5W2H = {
  PERIODO_0_6: '0-6',
  PERIODO_7_12: '7-12',
  PERIODO_13_18: '13-18'
} as const;

export const STATUS_LICENCIAMENTO = {
  PENDENTE: 'PENDENTE',
  EM_ANALISE: 'EM_ANALISE',
  APROVADO: 'APROVADO',
  NEGADO: 'NEGADO'
} as const;

export const ENTIDADE_RESPONSAVEL = {
  IPA: 'IPA',
  DNA: 'DNA',
  DNRM: 'DNRM'
} as const;

export const ACAO_AUDIT = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
  STATUS_CHANGE: 'STATUS_CHANGE'
} as const;
