const pendingStatuses=new Set(['discovered','needs_approval']);
const retainedActivityStatuses=new Set(['active','paused']);

export const isDiscoveryVisible=workflow=>{
  if(!workflow||workflow.legacyContaminated||workflow.ignored||workflow.status==='ignored'||workflow.status==='rejected') return false;
  return pendingStatuses.has(workflow.status)||(workflow.source==='activity-discovery'&&retainedActivityStatuses.has(workflow.status));
};

