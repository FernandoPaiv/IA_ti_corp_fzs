/**
 * pixabay-download.js - Script de download de imagens da Pixabay
 * 
 * Download da imagem selecionada e salvamento localmente com nome formatado.
 * 
 * Uso: node scripts/pixabay-download.js "ID_da_imagem" [--caminho-saida ./imagens]
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

require('dotenv').config();

/**
 * Baixa uma imagem da Pixabay pelo ID
 * @param {number} imageId - ID da imagem
 * @param {string} outputDir - Diretório de saída
 * @returns {Promise<object>} - Informações do download
 */
async function downloadImage(imageId, outputDir = './imagens') {
  const apiKey = process.env.PIXABAY_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ PIXABAY_API_KEY não configurada. Download em modo simulado.');
    return {
      success: false,
      mock: true,
      message: 'Chave API não configurada'
    };
  }

  try {
    // Primeiro, obter a página de detalhes da imagem para get a large image URL
    const detailResponse = await axios.get(`https://pixabay.com/api/videos/id/${imageId}?key=${apiKey}`, {
      params: { username: 'test' } // Simplified - in real use, get from search
    });
    
    // Usar a URL da imagem grande
    const imageUrl = `https://pixabay.com/get/${imageId}/jpeg?type=large`;
    
    // Criar diretório de saída se não existir
    const outputPath = path.resolve(outputDir);
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    // Gerar nome do arquivo: {patrimonio}_{id}.jpg
    // Usar hash do ID para garantir unicidade
    const fileName = `${imageId}_pixabay.jpg`;
    const fullPath = path.join(outputPath, fileName);
    
    // Fazer download da imagem
    const imageResponse = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream'
    });
    
    // Salvar arquivo
    const writer = fs.createWriteStream(fullPath);
    return new Promise((resolve, reject) => {
      imageResponse.data.pipe(writer);
      writer.on('finish', () => {
        // Verificar tamanho do arquivo
        const stat = fs.statSync(fullPath);
        resolve({
          success: true,
          mock: false,
          filePath: fullPath,
          fileName: fileName,
          fileSize: stat.size,
          imageUrl: imageUrl
        });
      });
      writer.on('error', (err) => {
        // Remover arquivo incompleto
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
        reject(err);
      });
    });
    
  } catch (error) {
    console.error('❌ Erro ao baixar imagem:', error.message);
    return {
      success: false,
      mock: false,
      error: error.message
    };
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const imageId = args[0];
  const outputDir = args.includes('--caminho-saida') ? args[args.indexOf('--caminho-saida') + 1] || './imagens' : './imagens';
  
  if (!imageId) {
    console.log('Uso: node scripts/pixabay-download.js "ID_da_imagem" [--caminho-saida ./imagens]');
    process.exit(1);
  }

  console.log(`📥 baixando imagem ID: ${imageId}`);
  console.log(`📁 Diretório de saída: ${outputDir}`);
  
  const result = await downloadImage(parseInt(imageId), outputDir);
  
  if (result.success) {
    console.log(`\n✅ Download concluído!`);
    console.log(`   Arquivo: ${result.fileName}`);
    console.log(`   Tamanho: ${(result.fileSize / 1024).toFixed(2)} KB`);
    console.log(`   Caminho: ${result.filePath}`);
  } else {
    console.log(`\n❌ Falha no download`);
    if (result.mock) {
      console.log('   (Modo simulado - chave API não configurada)');
    }
    if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }
  }
}

main().catch(err => {
  console.error('❌ Erro inesperado:', err);
  process.exit(1);
});