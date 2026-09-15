import fs from 'fs';
import path from 'path';

const ROOT = '/home/alisson/projetos/laboratorio-aplicacao-java';
const DOCS_DIR = '/home/alisson/projetos/alunopresente-docs';

console.log('🔄 Sincronizando diagramas do Archify...');
const diagramsSrc = path.join(ROOT, '.agents/docs/diagrams');
const diagramsDest = path.join(DOCS_DIR, 'public/diagrams');

if (fs.existsSync(diagramsSrc)) {
  fs.mkdirSync(diagramsDest, { recursive: true });
  const files = fs.readdirSync(diagramsSrc).filter(f => f.endsWith('.html'));
  files.forEach(f => {
    fs.copyFileSync(path.join(diagramsSrc, f), path.join(diagramsDest, f));
    console.log(`  ✓ Copiado: ${f}`);
  });
}

console.log('✅ Sincronização concluída com sucesso!');
