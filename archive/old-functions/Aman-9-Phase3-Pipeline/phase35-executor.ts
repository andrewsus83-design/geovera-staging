import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const H={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Content-Type':'application/json'};
const TK:string[][]=[
['T01','Trust Architecture'],['T02','Content Engine'],['T03','Signal Classification'],
['T04','Foundation Gate'],['T05','Evidence Pack'],['T06','Confidence Scoring'],
['T07','Strategic Synthesis'],['T08','Task Prioritization'],['T09','Playbook Actions'],
['T10','Review Queue'],['T11','Learning Note'],['T12','Timeline Update']
];
const PR:Record<string,string>={T01:'Query gv_pillar_scores trust. Insert gv_authority_assets article Trust Architecture conf 0.75.',T02:'Insert voice standards + buyer_guide into gv_authority_assets.',T03:'Query gv_signal_layer_registry. Count artifacts per layer. Update gv_classification_logs.',T04:'Run 6 gates: count>=20, dqs avg>=0.7 min>=0.6, sources>=2, coverage>=5, fresh<30d, isolation. Insert gv_foundation_validations.',T05:'Query normalized_artifacts layer=2 eligible. Insert gv_perplexity_payloads.',T06:'Calc confidence: quality*0.4+attribution*0.3+0.3. Grade. Insert gv_confidence_scores.',T07:'Insert 3-5 insights, 5-8 tasks, 2-3 assets. Update gv_strategic_synthesis.',T08:'Calc (impact*risk)/effort. Assign DO_FIRST/PLAN_IT/DELEGATE/DEFER.',T09:'Insert gv_playbook_actions for top tasks.',T10:'Insert gv_review_queue for draft items.',T11:'Insert gv_learning_notes status=final.',T12:'Insert gv_timelines 6 cards. Update gv_runs completed.'};

function sbFetch(sql:string){return fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/`,{method:'POST',headers:{'apikey':Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,'Authorization':`Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}`,'Content-Type':'application/json'}});}

async function sbQuery(table:string,select='*',filter=''){const u=`${Deno.env.get('SUPABASE_URL')}/rest/v1/${table}?select=${select}${filter?'&'+filter:''}`;const r=await fetch(u,{headers:{'apikey':Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,'Authorization':`Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}`}});return r.json();}

async function sbInsert(table:string,data:any){const u=`${Deno.env.get('SUPABASE_URL')}/rest/v1/${table}`;const r=await fetch(u,{method:'POST',headers:{'apikey':Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,'Authorization':`Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}`,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(data)});return r.json();}

async function sbUpdate(table:string,data:any,filter:string){const u=`${Deno.env.get('SUPABASE_URL')}/rest/v1/${table}?${filter}`;await fetch(u,{method:'PATCH',headers:{'apikey':Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,'Authorization':`Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}`,'Content-Type':'application/json'},body:JSON.stringify(data)});}

async function sbDelete(table:string,filter:string){await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/${table}?${filter}`,{method:'DELETE',headers:{'apikey':Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,'Authorization':`Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}`}});}

async function callClaude(tid:string,rid:string,bid:string){const k=Deno.env.get('ANTHROPIC_API_KEY');if(!k)throw new Error('Set ANTHROPIC_API_KEY');const p=Deno.env.get('SUPABASE_URL')!.replace('https://','').replace('.supabase.co','');const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'anthropic-api-key':k,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:16000,system:`GeoVera P3.5 executor. brand_id='${bid}',run_id='${rid}'. Use MCP Supabase tools. Return JSON.`,messages:[{role:'user',content:`Execute ${tid}: ${PR[tid]||'Do it.'} brand_id='${bid}',run_id='${rid}'.`}],mcp_servers:[{type:'url',url:`https://mcp.supabase.com/mcp?project_ref=${p}`,name:'sb'}]})});if(!r.ok)throw new Error(`${r.status}`);const d=await r.json();return{txt:(d.content||[]).filter((b:any)=>b.type==='text').map((b:any)=>b.text).join('\n')||'Done',cost:Math.round(((d.usage?.input_tokens||0)*3/1e6+(d.usage?.output_tokens||0)*15/1e6)*1000)/1000,tc:(d.content||[]).filter((b:any)=>b.type==='mcp_tool_use').length};}

async function lg(tid:string,tn:string,st:string,d:any={}){await sbInsert('phase35_execution_log',{action:d.a||'exec',task_id:tid,task_name:tn,status:st,started_at:d.s,completed_at:d.c,duration_seconds:d.d,cost_usd:d.co,tool_calls:d.tc,response:(d.r||'').substring(0,9999),error_message:d.e,metadata:d.m||{}});}

Deno.serve(async(req)=>{
if(req.method==='OPTIONS')return new Response(null,{status:200,headers:H});
try{
const body=await req.json().catch(()=>({}));
const{action='health',task_id,brand_id,start_from}=body;
const bid=brand_id||'00000000-0000-0000-0000-000000000001';

if(action==='health'){
const logs=await sbQuery('phase35_execution_log','task_id','status=eq.completed');
const ids=new Set((logs||[]).map((r:any)=>r.task_id));
return new Response(JSON.stringify({ok:true,v:'1.0',total:12,done:ids.size,left:12-ids.size,key:!!Deno.env.get('ANTHROPIC_API_KEY')}),{headers:H});
}

if(action==='status'){
const logs=await sbQuery('phase35_execution_log','*','order=created_at.asc');
const dn=new Set((logs||[]).filter((l:any)=>l.status==='completed').map((l:any)=>l.task_id));
const fl=new Set((logs||[]).filter((l:any)=>l.status==='failed').map((l:any)=>l.task_id));
const co=(logs||[]).filter((l:any)=>l.cost_usd).reduce((a:number,l:any)=>a+parseFloat(l.cost_usd),0);
return new Response(JSON.stringify({done:dn.size,fail:fl.size,pend:12-dn.size,cost:Math.round(co*1000)/1000,tasks:TK.map(([id,nm])=>({id,nm,s:dn.has(id)?'ok':fl.has(id)?'fail':'wait'}))},null,2),{headers:H});
}

if(action==='execute'){
const[run]=await sbInsert('gv_runs',{brand_id:bid,mode:'auto',status:'active',run_mode:'live',cycle_window:'7d',started_at:new Date().toISOString()});
if(!run)throw new Error('No run');const rid=run.id;
await lg('ALL','P3.5','started',{a:'start',s:new Date().toISOString(),m:{rid}});
const prev=await sbQuery('phase35_execution_log','task_id','status=eq.completed');
const ds=new Set((prev||[]).map((l:any)=>l.task_id));
let si=start_from?TK.findIndex(t=>t[0]===start_from):0;if(si<0)si=0;
const res:any[]=[];let tot=0;
for(let i=si;i<TK.length;i++){const[id,nm]=TK[i];
if(ds.has(id)){res.push({id,s:'skip'});continue;}
console.log(`[${id}] ${nm}`);const t0=Date.now();
try{const r=await callClaude(id,rid,bid);const dur=(Date.now()-t0)/1000;
await lg(id,nm,'completed',{s:new Date(t0).toISOString(),c:new Date().toISOString(),d:dur,co:r.cost,tc:r.tc,r:r.txt,m:{rid}});
tot+=r.cost;res.push({id,s:'ok',sec:Math.round(dur),cost:r.cost});
}catch(e:any){const dur=(Date.now()-t0)/1000;
await lg(id,nm,'failed',{s:new Date(t0).toISOString(),c:new Date().toISOString(),d:dur,e:e.message,m:{rid}});
res.push({id,s:'fail',err:e.message});}}
await sbUpdate('gv_runs',{status:'completed',finished_at:new Date().toISOString(),cost_summary:{usd:tot}},`id=eq.${rid}`);
await lg('ALL','P3.5','completed',{a:'done',c:new Date().toISOString(),co:tot,m:{rid}});
return new Response(JSON.stringify({rid,ok:res.filter(r=>r.s==='ok').length,fail:res.filter(r=>r.s==='fail').length,skip:res.filter(r=>r.s==='skip').length,cost:Math.round(tot*1000)/1000,res},null,2),{headers:H});
}

if(action==='execute_single'){
if(!task_id)throw new Error('task_id needed');const tk=TK.find(t=>t[0]===task_id);if(!tk)throw new Error('Bad task');
const runs=await sbQuery('gv_runs','id','status=eq.active&order=created_at.desc&limit=1');
let rid=runs?.[0]?.id;
if(!rid){const[r]=await sbInsert('gv_runs',{brand_id:bid,mode:'auto',status:'active',started_at:new Date().toISOString()});rid=r?.id;}
if(!rid)throw new Error('No run');const t0=Date.now();
const r=await callClaude(tk[0],rid,bid);const dur=(Date.now()-t0)/1000;
await lg(tk[0],tk[1],'completed',{s:new Date(t0).toISOString(),c:new Date().toISOString(),d:dur,co:r.cost,tc:r.tc,r:r.txt,m:{rid,mode:'single'}});
return new Response(JSON.stringify({id:tk[0],nm:tk[1],s:'ok',rid,sec:Math.round(dur),cost:r.cost},null,2),{headers:H});
}

if(action==='reset'){
await sbDelete('phase35_execution_log','id=neq.00000000-0000-0000-0000-000000000000');
return new Response(JSON.stringify({msg:'Cleared. Ready.'}),{headers:H});
}

throw new Error(`Unknown: ${action}`);
}catch(e:any){return new Response(JSON.stringify({error:e.message,hint:'health|status|execute|execute_single|reset'}),{status:500,headers:H});}
});
