/**
 * pixabay-idempotencia.js - Mecanismo de idempotência
 * 
 * Verifica se uma imagem já foi baixada e processada anteriormente,
 * evitando processamento desnecessário quando o hash do arquivo coincide.
 * 
 * Uso: node scripts/pixabay-idempotencia.js [--forçar]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MANIFEST_FILE = path.resolve(__dirname, '..', 'manifest', 'pixabay-manifest.json');

require('dotenv').config();

function getManifestPath() {
  const manifestDir = path.dirname(MANIFEST_FILE);
  if (!fs.existsSync(manifestDir)) fs.mkdirSync(manifestDir, { recursive: true });
  return MANIFEST_FILE;
}

function loadManifest() {
  const manifestPath = getManifestPath();
  if (fs.existsSync(manifestPath)) {
    try { return JSON.parse(fs.readFileSync(manifestPath, 'utf-8')); } catch { }
  }
  return { imagens: [], total: 0, criado: new Date().toISOString(), atualizado: new Date().toISOString() };
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

function calculateFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function addToManifest(imagePath, options = {}) {
  const manifest = loadManifest();
  const fileHash = calculateFileHash(imagePath);
  const fileName = path.basename(imagePath);
  const entry = { id: Date.now().toString(36), filePath, fileName, fileHash, added: new Date().toISOString(), source: options.source || 'Pixabay', validationStatus: options.validationStatus || 'pending' };

  if (manifest.imagens.some(img => img.fileHash === fileHash)) {
    console.log('ℹ️ Imagem já existente no manifesto (idempotência)');
    const existing = manifest.imagens.find(img => img.fileHash === fileHash);
    if (existing) existing.lastVisited = new Date().toISOString();
    return existing;
  }

  manifest.imagens.push(entry);
  manifest.total = manifest.imagens.length;
  manifest.atualizado = new Date().toISOString();
  saveManifest(manifest);
  console.log('✅ Imagem adicionada ao manifesto');
  return entry;
}

function listManifest() {
  const manifest = loadManifest();
  console.log(`\n📋 Manifesto Pixabay (${manifest.total} imagens)`);
  manifest.imagens.forEach((img, i) => {
    console.log(` ${i + 1}. ${img.fileName} | Hash: ${img.fileHash ? img.fileHash.substring(0, 10) + '...' : 'N/A'} | Validação: ${img.validationStatus}`);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--forçar') || args.includes('-f');
  const filePath = args[args.indexOf('--arquivo') + 1] || args[0];

  if (!filePath) {
    const manifest = loadManifest();
    console.log(`📊 Status: ${manifest.total} entradas no manifest`);
    return;
  }

  if (!fs.existsSync(filePath)) { console.error(`❌ Arquivo não encontrado: ${filePath}`); process.exit(1); }

  console.log(`🔍 verificando idempotência para: ${filePath}`);
  const fileHash = calculateFileHash(filePath);
  const manifest = loadManifest();
  const existing = manifest.imagens.find(img => img.fileHash === fileHash);

  if (existing) {
    console.log(`\n🔄 Já processado anteriormente`);
    if (!force) console.log('   Use --forçar para processar novamente.');
  } else {
    console.log(`\n✅ Novo arquivo - registrando no manifest`);
    const entry = { filePath, fileHash, added: new Date().toISOString(), source: 'User' };
    manifest.imagens.push(entry);
    manifest.total = manifest.imagens.length;
    manifest.atualizado = new Date().toISOString();
    saveManifest(manifest);
    console.log('✅ Registrado no manifest');
  }
}

main();