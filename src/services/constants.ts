// Paleta de cores BonnaTech/BioAccess
export const COLORS = {
    // Verde corporativo
    primary: [76, 175, 80] as [number, number, number],
    primaryDark: [56, 142, 60] as [number, number, number],
    primaryLight: [129, 199, 132] as [number, number, number],
    primaryUltraLight: [200, 230, 201] as [number, number, number],
    
    // Acentos
    accent: [67, 160, 71] as [number, number, number],
    highlight: [255, 193, 7] as [number, number, number],
    
    // Neutros
    white: [255, 255, 255] as [number, number, number],
    background: [250, 250, 250] as [number, number, number],
    backgroundCard: [255, 255, 255] as [number, number, number],
    text: [33, 33, 33] as [number, number, number],
    textSecondary: [97, 97, 97] as [number, number, number],
    textMuted: [158, 158, 158] as [number, number, number],
    border: [224, 224, 224] as [number, number, number],
    borderLight: [238, 238, 238] as [number, number, number],
    
    // Estados
    success: [76, 175, 80] as [number, number, number],
    warning: [255, 152, 0] as [number, number, number],
    error: [244, 67, 54] as [number, number, number],
    info: [33, 150, 243] as [number, number, number],
    inactive: [189, 189, 189] as [number, number, number],
  } as const;
  
  // Configurações de tipografia
  export const TYPOGRAPHY = {
    title: { size: 20, weight: 'bold' as const },
    subtitle: { size: 14, weight: 'normal' as const },
    heading: { size: 12, weight: 'bold' as const },
    body: { size: 9, weight: 'normal' as const },
    caption: { size: 7, weight: 'normal' as const },
    small: { size: 6, weight: 'normal' as const },
  } as const;
  
  // Espaçamentos
  export const SPACING = {
    pageMargin: 20,
    sectionGap: 15,
    cardGap: 10,
    elementGap: 8,
    small: 5,
  } as const;
  
  // Dimensões
  export const DIMENSIONS = {
    pageWidth: 210,
    pageHeight: 297,
    headerHeight: 60,
    footerY: 290,
    cardWidth: 80,
    cardHeight: 40,
    chartRadius: 30,
  } as const;
  
  // Meses
  export const MESES = {
    pt: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    en: {
      'January': 'Janeiro',
      'February': 'Fevereiro',
      'March': 'Março',
      'April': 'Abril',
      'May': 'Maio',
      'June': 'Junho',
      'July': 'Julho',
      'August': 'Agosto',
      'September': 'Setembro',
      'October': 'Outubro',
      'November': 'Novembro',
      'December': 'Dezembro'
    }
  } as const;
  