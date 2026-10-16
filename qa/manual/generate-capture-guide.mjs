/** Generates written capture instructions only. Never opens or captures a browser. */
import fs from 'node:fs';
const audit=JSON.parse(fs.readFileSync('qa/manual/acceptance-audit.json'));
const instructions=JSON.parse(fs.readFileSync('qa/manual/capture-instructions.json'));
const ordered=[...audit].sort((a,b)=>Number(a.title.match(/BUG(\d+)/)?.[1])-Number(b.title.match(/BUG(\d+)/)?.[1]));
const statuses={implementado_revisado_en_codigo:'Implementación revisada en código',verificado_en_prueba:'Verificado en prueba específica',pendiente_prueba_manual_windows11:'Pendiente de probar en Chrome sobre Windows 11'};
const guide=['# FamTree — Guía de capturas según los criterios de aceptación','','Esta guía sustituye las instrucciones y capturas anteriores. Los criterios del CSV tienen prioridad sobre las decisiones previas del chat. El aviso de favoritos vuelve a ser un modal de la aplicación; el registro confirma la cuenta y abre Iniciar sesión.','','## Antes de empezar','','- Aplicación local: http://localhost:3000.','- Usa una ventana privada para los casos de visitante. Para cambiar de rol, cierra sesión y entra con la cuenta correspondiente.','- Panel de sistema: `/system-admin`. Panel de asilo: `/center-admin/asylum`.','- Para BUG29–32 necesitas una cuenta de administrador de asilo que aún tenga cambio de clave temporal pendiente. Un administrador del sistema puede crearla en Usuarios y obtener la clave temporal.','- No captures contraseñas reales; para demostrar contraste usa texto ficticio y evita enviarlo como si fuera una clave válida.','- No existe una captura universal por bug. Algunos criterios requieren dos momentos, dos vistas del mismo centro o una comprobación técnica.','- Los estados de Azure no se modificaron. BUG25 / AZ-796 y BUG36 / AZ-807 permanecen excluidos porque figuran como Removed. AZ-155 no tiene criterios verificables ni identifica la pantalla.','','## Qué está comprobado','','Se revisaron 222 criterios de 58 bugs activos. La matriz separada distingue revisión de implementación de prueba específica; no se declara que una captura pruebe permisos, persistencia o todas las variantes. La prueba literal de Chrome sobre Windows 11 (AZ-800, CA4) queda pendiente en ese entorno. Las pruebas de este equipo se ejecutaron con Chromium en Ubuntu.',''];
const matrix=['# FamTree — Revisión individual de criterios de aceptación','','Fuente: exportaciones data.csv y tasks.csv; son idénticas. 58 bugs activos, 222 criterios. Se conservan los textos originales.','','Los estados no son equivalentes: una revisión en código no se etiqueta como prueba ejecutada. Los escenarios de navegador son comprobaciones focalizadas; el estado del bug en Azure solo debe actualizarse después de la aceptación del equipo.','','Validaciones: 88 pruebas de backend; 61 de frontend; TypeScript y ESLint; 58 escenarios principales y 14 de casos límite sin capturas. Véanse los registros locales en backend/.runtime/acceptance-*.log.','','Los criterios anteriores de redirección automática a login para favoritos y acceso automático tras registro quedan sustituidos por el flujo descrito en los criterios actuales.',''];
for(const bug of ordered){
 const item=instructions[bug.azureId];if(!item)throw new Error('Faltan instrucciones '+bug.azureId);
 guide.push('## AZ-'+bug.azureId+' — '+bug.title,'','**Rol:** '+item.role+'  ','**Pantalla:** `'+item.route+'`','','**Pasos:** '+item.steps,'','**Captura:** '+item.capture,'','**Comprobación adicional:** '+item.check,'');
 matrix.push('## AZ-'+bug.azureId+' — '+bug.title,'','Implementación: '+bug.implementationFiles.map(file=>'`'+file+'`').join(', '),'');
 for(const criterion of bug.criteria){
  matrix.push('### '+criterion.id,'',criterion.text,'','**Estado:** '+statuses[criterion.status]+'.');
  if(criterion.evidence?.test)matrix.push('**Prueba:** '+criterion.evidence.test+'.');
  if(criterion.evidence?.detail)matrix.push('**Límite:** '+criterion.evidence.detail);
  matrix.push('');
 }
}
fs.mkdirSync('qa/manual/reports',{recursive:true});
fs.writeFileSync('qa/manual/reports/capture-guide.md',guide.join('\n'));
fs.writeFileSync('qa/manual/reports/acceptance-criteria-review.md',matrix.join('\n'));
fs.copyFileSync('qa/manual/reports/capture-guide.md','/home/isaac/Downloads/FamTree_Guia_Capturas_Criterios.md');
fs.copyFileSync('qa/manual/reports/acceptance-criteria-review.md','/home/isaac/Downloads/FamTree_Revision_Criterios_Aceptacion.md');
console.log('Guía: '+ordered.length+' bugs. Matriz: '+audit.reduce((sum,row)=>sum+row.criteria.length,0)+' criterios. Sin generar imágenes.');
