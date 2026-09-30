"""Testes da aplicação local. Não acessar uma carteira de produção."""
import urllib.request, urllib.error, http.cookiejar, json, os, uuid
base=os.getenv('NEXORA_TEST_URL','http://localhost:4173')
def client():
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def call(c,data=None,expected=200):
    req=urllib.request.Request(base+'/api/nexora',data=json.dumps(data).encode() if data else None,headers={'Content-Type':'application/json','Origin':base})
    try:
        r=c.open(req);status=r.status;body=json.load(r)
    except urllib.error.HTTPError as e:
        status=e.code;body=json.load(e)
    assert status==expected,(status,body)
    return body
one,two=client(),client()
call(one,expected=401)
call(one,{'action':'login','email':'demo@nexora.app','password':'wrongpassword'},401)
for c in (one,two): call(c,{'action':'login','email':'demo@nexora.app','password':'NexoraDemo2026!'})
a,b=call(one),call(two)
assert len(a['projects'])==len(b['projects'])==30
assert len(a['tasks'])==210
assert set(p['id'] for p in a['projects']).isdisjoint(p['id'] for p in b['projects'])
p=a['projects'][0].copy();p['client']='Cliente alterado no teste'
call(one,{'action':'project.save','project':p})
assert next(x for x in call(one)['projects'] if x['id']==p['id'])['client']==p['client']
call(two,{'action':'project.save','project':p},404)
t=a['tasks'][0].copy();call(two,{'action':'task.save','task':t},404)
critical=next(t for t in a['tasks'] if t['critical'] and not t['done'])
p=next(p for p in a['projects'] if p['id']==critical['project']).copy();p['phase']='Concluída';p['completed']='2026-09-30'
call(one,{'action':'project.save','project':p},409)
new={'client':'Projeto de teste','segment':'Serviços','system':'ERP','owner':'Analista','phase':'Descoberta','start':'2026-09-01','due':'2026-10-01','completed':'','scope':'Teste','risk':'Baixo'}
r=call(one,{'action':'project.save','project':new});assert len(call(one)['projects'])==31
nt={'project':r['id'],'title':'Teste crítico','owner':'Analista','due':'2026-10-01','done':0,'critical':1,'kind':'Entrega'}
call(one,{'action':'task.save','task':nt})
nt=next(t for t in call(one)['tasks'] if t['project']==r['id']);nt['done']=1;call(one,{'action':'task.save','task':nt})
new.update(id=r['id'],phase='Concluída',completed='2026-09-30');call(one,{'action':'project.save','project':new})
assert call(one)['events']
call(one,{'action':'logout'});call(one,expected=401)
personal=client();email='test-'+uuid.uuid4().hex+'@example.com'
call(personal,{'action':'register','email':email,'name':'Analista teste','password':'PersonalTest2026!'})
assert call(personal)['projects']==[]
call(personal,{'action':'project.save','project':{**new,'id':None}},400)
new.pop('id');new.update(phase='Descoberta',completed='')
call(personal,{'action':'project.save','project':new});call(personal,{'action':'logout'})
call(personal,{'action':'login','email':email,'password':'PersonalTest2026!'})
assert len(call(personal)['projects'])==1
req=urllib.request.Request(base+'/api/nexora',data=b'{}',headers={'Content-Type':'application/json','Origin':'https://invalid.example'})
try:personal.open(req);raise AssertionError('Origem externa aceita')
except urllib.error.HTTPError as e:assert e.code==403
print('PASS: login, logout, cadastro, persistência, 30 casos, edição, isolamento, entregas críticas, histórico e proteção de origem.')
