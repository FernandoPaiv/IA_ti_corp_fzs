/**
 * pixabay-manifest.js - Mecanismo de manifesto para registro de imagens
 * 
 * Registra informações das imagens processadas em arquivo JSON para rastreabilidade.
 * 
 * Uso: node scripts/pixabay-manifest.js [--lista] [--adicionar "caminho"]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MANIFEST_FILE = path.resolve(__dirname, '..', 'manifest', 'pixabay-manifest.json');

require('dotenv').config();

/**
 * Caminho do arquivo de manifesto, criando se não existir
 * @returns {string} - Caminho do arquivo de manifesto
 */
function getManifestPath() {
  const manifestDir = path.dirname(MANIFEST_FILE);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }
  return MANIFEST_FILE;
}

/**
 * Carrega o manifesto existente ou cria um novo
 * @returns {object} - Dados do manifesto
 */
function loadManifest() {
  const manifestPath = getManifestPath();
  if (fs.existsSync(manifestPath)) {
    try {
      const data = fs.readFileSync(manifestPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('⚠️ Erro ao ler manifesto, criando novo:', error.message);
    }
  }
  return { imagens: [], total: 0, criado: new Date().toISOString(), atualizado: new Date().toISOString() };
}

/**
 * Salva o manifesto no arquivo
 * @param {object} manifest - Dados do manifesto a salvar
 */
function saveManifest(manifest) {
  const manifestPath = getManifestPath();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Calcula hash SHA-256 de um arquivo
 * @param {string} filePath - Caminho do arquivo
 * @returns {string} - Hash SHA-256
 */
function calculateFileHash(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Adiciona uma imagem ao manifesto
 * @param {string} imagePath - Caminho da imagem
 * @param {object} options - Opções adicionais
 */
function addToManifest(imagePath, options = {}) {
  const manifest = loadManifest();
  const fileName = path.basename(imagePath);
  const fileHash = calculateFileHash(imagePath);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    filePath: imagePath,
    fileName: fileName,
    fileHash: fileHash,
    added: new Date().toISOString(),
    source: options.source || 'Pixabay',
    validationStatus: options.validationStatus || 'pending',
    width: options.width || 0,
    height: options.height || 0
  };

  // Verificar se já existe (por hash ou nome do arquivo)
  const exists = manifest.imagens.some(img => 
    img.fileHash === fileHash || img.fileName === fileName
  );

  if (exists) {
    console.log('ℹ️ Imagem já existente no manifesto (pulo de idempotência)');
    // Atualizar data de última visita
    const existing = manifest.imagens.find(img => img.fileHash === fileHash || img.fileName === fileName);
    if (existing) {
      existing.lastVisited = new Date().toISOString();
    }
    return existing;
  }

  manifest.imagens.push(entry);
  manifest.total = manifest.imagens.length;
  manifest.atualizado = new Date().toISOString();
  saveManifest(manifest);

  console.log('✅ Imagem adicionada ao manifesto');
  return entry;
}

/**
 * Lista todas as imagens no manifesto
 */
function listManifest() {
  const manifest = loadManifest();
  console.log(`\n📋 Manifesto Pixabay (${manifest.total} imagens)`);
  console.log(`   Criado: ${manifest.criado}`);
  console.log(`   Atualizado: ${manifest.atualizado}\n`);

  manifest.imagens.forEach((img, i) => {
    console.log(` ${i + 1}. ${img.fileName}`);
    console.log(`   - Hash: ${img.fileHash ? img.fileHash.substring(0, 16) + '...' : 'N/A'}`);
    console.log(`   - Caminho: ${img.filePath}`);
    console.log(`   - Validação: ${img.validationStatus}`);
    console.log();
  });
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const action = args[0];

  console.log('=== Pixabay Manifest Tool ===\n');

  switch (action) {
    case '--lista':
    case '-l':
      listManifest();
      break;

    case '--adicionar':
    case '-a':
      const imagePath = args[1];
      if (!imagePath) {
        console.log('Uso: node scripts/pixabay-manifest.js --adicionar "caminho_da_imagem"');
        process.exit(1);
      }
      // Verificar se arquivo existe
      if (!fs.existsSync(imagePath)) {
        console.error(`❌ Arquivo não encontrado: ${imagePath}`);
        process.exit(1);
      }
      addToManifest(imagePath);
      listManifest();
      break;

    case '--remover':
    case '-r':
      const removePath = args[1];
      if (!removePath) {
        console.log('Uso: node scripts/pixabay-manifest.js --remover "caminho_da_imagem"');
        process.exit(1);
      }
      // Lógica de remover seria implementada aqui
      console.log(`ℹ️ Remover imagem: ${removePath} (funcionalidade em desenvolvimento)`);
      break;

    default:
      console.log('Comandos disponíveis:');
      console.log('  --lista, -l         : Listar todas as imagens no manifesto');
      console.log('  --adicionar, -a     : Adicionar imagem ao manifesto');
      console.log('  --remover, -r       : Remover imagem do manifesto');
      break;
  }
}

main().catch(err => {
  console.error('❌ Erro inesperado:', err);
  process.exit(1);
});