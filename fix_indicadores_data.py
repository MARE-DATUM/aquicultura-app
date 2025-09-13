#!/usr/bin/env python3
"""
Script para corrigir dados dos indicadores que estão com valores irrealistas
onde meta = valor_actual em todos os registos.

Este script irá:
1. Analisar os dados atuais
2. Criar valores mais realistas para valor_actual
3. Diversificar os nomes dos indicadores
4. Manter as metas mas ajustar os valores atuais para serem mais realistas
"""

import sqlite3
import random
from decimal import Decimal
import sys
import os

def connect_db():
    """Conecta à base de dados"""
    db_path = "aquicultura.db"
    if not os.path.exists(db_path):
        print(f"❌ Base de dados não encontrada: {db_path}")
        sys.exit(1)
    return sqlite3.connect(db_path)

def analyze_current_data(conn):
    """Analisa os dados atuais"""
    cursor = conn.cursor()
    
    print("📊 ANÁLISE DOS DADOS ATUAIS:")
    print("=" * 50)
    
    # Total de indicadores
    cursor.execute("SELECT COUNT(*) FROM indicadores")
    total = cursor.fetchone()[0]
    print(f"Total de indicadores: {total}")
    
    # Indicadores com meta = valor_actual
    cursor.execute("SELECT COUNT(*) FROM indicadores WHERE meta = valor_actual")
    iguais = cursor.fetchone()[0]
    print(f"Indicadores com meta = valor_actual: {iguais}")
    print(f"Percentagem problemática: {(iguais/total)*100:.1f}%")
    
    # Nomes únicos
    cursor.execute("SELECT COUNT(DISTINCT nome) FROM indicadores")
    nomes_unicos = cursor.fetchone()[0]
    print(f"Nomes únicos de indicadores: {nomes_unicos}")
    
    # Projetos com indicadores
    cursor.execute("SELECT COUNT(DISTINCT projeto_id) FROM indicadores")
    projetos = cursor.fetchone()[0]
    print(f"Projetos com indicadores: {projetos}")
    
    print()

def create_realistic_indicator_names():
    """Cria nomes realistas para indicadores de aquicultura"""
    base_names = [
        "Produção de Peixe",
        "Produção de Camarão", 
        "Famílias Beneficiadas",
        "Empregos Criados",
        "Tanques Construídos",
        "Hectares Cultivados",
        "Toneladas Produzidas",
        "Alevinos Distribuídos",
        "Técnicos Formados",
        "Cooperativas Criadas",
        "Mercados Abastecidos",
        "Renda Familiar Média"
    ]
    
    periods = ["T1", "T2", "T3", "T4"]
    years = ["2024", "2025"]
    
    names = []
    for base in base_names:
        for period in periods:
            for year in years:
                names.append(f"{base} - {period} {year}")
    
    return names

def fix_indicator_data(conn):
    """Corrige os dados dos indicadores"""
    cursor = conn.cursor()
    
    print("🔧 CORRIGINDO DADOS DOS INDICADORES:")
    print("=" * 50)
    
    # Buscar todos os indicadores
    cursor.execute("""
        SELECT id, projeto_id, nome, meta, valor_actual, periodo_referencia 
        FROM indicadores 
        ORDER BY id
    """)
    
    indicadores = cursor.fetchall()
    realistic_names = create_realistic_indicator_names()
    
    updates = []
    
    for i, (id, projeto_id, nome, meta, valor_actual, periodo) in enumerate(indicadores):
        # Novo nome mais realista
        new_name = realistic_names[i % len(realistic_names)]
        
        # Novo valor atual mais realista (entre 60% e 120% da meta)
        meta_float = float(meta)
        
        # Criar variação realista
        if meta_float > 100000:  # Valores grandes (produção)
            variation = random.uniform(0.7, 0.95)  # 70% a 95% da meta
        elif meta_float > 1000:  # Valores médios
            variation = random.uniform(0.8, 1.1)   # 80% a 110% da meta
        else:  # Valores pequenos
            variation = random.uniform(0.6, 1.2)   # 60% a 120% da meta
        
        new_valor_actual = round(meta_float * variation, 2)
        
        updates.append((new_name, new_valor_actual, id))
    
    # Executar updates em lotes
    print(f"Atualizando {len(updates)} indicadores...")
    
    cursor.executemany("""
        UPDATE indicadores 
        SET nome = ?, valor_actual = ?
        WHERE id = ?
    """, updates)
    
    conn.commit()
    print(f"✅ {len(updates)} indicadores atualizados com sucesso!")

def verify_fixes(conn):
    """Verifica se as correções foram aplicadas"""
    cursor = conn.cursor()
    
    print("\n📋 VERIFICAÇÃO PÓS-CORREÇÃO:")
    print("=" * 50)
    
    # Indicadores com meta = valor_actual
    cursor.execute("SELECT COUNT(*) FROM indicadores WHERE meta = valor_actual")
    iguais = cursor.fetchone()[0]
    print(f"Indicadores ainda com meta = valor_actual: {iguais}")
    
    # Nomes únicos
    cursor.execute("SELECT COUNT(DISTINCT nome) FROM indicadores")
    nomes_unicos = cursor.fetchone()[0]
    print(f"Nomes únicos após correção: {nomes_unicos}")
    
    # Estatísticas de execução
    cursor.execute("""
        SELECT 
            AVG((valor_actual * 100.0) / meta) as execucao_media,
            MIN((valor_actual * 100.0) / meta) as execucao_min,
            MAX((valor_actual * 100.0) / meta) as execucao_max
        FROM indicadores 
        WHERE meta > 0
    """)
    
    stats = cursor.fetchone()
    if stats:
        print(f"Execução média: {stats[0]:.1f}%")
        print(f"Execução mínima: {stats[1]:.1f}%")
        print(f"Execução máxima: {stats[2]:.1f}%")
    
    # Exemplos de indicadores corrigidos
    print("\n📝 EXEMPLOS DE INDICADORES CORRIGIDOS:")
    cursor.execute("""
        SELECT nome, meta, valor_actual, 
               ROUND((valor_actual * 100.0) / meta, 1) as execucao_pct
        FROM indicadores 
        LIMIT 10
    """)
    
    for nome, meta, valor, exec_pct in cursor.fetchall():
        print(f"• {nome}")
        print(f"  Meta: {meta:,.0f} | Atual: {valor:,.0f} | Execução: {exec_pct}%")

def main():
    """Função principal"""
    print("🐟 CORREÇÃO DE DADOS DOS INDICADORES DE AQUICULTURA")
    print("=" * 60)
    
    try:
        # Conectar à base de dados
        conn = connect_db()
        
        # Analisar dados atuais
        analyze_current_data(conn)
        
        # Confirmar correção
        response = input("Deseja proceder com a correção dos dados? (s/N): ").lower()
        if response not in ['s', 'sim', 'y', 'yes']:
            print("❌ Operação cancelada pelo utilizador.")
            return
        
        # Fazer backup
        print("\n💾 Criando backup da base de dados...")
        os.system("cp aquicultura.db aquicultura_backup_$(date +%Y%m%d_%H%M%S).db")
        
        # Corrigir dados
        fix_indicator_data(conn)
        
        # Verificar correções
        verify_fixes(conn)
        
        print("\n✅ CORREÇÃO CONCLUÍDA COM SUCESSO!")
        print("Os dados dos indicadores foram corrigidos e agora apresentam valores mais realistas.")
        print("Pode agora verificar a página http://localhost:3000/indicadores")
        
    except Exception as e:
        print(f"❌ Erro durante a correção: {e}")
        sys.exit(1)
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
