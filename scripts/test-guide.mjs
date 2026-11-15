import assert from 'node:assert/strict';
import {createServer} from 'vite';

// Use Vite's SSR loader to test exactly the TypeScript module shipped by the site.
// No additional testing dependencies or browser APIs are required.
const vite=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'error'});
try {
 const {answerPortfolioQuestion}=await vite.ssrLoadModule('/src/portfolioGuide.ts');
 const cases=[
  ['hi','DK-bot'],
  ['what can you do','experience'],
  ['what are his hobbies','sci-fi'],
  ['what is he doing currently','Ovation Virtual Advisor'],
  ['what is Dhruv working on','Emerson'],
  ['what does he like to do','fresh air'],
  ['what does Dhruv enjoy doing','sci-fi'],
  ['why should we hire Dhruv','LoRA'],
  ['what makes him a good AI Engineer','backend'],
  ['what are his strongest technical skills','retrieval'],
  ['does he have production AI experience','Ovation Virtual Advisor'],
  ['what measurable impact has he delivered','15%'],
  ['is he a good fit for this role','job description'],
  ['where is his resume','not linked'],
  ['has he published research papers','does not list'],
  ['what datasets has he worked with','FaceForensics++'],
  ['what is his experience with LLM evaluation','15%'],
  ['which project best demonstrates his AI skills','computer vision'],
  ['which projects use deep learning','ResNet-50'],
  ['can I view project code','MedPred'],
  ['summarize his portfolio','BITS Pilani'],
  ['explain his work simply','AI systems'],
  ['are you an LLM','predefined'],
  ['what motivates him','does not include'],
  ['what challenges did he solve','not a detailed account'],
  ['take me to education','#education'],
  ['go to skills','#skills'],
  ['take me to projects','#projects'],
  ['what is his RAG experience','ChromaDB'],
  ['tell me about Plantspector','ResNet-50'],
  ['tell me about MedPred','LightGBM'],
  ['how can I contact him','Contact'],
  ['what is his CGPA','8.04'],
  ['what cloud platforms does he know','Azure'],
  ['what languages does he know','Python'],
  ['tell me more about him','fresh air']
 ];
 for(const [question,expected] of cases){
  const answer=answerPortfolioQuestion(question);
  const actual=answer.text+' '+(answer.href||'');
  assert.ok(actual.toLowerCase().includes(expected.toLowerCase()),`Incorrect answer to "${question}": ${actual}`);
 }
 const plant=answerPortfolioQuestion('tell me about Plantspector');
 assert.equal(plant.topic,'project:1');
 const follow=answerPortfolioQuestion('What models did he use?',plant.topic);
 assert.match(follow.text,/ResNet-50/);
 assert.match(follow.text,/EDSR/);
 assert.equal(follow.topic,plant.topic);
 assert.match(answerPortfolioQuestion('What dataset did he use?',plant.topic).text,/does not name a specific dataset/);
 const deepfake=answerPortfolioQuestion('tell me about Deepfake Detection');
 assert.match(answerPortfolioQuestion('What datasets did he use?',deepfake.topic).text,/Celeb-DF/);
 const med=answerPortfolioQuestion('tell me about MedPred');
 assert.match(answerPortfolioQuestion('where is the code',med.topic).href,/github.com/);
 assert.match(answerPortfolioQuestion('where is the code',plant.topic).text,/does not link/);
 assert.equal(answerPortfolioQuestion('what models did he use').topic,undefined);
 const unknown=answerPortfolioQuestion('can you predict tomorrow\'s weather');
 assert.match(unknown.text,/don't have a reliable answer/);
 for(const question of ['what is his salary','what is his phone number','is he available','what is his home address']){
  assert.match(answerPortfolioQuestion(question).text,/isn't published/);
 }
 // Specific technical questions must not be hijacked by the last project.
 assert.match(answerPortfolioQuestion('tell me about RAG',plant.topic).text,/ChromaDB/);
 console.log(`DK-bot Q&A regression suite passed: ${cases.length} direct questions plus context, fallback and privacy checks.`);
}finally{
 await vite.close();
}
