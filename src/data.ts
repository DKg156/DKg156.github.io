export const experience = [
  {company:'Emerson',role:'AI Engineer',time:'Apr 2026 — Present',where:'Noida, India',summary:'Building production-grade Generative AI capabilities for Ovation Virtual Advisor.',points:['Developing RAG and multi-agent workflows with Python, FastAPI, Haystack and LangChain.','Fine-tuned Llama 3.1 70B and Qwen3 14B using LoRA, improving domain-specific evaluation performance by 15%.','Building hybrid retrieval with ChromaDB, dense and sparse search, embeddings and reranking.','Profiling local inference with Ollama, llama.cpp, CUDA offloading, quantization and multi-model routing.'],tags:['Generative AI','RAG','Python','Haystack','LLMs']},
  {company:'Global Payments Inc.',role:'Associate Software Engineer',time:'Jul 2022 — Jul 2023',where:'Noida, India',summary:'Backend engineering for enterprise prepaid-card platforms.',points:['Developed REST APIs and microservices using Java and Spring Boot.','Integrated systems with Oracle (PL/SQL) and Cassandra.','Implemented Apache Kafka for internal data migration and wrote JUnit tests.'],tags:['Java','Spring Boot','Kafka','Oracle','Cassandra']}
];
export const education = [
  {school:'Birla Institute of Technology and Science, Pilani — Pilani Campus',degree:'Master of Engineering · Software Systems',time:'2023 — 2025',result:'CGPA 8.04 / 10',location:'Pilani, Rajasthan'}
];
export const projects = [
  {number:'01',name:'SHL Recommendation System',type:'Generative AI / Semantic recommendation',text:'A RAG-based assessment recommender for hiring queries, job descriptions and JD URLs, combining Sentence Transformer embeddings, FAISS retrieval, Gemini Flash reranking and balanced top-K results.',tags:['Python','RAG','FAISS','Gemini Flash','FastAPI'],category:'Generative AI',color:'purple',image:'/assets/images/projects/shl-rag.svg',imageAlt:'RAG workflow: job description, vector retrieval, AI reranking and recommended SHL assessments',url:''},
  {number:'02',name:'Deepfake Detection',type:'Computer vision / Deep learning',text:'A deepfake detection system using Xception and CLIP, trained and validated on FaceForensics++ and Celeb-DF to compare visual representations.',tags:['Python','Xception','CLIP','Computer Vision'],category:'Computer Vision',color:'blue',image:'/assets/images/projects/deepfake-ai.svg',imageAlt:'Split authentic and synthetic face with AI detection scanning graphics',url:''},
  {number:'03',name:'Plantspector',type:'Deep learning / Computer vision',text:'Plant disease detection and image super-resolution with ResNet-50 and EDSR, designed to extract information from low-resolution plant images.',tags:['Python','ResNet-50','EDSR','Deep Learning'],category:'Computer Vision',color:'green',image:'/assets/images/projects/plantspector-cnn.svg',imageAlt:'Plant leaf being analyzed through convolutional neural network feature maps',url:''}
];
export const skillGroups = [
  {title:'AI & Language Models',skills:['Generative AI','RAG','Agentic AI','LLM Fine-tuning','LoRA','Embeddings','Hybrid Retrieval','Reranking','Model Evaluation']},
  {title:'Frameworks & ML',skills:['Haystack','LangChain','PyTorch','TensorFlow','Hugging Face','Scikit-learn','NumPy','Pandas']},
  {title:'Systems & Tools',skills:['FastAPI','ChromaDB','FAISS','Ollama','llama.cpp','CUDA','Docker','Azure','AWS','Git','REST APIs','MLOps']},
  {title:'Languages',skills:['Python','Java','C++']}
];
