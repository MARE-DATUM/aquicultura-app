#!/usr/bin/env python3
"""
Script para criar logs de auditoria mais realistas
"""
import sqlite3
import sys
from datetime import datetime, timedelta
import random

def create_realistic_audit_logs():
    """Cria logs de auditoria mais realistas"""
    try:
        conn = sqlite3.connect('backend/aquicultura.db')
        cursor = conn.cursor()
        
        # Limpar logs existentes
        cursor.execute("DELETE FROM audit_logs")
        
        # Obter usuários existentes
        cursor.execute("SELECT id, email, full_name FROM users")
        users = cursor.fetchall()
        
        if not users:
            print("⚠️  Não há usuários no sistema!")
            return False
        
        print(f"👥 Encontrados {len(users)} usuários")
        
        # Ações e entidades possíveis
        acoes = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'STATUS_CHANGE']
        entidades = ['Projeto', 'Indicador', 'Licenciamento', 'Eixo5W2H', 'User']
        
        # IPs de exemplo
        ips = [
            '192.168.1.100', '192.168.1.101', '192.168.1.102',
            '10.0.0.50', '10.0.0.51', '172.16.0.10'
        ]
        
        # Criar 50 logs realistas
        logs = []
        base_time = datetime.now() - timedelta(days=7)  # Última semana
        
        for i in range(50):
            # Tempo aleatório na última semana
            log_time = base_time + timedelta(
                days=random.randint(0, 7),
                hours=random.randint(8, 18),  # Horário comercial
                minutes=random.randint(0, 59)
            )
            
            # Usuário aleatório
            user = random.choice(users)
            user_id = user[0]
            user_email = user[1]
            user_name = user[2]
            
            # Ação aleatória
            acao = random.choice(acoes)
            
            # Entidade baseada na ação
            if acao in ['LOGIN', 'LOGOUT']:
                entidade = None
                entidade_id = None
                detalhes = f"Utilizador {user_name} fez {acao.lower()}"
            else:
                entidade = random.choice(entidades)
                entidade_id = random.randint(1, 20)
                detalhes = f"Utilizador {user_name} executou {acao} na entidade {entidade} (ID: {entidade_id})"
            
            # IP aleatório
            ip = random.choice(ips)
            
            # Papel baseado no email
            if 'admin' in user_email:
                papel = 'ROOT'
            elif 'gestao' in user_email:
                papel = 'GESTAO_DADOS'
            else:
                papel = 'VISUALIZACAO'
            
            logs.append((
                user_id, papel, acao, entidade, entidade_id, ip, 
                log_time.isoformat(), detalhes
            ))
        
        # Inserir logs
        cursor.executemany("""
            INSERT INTO audit_logs 
            (user_id, papel, acao, entidade, entidade_id, ip, timestamp, detalhes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, logs)
        
        conn.commit()
        print(f"✅ Criados {len(logs)} logs de auditoria realistas!")
        
        # Mostrar estatísticas
        cursor.execute("SELECT COUNT(*) FROM audit_logs")
        total = cursor.fetchone()[0]
        
        cursor.execute("SELECT acao, COUNT(*) FROM audit_logs GROUP BY acao")
        stats_acao = cursor.fetchall()
        
        cursor.execute("SELECT entidade, COUNT(*) FROM audit_logs WHERE entidade IS NOT NULL GROUP BY entidade")
        stats_entidade = cursor.fetchall()
        
        print(f"\n📊 Estatísticas:")
        print(f"Total de logs: {total}")
        print("\nPor ação:")
        for acao, count in stats_acao:
            print(f"  {acao}: {count}")
        print("\nPor entidade:")
        for entidade, count in stats_entidade:
            print(f"  {entidade}: {count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar logs: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """Função principal"""
    print("🔧 Criando logs de auditoria realistas...")
    
    if create_realistic_audit_logs():
        print("\n✅ Logs criados com sucesso!")
        print("🔄 Agora teste a página de auditoria novamente")
    else:
        print("❌ Falha ao criar logs")
        sys.exit(1)

if __name__ == "__main__":
    main()
