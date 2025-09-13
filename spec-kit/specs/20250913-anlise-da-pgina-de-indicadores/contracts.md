# Análise da Página de Indicadores - Contratos e Interfaces

## 🔌 APIs

### Endpoints REST
```yaml
# Especificação OpenAPI para Indicadores
openapi: 3.0.0
info:
  title: Indicadores API
  version: 1.0.0
  description: API para gestão de indicadores de aquicultura

paths:
  /api/indicadores/:
    get:
      summary: Listar indicadores
      parameters:
        - name: skip
          in: query
          schema:
            type: integer
            default: 0
        - name: limit
          in: query
          schema:
            type: integer
            default: 100
        - name: projeto_id
          in: query
          schema:
            type: integer
        - name: periodo_referencia
          in: query
          schema:
            type: string
            enum: [T1, T2, T3, T4]
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Lista de indicadores
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/IndicadorResponse'
    
    post:
      summary: Criar indicador
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/IndicadorCreate'
      responses:
        '201':
          description: Indicador criado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Indicador'
        '403':
          description: Acesso negado
        '422':
          description: Dados inválidos

  /api/indicadores/{indicador_id}:
    get:
      summary: Obter indicador por ID
      parameters:
        - name: indicador_id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Indicador encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/IndicadorResponse'
        '404':
          description: Indicador não encontrado
    
    put:
      summary: Atualizar indicador
      security:
        - bearerAuth: []
      parameters:
        - name: indicador_id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/IndicadorUpdate'
      responses:
        '200':
          description: Indicador atualizado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Indicador'
        '404':
          description: Indicador não encontrado
        '403':
          description: Acesso negado
    
    delete:
      summary: Eliminar indicador
      security:
        - bearerAuth: []
      parameters:
        - name: indicador_id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Indicador eliminado
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
        '404':
          description: Indicador não encontrado
        '403':
          description: Acesso negado

  /api/indicadores/dashboard/stats:
    get:
      summary: Estatísticas para dashboard
      responses:
        '200':
          description: Estatísticas dos indicadores
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DashboardStats'

  /api/indicadores/export:
    get:
      summary: Exportar indicadores para CSV
      parameters:
        - name: projeto_id
          in: query
          schema:
            type: integer
        - name: periodo_referencia
          in: query
          schema:
            type: string
            enum: [T1, T2, T3, T4]
      responses:
        '200':
          description: Arquivo CSV
          content:
            text/csv:
              schema:
                type: string

  /api/indicadores/import:
    post:
      summary: Importar indicadores via CSV
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                file_content:
                  type: string
      responses:
        '200':
          description: Resultado da importação
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImportResult'

components:
  schemas:
    Indicador:
      type: object
      properties:
        id:
          type: integer
        projeto_id:
          type: integer
        nome:
          type: string
        unidade:
          type: string
        meta:
          type: number
          format: decimal
        valor_actual:
          type: number
          format: decimal
        periodo_referencia:
          type: string
          enum: [T1, T2, T3, T4]
        fonte_dados:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    IndicadorCreate:
      type: object
      required:
        - projeto_id
        - nome
        - unidade
        - meta
        - periodo_referencia
        - fonte_dados
      properties:
        projeto_id:
          type: integer
        nome:
          type: string
        unidade:
          type: string
        meta:
          type: number
          format: decimal
        valor_actual:
          type: number
          format: decimal
          default: 0
        periodo_referencia:
          type: string
          enum: [T1, T2, T3, T4]
        fonte_dados:
          type: string

    IndicadorUpdate:
      type: object
      properties:
        nome:
          type: string
        unidade:
          type: string
        meta:
          type: number
          format: decimal
        valor_actual:
          type: number
          format: decimal
        periodo_referencia:
          type: string
          enum: [T1, T2, T3, T4]
        fonte_dados:
          type: string

    IndicadorResponse:
      allOf:
        - $ref: '#/components/schemas/Indicador'
        - type: object
          properties:
            projeto:
              $ref: '#/components/schemas/ProjetoSimple'

    ProjetoSimple:
      type: object
      properties:
        id:
          type: integer
        nome:
          type: string

    DashboardStats:
      type: object
      properties:
        total_indicadores:
          type: integer
        por_trimestre:
          type: object
          additionalProperties:
            type: integer
        execucao_media_percentual:
          type: number
        indicadores_por_projeto:
          type: integer

    ImportResult:
      type: object
      properties:
        imported_count:
          type: integer
        errors:
          type: array
          items:
            type: string
        success:
          type: boolean

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### WebSockets (Futuro)
```yaml
# Eventos WebSocket para atualizações em tempo real
events:
  - name: indicador_created
    description: Novo indicador criado
    payload:
      type: object
      properties:
        indicador:
          $ref: '#/components/schemas/Indicador'
        timestamp:
          type: string
          format: date-time

  - name: indicador_updated
    description: Indicador atualizado
    payload:
      type: object
      properties:
        indicador:
          $ref: '#/components/schemas/Indicador'
        changes:
          type: object
        timestamp:
          type: string
          format: date-time

  - name: indicador_deleted
    description: Indicador eliminado
    payload:
      type: object
      properties:
        indicador_id:
          type: integer
        timestamp:
          type: string
          format: date-time
```

## 📋 Contratos de Dados

### Schemas TypeScript
```typescript
// Tipos para o frontend
export interface Indicador {
  id: number;
  projeto_id: number;
  nome: string;
  unidade: string;
  meta: number;
  valor_actual: number;
  periodo_referencia: Trimestre;
  fonte_dados: string;
  created_at: string;
  updated_at?: string;
}

export interface IndicadorCreate {
  projeto_id: number;
  nome: string;
  unidade: string;
  meta: number;
  valor_actual?: number;
  periodo_referencia: Trimestre;
  fonte_dados: string;
}

export interface IndicadorUpdate {
  nome?: string;
  unidade?: string;
  meta?: number;
  valor_actual?: number;
  periodo_referencia?: Trimestre;
  fonte_dados?: string;
}

export interface IndicadorResponse extends Indicador {
  projeto?: ProjetoSimple;
}

export interface ProjetoSimple {
  id: number;
  nome: string;
}

export type Trimestre = 'T1' | 'T2' | 'T3' | 'T4';

export interface IndicadorFilters {
  projeto_id?: number;
  periodo_referencia?: Trimestre;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  total_indicadores: number;
  por_trimestre: Record<string, number>;
  execucao_media_percentual: number;
  indicadores_por_projeto: number;
}
```

## 🔄 Fluxos de Integração

### Fluxo de Criação de Indicador
1. **Frontend:** Usuário preenche formulário
2. **Frontend:** Validação local dos dados
3. **Frontend:** Envio POST para `/api/indicadores/`
4. **Backend:** Validação de permissões (ROOT ou GESTAO_DADOS)
5. **Backend:** Validação dos dados de entrada
6. **Backend:** Criação do indicador no banco
7. **Backend:** Log de auditoria
8. **Backend:** Retorno do indicador criado
9. **Frontend:** Atualização da lista
10. **Frontend:** Feedback visual de sucesso

### Fluxo de Filtros e Pesquisa
1. **Frontend:** Usuário insere termo de pesquisa
2. **Frontend:** Debounce de 500ms aplicado
3. **Frontend:** Atualização dos filtros
4. **Frontend:** Envio GET para `/api/indicadores/` com parâmetros
5. **Backend:** Aplicação dos filtros na query
6. **Backend:** Retorno dos indicadores filtrados
7. **Frontend:** Atualização da lista e gráficos
8. **Frontend:** Atualização dos KPIs

### Fluxo de Exportação
1. **Frontend:** Usuário clica em "Exportar"
2. **Frontend:** Envio GET para `/api/indicadores/export` com filtros ativos
3. **Backend:** Geração do CSV com dados filtrados
4. **Backend:** Retorno do conteúdo CSV
5. **Frontend:** Download automático do arquivo

## 📝 Notas

### Validações de Segurança
- Todas as operações de escrita requerem autenticação
- Apenas ROOT e GESTAO_DADOS podem criar/editar/eliminar
- Todas as operações são auditadas
- Validação de entrada no backend e frontend

### Tratamento de Erros
- Códigos HTTP apropriados (200, 201, 400, 403, 404, 422)
- Mensagens de erro descritivas
- Log de erros no backend
- Feedback visual no frontend

### Performance
- Paginação para grandes volumes
- Debounce na pesquisa
- Queries otimizadas no backend
- Cache de dados no frontend (futuro)
