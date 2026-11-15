import {useEffect,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowUpRight,Bot,MessageCircle,Send,Trash2,X} from 'lucide-react';
import {answerPortfolioQuestion,guideSuggestions} from './portfolioGuide';
import type {GuideAnswer} from './portfolioGuide';

type Message={id:number;kind:'visitor'|'guide';text:string;href?:string;label?:string};
const initialMessage:Message={id:0,kind:'guide',text:"Hi! I'm Dhruv's portfolio chatbot. Curious about his experience, projects, or technical skills? Choose a question below or ask your own."};
const maxHistory=24;
const greetingSessionKey='dhruv-portfolio-chat-greeting-shown';

export default function PortfolioGuide(){
 const [open,setOpen]=useState(false);
 const [showGreeting,setShowGreeting]=useState(false);
 const greetingSeenRef=useRef(false);
 const [question,setQuestion]=useState('');
 const [messages,setMessages]=useState<Message[]>([initialMessage]);
 const inputRef=useRef<HTMLInputElement>(null);
 const triggerRef=useRef<HTMLButtonElement>(null);
 const messagesEndRef=useRef<HTMLDivElement>(null);
 const panelRef=useRef<HTMLElement>(null);
 const nextIdRef=useRef(1);
 const wasOpenedRef=useRef(false);
 useEffect(()=>{
  // A single, nonblocking greeting per browser tab; never auto-open the chat.
  try{if(sessionStorage.getItem(greetingSessionKey)==='yes'){greetingSeenRef.current=true;return;}}catch{ /* Storage may be disabled. */ }
  const appear=window.setTimeout(()=>{
   if(greetingSeenRef.current)return;
   greetingSeenRef.current=true;
   try{sessionStorage.setItem(greetingSessionKey,'yes');}catch{ /* Keep working without storage. */ }
   setShowGreeting(true);
  },5000);
  return()=>window.clearTimeout(appear);
 },[]);
 useEffect(()=>{
  if(!showGreeting)return;
  const hide=window.setTimeout(()=>setShowGreeting(false),7000);
  return()=>window.clearTimeout(hide);
 },[showGreeting]);
 const openChat=()=>{
  greetingSeenRef.current=true;
  try{sessionStorage.setItem(greetingSessionKey,'yes');}catch{ /* Storage may be disabled. */ }
  setShowGreeting(false);
  setOpen(true);
 };

 useEffect(()=>{
  if(open){
   wasOpenedRef.current=true;
   inputRef.current?.focus();
  }else if(wasOpenedRef.current){
   triggerRef.current?.focus();
  }
 },[open]);
 useEffect(()=>{
  if(open)messagesEndRef.current?.scrollIntoView({block:'end',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 },[messages,open]);
 useEffect(()=>{
  if(!open)return;
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();setOpen(false);}
   if(event.key==='Tab'){
    const focusable=Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled])')||[]);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
   }
  };
  document.addEventListener('keydown',onKey);
  return()=>document.removeEventListener('keydown',onKey);
 },[open,messages]);
 const ask=(raw:string)=>{
  const value=raw.trim().slice(0,300);
  if(!value)return;
  const response:GuideAnswer=answerPortfolioQuestion(value);
  const visitor:Message={id:nextIdRef.current++,kind:'visitor',text:value};
  const answer:Message={id:nextIdRef.current++,kind:'guide',...response};
  setMessages(prev=>[...prev.slice(-(maxHistory-2)),visitor,answer]);
  setQuestion('');
  inputRef.current?.focus();
 };
 const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();ask(question);};
 const clear=()=>{setMessages([initialMessage]);setQuestion('');inputRef.current?.focus();};
 const followLink=()=>setOpen(false);
 return <div className="portfolio-guide-root">
  {!open&&showGreeting&&<div className="portfolio-guide-greeting">
   <button type="button" className="portfolio-guide-greeting-message" onClick={openChat} aria-label="Open chatbot">
    <span>Hi there! 👋</span><strong>How can I help you today?</strong>
   </button>
   <button type="button" className="portfolio-guide-greeting-dismiss" onClick={()=>setShowGreeting(false)} aria-label="Dismiss chatbot greeting"><X size={14}/></button>
  </div>}
  {open&&<section className="portfolio-guide-panel" id="portfolio-guide-panel" ref={panelRef} role="dialog" aria-label="Chatbot" aria-modal="false">
   <header className="portfolio-guide-head">
    <div className="portfolio-guide-mark"><Bot size={20}/></div>
    <div className="portfolio-guide-heading"><strong>Chatbot</strong><small>Ask about Dhruv</small></div>
    <button type="button" className="portfolio-guide-icon-button" onClick={clear} aria-label="Clear conversation" title="Clear conversation"><Trash2 size={17}/></button>
    <button type="button" className="portfolio-guide-icon-button" onClick={()=>setOpen(false)} aria-label="Close portfolio guide"><X size={19}/></button>
   </header>
   <div className="portfolio-guide-conversation" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
    {messages.map(message=><div key={message.id} className={'portfolio-guide-message '+(message.kind==='visitor'?'visitor':'guide')}>
     <p>{message.text}</p>
     {message.href&&<a href={message.href} onClick={followLink} target={message.href.startsWith('http')?'_blank':undefined} rel={message.href.startsWith('http')?'noopener noreferrer':undefined}>{message.label||'Explore section'}<ArrowUpRight size={13}/></a>}
    </div>)}
    <div ref={messagesEndRef}/>
   </div>
   <div className="portfolio-guide-suggestions" aria-label="Suggested questions">
    {guideSuggestions.map(suggestion=><button key={suggestion} type="button" onClick={()=>ask(suggestion)}>{suggestion}</button>)}
   </div>
   <form className="portfolio-guide-form" onSubmit={submit}>
    <label htmlFor="portfolio-guide-question" className="portfolio-guide-sr-only">Question about Dhruv's portfolio</label>
    <input ref={inputRef} id="portfolio-guide-question" type="text" value={question} onChange={event=>setQuestion(event.target.value)} placeholder="Ask about experience, projects..." maxLength={300} autoComplete="off"/>
    <button type="submit" aria-label="Send question" disabled={!question.trim()}><Send size={18}/></button>
   </form>
   <p className="portfolio-guide-disclaimer">Answers are based on information published on this portfolio. Chat history stays in this browser tab.</p>
  </section>}
  <button type="button" ref={triggerRef} className={'portfolio-guide-launcher '+(open?'is-open':'')} onClick={()=>{if(open)setOpen(false);else openChat();}} aria-label={open?'Close chatbot':'Open chatbot'} aria-expanded={open} aria-controls="portfolio-guide-panel">
   {open?<X size={22}/>:<MessageCircle size={23}/>}
   {!open&&<span>Chatbot</span>}
  </button>
 </div>;
}
