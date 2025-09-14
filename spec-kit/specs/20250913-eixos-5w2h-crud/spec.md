# Especificação: Sistema de Eixos 5W2H - CRUD Completo

## Visão Geral

Esta especificação define a implementação completa do sistema de gestão de eixos 5W2H (What, Why, Where, When, Who, How, How Much) para o sistema de aquicultura. O sistema permite criar, visualizar, editar e eliminar eixos de planeamento estratégico associados a projetos.

## Contexto do Negócio

O sistema 5W2H é uma metodologia de planeamento estratégico que ajuda a estruturar projetos através de 7 perguntas fundamentais:
- **What** (O que): O que será feito
- **Why** (Porquê): Por que será feito
- **Where** (Onde): Onde será feito
- **When** (Quando): Quando será feito
- **Who** (Quem): Quem fará
- **How** (Como): Como será feito
- **How Much** (Quanto): Quanto custará

## Objetivos

1. Implementar interface completa para gestão de eixos 5W2H
2. Permitir criação, edição e eliminação de eixos
3. Implementar sistema de filtros e pesquisa
4. Garantir validação de dados e permissões
5. Melhorar experiência do utilizador com formulários intuitivos

## Requisitos Funcionais

### RF001 - Listagem de Eixos
- **Descrição**: O sistema deve exibir uma lista paginada de eixos 5W2H
- **Critérios de Aceitação**:
  - Lista deve mostrar: projeto, período, resumo do "What", orçamento e ações
  - Deve suportar paginação (20 itens por página)
  - Deve mostrar indicadores visuais de status
  - Deve permitir ordenação por data de criação, projeto, período

### RF002 - Filtros e Pesquisa
- **Descrição**: O sistema deve permitir filtrar e pesquisar eixos
- **Critérios de Aceitação**:
  - Filtro por projeto (dropdown)
  - Filtro por período (0-6, 7-12, 13-18 meses)
  - Pesquisa por texto livre (What, Why, Where, Who, How)
  - Botão para limpar filtros
  - Contador de resultados

### RF003 - Criação de Eixos
- **Descrição**: O sistema deve permitir criar novos eixos 5W2H
- **Critérios de Aceitação**:
  - Formulário modal com todos os campos obrigatórios
  - Validação em tempo real
  - Seleção de projeto (obrigatório)
  - Seleção de período (obrigatório)
  - Campos de texto para What, Why, Where, When, Who, How
  - Campo numérico para How Much (em KZ)
  - Seção opcional para marcos (milestones)
  - Botões: Guardar, Cancelar

### RF004 - Visualização de Eixos
- **Descrição**: O sistema deve permitir visualizar detalhes completos de um eixo
- **Critérios de Aceitação**:
  - Modal com layout organizado por seções
  - Exibição de todas as informações do eixo
  - Informações do projeto associado
  - Marcos com datas e status
  - Botões de ação (Editar, Eliminar)

### RF005 - Edição de Eixos
- **Descrição**: O sistema deve permitir editar eixos existentes
- **Critérios de Aceitação**:
  - Formulário pré-preenchido com dados atuais
  - Validação em tempo real
  - Possibilidade de alterar todos os campos
  - Botões: Guardar Alterações, Cancelar
  - Confirmação antes de guardar

### RF006 - Eliminação de Eixos
- **Descrição**: O sistema deve permitir eliminar eixos
- **Critérios de Aceitação**:
  - Confirmação obrigatória antes da eliminação
  - Mensagem de sucesso após eliminação
  - Atualização automática da lista
  - Registo de auditoria

### RF007 - Gestão de Marcos
- **Descrição**: O sistema deve permitir adicionar e gerir marcos (milestones)
- **Critérios de Aceitação**:
  - Interface para adicionar/remover marcos
  - Campos: nome, data, status
  - Validação de datas
  - Status: Pendente, Em Progresso, Concluído

## Requisitos Não Funcionais

### RNF001 - Performance
- Tempo de carregamento da lista < 2 segundos
- Tempo de resposta de operações CRUD < 1 segundo
- Suporte a até 1000 eixos simultâneos

### RNF002 - Usabilidade
- Interface responsiva para desktop e tablet
- Navegação intuitiva com breadcrumbs
- Mensagens de feedback claras
- Validação em tempo real

### RNF003 - Segurança
- Validação de permissões (ROOT, GESTAO_DADOS)
- Sanitização de inputs
- Registo de auditoria para todas as operações

### RNF004 - Compatibilidade
- Suporte a navegadores modernos (Chrome, Firefox, Safari, Edge)
- Funcionamento em dispositivos móveis

## Regras de Negócio

### RN001 - Permissões
- Apenas utilizadores com perfil ROOT ou GESTAO_DADOS podem criar/editar/eliminar eixos
- Todos os utilizadores podem visualizar eixos

### RN002 - Validações
- Projeto deve existir e estar ativo
- Período deve ser um dos valores válidos (0-6, 7-12, 13-18)
- How Much deve ser um valor positivo
- Datas de marcos devem ser futuras à data de criação

### RN003 - Orçamento
- Valores devem ser em Kwanza (KZ)
- Formatação monetária automática
- Cálculo de totais por período

## Interface do Utilizador

### Layout Principal
- Header com breadcrumb: "Plano / Eixos 5W2H"
- Título: "Eixos do Plano 7 Passos"
- Botões de ação: "Guardar" e "Novo Eixo"
- Área de filtros (colapsável)
- Lista de eixos em cards
- Paginação no rodapé

### Modal de Criação/Edição
- Título dinâmico: "Novo Eixo do Plano" / "Editar Eixo do Plano"
- Formulário organizado em seções:
  - Informações Básicas (Projeto, Período)
  - Perguntas 5W2H (What, Why, Where, When, Who, How, How Much)
  - Marcos (opcional)
- Botões: "Guardar" / "Guardar Alterações", "Cancelar"

### Modal de Visualização
- Título: "Detalhes do Eixo"
- Layout organizado por seções
- Informações do projeto
- Todas as respostas 5W2H
- Lista de marcos
- Botões de ação: "Editar", "Eliminar", "Fechar"

## Estados e Fluxos

### Estado Inicial
- Lista vazia com mensagem "Nenhum eixo encontrado"
- Botão "Novo Eixo" disponível
- Filtros colapsados

### Fluxo de Criação
1. Utilizador clica "Novo Eixo"
2. Modal abre com formulário vazio
3. Utilizador preenche campos obrigatórios
4. Sistema valida em tempo real
5. Utilizador clica "Guardar"
6. Sistema cria eixo e fecha modal
7. Lista é atualizada

### Fluxo de Edição
1. Utilizador clica "Editar" em um eixo
2. Modal abre com formulário preenchido
3. Utilizador modifica campos
4. Sistema valida alterações
5. Utilizador clica "Guardar Alterações"
6. Sistema atualiza eixo e fecha modal
7. Lista é atualizada

### Fluxo de Eliminação
1. Utilizador clica "Eliminar" em um eixo
2. Sistema exibe confirmação
3. Utilizador confirma eliminação
4. Sistema elimina eixo
5. Lista é atualizada
6. Mensagem de sucesso é exibida

## Critérios de Sucesso

1. ✅ Interface completa e funcional para gestão de eixos 5W2H
2. ✅ Formulários intuitivos com validação em tempo real
3. ✅ Sistema de filtros e pesquisa eficiente
4. ✅ Operações CRUD completas e seguras
5. ✅ Experiência do utilizador fluida e responsiva
6. ✅ Integração perfeita com sistema de permissões existente
7. ✅ Registo de auditoria para todas as operações
