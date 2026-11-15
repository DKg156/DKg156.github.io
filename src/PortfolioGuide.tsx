import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {FormEvent} from 'react';
import {ArrowUpRight,Bot,Send,X} from 'lucide-react';
import {answerPortfolioQuestion,guideSuggestions} from './portfolioGuide';
import type {GuideAnswer} from './portfolioGuide';

type Message={id:number;kind:'visitor'|'guide';text:string;href?:string;label?:string};
const initialMessage:Message={id:0,kind:'guide',text:"Hi there! 👋 How can I help you today? Ask about Dhruv's experience, projects, skills, or education."};
const maxHistory=24;

export default function PortfolioGuide(){
 const [open,setOpen]=useState(false);
 // Keep server-rendered markup identical during hydration, then move the
 // floating widget to <body> so mobile layout layers cannot obscure it.
 const [portalReady,setPortalReady]=useState(false);
 useEffect(()=>{setPortalReady(true);},[]);
 const [question,setQuestion]=useState('');
 const [messages,setMessages]=useState<Message[]>([]);
 const [greetingPending,setGreetingPending]=useState(false);
 const [thinking,setThinking]=useState(false);
 const thinkingRef=useRef(false);
 const replyTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
 const greetingTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
 const inputRef=useRef<HTMLInputElement>(null);
 const triggerRef=useRef<HTMLButtonElement>(null);
 const messagesEndRef=useRef<HTMLDivElement>(null);
 const panelRef=useRef<HTMLElement>(null);
 const nextIdRef=useRef(1);
 // Only retain the last explicitly named project for short follow-up questions.
 const topicRef=useRef<string|undefined>(undefined);
 const openChat=()=>{
  setMessages([]);
  setGreetingPending(true);
  setOpen(true);
  // Let the panel animate in before the first bot message appears.
  greetingTimerRef.current=window.setTimeout(()=>{
   greetingTimerRef.current=null;
   setMessages([initialMessage]);
   setGreetingPending(false);
  },1000);
 };
 const closeChat=()=>{
  // Cancel any delayed response and reset all conversation state before closing.
  if(replyTimerRef.current!==null){
   window.clearTimeout(replyTimerRef.current);
   replyTimerRef.current=null;
  }
  if(greetingTimerRef.current!==null){
   window.clearTimeout(greetingTimerRef.current);
   greetingTimerRef.current=null;
  }
  thinkingRef.current=false;
  setThinking(false);
  setGreetingPending(false);
  setMessages([]);
  setQuestion('');
  nextIdRef.current=1;
  topicRef.current=undefined;
  if(panelRef.current?.contains(document.activeElement))triggerRef.current?.focus();
  setOpen(false);
 };
 useEffect(()=>()=>{
  if(replyTimerRef.current!==null)window.clearTimeout(replyTimerRef.current);
  if(greetingTimerRef.current!==null)window.clearTimeout(greetingTimerRef.current);
 },[]);

 useEffect(()=>{
  // Keep the mobile keyboard closed until the visitor taps the input.
  // Otherwise it hides the opening animation behind the keyboard.
  if(open&&window.matchMedia('(pointer: fine)').matches)inputRef.current?.focus();
 },[open]);
 useEffect(()=>{
  if(open){const panel=messagesEndRef.current?.parentElement;if(panel)panel.scrollTop=panel.scrollHeight;}
 },[messages,thinking,open]);
 useEffect(()=>{
  if(!open)return;
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();closeChat();}
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
  if(!value||thinkingRef.current||greetingPending)return;
  const response:GuideAnswer=answerPortfolioQuestion(value,topicRef.current);
  topicRef.current=response.topic;
  const visitor:Message={id:nextIdRef.current++,kind:'visitor',text:value};
  const answer:Message={id:nextIdRef.current++,kind:'guide',...response};
  thinkingRef.current=true;
  setThinking(true);
  setMessages(prev=>[...prev.slice(-(maxHistory-1)),visitor]);
  setQuestion('');
  replyTimerRef.current=window.setTimeout(()=>{
   replyTimerRef.current=null;
   thinkingRef.current=false;
   setThinking(false);
   setMessages(prev=>[...prev.slice(-(maxHistory-1)),answer]);
  },3000);
  inputRef.current?.focus();
 };
 const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();ask(question);};
 const followLink=()=>closeChat();
 const widget=<div className="portfolio-guide-root">
  {open&&<section className="portfolio-guide-panel" id="portfolio-guide-panel" ref={panelRef} role="dialog" aria-label="DK-bot" aria-modal="false">
   <header className="portfolio-guide-head">
    <div className="portfolio-guide-mark"><Bot size={20}/></div>
    <div className="portfolio-guide-heading"><strong>DK-bot</strong><small>Ask about Dhruv</small></div>
    <button type="button" className="portfolio-guide-icon-button" onClick={closeChat} aria-label="Close DK-bot"><X size={19}/></button>
   </header>
   <div className="portfolio-guide-conversation" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
    {messages.map(message=><div key={message.id} className={'portfolio-guide-message '+(message.kind==='visitor'?'visitor':'guide')}>
     <p>{message.text}</p>
     {message.href&&<a href={message.href} onClick={followLink} target={message.href.startsWith('http')?'_blank':undefined} rel={message.href.startsWith('http')?'noopener noreferrer':undefined}>{message.label||'Explore section'}<ArrowUpRight size={13}/></a>}
    </div>)}
    {(thinking||greetingPending)&&<div className="portfolio-guide-message guide portfolio-guide-thinking" role="status" aria-label="DK-bot is typing"><span className="portfolio-guide-sr-only">DK-bot is typing</span><span aria-hidden="true" className="portfolio-guide-dots"><i/><i/><i/></span></div>}
    <div ref={messagesEndRef}/>
   </div>
   <div className="portfolio-guide-suggestions" aria-label="Suggested questions">
    {guideSuggestions.map(suggestion=><button key={suggestion} type="button" onClick={()=>ask(suggestion)} disabled={thinking||greetingPending}>{suggestion}</button>)}
   </div>
   <form className="portfolio-guide-form" onSubmit={submit}>
    <label htmlFor="portfolio-guide-question" className="portfolio-guide-sr-only">Question about Dhruv's portfolio</label>
    <input ref={inputRef} id="portfolio-guide-question" type="text" value={question} onChange={event=>setQuestion(event.target.value)} placeholder="Ask about experience, projects..." maxLength={300} autoComplete="off"/>
    <button type="submit" aria-label="Send question" disabled={!question.trim()||thinking||greetingPending}><Send size={18}/></button>
   </form>
  </section>}
  <button type="button" ref={triggerRef} className={'portfolio-guide-launcher '+(open?'is-open':'')} onClick={()=>{if(open)closeChat();else openChat();}} aria-label={open?'Close DK-bot':'Open DK-bot'} aria-expanded={open} aria-controls="portfolio-guide-panel">
   <Bot size={25} strokeWidth={1.9} aria-hidden="true"/>
  </button>
 </div>;
 return portalReady?createPortal(widget,document.body):widget;
}
