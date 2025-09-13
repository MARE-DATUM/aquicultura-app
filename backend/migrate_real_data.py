#!/usr/bin/env python3
"""
Script para migrar dados reais do Excel para a base de dados da aplicação
"""

import pandas as pd
import sys
import os
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Numeric, Text, JSON
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import enum

# Adicionar o diretório do backend ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Definir modelos diretamente para evitar problemas de configuração
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

# Enums
class UserRole(str, enum.Enum):
    GESTAO_DADOS = "GESTAO_DADOS"
    VISUALIZACAO = "VISUALIZACAO"

class TipoProjeto(str, enum.Enum):
    AQUICULTURA_COMERCIAL = "AQUICULTURA_COMERCIAL"
    AQUICULTURA_SUBSISTENCIA = "AQUICULTURA_SUBSISTENCIA"
    PESCA_ARTESANAL = "PESCA_ARTESANAL"

class FonteFinanciamento(str, enum.Enum):
    PRIVADO = "PRIVADO"
    PUBLICO = "PUBLICO"
    MISTO = "MISTO"
    COOPERATIVO = "COOPERATIVO"

class EstadoProjeto(str, enum.Enum):
    PLANEADO = "PLANEADO"
    EM_EXECUCAO = "EM_EXECUCAO"
    CONCLUIDO = "CONCLUIDO"
    SUSPENSO = "SUSPENSO"

class Trimestre(str, enum.Enum):
    T1 = "T1"
    T2 = "T2"
    T3 = "T3"
    T4 = "T4"

# Modelos
class Provincia(Base):
    __tablename__ = "provincias"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    projetos = relationship("Projeto", back_populates="provincia")

class Projeto(Base):
    __tablename__ = "projetos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False, index=True)
    provincia_id = Column(Integer, ForeignKey("provincias.id"), nullable=False)
    tipo = Column(Enum(TipoProjeto), nullable=False)
    fonte_financiamento = Column(Enum(FonteFinanciamento), nullable=False)
    estado = Column(Enum(EstadoProjeto), nullable=False, default=EstadoProjeto.PLANEADO)
    responsavel = Column(String, nullable=False)
    orcamento_previsto_kz = Column(Numeric(15, 2), nullable=False)
    orcamento_executado_kz = Column(Numeric(15, 2), default=0)
    data_inicio_prevista = Column(DateTime(timezone=True), nullable=False)
    data_fim_prevista = Column(DateTime(timezone=True), nullable=False)
    descricao = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    provincia = relationship("Provincia", back_populates="projetos")
    indicadores = relationship("Indicador", back_populates="projeto")

class Indicador(Base):
    __tablename__ = "indicadores"
    
    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"), nullable=False)
    nome = Column(String, nullable=False)
    unidade = Column(String, nullable=False)
    meta = Column(Numeric(15, 2), nullable=False)
    valor_actual = Column(Numeric(15, 2), default=0)
    periodo_referencia = Column(Enum(Trimestre), nullable=False)
    fonte_dados = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    projeto = relationship("Projeto", back_populates="indicadores")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.VISUALIZACAO)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

# Função simples de hash de senha
def get_password_hash(password: str) -> str:
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

class DataMigrator:
    def __init__(self, excel_file_path):
        self.excel_file_path = excel_file_path
        self.engine = create_engine("sqlite:///aquicultura.db")
        Base.metadata.create_all(bind=self.engine)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db = SessionLocal()
        
    def extract_provinces_from_empresas(self):
        """Extrai províncias da aba Nº DE EMP.POR PROVÍNCIA"""
        print("Extraindo províncias...")
        df = pd.read_excel(self.excel_file_path, sheet_name='Nº DE EMP.POR PROVÍNCIA')
        
        provinces = set()
        current_province = None
        
        for _, row in df.iterrows():
            # Procurar por nomes de províncias (linhas com apenas um valor não-nulo)
            non_nan_values = row.dropna().tolist()
            if len(non_nan_values) == 1 and isinstance(non_nan_values[0], str):
                province_name = non_nan_values[0].strip()
                if province_name and not province_name.startswith('Nº') and not province_name.startswith('PROJECTO'):
                    provinces.add(province_name)
                    current_province = province_name
                    print(f"Encontrada província: {province_name}")
        
        return list(provinces)
    
    def extract_projects_from_empresas(self):
        """Extrai projetos da aba Nº DE EMP.POR PROVÍNCIA"""
        print("Extraindo projetos...")
        df = pd.read_excel(self.excel_file_path, sheet_name='Nº DE EMP.POR PROVÍNCIA')
        
        projects = []
        current_province = None
        
        for _, row in df.iterrows():
            non_nan_values = row.dropna().tolist()
            
            # Se é uma linha de província
            if len(non_nan_values) == 1 and isinstance(non_nan_values[0], str):
                current_province = non_nan_values[0].strip()
                continue
            
            # Se é uma linha de projeto (tem número, nome do projeto, município)
            if len(non_nan_values) >= 3 and isinstance(non_nan_values[0], (int, float)):
                try:
                    project_num = int(non_nan_values[0])
                    project_name = str(non_nan_values[1]).strip()
                    municipality = str(non_nan_values[2]).strip() if len(non_nan_values) > 2 else ""
                    responsible = str(non_nan_values[3]).strip() if len(non_nan_values) > 3 else ""
                    phone = str(non_nan_values[4]).strip() if len(non_nan_values) > 4 else ""
                    
                    if project_name and current_province:
                        projects.append({
                            'numero': project_num,
                            'nome': project_name,
                            'provincia': current_province,
                            'municipio': municipality,
                            'responsavel': responsible,
                            'telefone': phone
                        })
                except (ValueError, IndexError):
                    continue
        
        return projects
    
    def extract_production_data(self, year='2024'):
        """Extrai dados de produção da aba do ano especificado"""
        print(f"Extraindo dados de produção de {year}...")
        df = pd.read_excel(self.excel_file_path, sheet_name=year)
        
        production_data = []
        
        # Procurar pela linha de cabeçalho
        header_row = None
        for i, row in df.iterrows():
            if 'PROVÍNCIA' in str(row.values):
                header_row = i
                break
        
        if header_row is None:
            print(f"Não foi possível encontrar cabeçalho na aba {year}")
            return production_data
        
        # Extrair dados das linhas seguintes
        for i in range(header_row + 1, len(df)):
            row = df.iloc[i]
            non_nan_values = row.dropna().tolist()
            
            if len(non_nan_values) >= 3:
                try:
                    numero = int(non_nan_values[0])
                    provincia = str(non_nan_values[1]).strip()
                    
                    # Extrair dados mensais (assumindo que começam na coluna 2)
                    monthly_data = {}
                    months = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
                             'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO']
                    
                    for j, month in enumerate(months):
                        if j + 2 < len(non_nan_values):
                            try:
                                value = float(non_nan_values[j + 2])
                                monthly_data[month] = value
                            except (ValueError, IndexError):
                                monthly_data[month] = 0.0
                    
                    production_data.append({
                        'numero': numero,
                        'provincia': provincia,
                        'year': year,
                        'monthly_data': monthly_data
                    })
                    
                except (ValueError, IndexError):
                    continue
        
        return production_data
    
    def create_admin_user(self):
        """Cria usuário administrador padrão"""
        print("Criando usuário administrador...")
        
        # Verificar se já existe
        existing_user = self.db.query(User).filter(User.email == "admin@aquicultura.ao").first()
        if existing_user:
            print("Usuário administrador já existe")
            return existing_user
        
        admin_user = User(
            email="admin@aquicultura.ao",
            hashed_password=get_password_hash("admin123"),
            full_name="Administrador do Sistema",
            role=UserRole.GESTAO_DADOS,
            is_active=True
        )
        
        self.db.add(admin_user)
        self.db.commit()
        print("Usuário administrador criado")
        return admin_user
    
    def migrate_provinces(self, provinces):
        """Migra províncias para a base de dados"""
        print("Migrando províncias...")
        
        for province_name in provinces:
            # Verificar se já existe
            existing = self.db.query(Provincia).filter(Provincia.nome == province_name).first()
            if existing:
                print(f"Província {province_name} já existe")
                continue
            
            province = Provincia(nome=province_name)
            self.db.add(province)
            print(f"Adicionada província: {province_name}")
        
        self.db.commit()
        print("Províncias migradas com sucesso")
    
    def migrate_projects(self, projects):
        """Migra projetos para a base de dados"""
        print("Migrando projetos...")
        
        for project_data in projects:
            # Buscar província
            provincia = self.db.query(Provincia).filter(Provincia.nome == project_data['provincia']).first()
            if not provincia:
                print(f"Província {project_data['provincia']} não encontrada para projeto {project_data['nome']}")
                continue
            
            # Verificar se projeto já existe
            existing = self.db.query(Projeto).filter(Projeto.nome == project_data['nome']).first()
            if existing:
                print(f"Projeto {project_data['nome']} já existe")
                continue
            
            # Criar projeto com dados padrão
            projeto = Projeto(
                nome=project_data['nome'],
                provincia_id=provincia.id,
                tipo=TipoProjeto.AQUICULTURA_COMERCIAL,  # Padrão
                fonte_financiamento=FonteFinanciamento.PRIVADO,  # Padrão
                estado=EstadoProjeto.EM_EXECUCAO,  # Padrão
                responsavel=project_data['responsavel'] or "Não informado",
                orcamento_previsto_kz=Decimal('1000000.00'),  # Padrão
                orcamento_executado_kz=Decimal('0.00'),
                data_inicio_prevista=datetime(2024, 1, 1),  # Padrão
                data_fim_prevista=datetime(2024, 12, 31),  # Padrão
                descricao=f"Projeto migrado de {project_data['provincia']} - {project_data['municipio']}"
            )
            
            self.db.add(projeto)
            print(f"Adicionado projeto: {project_data['nome']} - {project_data['provincia']}")
        
        self.db.commit()
        print("Projetos migrados com sucesso")
    
    def migrate_production_indicators(self, production_data):
        """Migra dados de produção como indicadores"""
        print("Migrando indicadores de produção...")
        
        for data in production_data:
            # Buscar província
            provincia = self.db.query(Provincia).filter(Provincia.nome == data['provincia']).first()
            if not provincia:
                continue
            
            # Buscar projetos desta província
            projetos = self.db.query(Projeto).filter(Projeto.provincia_id == provincia.id).all()
            
            if not projetos:
                # Criar um projeto genérico para a província se não existir
                projeto = Projeto(
                    nome=f"Produção Aquícola - {data['provincia']}",
                    provincia_id=provincia.id,
                    tipo=TipoProjeto.AQUICULTURA_COMERCIAL,
                    fonte_financiamento=FonteFinanciamento.PRIVADO,
                    estado=EstadoProjeto.EM_EXECUCAO,
                    responsavel="DNA",
                    orcamento_previsto_kz=Decimal('1000000.00'),
                    orcamento_executado_kz=Decimal('0.00'),
                    data_inicio_prevista=datetime(int(data['year']), 1, 1),
                    data_fim_prevista=datetime(int(data['year']), 12, 31),
                    descricao=f"Dados de produção consolidados de {data['provincia']} em {data['year']}"
                )
                self.db.add(projeto)
                self.db.commit()
                projetos = [projeto]
            
            # Criar indicadores para cada mês
            for month, value in data['monthly_data'].items():
                if value > 0:  # Só criar indicador se houver produção
                    # Determinar trimestre
                    if month in ['JANEIRO', 'FEVEREIRO', 'MARÇO']:
                        trimestre = Trimestre.T1
                    elif month in ['ABRIL', 'MAIO', 'JUNHO']:
                        trimestre = Trimestre.T2
                    elif month in ['JULHO', 'AGOSTO', 'SETEMBRO']:
                        trimestre = Trimestre.T3
                    else:
                        trimestre = Trimestre.T4
                    
                    # Criar indicador para cada projeto da província
                    for projeto in projetos:
                        indicador = Indicador(
                            projeto_id=projeto.id,
                            nome=f"Produção {month} {data['year']}",
                            unidade="kg",
                            meta=Decimal(str(value)),
                            valor_actual=Decimal(str(value)),
                            periodo_referencia=trimestre,
                            fonte_dados="DNA - Base de Dados Oficial"
                        )
                        self.db.add(indicador)
            
            print(f"Indicadores criados para {data['provincia']} - {data['year']}")
        
        self.db.commit()
        print("Indicadores de produção migrados com sucesso")
    
    def run_migration(self):
        """Executa a migração completa"""
        print("=== INICIANDO MIGRAÇÃO DE DADOS REAIS ===")
        
        try:
            # 1. Criar usuário administrador
            self.create_admin_user()
            
            # 2. Extrair e migrar províncias
            provinces = self.extract_provinces_from_empresas()
            self.migrate_provinces(provinces)
            
            # 3. Extrair e migrar projetos
            projects = self.extract_projects_from_empresas()
            self.migrate_projects(projects)
            
            # 4. Extrair e migrar dados de produção
            production_data_2024 = self.extract_production_data('2024')
            self.migrate_production_indicators(production_data_2024)
            
            print("=== MIGRAÇÃO CONCLUÍDA COM SUCESSO ===")
            
        except Exception as e:
            print(f"Erro durante a migração: {e}")
            self.db.rollback()
            raise
        finally:
            self.db.close()

if __name__ == "__main__":
    excel_file = "docs/DNA - BASE DE DADOS  2024, 2025.xls"
    
    if not os.path.exists(excel_file):
        print(f"Arquivo {excel_file} não encontrado!")
        sys.exit(1)
    
    migrator = DataMigrator(excel_file)
    migrator.run_migration()
