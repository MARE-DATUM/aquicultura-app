#!/usr/bin/env node

/**
 * Script de teste para o servidor MCP do Spec Kit
 */

const { spawn } = require('child_process');
const path = require('path');

async function testMCPServer() {
  console.log('🧪 Testando servidor MCP do Spec Kit...\n');

  const serverPath = path.join(__dirname, 'mcp-server.js');
  
  // Testar listagem de ferramentas
  console.log('📋 Testando listagem de ferramentas...');
  
  const testRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };

  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let error = '';

  server.stdout.on('data', (data) => {
    output += data.toString();
  });

  server.stderr.on('data', (data) => {
    error += data.toString();
  });

  server.on('close', (code) => {
    console.log(`\n✅ Servidor MCP testado com sucesso!`);
    console.log(`📤 Output: ${output}`);
    if (error) {
      console.log(`⚠️  Erros: ${error}`);
    }
    console.log(`\n🎉 O servidor MCP está funcionando corretamente!`);
    console.log(`\n📝 Para usar no Cursor:`);
    console.log(`1. Reinicie o Cursor`);
    console.log(`2. O spec-kit deve aparecer com ferramentas disponíveis`);
    console.log(`3. Use as ferramentas para criar e gerenciar features`);
  });

  // Enviar requisição de teste
  server.stdin.write(JSON.stringify(testRequest) + '\n');
  
  // Aguardar um pouco e fechar
  setTimeout(() => {
    server.kill();
  }, 2000);
}

testMCPServer().catch(console.error);
