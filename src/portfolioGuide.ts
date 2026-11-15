import {education,experience,projects,skillGroups} from './data';

export type GuideAnswer={text:string;href?:string;label?:string};
type Intent={id:string;phrases:string[];keywords:string[];answer:()=>GuideAnswer};

const job=experience[0];
const backend=experience[1];
const degree=education[0];
const projectNames=projects.map(project=>project.name).join(', ');
const allSkills=skillGroups.flatMap(group=>group.skills);

const intents:Intent[]=[
 {id:'greeting',phrases:['hello','hi','hey','good morning','good evening','good afternoon'],keywords:[],answer:()=>({text:"Hi! I'm DK-bot. I can help you explore Dhruv's experience, projects, technical skills, education, and contact details. What would you like to know?"})},
 {id:'personal_interests',phrases:['tell me more about him','tell me more about dhruv','more about him','more about dhruv','what are his hobbies','what does he do for fun','what does dhruv do for fun','outside of work','outside work','personal interests','his hobbies','his interests','sci-fi shows','science fiction shows','technology trends'],keywords:['hobbies','hobby','sci-fi','scifi'],answer:()=>({text:"Beyond AI engineering, Dhruv enjoys watching sci-fi shows, reading about the latest technology trends, and spending time outdoors getting some fresh air in nature.",href:'#about',label:'About Me'})},
 {id:'identity',phrases:['who is dhruv','tell me about dhruv','who are you','about him','about dhruv','introduce dhruv','tell me about yourself'],keywords:['background','introduction'],answer:()=>({text:"Dhruv Khurana is an AI Engineer working on generative AI and production software. His background combines AI systems with backend engineering.",href:'#about',label:'About Me'})},
 {id:'career_path',phrases:['career transition','career journey','career progression','from backend to ai','from java to ai','how did he get into ai','professional background'],keywords:['transition','journey'],answer:()=>({text:`Dhruv's published career spans backend engineering at ${backend.company}, an M.E. in Software Systems from BITS Pilani, and AI engineering at ${job.company}.`,href:'#experience',label:'Experience'})},
 {id:'rag',phrases:['rag','retrieval augmented generation','retrieval-augmented generation','hybrid retrieval','vector database','vector databases','dense search','sparse search','semantic search','reranking','reranker','chromadb','embedding','embeddings','haystack'],keywords:['retrieval','retriever'],answer:()=>({text:`At ${job.company}, Dhruv develops RAG workflows using Python, FastAPI, Haystack and LangChain. The work includes ChromaDB, dense/sparse retrieval, embeddings and reranking.`,href:'#experience',label:'Experience'})},
 {id:'agents',phrases:['agentic ai','ai agents','agent workflows','multi agent','multi-agent','agents','agentic workflows'],keywords:['agentic'],answer:()=>({text:`At ${job.company}, Dhruv develops multi-agent workflows as part of production Generative AI capabilities for Ovation Virtual Advisor.`,href:'#experience',label:'Experience'})},
 {id:'fine_tuning',phrases:['fine tuning','fine-tuning','fine tune','fine-tune','lora','model adaptation','llama 3.1','qwen3'],keywords:['finetuning','finetune'],answer:()=>({text:`His portfolio reports LoRA fine-tuning of Llama 3.1 70B and Qwen3 14B, with a 15% improvement on domain-specific evaluation performance.`,href:'#experience',label:'Experience'})},
 {id:'inference',phrases:['inference optimization','llama.cpp','ollama','cuda offloading','quantization','model serving','model routing','multi-model routing','local inference'],keywords:['inference','gpu','cuda'],answer:()=>({text:`Dhruv has profiled local LLM inference using Ollama and llama.cpp, covering CUDA offloading, quantization, and multi-model routing.`,href:'#experience',label:'Experience'})},
 {id:'llm',phrases:['llm','llms','large language model','large language models','language models','generative ai','genai','what ai does he work on'],keywords:['llm','llms'],answer:()=>({text:`His AI work includes RAG, multi-agent workflows, LoRA fine-tuning of Llama 3.1 70B and Qwen3 14B, and local inference profiling for production software.`,href:'#experience',label:'Experience'})},
 {id:'current',phrases:['current role','current job','where does dhruv work','where does he work','employer','emerson','ovation virtual advisor'],keywords:['currently'],answer:()=>({text:`The published portfolio lists ${job.role} at ${job.company} (${job.time}). ${job.summary}`,href:'#experience',label:'Experience'})},
 {id:'previous',phrases:['previous job','previous experience','global payments','java experience','backend experience','spring boot','prepaid card','prepaid-card'],keywords:['microservices','kafka','oracle','cassandra'],answer:()=>({text:`Dhruv worked as ${backend.role} at ${backend.company} (${backend.time}), building Java/Spring Boot REST APIs and microservices, working with Oracle and Cassandra, and using Kafka and JUnit.`,href:'#experience',label:'Experience'})},
 {id:'backend',phrases:['backend engineering','backend development','rest api','rest apis','api development','enterprise software','java backend'],keywords:['backend','spring'],answer:()=>({text:`His backend experience includes Java and Spring Boot REST APIs and microservices at ${backend.company}, with Oracle (PL/SQL), Cassandra, Kafka, and JUnit. FastAPI also appears in his current AI stack.`,href:'#experience',label:'Experience'})},
 {id:'experience',phrases:['work experience','professional experience','career history','employment history','employment experience','companies worked'],keywords:['experience','career','jobs'],answer:()=>({text:`The published portfolio lists ${job.role} at ${job.company} (${job.time}) and ${backend.role} at ${backend.company} (${backend.time}).`,href:'#experience',label:'Experience'})},
 {id:'deepfake',phrases:['deepfake detection','deepfake','faceforensics','faceforensics++','celeb-df','xception','clip model'],keywords:['deepfake'],answer:()=>({text:`${projects[0].name}: ${projects[0].text}`,href:'#projects',label:'Projects'})},
 {id:'plantspector',phrases:['plantspector','plant disease','plant detection','super resolution','super-resolution','resnet-50','edsr'],keywords:['plants','agriculture'],answer:()=>({text:`${projects[1].name}: ${projects[1].text}`,href:'#projects',label:'Projects'})},
 {id:'medpred',phrases:['medpred','drug prediction','drug recommendation','medicine prediction','decision tree','lightgbm'],keywords:['medpred'],answer:()=>({text:`${projects[2].name}: ${projects[2].text}`,href:projects[2].url||'#projects',label:projects[2].url?'View MedPred repository':'Projects'})},
 {id:'computer_vision',phrases:['computer vision','image processing','image recognition','deep learning projects','vision models'],keywords:['vision','images'],answer:()=>({text:`His computer-vision projects include ${projects[0].name} (Xception and CLIP) and ${projects[1].name} (ResNet-50 and EDSR for plant disease detection and image super-resolution).`,href:'#projects',label:'Projects'})},
 {id:'projects',phrases:['what projects','his projects','featured projects','portfolio projects','what has he built','show me projects','project list'],keywords:['projects','project'],answer:()=>({text:`Featured projects: ${projectNames}. They cover deepfake detection, plant disease detection and image super-resolution, and a machine-learning drug recommendation application.`,href:'#projects',label:'Projects'})},
 {id:'education',phrases:['where did he study','where did dhruv study','bits pilani','master of engineering','software systems','education','university','degree','masters degree'],keywords:['college','masters','graduate','graduated'],answer:()=>({text:`${degree.degree} from ${degree.school} (${degree.time}). ${degree.result}.`,href:'#education',label:'Education'})},
 {id:'cgpa',phrases:['cgpa','grade point','academic score','academic result','academic performance'],keywords:['grades'],answer:()=>({text:`The portfolio lists ${degree.result} for his ${degree.degree} at ${degree.school}.`,href:'#education',label:'Education'})},
 {id:'certification',phrases:['certification','aws certified','cloud practitioner','certificates','aws certification'],keywords:['certificate','certified'],answer:()=>({text:'The portfolio lists the AWS Certified Cloud Practitioner certification.',href:'#education',label:'Education'})},
 {id:'python',phrases:['python experience','python skills','does he know python','python developer','python programming'],keywords:['python'],answer:()=>({text:`Python is part of Dhruv's current AI engineering stack, including RAG and agent workflows with FastAPI and Haystack. It is also used in the featured ML projects.`,href:'#skills',label:'Technical Skills'})},
 {id:'frameworks',phrases:['ml frameworks','ai frameworks','machine learning frameworks','pytorch','tensorflow','hugging face','scikit-learn','numpy','pandas'],keywords:['frameworks','libraries'],answer:()=>({text:`The published Frameworks & ML skills include: ${skillGroups[1].skills.join(', ')}.`,href:'#skills',label:'Technical Skills'})},
 {id:'cloud',phrases:['cloud experience','cloud platforms','cloud computing','aws and azure','azure','docker','mlops','devops'],keywords:['cloud','deployment'],answer:()=>({text:`His Systems & Tools skills list AWS, Azure, Docker and MLOps. He also lists an AWS Certified Cloud Practitioner credential. The portfolio does not specify individual cloud deployment projects.`,href:'#skills',label:'Technical Skills'})},
 {id:'languages',phrases:['programming languages','coding languages','languages he knows','does he know java','does he know c++'],keywords:['languages'],answer:()=>({text:`Programming languages listed in the portfolio: ${skillGroups[3].skills.join(', ')}.`,href:'#skills',label:'Technical Skills'})},
 {id:'skills',phrases:['technical skills','tech stack','technologies','which skills','what skills','toolkit','what technologies does he use'],keywords:['skills','stack','tools'],answer:()=>({text:`The portfolio lists ${allSkills.length} skill entries across AI & Language Models, Frameworks & ML, Systems & Tools, and Languages. Examples include Python, RAG, LoRA, Haystack, PyTorch, ChromaDB, FastAPI, CUDA, and Java.`,href:'#skills',label:'Technical Skills'})},
 {id:'location',phrases:['where is dhruv based','location','where are you based','where is he based','which city'],keywords:['delhi','noida'],answer:()=>({text:'Dhruv is based in Delhi, India. The roles listed in the portfolio are based in Noida, India.',href:'#about',label:'About Me'})},
 {id:'github',phrases:['github profile','github link','source code','where is the code','repositories','github repositories'],keywords:['github'],answer:()=>({text:'You can explore Dhruv’s public repositories on GitHub. MedPred also has a direct repository link from the Projects section.',href:'https://github.com/DKg156',label:'Visit GitHub'})},
 {id:'linkedin',phrases:['linkedin profile','linkedin link','professional profile'],keywords:['linkedin'],answer:()=>({text:'Dhruv’s LinkedIn profile is linked from this portfolio. You can use it to view his professional profile or connect with him.',href:'https://www.linkedin.com/in/dhruv156',label:'Open LinkedIn'})},
 {id:'contact',phrases:['how to contact','contact dhruv','get in touch','contact information','email address','recruiter','hire','hiring inquiry','reach out','work together','collaborate'],keywords:['contact','email','reach','connect'],answer:()=>({text:'For hiring inquiries, professional opportunities, or collaborations, use the email or LinkedIn links in the Contact section.',href:'#contact',label:'Contact Me'})},
 {id:'thanks',phrases:['thank you','thanks','thank you dk-bot','bye','goodbye'],keywords:[],answer:()=>({text:"You're welcome! You can explore the portfolio sections or reach out through the Contact section.",href:'#contact',label:'Contact Me'})}
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
