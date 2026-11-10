/**
 * pixabay-search.js - Script de pesquisa de imagens na API Pixabay
 * 
 * Busca imagens na API Pixabay com filtros para atender aos requisitos do sistema.
 * 
 * Uso: node scripts/pixabay-search.js "termo" [--limit N] [--paginado]
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

/**
 * Realiza busca de imagens na API Pixabay
 * @param {string} query - Termo de busca
 * @param {object} options - Opções da busca
 * @returns {Promise<object>} - Resultado da busca
 */
async function searchImages(query, options = {}) {
  const apiKey = process.env.PIXABAY_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ PIXABAY_API_KEY não configurada. Retornando resultado em modo mock.');
    return {
      total: 0,
      hits: [],
      mock: true,
      message: 'Chave API não configurada - modo mock ativo'
    };
  }

  const params = {
    key: apiKey,
    q: query,
    per_page: options.limit || 10,
    safesearch: 'true',
    min_width: 800,
    min_height: 600
  };

  try {
    const response = await axios.get('https://pixabay.com/api/', { params });
    return {
      total: response.data.total,
      hits: response.data.hits.map(hit => ({
        id: hit.id,
        title: hit.title,
        tags: hit.tags,
        previewURL: hit.previewURL,
        webformatURL: hit.webformatURL,
        largeImageURL: hit.largeImageURL,
        views: hit.views,
        downloads: hit.downloads,
        likes: hit.likes,
        category: hit.category
      })),
      mock: false
    };
  } catch (error) {
    console.error('❌ Erro ao buscar imagens da Pixabay:', error.message);
    return {
      total: 0,
      hits: [],
      mock: false,
      error: error.message
    };
  }
}

/**
 * Busca imagens e salva resultados em arquivo
 * @param {string} query - Termo de busca
 * @param {string} outputFile - Arquivo de saída (opcional)
 * @param {object} options - Opções da busca
 * @returns {Promise<object>} - Resultado da busca
 */
async function searchAndSave(query, outputFile, options = {}) {
  const result = await searchImages(query, options);
  
  if (outputFile && result.hits.length > 0) {
    const outputPath = path.resolve(__dirname, outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`✅ Resultados salvos em: ${outputPath}`);
  }
  
  return result;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const query = args[0];
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 10;
  const paginado = args.includes('--paginado');
  
  if (!query) {
    console.log('Uso: node scripts/pixabay-search.js "termo" [--limit N] [--paginado]');
    process.exit(1);
  }

  console.log(`🔍 pesquisando por: "${query}"`);
  const result = await searchAndSave(query, `search_${query.replace(/\\s+/g, '_')}.json`, { limit, paginado });
  
  console.log(`\n📊 Resultados:`);
  console.log(`   Total: ${result.total}`);
  console.log(`   Encontrados: ${result.hits.length}`);
  console.log(`   Modo mock: ${result.mock}`);
  
  if (!result.mock && result.hits.length > 0) {
    console.log(`\n🖼️ Primeiros resultados:`);
    result.hits.slice(0, 3).forEach((hit, i) => {
      console.log(`   ${i + 1}. ${hit.title} (ID: ${hit.id})`);
      console.log(`      Preview: ${hit.previewURL}`);
    });
  }
}

main().catch(err => {
  console.error('❌ Erro inesperado:', err);
  process.exit(1);
});