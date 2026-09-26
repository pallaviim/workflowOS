import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

test('customer request demo records one semantic sequence that discovery persists once',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'workflowos-customer-demo-')),store=path.join(dir,'data.json'),port=3107;
 const chromeNoise=[['PAGE_OPEN','Opened page'],['FORM_SUBMIT','Submitted form']].map(([type,action],index)=>({id:`noise-${index}`,timestamp:`2026-09-26T08:00:0${index}.000Z`,application:'Browser',action,type,status:'Captured',source:'chrome-extension',sessionId:'chrome-noise'}));
 fs.writeFileSync(store,JSON.stringify({users:[{id:'user-1',name:'Test',email:'test@example.com',passwordHash:'x'}],sessions:{testtoken:'user-1'},observing:false,events:chromeNoise,workflows:[{id:'seed-1',name:'Process Customer Request',source:'seeded-demo',status:'discovered'}],executions:[],integrations:[],crmCustomers:[],slackMessages:[]}));
 const child=spawn(process.execPath,['server/index.js'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),WORKFLOWOS_DATA_FILE:store},stdio:'ignore'});
 t.after(()=>{child.kill();fs.rmSync(dir,{recursive:true,force:true})});
 const request=(route,options={})=>fetch(`http://localhost:${port}${route}`,{...options,headers:{Authorization:'Bearer testtoken',...options.headers}});
 let recorded;for(let attempt=0;attempt<20;attempt++){try{recorded=await request('/api/demo/customer-request-sequence',{method:'POST'});break}catch{await new Promise(resolve=>setTimeout(resolve,100))}}
 assert.equal(recorded.status,201);const body=await recorded.json();assert.equal(body.success,true);assert.equal(body.message,'Customer request sequence recorded.');assert.equal(body.eventsAdded,5);assert.equal(body.events.length,5);assert.deepEqual(body.events.map(event=>event.type),['OPEN_EMAIL','DOWNLOAD_FILE','CRM_SEARCH','CRM_UPDATE','SLACK_MESSAGE']);assert.deepEqual(body.events.map(event=>event.application),['Gmail','Files','CRM','CRM','Slack']);assert.ok(body.events.every(event=>event.sessionId===body.sessionId));
 const wrongMethod=await request('/api/demo/customer-request-sequence');assert.equal(wrongMethod.status,404);assert.match(wrongMethod.headers.get('content-type'),/application\/json/);assert.match((await wrongMethod.json()).error,/Unknown API endpoint/);
 const first=await request('/api/discover',{method:'POST'});assert.equal(first.status,200);const firstResult=await first.json();assert.equal(firstResult.created,1);const candidate=firstResult.candidates[0];assert.equal(candidate.source,'activity-discovery');assert.equal(candidate.name,'Process Customer Request');assert.equal(candidate.discoverySignature,'open_email|download_attachment|search_customer|update_customer|send_message');assert.deepEqual(candidate.actions.map(action=>[action.application,action.action]),[['Gmail','Open customer email'],['Files','Download attachment'],['CRM','Search customer'],['CRM','Update customer record'],['Slack','Send notification']]);
 const second=await request('/api/discover',{method:'POST'});const secondResult=await second.json();assert.equal(secondResult.created,0);const persisted=JSON.parse(fs.readFileSync(store));assert.equal(persisted.events.filter(event=>event.sessionId===body.sessionId).length,5);assert.equal(persisted.workflows.filter(workflow=>workflow.source==='activity-discovery'&&workflow.discoverySignature===candidate.discoverySignature).length,1);assert.equal(persisted.workflows.filter(workflow=>workflow.source==='seeded-demo').length,1);
});
