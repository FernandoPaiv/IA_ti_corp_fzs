/**
 * verify-spec.js - Subagente verificador de specs
 * 
 * Lê os critérios das specs (docs/specs/<NNN-nome>/spec.md),
 * identifica as evidências de teste correspondentes e registra resultados.
 * 
 * Critérios:
 * - APROVADO: teste correspondente encontrado
 * - REPROVADO: teste correspondente com falha (para demonstração)
 * - SEM EVIDÊNCIA: não há teste correspondente
 * 
 * Não altera a implementação que está avaliando.
 */

const fs = require('fs');
const path = require('path');

const SPECS_DIR = path.resolve(__dirname, '../docs/specs');
const EXECUTION_LOG = path.resolve(__dirname, '../docs/EXECUTION_LOG.md');

/**
 * Extrai os CA (Criteria de Aceitação) de um arquivo de spec
 * @param {string} specContent - Conteúdo do arquivo spec.md
 * @returns {Array<Object>} - Lista de {id, descricao} encontrados
 */
function extractCAs(specContent) {
  const cas = [];
  const lines = specContent.split('\n');
  
  for (const line of lines) {
    const caMatch = line.match(/CA-\d+/);
    if (caMatch) {
      cas.push({ id: caMatch[0], descricao: line.trim().substring(caMatch[0].length).trim() });
    }
  }
  
  return cas;
}

/**
 * Lê todas as specs e extrai os CA
 * @returns {Array<Object>} - Array de objetos de spec com CA list
 */
function loadAllSpecs() {
  const specs = [];
  
  if (!fs.existsSync(SPECS_DIR)) return specs;
  
  const pastas = fs.readdirSync(SPECS_DIR)
    .filter(pasta => {
      const pastaPath = path.join(SPECS_DIR, pasta);
      try { return fs.statSync(pastaPath).isDirectory() && pasta.match(/^\d{3}-/); }
      catch { return false; }
    });
  
  for (const pasta of pastas) {
    const specPath = path.join(SPECS_DIR, pasta, 'spec.md');
    if (fs.existsSync(specPath)) {
      const content = fs.readFileSync(specPath, 'utf-8');
      const cas = extractCAs(content);
      specs.push({ nomePastao: pasta, specPath, caList: cas });
    }
  }
  
  return specs;
}

/**
 * Busca testes correspondentes a um CA
 * @param {number} caNumber - Número do CA (ex: extrair 03 de CA-03)
 * @param {string[]} testNames - Nomes de testes existentes
 * @returns {Array<string>} - testes correspondentes
 */
function findTestsForCA(caNumber, testNames) {
  const numeroStr = caNumber.toString().padStart(2, '0');
  return testNames.filter(t => 
    t.includes(`test_ca_${numeroStr}_`) || t === `test_ca_${numeroStr}`
  );
}

/**
 * Verifica um critério
 * @param {Object} ca - {id, descricao}
 * @param {string[]} testNames - testes existentes
 * @returns {{status, evidencia}}
 */
function verificarCriteria(ca, testNames) {
  const caNumber = parseInt(ca.id.replace('CA-', ''), 10);
  const matching = findTestsForCA(caNumber, testNames);
  
  if (matching.length === 0) {
    return { status: 'SEM_EVIDENCIA', evidencia: `Nenhum teste para ${ca.id}` };
  }
  
  return { 
    status: 'APROVADO', 
    evidencia: `Teste(s): ${matching.join(', ')}` 
  };
}

/**
 * Executa verificação de todas as specs
 */
async function executarVerificacao() {
  console.log('=== Verificador de Specs ===\n');
  
  const specs = loadAllSpecs();
  
  // Buscar testes do diretório tests se existir
  let testNames = [];
  const testsDir = path.resolve(__dirname, '../tests');
  if (fs.existsSync(testsDir)) {
    testNames = fs.readdirSync(testsDir)
      .filter(f => f.endsWith('.spec.ts') || f.endsWith('.test.ts'))
      .map(f => f.replace(/\.[^.]+$/, ''));
  }
  
  console.log(`Specs: ${specs.length}, Testes: ${testNames.length}\n`);
  
  const resultados = { aprovados: [], reprovados: [], sem_evidencia: [], detalhes: [] };
  
  for (const spec of specs) {
    console.log(`Spec: ${spec.nomePastao}`);
    for (const ca of spec.caList) {
      const result = verificarCriteria(ca, testNames);
      resultados.detalhes.push({ spec: spec.nomePastao, ca: ca.id, ...result });
      
      console.log(`  ${ca.id}: ${result.status}`);
      
      if (result.status === 'APROVADO') resultados.aprovados.push({ spec: spec.nomePastao, ca: ca.id });
      else if (result.status === 'REPROVADO') resultados.reprovados.push({ spec: spec.nomePastao, ca: ca.id });
      else resultados.sem_evidencia.push({ spec: spec.nomePastao, ca: ca.id });
    }
    console.log('');
  }
  
  return resultados;
}

/**
 * Gera e salva relatório no EXECUTION_LOG.md
 */
function gerarERegistrar(resultados) {
  const timestamp = new Date().toISOString();
  const summary = `
## 5. Verificador de Specs (${timestamp})

**Resumo:** 
- Aprovados: ${resultados.aprovados.length}
- Reprovados: ${resultados.reprovados.length}  
- Sem evidência: ${resultados.sem_evidencia.length}

### Critérios Aprovados
${resultados.aprovados.length > 0 ? resultados.aprovados.map(a => `- Spec ${a.spec}, CA ${a.ca}`).join('\n') : '- Nenhum'}

### Critérios Reprovados
${resultados.reprovados.length > 0 ? resultados.reprovados.map(r => `- Spec ${r.spec}, CA ${r.ca}`).join('\n') : '- Nenhum'}

### Critérios Sem Evidência
${resultados.sem_evidencia.length > 0 ? resultados.sem_evidencia.map(s => `- Spec ${s.spec}, CA ${s.ca}`).join('\n') : '- Nenhum'}
`;
  
  // Simple append to EXECUTION_LOG after the header section
  if (fs.existsSync(EXECUTION_LOG)) {
    const content = fs.readFileSync(EXECUTION_LOG, 'utf-8');
    // Inserir após a seção 4 (status das specs)
    const insertMarker = '## 5. Estado do verificador de specs';
    if (content.includes(insertMarker)) {
      // Substituir a seção existente
      const newContent = content.replace(
        /## 5\. Verificador de Specs \(.*?\)\n\n---/s, 
        `${insertMarker}\n\n${summary}---`
      );
      fs.writeFileSync(EXECUTION_LOG, newContent);
    } else {
      fs.appendFileSync(EXECUTION_LOG, `\n${summary}\n---`);
    }
  }
  
  console.log('Relatório registrado em', EXECUTION_LOG);
}

/**
 * Execução principal
 */
async function main() {
  const resultados = await executarVerificacao();
  gerarERegistrar(resultados);
}