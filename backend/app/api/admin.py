from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from typing import Dict, Any, List
import json
import os
import tempfile
from datetime import datetime
from app.db.database import get_db, engine
from app.core.deps import require_root
from app.models.user import User
from app.core.rate_limiter import login_attempts
import subprocess
import shutil

router = APIRouter()


@router.get("/export/database")
def export_database(
    format: str = "json",
    current_user: User = Depends(require_root),
    db: Session = Depends(get_db)
):
    """
    Exporta todo o banco de dados (apenas ROOT).
    Formatos suportados: json, sql
    """
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if format == "json":
            # Exportar como JSON
            export_data = export_database_as_json(db)
            
            # Criar arquivo temporário
            temp_file = tempfile.NamedTemporaryFile(
                mode='w',
                suffix=f'_aquicultura_export_{timestamp}.json',
                delete=False
            )
            
            json.dump(export_data, temp_file, indent=2, default=str)
            temp_file.close()
            
            return FileResponse(
                path=temp_file.name,
                filename=f"aquicultura_export_{timestamp}.json",
                media_type="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename=aquicultura_export_{timestamp}.json"
                }
            )
            
        elif format == "sql":
            # Exportar como SQL (dump do banco)
            return export_database_as_sql(timestamp)
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato não suportado. Use 'json' ou 'sql'"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar banco de dados: {str(e)}"
        )


def export_database_as_json(db: Session) -> Dict[str, Any]:
    """
    Exporta todas as tabelas do banco como JSON
    """
    export_data = {
        "export_info": {
            "timestamp": datetime.now().isoformat(),
            "database": "aquicultura",
            "version": "1.0"
        },
        "data": {}
    }
    
    # Lista de tabelas para exportar
    tables_to_export = [
        "users",
        "provincias", 
        "projetos",
        "indicadores",
        "licenciamentos",
        "eixos_5w2h",
        "audit_logs"
    ]
    
    inspector = inspect(engine)
    
    for table_name in tables_to_export:
        if table_name in inspector.get_table_names():
            # Executar query para obter todos os registros
            result = db.execute(text(f"SELECT * FROM {table_name}"))
            
            # Converter para lista de dicionários
            columns = result.keys()
            rows = []
            for row in result:
                row_dict = dict(zip(columns, row))
                # Converter tipos especiais para string
                for key, value in row_dict.items():
                    if isinstance(value, (datetime,)):
                        row_dict[key] = value.isoformat()
                rows.append(row_dict)
            
            export_data["data"][table_name] = {
                "count": len(rows),
                "records": rows
            }
    
    return export_data


def export_database_as_sql(timestamp: str):
    """
    Exporta o banco como arquivo SQL usando pg_dump ou sqlite3
    """
    database_url = os.getenv("DATABASE_URL", "sqlite:///./aquicultura.db")
    
    if "sqlite" in database_url:
        # Para SQLite
        db_path = database_url.replace("sqlite:///", "")
        if not os.path.exists(db_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo de banco de dados não encontrado"
            )
        
        # Criar cópia do arquivo SQLite
        temp_file = tempfile.NamedTemporaryFile(
            suffix=f'_aquicultura_export_{timestamp}.db',
            delete=False
        )
        temp_file.close()
        
        shutil.copy2(db_path, temp_file.name)
        
        # Gerar arquivo SQL usando sqlite3
        sql_file = tempfile.NamedTemporaryFile(
            mode='w',
            suffix=f'_aquicultura_export_{timestamp}.sql',
            delete=False
        )
        sql_file.close()
        
        try:
            # Usar sqlite3 para fazer dump
            result = subprocess.run(
                ["sqlite3", db_path, ".dump"],
                capture_output=True,
                text=True,
                check=True
            )
            
            with open(sql_file.name, 'w') as f:
                f.write(result.stdout)
            
            return FileResponse(
                path=sql_file.name,
                filename=f"aquicultura_export_{timestamp}.sql",
                media_type="text/plain",
                headers={
                    "Content-Disposition": f"attachment; filename=aquicultura_export_{timestamp}.sql"
                }
            )
            
        except subprocess.CalledProcessError as e:
            # Se sqlite3 não estiver disponível, retornar o arquivo .db
            return FileResponse(
                path=temp_file.name,
                filename=f"aquicultura_export_{timestamp}.db",
                media_type="application/x-sqlite3",
                headers={
                    "Content-Disposition": f"attachment; filename=aquicultura_export_{timestamp}.db"
                }
            )
            
    else:
        # Para PostgreSQL
        # Extrair informações de conexão
        import re
        pattern = r"postgresql://([^:]+):([^@]+)@([^/]+)/(.+)"
        match = re.match(pattern, database_url)
        
        if not match:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Não foi possível extrair informações de conexão"
            )
        
        user, password, host, database = match.groups()
        
        # Criar arquivo temporário para o dump
        temp_file = tempfile.NamedTemporaryFile(
            suffix=f'_aquicultura_export_{timestamp}.sql',
            delete=False
        )
        temp_file.close()
        
        try:
            # Usar pg_dump para fazer backup
            env = os.environ.copy()
            env['PGPASSWORD'] = password
            
            result = subprocess.run(
                [
                    "pg_dump",
                    "-h", host.split(':')[0],
                    "-U", user,
                    "-d", database,
                    "-f", temp_file.name,
                    "--no-owner",
                    "--no-privileges"
                ],
                env=env,
                capture_output=True,
                text=True,
                check=True
            )
            
            return FileResponse(
                path=temp_file.name,
                filename=f"aquicultura_export_{timestamp}.sql",
                media_type="text/plain",
                headers={
                    "Content-Disposition": f"attachment; filename=aquicultura_export_{timestamp}.sql"
                }
            )
            
        except subprocess.CalledProcessError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao exportar banco PostgreSQL: {e.stderr}"
            )


@router.get("/export/table/{table_name}")
def export_table(
    table_name: str,
    format: str = "json",
    current_user: User = Depends(require_root),
    db: Session = Depends(get_db)
):
    """
    Exporta uma tabela específica (apenas ROOT).
    """
    try:
        # Verificar se a tabela existe
        inspector = inspect(engine)
        if table_name not in inspector.get_table_names():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tabela '{table_name}' não encontrada"
            )
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if format == "json":
            # Exportar tabela como JSON
            result = db.execute(text(f"SELECT * FROM {table_name}"))
            columns = result.keys()
            rows = []
            
            for row in result:
                row_dict = dict(zip(columns, row))
                for key, value in row_dict.items():
                    if isinstance(value, (datetime,)):
                        row_dict[key] = value.isoformat()
                rows.append(row_dict)
            
            export_data = {
                "table": table_name,
                "timestamp": datetime.now().isoformat(),
                "count": len(rows),
                "records": rows
            }
            
            return JSONResponse(
                content=export_data,
                headers={
                    "Content-Disposition": f"attachment; filename={table_name}_export_{timestamp}.json"
                }
            )
            
        elif format == "csv":
            # Exportar como CSV
            import csv
            import io
            
            result = db.execute(text(f"SELECT * FROM {table_name}"))
            columns = result.keys()
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Escrever cabeçalho
            writer.writerow(columns)
            
            # Escrever dados
            for row in result:
                writer.writerow(row)
            
            content = output.getvalue()
            
            # Criar arquivo temporário para CSV
            temp_file = tempfile.NamedTemporaryFile(
                mode='w',
                suffix=f'_{table_name}_export_{timestamp}.csv',
                delete=False,
                encoding='utf-8'
            )
            temp_file.write(content)
            temp_file.close()
            
            return FileResponse(
                path=temp_file.name,
                filename=f"{table_name}_export_{timestamp}.csv",
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={table_name}_export_{timestamp}.csv"
                }
            )
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato não suportado. Use 'json' ou 'csv'"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar tabela: {str(e)}"
        )


@router.get("/stats")
def get_database_stats(
    current_user: User = Depends(require_root),
    db: Session = Depends(get_db)
):
    """
    Retorna estatísticas do banco de dados (apenas ROOT).
    """
    try:
        stats = {
            "database_info": {
                "engine": db.bind.dialect.name,
                "url": str(db.bind.url).split('@')[-1] if '@' in str(db.bind.url) else 'local',
                "timestamp": datetime.now().isoformat()
            },
            "tables": {}
        }
        
        inspector = inspect(engine)
        
        for table_name in inspector.get_table_names():
            # Contar registros
            count_result = db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            count = count_result.scalar()
            
            # Obter informações das colunas
            columns = inspector.get_columns(table_name)
            
            stats["tables"][table_name] = {
                "record_count": count,
                "column_count": len(columns),
                "columns": [col['name'] for col in columns]
            }
        
        # Adicionar estatísticas gerais
        stats["summary"] = {
            "total_tables": len(stats["tables"]),
            "total_records": sum(t["record_count"] for t in stats["tables"].values())
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter estatísticas: {str(e)}"
        )


@router.post("/rate-limit/clear")
def clear_rate_limits(
    current_user = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Limpa todos os rate limits de login (apenas ROOT)"""
    try:
        # Limpar o dicionário de tentativas de login
        login_attempts.clear()
        
        return {
            "message": "Rate limits limpos com sucesso",
            "cleared_at": datetime.utcnow().isoformat(),
            "total_cleared": len(login_attempts)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao limpar rate limits: {str(e)}"
        )


@router.get("/rate-limit/status")
def get_rate_limit_status(
    current_user = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Obtém status dos rate limits (apenas ROOT)"""
    try:
        return {
            "total_ips_blocked": len(login_attempts),
            "blocked_ips": list(login_attempts.keys()),
            "details": login_attempts
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter status dos rate limits: {str(e)}"
        )
