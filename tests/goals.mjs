import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&!/\.[a-z]+$/.test(s)?s+'.ts':s,c);}});
const {parseGoalFile,goalProgress,goalsEvidenceAnswer}=await import('../lib/goals.ts');
const {validateWork}=await import('../lib/workspace.ts');
const makeId=()=>crypto.randomUUID();
const goal={id:makeId(),project_id:null,kind:'growth',title:'Reduzir retrabalho',status:'Aberto',priority:'P2',due_date:'2026-12-30',data:{goalType:'goal',baseline:'20',target:'10',current:'15',evidence:'Relatório de outubro',measuredAt:'2026-10-21'},revision:0};
test('goal progress supports reducing and increasing, with no invented zero baseline',()=>{
 assert.equal(goalProgress(goal).raw,50);
 assert.equal(goalProgress({...goal,data:{baseline:'0',target:'10',current:'5'}}).raw,50);
 assert.equal(goalProgress({...goal,data:{target:'10',current:'5'}}),null);
 assert.equal(goalProgress({...goal,data:{baseline:'10',target:'10',current:'5'}}),null);
 assert.equal(validateWork(goal),'');
 assert.match(validateWork({...goal,data:{...goal.data,evidence:''}}),/fonte/);
 assert.match(validateWork({...goal,data:{...goal.data,measuredAt:'2026-02-30'}}),/datas/);
 assert.match(goalsEvidenceAnswer([goal]),/Relatório de outubro/);
});
test('CSV and TXT import produce private drafts, without interpreting formulas',()=>{
 const rows=parseGoalFile('\uFEFFtitulo;indicador;meta;prazo;fonte\r\n"Melhorar; qualidade";"Rever\nfluxo";10;2026-12-30;Documento da empresa','metas.csv',makeId);
 assert.equal(rows[0].title,'Melhorar; qualidade');assert.equal(rows[0].data.indicator,'Rever\nfluxo');assert.equal(rows[0].revision,0);assert.equal(rows[0].project_id,null);assert.equal(validateWork(rows[0]),'');
 assert.equal(parseGoalFile('Meta um\nMeta dois','metas.txt',makeId).length,2);
 const formula=parseGoalFile('titulo;meta\nMeta;=1+1','metas.csv',makeId)[0];assert.notEqual(validateWork(formula),'');
});
test('malformed imports fail explicitly instead of truncating or losing rows',()=>{
 for(const content of ['titulo;titulo\nA;B','titulo;outra\nA;B','titulo;meta\nA','titulo\n"sem fechamento'])assert.throws(()=>parseGoalFile(content,'metas.csv',makeId));
 assert.throws(()=>parseGoalFile(Array(51).fill('Meta').join('\n'),'metas.txt',makeId));
 assert.throws(()=>parseGoalFile('x'.repeat(100001),'metas.txt',makeId));
 assert.throws(()=>parseGoalFile('Meta','metas.pdf',makeId));
});
test('a contribution cannot be marked complete without attribution to the team',()=>{
 const contribution={...goal,data:{baseline:'Problema',action:'Ação',result:'Resultado',evidence:'Relatório'},status:'Concluído'};
 assert.match(validateWork(contribution),/participação do time/);
 assert.equal(validateWork({...contribution,data:{...contribution.data,team:'CS validou o resultado'}}),'');
});
