/**
 * Utilitários para trabalhar com datas e prazos
 */

/**
 * Calcula a diferença em dias entre duas datas
 * @param {Date} date1 - Data inicial
 * @param {Date} date2 - Data final
 * @returns {number} - Diferença em dias
 */
export const getDaysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / oneDay);
};

/**
 * Retorna a cor do alerta baseado no prazo
 * @param {string} deadlineString - String da data/hora do prazo
 * @returns {Object} - { color, backgroundColor, status, message }
 */
export const getDeadlineAlert = (deadlineString) => {
  if (!deadlineString || deadlineString === 'Sem prazo') {
    return {
      color: '#666',
      backgroundColor: '#E0E0E0',
      status: 'no-deadline',
      message: 'Sem prazo definido',
      priority: 0
    };
  }

  try {
    const deadline = new Date(deadlineString);
    const now = new Date();
    
    // Zerar as horas para comparação apenas de dias
    const deadlineDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const daysUntilDeadline = getDaysDifference(today, deadlineDay);

    // Passou do prazo (vermelho)
    if (daysUntilDeadline < 0) {
      return {
        color: '#FFF',
        backgroundColor: '#FF3B30',
        status: 'overdue',
        message: `Atrasado há ${Math.abs(daysUntilDeadline)} dia(s)`,
        priority: 4,
        icon: '🔴'
      };
    }

    // Dia do prazo (laranja)
    if (daysUntilDeadline === 0) {
      return {
        color: '#FFF',
        backgroundColor: '#FF9500',
        status: 'today',
        message: 'Vence hoje!',
        priority: 3,
        icon: '🟠'
      };
    }

    // Faltam 3 dias ou menos (amarelo)
    if (daysUntilDeadline <= 3) {
      return {
        color: '#000',
        backgroundColor: '#FFD60A',
        status: 'warning',
        message: `Vence em ${daysUntilDeadline} dia(s)`,
        priority: 2,
        icon: '🟡'
      };
    }

    // Mais de 3 dias (verde)
    return {
      color: '#FFF',
      backgroundColor: '#34C759',
      status: 'ok',
      message: `Vence em ${daysUntilDeadline} dia(s)`,
      priority: 1,
      icon: '🟢'
    };
  } catch (error) {
    console.error('Erro ao calcular alerta de prazo:', error);
    return {
      color: '#666',
      backgroundColor: '#E0E0E0',
      status: 'error',
      message: 'Data inválida',
      priority: 0
    };
  }
};

/**
 * Formata a data para exibição
 * @param {Date} date - Data a ser formatada
 * @returns {string} - Data formatada (DD/MM/YYYY)
 */
export const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formata a hora para exibição
 * @param {Date} date - Data com hora
 * @returns {string} - Hora formatada (HH:MM)
 */
export const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Formata data e hora completas
 * @param {Date} date - Data com hora
 * @returns {string} - Data e hora formatadas (DD/MM/YYYY HH:MM)
 */
export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Converte string de data para objeto Date
 * @param {string} dateString - String da data
 * @returns {Date|null} - Objeto Date ou null se inválido
 */
export const parseDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    return null;
  }
};
