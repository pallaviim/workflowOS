import OpenAI from 'openai';
import {z} from 'zod';
import {understand} from './workflow-engine.js';

const proposalSchema=z.object({
  intent:z.string().trim().min(1).max(160),
  trigger:z.string().trim().min(1).max(300),
  steps:z.array(z.string().trim().min(1).max(300)).min(1).max(12),
  failureCondition:z.string().trim().min(1).max(300),
  requiresHumanIntervention:z.boolean()
});

const responseFormat={type:'json_schema',name:'workflow_understanding',strict:true,schema:{type:'object',additionalProperties:false,required:['intent','trigger','steps','failureCondition','requiresHumanIntervention'],properties:{intent:{type:'string'},trigger:{type:'string'},steps:{type:'array',items:{type:'string'}},failureCondition:{type:'string'},requiresHumanIntervention:{type:'boolean'}}}};
const fallback=tokens=>({...understand(tokens),understandingSource:'deterministic-fallback'});

export async function understandWorkflow(tokens,{apiKey=process.env.OPENAI_API_KEY,client,model=process.env.OPENAI_MODEL||'gpt-4.1-mini',timeout=6000}={}){
  const local=fallback(tokens);
  if(!apiKey)return local;
  try{
    const openai=client||new OpenAI({apiKey,timeout});
    const response=await openai.responses.create({model,store:false,instructions:'You understand a proposed workflow from normalized semantic activity tokens. Return only the requested workflow proposal. Do not suggest execution, invoke tools, or infer sensitive activity details.',input:JSON.stringify({semanticActivity:tokens}),text:{format:responseFormat}});
    const proposal=proposalSchema.parse(JSON.parse(response.output_text));
    return {...local,provider:'openai',understandingSource:'ai',intent:proposal.intent,workflowName:proposal.intent,description:`AI-understood workflow proposal: ${proposal.intent}.`,trigger:proposal.trigger,steps:proposal.steps,failureCondition:proposal.failureCondition,requiresHumanIntervention:proposal.requiresHumanIntervention,conditions:proposal.requiresHumanIntervention?[{if:'workflow_failure_condition',action:'request_human_intervention'}]:[],explanation:'AI workflow understanding was generated from normalized semantic activity only.'};
  }catch{
    console.warn('[workflow-understanding] AI understanding unavailable or invalid; using deterministic fallback.');
    return local;
  }
}
