/** Acceptance edge cases. Deliberately produces no screenshots. Run against local fixtures only. */
import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const require=createRequire(new URL('../../frontend/package.json',import.meta.url));
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true});
const api='http://localhost:18000/api/v1';
const output='backend/.runtime/acceptance-edge-results.json';
const owner=JSON.parse(fs.readFileSync('backend/.runtime/owner-mock-credentials.json'));
const member=JSON.parse(fs.readFileSync('backend/.runtime/azure-qa-credentials.json'));
const results=[];
async function context(credentials){const c=await browser.newContext({viewport:{width:1440,height:1000}});if(credentials)assert.equal((await c.request.post(api+'/auth/login',{data:credentials})).status(),200);return c;}
const guest=await context(), user=await context(member), admin=await context({username:'admin.sistema',password:owner.password});
async function page(c,route){const p=await c.newPage();p.on('pageerror',error=>fs.appendFileSync('backend/.runtime/acceptance-page-errors.log',error.stack+'\n'));p.setDefaultTimeout(10000);await p.goto('http://localhost:3000'+route,{waitUntil:'networkidle'});return p;}
async function check(name,criteria,fn){if(process.env.FAMTREE_EDGE&&!name.includes(process.env.FAMTREE_EDGE))return;try{await fn();results.push({name,criteria,status:'pass'});console.log('PASS',name);}catch(error){results.push({name,criteria,status:'fail',error:error.message});console.log('FAIL',name,error.message.split('\n')[0]);}fs.writeFileSync(output,JSON.stringify(results,null,2));}
const centers=(await(await guest.request.get(api+'/asylums')).json()).items;
const center=centers.find(x=>x.name==='Residencia San José') || centers[0];
const detail=await(await guest.request.get(api+'/asylums/'+center.id)).json();
await check('Datos ausentes en ficha y enlaces inválidos', ['777-CA2','778-CA3','779-CA4','780-CA4','781-CA3','783-CA3'],async()=>{
 const p=await guest.newPage();p.setDefaultTimeout(10000);
 await p.route('**/asylums/'+center.id,route=>route.fulfill({json:{...detail,province_name:null,municipality_name:null,sector:null,address:null,capacity:null,admission_requirements:null,certifications:null,latitude:null,longitude:null,website:'http://?',care_types:[],services:[]}}));
 await p.goto('http://localhost:3000/catalog?asiloId='+center.id,{waitUntil:'networkidle'});
 await p.getByText('Ubicación en mapa no disponible para este centro.').waitFor();
 assert.ok(await p.getByText('No informado',{exact:true}).count()>=4);
 await p.getByText('Capacidad total: No informado',{exact:true}).waitFor();
 await p.getByText('Sin certificaciones declaradas',{exact:true}).waitFor();
 await p.getByText('No se han informado servicios.',{exact:true}).waitFor();
 await p.getByText('No se han informado tipos de cuidado.',{exact:true}).waitFor();
 assert.equal(await p.locator('a[href="http://?"]').count(),0);
 await p.close();
});
await check('Comparación sin provincia nunca usa la dirección', ['776-CA1','776-CA2','776-CA3'],async()=>{
 const p=await guest.newPage();p.setDefaultTimeout(10000);
 await p.route('**/asylums?*',route=>route.fulfill({json:{items:[{...centers[0],province_name:null,address:'CALLE QUE NO ES PROVINCIA'}],pagination:{pages:1,page:1,total:1,page_size:15},filters:{}}}));
 await p.goto('http://localhost:3000/catalog?asiloId='+center.id,{waitUntil:'networkidle'});
 await p.getByRole('button',{name:'Comparar',exact:true}).first().click();
 const row=p.getByRole('checkbox',{name:'Seleccionar '+centers[0].name,exact:true}).locator('xpath=../..');
 assert.equal((await row.locator(':scope > div').nth(2).innerText()).trim(),'No informado');
 assert.ok(!(await row.innerText()).includes('CALLE QUE NO ES PROVINCIA'));await p.close();
});
await check('Ruta de notificaciones exige sesión', ['772-CA2','772-CA3'],async()=>{
 const p=await page(guest,'/notifications');await p.waitForURL('**/login?callbackUrl=*');
 assert.equal((await guest.request.get(api+'/notifications')).status(),401);await p.close();
});
await check('Fallo cartográfico se explica y Reintentar recupera las teselas', ['784-CA1','784-CA4'],async()=>{
 const p=await guest.newPage();p.setDefaultTimeout(10000);
 await p.route('**/*.tile.openstreetmap.org/**',route=>route.abort());
 await p.goto('http://localhost:3000/map',{waitUntil:'networkidle'});
 await p.getByText('No se pudo cargar parte del mapa.',{exact:false}).waitFor();
 await p.unroute('**/*.tile.openstreetmap.org/**');await p.getByRole('button',{name:'Reintentar',exact:true}).click();
 await p.waitForFunction(()=>[...document.querySelectorAll('.leaflet-tile')].some(img=>img.complete&&img.naturalWidth>0));
 assert.equal(await p.getByText('No se pudo cargar parte del mapa.',{exact:false}).count(),0);await p.close();
});
await check('Autenticación de reseña conserva el centro de origen', ['787-CA1','787-CA3','787-CA4'],async()=>{
 const p=await page(guest,'/review?asylumId='+center.id);
 await p.getByRole('heading',{name:center.name,exact:true}).waitFor();
 await p.getByRole('link',{name:/Iniciar Sesión|Iniciar sesión/}).last().click();
 await p.waitForURL('**/login?callbackUrl=*');
 assert.ok(new URL(p.url()).searchParams.get('callbackUrl').includes('asylumId='+center.id));await p.close();
});
await check('Resumen usa las mismas reseñas visibles con Mis Reseñas', ['788-CA1','788-CA2','788-CA3'],async()=>{
 const p=await page(user,'/review?asylumId='+center.id);await p.locator('meter').last().waitFor();
 const all=await p.locator('meter').evaluateAll(nodes=>nodes.reduce((sum,n)=>sum+n.value,0));
 await p.getByRole('button',{name:'Mis Reseñas',exact:true}).click();
 const mine=await p.locator('meter').evaluateAll(nodes=>nodes.reduce((sum,n)=>sum+n.value,0));
 assert.ok(mine<=all);assert.ok(mine<=1);await p.close();
});
await check('Cancelar y abandonar perfil no guardan borradores ni fotos', ['804-CA1','809-CA1','809-CA2','809-CA3','809-CA4'],async()=>{
 const before=await(await user.request.get(api+'/users/me')).json();
 const p=await page(user,'/profile');await p.getByRole('button',{name:'Editar perfil',exact:true}).click();
 await p.getByRole('button',{name:'Quitar',exact:true}).click();
 await p.locator('input').nth(2).fill('Borrador');
 const after=await(await user.request.get(api+'/users/me')).json();assert.equal(after.firstName,before.firstName);assert.equal(after.profilePicture,before.profilePicture);
 await p.locator('a[href="/catalog"]').first().click();await p.getByRole('dialog',{name:'Cambios sin guardar'}).waitFor();
 await p.getByRole('button',{name:'Seguir editando'}).click();
 await p.getByRole('button',{name:'Cancelar',exact:true}).click();await p.getByRole('button',{name:'Editar perfil',exact:true}).waitFor();
 assert.equal(await p.locator('input').nth(2).inputValue(),before.firstName);await p.close();
});
await check('Asilo desactivado permanece en Guardados como No disponible', ['815-CA2'],async()=>{
 const target=centers[0];const previous=await(await user.request.get(api+'/favorites')).json();const existed=previous.some(x=>x.asylumId===target.id);
 if(!existed)assert.equal((await user.request.post(api+'/favorites',{data:{asylumId:target.id}})).status(),201);
 try{
  assert.equal((await admin.request.patch(api+'/admin/asylums/'+target.id+'/deactivate')).status(),200);
  const p=await page(user,'/catalog');await p.getByRole('button',{name:/^Guardados/}).click();
  await p.getByText('No disponible',{exact:true}).waitFor().catch(async error=>{fs.writeFileSync('backend/.runtime/favorites-debug.txt',JSON.stringify(await(await user.request.get(api+'/favorites')).json())+'\n'+await p.locator('body').innerText());throw error;});assert.ok((await p.locator('body').innerText()).includes(target.name));await p.close();
 }finally{assert.equal((await admin.request.patch(api+'/admin/asylums/'+target.id+'/activate')).status(),200);if(!existed)await user.request.delete(api+'/favorites/'+target.id);}
});
await check('Detalle de auditoría identifica actor, acción, entidad y justificación', ['774-CA1','774-CA3'],async()=>{
 const p=await page(admin,'/system-admin/audit');await p.getByRole('button',{name:'Ver evento',exact:true}).first().click();
 for(const label of ['Actor','Acción','Entidad','Justificación histórica','Fecha de resolución'])await p.getByText(label,{exact:true}).waitFor();await p.close();
});
await check('Provincia Santiago legible en tabla, PDF y CSV', ['826-CA1','826-CA3','826-CA4','828-CA1','828-CA2'],async()=>{
 const catalogs=await(await guest.request.get(api+'/asylums/catalogs')).json();const province=catalogs.provinces.find(x=>x.name==='Santiago');
 for(const format of ['pdf','csv']){
  const response=await admin.request.post(api+'/admin/reports/export',{data:{reportType:'centers',startDate:'2020-01-01',endDate:'2099-01-01',provinceId:province.id,format}});assert.equal(response.status(),200);
  const text=format==='pdf'?execFileSync('pdftotext',['-','-'],{input:await response.body()}).toString():await response.text();
  assert.ok(text.includes('Santiago'));if(format==='pdf')assert.ok(text.includes('provincia: Santiago'));
 }
});
await check('Atajos de período consultan intervalos distintos y muestran definición', ['824-CA1','824-CA2','824-CA3','824-CA4'],async()=>{
 const p=await page(admin,'/system-admin');const intervals=[];
 for(const label of ['Últimos 7 días','Último mes','Último año']){
  const wait=p.waitForResponse(r=>r.url().includes('/admin/dashboard')&&r.status()===200);
  await p.getByRole('button',{name:label,exact:true}).click();const response=await wait;const url=new URL(response.url());intervals.push(url.search);
  await p.getByText('Período aplicado:',{exact:false}).waitFor();
 }
 assert.equal(new Set(intervals).size,3);await p.close();
});
await check('Contraseña actual incorrecta: error por campo, limpieza y clave vigente', ['797-CA1','797-CA2','797-CA3','797-CA4','798-CA4','799-CA2'],async()=>{
 const p=await page(user,'/profile');await p.getByRole('button',{name:/Cambiar contraseña/i}).click();
 await p.locator('#password-current').fill('IncorrectaActual9!');await p.locator('#password-next').fill('NuevaQueNoSeGuarda9!');await p.locator('#password-confirmation').fill('NuevaQueNoSeGuarda9!');
 await p.locator('#password-current').locator('xpath=..').getByRole('button').click();
 await p.locator('#password-next').locator('xpath=..').getByRole('button').click();
 await p.getByRole('button',{name:'Actualizar',exact:true}).click();
 await p.getByText('La contraseña actual o temporal es incorrecta.',{exact:true}).waitFor();
 for(const field of ['current','next','confirmation']){assert.equal(await p.locator('#password-'+field).inputValue(),'');assert.equal(await p.locator('#password-'+field).getAttribute('type'),'password');}
 const reentry=await context(member);await reentry.close();await p.close();
});
await check('Filtros: precios no negativos, umbral visible y limpieza', ['812-CA1','812-CA2','812-CA3','790-CA1','790-CA2','790-CA3','790-CA4'],async()=>{
 const p=await page(guest,'/catalog');await p.getByRole('button',{name:/^Filtros/}).click();
 let panel=p.getByRole('dialog',{name:'Filtros de residencias'});
 await panel.getByRole('spinbutton',{name:'Precio mínimo (DOP)'}).fill('-1');await panel.getByRole('button',{name:'Aplicar selección'}).click();
 await panel.getByText('Los precios deben ser números mayores o iguales a 0.',{exact:true}).waitFor();
 await panel.getByRole('spinbutton',{name:'Precio mínimo (DOP)'}).fill('0');await panel.getByRole('combobox',{name:'Calificación mínima'}).selectOption('4');
 await panel.getByRole('button',{name:'Aplicar selección'}).click();await p.getByText('Filtro aplicado: mínimo 4 estrellas.',{exact:true}).waitFor();
 const apiData=await(await guest.request.get(api+'/asylums?rating_min=4&min_price=0')).json();assert.ok(apiData.items.every(x=>x.rating>=4));
 await p.getByRole('button',{name:/^Filtros/}).click();await panel.getByRole('button',{name:'Restablecer'}).click();
 await p.waitForTimeout(500);assert.equal(await p.getByText('Filtro aplicado: mínimo 4 estrellas.',{exact:true}).count(),0);
 if(!await panel.isVisible())await p.getByRole('button',{name:/^Filtros/}).click();assert.equal(await panel.getByRole('combobox',{name:'Calificación mínima'}).inputValue(),'');await p.close();
});
await check('Fallos del dashboard se distinguen de un período sin registros', ['825-CA2'],async()=>{
 const p=await admin.newPage();await p.route('**/admin/dashboard**',route=>route.fulfill({status:500,json:{error:{code:'internal_error',message:'Fallo simulado'}}}));
 await p.goto('http://localhost:3000/system-admin',{waitUntil:'networkidle'});
 await p.getByRole('alert').filter({hasText:'No pudimos completar la operación.'}).waitFor();
 assert.equal(await p.getByText('No hay datos para este período.',{exact:false}).count(),0);await p.close();
});
await browser.close();fs.writeFileSync(output,JSON.stringify(results,null,2));
if(results.some(x=>x.status==='fail'))process.exitCode=1;
