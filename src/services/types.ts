// src/services/types.ts

// ========== TIPOS BÁSICOS ==========

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ========== TIPOS PARA BOMBONAS ==========

export type BombonaStatus = 'available' | 'in_use' | 'maintenance' | 'washing' | 'lost';

export interface Bombona {
  id: string;
  name: string;
  qr_code: string;
  capacity: number;
  material: string;
  type: string;
  status: BombonaStatus;
  color: string | null;
  location_address: string | null;
  current_product: string | null;
  total_cycles: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  last_wash_date: string | null;
  location_lat: number | null;
  location_lng: number | null;
}

export interface NewBombona {
  name: string;
  qr_code: string;
  capacity: number;
  material: string;
  type: string;
  color: string;
  status: BombonaStatus;
  location_address?: string;
  current_product?: string;
}

export interface UpdateBombona {
  name?: string;
  qr_code?: string;
  capacity?: number;
  material?: string;
  type?: string;
  color?: string;
  status?: BombonaStatus;
  location_address?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  current_product?: string | null;
  total_cycles?: number;
  last_wash_date?: string | null;
}

export interface BombonaFormData {
  name: string;
  qr_code: string;
  capacity: number;
  material: string;
  type: string;
  color: string;
  status: BombonaStatus;
  location_address?: string;
  current_product?: string;
}

export interface BombonaFilters {
  status?: BombonaStatus | 'all';
  material?: string;
  capacity_min?: number;
  capacity_max?: number;
  search?: string;
}

export interface BombonaStats {
  total: number;
  available: number;
  in_use: number;
  maintenance: number;
  washing: number;
  lost: number;
  total_cycles: number;
  average_cycles: number;
}

// ========== TIPOS PARA LAVAGENS ==========

export interface Lavagem {
  id: string;
  bombona_id: string;
  data_lavagem: string;
  produto_anterior: string | null;
  produto_novo: string | null;
  observacoes: string | null;
  ciclos_antes: number;
  ciclos_depois: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface NewLavagem {
  bombona_id: string;
  data_lavagem: string;
  produto_anterior?: string | null;
  produto_novo?: string | null;
  observacoes?: string | null;
}

export interface LavagemWithBombona extends Lavagem {
  bombona_nome: string;
  bombona_qr_code: string;
  bombona_capacidade: number;
  bombona_material: string;
  bombona_status: string;
}

export interface LavagemStats {
  total_lavagens: number;
  lavagens_mes_atual: number;
  lavagens_mes_anterior: number;
  taxa_crescimento: number;
  bombonas_para_lavagem: number;
  media_ciclos_por_bombona: number;
}

export interface LavagemFilters {
  data_inicio?: string;
  data_fim?: string;
  bombona_id?: string;
  material?: string;
}

// ========== TIPOS PARA DESPACHOS ==========

export interface Despacho {
  id: string;
  bombona_id: string;
  destino: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  data_despacho: string;
  data_prevista_retorno: string | null;
  responsavel: string;
  observacoes: string | null;
  status: 'pendente' | 'em_transito' | 'entregue' | 'retornado';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface NewDespacho {
  bombona_id: string;
  destino: string;
  endereco: string;
  latitude?: number | null;
  longitude?: number | null;
  data_despacho: string;
  data_prevista_retorno?: string | null;
  responsavel: string;
  observacoes?: string | null;
}

export interface DespachoLocation {
  id: string;
  bombona_id: string;
  destino: string;
  endereco: string;
  latitude: number;
  longitude: number;
  data_despacho: string;
  responsavel: string;
  status: string;
  bombona_nome: string;
  bombona_status: string;
}

// ========== TIPOS PARA ANALYTICS ==========

export interface StatusData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

export interface MonthlyData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export interface YearlyData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export interface CyclesData {
  total: number;
  average: number;
  max: number;
}

export interface AnalyticsData {
  status: StatusData;
  monthly: MonthlyData;
  yearly: YearlyData;
  cycles: CyclesData;
  lavagensData: MonthlyData;
  despachosData: MonthlyData;
  materialData: StatusData;
  lavagensStats: {
    totalLavagens: number;
    totalCiclos: number;
    mediaCiclos: number;
  };
  despachosStats: {
    totalDespachos: number;
    statusCount: Record<string, number>;
  };
}

export interface PDFData {
  imageData: string;
  analyticsData: AnalyticsData;
  generatedAt: string;
}

// ========== TIPOS PARA USUÁRIOS ==========

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'user' | 'manager';
  created_at: string;
  updated_at: string;
}

export interface UpdateUserProfile {
  full_name?: string;
  avatar_url?: string;
  role?: 'admin' | 'user' | 'manager';
}

// ========== TIPOS PARA PRODUTOS ==========

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewProduct {
  name: string;
  description?: string;
  category: string;
  unit: string;
  price: number;
  is_active?: boolean;
}

// ========== TIPOS PARA RELATÓRIOS ==========

export interface RelatorioMensalRPC {
  total_bombonas: number;
  bombonas_ativas: number;
  bombonas_em_uso: number;
  total_usuarios: number;
  produtos_mais_utilizados: string;
  ciclos_mensais: number;
}

export interface RelatorioAnualRPC {
  mes: string;
  total_bombonas: number;
  bombonas_ativas: number;
  bombonas_em_uso: number;
  novos_usuarios: number;
}

export interface DadosMensais {
  total_bombonas: number;
  bombonas_ativas: number;
  bombonas_em_uso: number;
  total_usuarios: number;
  produtos_mais_utilizados: string;
  ciclos_mensais: number;
}

export interface DadoAnual {
  mes: string;
  total_bombonas: number;
  bombonas_ativas: number;
  bombonas_em_uso: number;
  novos_usuarios: number;
}

export interface DadosAnalytics {
  resumo_geral: {
    total_bombonas_historico: number;
    total_usuarios: number;
    total_ciclos: number;
    taxa_reutilizacao: number;
  };
  evolucao_mensal: DadoAnual[];
  produtos_populares: Array<{ produto: string; uso_count: number }>;
  distribuicao_status: {
    ativas: number;
    em_uso: number;
    inativas: number;
  };
}

export interface ReportFilters {
  start_date: string;
  end_date: string;
  status?: BombonaStatus | 'all';
  material?: string;
  type?: string;
}

export interface ReportData {
  period: string;
  total_bombonas: number;
  active_bombonas: number;
  total_cycles: number;
  utilization_rate: number;
  status_distribution: {
    available: number;
    in_use: number;
    maintenance: number;
    washing: number;
    lost: number;
  };
  top_products: Array<{
    product: string;
    usage_count: number;
  }>;
}

// ========== TIPOS PARA NOTIFICAÇÕES ==========

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  related_entity_type?: 'bombona' | 'despacho' | 'user' | 'lavagem';
  related_entity_id?: string;
  created_at: string;
}

export interface NewNotification {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  related_entity_type?: 'bombona' | 'despacho' | 'user' | 'lavagem';
  related_entity_id?: string;
}

// ========== TIPOS PARA MAPA ==========

export interface MapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  type: 'bombona' | 'despacho' | 'lavagem';
  status: string;
  entity: Bombona | DespachoLocation | Lavagem;
}

// ========== TIPOS PARA DASHBOARD ==========

export interface DashboardStats {
  total_bombonas: number;
  active_bombonas: number;
  total_users: number;
  pending_despachos: number;
  monthly_cycles: number;
  utilization_rate: number;
  total_lavagens: number;
  lavagens_pendentes: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// ========== TIPOS PARA FORMULÁRIOS ==========

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    message?: string;
  };
}

// ========== TIPOS PARA PAGINAÇÃO ==========

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== TIPOS PARA SISTEMA DE ARQUIVOS ==========

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
  uploaded_by: string;
}

// ========== TIPOS PARA CONFIGURAÇÕES ==========

export interface AppSettings {
  company_name: string;
  company_logo: string | null;
  primary_color: string;
  secondary_color: string;
  max_cycles_before_maintenance: number;
  auto_logout_minutes: number;
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  dias_entre_lavagens: number;
  ciclos_maximos_antes_lavagem: number;
}

// ========== TIPOS PARA AUDITORIA ==========

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ========== TIPOS GENÉRICOS ==========

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

// ========== TIPOS PARA COMPONENTES ==========

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// ========== TIPOS PARA SISTEMA DE PERMISSÕES ==========

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// ========== CONFIGURAÇÕES DE STATUS ==========

export interface StatusConfig {
  label: string;
  color: string;
  icon: string;
}

export const statusConfig: Record<BombonaStatus, StatusConfig> = {
  available: {
    label: 'Disponível',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: 'CheckCircle2'
  },
  in_use: {
    label: 'Em Uso',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: 'Activity'
  },
  maintenance: {
    label: 'Manutenção',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: 'AlertCircle'
  },
  washing: {
    label: 'Lavagem',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: 'Clock'
  },
  lost: {
    label: 'Extraviada',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: 'AlertCircle'
  }
};

// ========== TIPOS PARA TRACKING HISTORY ==========

export interface TrackingHistory {
  id: string;
  bombona_id: string;
  status: string;
  location_address: string | null;
  notes: string | null;
  created_at: string;
  user_id?: string;
}

// ========== TIPOS PARA CICLOS DE USO ==========

export interface UsageCycle {
  id: string;
  bombona_id: string;
  product_id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'cancelled';
  quantity_used: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewUsageCycle {
  bombona_id: string;
  product_id: string;
  user_id: string;
  start_date: string;
  quantity_used: number;
  notes?: string;
}

// ========== TIPOS PARA CONVERSÃO DO SUPABASE ==========

export interface BombonaFromDB {
  id: string;
  name: string;
  qr_code: string;
  capacity: number;
  material: string;
  type: string;
  status: string;
  color: string | null;
  location_address: string | null;
  current_product: string | null;
  total_cycles: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  last_wash_date?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
}

// Função helper para converter do tipo DB para o tipo da aplicação
export const convertBombonaFromDB = (bombonaDB: BombonaFromDB): Bombona => {
  const validStatus: BombonaStatus = 
    ['available', 'in_use', 'maintenance', 'washing', 'lost'].includes(bombonaDB.status)
      ? bombonaDB.status as BombonaStatus
      : 'available';

  return {
    ...bombonaDB,
    status: validStatus,
    last_wash_date: bombonaDB.last_wash_date || null,
    location_lat: bombonaDB.location_lat || null,
    location_lng: bombonaDB.location_lng || null
  };
};

// ========== EXPORTAÇÕES DE TIPOS COMUNS ==========

export type { 
  BombonaStatus as BombonaStatusType,
  Despacho as DespachoType,
  NewDespacho as NewDespachoType,
  DespachoLocation as DespachoLocationType,
  Lavagem as LavagemType,
  NewLavagem as NewLavagemType,
  LavagemWithBombona as LavagemWithBombonaType
};