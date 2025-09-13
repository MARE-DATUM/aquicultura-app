import pandas as pd
import io
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.indicador import Indicador, Trimestre
from app.models.projeto import Projeto
from app.models.provincia import Provincia
from datetime import datetime
import json


class ExportService:
    def __init__(self, db: Session):
        self.db = db

    def export_indicadores_csv(
        self, 
        projeto_id: Optional[int] = None, 
        periodo_referencia: Optional[Trimestre] = None
    ) -> str:
        """Exporta indicadores para CSV"""
        try:
            # Query indicadores com joins
            query = self.db.query(Indicador).join(Projeto).join(Provincia)
            
            if projeto_id:
                query = query.filter(Indicador.projeto_id == projeto_id)
            if periodo_referencia:
                query = query.filter(Indicador.periodo_referencia == periodo_referencia)
            
            indicadores = query.all()
            
            if not indicadores:
                return "Nenhum indicador encontrado para exportação"
            
            # Preparar dados para DataFrame
            data = []
            for indicador in indicadores:
                progresso = (indicador.valor_actual / indicador.meta * 100) if indicador.meta > 0 else 0
                
                data.append({
                    'ID': indicador.id,
                    'Nome do Indicador': indicador.nome,
                    'Projeto': indicador.projeto.nome,
                    'Província': indicador.projeto.provincia.nome,
                    'Trimestre': indicador.periodo_referencia,
                    'Meta': float(indicador.meta),
                    'Valor Atual': float(indicador.valor_actual),
                    'Unidade': indicador.unidade,
                    'Progresso (%)': round(progresso, 2),
                    'Fonte de Dados': indicador.fonte_dados,
                    'Data de Criação': indicador.created_at.strftime('%d/%m/%Y %H:%M') if indicador.created_at else '',
                    'Última Atualização': indicador.updated_at.strftime('%d/%m/%Y %H:%M') if indicador.updated_at else ''
                })
            
            # Criar DataFrame
            df = pd.DataFrame(data)
            
            # Converter para CSV
            csv_buffer = io.StringIO()
            df.to_csv(csv_buffer, index=False, encoding='utf-8-sig', sep=';')
            
            return csv_buffer.getvalue()
            
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Erro ao exportar indicadores para CSV: {str(e)}"
            )

    def export_indicadores_excel(
        self, 
        projeto_id: Optional[int] = None, 
        periodo_referencia: Optional[Trimestre] = None
    ) -> bytes:
        """Exporta indicadores para Excel"""
        try:
            # Query indicadores com joins
            query = self.db.query(Indicador).join(Projeto).join(Provincia)
            
            if projeto_id:
                query = query.filter(Indicador.projeto_id == projeto_id)
            if periodo_referencia:
                query = query.filter(Indicador.periodo_referencia == periodo_referencia)
            
            indicadores = query.all()
            
            if not indicadores:
                raise HTTPException(status_code=404, detail="Nenhum indicador encontrado para exportação")
            
            # Preparar dados para DataFrame
            data = []
            for indicador in indicadores:
                progresso = (indicador.valor_actual / indicador.meta * 100) if indicador.meta > 0 else 0
                
                data.append({
                    'ID': indicador.id,
                    'Nome do Indicador': indicador.nome,
                    'Projeto': indicador.projeto.nome,
                    'Província': indicador.projeto.provincia.nome,
                    'Trimestre': indicador.periodo_referencia,
                    'Meta': float(indicador.meta),
                    'Valor Atual': float(indicador.valor_actual),
                    'Unidade': indicador.unidade,
                    'Progresso (%)': round(progresso, 2),
                    'Fonte de Dados': indicador.fonte_dados,
                    'Data de Criação': indicador.created_at.strftime('%d/%m/%Y %H:%M') if indicador.created_at else '',
                    'Última Atualização': indicador.updated_at.strftime('%d/%m/%Y %H:%M') if indicador.updated_at else ''
                })
            
            # Criar DataFrame
            df = pd.DataFrame(data)
            
            # Criar arquivo Excel em memória
            excel_buffer = io.BytesIO()
            
            with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
                # Aba principal com dados
                df.to_excel(writer, sheet_name='Indicadores', index=False)
                
                # Aba de resumo
                self._create_summary_sheet(writer, df, indicadores)
                
                # Aba de estatísticas por província
                self._create_province_stats_sheet(writer, df)
            
            excel_buffer.seek(0)
            return excel_buffer.getvalue()
            
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Erro ao exportar indicadores para Excel: {str(e)}"
            )

    def export_indicadores_pdf(
        self, 
        projeto_id: Optional[int] = None, 
        periodo_referencia: Optional[Trimestre] = None
    ) -> bytes:
        """Exporta indicadores para PDF"""
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors
            from reportlab.lib.units import inch
            
            # Query indicadores com joins
            query = self.db.query(Indicador).join(Projeto).join(Provincia)
            
            if projeto_id:
                query = query.filter(Indicador.projeto_id == projeto_id)
            if periodo_referencia:
                query = query.filter(Indicador.periodo_referencia == periodo_referencia)
            
            indicadores = query.all()
            
            if not indicadores:
                raise HTTPException(status_code=404, detail="Nenhum indicador encontrado para exportação")
            
            # Criar PDF em memória
            pdf_buffer = io.BytesIO()
            doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
            
            # Estilos
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                spaceAfter=30,
                alignment=1  # Center
            )
            
            # Conteúdo do PDF
            story = []
            
            # Título
            title = Paragraph("Relatório de Indicadores de Aquicultura", title_style)
            story.append(title)
            story.append(Spacer(1, 20))
            
            # Informações do relatório
            info_data = [
                ['Data de Geração:', datetime.now().strftime('%d/%m/%Y %H:%M')],
                ['Total de Indicadores:', str(len(indicadores))],
                ['Período:', periodo_referencia if periodo_referencia else 'Todos'],
                ['Projeto:', 'Específico' if projeto_id else 'Todos']
            ]
            
            info_table = Table(info_data, colWidths=[2*inch, 3*inch])
            info_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (1, 0), (1, -1), colors.beige),
            ]))
            
            story.append(info_table)
            story.append(Spacer(1, 30))
            
            # Tabela de indicadores
            table_data = [['ID', 'Indicador', 'Projeto', 'Província', 'Trimestre', 'Meta', 'Atual', 'Progresso']]
            
            for indicador in indicadores:
                progresso = (indicador.valor_actual / indicador.meta * 100) if indicador.meta > 0 else 0
                
                table_data.append([
                    str(indicador.id),
                    indicador.nome[:30] + '...' if len(indicador.nome) > 30 else indicador.nome,
                    indicador.projeto.nome[:20] + '...' if len(indicador.projeto.nome) > 20 else indicador.projeto.nome,
                    indicador.projeto.provincia.nome,
                    indicador.periodo_referencia,
                    f"{float(indicador.meta):,.0f}",
                    f"{float(indicador.valor_actual):,.0f}",
                    f"{progresso:.1f}%"
                ])
            
            # Criar tabela
            indicadores_table = Table(table_data, colWidths=[0.5*inch, 1.5*inch, 1.2*inch, 1*inch, 0.8*inch, 1*inch, 1*inch, 0.8*inch])
            indicadores_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 7),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(indicadores_table)
            
            # Construir PDF
            doc.build(story)
            pdf_buffer.seek(0)
            
            return pdf_buffer.getvalue()
            
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Erro ao exportar indicadores para PDF: {str(e)}"
            )

    def _create_summary_sheet(self, writer, df: pd.DataFrame, indicadores: List[Indicador]):
        """Cria aba de resumo no Excel"""
        summary_data = {
            'Métrica': [
                'Total de Indicadores',
                'Meta Total',
                'Valor Total Atual',
                'Progresso Médio (%)',
                'Indicadores Acima da Meta',
                'Indicadores Abaixo da Meta',
                'Projetos com Indicadores',
                'Províncias Cobertas'
            ],
            'Valor': [
                len(indicadores),
                f"{df['Meta'].sum():,.0f}",
                f"{df['Valor Atual'].sum():,.0f}",
                f"{df['Progresso (%)'].mean():.1f}",
                len(df[df['Progresso (%)'] >= 100]),
                len(df[df['Progresso (%)'] < 100]),
                df['Projeto'].nunique(),
                df['Província'].nunique()
            ]
        }
        
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_excel(writer, sheet_name='Resumo', index=False)

    def _create_province_stats_sheet(self, writer, df: pd.DataFrame):
        """Cria aba de estatísticas por província"""
        province_stats = df.groupby('Província').agg({
            'ID': 'count',
            'Meta': 'sum',
            'Valor Atual': 'sum',
            'Progresso (%)': 'mean'
        }).round(2)
        
        province_stats.columns = ['Total Indicadores', 'Meta Total', 'Valor Total', 'Progresso Médio (%)']
        province_stats = province_stats.sort_values('Progresso Médio (%)', ascending=False)
        
        province_stats.to_excel(writer, sheet_name='Por Província')
