import test from 'node:test';
import assert from 'node:assert/strict';
import {understandWorkflow} from '../server/workflow-understanding.js';

const tokens=['open_email','download_attachment','search_customer','update_customer','send_message'];
const proposal={intent:'Process Customer Request',trigger:'New customer request received in Gmail',steps:['Identify customer from email','Download relevant attachment','Find customer in CRM','Update customer record','Notify relevant team in Slack'],failureCondition:'Customer not found',requiresHumanIntervention:true};
const invoiceTokens=['open_invoice_email','download_invoice','open_spreadsheet','update_invoice'];
const invoiceProposal={intent:'Process Invoice',trigger:'New invoice received',steps:['Review invoice','Save invoice','Update invoice ledger'],failureCondition:'Invoice data is incomplete',requiresHumanIntervention:false};
const clientFor=result=>({responses:{create:async()=>result}});

test('uses a valid structured AI workflow understanding response',async()=>{
  let request;
  const result=await understandWorkflow(tokens,{apiKey:'test-key',client:{responses:{create:async input=>{request=input;return{output_text:JSON.stringify(proposal)}}}}});
  assert.equal(result.understandingSource,'ai');
  assert.equal(result.provider,'groq');
  assert.equal(result.workflowName,proposal.intent);
  assert.deepEqual(result.steps,proposal.steps);
  assert.deepEqual(JSON.parse(request.input),{semanticActivity:tokens});
  assert.equal(request.store,false);
  assert.equal(request.model,'openai/gpt-oss-20b');
});
test('uses GROQ_API_KEY configuration when no API key override is supplied',async()=>{
  const prior=process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY='test-groq-key';
  try{
    const result=await understandWorkflow(tokens,{client:clientFor({output_text:JSON.stringify(proposal)})});
    assert.equal(result.provider,'groq');
    assert.equal(result.understandingSource,'ai');
  }finally{
    if(prior===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=prior;
  }
});
test('uses a different valid AI proposal for a different semantic sequence',async()=>{
  const result=await understandWorkflow(invoiceTokens,{apiKey:'test-key',client:clientFor({output_text:JSON.stringify(invoiceProposal)})});
  assert.equal(result.understandingSource,'ai');
  assert.equal(result.workflowName,'Process Invoice');
  assert.equal(result.trigger,'New invoice received');
  assert.deepEqual(result.steps,invoiceProposal.steps);
  assert.notEqual(result.workflowName,proposal.intent);
});
test('sends only normalized semantic activity to the AI request',async()=>{
  let request;
  await understandWorkflow(tokens,{apiKey:'test-key',client:{responses:{create:async input=>{request=input;return{output_text:JSON.stringify(proposal)}}}}});
  const payload=request.input.toLowerCase();
  for(const sensitiveValue of ['password','cookie','token','form value','<html','email body','keystroke'])assert.equal(payload.includes(sensitiveValue),false);
  assert.deepEqual(JSON.parse(request.input),{semanticActivity:tokens});
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
