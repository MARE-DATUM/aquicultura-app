from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.models.provincia import Provincia
from app.models.projeto import Projeto, TipoProjeto, FonteFinanciamento, EstadoProjeto
from app.models.eixo_5w2h import Eixo5W2H, Periodo5W2H
from app.models.indicador import Indicador, Trimestre
from app.models.licenciamento import Licenciamento, StatusLicenciamento, EntidadeResponsavel
from app.core.security import get_password_hash
from app.core.config import settings
from datetime import datetime, timedelta
from decimal import Decimal
import random


def create_provincias(db: Session):
    """Cria as 21 províncias de Angola"""
    provincias = [
        "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango",
        "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla",
        "Icolo e Bengo", "Luanda", "Lunda Norte", "Lunda Sul", "Malanje",
        "Moxico", "Moxico Leste", "Namibe", "Uíge", "Zaire", "Zaire Sul"
    ]
    
    for nome in provincias:
        existing = db.query(Provincia).filter(Provincia.nome == nome).first()
        if not existing:
            provincia = Provincia(nome=nome)
            db.add(provincia)
    
    db.commit()
    print("✓ Províncias criadas")


def create_users(db: Session):
    """Cria utilizadores iniciais"""
    # ROOT
    root_user = db.query(User).filter(User.email == settings.admin_email).first()
    if not root_user:
        root_user = User(
            email=settings.admin_email,
            hashed_password=get_password_hash(settings.admin_password),
            full_name="Administrador do Sistema",
            role=UserRole.ROOT,
            is_active=True
        )
        db.add(root_user)
    
    # Gestão de Dados
    gestao_user = db.query(User).filter(User.email == "gestao@aquicultura.ao").first()
    if not gestao_user:
        gestao_user = User(
            email="gestao@aquicultura.ao",
            hashed_password=get_password_hash("gestao123456"),
            full_name="Gestor de Dados",
            role=UserRole.GESTAO_DADOS,
            is_active=True
        )
        db.add(gestao_user)
    
    # Visualização
    visualizacao_user = db.query(User).filter(User.email == "visualizacao@aquicultura.ao").first()
    if not visualizacao_user:
        visualizacao_user = User(
            email="visualizacao@aquicultura.ao",
            hashed_password=get_password_hash("visualizacao123456"),
            full_name="Utilizador de Visualização",
            role=UserRole.VISUALIZACAO,
            is_active=True
        )
        db.add(visualizacao_user)
    
    db.commit()
    print("✓ Utilizadores criados")


def create_projetos(db: Session):
    """Cria 21 projetos (1 por província)"""
    provincias = db.query(Provincia).all()
    if len(provincias) != 21:
        print("❌ Erro: Deve ter 21 províncias")
        return
    
    # Tipos e fontes de financiamento
    tipos_fontes = [
        (TipoProjeto.COMUNITARIO, FonteFinanciamento.AFAP_2),
        (TipoProjeto.COMUNITARIO, FonteFinanciamento.FADEPA),
        (TipoProjeto.EMPRESARIAL, FonteFinanciamento.FACRA),
        (TipoProjeto.EMPRESARIAL, FonteFinanciamento.PRIVADO),
    ]
    
    # 15 comunitários (AFAP-2/FADEPA) e 6 empresariais (FACRA/Privado)
    distribuicao = [0, 0, 0, 0]  # AFAP-2, FADEPA, FACRA, PRIVADO
    distribuicao[0] = 8  # AFAP-2
    distribuicao[1] = 7  # FADEPA
    distribuicao[2] = 3  # FACRA
    distribuicao[3] = 3  # PRIVADO
    
    for i, provincia in enumerate(provincias):
        # Escolhe tipo e fonte baseado na distribuição
        tipo_idx = 0
        if i < distribuicao[0]:
            tipo_idx = 0  # AFAP-2
        elif i < distribuicao[0] + distribuicao[1]:
            tipo_idx = 1  # FADEPA
        elif i < distribuicao[0] + distribuicao[1] + distribuicao[2]:
            tipo_idx = 2  # FACRA
        else:
            tipo_idx = 3  # PRIVADO
        
        tipo, fonte = tipos_fontes[tipo_idx]
        
        # Gera dados do projeto
        nome = f"Projeto de Aquicultura {provincia.nome}"
        responsavel = f"Responsável {provincia.nome}"
        
        # Orçamento baseado no tipo
        if tipo == TipoProjeto.COMUNITARIO:
            orcamento_base = random.randint(5000000, 15000000)  # 5-15M Kz
        else:
            orcamento_base = random.randint(20000000, 50000000)  # 20-50M Kz
        
        orcamento_previsto = Decimal(str(orcamento_base))
        orcamento_executado = Decimal(str(random.randint(0, int(orcamento_base * 0.3))))
        
        # Datas
        data_inicio = datetime.now() + timedelta(days=random.randint(-30, 30))
        data_fim = data_inicio + timedelta(days=random.randint(300, 600))  # 10-20 meses
        
        # Estado baseado na data
        if data_inicio > datetime.now():
            estado = EstadoProjeto.PLANEADO
        elif data_fim < datetime.now():
            estado = EstadoProjeto.CONCLUIDO
        else:
            estado = random.choice([EstadoProjeto.EM_EXECUCAO, EstadoProjeto.SUSPENSO])
        
        projeto = Projeto(
            nome=nome,
            provincia_id=provincia.id,
            tipo=tipo,
            fonte_financiamento=fonte,
            estado=estado,
            responsavel=responsavel,
            orcamento_previsto_kz=orcamento_previsto,
            orcamento_executado_kz=orcamento_executado,
            data_inicio_prevista=data_inicio,
            data_fim_prevista=data_fim,
            descricao=f"Projeto de aquicultura na província de {provincia.nome} com foco em desenvolvimento sustentável."
        )
        
        db.add(projeto)
    
    db.commit()
    print("✓ Projetos criados")


def create_eixos_5w2h(db: Session):
    """Cria eixos 5W2H para alguns projetos"""
    projetos = db.query(Projeto).limit(10).all()  # Apenas 10 projetos
    
    for projeto in projetos:
        for periodo in Periodo5W2H:
            eixo = Eixo5W2H(
                projeto_id=projeto.id,
                what=f"Implementação de sistema de aquicultura - {periodo.value} meses",
                why=f"Desenvolver produção sustentável de peixe na província de {projeto.provincia.nome}",
                where=f"Localização específica em {projeto.provincia.nome}",
                when=f"Período de {periodo.value} meses do projeto",
                who=f"Equipa técnica liderada por {projeto.responsavel}",
                how=f"Metodologia de implementação faseada com acompanhamento técnico do MINPERMAR",
                how_much_kz=projeto.orcamento_previsto_kz / 3,  # 1/3 do orçamento por período
                marcos=[
                    {"nome": "Fase 1", "data": "Mês 2", "status": "Concluído"},
                    {"nome": "Fase 2", "data": "Mês 4", "status": "Em andamento"},
                    {"nome": "Fase 3", "data": "Mês 6", "status": "Planejado"}
                ],
                periodo=periodo
            )
            db.add(eixo)
    
    db.commit()
    print("✓ Eixos 5W2H criados")


def create_indicadores(db: Session):
    """Cria indicadores para os projetos"""
    projetos = db.query(Projeto).all()
    
    indicadores_templates = [
        {"nome": "Produção de Peixe", "unidade": "toneladas", "meta": 50.0},
        {"nome": "Famílias Beneficiadas", "unidade": "famílias", "meta": 25.0},
        {"nome": "Empregos Criados", "unidade": "empregos", "meta": 10.0},
        {"nome": "Licenças Emitidas", "unidade": "licenças", "meta": 5.0},
        {"nome": "Execução Orçamental", "unidade": "%", "meta": 100.0},
    ]
    
    for projeto in projetos:
        for i, template in enumerate(indicadores_templates):
            for trimestre in Trimestre:
                valor_atual = random.uniform(0, template["meta"] * 0.8)
                
                indicador = Indicador(
                    projeto_id=projeto.id,
                    nome=template["nome"],
                    unidade=template["unidade"],
                    meta=Decimal(str(template["meta"])),
                    valor_actual=Decimal(str(round(valor_atual, 2))),
                    periodo_referencia=trimestre,
                    fonte_dados=f"Relatório trimestral {trimestre.value}"
                )
                db.add(indicador)
    
    db.commit()
    print("✓ Indicadores criados")


def create_licenciamentos(db: Session):
    """Cria licenciamentos para os projetos"""
    projetos = db.query(Projeto).all()
    
    for projeto in projetos:
        status = random.choice(list(StatusLicenciamento))
        entidade = random.choice(list(EntidadeResponsavel))
        
        data_submissao = projeto.data_inicio_prevista - timedelta(days=random.randint(30, 90))
        data_decisao = None
        
        if status in [StatusLicenciamento.APROVADO, StatusLicenciamento.NEGADO]:
            data_decisao = data_submissao + timedelta(days=random.randint(15, 45))
        
        licenciamento = Licenciamento(
            projeto_id=projeto.id,
            status=status,
            entidade_responsavel=entidade,
            data_submissao=data_submissao,
            data_decisao=data_decisao,
            observacoes=f"Processo de licenciamento para {projeto.nome}"
        )
        db.add(licenciamento)
    
    db.commit()
    print("✓ Licenciamentos criados")


def seed_database():
    """Executa todos os seeds"""
    db = SessionLocal()
    try:
        print("🌱 Iniciando seed do banco de dados...")
        
        create_provincias(db)
        create_users(db)
        create_projetos(db)
        create_eixos_5w2h(db)
        create_indicadores(db)
        create_licenciamentos(db)
        
        print("✅ Seed concluído com sucesso!")
        print("\n📋 Credenciais de acesso:")
        print(f"ROOT: {settings.admin_email} / {settings.admin_password}")
        print("Gestão de Dados: gestao@aquicultura.ao / gestao123456")
        print("Visualização: visualizacao@aquicultura.ao / visualizacao123456")
        
    except Exception as e:
        print(f"❌ Erro durante o seed: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
