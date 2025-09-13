# Análise da Página de Indicadores - Modelo de Dados

## 🗄️ Entidades Principais

### Indicador
```sql
CREATE TABLE indicadores (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    nome VARCHAR NOT NULL,
    unidade VARCHAR NOT NULL,
    meta NUMERIC(15,2) NOT NULL CHECK (meta >= 0),
    valor_actual NUMERIC(15,2) DEFAULT 0 CHECK (valor_actual >= 0),
    periodo_referencia VARCHAR(2) NOT NULL CHECK (periodo_referencia IN ('T1', 'T2', 'T3', 'T4')),
    fonte_dados VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único do indicador
- `projeto_id`: Referência ao projeto (FK)
- `nome`: Nome descritivo do indicador
- `unidade`: Unidade de medida (ex: toneladas, famílias, %)
- `meta`: Valor meta do indicador
- `valor_actual`: Valor atual alcançado
- `periodo_referencia`: Trimestre de referência (T1, T2, T3, T4)
- `fonte_dados`: Fonte dos dados do indicador
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

### Projeto (Relacionada)
```sql
CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL,
    descricao TEXT,
    provincia_id INTEGER REFERENCES provincias(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🔗 Relacionamentos
- **Indicador** → **N:1** → **Projeto** (Um projeto pode ter múltiplos indicadores)
- **Projeto** → **1:N** → **Indicador** (Um indicador pertence a um projeto)
- **Indicador** → **1:1** → **AuditLog** (Cada operação é auditada)

## 📊 Índices
```sql
-- Índices para performance
CREATE INDEX idx_indicadores_projeto_id ON indicadores(projeto_id);
CREATE INDEX idx_indicadores_periodo ON indicadores(periodo_referencia);
CREATE INDEX idx_indicadores_nome ON indicadores USING gin(to_tsvector('portuguese', nome));
CREATE INDEX idx_indicadores_fonte_dados ON indicadores USING gin(to_tsvector('portuguese', fonte_dados));
CREATE INDEX idx_indicadores_created_at ON indicadores(created_at);
CREATE INDEX idx_indicadores_meta ON indicadores(meta);
CREATE INDEX idx_indicadores_valor_actual ON indicadores(valor_actual);

-- Índice composto para filtros comuns
CREATE INDEX idx_indicadores_projeto_periodo ON indicadores(projeto_id, periodo_referencia);
```

## 🔄 Migrações

### Migração 001 - Criação inicial da tabela indicadores
```sql
-- Criação da tabela indicadores
CREATE TABLE indicadores (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    nome VARCHAR NOT NULL,
    unidade VARCHAR NOT NULL,
    meta NUMERIC(15,2) NOT NULL CHECK (meta >= 0),
    valor_actual NUMERIC(15,2) DEFAULT 0 CHECK (valor_actual >= 0),
    periodo_referencia VARCHAR(2) NOT NULL CHECK (periodo_referencia IN ('T1', 'T2', 'T3', 'T4')),
    fonte_dados VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criação dos índices
CREATE INDEX idx_indicadores_projeto_id ON indicadores(projeto_id);
CREATE INDEX idx_indicadores_periodo ON indicadores(periodo_referencia);
CREATE INDEX idx_indicadores_nome ON indicadores USING gin(to_tsvector('portuguese', nome));
CREATE INDEX idx_indicadores_fonte_dados ON indicadores USING gin(to_tsvector('portuguese', fonte_dados));
CREATE INDEX idx_indicadores_created_at ON indicadores(created_at);
CREATE INDEX idx_indicadores_meta ON indicadores(meta);
CREATE INDEX idx_indicadores_valor_actual ON indicadores(valor_actual);
CREATE INDEX idx_indicadores_projeto_periodo ON indicadores(projeto_id, periodo_referencia);
```

### Migração 002 - Adição de constraints e validações
```sql
-- Adicionar constraints de validação
ALTER TABLE indicadores 
ADD CONSTRAINT chk_meta_positive CHECK (meta >= 0),
ADD CONSTRAINT chk_valor_actual_positive CHECK (valor_actual >= 0),
ADD CONSTRAINT chk_periodo_valid CHECK (periodo_referencia IN ('T1', 'T2', 'T3', 'T4'));

-- Adicionar constraint de nome único por projeto e trimestre
ALTER TABLE indicadores 
ADD CONSTRAINT uk_indicador_projeto_periodo UNIQUE (projeto_id, nome, periodo_referencia);
```

### Migração 003 - Otimizações de performance
```sql
-- Adicionar índices para queries de dashboard
CREATE INDEX idx_indicadores_dashboard_stats ON indicadores(periodo_referencia, meta, valor_actual);
CREATE INDEX idx_indicadores_execucao ON indicadores((valor_actual / NULLIF(meta, 0)));

-- Adicionar índice para busca textual
CREATE INDEX idx_indicadores_search ON indicadores USING gin(
    to_tsvector('portuguese', nome || ' ' || fonte_dados)
);
```

## 📈 Views e Queries Otimizadas

### View para Dashboard Stats
```sql
CREATE VIEW vw_dashboard_stats AS
SELECT 
    COUNT(*) as total_indicadores,
    SUM(meta) as meta_total,
    SUM(valor_actual) as realizado_total,
    CASE 
        WHEN SUM(meta) > 0 THEN (SUM(valor_actual) / SUM(meta)) * 100 
        ELSE 0 
    END as execucao_media_percentual,
    COUNT(DISTINCT projeto_id) as projetos_com_indicadores
FROM indicadores;
```

### View para Indicadores por Trimestre
```sql
CREATE VIEW vw_indicadores_trimestre AS
SELECT 
    periodo_referencia,
    COUNT(*) as total_indicadores,
    SUM(meta) as meta_total,
    SUM(valor_actual) as realizado_total,
    CASE 
        WHEN SUM(meta) > 0 THEN (SUM(valor_actual) / SUM(meta)) * 100 
        ELSE 0 
    END as execucao_percentual
FROM indicadores
GROUP BY periodo_referencia
ORDER BY periodo_referencia;
```

### View para Status dos Indicadores
```sql
CREATE VIEW vw_status_indicadores AS
SELECT 
    CASE 
        WHEN meta = 0 THEN 'Crítico'
        WHEN (valor_actual / meta) > 1.0 THEN 'Acima da Meta'
        WHEN (valor_actual / meta) >= 0.8 THEN 'Dentro da Meta'
        WHEN (valor_actual / meta) >= 0.5 THEN 'Abaixo da Meta'
        ELSE 'Crítico'
    END as status,
    COUNT(*) as quantidade
FROM indicadores
GROUP BY 
    CASE 
        WHEN meta = 0 THEN 'Crítico'
        WHEN (valor_actual / meta) > 1.0 THEN 'Acima da Meta'
        WHEN (valor_actual / meta) >= 0.8 THEN 'Dentro da Meta'
        WHEN (valor_actual / meta) >= 0.5 THEN 'Abaixo da Meta'
        ELSE 'Crítico'
    END;
```

## 🔍 Queries de Análise

### Top 10 Projetos por Execução
```sql
SELECT 
    p.nome as projeto_nome,
    COUNT(i.id) as total_indicadores,
    SUM(i.meta) as meta_total,
    SUM(i.valor_actual) as realizado_total,
    CASE 
        WHEN SUM(i.meta) > 0 THEN (SUM(i.valor_actual) / SUM(i.meta)) * 100 
        ELSE 0 
    END as execucao_percentual
FROM projetos p
JOIN indicadores i ON p.id = i.projeto_id
GROUP BY p.id, p.nome
HAVING COUNT(i.id) > 0
ORDER BY execucao_percentual DESC
LIMIT 10;
```

### Indicadores Críticos
```sql
SELECT 
    i.nome,
    p.nome as projeto,
    i.periodo_referencia,
    i.meta,
    i.valor_actual,
    CASE 
        WHEN i.meta = 0 THEN 0
        ELSE (i.valor_actual / i.meta) * 100
    END as execucao_percentual
FROM indicadores i
JOIN projetos p ON i.projeto_id = p.id
WHERE 
    i.meta = 0 OR (i.valor_actual / i.meta) < 0.5
ORDER BY execucao_percentual ASC;
```

### Evolução Trimestral
```sql
SELECT 
    periodo_referencia,
    COUNT(*) as total_indicadores,
    SUM(meta) as meta_total,
    SUM(valor_actual) as realizado_total,
    AVG(CASE 
        WHEN meta > 0 THEN (valor_actual / meta) * 100 
        ELSE 0 
    END) as execucao_media
FROM indicadores
GROUP BY periodo_referencia
ORDER BY 
    CASE periodo_referencia 
        WHEN 'T1' THEN 1 
        WHEN 'T2' THEN 2 
        WHEN 'T3' THEN 3 
        WHEN 'T4' THEN 4 
    END;
```

## 📊 Métricas de Performance

### Estatísticas da Tabela
```sql
-- Tamanho da tabela
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename = 'indicadores';

-- Uso de índices
SELECT 
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE relname = 'indicadores';
```

### Queries de Monitoramento
```sql
-- Indicadores mais consultados
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements 
WHERE query LIKE '%indicadores%'
ORDER BY calls DESC;

-- Locks na tabela
SELECT 
    mode,
    granted,
    query
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE l.relation = 'indicadores'::regclass;
```

## 📝 Notas

### Considerações de Design
- **Normalização:** Tabela normalizada com relacionamento 1:N para projetos
- **Performance:** Índices otimizados para queries de dashboard
- **Integridade:** Constraints para garantir consistência dos dados
- **Auditoria:** Integração com sistema de auditoria existente

### Otimizações Implementadas
- Índices compostos para filtros comuns
- Views materializadas para queries complexas
- Constraints para validação de dados
- Índices GIN para busca textual

### Futuras Melhorias
- Particionamento por trimestre para grandes volumes
- Índices parciais para dados ativos
- Cache de queries frequentes
- Compressão de dados históricos
