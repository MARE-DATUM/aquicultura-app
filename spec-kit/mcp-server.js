#!/usr/bin/env node

/**
 * Spec Kit MCP Server
 * Servidor MCP para integração do Spec Kit com Cursor
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class SpecKitMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'spec-kit-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Listar ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_feature',
            description: 'Criar uma nova feature usando Spec-Driven Development',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Nome da feature a ser criada',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'setup_plan',
            description: 'Configurar plano de implementação baseado em especificação',
            inputSchema: {
              type: 'object',
              properties: {
                spec_path: {
                  type: 'string',
                  description: 'Caminho para o arquivo de especificação',
                },
              },
              required: ['spec_path'],
            },
          },
          {
            name: 'list_features',
            description: 'Listar todas as features existentes',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_feature_info',
            description: 'Obter informações sobre uma feature específica',
            inputSchema: {
              type: 'object',
              properties: {
                feature_name: {
                  type: 'string',
                  description: 'Nome da feature',
                },
              },
              required: ['feature_name'],
            },
          },
          {
            name: 'check_integration',
            description: 'Verificar integridade da integração do Spec Kit',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Executar ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_feature':
            return await this.createFeature(args.name);

          case 'setup_plan':
            return await this.setupPlan(args.spec_path);

          case 'list_features':
            return await this.listFeatures();

          case 'get_feature_info':
            return await this.getFeatureInfo(args.feature_name);

          case 'check_integration':
            return await this.checkIntegration();

          default:
            throw new Error(`Ferramenta desconhecida: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Erro ao executar ${name}: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async createFeature(featureName) {
    const scriptPath = path.join(__dirname, 'scripts', 'create-new-feature.sh');
    
    try {
      const { stdout, stderr } = await execAsync(`"${scriptPath}" "${featureName}"`);
      
      return {
        content: [
          {
            type: 'text',
            text: `Feature "${featureName}" criada com sucesso!\n\n${stdout}${stderr ? `\nAvisos:\n${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Erro ao criar feature: ${error.message}`);
    }
  }

  async setupPlan(specPath) {
    const scriptPath = path.join(__dirname, 'scripts', 'setup-plan.sh');
    
    try {
      const { stdout, stderr } = await execAsync(`"${scriptPath}" "${specPath}"`);
      
      return {
        content: [
          {
            type: 'text',
            text: `Plano configurado com sucesso!\n\n${stdout}${stderr ? `\nAvisos:\n${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Erro ao configurar plano: ${error.message}`);
    }
  }

  async listFeatures() {
    const specsDir = path.join(__dirname, 'specs');
    
    try {
      if (!fs.existsSync(specsDir)) {
        return {
          content: [
            {
              type: 'text',
              text: 'Nenhuma feature encontrada. Use create_feature para criar uma nova feature.',
            },
          ],
        };
      }

      const features = fs.readdirSync(specsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
          const featurePath = path.join(specsDir, dirent.name);
          const specFile = path.join(featurePath, 'spec.md');
          
          let info = {
            name: dirent.name,
            path: featurePath,
            hasSpec: fs.existsSync(specFile),
          };

          // Tentar extrair nome da feature do arquivo spec.md
          if (info.hasSpec) {
            try {
              const specContent = fs.readFileSync(specFile, 'utf8');
              const titleMatch = specContent.match(/^# (.+) - Especificação Funcional/);
              if (titleMatch) {
                info.displayName = titleMatch[1];
              }
            } catch (e) {
              // Ignorar erros de leitura
            }
          }

          return info;
        });

      const featureList = features.map(feature => 
        `- **${feature.displayName || feature.name}**\n  - Diretório: \`${feature.path}\`\n  - Especificação: ${feature.hasSpec ? '✅' : '❌'}`
      ).join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `## Features Existentes (${features.length})\n\n${featureList || 'Nenhuma feature encontrada.'}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Erro ao listar features: ${error.message}`);
    }
  }

  async getFeatureInfo(featureName) {
    const specsDir = path.join(__dirname, 'specs');
    const featureDir = path.join(specsDir, featureName);
    
    try {
      if (!fs.existsSync(featureDir)) {
        throw new Error(`Feature "${featureName}" não encontrada`);
      }

      const files = fs.readdirSync(featureDir);
      const fileInfo = files.map(file => {
        const filePath = path.join(featureDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          type: stats.isDirectory() ? 'directory' : 'file',
        };
      });

      const fileList = fileInfo.map(file => 
        `- **${file.name}** (${file.type}, ${file.size} bytes, modificado em ${new Date(file.modified).toLocaleString()})`
      ).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `## Informações da Feature: ${featureName}\n\n**Diretório:** \`${featureDir}\`\n\n**Arquivos:**\n${fileList}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Erro ao obter informações da feature: ${error.message}`);
    }
  }

  async checkIntegration() {
    const scriptPath = path.join(__dirname, 'scripts', 'check-integration.sh');
    
    try {
      const { stdout, stderr } = await execAsync(`"${scriptPath}"`);
      
      return {
        content: [
          {
            type: 'text',
            text: `## Verificação de Integridade do Spec Kit\n\n${stdout}${stderr ? `\n**Avisos:**\n${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Erro ao verificar integração: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Spec Kit MCP Server rodando...');
  }
}

// Executar servidor
if (require.main === module) {
  const server = new SpecKitMCPServer();
  server.run().catch(console.error);
}

module.exports = SpecKitMCPServer;
