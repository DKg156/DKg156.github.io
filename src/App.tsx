import {useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowUp,ArrowUpRight,BrainCircuit,BriefcaseBusiness,Check,ChevronRight,Code2,ExternalLink,Github,GraduationCap,Layers3,Linkedin,Mail,MapPin,Menu,Moon,Search,Sun,X} from 'lucide-react';
import {education,experience,projects,skillGroups} from './data';
import SkillsConstellation from './SkillsConstellation';
import PortfolioGuide from './PortfolioGuide';
import ChipDivider from './ChipDivider';
import useCardDeck from './useCardDeck';

const nav=['Home','About','Experience','Projects','Skills','Education','Contact'];
const email='dhruvkhuranag156@gmail.com';
const quickActions=[
 ...nav.map((label)=>({label:'Go to '+label,detail:'Navigate to section',keywords:label.toLowerCase()+' section',href:'#'+label.toLowerCase(),external:false})),
 {label:'View GitHub',detail:'Projects and code',keywords:'repositories github code',href:'https://github.com/DKg156',external:true},
 {label:'Open LinkedIn',detail:'Professional profile',keywords:'linkedin connect social',href:'https://www.linkedin.com/in/dhruv156',external:true},
 {label:'View Resume',detail:'Open resume as PDF',keywords:'resume cv curriculum vitae download pdf',href:'/assets/Dhruv_Khurana_resume.pdf',external:true},
 {label:'Send an email',detail:'Get in touch',keywords:'email contact message',href:'mailto:'+email,external:true}
];
function Heading({index,kicker,title,desc}:{index:string;kicker:string;title:string;desc?:string}) {
 return <div className="section-heading" data-reveal="up"><div className="eyebrow"><span className="index">{index}</span>{kicker}</div><h2>{title}</h2>{desc&&<p>{desc}</p>}</div>;
}
export default function App(){
 const [theme,setTheme]=useState<'dark'|'light'>('dark');
 const [menu,setMenu]=useState(false);
 const [active,setActive]=useState('home');
 const [filter,setFilter]=useState('All');
 const [searchOpen,setSearchOpen]=useState(false);
 const [searchQuery,setSearchQuery]=useState('');
 const [searchIndex,setSearchIndex]=useState(0);
 const searchInputRef=useRef<HTMLInputElement>(null);
 const searchButtonRef=useRef<HTMLButtonElement>(null);
 const searchDialogRef=useRef<HTMLDivElement>(null);
 const filteredActions=quickActions.filter(action=>(action.label+' '+action.detail+' '+action.keywords).toLowerCase().includes(searchQuery.trim().toLowerCase()));
 const progressRef=useRef<HTMLDivElement>(null);
 const navigateSectionRef=useRef<(id:string)=>void>(()=>{});
 useEffect(()=>{
   // Reveal individual cards with a stagger. Re-observe when the project filter changes.
   if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
   const nodes=Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
   const observer=new IntersectionObserver(entries=>{
     entries.forEach(entry=>{
       if(entry.isIntersecting){
         entry.target.classList.add('is-visible');
         observer.unobserve(entry.target);
       }
     });
   },{threshold:0.08,rootMargin:'0px 0px -30px 0px'});
   nodes.forEach(node=>{
     if(node.classList.contains('is-visible')) return;
     const siblings=node.parentElement
       ? Array.from(node.parentElement.children).filter(child=>child.hasAttribute('data-reveal'))
       : [];
     const position=Math.max(0,siblings.indexOf(node));
     node.style.setProperty('--reveal-delay',Math.min(position,5)*85+'ms');
     node.classList.add('reveal-ready');
     observer.observe(node);
   });
   return ()=>observer.disconnect();
 },[filter]);
 useCardDeck(setActive,progressRef,navigateSectionRef);
 useEffect(()=>{const saved=localStorage.getItem('dhruv-theme');if(saved==='light'||saved==='dark')setTheme(saved);},[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('dhruv-theme',theme);},[theme]);
 useEffect(()=>{
   const onShortcut=(event:KeyboardEvent)=>{
     if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
       event.preventDefault();
       setSearchOpen(open=>!open);
     }
     if(event.key==='Escape')setSearchOpen(false);
   };
   window.addEventListener('keydown',onShortcut);
   return()=>window.removeEventListener('keydown',onShortcut);
 },[]);
 useEffect(()=>{
   if(!searchOpen)return;
   setSearchQuery('');
   setSearchIndex(0);
   const previous=document.body.style.overflow;
   document.body.style.overflow='hidden';
   searchInputRef.current?.focus();
   return()=>{document.body.style.overflow=previous;searchButtonRef.current?.focus();};
 },[searchOpen]);
 function useAction(href:string,external:boolean){
   setSearchOpen(false);
   setMenu(false);
   if(external){if(href.startsWith('mailto:'))window.location.href=href;else window.open(href,'_blank','noopener,noreferrer');}
   else {window.requestAnimationFrame(()=>navigateSectionRef.current(href.slice(1)));}
 }
 function onSearchKeyDown(event:React.KeyboardEvent<HTMLDivElement>){
   if(event.key==='ArrowDown'){event.preventDefault();setSearchIndex(i=>(i+1)%Math.max(filteredActions.length,1));}
   if(event.key==='ArrowUp'){event.preventDefault();setSearchIndex(i=>(i-1+Math.max(filteredActions.length,1))%Math.max(filteredActions.length,1));}
   if(event.key==='Enter'&&filteredActions.length){event.preventDefault();const action=filteredActions[searchIndex]||filteredActions[0];useAction(action.href,action.external);}
   if(event.key==='Tab'){
     const focusables=Array.from(searchDialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled])')||[]);
     if(!focusables.length)return;
     const first=focusables[0],last=focusables[focusables.length-1];
     if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
     else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
   }
 }
 useEffect(()=>{
   // Desktop-only pointer interactions; no cursor tracking on touch or reduced motion.
   const finePointer=window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
   if(!finePointer.matches)return;
   const cleanups:Array<()=>void>=[];
   const add=(element:HTMLElement,event:string,handler:EventListener)=>{
     element.addEventListener(event,handler);
     cleanups.push(()=>element.removeEventListener(event,handler));
   };
   const magnetic=Array.from(document.querySelectorAll<HTMLElement>('.btn, .connect, .quick-open'));
   magnetic.forEach(element=>{
     element.classList.add('magnetic');
     const move:EventListener=(event)=>{
       const pointer=event as PointerEvent;
       const bounds=element.getBoundingClientRect();
       const x=(pointer.clientX-(bounds.left+bounds.width/2))*.12;
       const y=(pointer.clientY-(bounds.top+bounds.height/2))*.16;
       element.style.setProperty('--mag-x',x.toFixed(2)+'px');
       element.style.setProperty('--mag-y',y.toFixed(2)+'px');
     };
     const reset=()=>{element.style.removeProperty('--mag-x');element.style.removeProperty('--mag-y');};
     add(element,'pointermove',move);
     add(element,'pointerleave',reset);
     add(element,'blur',reset);
     cleanups.push(()=>{element.classList.remove('magnetic');reset();});
   });
   const surfaces=Array.from(document.querySelectorAll<HTMLElement>('.project-card, .skill-card, .experience-card, .constellation'));
   surfaces.forEach(element=>{
     element.classList.add('spotlight-surface');
     const move:EventListener=(event)=>{
       const pointer=event as PointerEvent;
       const bounds=element.getBoundingClientRect();
       element.style.setProperty('--spot-x',(pointer.clientX-bounds.left).toFixed(1)+'px');
       element.style.setProperty('--spot-y',(pointer.clientY-bounds.top).toFixed(1)+'px');
     };
     const reset=()=>{element.style.removeProperty('--spot-x');element.style.removeProperty('--spot-y');};
     add(element,'pointermove',move);
     add(element,'pointerleave',reset);
     cleanups.push(()=>{element.classList.remove('spotlight-surface');reset();});
   });
   return()=>cleanups.forEach(cleanup=>cleanup());
 },[filter]);

 return <div className="site">
 <div className="scroll-progress" ref={progressRef} aria-hidden="true"/>
 <a className="skip" href="#main">Skip to content</a>
 {searchOpen&&<div className="quick-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setSearchOpen(false);}}>
   <div className="quick-dialog" ref={searchDialogRef} role="dialog" aria-modal="true" aria-label="Quick navigation" onKeyDown={onSearchKeyDown}>
     <div className="quick-search"><Search size={20}/><input ref={searchInputRef} type="search" aria-label="Search sections and links" placeholder="Jump to a section or link..." value={searchQuery} onChange={event=>{setSearchQuery(event.target.value);setSearchIndex(0);}}/><button type="button" className="quick-close" onClick={()=>setSearchOpen(false)} aria-label="Close quick navigation"><X size={18}/></button></div>
     <div className="quick-results" role="listbox" aria-label="Navigation results">
       {filteredActions.length?filteredActions.map((action,index)=><button type="button" key={action.href} role="option" aria-selected={index===searchIndex} className={'quick-result '+(index===searchIndex?'selected':'')} onMouseEnter={()=>setSearchIndex(index)} onClick={()=>useAction(action.href,action.external)}><span className="quick-result-icon">{action.external?<ArrowUpRight size={17}/>:<ChevronRight size={17}/>}</span><span className="quick-result-info"><strong>{action.label}</strong><small>{action.detail}</small></span><span className="quick-result-arrow">{action.external?'↗':'↵'}</span></button>)
       :<p className="quick-empty">No matching destinations.</p>}
     </div>
     <div className="quick-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Select</span><span><kbd>Esc</kbd> Close</span></div>
   </div>
 </div>}
 <header className="header"><div className="wrap header-content">
 <a href="#home" className="brand" onClick={()=>setMenu(false)} aria-label="Dhruv Khurana, home"><span className="monogram">DK<span>.</span></span></a>
 <nav className={'nav '+(menu?'open':'')} aria-label="Primary navigation">{nav.map(item=><a key={item} href={'#'+item.toLowerCase()} onClick={()=>setMenu(false)} className={active===item.toLowerCase()?'current':''} aria-current={active===item.toLowerCase()?'location':undefined}>{item}</a>)}</nav>
 <div className="header-tools"><button type="button" className="quick-open" ref={searchButtonRef} onClick={()=>setSearchOpen(true)} aria-label="Open quick navigation, Control or Command plus K" title="Quick navigation (Ctrl/⌘ K)"><Search size={17}/><span>Search</span><kbd>⌘ K</kbd></button><button className="theme-button" type="button" aria-label={theme==='dark'?'Activate light mode':'Activate dark mode'} onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button><a href="/assets/Dhruv_Khurana_resume.pdf" target="_blank" rel="noopener noreferrer" type="application/pdf" className="connect" aria-label="View Dhruv Khurana's resume (PDF, opens in new tab)">Resume</a><button className="menu-button" aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>
 </div></header>
 <main id="main">
 <section id="home" className="hero"><div className="hero-mesh" aria-hidden="true"/><div className="hero-glow hero-glow-one" aria-hidden="true"/><div className="hero-glow hero-glow-two" aria-hidden="true"/><div className="wrap hero-layout"><div className="hero-copy" data-reveal="up">
 <h1>Dhruv Khurana<br/><em>AI Engineer</em></h1>
 <p className="hero-description">I'm an AI Engineer working at the intersection of generative AI, large language models, and production software systems. I build practical applications that make complex technology useful.</p>
 <div className="hero-actions"><a className="btn primary" href="#projects">Explore my work <ArrowUpRight size={18}/></a><a className="btn ghost" href="#about">More about me <ArrowDown size={18}/></a></div>
 <div className="hero-details"><div><small>BASED IN</small><span><MapPin size={14}/> Delhi, India</span></div><div><small>CURRENT FOCUS</small><span><BrainCircuit size={14}/> Generative AI & RAG</span></div></div>
 </div><div className="hero-art" data-reveal="right"><div className="orb one"/><div className="orb two"/><div className="orbit-ring orbit-ring-a" aria-hidden="true"/><div className="orbit-ring orbit-ring-b" aria-hidden="true"/><div className="orbit-particle orbit-particle-a" aria-hidden="true"/><div className="orbit-particle orbit-particle-b" aria-hidden="true"/><div className="stellar-orbit stellar-orbit-a" aria-hidden="true"><span className="stellar-satellite"/></div><div className="stellar-orbit stellar-orbit-b" aria-hidden="true"><span className="stellar-satellite"/></div><div className="stellar-orbit stellar-orbit-c" aria-hidden="true"><span className="stellar-satellite"/></div><div className="stellar-sparks" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div><div className="portrait-ring"><img src="/assets/images/portrait.jpg" alt="Portrait of Dhruv Khurana" width="220" height="220" /></div><div className="float-card top"><Code2 size={20}/><span><strong>Software + AI</strong><small>Systems engineering</small></span></div><div className="float-card bottom"><Layers3 size={20}/><span><strong>From research to production</strong><small>Real-world impact</small></span></div></div></div>
 <a href="#about" className="scroll-cue">SCROLL TO EXPLORE <ArrowDown size={15}/></a></section>
 <section id="about" className="section about"><span className="scroll-scene-glow" aria-hidden="true"/><span className="neon-side-light" aria-hidden="true"/><span className="scroll-scene-rail" aria-hidden="true"/><div className="wrap"><Heading index="01" kicker="INTRODUCTION" title="About Me"/><div className="about-grid" data-reveal="up"><div className="about-lead">AI Engineering<br/><span>&amp; Software Systems</span></div><div className="about-text"><p>I specialize in building intelligent systems that connect modern AI research with dependable software engineering. My work spans retrieval-augmented generation, model adaptation, agentic workflows, and LLM inference optimization.</p><p>My foundation in backend engineering and my M.E. in Software Systems help me approach AI with a focus on reliability, architecture, and measurable results.</p><div className="about-actions"><a href="https://github.com/DKg156" target="_blank" rel="noreferrer"><Github size={18}/> GitHub <ArrowUpRight size={15}/></a><a href="https://www.linkedin.com/in/dhruv156" target="_blank" rel="noreferrer"><Linkedin size={18}/> LinkedIn <ArrowUpRight size={15}/></a></div></div></div><div className="stat-line"><div data-reveal="up"><strong>AI + SWE</strong><span>Engineering focus</span></div><div data-reveal="up"><strong>M.E.</strong><span>Software Systems · BITS Pilani</span></div><div data-reveal="up"><strong>3</strong><span>Featured ML projects</span></div></div></div></section>
 <section id="experience" className="section section-alt"><span className="scroll-scene-glow" aria-hidden="true"/><span className="neon-side-light" aria-hidden="true"/><span className="scroll-scene-rail" aria-hidden="true"/><ChipDivider/><div className="wrap"><Heading index="02" kicker="CAREER" title="Experience" desc="Developing reliable software systems and taking AI applications from experiments to production."/><div className="timeline">{experience.map((job,i)=><article className="timeline-item" data-reveal="left" key={job.company}><div className="timeline-marker">{String(i+1).padStart(2,'0')}</div><div className="experience-card"><div className="job-top"><div><span className="minor">{job.company}</span><h3>{job.role}</h3></div><div className="job-date">{job.time}<small>{job.where}</small></div></div><p>{job.summary}</p><ul>{job.points.map(point=><li key={point}>{point}</li>)}</ul><div className="tags">{job.tags.map(tag=><span key={tag}>{tag}</span>)}</div></div></article>)}</div></div></section>
 <section id="projects" className="section"><span className="scroll-scene-glow" aria-hidden="true"/><span className="neon-side-light" aria-hidden="true"/><span className="scroll-scene-rail" aria-hidden="true"/><ChipDivider/><div className="wrap"><Heading index="03" kicker="SELECTED WORK" title="Projects" desc="A selection of projects exploring machine learning, computer vision, and intelligent applications."/><div className="filters" role="group" aria-label="Filter projects">{['All','Machine Learning','Applications'].map(c=><button className={filter===c?'active':''} type="button" onClick={()=>setFilter(c)} aria-pressed={filter===c} key={c}>{c}</button>)}</div><div className="project-grid">{projects.filter(p=>filter==='All'||p.category===filter).map(project=><article className={'project-card '+project.color} key={project.name} data-reveal="up"><div className="project-visual"><span className="project-num">{project.number} / PROJECT</span><span className="project-symbol">{project.number==='01'?<BrainCircuit size={66} strokeWidth={1}/>:project.number==='02'?<Layers3 size={66} strokeWidth={1}/>:<Code2 size={66} strokeWidth={1}/>}</span><span className="project-category">{project.category}</span></div><div className="project-body"><div className="minor">{project.type}</div><h3>{project.name}</h3><p>{project.text}</p><div className="tags">{project.tags.map(tag=><span key={tag}>{tag}</span>)}</div>{project.url&&<a className="project-link" href={project.url} target="_blank" rel="noreferrer">View repository <ExternalLink size={16}/></a>}</div></article>)}</div><p className="project-footnote">More projects on <a href="https://github.com/DKg156" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a></p></div></section>
 <section id="skills" className="section section-alt"><span className="scroll-scene-glow" aria-hidden="true"/><span className="neon-side-light" aria-hidden="true"/><span className="scroll-scene-rail" aria-hidden="true"/><ChipDivider/><div className="wrap"><Heading index="04" kicker="THE TOOLKIT" title="Technical Skills" desc="A carefully chosen mix of AI engineering, development, and infrastructure technologies."/><SkillsConstellation/><div className="skills-grid">{skillGroups.map((group,i)=><article className="skill-card" data-reveal="up" key={group.title}><div className="skill-title"><span className="skill-icon">{i===0?<BrainCircuit size={23}/>:i===1?<Layers3 size={23}/>:i===2?<BriefcaseBusiness size={23}/>:<Code2 size={23}/>}</span><h3>{group.title}</h3></div><div className="skill-pills">{group.skills.map(s=><span key={s}>{s}</span>)}</div></article>)}</div></div></section>
 <section id="education" className="section"><span className="scroll-scene-glow" aria-hidden="true"/><span className="neon-side-light" aria-hidden="true"/><span className="scroll-scene-rail" aria-hidden="true"/><ChipDivider/><div className="wrap"><Heading index="05" kicker="ACADEMIC JOURNEY" title="Education"/><div className="education-grid">{education.map(item=><article className="education-card" data-reveal="up" key={item.school}><div className="edu-icon"><GraduationCap size={26}/></div><span className="minor">{item.time} · {item.location}</span><h3>{item.school}</h3><p>{item.degree}</p><strong>{item.result}</strong></article>)}</div><div className="certificate" data-reveal="up"><Check size={20}/><div><strong>AWS Certified Cloud Practitioner</strong><span>Cloud fundamentals and infrastructure certification</span></div></div></div></section>
 <section id="contact" className="section contact"><span className="scroll-scene-glow" aria-hidden="true"/><span className="neon-side-light" aria-hidden="true"/><span className="scroll-scene-rail" aria-hidden="true"/><ChipDivider/><div className="wrap contact-layout" data-reveal="up"><div><div className="eyebrow"><span className="index">06</span> CONTACT</div><h2>Contact Me</h2><p>Interested in hiring me, collaborating on a project, or building something innovative?</p><div className="contact-actions"><a className="btn primary" href={'mailto:'+email}>Say hello <ArrowUpRight size={18}/></a></div></div><div className="contact-panel"><div className="eyebrow">FIND ME ONLINE</div><a href="https://github.com/DKg156" target="_blank" rel="noreferrer"><Github/> GitHub <ArrowUpRight/></a><a href="https://www.linkedin.com/in/dhruv156" target="_blank" rel="noreferrer"><Linkedin/> LinkedIn <ArrowUpRight/></a><a href={'mailto:'+email}><Mail/> Email <ChevronRight/></a></div></div></section>
 </main><PortfolioGuide/><footer className="footer"><div className="wrap footer-inner"><span><strong>DK.</strong> Built with React & curiosity.</span><span>© {new Date().getFullYear()} Dhruv Khurana</span><a href="#home" data-scroll-through-cards="true" aria-label="Back to top">Back to top <ArrowUp size={16}/></a></div></footer></div>;
}
