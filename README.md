# 🐟 App de Gestão dos 21 Projetos de Aquicultura

Sistema web para gestão e acompanhamento de 21 projetos de aquicultura em todas as províncias de Angola.

## 📚 Documentação

- **[Projeto](docs/projeto/)** - Documentação principal do projeto
- **[Desenvolvimento](docs/desenvolvimento/)** - Planos e estratégias de desenvolvimento
- **[Auditoria](docs/auditoria/)** - Relatórios de auditoria de código
- **[Comercial](docs/comercial/)** - Propostas e documentação comercial

## 🚀 Início Rápido

```bash
# Iniciar aplicação
docker-compose up -d

# Acessar
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## 🔐 Credenciais Demo

- **ROOT**: admin@aquicultura.ao / admin123456
- **Gestão**: gestao@aquicultura.ao / gestao123456
- **Visualização**: visualizacao@aquicultura.ao / visualizacao123456

## 🛠️ Stack Tecnológica

### Backend
- **Python 3.11** + FastAPI
- **PostgreSQL 15** (banco de dados)
- **Redis 7** (rate limiting)
- **SQLAlchemy** (ORM)
- **Pydantic** (validação)
- **JWT** (autenticação)

### Frontend
- **React 19** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **React Router** (roteamento)
- **Recharts** (gráficos)
- **Axios** (HTTP client)

### Infraestrutura
- **Docker** + Docker Compose
- **Nginx** (proxy reverso)
- **GitHub Actions** (CI/CD)

## 📊 Funcionalidades

- **Dashboard Central**: KPIs nacionais e por província
- **Gestão de Projetos**: CRUD completo com filtros avançados
- **Planeamento 5W2H**: Editor por projeto e fase
- **Indicadores**: Registo trimestral com dashboards
- **Licenciamento**: Tracking fast-track por projeto
- **Mapa Interativo**: Distribuição dos projetos pelas 21 províncias
- **Importação/Exportação**: CSV com validação e auditoria
- **Auditoria**: Log completo de todas as ações

## 🎯 Status do Projeto

- ✅ **Sprint 1 Concluído**: 4 módulos principais funcionais
- ⏳ **Sprint 2 Em Desenvolvimento**: Módulos de gestão
- 📅 **Cronograma**: 4-5 semanas para conclusão total

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@aquicultura.ao
- Issues: [GitHub Issues](https://github.com/MARE-DATUM/aquicultura-app/issues)

---

**Desenvolvido para o Ministério das Pescas e do Mar de Angola (MINPERMAR)**
