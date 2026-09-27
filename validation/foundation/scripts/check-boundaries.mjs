import { readFile, readdir } from "node:fs/promises";
import { join, relative, dirname, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const includeFixtures = process.argv.includes("--fixtures");
async function files(dir) {
  const out=[];
  for (const ent of await readdir(dir,{withFileTypes:true})) {
    const p=join(dir,ent.name);
    if(ent.isDirectory()) out.push(...await files(p));
    else if(ent.name.endsWith(".ts")) out.push(p);
  }
  return out;
}
const scanDirs=[join(root,"src")];
if(includeFixtures) scanDirs.push(join(root,"fixtures"));
const all=(await Promise.all(scanDirs.map(files))).flat();
const graph=new Map();
const violations=[];
for(const f of all){
  const txt=await readFile(f,"utf8");
  const imports=[...txt.matchAll(/(?:from\s+|import\s+)["'](.+?)["']/g)].map(m=>m[1]);
  const rel=relative(root,f).replaceAll("\\","/");
  graph.set(rel,[]);
  for(const spec of imports){
    if(rel==="src/domain.ts" && (spec.startsWith("node:") || spec.includes("infrastructure"))) violations.push(`${rel} -> ${spec}`);
    if(rel==="src/application.ts" && (spec.startsWith("node:") || spec.includes("infrastructure"))) violations.push(`${rel} -> ${spec}`);
    if(rel.includes("forbidden-client") && spec.includes("infrastructure")) violations.push(`${rel} -> ${spec}`);
    if(spec.startsWith(".")){
      let target=relative(root,resolve(dirname(f),spec.replace(/\.js$/,".ts"))).replaceAll("\\","/");
      graph.get(rel).push(target);
    }
  }
}
const cycles=[];
const visiting=new Set(),visited=new Set();
function dfs(n,path=[]){
  if(visiting.has(n)){cycles.push([...path,n].join(" -> ")); return;}
  if(visited.has(n)) return;
  visiting.add(n);
  for(const m of graph.get(n)??[]) if(graph.has(m)) dfs(m,[...path,n]);
  visiting.delete(n); visited.add(n);
}
for(const n of graph.keys()) dfs(n);
console.log(JSON.stringify({violations,cycles},null,2));
if(!includeFixtures && (violations.length||cycles.length)) process.exit(1);
if(includeFixtures && (!violations.some(v=>v.includes("forbidden-client")) || cycles.length===0)) process.exit(2);
