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

const GROQ_BASE_URL='https://api.groq.com/openai/v1';
const GROQ_MODEL='openai/gpt-oss-20b';
const responseFormat={type:'json_schema',name:'workflow_understanding',strict:true,schema:{type:'object',additionalProperties:false,required:['intent','trigger','steps','failureCondition','requiresHumanIntervention'],properties:{intent:{type:'string'},trigger:{type:'string'},steps:{type:'array',items:{type:'string'}},failureCondition:{type:'string'},requiresHumanIntervention:{type:'boolean'}}}};
const fallback=tokens=>({...understand(tokens),understandingSource:'deterministic-fallback'});

export async function understandWorkflow(tokens,{apiKey=process.env.GROQ_API_KEY,client,model=process.env.GROQ_MODEL||GROQ_MODEL,timeout=6000}={}){
  const local=fallback(tokens);
  if(!apiKey)return local;
  try{
    const groq=client||new OpenAI({apiKey,baseURL:GROQ_BASE_URL,timeout});
    const response=await groq.responses.create({model,store:false,instructions:'You are the workflow understanding component of WorkFlowOS. A deterministic activity-discovery system has already detected a repetitive sequence of semantic user actions. Infer the real-world task represented by that sequence and return only the requested structured workflow proposal. Do not invent unsupported actions, execute anything, provide code, analytics, confidence scores, or decide whether the sequence is repetitive.',input:JSON.stringify({semanticActivity:tokens}),text:{format:responseFormat}});
    const proposal=proposalSchema.parse(JSON.parse(response.output_text));
    return {...local,provider:'groq',understandingSource:'ai',intent:proposal.intent,workflowName:proposal.intent,description:`AI-understood workflow proposal: ${proposal.intent}.`,trigger:proposal.trigger,steps:proposal.steps,failureCondition:proposal.failureCondition,requiresHumanIntervention:proposal.requiresHumanIntervention,conditions:proposal.requiresHumanIntervention?[{if:'workflow_failure_condition',action:'request_human_intervention'}]:[],explanation:'AI workflow understanding was generated from normalized semantic activity only.'};
  }catch(error){
    console.warn('[workflow-understanding] Groq understanding unavailable or invalid; using deterministic fallback.',{status:error?.status||null,code:error?.code||null});
    return local;
  }
}
