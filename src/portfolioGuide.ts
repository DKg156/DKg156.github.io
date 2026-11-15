import {education,experience,projects,skillGroups} from './data';

export type GuideAnswer={text:string;href?:string;label?:string};
type Intent={id:string;phrases:string[];keywords:string[];answer:()=>GuideAnswer};

const job=experience[0];
const backend=experience[1];
const degree=education[0];
const projectNames=projects.map(project=>project.name).join(', ');
const allSkills=skillGroups.flatMap(group=>group.skills);

const intents:Intent[]=[
 {id:'greeting',phrases:['hello','hi','hey','good morning','good evening'],keywords:[],answer:()=>({text:"Hi! I'm a rule-based portfolio guide. Ask about experience, projects, technical skills, education, or how to get in touch."})},
 {id:'identity',phrases:['who is dhruv','tell me about dhruv','who are you','about him','about dhruv'],keywords:['background','introduction'],answer:()=>({text:"Dhruv Khurana is an AI Engineer working on generative AI and production software. His background combines AI systems with backend engineering.",href:'#about',label:'About Me'})},
 {id:'rag',phrases:['rag','retrieval augmented generation','retrieval-augmented generation','hybrid retrieval','vector database'],keywords:['retrieval','retriever','reranking','reranker','chromadb','embedding','embeddings','haystack'],answer:()=>({text:`At ${job.company}, Dhruv works on RAG and multi-agent workflows with Python, FastAPI, Haystack, and LangChain. His portfolio describes ChromaDB, dense/sparse retrieval, embeddings, and reranking.`,href:'#experience',label:'Experience'})},
 {id:'llm',phrases:['llm','large language model','large language models','fine tuning','fine-tuning','lora','llama','qwen','ollama','inference optimization'],keywords:['inference','quantization','cuda','model','models','gpu'],answer:()=>({text:"Dhruv's portfolio describes LoRA fine-tuning of Llama 3.1 70B and Qwen3 14B, plus inference profiling using Ollama, llama.cpp, CUDA offloading, quantization and multi-model routing.",href:'#experience',label:'Experience'})},
 {id:'current',phrases:['current role','current job','where does dhruv work','where does he work','employer','emerson'],keywords:['currently','working','company'],answer:()=>({text:`${job.role} at ${job.company} (${job.time}). ${job.summary}`,href:'#experience',label:'Experience'})},
 {id:'previous',phrases:['previous job','previous experience','global payments','java experience','backend experience','spring boot'],keywords:['backend','microservices','kafka','oracle','cassandra'],answer:()=>({text:`Dhruv previously worked as ${backend.role} at ${backend.company} (${backend.time}). His work included Java/Spring Boot APIs, microservices, Oracle, Cassandra, Kafka and JUnit.`,href:'#experience',label:'Experience'})},
 {id:'experience',phrases:['work experience','professional experience','career history','employment history'],keywords:['experience','career','jobs'],answer:()=>({text:`The portfolio lists two professional roles: ${job.role} at ${job.company} (${job.time}), and ${backend.role} at ${backend.company} (${backend.time}).`,href:'#experience',label:'Experience'})},
 {id:'deepfake',phrases:['deepfake detection','deepfake','faceforensics','celeb-df','xception','clip'],keywords:['deepfake'],answer:()=>({text:projects[0].text,href:'#projects',label:'Projects'})},
 {id:'plantspector',phrases:['plantspector','plant disease','super resolution','resnet','edsr'],keywords:['plants','agriculture'],answer:()=>({text:projects[1].text,href:'#projects',label:'Projects'})},
 {id:'medpred',phrases:['medpred','drug prediction','drug recommendation','lightgbm'],keywords:['medpred'],answer:()=>({text:projects[2].text,href:projects[2].url||'#projects',label:projects[2].url?'View MedPred repository':'Projects'})},
 {id:'projects',phrases:['what projects','his projects','featured projects','portfolio projects'],keywords:['project','projects','built','portfolio'],answer:()=>({text:`Featured projects: ${projectNames}. They cover deepfake detection, plant disease detection/image super-resolution and a machine-learning drug recommendation application.`,href:'#projects',label:'Projects'})},
 {id:'education',phrases:['where did he study','where did dhruv study','bits pilani','master of engineering','software systems','education','university','degree'],keywords:['college','masters','cgpa','graduate','graduated'],answer:()=>({text:`${degree.degree} from ${degree.school} (${degree.time}). ${degree.result}.`,href:'#education',label:'Education'})},
 {id:'skills',phrases:['technical skills','tech stack','technologies','programming languages','which skills','what skills'],keywords:['skills','stack','languages','tools','frameworks'],answer:()=>({text:`The portfolio lists ${allSkills.length} technologies across AI & Language Models, Frameworks & ML, Systems & Tools, and Languages. Examples include Python, RAG, LoRA, Haystack, PyTorch, ChromaDB, FastAPI, CUDA, and Java.`,href:'#skills',label:'Technical Skills'})},
 {id:'certification',phrases:['certification','aws certified','cloud practitioner','certificates'],keywords:['certificate','certified'],answer:()=>({text:'The portfolio lists the AWS Certified Cloud Practitioner certification.',href:'#education',label:'Education'})},
 {id:'location',phrases:['where is dhruv based','location','where are you based','where is he based'],keywords:['delhi','noida','india','based'],answer:()=>({text:'Dhruv is based in Delhi, India. The positions listed in the portfolio were based in Noida, India.',href:'#about',label:'About Me'})},
 {id:'contact',phrases:['how to contact','contact dhruv','get in touch','contact information','email address','recruiter','hire'],keywords:['contact','email','reach','linkedin','connect','message'],answer:()=>({text:'You can reach Dhruv through the email and LinkedIn links on the Contact section of this portfolio.',href:'#contact',label:'Contact Me'})}
];

const normalize=(input:string)=>input.toLowerCase().normalize('NFKC').replace(/[^a-z0-9+.#\s-]/g,' ').replace(/\s+/g,' ').trim();
const includesPhrase=(query:string,phrase:string)=>(' '+query+' ').includes(' '+phrase+' ');
const generic=new Set(['what','how','tell','about','does','have','his','the','can','you','me','dhruv','he','is','of','are','a','in','with']);
export const guideSuggestions=[
 'What is his RAG experience?',
 'Which projects has he built?',
 'What technologies does he use?',
 'Where did he study?',
 'How can I contact him?'
];

export function answerPortfolioQuestion(input:string):GuideAnswer{
 const query=normalize(input).slice(0,500);
 if(!query)return {text:'Type a question or choose one of the suggestions below.'};
 // Avoid making claims about facts not present in the public portfolio.
 if(['salary','compensation','ctc','phone','mobile number','age','relationship','notice period','availability','personal life','home address'].some(phrase=>includesPhrase(query,phrase))){
  return {text:"That information isn't published on this portfolio. For professional inquiries, please use the contact links.",href:'#contact',label:'Contact Me'};
 }
 let best:Intent|undefined;
 let highScore=0;
 for(const intent of intents){
   let score=0;
   for(const phrase of intent.phrases){
     const p=normalize(phrase);
     if(includesPhrase(query,p))score+=p.includes(' ')?7:4;
   }
   for(const word of intent.keywords){
     const w=normalize(word);
     if(includesPhrase(query,w)&&!generic.has(w))score+=2;
   }
   if(score>highScore){best=intent;highScore=score;}
 }
 if(!best||highScore<2){
  return {text:"I don't have a reliable answer to that in the published portfolio. Try asking about experience, RAG, skills, projects, education, or contact details.",href:'#contact',label:'Contact Me'};
 }
 return best.answer();
}
