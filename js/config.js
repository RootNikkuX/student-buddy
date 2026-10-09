const mem={};
function sGet(k,d){try{const v=localStorage.getItem(k);if(v===null||v==='undefined')return d;const p=JSON.parse(v);return(p===null||p===undefined)?d:p}catch(e){return mem[k]!==undefined&&mem[k]!==null?mem[k]:d}}
function sSet(k,v){try{if(v===null||v===undefined)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){if(v===null||v===undefined)delete mem[k];else mem[k]=v}}
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
