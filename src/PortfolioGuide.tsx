import {useEffect,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowUpRight,Bot,MessageCircle,Send,Trash2,X} from 'lucide-react';
import {answerPortfolioQuestion,guideSuggestions} from './portfolioGuide';
import type {GuideAnswer} from './portfolioGuide';

type Message={id:number;kind:'visitor'|'guide';text:string;href?:string;label?:string};
const initialMessage:Message={id:0,kind:'guide',text:"Hi there! 👋 How can I help you today? Ask about Dhruv's experience, projects, skills, or education."};
const maxHistory=24;
const autoOpenSessionKey='dhruv-portfolio-chat-auto-opened';

export default function PortfolioGuide(){
 const [open,setOpen]=useState(false);
 const autoOpenHandledRef=useRef(false);
 const autoOpenedRef=useRef(false);
 const [question,setQuestion]=useState('');
 const [messages,setMessages]=useState<Message[]>([initialMessage]);
 const inputRef=useRef<HTMLInputElement>(null);
 const triggerRef=useRef<HTMLButtonElement>(null);
 const messagesEndRef=useRef<HTMLDivElement>(null);
 const panelRef=useRef<HTMLElement>(null);
 const nextIdRef=useRef(1);
 const wasOpenedRef=useRef(false);
 useEffect(()=>{
  // Open the compact chat once after 5s; never repeat after the visitor dismisses it.
  try{if(sessionStorage.getItem(autoOpenSessionKey)==='yes'){autoOpenHandledRef.current=true;return;}}catch{ /* Keep working with storage disabled. */ }
  const timer=window.setTimeout(()=>{
   if(autoOpenHandledRef.current)return;
   autoOpenHandledRef.current=true;
   autoOpenedRef.current=true;
   try{sessionStorage.setItem(autoOpenSessionKey,'yes');}catch{ /* Ignore unavailable storage. */ }
   setOpen(true);
  },5000);
  return()=>window.clearTimeout(timer);
 },[]);
 const openChat=()=>{
  autoOpenHandledRef.current=true;
  autoOpenedRef.current=false;
  try{sessionStorage.setItem(autoOpenSessionKey,'yes');}catch{ /* Ignore unavailable storage. */ }
  setOpen(true);
 };

 useEffect(()=>{
  if(open){
   wasOpenedRef.current=true;
   // Automatic opening must not interrupt typing or steal keyboard focus.
   if(!autoOpenedRef.current)inputRef.current?.focus();
  }else if(wasOpenedRef.current){
   if(panelRef.current?.contains(document.activeElement))triggerRef.current?.focus();
  }
 },[open]);
 useEffect(()=>{
  if(open){const panel=messagesEndRef.current?.parentElement;if(panel)panel.scrollTop=panel.scrollHeight;}
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
   <MessageCircle size={23}/><span>Chatbot</span>
  </button>
 </div>;
}
