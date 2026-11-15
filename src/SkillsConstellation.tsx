import {useState} from 'react';
import {ArrowUpRight,ChevronDown,Network} from 'lucide-react';
import {skillGroups} from './data';

type SkillNode={id:string;group:number;x:number;y:number;description:string};
const hubs=[
 {x:24,y:26,label:'AI & Language Models'},
 {x:76,y:26,label:'Frameworks & ML'},
 {x:24,y:76,label:'Systems & Tools'},
 {x:76,y:76,label:'Languages'}
];
const nodes:SkillNode[]=[
 {id:'RAG',group:0,x:11,y:12,description:'Ground language-model responses in retrieved context.'},
 {id:'LoRA',group:0,x:39,y:12,description:'Parameter-efficient fine-tuning of language models.'},
 {id:'Agentic AI',group:0,x:11,y:42,description:'Coordinate tools and reasoning steps in AI workflows.'},
 {id:'Hybrid Retrieval',group:0,x:39,y:42,description:'Combine dense and sparse retrieval signals.'},
 {id:'Haystack',group:1,x:62,y:12,description:'Build and orchestrate retrieval-augmented AI pipelines.'},
 {id:'LangChain',group:1,x:90,y:12,description:'Compose applications using models, retrieval and tools.'},
 {id:'PyTorch',group:1,x:62,y:42,description:'Develop and evaluate deep-learning models.'},
 {id:'Hugging Face',group:1,x:90,y:42,description:'Work with models and machine-learning tooling.'},
 {id:'ChromaDB',group:2,x:11,y:62,description:'Store and retrieve vector embeddings.'},
 {id:'Ollama',group:2,x:39,y:62,description:'Run and experiment with language models locally.'},
 {id:'CUDA',group:2,x:11,y:91,description:'Accelerate compute-intensive model operations on GPUs.'},
 {id:'FastAPI',group:2,x:39,y:91,description:'Expose AI and backend services through Python APIs.'},
 {id:'Python',group:3,x:62,y:62,description:'Primary language for AI, data and backend systems.'},
 {id:'Java',group:3,x:90,y:62,description:'Backend development and microservice engineering.'},
 {id:'C++',group:3,x:76,y:91,description:'Systems programming and performance-oriented development.'}
];

export default function SkillsConstellation(){
 const [selected,setSelected]=useState('RAG');
 const chosen=nodes.find(node=>node.id===selected)||nodes[0];
 const group=skillGroups[chosen.group];
 return <details className="constellation" data-reveal="up">
  <summary className="constellation-header"><div><div className="constellation-eyebrow"><Network size={16}/> EXPLORE THE STACK</div><h3>Skills constellation</h3><p>Open the interactive map to explore how my technologies fit together.</p></div><span className="constellation-toggle" aria-hidden="true"><span>Explore map</span><ChevronDown size={19}/></span></summary>
  <div className="constellation-scroller" tabIndex={0} aria-label="Scrollable skills constellation">
   <div className="constellation-stage">
    <svg className="constellation-lines" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="constellation-stroke"><stop stopColor="var(--accent)"/><stop offset="1" stopColor="var(--accent2)"/></linearGradient></defs>
      <path className="constellation-bridge" d="M240 135 L760 135 L760 395 L240 395 Z M240 135 L760 395 M760 135 L240 395"/>
      {nodes.map(node=><line key={node.id} className={'constellation-link '+(chosen.group===node.group?'active':'')} x1={hubs[node.group].x*10} y1={hubs[node.group].y*5.2} x2={node.x*10} y2={node.y*5.2}/>)}
    </svg>
    {hubs.map((hub,i)=><div key={hub.label} className={'constellation-hub '+(chosen.group===i?'active':'')} style={{left:hub.x+'%',top:hub.y+'%'}} aria-hidden="true"><span className="constellation-hub-core"/><small>{hub.label}</small></div>)}
    {nodes.map(node=><button key={node.id} type="button" className={'constellation-node '+(selected===node.id?'selected':'')+(chosen.group===node.group?' related':'')} style={{left:node.x+'%',top:node.y+'%'}} aria-label={'Explore '+node.id} aria-pressed={selected===node.id} onClick={()=>setSelected(node.id)}><span className="constellation-node-dot"/><span>{node.id}</span></button>)}
   </div>
  </div>
  <div className="constellation-inspector" aria-live="polite"><div><span className="constellation-inspector-label">SELECTED TECHNOLOGY</span><h4>{chosen.id}</h4><p>{chosen.description}</p></div><div className="constellation-inspector-category"><span>{group.title}</span><ArrowUpRight size={17}/></div></div>
  <p className="constellation-footnote">A curated view of the stack. The complete skills list remains below. On smaller screens, swipe the map horizontally to explore.</p>
 </details>;
}
