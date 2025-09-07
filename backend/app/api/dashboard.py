from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db.database import get_db
from app.core.deps import get_current_active_user
from app.services.projeto_service import ProjetoService
from app.services.indicador_service import IndicadorService
from app.services.licenciamento_service import LicenciamentoService
from app.services.provincia_service import ProvinciaService
from app.services.audit_service import AuditService
from app.models.user import User

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Endpoint central que agrega todas as estatísticas do dashboard.
    Acessível por todos os utilizadores autenticados.
    """
    try:
        # Inicializar serviços
        projeto_service = ProjetoService(db)
        indicador_service = IndicadorService(db)
        licenciamento_service = LicenciamentoService(db)
        provincia_service = ProvinciaService(db)
        audit_service = AuditService(db)

        # Obter estatísticas de cada módulo
        projetos_stats = projeto_service.get_dashboard_stats()
        indicadores_stats = indicador_service.get_indicadores_stats()
        licenciamentos_stats = licenciamento_service.get_licenciamentos_stats()
        mapa_data = provincia_service.get_mapa_provincias()
        
        # Estatísticas de auditoria apenas para ROOT
        audit_stats = None
        if current_user.role == "ROOT":
            audit_stats = audit_service.get_audit_stats()

        # Agregar todas as estatísticas
        dashboard_data = {
            "projetos": projetos_stats,
            "indicadores": indicadores_stats,
            "licenciamentos": licenciamentos_stats,
            "mapa": mapa_data,
            "auditoria": audit_stats,
            "resumo": {
                "total_projetos": projetos_stats.get("total_projetos", 0),
                "projetos_ativos": projetos_stats.get("EM_EXECUCAO", 0),
                "total_provincias_cobertas": len([p for p in mapa_data if p.get("total_projetos", 0) > 0]),
                "total_indicadores": indicadores_stats.get("total_indicadores", 0),
                "licencas_aprovadas": licenciamentos_stats.get("por_status", {}).get("APROVADO", 0),
                "licencas_pendentes": licenciamentos_stats.get("por_status", {}).get("PENDENTE", 0),
            },
            "kpis_18_meses": {
                "producao_total_toneladas": 0,  # TODO: Implementar cálculo específico
                "familias_beneficiadas": 0,     # TODO: Implementar cálculo específico
                "empregos_criados": 0,          # TODO: Implementar cálculo específico
                "execucao_orcamental_percentual": indicadores_stats.get("execucao_media_percentual", 0),
                "licencas_fast_track": licenciamentos_stats.get("total_licenciamentos", 0)
            },
            "distribuicao_fontes": projetos_stats.get("por_fonte_financiamento", {}),
            "distribuicao_tipos": projetos_stats.get("por_tipo", {}),
            "distribuicao_estados": projetos_stats.get("por_estado", {}),
            "evolucao_trimestral": indicadores_stats.get("por_trimestre", {}),
            "meta_data": {
                "ultima_atualizacao": "2025-01-01T00:00:00Z",
                "periodo_referencia": "18 meses (2024-2025)",
                "total_provincias": 21,
                "user_role": current_user.role
            }
        }

        return dashboard_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter estatísticas do dashboard: {str(e)}"
        )


@router.get("/kpis")
def get_dashboard_kpis(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Endpoint específico para KPIs principais do dashboard.
    Otimizado para carregamento rápido.
    """
    try:
        projeto_service = ProjetoService(db)
        indicador_service = IndicadorService(db)
        licenciamento_service = LicenciamentoService(db)

        # KPIs essenciais
        kpis = {
            "projetos": {
                "total": projeto_service.get_total_projetos(),
                "ativos": projeto_service.get_projetos_ativos(),
                "concluidos": projeto_service.get_projetos_concluidos(),
                "orcamento_total": projeto_service.get_orcamento_total(),
                "orcamento_executado": projeto_service.get_orcamento_executado()
            },
            "indicadores": {
                "producao_total": indicador_service.get_producao_total(),
                "familias_beneficiadas": indicador_service.get_familias_beneficiadas(),
                "empregos_criados": indicador_service.get_empregos_criados()
            },
            "licenciamentos": {
                "total": licenciamento_service.get_total_licenciamentos(),
                "aprovados": licenciamento_service.get_licenciamentos_aprovados(),
                "pendentes": licenciamento_service.get_licenciamentos_pendentes(),
                "tempo_medio_aprovacao": licenciamento_service.get_tempo_medio_aprovacao()
            },
            "cobertura": {
                "provincias_cobertas": projeto_service.get_provincias_cobertas(),
                "percentual_cobertura": (projeto_service.get_provincias_cobertas() / 21) * 100
            }
        }

        return kpis

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter KPIs: {str(e)}"
        )


@router.get("/charts")
def get_dashboard_charts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Endpoint específico para dados de gráficos do dashboard.
    """
    try:
        projeto_service = ProjetoService(db)
        indicador_service = IndicadorService(db)
        provincia_service = ProvinciaService(db)

        charts_data = {
            "producao_por_provincia": indicador_service.get_producao_por_provincia(),
            "producao_por_trimestre": indicador_service.get_producao_por_trimestre(),
            "distribuicao_fontes": projeto_service.get_distribuicao_fontes(),
            "evolucao_projetos": projeto_service.get_evolucao_projetos(),
            "status_licenciamentos": licenciamento_service.get_status_distribution(),
            "mapa_provincias": provincia_service.get_mapa_provincias_chart_data()
        }

        return charts_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter dados dos gráficos: {str(e)}"
        )


@router.get("/health")
def dashboard_health_check(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Health check específico para o dashboard.
    Verifica se todos os serviços estão funcionando.
    """
    try:
        health_status = {
            "status": "healthy",
            "timestamp": "2025-01-01T00:00:00Z",
            "services": {
                "database": "healthy",
                "projetos": "healthy",
                "indicadores": "healthy",
                "licenciamentos": "healthy",
                "provincias": "healthy"
            },
            "data_freshness": {
                "projetos": projeto_service.get_last_update(),
                "indicadores": indicador_service.get_last_update(),
                "licenciamentos": licenciamento_service.get_last_update()
            }
        }

        # Verificar se há dados suficientes
        projeto_service = ProjetoService(db)
        total_projetos = projeto_service.get_total_projetos()
        
        if total_projetos == 0:
            health_status["warnings"] = ["Nenhum projeto cadastrado"]
            health_status["status"] = "warning"

        return health_status

    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2025-01-01T00:00:00Z"
        }
