# Especificação: Sistema de CRUD e Exportação de Indicadores

## Visão Geral

Esta especificação define a implementação completa de um sistema de gestão de indicadores para o App de Aquicultura, incluindo funcionalidades de criação, edição, visualização, eliminação e exportação de indicadores.

## Contexto

O sistema atual já possui uma estrutura básica de indicadores, mas precisa de melhorias significativas na interface de utilizador, validações, e funcionalidades de exportação para atender às necessidades dos utilizadores do Ministério das Pescas e Recursos Marinhos.

## Objetivos

1. **Criar Interface Intuitiva**: Desenvolver uma interface moderna e responsiva para gestão de indicadores
2. **Implementar CRUD Completo**: Permitir criação, leitura, atualização e eliminação de indicadores
3. **Sistema de Exportação**: Implementar exportação em múltiplos formatos (CSV, Excel, PDF)
4. **Validações Robustas**: Garantir integridade dos dados com validações no frontend e backend
5. **Experiência do Utilizador**: Interface responsiva e acessível para todos os tipos de utilizadores

## Requisitos Funcionais

### RF001 - Gestão de Indicadores
- **RF001.1**: Criar novo indicador com validação de dados
- **RF001.2**: Editar indicador existente
- **RF001.3**: Visualizar detalhes do indicador
- **RF001.4**: Eliminar indicador com confirmação
- **RF001.5**: Listar indicadores com filtros e paginação

### RF002 - Sistema de Filtros
- **RF002.1**: Filtrar por projeto
- **RF002.2**: Filtrar por trimestre
- **RF002.3**: Pesquisa por texto
- **RF002.4**: Filtros combinados
- **RF002.5**: Limpar filtros

### RF003 - Exportação de Dados
- **RF003.1**: Exportar para CSV
- **RF003.2**: Exportar para Excel
- **RF003.3**: Exportar para PDF
- **RF003.4**: Exportar com filtros aplicados
- **RF003.5**: Exportar dados completos

### RF004 - Validações
- **RF004.1**: Validação de campos obrigatórios
- **RF004.2**: Validação de tipos de dados
- **RF004.3**: Validação de valores numéricos
- **RF004.4**: Validação de unicidade
- **RF004.5**: Validação de permissões

## Requisitos Não Funcionais

### RNF001 - Performance
- Tempo de resposta < 2 segundos para operações CRUD
- Suporte a 1000+ indicadores com paginação
- Cache de dados para melhor performance

### RNF002 - Usabilidade
- Interface responsiva para desktop e mobile
- Acessibilidade WCAG 2.1 AA
- Feedback visual para todas as ações

### RNF003 - Segurança
- Validação no frontend e backend
- Controle de acesso baseado em roles
- Sanitização de dados de entrada

### RNF004 - Compatibilidade
- Suporte a navegadores modernos
- Funcionamento em localhost:3000
- Compatibilidade com Docker

## Regras de Negócio

### RN001 - Criação de Indicadores
- Nome do indicador é obrigatório e único por projeto/trimestre
- Meta deve ser maior que zero
- Valor atual não pode ser negativo
- Projeto deve existir e estar ativo

### RN002 - Edição de Indicadores
- Apenas utilizadores ROOT e GESTAO_DADOS podem editar
- Histórico de alterações deve ser mantido
- Validações aplicadas na criação também na edição

### RN003 - Eliminação de Indicadores
- Apenas utilizadores ROOT e GESTAO_DADOS podem eliminar
- Confirmação obrigatória antes da eliminação
- Soft delete para manter histórico

### RN004 - Exportação
- Todos os utilizadores podem exportar
- Filtros aplicados devem ser respeitados na exportação
- Formato de data: DD/MM/YYYY
- Formato de números: separador de milhares

## Casos de Uso

### UC001 - Criar Indicador
**Ator**: Utilizador ROOT ou GESTAO_DADOS
**Pré-condições**: Utilizador autenticado com permissões
**Fluxo Principal**:
1. Utilizador acede à página de indicadores
2. Clica em "Novo Indicador"
3. Preenche formulário com dados do indicador
4. Sistema valida dados
5. Sistema cria indicador
6. Sistema exibe mensagem de sucesso
7. Lista de indicadores é atualizada

**Fluxos Alternativos**:
- 4a. Dados inválidos: Sistema exibe erros de validação
- 5a. Erro na criação: Sistema exibe mensagem de erro

### UC002 - Exportar Indicadores
**Ator**: Qualquer utilizador autenticado
**Pré-condições**: Utilizador autenticado
**Fluxo Principal**:
1. Utilizador aplica filtros desejados
2. Clica em "Exportar"
3. Seleciona formato de exportação
4. Sistema gera arquivo
5. Sistema inicia download

**Fluxos Alternativos**:
- 4a. Erro na geração: Sistema exibe mensagem de erro

## Critérios de Aceitação

### CA001 - Criação de Indicador
- [ ] Formulário com todos os campos obrigatórios
- [ ] Validação em tempo real
- [ ] Mensagem de sucesso após criação
- [ ] Indicador aparece na lista após criação

### CA002 - Edição de Indicador
- [ ] Formulário pré-preenchido com dados atuais
- [ ] Validação de campos alterados
- [ ] Mensagem de sucesso após edição
- [ ] Dados atualizados na lista

### CA003 - Exportação
- [ ] Botão de exportação visível
- [ ] Múltiplos formatos disponíveis
- [ ] Filtros aplicados na exportação
- [ ] Download inicia automaticamente

### CA004 - Interface
- [ ] Design responsivo
- [ ] Navegação intuitiva
- [ ] Feedback visual adequado
- [ ] Acessibilidade básica

## Definições e Acrônimos

- **CRUD**: Create, Read, Update, Delete
- **UI**: User Interface
- **UX**: User Experience
- **API**: Application Programming Interface
- **CSV**: Comma-Separated Values
- **PDF**: Portable Document Format
- **WCAG**: Web Content Accessibility Guidelines

## Referências

- Documentação do FastAPI
- Documentação do React
- Guias de acessibilidade WCAG 2.1
- Padrões de design do sistema atual
