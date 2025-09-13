#!/usr/bin/env python3
"""
Script simplificado para migrar dados de produção para PostgreSQL
"""

import pandas as pd
import os
from datetime import datetime
from decimal import Decimal
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Configuração da base de dados PostgreSQL
DATABASE_URL = "postgresql://aquicultura_user:aquicultura_password@db:5432/aquicultura_db"

def main():
    # Conectar ao banco
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Limpar dados anteriores
        print("🔄 Limpando dados anteriores...")
        session.execute(text("DELETE FROM indicadores"))
        session.execute(text("DELETE FROM eixos_5w2h"))
        session.execute(text("DELETE FROM licenciamentos"))
        session.execute(text("DELETE FROM projetos"))
        session.commit()
        
        # Criar um projeto por província
        print("📁 Criando projetos...")
        provincias = session.execute(text("SELECT id, nome FROM provincias")).fetchall()
        
        projeto_map = {}
        for prov_id, prov_nome in provincias:
            # Inserir projeto
            result = session.execute(text("""
                INSERT INTO projetos (nome, provincia_id, tipo, fonte_financiamento, estado, 
                                    responsavel, orcamento_previsto_kz, orcamento_executado_kz,
                                    data_inicio_prevista, data_fim_prevista, descricao)
                VALUES (:nome, :provincia_id, :tipo, :fonte, :estado, 
                        :responsavel, :orcamento_prev, :orcamento_exec,
                        :data_inicio, :data_fim, :descricao)
                RETURNING id
            """), {
                'nome': f'Projeto de Aquicultura {prov_nome}',
                'provincia_id': prov_id,
                'tipo': 'COMUNITARIO',
                'fonte': 'FADEPA',
                'estado': 'EM_EXECUCAO',
                'responsavel': f'Responsável {prov_nome}',
                'orcamento_prev': 10000000,
                'orcamento_exec': 3000000,
                'data_inicio': datetime(2024, 1, 1),
                'data_fim': datetime(2025, 12, 31),
                'descricao': f'Projeto de aquicultura na província de {prov_nome}'
            })
            projeto_id = result.fetchone()[0]
            projeto_map[prov_nome] = projeto_id
        
        session.commit()
        print(f"✓ {len(projeto_map)} projetos criados")
        
        # Ler dados de produção
        print("📊 Processando dados de produção...")
        excel_path = '/app/docs/DNA - BASE DE DADOS  2024, 2025.xls'
        
        indicadores_criados = 0
        
        for ano in ['2024', '2025']:
            try:
                df = pd.read_excel(excel_path, sheet_name=ano, header=4)
                
                # Mapear nomes de províncias
                mapa_provincias = {
                    'BENGO': 'Bengo', 'BENGUELA': 'Benguela', 'BIÉ': 'Bié',
                    'CABINDA': 'Cabinda', 'CUANDO CUBANGO': 'Cuando Cubango',
                    'CUANZA NORTE': 'Cuanza Norte', 'CUANZA SUL': 'Cuanza Sul',
                    'CUNENE': 'Cunene', 'HUAMBO': 'Huambo', 'HUÍLA': 'Huíla',
                    'LUANDA': 'Luanda', 'LUNDA NORTE': 'Lunda Norte',
                    'LUNDA SUL': 'Lunda Sul', 'MALANGE': 'Malanje',
                    'MALANJE': 'Malanje', 'MOXICO': 'Moxico', 'NAMIBE': 'Namibe',
                    'UIGE': 'Uíge', 'UÍGE': 'Uíge', 'ZAIRE': 'Zaire'
                }
                
                # Processar cada linha
                for idx, row in df.iterrows():
                    if pd.isna(row.iloc[1]):
                        continue
                        
                    provincia_excel = str(row.iloc[1]).strip().upper()
                    if provincia_excel in ['PROVÍNCIA', 'nan', '']:
                        continue
                    
                    provincia_nome = mapa_provincias.get(provincia_excel, provincia_excel)
                    
                    if provincia_nome not in projeto_map:
                        continue
                    
                    projeto_id = projeto_map[provincia_nome]
                    
                    # Extrair valores trimestrais
                    trimestres = {
                        'T1': row.iloc[5] if pd.notna(row.iloc[5]) else 0,
                        'T2': row.iloc[9] if pd.notna(row.iloc[9]) else 0,
                        'T3': row.iloc[13] if pd.notna(row.iloc[13]) else 0,
                        'T4': row.iloc[17] if pd.notna(row.iloc[17]) else 0
                    }
                    
                    # Criar indicadores
                    for trimestre, valor in trimestres.items():
                        if isinstance(valor, (int, float)) and valor > 0:
                            # Produção
                            session.execute(text("""
                                INSERT INTO indicadores (projeto_id, nome, unidade, meta, valor_actual,
                                                       periodo_referencia, fonte_dados)
                                VALUES (:projeto_id, :nome, :unidade, :meta, :valor,
                                        :periodo, :fonte)
                            """), {
                                'projeto_id': projeto_id,
                                'nome': 'Produção de Peixe',
                                'unidade': 'kg',
                                'meta': 50000,
                                'valor': float(valor),
                                'periodo': trimestre,  # Trimestre é o periodo_referencia
                                'fonte': f'Relatório {ano}'
                            })
                            
                            # Famílias beneficiadas (estimativa)
                            familias = int(valor / 1000) if valor > 0 else 0
                            session.execute(text("""
                                INSERT INTO indicadores (projeto_id, nome, unidade, meta, valor_actual,
                                                       periodo_referencia, fonte_dados)
                                VALUES (:projeto_id, :nome, :unidade, :meta, :valor,
                                        :periodo, :fonte)
                            """), {
                                'projeto_id': projeto_id,
                                'nome': 'Famílias Beneficiadas',
                                'unidade': 'famílias',
                                'meta': 100,
                                'valor': familias,
                                'periodo': trimestre,
                                'fonte': 'Estimativa'
                            })
                            
                            # Empregos (estimativa)
                            empregos = int(valor / 5000) if valor > 0 else 0
                            session.execute(text("""
                                INSERT INTO indicadores (projeto_id, nome, unidade, meta, valor_actual,
                                                       periodo_referencia, fonte_dados)
                                VALUES (:projeto_id, :nome, :unidade, :meta, :valor,
                                        :periodo, :fonte)
                            """), {
                                'projeto_id': projeto_id,
                                'nome': 'Empregos Criados',
                                'unidade': 'empregos',
                                'meta': 20,
                                'valor': empregos,
                                'periodo': trimestre,
                                'fonte': 'Estimativa'
                            })
                            
                            indicadores_criados += 3
                
            except Exception as e:
                print(f"Erro ao processar ano {ano}: {e}")
        
        session.commit()
        print(f"✓ {indicadores_criados} indicadores criados")
        
        print("\n✅ Migração concluída com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    main()
