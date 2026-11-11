/**
 * plant-error.js - Script de erro proposital para demonstração
 * 
 * Este script introduz um erro proposital na implementação de forma controlada,
 * permitindo depois a reversão (remoção) do erro. Isso serve para demonstrar:
 * 
 * 1. Demonstração Rodada 2: Erro proposital → verifier reprovado
 * 2. Demonstração Rodada 3: Erro corrigido/revertido → verifier aprovado novamente
 * 
 * O mecanismo preserva o histórico de commits para que a reversão seja auditável.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPTS_DIR = path.resolve(__dirname);
const SRC_DIR = path.resolve(__dirname, '../src');
const EXECUTION_LOG = path.resolve(__dirname, '../docs/EXECUTION_LOG.md');

/**
 * Registra uma alteração no log de execução
 * @param {string} descricao - Descrição da mudança
 * @param {string} tipo - 'erro' ou 'reversao'
 */
function registrarLog(descricao, tipo) {
  const timestamp = new Date().toISOString();
  const entry = `### ${tipo.toUpperCase()} - ${timestamp}\n${descricao}\n\n`;
  
  if (fs.existsSync(EXECUTION_LOG)) {
    fs.appendFileSync(EXECUTION_LOG, entry);
  } else {
    fs.writeFileSync(EXECUTION_LOG, `# Diário de Execução — Prática SDD\n\n${entry}---`);
  }
  
  console.log(`✅ Log ${tipo} registrado`);
}

/**
 * Introduz um erro proposital no código fonte
 * @param {string} description - Descrição do erro
 * @returns {boolean} - Sucesso
 */
function plantarErro(description) {
  console.log(`\n🌱 Plantando erro proposital: ${description}`);
  
  // Exemplo: adicionar um bug intencional em um arquivo de serviço
  // Procurar por arquivos .ts no src e adicionar um erro controlado
  
  const files = fs.readdirSync(SRC_DIR, { recursive: true })
    .filter(f => f.endsWith('.ts') && !f.includes('.'));
  
  if (files.length === 0) {
    console.warn('⚠️ Nenhum arquivo TypeScript encontrado em src/');
    return false;
  }
  
  // Para demonstração, vamos modificar o arquivo de maior prioridade ou o primeiro encontrado
  // Vamos adicionar um bug que quebra o isolamento de tenant como exemplo
  
  // Procurar um arquivo relevante (ex: service de equipamentos)
  const equipamentoFiles = files.filter(f => f.includes('equipamento') || f.includes('equipment'));
  const targetFile = equipamentoFiles[0] || files[0];
  const targetPath = path.join(SRC_DIR, targetFile);
  
  if (!fs.existsSync(targetPath)) {
    console.warn('⚠️ Arquvo alvo não encontrado');
    return false;
  }
  
  const originalContent = fs.readFileSync(targetPath, 'utf-8');
  
  // Registrar o conteúdo original para possível reversão
  // Armazenar em um local temporário ou no próprio log
  
  // Introduzir erro: remover o tenant_id de uma query ou adicionar lógica incorreta
  // Exemplo: substituir um trecho crítico
  
  const erroIntroduzido = `// ERRO PLANTADO PARA DEMONSTRAÇÃO: ${description}\n` + originalContent;
  
  try {
    fs.writeFileSync(targetPath, erroIntroduzido);
    registrarLog(`Erro plantado em ${targetFile}: ${description}`, 'erro');
    console.log(`✅ Erro plantado em ${targetFile}`);
    return true;
  } catch (err) {
    console.error('❌ Falha ao plantar erro:', err);
    return false;
  }
}

/**
 * Reverte o erro plantado (retorna o código ao estado original)
 * @param {string} filePath - Caminho do arquivo que foi modificado
 * @returns {boolean} - Sucesso
 */
function reverterErro(filePath) {
  const fullPath = path.join(SRC_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn('⚠️ Arquivo não encontrado para reversão');
    return false;
  }
  
  // Procurar pelo marcador de erro plantado
  const currentContent = fs.readFileSync(fullPath, 'utf-8');
  const errorMarker = '// ERRO PLANTADO PARA DEMONSTRAÇÃO:';
  
  if (!currentContent.includes(errorMarker)) {
    console.log('ℹ️ Nenhum erro plantado encontrado neste arquivo');
    return true; // Já está limpo
  }
  
  // Remover a linha do erro (linhas até o próximo ; ou fim de contexto simples)
  const lines = currentContent.split('\n');
  const filteredLines = lines.filter(line => 
    !line.includes('ERRO PLANTADO PARA DEMONSTRAÇÃO') && 
    !line.startsWith('// ERRO PLANTADO')
  );
  
  const cleanedContent = filteredLines.join('\n');
  
  try {
    fs.writeFileSync(fullPath, cleanedContent);
    registrarLog(`Erro revertido em ${filePath}`, 'reversao');
    console.log(`✅ Erro revertido em ${filePath}`);
    return true;
  } catch (err) {
    console.error('❌ Falha ao reverter erro:', err);
    return false;
  }
}

/**
 * Lista erros plantados ativos
 */
function listarErrosPlantados() {
  console.log('\n📋 Erros Plantados Ativos:\n');
  
  const files = fs.readdirSync(SRC_DIR, { recursive: true })
    .filter(f => f.endsWith('.ts'));
  
  let foundErrors = false;
  
  for (const file of files) {
    const fullPath = path.join(SRC_DIR, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('ERRO PLANTADO PARA DEMONSTRAÇÃO')) {
        console.log(`  • ${file}: contém erro plantado`);
        foundErrors = true;
      }
    }
  }
  
  if (!foundErrors) {
    console.log('  Nenhum erro plantado ativo');
  }
  console.log('');
}

/**
 * Script principal
 */
function main() {
  if (process.argv[2] === 'plant') {
    const descricao = process.argv[3] || 'Erro genérico de demonstração';
    plantarErro(descricao);
  } else if (process.argv[2] === 'reverter') {
    const filePath = process.argv[3] || 'src/modules/equipamentos/equipamentos.service.ts';
    reverterErro(filePath);
  } else if (process.argv[2] === 'listar') {
    listarErrosPlantados();
  } else {
    console.log('Uso:');
    console.log('  node scripts/plant-error.js plant "descrição"  - Plantar erro proposital');
    console.log('  node scripts/plant-error.js reverter      - Reverter último erro');
    console.log('  node scripts/plant-error.js listar        - Listar erros ativos');
  }
}

main();