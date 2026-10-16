/** Build a local gallery from verified screenshots; never changes image content. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.env.FAMTREE_EVIDENCE_DIR || '/home/isaac/Downloads/FamTree_Evidencias_Bugs';
const inventory=JSON.parse(fs.readFileSync(path.join(root,'inventario.json')));
const scope=JSON.parse(fs.readFileSync(new URL('./azure-evidence-scope.json',import.meta.url)));
const results=JSON.parse(fs.readFileSync(path.join(root,'resultados.json')));
const by=new Map(results.map(row=>[String(row.id),row]));
if(results.some(row=>row.status!=='verificado'))throw new Error('Resolve failed checks before packaging evidence');
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const review=[];const cards=[];const matrix=['# Correspondencia entre bugs y evidencias','','Cada entrada identifica qué debe observarse y los límites de la evidencia. Una captura no demuestra por sí sola persistencia, permisos ni la ejecución completa de todos los criterios.','','BUG05 / AZ-776 pertenece a la selección previa a comparar: la columna Provincia está en esa pantalla. La tabla final compara servicios y no es la vista de ese bug. Se corrigió el título confuso Comparar Favoritos a Comparar residencias.',''];
fs.mkdirSync(path.join(root,'CAPTURAS'),{recursive:true});
for(const bug of inventory){
 const id=String(bug.id);if(!by.has(id))continue;
 const result=by.get(id);const meaning=scope[id];if(!meaning)throw new Error('Missing evidence mapping for '+id);
 const dir=path.join(root,'AZ-'+id);const original=path.join(dir,'solucion-verificada.png');
 const relative='CAPTURAS/AZ-'+id+'.png';fs.copyFileSync(original,path.join(root,relative));
 const extra=fs.readdirSync(dir).filter(name=>name.endsWith('.png')&&!['solucion-verificada.png','pdf-abierto.png'].includes(name));
 const extraLinks=extra.map(name=>{
  const target='CAPTURAS/AZ-'+id+'-'+name;fs.copyFileSync(path.join(dir,name),path.join(root,target));
  return {name,target};
 });
 const caseFile=path.join(dir,'caso.md');const originalCase=fs.readFileSync(caseFile,'utf8').split('## Verificación')[0];
 fs.writeFileSync(caseFile,originalCase+'## Verificación y correspondencia\n\n**Qué muestra:** '+meaning.visible+'\n\n**Límite:** '+meaning.limit+'\n\nFecha de ejecución UTC: '+result.timestamp+'\n\n[Captura principal](solucion-verificada.png)\n\n'+extra.map(name=>'[Evidencia adicional: '+name+']('+name+')').join('\n\n')+'\n\nLa captura pertenece al entorno local. No se modificaron los estados de Azure.\n');
 matrix.push('## AZ-'+id+' — '+bug.title,'','**Qué observar:** '+meaning.visible,'','**Límite:** '+meaning.limit,'','[Captura]('+relative+')',...extraLinks.map(x=>' · [Complementaria: '+x.name+']('+x.target+')'),'');
 const screenshot={id,bug:bug.title,screenshot:result.screenshot,visible:meaning.visible,limit:meaning.limit,executedAt:result.timestamp,sha256:hash(original),supplemental:extraLinks};review.push(screenshot);
 cards.push('<article data-search="'+esc((id+' '+bug.title).toLowerCase())+'"><h2>AZ-'+id+'</h2><h3>'+esc(bug.title)+'</h3><p><b>Qué observar:</b> '+esc(meaning.visible)+'</p><a target="_blank" href="'+relative+'"><img loading="lazy" src="'+relative+'" alt="'+esc(bug.title)+'"></a><p><a target="_blank" href="'+relative+'">Abrir captura original</a></p>'+extraLinks.map(x=>'<p><a target="_blank" href="'+x.target+'">'+esc(x.name)+'</a></p>').join('')+'<details><summary>Alcance de la evidencia</summary><p>'+esc(meaning.limit)+'</p></details></article>');
}
if(review.length!==58)throw new Error('Expected 58 active numbered bugs');
fs.writeFileSync(path.join(root,'CORRESPONDENCIA.md'),matrix.join('\n'));
fs.writeFileSync(path.join(root,'revision-capturas.json'),JSON.stringify(review,null,2));
fs.writeFileSync(path.join(root,'GALERIA.html'),'<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FamTree · Evidencias por bug</title><style>body{font:16px system-ui;background:#f4f6f2;color:#192e23;margin:24px}header{max-width:1000px}input{padding:12px;width:320px;max-width:90%;margin:12px 0 24px;border:1px solid #869780;border-radius:8px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(440px,1fr));gap:24px}article{background:white;border:1px solid #cad2c5;border-radius:12px;padding:18px}h2{margin:0}h3{font-size:17px}img{width:100%;height:auto;border:1px solid #ddd}a{color:#24603f}article[hidden]{display:none}details{background:#f3f4ef;padding:10px;border-radius:6px}</style><header><h1>FamTree · Evidencias por bug</h1><p>58 bugs activos. Cada captura se vincula con su descripción y criterios. Lee «Qué observar» y los límites antes de usarla como evidencia. Las secuencias tienen imágenes complementarias.</p><p>En AZ-776, busca la columna Provincia en la selección: Peravia y Puerto Plata. El título se corrigió a Comparar residencias.</p><label for="search">Buscar por ID o título</label><br><input id="search" type="search" placeholder="Ej.: 776 o Provincia"></header><main>'+cards.join('')+'</main><script>document.querySelector("#search").addEventListener("input",e=>{const query=e.target.value.toLowerCase().trim();document.querySelectorAll("article").forEach(card=>card.hidden=!card.dataset.search.includes(query))})</script></html>');
console.log('Gallery: '+review.length+' bug mappings; '+review.reduce((n,x)=>n+x.supplemental.length,0)+' supplemental screenshots.');
