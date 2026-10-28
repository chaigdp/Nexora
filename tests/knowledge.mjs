import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSourceUrl,textFromBytes,isReadableTextFile,MAX_TEXT_CHARS} from '../lib/knowledge.ts';
test('links preserve references but reject executable protocols and embedded credentials',()=>{
 assert.equal(normalizeSourceUrl(' https://example.com/a?q=1 '),'https://example.com/a?q=1');
 assert.equal(normalizeSourceUrl(''),null);
 for(const value of ['javascript:alert(1)','file:///etc/passwd','data:text/html,a','https://user:secret@example.com'])assert.throws(()=>normalizeSourceUrl(value));
});
test('text import preserves original UTF-8 content and rejects truncation and binary decoding',()=>{
 const value='Implantação\nAção, responsável e prazo.\n';
 assert.equal(textFromBytes(new TextEncoder().encode(value)),value);
 assert.throws(()=>textFromBytes(new Uint8Array([255,254,128])));
 assert.throws(()=>textFromBytes(new TextEncoder().encode('a\u0000b')));
 assert.throws(()=>textFromBytes(new TextEncoder().encode('a'.repeat(MAX_TEXT_CHARS+1))));
});
test('unsupported reading formats are stored without pretending they were extracted',()=>{
 for(const name of ['notas.TXT','procedimento.md','legenda.vtt','planilha.csv'])assert.equal(isReadableTextFile(name),true);
 for(const name of ['print.png','treinamento.pdf','documento.docx','video.mp4','arquivo.exe'])assert.equal(isReadableTextFile(name),false);
});
