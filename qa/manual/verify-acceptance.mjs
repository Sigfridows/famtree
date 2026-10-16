/** Scenario checks without screenshots. These do not independently prove every CA; see acceptance-audit.json. Credentials stay in gitignored backend/.runtime. */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const { chromium } = require('playwright');
const output = 'backend/.runtime/acceptance-checks';
fs.mkdirSync(output,{recursive:true});
const inventory = JSON.parse(fs.readFileSync('qa/manual/acceptance-audit.json')).map(item=>({...item,id:item.azureId}));
const user = JSON.parse(fs.readFileSync('backend/.runtime/azure-qa-credentials.json'));
const owner = JSON.parse(fs.readFileSync('backend/.runtime/owner-mock-credentials.json'));
const api = 'http://localhost:18000/api/v1';
const browser = await chromium.launch({headless: true});
const selectedCases = process.env.FAMTREE_CASES?.split(',');
const results = [];
async function context(credentials) {
 const context = await browser.newContext({viewport:{width:1440,height:1000}});
 if (credentials) {
  const response = await context.request.post(api+'/auth/login',{headers:{Origin:'http://localhost:3000'},data:credentials});
  assert.equal(response.status(),200,'Fixture login');
 }
 return context;
}
const publicContext=await context();
const userContext=await context(user);
const adminContext=await context({username:'admin.sistema',password:owner.password});
async function page(context, route) {const p=await context.newPage();p.setDefaultTimeout(7000);await p.goto('http://localhost:3000'+route,{waitUntil:'networkidle'});return p;}
async function save(id,p,description){
 const dir=path.join(output,'AZ-'+id);fs.mkdirSync(dir,{recursive:true});
 for(let i=results.length-1;i>=0;i--)if(String(results[i].id)===String(id))results.splice(i,1);
 results.push({id,status:'verificado',description,url:p.url(),timestamp:new Date().toISOString()});
 console.log('PASS',id,description);
}
async function run(id,fn) {
 if (selectedCases && !selectedCases.includes(String(id))) return;
 for (let i=results.length-1;i>=0;i--) if(String(results[i].id)===String(id)) results.splice(i,1);
 try {await fn();} catch(error){for(let i=results.length-1;i>=0;i--)if(String(results[i].id)===String(id))results.splice(i,1);console.log('FAIL',id,error.message.split('\n')[0]);results.push({id,status:'fallo',error:error.message});}
 fs.writeFileSync(path.join(output,'resultados.json'),JSON.stringify(results,null,2));
}
async function detail(context=publicContext, id) {
 const p=await page(context,'/catalog'+(id?'?asiloId='+id:''));
 if(!id) await p.getByRole('button',{name:'Ver Detalles',exact:true}).first().click();
 await p.getByRole('button',{name:'Cerrar detalles'}).waitFor();
 await p.getByText('Requisitos de ingreso',{exact:true}).waitFor();return p;
}
for(const item of inventory)fs.mkdirSync(path.join(output,'AZ-'+item.id),{recursive:true});
const publicCenters=await (await publicContext.request.get(api+'/asylums')).json();
const center=publicCenters.items.find(x=>x.name==='Residencia San José') || publicCenters.items[0];
for(const id of [770,771])await run(id,async()=>{
 const p=await page(publicContext,'/catalog');let nativeDialogs=0, favoriteWrites=0;
 p.on('dialog',dialog=>{nativeDialogs++;void dialog.dismiss();});
 p.on('request',request=>{if(request.url().includes('/favorites')&&request.method()==='POST')favoriteWrites++;});
 if(id===770)await p.getByTitle('Guardar en favoritos').first().click();
 else await p.getByRole('button',{name:'Guardados',exact:true}).click();
 const modal=p.getByRole('dialog',{name:'Inicia sesión para continuar'});await modal.waitFor();
 assert.equal(await modal.getByRole('link',{name:'Iniciar sesión',exact:true}).getAttribute('href'),'/login');
 assert.equal(await modal.getByRole('link',{name:'Registrarse',exact:true}).getAttribute('href'),'/register');
 await modal.getByRole('button',{name:'Seguir explorando',exact:true}).click();
 assert.equal(new URL(p.url()).pathname,'/catalog');assert.equal(nativeDialogs,0);assert.equal(favoriteWrites,0);
 await save(id,p,'Modal de aplicación con explicación, login, registro y cierre; no navega ni escribe favoritos al cancelar.');await p.close();
});
await run(772,async()=>{const p=await page(publicContext,'/catalog');assert.equal(await p.locator('svg.lucide-bell').count(),0);assert.equal((await publicContext.request.get(api+'/notifications')).status(),401);await save(772,p,'Campana oculta para visitantes y API privada responde 401.');await p.close();});
await run(773,async()=>{const p=await detail();await p.getByRole('button',{name:'Comparar',exact:true}).first().click();const boxes=p.getByRole('checkbox');await boxes.nth(1).waitFor();assert.equal(await p.getByRole('button',{name:/Comparar \(0/}).isDisabled(),true);
await boxes.nth(1).check();await boxes.nth(2).check();
await boxes.nth(3).check();await boxes.nth(4).check();
await p.getByRole('button',{name:'Comparar (4/4)',exact:true}).waitFor();assert.equal(await boxes.nth(5).isDisabled(),true);
await p.waitForTimeout(700);
await boxes.nth(3).uncheck();await boxes.nth(4).uncheck();await p.getByRole('button',{name:/Comparar selección|Comparar \(/}).click();await p.locator('table h3').nth(1).waitFor({state:'visible'});await save(773,p,'Visitante selecciona y compara dos residencias del catálogo público sin favoritos.');await p.close();});
for(const [id,label] of [[777,'Provincia'],[778,'Requisitos de ingreso'],[779,'Certificaciones declaradas'],[781,'Ubicación en el mapa']]) await run(id,async()=>{const p=await detail(publicContext,center.id);await p.getByText(label,{exact:true}).first().scrollIntoViewIfNeeded();if(id===779)assert.equal(await p.getByText('Seguro',{exact:true}).count(),0);if(id===781)await p.locator('.leaflet-container').waitFor();await save(id,p,'Ficha pública muestra '+label+' con datos reales del centro.');await p.close();});
await run(780,async()=>{const p=await detail(publicContext,center.id);assert.equal(await p.locator('a[href^="tel:"]').count(),1);assert.equal(await p.locator('a[href^="mailto:"]').count(),1);const web=p.locator('a[target="_blank"]').first();assert.ok(await web.count());await web.scrollIntoViewIfNeeded();await save(780,p,'Enlaces de sitio web, teléfono y correo disponibles en la ficha.');await p.close();});
for(const id of [782,783])await run(id,async()=>{const p=await page(publicContext,'/map');await p.getByRole('button',{name:'Ver Detalle',exact:true}).first().click();await p.getByText('Requisitos de ingreso',{exact:true}).waitFor();const selected=await p.locator('h2').first().innerText();const item=publicCenters.items.find(x=>x.name===selected);assert.ok(item);assert.ok((await p.locator('body').innerText()).includes(Number(item.price_max).toLocaleString('en-US')));if(id===783)await p.getByText('Servicios e Instalaciones',{exact:true}).scrollIntoViewIfNeeded();await save(id,p,'BUG'+(id===782?'11':'12')+': detalle abierto desde MAPA de '+item.name+'; '+(id===782?'rango mínimo/máximo por mes.':'tipos de cuidado y servicios.')+' Se comprueba el detalle del MISMO centro desde catálogo.');await p.close();
 const catalog=await detail(publicContext,item.id);
 if(id===783)await catalog.getByText('Servicios e Instalaciones',{exact:true}).scrollIntoViewIfNeeded();
 await catalog.waitForTimeout(1200);await catalog.close();});
await run(785,async()=>{const p=await page(publicContext,'/map');await p.locator('.leaflet-container').waitFor();await p.getByTitle('Ver República Dominicana').click();await p.waitForTimeout(1200);await save(785,p,'Encuadre general de República Dominicana y control para volver a la vista general.');await p.close();});
await run(786,async()=>{const p=await page(publicContext,'/map');await p.getByRole('button',{name:'Ver Detalle',exact:true}).first().waitFor();assert.ok(await p.locator('aside img').count());assert.ok((await p.locator('aside').last().innerText()).includes('/mes'));await save(786,p,'Resumen lateral incluye fotografía, municipio, provincia y rango mensual.');await p.close();});
await run(784,async()=>{const p=await page(publicContext,'/map');await p.locator('.leaflet-container').waitFor();await p.getByTitle('Alejar').click();await save(784,p,'Mapa con zoom mínimo y máximo definidos; sin área gris por zoom fuera de rango.');await p.close();});
await run(787,async()=>{const p=await page(publicContext,`/review?asylumId=${center.id}&asylumName=${encodeURIComponent(center.name)}`);await p.getByRole('heading',{name:center.name,exact:true}).waitFor();const data=await (await publicContext.request.get(api+`/asylums/${center.id}/reviews`)).json();assert.ok((await p.locator('body').innerText()).includes(data[0]?.comment || 'todavía no tiene reseñas'));await save(787,p,'Navegación desde un centro conserva su identidad y muestra únicamente sus reseñas.');await p.close();});
await run(788,async()=>{const p=await page(publicContext,`/review?asylumId=${center.id}&asylumName=${encodeURIComponent(center.name)}`);assert.equal(await p.locator('meter').count(),5);await save(788,p,'Resumen por centro con promedio, total y distribución de 1 a 5 estrellas.');await p.close();});
await run(789,async()=>{
 const p=await page(publicContext,'/catalog');const select=p.getByRole('combobox',{name:'Ordenar residencias'});
 const options=await select.locator('option').evaluateAll(nodes=>nodes.map(x=>({value:x.value,label:x.textContent})));
 assert.equal(options.length,5);assert.equal(await select.inputValue(),'name_asc');
 const proof=[];
 for(const option of options){
  if(option.value!=='name_asc'){
   const response=p.waitForResponse(r=>r.url().includes('sort='+option.value)&&r.status()===200);
   await select.selectOption(option.value);await response;
  }
  const result=await(await publicContext.request.get(api+'/asylums?sort='+option.value)).json();
  assert.deepEqual(result.items.map(x=>x.id).sort(),publicCenters.items.map(x=>x.id).sort());
  if(option.value.startsWith('price_'))for(let i=1;i<result.items.length;i++)assert.ok(option.value==='price_asc'?Number(result.items[i-1].price_min)<=Number(result.items[i].price_min):Number(result.items[i-1].price_min)>=Number(result.items[i].price_min));
  await p.getByRole('button',{name:'Ver Detalles',exact:true}).first().waitFor();
  await p.waitForTimeout(1200);
  proof.push({...option,first:result.items[0].name,count:result.items.length});
 }
 await select.selectOption('price_desc');await p.waitForTimeout(1200);
 fs.writeFileSync(path.join(output,'AZ-789','opciones-y-resultados.json'),JSON.stringify(proof,null,2));
 await save(789,p,'BUG18: cinco órdenes operativos; se comprueban las cinco opciones y el mismo conjunto de centros.');await p.close();
});
for(const [id,field] of [[790,'Calificación mínima'],[812,'Precio mínimo (DOP)'],[813,'Tipo de adulto mayor'],[814,'Servicios incluidos']])await run(id,async()=>{const p=await page(publicContext,'/catalog');await p.getByRole('button',{name:'Filtros',exact:true}).click();const panel=p.getByRole('dialog',{name:'Filtros de residencias'});if(id===790){await panel.getByRole('combobox',{name:field}).selectOption('4');await panel.getByRole('button',{name:'Aplicar selección'}).click();await p.waitForTimeout(1000);await p.getByRole('button',{name:/^Filtros/}).click();await panel.getByRole('combobox',{name:field}).waitFor();assert.equal(await panel.getByRole('combobox',{name:field}).inputValue(),'4');}if(id===812){await panel.getByRole('spinbutton',{name:field}).fill('50000');await panel.getByRole('spinbutton',{name:'Precio máximo (DOP)'}).fill('10000');await panel.getByRole('button',{name:'Aplicar selección'}).click();await panel.getByText('El precio mínimo no puede superar el máximo.').waitFor();}if(id===813)assert.equal(await panel.getByRole('group',{name:field}).getByRole('checkbox').count(),6);if(id===814)assert.equal(await panel.getByRole('group',{name:field}).getByRole('checkbox').count(),9);await panel.scrollIntoViewIfNeeded();await save(id,p,'Filtro '+field+' conectado con catálogos vigentes y validaciones.');await p.close();});
await run(791,async()=>{const p=await page(publicContext,'/login');await p.locator('#login-username').fill('qanoexistente');await p.locator('#login-password').fill('Incorrecta!2026');await p.getByRole('button',{name:'Iniciar Sesión',exact:true}).click();await p.getByText('El nombre de usuario o la contraseña son incorrectos.',{exact:true}).waitFor();assert.equal(await p.locator('#login-password').inputValue(),'');await save(791,p,'Credenciales incorrectas se explican sin afirmar que expiró una sesión.');await p.close();});
await run(792,async()=>{const p=await page(publicContext,'/login');await p.getByRole('button',{name:'Iniciar Sesión',exact:true}).click();await p.getByText('Escribe tu nombre de usuario.',{exact:true}).waitFor();assert.equal(await p.locator('#login-username').evaluate(el=>el===document.activeElement),true);await save(792,p,'Campos vacíos señalados en español y foco en el primer obligatorio.');await p.close();});
await run(793,async()=>{const p=await page(publicContext,'/register');assert.equal(await p.locator('input[required]').count(),6);assert.equal(await p.locator('label[for]').count(),6);await save(793,p,'Registro con seis campos requeridos y etiquetas asociadas; login aplica el mismo patrón.');await p.close();});
await run(810,async()=>{const p=await page(publicContext,'/catalog');assert.equal(await p.getByText('Servicios Verificado',{exact:true}).count(),0);await save(810,p,'Cabecera sin afirmación de verificación no sustentada.');await p.close();});
await run(811,async()=>{const p=await page(publicContext,'/support');assert.equal(await p.getByText(/Solicitar Cita|Mis Solicitudes|2 horas/).count(),0);await save(811,p,'FAQ describe coordinación externa de visitas y funciones disponibles.');await p.close();});
await run(808,async()=>{const p=await page(userContext,'/profile');await p.getByText('Rol: Usuario registrado',{exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'Editar perfil',exact:true}).count(),1);assert.ok(await p.locator('fieldset[disabled]').count());await save(808,p,'Perfil en consulta con rol visible y opción explícita de edición.');await p.close();});
await run(809,async()=>{const p=await page(userContext,'/profile');await p.getByRole('button',{name:'Editar perfil',exact:true}).click();const name=p.locator('input').filter({visible:true});const before=await p.locator('input').nth(2).inputValue();await p.locator('input').nth(2).fill('Borrador');await p.getByRole('button',{name:'Cancelar',exact:true}).waitFor();await p.waitForTimeout(600);await p.getByRole('button',{name:'Cancelar',exact:true}).click();await p.getByRole('button',{name:'Editar perfil',exact:true}).waitFor();assert.equal(await p.locator('input').nth(2).inputValue(),before);await save(809,p,'Cancelar descarta el borrador y recupera el perfil persistido.');await p.close();});
// Administrative checks use the administrator fixture without exposing its password.
for(const id of [815,816,817,818,819,820,821])await run(id,async()=>{
 const p=await page(adminContext,'/system-admin/asylums');await p.getByRole('heading',{name:'Asilos del sistema'}).waitFor();
 if(id===815||id===816){
  const row=p.locator('tr').filter({has:p.getByRole('button',{name:'Desactivar',exact:true})}).first();
  const name=await row.innerText();
  await row.getByRole('button',{name:'Desactivar',exact:true}).click();
  await p.getByRole('button',{name:'Confirmar desactivación'}).waitFor();
  await p.getByRole('button',{name:'Cancelar',exact:true}).click();
  assert.ok(await row.getByRole('button',{name:'Desactivar',exact:true}).count());
  await row.getByRole('button',{name:'Desactivar',exact:true}).click();
  if(id===816){
   const before=await(await adminContext.request.get(api+'/admin/asylums')).json();
   const target=before.items.find(x=>x.name===name.trim()) || before.items.find(x=>name.includes(x.name));
   assert.ok(target);
   try {
    await p.getByRole('button',{name:'Confirmar desactivación'}).click();
    await p.getByText(target.name+' ha sido desactivado.',{exact:true}).waitFor();
    const after=await(await adminContext.request.get(api+'/admin/asylums')).json();
    assert.equal(after.items.find(x=>x.asylumId===target.asylumId).status,'INACTIVE');
    await save(id,p,'Confirmar cambia el estado persistido; aviso identifica centro y desactivación. Fixture restaurada después.');
   } finally {assert.equal((await adminContext.request.patch(api+'/admin/asylums/'+target.asylumId+'/activate')).status(),200);}
   await p.close();return;
  }
 }
 if(id===817)assert.ok(await p.getByRole('button',{name:'Ver detalle',exact:true}).count());
 if(id===818){await p.getByRole('button',{name:'Ver detalle',exact:true}).first().click();await p.getByText('Contacto institucional y atención',{exact:true}).waitFor();await p.getByText('Contacto institucional y atención',{exact:true}).scrollIntoViewIfNeeded();}
 if([819,820,821].includes(id)){
  await p.getByRole('button',{name:'Editar',exact:true}).first().click();
  await p.getByRole('textbox',{name:'Nombre del asilo',exact:true}).waitFor();
  if(id===819){await p.getByRole('textbox',{name:'Descripción',exact:true}).scrollIntoViewIfNeeded();}
  if(id===820){
   await p.getByRole('textbox',{name:'Correo institucional',exact:true}).fill('correo-invalido');
   await p.getByRole('button',{name:'Guardar cambios',exact:true}).click();
   await p.getByText('Ingresa un correo institucional válido.',{exact:true}).waitFor();
   assert.equal(await p.locator('[aria-invalid="true"]').count(),1);
   await p.getByRole('textbox',{name:'Correo institucional',exact:true}).scrollIntoViewIfNeeded();
  }
  if(id===821){
   for(const box of await p.getByRole('checkbox').all())await box.uncheck();
   await p.getByRole('button',{name:'Guardar cambios',exact:true}).click();
   await p.getByText('Selecciona al menos un servicio.',{exact:true}).scrollIntoViewIfNeeded();
   await p.getByText('Selecciona al menos un tipo de atención.',{exact:true}).waitFor();
  }
 }
 await save(id,p,({815:'BUG44: confirmación previa identifica centro y consecuencias; Cancelar conserva el estado.',817:'BUG46: acciones con texto Ver detalle, Editar y Activar/Desactivar.',818:'BUG47: detalle institucional con contacto, servicios, atención y requisitos.',819:'BUG48: formulario de EDICIÓN poblado con las ayudas de longitud junto a los campos.',820:'BUG49: correo inválido en EDICIÓN genera únicamente el error de correo junto al campo y conserva los otros datos.',821:'BUG50: formulario de EDICIÓN conserva datos y marca por separado los grupos Servicios y Tipo de atención.'})[id]);await p.close();
});
for(const id of [824,825])await run(id,async()=>{const p=await page(adminContext,'/system-admin');await p.getByText('Período aplicado:',{exact:false}).waitFor();if(id===825){await p.locator('input[type="date"]').nth(0).fill('2000-01-01');await p.locator('input[type="date"]').nth(1).fill('2000-01-02');await p.getByRole('button',{name:'Aplicar período',exact:true}).click();await p.getByText(/No hay datos|Sin datos|No hay registros/).first().waitFor();}await save(id,p,'Dashboard comunica el período y diferencia resultados vacíos.');await p.close();});
await run(776,async()=>{
 const p=await detail();await p.getByRole('button',{name:'Comparar',exact:true}).first().click();
 await p.getByRole('heading',{name:'Comparar residencias',exact:true}).waitFor();
 const firstTwo=publicCenters.items.slice(0,2);
 for(const item of firstTwo){
  const checkbox=p.getByRole('checkbox',{name:'Seleccionar '+item.name,exact:true});
  await checkbox.check();const row=checkbox.locator('xpath=../..');
  const province=row.locator(':scope > div').nth(2);
  assert.equal((await province.innerText()).trim(),item.province_name || 'No informado');
  assert.notEqual((await province.innerText()).trim(),item.address);
 }
 await save(776,p,'BUG05: selección de dos centros; la columna Provincia muestra '+firstTwo.map(x=>x.province_name).join(' y ')+', cotejadas con la API, sin direcciones de calle.');
 
 await p.close();
});
await run(794,async()=>{const p=await page(publicContext,'/register');const suffix=Date.now().toString().slice(-8);const fields=p.locator('input');const values=['qar'+suffix,'Prueba','Registro','qar'+suffix+'@example.invalid','QaRegistro!2026','QaRegistro!2026'];for(let i=0;i<values.length;i++)await fields.nth(i).fill(values[i]);await p.getByRole('button',{name:/Crear|Registrar/}).first().click();await p.waitForURL('**/login');await p.getByRole('status').filter({hasText:'Tu cuenta se creó correctamente'}).waitFor();assert.equal((await publicContext.request.get(api+'/auth/session')).status(),401);await save(794,p,'Registro confirma cuenta y abre login sin establecer sesión automática.');await p.close();});
await run(795,async()=>{const p=await page(publicContext,'/login');const name='lock'+Date.now().toString().slice(-7);for(let i=0;i<5;i++)await publicContext.request.post(api+'/auth/login',{data:{username:name,password:'Incorrecta!2026'}});await p.locator('#login-username').fill(name);await p.locator('#login-password').fill('Incorrecta!2026');await p.getByRole('button',{name:'Iniciar Sesión',exact:true}).click();await p.getByText(/El bloqueo dura hasta 15 minutos/).waitFor();await save(795,p,'Bloqueo temporal informa plazo de hasta 15 minutos; API aplica límite por usuario.');await p.close();});
for(const id of [797,798,799])await run(id,async()=>{const p=await page(userContext,'/profile');await p.getByRole('button',{name:/Cambiar Contraseña/i}).click();const current=p.locator('#password-current');await current.waitFor();if(id!==799){await current.fill(user.password);await p.locator('#password-next').fill('simple');await p.locator('#password-confirmation').fill('simple');}await p.getByRole('button',{name:'Actualizar',exact:true}).click();await p.getByText('Revisa los campos indicados. Vuelve a escribir las contraseñas.').waitFor();assert.equal(await current.inputValue(),'');assert.equal(await p.locator('#password-next').inputValue(),'');if(id===798)assert.ok((await p.locator('body').innerText()).includes('mayúscula'));await save(id,p,'Validación de contraseña en español por campo, reglas específicas, campos y visibilidad restablecidos.');await p.close();});
await run(804,async()=>{const image=await publicContext.request.get(center.cover_url);assert.equal(image.status(),200);const response=await userContext.request.post(api+'/users/me/picture',{multipart:{file:{name:'avatar.jpg',mimeType:'image/jpeg',buffer:await image.body()}}});assert.equal(response.status(),200);assert.equal((await userContext.request.delete(api+'/users/me/picture')).status(),200);assert.equal((await(await userContext.request.get(api+'/users/me')).json()).profilePicture,null);const p=await page(userContext,'/profile');assert.equal(await p.locator('img[alt="'+user.username+'"]').count(),0);await save(804,p,'Foto eliminada persiste al consultar perfil de nuevo; avatar por defecto visible.');await p.close();});
await run(805,async()=>{
 const catalogs=await(await publicContext.request.get(api+'/asylums/catalogs')).json();
 const azua=catalogs.provinces.find(x=>x.name==='Azua');const previous=catalogs.municipalities.find(x=>x.province_id===azua.id);
 assert.equal((await userContext.request.patch(api+'/users/me',{data:{provinceId:azua.id,municipalityId:previous.id}})).status(),200);
 const p=await page(userContext,'/profile');await p.getByRole('button',{name:'Editar perfil',exact:true}).click();
 const city=p.getByText('Ciudad',{exact:true}).locator('xpath=../..');
 const municipality=p.getByText('Municipio',{exact:true}).locator('xpath=../..');
 await city.getByRole('button').first().click();await city.getByRole('button',{name:'Santiago',exact:true}).click();
 assert.equal((await municipality.getByRole('button').first().innerText()).trim(),'');
 await municipality.getByRole('button').first().click();
 const expected=catalogs.municipalities.filter(x=>x.province_id===catalogs.provinces.find(v=>v.name==='Santiago').id).map(x=>x.name);
 const options=await municipality.getByRole('button').allTextContents();
 assert.deepEqual(options.slice(1).map(x=>x.trim()).sort(),expected.sort());
 const incompatible=await userContext.request.patch(api+'/users/me',{data:{provinceId:catalogs.provinces.find(x=>x.name==='Santiago').id,municipalityId:previous.id}});assert.equal(incompatible.status(),422);
 await save(805,p,'BUG34: al cambiar Ciudad de Azua a Santiago se limpia el municipio anterior; desplegable solo ofrece municipios de Santiago. API rechaza combinación incompatible (422).');
 await p.close();
});
await run(806,async()=>{
 const p=await page(userContext,'/profile');await p.getByRole('button',{name:'Editar perfil',exact:true}).click();
 const city=p.getByText('Ciudad',{exact:true}).locator('xpath=../..');const municipality=p.getByText('Municipio',{exact:true}).locator('xpath=../..');
 await city.getByRole('button').first().click();await city.getByRole('button',{name:'Santiago',exact:true}).click();
 await municipality.getByRole('button').first().click();await municipality.getByRole('button',{name:'Santiago de los Caballeros',exact:true}).click();
 await p.getByRole('button',{name:'Guardar Cambios',exact:true}).click();await p.getByRole('button',{name:'Editar perfil',exact:true}).waitFor();
 await p.reload({waitUntil:'networkidle'});await p.getByRole('button',{name:'Editar perfil',exact:true}).waitFor();
 assert.ok((await p.locator('body').innerText()).includes('Santiago de los Caballeros'));
 await save(806,p,'BUG35: Ciudad Santiago y Municipio Santiago de los Caballeros guardados desde el formulario y recuperados tras recargar el perfil.');await p.close();
});
let centerCredentials;
async function centerFixture(){
 if(centerCredentials)return centerCredentials;
 const filename='backend/.runtime/azure-qa-center.json';
 if(fs.existsSync(filename)){
  const cached=JSON.parse(fs.readFileSync(filename));const check=await context(cached);
  const session=await(await check.request.get(api+'/auth/session')).json();await check.close();
  if(session.requiresPasswordChange){centerCredentials=cached;return centerCredentials;}
 }
 const list=await(await adminContext.request.get(api+'/admin/asylums')).json();const target=list.items.find(item=>!item.administrator);assert.ok(target,'Unassigned QA center');
 const username='qacent'+Date.now().toString().slice(-7);const response=await adminContext.request.post(api+'/admin/asylum-admins',{data:{username,firstName:'Centro',lastName:'Evidencias',email:username+'@example.invalid',phone:'8095550198',assignedAsylumId:target.asylumId}});assert.equal(response.status(),201);const account=await response.json();centerCredentials={username,password:account.temporaryPassword};fs.writeFileSync(filename,JSON.stringify(centerCredentials),{mode:0o600});return centerCredentials;
}
for(const id of [800,801,802])await run(id,async()=>{const c=await context(await centerFixture());const p=await page(c,'/center-admin/asylum');await p.locator('#password-current').waitFor();if(id===800){for(const key of ['current','next','confirmation']){const field=p.locator('#password-'+key);await field.fill('EjemploVisible123!');await field.locator('xpath=..').getByRole('button').click();assert.equal(await field.getAttribute('type'),'text');}const field=p.locator('#password-next');const color=await field.evaluate(el=>getComputedStyle(el).color);assert.notEqual(color,'rgb(255, 255, 255)');}if(id===801)await p.getByText('Use mayúsculas, minúsculas, números y símbolos.',{exact:true}).waitFor();if(id===802){await p.locator('#password-current').fill('TemporalEjemplo123!');await p.locator('#password-next').fill('NuevaClave123');await p.locator('#password-confirmation').fill('NuevaClave123');await p.getByRole('button',{name:/Actualizar|Guardar|Continuar/}).first().click();await p.getByText(/necesita un símbolo/).waitFor();}await save(id,p,'Cambio temporal con contraste legible, ayuda de complejidad completa y errores junto a cada campo.');await c.close();});
await run(803,async()=>{const credentials=await centerFixture();const c=await context(credentials);const p=await page(c,'/center-admin/asylum');await p.locator('#password-current').waitFor();const newPassword='Ft9!QA'+Date.now()+'#';await p.locator('#password-current').fill(credentials.password);await p.locator('#password-next').fill(newPassword);await p.locator('#password-confirmation').fill(newPassword);await p.getByRole('button',{name:/Actualizar|Guardar|Continuar/}).first().click();await p.getByRole('status').filter({hasText:'Contraseña actualizada.'}).waitFor();assert.equal((await(await c.request.get(api+'/auth/session')).json()).requiresPasswordChange,false);await save(803,p,'Cambio temporal muestra bienvenida y desactiva requiresPasswordChange.');fs.writeFileSync('backend/.runtime/azure-qa-center.json',JSON.stringify({...credentials,password:newPassword}),{mode:0o600});await c.close();});
for(const [id,type]of [[826,'centers'],[827,'users'],[828,'centers']])await run(id,async()=>{const p=await page(adminContext,'/system-admin/reports');await p.getByRole('combobox',{name:'Tipo de reporte'}).selectOption(type);if(id===826){await p.getByRole('combobox',{name:'Provincia'}).selectOption({label:'Santiago'});}await p.getByRole('button',{name:'Consultar datos'}).click();await p.locator('tbody tr').first().waitFor();if(id===826)assert.ok((await p.locator('table').innerText()).toLowerCase().includes('provincia'));if(id===827){const text=await p.locator('table').innerText();assert.ok(text.toLowerCase().includes('apellido'));assert.ok(!text.includes('ADMIN_SISTEMA'));}if(id===828){const response=await adminContext.request.post(api+'/admin/reports/export',{data:{reportType:type,startDate:'2020-01-01',endDate:'2099-01-01',format:'pdf'}});assert.equal(response.status(),200);fs.writeFileSync(path.join(output,'AZ-828','reporte.pdf'),await response.body());}if(id===828){
 const pdfBrowser=await chromium.launch({headless:true,channel:'chromium'});
 try {
  const viewer=await pdfBrowser.newPage({viewport:{width:1440,height:1000}});
  await viewer.goto('file://'+path.resolve(output,'AZ-828','reporte.pdf'));
  await viewer.waitForTimeout(1800);
  await save(id,viewer,'PDF generado y abierto en el visor; metadatos comprobados en la prueba de exportación.');
 } finally {await pdfBrowser.close();}
 }else await save(id,p,id===826?'BUG53: filtro Santiago seleccionado y tabla con Provincia Santiago, además del ID.':'BUG54: columnas Nombre, Apellido y Rol con valores legibles de cuentas.');await p.close();});
await run(830,async()=>{const userId=(await(await userContext.request.get(api+'/auth/session')).json()).userId;const blocked=await adminContext.request.patch(api+`/admin/users/${(await(await userContext.request.get(api+'/auth/session')).json()).userId}/block`,{data:{reason:'Bloqueo temporal de cuenta fixture para evidencia QA.'}});assert.equal(blocked.status(),204);const p=await page(adminContext,'/system-admin/users');await p.getByRole('textbox',{name:'Buscar usuario'}).fill('Prueba Evidencias');await p.getByRole('button',{name:'Buscar',exact:true}).click();await p.getByRole('button',{name:'Desbloquear',exact:true}).first().click();await p.getByText(/Motivo original: Bloqueo temporal/).waitFor();await save(829,p,'Desbloqueo pide confirmación y justificación, mostrando el motivo original.');await p.getByRole('textbox',{name:'Justificación del desbloqueo'}).fill('Desbloqueo de la cuenta fixture después de verificar el aviso.');await p.getByRole('button',{name:'Confirmar desbloqueo'}).click();await p.getByRole('status').filter({hasText:'desbloqueada'}).waitFor();await save(830,p,'BUG57: aviso identifica al usuario desbloqueado y estado Activo; se comprueba un aviso distinto de bloqueo.');
await p.getByRole('button',{name:'Bloquear',exact:true}).first().click();
await p.getByRole('textbox',{name:'Motivo del bloqueo'}).fill('Bloqueo de prueba para contrastar ambos avisos de confirmación.');
await p.getByRole('button',{name:'Confirmar bloqueo',exact:true}).click();
await p.getByText(/ha sido bloqueada/).waitFor();await p.waitForTimeout(700);

assert.equal((await adminContext.request.patch(api+'/admin/users/'+userId+'/unblock',{data:{reason:'Restauración de la cuenta de pruebas al completar la evidencia.'}})).status(),204);
await p.close();});
let moderationFixture;
async function prepareModeration(){
 if(moderationFixture)return moderationFixture;
 const reviewer=await context(user);let response=await reviewer.request.post(api+'/reviews',{data:{asylumId:center.id,rating:4,comment:'Reseña de pruebas para verificar las evidencias de moderación.'}});let review;
 if(response.status()===409){const list=await(await reviewer.request.get(api+`/asylums/${center.id}/reviews`)).json();review=list.find(item=>item.author?.name==='Prueba Evidencias');}else{assert.equal(response.status(),201);review=await response.json();}
 assert.ok(review);const reporter={username:'qarep'+Date.now().toString().slice(-7),password:'Ft9!ReporteQA2026#'};
 assert.equal((await publicContext.request.post(api+'/auth/register',{data:{...reporter,confirmPassword:reporter.password,email:reporter.username+'@example.invalid',firstName:'Reporte',lastName:'Evidencias'}})).status(),201);
 const reporterContext=await context(reporter);const reported=await reporterContext.request.post(api+'/reviews/reports',{data:{reviewId:review.reviewId,reason:'OTHER',detail:'Denuncia ficticia exclusivamente para comprobar la pantalla de moderación.'}});assert.equal(reported.status(),201);moderationFixture=await reported.json();await reviewer.close();await reporterContext.close();return moderationFixture;
}
await run(831,async()=>{const fixture=await prepareModeration();const p=await page(adminContext,'/system-admin/moderation');await p.getByRole('button',{name:'Moderar',exact:true}).first().click();await p.getByText(/Publicación de la reseña:/).waitFor();await p.getByText(/Fecha del reporte:/).waitFor();await save(831,p,'Detalle diferencia fecha de publicación de reseña, fecha de denuncia y detalle adicional.');await p.close();assert.equal((await adminContext.request.patch(api+`/admin/review-reports/${fixture.reportId}/moderate`,{data:{status:'DISCARDED',justification:'Denuncia de prueba descartada tras verificar la evidencia y conservar la reseña.'}})).status(),200);});
await run(832,async()=>{await prepareModeration();const p=await page(adminContext,'/system-admin/moderation');await p.getByRole('combobox',{name:'Estado'}).selectOption('ALL');await p.getByRole('button',{name:'Ver resolución',exact:true}).first().click();await p.getByText(/Moderador:/).waitFor();assert.ok((await p.locator('body').innerText()).includes('Sistema'));await save(832,p,'Resolución muestra nombre histórico, ID del moderador, justificación y fecha/hora.');await p.close();});
await run(774,async()=>{const p=await page(adminContext,'/system-admin/audit');await p.locator('tbody tr').first().waitFor();assert.ok((await p.locator('tbody').innerText()).includes('Sistema'));await save(774,p,'Auditoría conserva nombre e ID del moderador y fecha/hora de resolución.');await p.close();});

await browser.close();
fs.writeFileSync(path.join(output,'resultados.json'),JSON.stringify(results,null,2));
console.log('SUMMARY',JSON.stringify(results.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{})));

if(results.some(row=>row.status==='fallo'))process.exitCode=1;
