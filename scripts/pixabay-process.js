/**
 * pixabay-process.js - Script de processamento e padronização de imagens
 * 
 * Processa a imagem para dimensões exatas 800×600 pixels usando Sharp.
 * 
 * Uso: node scripts/pixabay-process.js "caminho_da_imagem" [--largura 800] [--altura 600]
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

require('dotenv').config();

/**
 * Processa uma imagem para dimensões 800×600
 * @param {string} inputPath - Caminho da imagem de entrada
 * @param {object} options - Opções de processamento
 * @returns {Promise<object>} - Resultado do processamento
 */
async function processImage(inputPath, options = {}) {
  const width = options.largura || 800;
  const height = options.altura || 600;
  const outputSuffix = `_${width}x${height}`;

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Arquivo não encontrado: ${inputPath}`);
    return { success: false, error: 'Arquivo de entrada não existe' };
  }

  const outputPath = `${inputPath.replace(/\.[^.]+$/, '')}${outputSuffix}${path.extname(inputPath)}`;

  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: false
      })
      .toFormat('jpeg', { quality: 85 })
      .toFile(outputPath);

    const stat = fs.statSync(outputPath);
    
    return {
      success: true,
      outputPath: outputPath,
      outputFileName: path.basename(outputPath),
      width: stat.size ? width : null,
      height: stat.size ? height : null,
      fileSize: stat.size,
      format: 'jpeg'
    };
  } catch (error) {
    console.error('❌ Erro ao processar imagem:', error.message);
    // Cleanup: remover arquivo parcialmente criado se existir
    if (fs.existsSync(outputPath)) {
      try { fs.unlinkSync(outputPath); } catch (e) {}
    }
    return { success: false, error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const inputPath = args[0];
  const width = args.includes('--largura') ? parseInt(args[args.indexOf('--largura') + 1]) : 800;
  const height = args.includes('--altura') ? parseInt(args[args.indexOf('--altura') + 1]) : 600;

  if (!inputPath) {
    console.log('Uso: node scripts/pixabay-process.js "caminho_da_imagem" [--largura 800] [--altura 600]');
    process.exit(1);
  }

  console.log(`🔧 processando imagem: ${inputPath}`);
  console.log(`   Dimensões: ${width}×${height}`);

  const result = await processImage(inputPath, { largura: width, altura: height });

  if (result.success) {
    console.log(`\n✅ Processamento concluído!`);
    console.log(`   Arquivo: ${result.outputFileName}`);
    console.log(`   Dimensões: ${result.width}×${result.height}`);
    console.log(`   Tamanho: ${(result.fileSize / 1024).toFixed(2)} KB`);
  } else {
    console.log(`\n❌ Falha no processamento`);
    if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }
  }
}

main().catch(err => {
  console.error('❌ Erro inesperado:', err);
  process.exit(1);
});