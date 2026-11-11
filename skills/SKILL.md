## Estrutura de Scripts

### 1. Script de Pesquisa (`scripts/pixabay-search.js`)

Busca imagens na API Pixabay com filtros para atender aos requisitos do sistema.

**Uso:**
```bash
node scripts/pixabay-search.js "termo da busca" [--limit 10] [--paginado]
```

**Parâmetros:**
- `termo`: Termo de busca obrigatório
- `--limit`: Número de resultados (padrão: 10, máximo: 200 da API)
- `--paginado`: Habilitar paginação para resultados adicionais

**Funcionalidades:**
- Busca por termo com filtro `per_page`
- Filtros opcionais: `categories`, `min_width`, `min_height`, `safesearch`
- Tratamento de resposta da API
- Retorno estruturado com IDs, URLs e metadados

## 10. Registro e evidências

Atualize `docs/EXECUTION_LOG.md` cronologicamente, registrando:

- Arquivos criados e modificados.
- Decisões técnicas.
- Comandos executados.
- Testes realizados e respectivos resultados.
- Falhas encontradas e como foram corrigidas.
- Limitações decorrentes da ausência de credenciais ou de serviços externos.
- Commits realizados.

Não apague tentativas anteriores nem reescreva o histórico para apresentar uma execução artificialmente perfeita.
```