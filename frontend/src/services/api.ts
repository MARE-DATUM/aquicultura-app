import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { 
  User, 
  Projeto, 
  Indicador, 
  Eixo5W2H, 
  Licenciamento, 
  AuditLog,
  Provincia,
  TokenResponse,
  LoginRequest,
  DashboardStats,
  MapaProvincia,
  ProjetoCreate,
  IndicadorCreate,
  Eixo5W2HCreate,
  LicenciamentoCreate,
  ProjetoFilters,
  IndicadorFilters,
  LicenciamentoFilters,
  AuditLogFilters
} from '../types/simple';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para lidar com respostas de erro
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado, limpar localStorage e redirecionar para login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response: AxiosResponse<TokenResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response: AxiosResponse<TokenResponse> = await this.api.post('/auth/refresh', refreshToken);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/me');
    return response.data;
  }

  // Users endpoints
  async getUsers(page = 0, limit = 100): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get(`/users?skip=${page * limit}&limit=${limit}`);
    return response.data;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.api.delete(`/users/${userId}`);
  }

  // Provincias endpoints
  async getProvincias(): Promise<Provincia[]> {
    const response: AxiosResponse<Provincia[]> = await this.api.get('/provincias');
    return response.data;
  }

  async getMapaProvincias(): Promise<MapaProvincia[]> {
    const response: AxiosResponse<MapaProvincia[]> = await this.api.get('/provincias/dashboard/mapa');
    return response.data;
  }

  // Projetos endpoints
  async getProjetos(filters: ProjetoFilters = {}): Promise<Projeto[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response: AxiosResponse<Projeto[]> = await this.api.get(`/projetos?${params.toString()}`);
    return response.data;
  }

  async getProjeto(projetoId: number): Promise<Projeto> {
    const response: AxiosResponse<Projeto> = await this.api.get(`/projetos/${projetoId}`);
    return response.data;
  }

  async createProjeto(projetoData: ProjetoCreate): Promise<Projeto> {
    const response: AxiosResponse<Projeto> = await this.api.post('/projetos', projetoData);
    return response.data;
  }

  async updateProjeto(projetoId: number, projetoData: Partial<ProjetoCreate>): Promise<Projeto> {
    const response: AxiosResponse<Projeto> = await this.api.put(`/projetos/${projetoId}`, projetoData);
    return response.data;
  }

  async deleteProjeto(projetoId: number): Promise<void> {
    await this.api.delete(`/projetos/${projetoId}`);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response: AxiosResponse<DashboardStats> = await this.api.get('/projetos/dashboard/stats');
    return response.data;
  }

  // Indicadores endpoints
  async getIndicadores(filters: IndicadorFilters = {}): Promise<Indicador[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response: AxiosResponse<Indicador[]> = await this.api.get(`/indicadores?${params.toString()}`);
    return response.data;
  }

  async getIndicador(indicadorId: number): Promise<Indicador> {
    const response: AxiosResponse<Indicador> = await this.api.get(`/indicadores/${indicadorId}`);
    return response.data;
  }

  async createIndicador(indicadorData: IndicadorCreate): Promise<Indicador> {
    const response: AxiosResponse<Indicador> = await this.api.post('/indicadores', indicadorData);
    return response.data;
  }

  async updateIndicador(indicadorId: number, indicadorData: Partial<IndicadorCreate>): Promise<Indicador> {
    const response: AxiosResponse<Indicador> = await this.api.put(`/indicadores/${indicadorId}`, indicadorData);
    return response.data;
  }

  async deleteIndicador(indicadorId: number): Promise<void> {
    await this.api.delete(`/indicadores/${indicadorId}`);
  }

  async getIndicadoresStats(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/indicadores/dashboard/stats');
    return response.data;
  }

  async importIndicadores(fileContent: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/indicadores/import', fileContent);
    return response.data;
  }

  async exportIndicadores(projetoId?: number, periodoReferencia?: string): Promise<string> {
    const params = new URLSearchParams();
    if (projetoId) params.append('projeto_id', projetoId.toString());
    if (periodoReferencia) params.append('periodo_referencia', periodoReferencia);
    
    const response: AxiosResponse<string> = await this.api.get(`/indicadores/export?${params.toString()}`);
    return response.data;
  }

  // Eixos 5W2H endpoints
  async getEixos5W2H(projetoId?: number, periodo?: string, search?: string): Promise<Eixo5W2H[]> {
    const params = new URLSearchParams();
    if (projetoId) params.append('projeto_id', projetoId.toString());
    if (periodo) params.append('periodo', periodo);
    if (search) params.append('search', search);
    
    const response: AxiosResponse<Eixo5W2H[]> = await this.api.get(`/eixos-5w2h?${params.toString()}`);
    return response.data;
  }

  async getEixo5W2H(eixoId: number): Promise<Eixo5W2H> {
    const response: AxiosResponse<Eixo5W2H> = await this.api.get(`/eixos-5w2h/${eixoId}`);
    return response.data;
  }

  async createEixo5W2H(eixoData: Eixo5W2HCreate): Promise<Eixo5W2H> {
    const response: AxiosResponse<Eixo5W2H> = await this.api.post('/eixos-5w2h', eixoData);
    return response.data;
  }

  async updateEixo5W2H(eixoId: number, eixoData: Partial<Eixo5W2HCreate>): Promise<Eixo5W2H> {
    const response: AxiosResponse<Eixo5W2H> = await this.api.put(`/eixos-5w2h/${eixoId}`, eixoData);
    return response.data;
  }

  async deleteEixo5W2H(eixoId: number): Promise<void> {
    await this.api.delete(`/eixos-5w2h/${eixoId}`);
  }

  async getEixosByProjetoPeriodo(projetoId: number): Promise<Record<string, Eixo5W2H[]>> {
    const response: AxiosResponse<Record<string, Eixo5W2H[]>> = await this.api.get(`/eixos-5w2h/projeto/${projetoId}/periodos`);
    return response.data;
  }

  // Licenciamentos endpoints
  async getLicenciamentos(filters: LicenciamentoFilters = {}): Promise<Licenciamento[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response: AxiosResponse<Licenciamento[]> = await this.api.get(`/licenciamentos?${params.toString()}`);
    return response.data;
  }

  async getLicenciamento(licenciamentoId: number): Promise<Licenciamento> {
    const response: AxiosResponse<Licenciamento> = await this.api.get(`/licenciamentos/${licenciamentoId}`);
    return response.data;
  }

  async createLicenciamento(licenciamentoData: LicenciamentoCreate): Promise<Licenciamento> {
    const response: AxiosResponse<Licenciamento> = await this.api.post('/licenciamentos', licenciamentoData);
    return response.data;
  }

  async updateLicenciamento(licenciamentoId: number, licenciamentoData: Partial<LicenciamentoCreate>): Promise<Licenciamento> {
    const response: AxiosResponse<Licenciamento> = await this.api.put(`/licenciamentos/${licenciamentoId}`, licenciamentoData);
    return response.data;
  }

  async deleteLicenciamento(licenciamentoId: number): Promise<void> {
    await this.api.delete(`/licenciamentos/${licenciamentoId}`);
  }

  async updateLicenciamentoStatus(licenciamentoId: number, status: string, observacoes?: string): Promise<void> {
    await this.api.put(`/licenciamentos/${licenciamentoId}/status`, { status, observacoes });
  }

  async getLicenciamentosStats(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/licenciamentos/dashboard/stats');
    return response.data;
  }

  // Auditoria endpoints
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response: AxiosResponse<AuditLog[]> = await this.api.get(`/auditoria?${params.toString()}`);
    return response.data;
  }

  async getAuditLog(logId: number): Promise<AuditLog> {
    const response: AxiosResponse<AuditLog> = await this.api.get(`/auditoria/${logId}`);
    return response.data;
  }

  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<string> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response: AxiosResponse<string> = await this.api.get(`/auditoria/export/csv?${params.toString()}`);
    return response.data;
  }

  async getAuditStats(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/auditoria/dashboard/stats');
    return response.data;
  }
}

export const apiService = new ApiService();
