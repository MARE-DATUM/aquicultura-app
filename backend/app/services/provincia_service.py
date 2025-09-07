from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.provincia import Provincia
from app.models.projeto import Projeto, EstadoProjeto
from app.schemas.provincia import ProvinciaResponse


class ProvinciaService:
    def __init__(self, db: Session):
        self.db = db

    def get_provincias(self) -> List[Provincia]:
        """Lista todas as províncias"""
        return self.db.query(Provincia).order_by(Provincia.nome).all()

    def get_provincia_by_id(self, provincia_id: int) -> Optional[Provincia]:
        """Obtém província por ID"""
        return self.db.query(Provincia).filter(Provincia.id == provincia_id).first()

    def get_mapa_provincias(self) -> List[dict]:
        """Obtém dados para mapa das províncias com distribuição de projetos"""
        provincias = self.get_provincias()
        resultado = []
        
        for provincia in provincias:
            # Conta projetos por estado
            projetos = self.db.query(Projeto).filter(Projeto.provincia_id == provincia.id).all()
            
            stats = {
                "planeado": 0,
                "em_execucao": 0,
                "concluido": 0,
                "suspenso": 0
            }
            
            orcamento_total = 0
            orcamento_executado = 0
            
            for projeto in projetos:
                estado_key = projeto.estado.value.lower().replace("_", " ")
                if estado_key in stats:
                    stats[estado_key] += 1
                
                orcamento_total += float(projeto.orcamento_previsto_kz)
                orcamento_executado += float(projeto.orcamento_executado_kz)
            
            # Calcula percentagem de execução
            execucao_percentual = 0
            if orcamento_total > 0:
                execucao_percentual = (orcamento_executado / orcamento_total) * 100
            
            # Define cor baseada no estado predominante
            cor = "gray"  # Default
            if stats["em_execucao"] > 0:
                cor = "blue"
            elif stats["concluido"] > 0:
                cor = "green"
            elif stats["suspenso"] > 0:
                cor = "red"
            elif stats["planeado"] > 0:
                cor = "yellow"
            
            resultado.append({
                "id": provincia.id,
                "nome": provincia.nome,
                "total_projetos": len(projetos),
                "estatisticas": stats,
                "orcamento_total_kz": orcamento_total,
                "orcamento_executado_kz": orcamento_executado,
                "execucao_percentual": round(execucao_percentual, 2),
                "cor": cor,
                "coordenadas": self._get_coordenadas_provincia(provincia.nome)
            })
        
        return resultado

    def _get_coordenadas_provincia(self, nome_provincia: str) -> dict:
        """Retorna coordenadas aproximadas para o mapa (Angola)"""
        coordenadas = {
            "Bengo": {"lat": -8.5, "lng": 13.5},
            "Benguela": {"lat": -12.5, "lng": 13.4},
            "Bié": {"lat": -12.8, "lng": 17.4},
            "Cabinda": {"lat": -5.6, "lng": 12.2},
            "Cuando Cubango": {"lat": -16.0, "lng": 18.0},
            "Cuanza Norte": {"lat": -9.0, "lng": 14.5},
            "Cuanza Sul": {"lat": -10.0, "lng": 15.0},
            "Cunene": {"lat": -16.0, "lng": 15.0},
            "Huambo": {"lat": -12.8, "lng": 15.7},
            "Huíla": {"lat": -14.9, "lng": 14.9},
            "Icolo e Bengo": {"lat": -8.5, "lng": 13.5},
            "Luanda": {"lat": -8.8, "lng": 13.2},
            "Lunda Norte": {"lat": -8.0, "lng": 20.0},
            "Lunda Sul": {"lat": -10.0, "lng": 20.0},
            "Malanje": {"lat": -9.5, "lng": 16.0},
            "Moxico": {"lat": -11.0, "lng": 20.0},
            "Moxico Leste": {"lat": -11.0, "lng": 22.0},
            "Namibe": {"lat": -15.2, "lng": 12.2},
            "Uíge": {"lat": -7.6, "lng": 15.0},
            "Zaire": {"lat": -6.0, "lng": 12.0},
            "Zaire Sul": {"lat": -6.5, "lng": 12.5}
        }
        
        return coordenadas.get(nome_provincia, {"lat": -12.0, "lng": 17.0})
