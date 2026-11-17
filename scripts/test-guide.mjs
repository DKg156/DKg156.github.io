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
  ['where is his resume','not available'],
  ['resume','not available'],
  ['can I see his resume','not available'],
  ['show me his CV','not available'],
  ['download résumé','not available'],
  ['where can I download the curriculum vitae','not available'],
  ['tell me about his resume','not available'],
  ['what projects are in his resume','Projects section'],
  ['what skills are on his resume','Technical Skills'],
  ['what education is on his resume','Education section'],
  ['what experience is in his resume','Experience section'],
  ['what certification is on his resume','AWS Cloud Practitioner'],
  ['has he published research papers','does not list'],
  ['what datasets has he worked with','FaceForensics++'],
  ['what is his experience with LLM evaluation','15%'],
  ['which project best demonstrates his AI skills','computer vision'],
  ['which projects use deep learning','ResNet-50'],
  ['can I view project code','GitHub'],
  ['summarize his portfolio','BITS Pilani'],
  ['explain his work simply','AI systems'],
  ['are you an LLM','predefined'],
  ['what motivates him','does not include'],
  ['what challenges did he solve','not a detailed account'],
  ['take me to education','#education'],
  ['go to skills','#skills'],
  ['take me to projects','#projects'],
  ['what is his RAG experience','ChromaDB'],
  ['tell me about SHL Recommendation System','FAISS'],
  ['tell me about Plantspector','ResNet-50'],
  ['tell me about Deepfake Detection','Xception'],
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
 const resumeRoutes=[
  ['resume','#contact'],
  ['Can I see his CV?','#contact'],
  ['download résumé','#contact'],
  ['tell me about his resume','#contact'],
  ['what projects are in his resume','#projects'],
  ['what skills are on his resume','#skills'],
  ['what education is on his resume','#education'],
  ['what experience is in his resume','#experience'],
  ['what certification is on his resume','#education']
 ];
 for(const [question,expectedHref] of resumeRoutes){
  const answer=answerPortfolioQuestion(question);
  assert.equal(answer.href,expectedHref,`Incorrect portfolio destination for "${question}"`);
  assert.doesNotMatch(answer.text+' '+(answer.href||''),/\.pdf|open resume|resume button/i);
 }
 assert.doesNotMatch(answerPortfolioQuestion('what projects has he built').text,/MedPred/);
 const plant=answerPortfolioQuestion('tell me about Plantspector');
 assert.equal(plant.topic,'project:2');
 const follow=answerPortfolioQuestion('What models did he use?',plant.topic);
 assert.match(follow.text,/ResNet-50/);
 assert.match(follow.text,/EDSR/);
 assert.equal(follow.topic,plant.topic);
 assert.match(answerPortfolioQuestion('What dataset did he use?',plant.topic).text,/does not name a specific dataset/);
 const deepfake=answerPortfolioQuestion('tell me about Deepfake Detection');
 assert.match(answerPortfolioQuestion('What datasets did he use?',deepfake.topic).text,/Celeb-DF/);
 const shl=answerPortfolioQuestion('tell me about SHL Recommendation System');
 assert.equal(shl.topic,'project:0');
 assert.match(answerPortfolioQuestion('what models did he use',shl.topic).text,/Gemini Flash/);
 assert.match(answerPortfolioQuestion('where is the code',shl.topic).text,/does not link/);
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
