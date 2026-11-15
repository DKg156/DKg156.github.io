import {education,experience,projects,skillGroups} from './data';

export type GuideAnswer={text:string;href?:string;label?:string;topic?:string};
type Intent={id:string;phrases:string[];keywords:string[];answer:()=>GuideAnswer};

const job=experience[0];
const backend=experience[1];
const degree=education[0];
const projectNames=projects.map(project=>project.name).join(', ');
const allSkills=skillGroups.flatMap(group=>group.skills);

const intents:Intent[]=[
 {id:'greeting',phrases:['hello','hi','hey','good morning','good evening','good afternoon'],keywords:[],answer:()=>({text:"Hi! I'm DK-bot. I can help you explore Dhruv's experience, projects, technical skills, education, and contact details. What would you like to know?"})},
 {id:'personal_interests',phrases:['tell me more about him','tell me more about dhruv','more about him','more about dhruv','what are his hobbies','what does he do for fun','what does dhruv do for fun','outside of work','outside work','personal interests','his hobbies','his interests','sci-fi shows','science fiction shows','technology trends'],keywords:['hobbies','hobby','sci-fi','scifi'],answer:()=>({text:"Beyond AI engineering, Dhruv enjoys watching sci-fi shows, reading about the latest technology trends, and spending time outdoors getting some fresh air.",href:'#about',label:'About Me'})},
 {id:'capabilities',phrases:['what can you do','what do you do','how can you help','how can you help me','what can i ask','what can i ask you','what can i ask about','what questions can i ask','what do you know','what are your capabilities','what can dk-bot do','help me explore','help menu'],keywords:['capabilities'],answer:()=>({text:"I can help you learn about Dhruv's AI and software engineering experience, projects, technical skills, education, career background, hobbies, and ways to contact him. Try asking about his RAG work, a specific project, his tech stack, or what he enjoys outside work.",href:'#about',label:'Explore portfolio'})},
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

 {id:'hiring_case',phrases:['why should we hire dhruv','why hire dhruv','why should i hire him','why should we hire him','what makes him a good ai engineer','why is he a good fit','why should i consider him','what makes dhruv stand out'],keywords:[],answer:()=>({text:`Dhruv's portfolio provides evidence of both AI and backend engineering: production-focused RAG and agent workflows at ${job.company}, LoRA fine-tuning with a reported 15% evaluation improvement, and Java/Spring Boot services at ${backend.company}. Role fit depends on the job requirements, so the portfolio and a technical discussion are the best next steps.`,href:'#experience',label:'View experience'})},
 {id:'strengths',phrases:['what are his strongest technical skills','strongest technical skills','greatest strengths','top strengths','key strengths','core strengths','what is he best at','what does he specialize in','technical specialties'],keywords:[],answer:()=>({text:'The clearest specialties shown in the portfolio are RAG and retrieval design, LLM fine-tuning and inference tooling, multi-agent workflows, and backend API development. These are areas of documented experience rather than independently assessed rankings.',href:'#skills',label:'Technical Skills'})},
 {id:'production_ai',phrases:['production ai experience','production ai','production systems','production grade ai','production-grade ai','real world ai','real-world ai','enterprise ai experience','has he built ai applications'],keywords:[],answer:()=>({text:`The portfolio describes work on production-grade Generative AI capabilities for ${job.company}'s Ovation Virtual Advisor, including RAG, multi-agent workflows, and inference profiling. It does not publish service-level metrics or deployment architecture.`,href:'#experience',label:'Experience'})},
 {id:'measurable_impact',phrases:['measurable impact','measurable results','quantified impact','what impact','what achievements','key achievements','performance improvement','15 percent improvement','15% improvement'],keywords:[],answer:()=>({text:'The portfolio reports a 15% improvement in domain-specific evaluation performance from LoRA fine-tuning of Llama 3.1 70B and Qwen3 14B. It does not publish a detailed evaluation protocol or other quantified business outcomes.',href:'#experience',label:'Experience'})},
 {id:'role_fit',phrases:['fit for our role','fit for this role','fit for the job','match for our team','suitable for ai engineer','is he suitable','can he do this job','can you evaluate his fit'],keywords:[],answer:()=>({text:'I can summarize relevant experience, but cannot evaluate fit without a job description. The portfolio documents RAG, fine-tuning, agents, backend APIs and AI tooling. Please compare those with your requirements and contact Dhruv for a technical discussion.',href:'#contact',label:'Contact Me'})},
 {id:'resume',phrases:['resume download','download resume','his resume','his cv','download cv','curriculum vitae','where is his resume'],keywords:[],answer:()=>({text:'A downloadable résumé is not linked in the published portfolio information I use. For an up-to-date résumé, please contact Dhruv through email or LinkedIn.',href:'#contact',label:'Contact Me'})},
 {id:'research_publications',phrases:['research papers','published research','research publications','has he published','publications','academic papers','journal papers'],keywords:[],answer:()=>({text:'The portfolio describes a master’s degree and machine-learning projects, but does not list any published research papers. It would be inaccurate to claim publications without a source.',href:'#education',label:'Education'})},
 {id:'datasets',phrases:['what datasets','which datasets','training datasets','data sets','datasets used','datasets has he worked with','faceforensics++ dataset','celeb-df dataset'],keywords:[],answer:()=>({text:'The Deepfake Detection project explicitly names FaceForensics++ and Celeb-DF as training/validation datasets. The portfolio does not name datasets for Plantspector or MedPred.',href:'#projects',label:'Projects'})},
 {id:'model_evaluation',phrases:['llm evaluation','model evaluation','evaluate models','evaluation metrics','evaluation performance','how did he evaluate','testing ai models','benchmarking models'],keywords:[],answer:()=>({text:'The portfolio reports a 15% improvement in domain-specific evaluation performance after LoRA fine-tuning. Specific benchmark names, sample sizes and evaluation methods are not published.',href:'#experience',label:'Experience'})},
 {id:'project_evidence',phrases:['best project','strongest project','which project best','most relevant project','project showcases ai','which project demonstrates ai'],keywords:[],answer:()=>({text:'For computer vision, Deepfake Detection uses Xception and CLIP, and Plantspector combines ResNet-50 with EDSR. MedPred demonstrates a Python-based ML application with Decision Tree and LightGBM. Which is most relevant depends on the role.',href:'#projects',label:'Projects'})},
 {id:'project_tech',phrases:['technologies used in projects','project technologies','models used in projects','project tech stack','which projects use deep learning','projects with deep learning'],keywords:[],answer:()=>({text:'Deepfake Detection uses Xception and CLIP; Plantspector uses ResNet-50 and EDSR; MedPred uses Decision Tree and LightGBM. All three list Python.',href:'#projects',label:'Projects'})},
 {id:'project_code',phrases:['can i view project code','project source code','source code for projects','project repositories','view code for projects','show project github'],keywords:[],answer:()=>({text:'The portfolio provides a direct GitHub repository link for MedPred. Deepfake Detection and Plantspector do not currently list individual repository links. You can also browse Dhruv’s public GitHub profile.',href:'#projects',label:'View Projects'})},
 {id:'quick_summary',phrases:['summarize his portfolio','summary of portfolio','quick summary','quick introduction','give me an overview','give me a summary','summarize dhruv','in a nutshell'],keywords:[],answer:()=>({text:`Dhruv is an AI Engineer at ${job.company} with prior Java/Spring Boot backend experience at ${backend.company} and an M.E. in Software Systems from BITS Pilani. His work includes RAG, agent workflows, fine-tuning and inference; his projects cover deepfake detection, plant imagery and drug recommendation.`,href:'#about',label:'About Me'})},
 {id:'simple_explanation',phrases:['explain his work simply','explain his experience simply','in simple terms','explain in simple words','what does his work mean','non technical explanation','non-technical explanation'],keywords:[],answer:()=>({text:'Dhruv builds software that helps AI systems find useful information, use language models and support real applications. He also has a background in building reliable backend services.',href:'#about',label:'About Me'})},
 {id:'bot_identity',phrases:['what is dk-bot','are you an ai','are you a real ai','are you a human','are you a chatbot','are you an llm','how do you work'],keywords:[],answer:()=>({text:'I’m DK-bot, a portfolio assistant that answers a set of predefined questions using information about Dhruv and links to relevant sections. I do not generate open-ended answers or access private records.',href:'#about',label:'Explore portfolio'})},
 {id:'navigation',phrases:['website navigation','navigate portfolio','find sections','where are the sections'],keywords:[],answer:()=>({text:'Use the navigation bar to jump to About, Experience, Projects, Skills, Education or Contact. You can also ask me for a specific section.',href:'#about',label:'Explore portfolio'})},
 {id:'motivation',phrases:['what motivates him','why does he work in ai','why is he interested in ai','what drives him','passion for ai'],keywords:[],answer:()=>({text:'His portfolio emphasizes connecting modern AI research with dependable software engineering and building practical applications. It does not include a detailed personal account of his motivations.',href:'#about',label:'About Me'})},
 {id:'project_challenges',phrases:['project challenges','biggest challenge','challenges did he solve','technical challenges','hardest problem he solved'],keywords:[],answer:()=>({text:'The portfolio describes project goals and technologies, but not a detailed account of obstacles or debugging decisions. You can read the project descriptions and contact Dhruv to discuss implementation challenges.',href:'#projects',label:'Projects'})},
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

// Only explicit, short follow-up questions inherit the last project topic.
function projectFollowup(query:string,previousTopic?:string):GuideAnswer|undefined{
 if(!previousTopic?.startsWith('project:'))return;
 const index=Number(previousTopic.slice('project:'.length));
 const project=projects[index];
 if(!project)return;
 const followup=(parts:string[])=>parts.some(part=>includesPhrase(query,part));
 if(followup(['what models did he use','which models did he use','what models were used','what technologies were used','what tech was used','which algorithms','which models','what tech stack did it use'])){
  return {text:`${project.name} uses ${project.tags.join(', ')}. ${project.text}`,href:'#projects',label:'Projects',topic:previousTopic};
 }
 if(followup(['what dataset did he use','what datasets did he use','which datasets','what dataset','what data did it use'])){
  return {text:index===0?'The Deepfake Detection project used FaceForensics++ and Celeb-DF.':`The published ${project.name} description does not name a specific dataset.`,href:'#projects',label:'Projects',topic:previousTopic};
 }
 if(followup(['where is the code','show me the code','can i see the code','is the code available','github link for it'])){
  return {text:project.url?`The ${project.name} repository is linked below.`:`The published portfolio does not link a dedicated repository for ${project.name}.`,href:project.url||'#projects',label:project.url?'View repository':'Projects',topic:previousTopic};
 }
 if(followup(['tell me more about it','explain that project','what does it do','how does it work'])){
  return {text:`${project.name}: ${project.text}`,href:'#projects',label:'Projects',topic:previousTopic};
 }
}

export function answerPortfolioQuestion(input:string,previousTopic?:string):GuideAnswer{
 const query=normalize(input).slice(0,500);
 if(!query)return {text:'Type a question or choose one of the suggestions below.'};
 // Avoid making claims about facts not present in the public portfolio.
 if(['salary','compensation','ctc','phone','mobile number','age','relationship','notice period','availability','is he available','when can he join','joining date','start date','personal life','home address'].some(phrase=>includesPhrase(query,phrase))){
  return {text:"That information isn't published on this portfolio. For professional inquiries, please use the contact links.",href:'#contact',label:'Contact Me'};
 }
 // Direct navigation maps destinations to their actual anchors.
 const destinations=[
  {name:'Projects',href:'#projects',phrases:['take me to projects','go to projects','where are the projects','show projects section']},
  {name:'Technical Skills',href:'#skills',phrases:['take me to skills','go to skills','show skills section']},
  {name:'Education',href:'#education',phrases:['take me to education','go to education','show education section']},
  {name:'Experience',href:'#experience',phrases:['take me to experience','show experience section','go to experience']},
  {name:'Contact Me',href:'#contact',phrases:['where is the contact section','go to contact','take me to contact']}
 ];
 for(const destination of destinations){
  if(destination.phrases.some(phrase=>includesPhrase(query,phrase))){
   return {text:`Here is the ${destination.name} section.`,href:destination.href,label:destination.name};
  }
 }
 const contextual=projectFollowup(query,previousTopic);
 if(contextual)return contextual;
 let best:Intent|undefined;
 let highScore=0;
 for(const intent of intents){
   let score=0;
   for(const phrase of intent.phrases){
     const p=normalize(phrase);
     if(query===p)score+=20;
     else if(includesPhrase(query,p))score+=p.includes(' ')?7:4;
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
 const answer=best.answer();
 const projectId=['deepfake','plantspector','medpred'].indexOf(best.id);
 return projectId>=0?{...answer,topic:'project:'+projectId}:answer;
}
