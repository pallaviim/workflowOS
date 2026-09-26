import test from 'node:test';
import assert from 'node:assert/strict';
import {understandWorkflow} from '../server/workflow-understanding.js';

const tokens=['open_email','download_attachment','search_customer','update_customer','send_message'];
const proposal={intent:'Process Customer Request',trigger:'New customer request received in Gmail',steps:['Identify customer from email','Download relevant attachment','Find customer in CRM','Update customer record','Notify relevant team in Slack'],failureCondition:'Customer not found',requiresHumanIntervention:true};
const clientFor=result=>({responses:{create:async()=>result}});

test('uses a valid structured AI workflow understanding response',async()=>{
  let request;
  const result=await understandWorkflow(tokens,{apiKey:'test-key',client:{responses:{create:async input=>{request=input;return{output_text:JSON.stringify(proposal)}}}}});
  assert.equal(result.understandingSource,'ai');
  assert.equal(result.provider,'openai');
  assert.equal(result.workflowName,proposal.intent);
  assert.deepEqual(result.steps,proposal.steps);
  assert.deepEqual(JSON.parse(request.input),{semanticActivity:tokens});
  assert.equal(request.store,false);
});
test('uses deterministic understanding when the API key is missing',async()=>{
  const result=await understandWorkflow(tokens,{apiKey:''});
  assert.equal(result.understandingSource,'deterministic-fallback');
  assert.equal(result.provider,'local');
});
test('uses deterministic understanding when the AI request fails',async()=>{
  const result=await understandWorkflow(tokens,{apiKey:'test-key',client:{responses:{create:async()=>{throw Error('unavailable')}}}});
  assert.equal(result.understandingSource,'deterministic-fallback');
});
test('uses deterministic understanding when the AI response is malformed',async()=>{
  const result=await understandWorkflow(tokens,{apiKey:'test-key',client:clientFor({output_text:'not json'})});
  assert.equal(result.understandingSource,'deterministic-fallback');
});
test('uses deterministic understanding when the AI response fails schema validation',async()=>{
  const result=await understandWorkflow(tokens,{apiKey:'test-key',client:clientFor({output_text:JSON.stringify({...proposal,failureCondition:null})})});
  assert.equal(result.understandingSource,'deterministic-fallback');
});
