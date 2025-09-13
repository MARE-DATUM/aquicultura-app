# 🌱 Spec Kit - Aquicultura App

**Kit de ferramentas para Spec-Driven Development no projeto Aquicultura App**

## 📋 Visão Geral

O Spec Kit é uma coleção de templates, scripts e ferramentas que facilitam o desenvolvimento orientado a especificações (Spec-Driven Development) no projeto Aquicultura App. Ele garante que todas as features sejam desenvolvidas com qualidade, documentação adequada e seguindo padrões consistentes.

## 🎯 Objetivos

- **Padronizar** o processo de desenvolvimento de features
- **Garantir qualidade** através de especificações claras
- **Acelerar** o desenvolvimento com templates e scripts
- **Melhorar** a documentação e manutenibilidade do código
- **Facilitar** a colaboração entre membros da equipe

## 🏗️ Estrutura

```
spec-kit/
├── templates/           # Templates para especificações
│   ├── spec-template.md
│   ├── plan-template.md
│   └── tasks-template.md
├── scripts/            # Scripts de automação
│   ├── create-new-feature.sh
│   └── setup-plan.sh
├── memory/             # Memória e constituição
│   └── constitution.md
├── specs/              # Especificações das features
│   └── [feature-dirs]/
└── README.md           # Este arquivo
```

## 🚀 Como Usar

### 1. Criar uma Nova Feature

```bash
# Navegar para o diretório do projeto
cd /Users/marconadas/aquicultura-app

# Criar uma nova feature
./spec-kit/scripts/create-new-feature.sh "Nome da Feature"
```

Isso criará:
- Diretório da feature em `spec-kit/specs/`
- Especificação funcional (`spec.md`)
- Plano de implementação (`plan.md`)
- Lista de tarefas (`tasks.md`)
- Arquivos de pesquisa, contratos e modelo de dados

### 2. Configurar Plano de Implementação

```bash
# Configurar plano baseado em uma especificação existente
./spec-kit/scripts/setup-plan.sh "spec-kit/specs/[feature]/spec.md"
```

### 3. Seguir o Processo

1. **Especificar** - Definir requisitos claros
2. **Planejar** - Criar plano de implementação
3. **Implementar** - Desenvolver seguindo o plano
4. **Testar** - Validar contra a especificação
5. **Documentar** - Atualizar documentação
6. **Deploy** - Fazer deploy seguindo o processo

## 📚 Templates Disponíveis

### Especificação Funcional (`spec-template.md`)
- Visão geral da feature
- Personas e casos de uso
- Requisitos funcionais e não funcionais
- Design e UX
- Modelo de dados
- APIs e integrações
- Estratégia de testes
- Checklist de aceitação

### Plano de Implementação (`plan-template.md`)
- Resumo executivo
- Arquitetura técnica
- Cronograma de implementação
- Recursos e responsabilidades
- Riscos e mitigações
- Estratégia de testes
- Processo de deploy

### Lista de Tarefas (`tasks-template.md`)
- Tarefas por categoria
- Cronograma detalhado
- Dependências entre tarefas
- Bloqueadores e riscos
- Métricas de progresso

## 🔧 Scripts Disponíveis

### `create-new-feature.sh`
Cria uma nova feature completa com todos os arquivos necessários.

**Uso:**
```bash
./spec-kit/scripts/create-new-feature.sh "Nome da Feature"
```

### `setup-plan.sh`
Configura um plano de implementação baseado em uma especificação existente.

**Uso:**
```bash
./spec-kit/scripts/setup-plan.sh "caminho/para/spec.md"
```

## 📖 Constituição

A constituição do Spec Kit (`memory/constitution.md`) define:
- Princípios fundamentais
- Padrões de arquitetura
- Processo de desenvolvimento
- Estratégia de testes
- Métricas e monitoramento
- Práticas de segurança
- Padrões de documentação

## 🎨 Personalização

### Adicionando Novos Templates
1. Crie o template em `templates/`
2. Atualize os scripts para usar o novo template
3. Documente o uso do template

### Modificando Scripts
1. Edite o script em `scripts/`
2. Teste o script
3. Documente as mudanças

### Atualizando Constituição
1. Edite `memory/constitution.md`
2. Comunique as mudanças para a equipe
3. Atualize a documentação se necessário

## 🔗 Integração com MCP

O Spec Kit está configurado para funcionar com o Model Context Protocol (MCP) do Cursor:

```json
{
  "mcpServers": {
    "spec-kit": {
      "command": "node",
      "args": [
        "/Users/marconadas/aquicultura-app/spec-kit/mcp-server.js"
      ],
      "env": {
        "GITHUB_TOKEN": "seu_token_aqui"
      }
    }
  }
}
```

### Ferramentas MCP Disponíveis

- **create_feature** - Criar uma nova feature
- **setup_plan** - Configurar plano de implementação
- **list_features** - Listar features existentes
- **get_feature_info** - Obter informações de uma feature
- **check_integration** - Verificar integridade da integração

## 📊 Métricas de Sucesso

### Qualidade
- **Cobertura de testes:** > 80%
- **Bugs em produção:** < 1 por semana
- **Tempo de desenvolvimento:** Dentro do prazo estimado

### Processo
- **Especificações aprovadas:** 100%
- **Code review:** 100% das mudanças
- **Documentação atualizada:** 100%

### Equipe
- **Satisfação da equipe:** > 4.5/5
- **Adoção do processo:** > 90%
- **Tempo de onboarding:** < 1 semana

## 🚨 Troubleshooting

### Problemas Comuns

**Script não executa:**
```bash
chmod +x spec-kit/scripts/*.sh
```

**Template não encontrado:**
- Verifique se o arquivo existe em `templates/`
- Verifique se o script está apontando para o caminho correto

**MCP não funciona:**
- Verifique se o token do GitHub está correto
- Reinicie o Cursor após mudanças no `mcp.json`

## 🤝 Contribuição

### Como Contribuir
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste as mudanças
5. Submeta um pull request

### Padrões de Contribuição
- Siga a constituição do Spec Kit
- Documente todas as mudanças
- Teste scripts e templates
- Mantenha compatibilidade com versões anteriores

## 📝 Changelog

### v1.0.0 (2024-01-XX)
- Criação inicial do Spec Kit
- Templates básicos (spec, plan, tasks)
- Scripts de automação
- Constituição do projeto
- Integração com MCP

## 🔗 Links Úteis

- [GitHub Spec Kit](https://github.com/github/spec-kit)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cursor IDE](https://cursor.sh/)
- [Documentação do Projeto Aquicultura](docs/)

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação
2. Verifique os issues existentes
3. Crie um novo issue se necessário
4. Entre em contato com a equipe

---

**Desenvolvido com ❤️ para o projeto Aquicultura App**
