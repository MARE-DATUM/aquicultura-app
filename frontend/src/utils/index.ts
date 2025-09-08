// Funções utilitárias para formatação e manipulação de dados

/**
 * Formata um valor numérico como moeda em Kz (Kwanza Angolano)
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0,00 Kz';
  
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue).replace('AOA', 'Kz');
};

/**
 * Formata uma data para o formato português (dd/mm/aaaa)
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Data inválida';
  
  return new Intl.DateTimeFormat('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
};

/**
 * Formata uma data e hora para o formato português
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Data inválida';
  
  return new Intl.DateTimeFormat('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * Formata um número como percentagem
 */
export const formatPercentage = (value: number | string, decimals: number = 1): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0%';
  
  return new Intl.NumberFormat('pt-AO', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue / 100);
};

/**
 * Formata um número com separadores de milhares
 */
export const formatNumber = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('pt-AO').format(numValue);
};

/**
 * Calcula a diferença em dias entre duas datas
 */
export const getDaysDifference = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Gera uma cor baseada no status
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'PENDENTE': 'bg-yellow-100 text-yellow-800',
    'EM_ANALISE': 'bg-blue-100 text-blue-800',
    'APROVADO': 'bg-green-100 text-green-800',
    'NEGADO': 'bg-red-100 text-red-800',
    'EM_EXECUCAO': 'bg-green-100 text-green-800',
    'CONCLUIDO': 'bg-gray-100 text-gray-800',
    'SUSPENSO': 'bg-orange-100 text-orange-800',
    'PLANEADO': 'bg-blue-100 text-blue-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Trunca um texto para um número específico de caracteres
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Valida se um email é válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Gera um ID único simples
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
