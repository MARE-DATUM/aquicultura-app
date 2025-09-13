# Constituição do Spec Kit - Aquicultura App

## 🎯 Princípios Fundamentais

### 1. Spec-Driven Development
- **Toda feature deve começar com uma especificação funcional clara**
- **A especificação deve ser aprovada antes do início da implementação**
- **Mudanças na especificação devem ser documentadas e aprovadas**

### 2. Qualidade de Código
- **Cobertura de testes mínima de 80%**
- **Código deve ser revisado por pelo menos uma pessoa**
- **Padrões de código devem ser seguidos consistentemente**

### 3. Documentação
- **Toda funcionalidade deve ter documentação atualizada**
- **APIs devem ter documentação OpenAPI/Swagger**
- **Decisões arquiteturais devem ser documentadas**

## 🏗️ Arquitetura e Padrões

### Stack Tecnológico Padrão
- **Frontend:** React + TypeScript + Vite
- **Backend:** Python + FastAPI + SQLAlchemy
- **Banco de Dados:** PostgreSQL
- **Infraestrutura:** Docker + Docker Compose

### Padrões de Desenvolvimento
- **API-First:** Sempre definir a API antes da implementação
- **Test-Driven Development:** Escrever testes antes do código
- **Clean Architecture:** Separação clara de responsabilidades
- **Microservices:** Quando apropriado, usar arquitetura de microserviços

### Convenções de Nomenclatura
- **Arquivos:** kebab-case (ex: user-service.ts)
- **Variáveis:** camelCase (ex: userName)
- **Constantes:** UPPER_SNAKE_CASE (ex: API_BASE_URL)
- **Classes:** PascalCase (ex: UserService)
- **Interfaces:** PascalCase com prefixo I (ex: IUser)

## 📋 Processo de Desenvolvimento

### 1. Criação de Feature
1. **Criar especificação funcional** usando o template
2. **Revisar e aprovar** a especificação
3. **Criar plano de implementação** baseado na especificação
4. **Definir tarefas** específicas e estimativas
5. **Implementar** seguindo o plano
6. **Testar** e validar contra a especificação
7. **Documentar** e fazer deploy

### 2. Code Review
- **Toda mudança deve passar por code review**
- **Pelo menos 2 aprovações** para mudanças críticas
- **Testes devem passar** antes do merge
- **Documentação deve ser atualizada** se necessário

### 3. Deploy
- **Desenvolvimento:** Deploy automático na branch develop
- **Staging:** Deploy manual na branch staging
- **Produção:** Deploy manual com aprovação na branch main

## 🧪 Estratégia de Testes

### Testes Unitários
- **Cobertura mínima:** 80%
- **Ferramentas:** Jest (frontend), pytest (backend)
- **Responsabilidade:** Desenvolvedores

### Testes de Integração
- **Ambiente:** Staging
- **Cenários:** Fluxos principais da aplicação
- **Responsabilidade:** QA + Desenvolvedores

### Testes E2E
- **Ferramentas:** Playwright
- **Cenários:** Fluxos críticos de usuário
- **Responsabilidade:** QA

## 📊 Métricas e Monitoramento

### Métricas Técnicas
- **Performance:** Tempo de resposta < 200ms
- **Disponibilidade:** 99.9%
- **Cobertura de testes:** > 80%
- **Bugs em produção:** < 1 por semana

### Métricas de Negócio
- **Satisfação do usuário:** > 4.5/5
- **Tempo de desenvolvimento:** Dentro do prazo estimado
- **Qualidade da entrega:** Sem bugs críticos

## 🔒 Segurança

### Princípios
- **Princípio do menor privilégio**
- **Validação de entrada** em todas as APIs
- **Autenticação e autorização** adequadas
- **Logs de auditoria** para ações sensíveis

### Práticas
- **Dependências atualizadas** regularmente
- **Secrets gerenciados** adequadamente
- **HTTPS** em produção
- **Validação de dados** em frontend e backend

## 📚 Documentação

### Tipos de Documentação
1. **Especificações funcionais** (spec.md)
2. **Planos de implementação** (plan.md)
3. **Documentação técnica** (README.md, API docs)
4. **Documentação de usuário** (user guides)
5. **Decisões arquiteturais** (ADRs)

### Padrões de Documentação
- **Markdown** para documentação textual
- **OpenAPI/Swagger** para APIs
- **Diagramas** para arquitetura (Mermaid)
- **Exemplos de código** sempre que possível

## 🔄 Processo de Melhoria Contínua

### Retrospectivas
- **Frequência:** A cada sprint
- **Foco:** Processo, ferramentas, qualidade
- **Ações:** Implementar melhorias identificadas

### Métricas de Processo
- **Tempo de desenvolvimento** vs estimativa
- **Qualidade do código** (complexidade, duplicação)
- **Satisfação da equipe** (surveys)
- **Feedback dos usuários**

## 🚀 Inovação e Experimentação

### Experimentos
- **Dedicação:** 10% do tempo para experimentos
- **Aprovação:** Propostas devem ser aprovadas
- **Documentação:** Resultados devem ser documentados
- **Adoção:** Sucessos devem ser adotados

### Ferramentas e Tecnologias
- **Avaliação:** Testar novas ferramentas em projetos pequenos
- **Adoção:** Apenas após validação e aprovação
- **Migração:** Planejar migrações gradualmente

## 👥 Colaboração e Comunicação

### Comunicação
- **Canais:** Slack para comunicação diária
- **Reuniões:** Daily standups, planning, retrospectivas
- **Documentação:** Sempre atualizada e acessível

### Colaboração
- **Pair programming** quando apropriado
- **Code review** obrigatório
- **Conhecimento compartilhado** através de documentação

## 📝 Notas Importantes

### Compliance
- **LGPD:** Seguir regulamentações de proteção de dados
- **Auditoria:** Manter logs para auditoria
- **Backup:** Estratégia de backup definida

### Escalabilidade
- **Performance:** Considerar escalabilidade desde o início
- **Arquitetura:** Preparar para crescimento
- **Monitoramento:** Implementar métricas de performance

---

**Versão:** 1.0  
**Data de Criação:** $(date +"%Y-%m-%d")  
**Última Atualização:** $(date +"%Y-%m-%d")  
**Próxima Revisão:** $(date -d "+3 months" +"%Y-%m-%d")
