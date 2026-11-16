import {useEffect} from 'react';

/**
 * Real section-card navigation. Each complete section is a card, with natural
 * internal scrolling for long content. Only at the reading boundary does an
 * additional scroll gesture turn the card. No fake cards or scrolling the page
 * through intermediate sections.
 */
export default function useCardDeck(
  setActive:(id:string)=>void,
  progressRef:{current:HTMLDivElement|null},
  navigateSectionRef:{current:(id:string)=>void}
){
 useEffect(()=>{
  const main=document.querySelector<HTMLElement>('#main');
  if(!main)return;
  const cards=Array.from(main.querySelectorAll<HTMLElement>(':scope > section[id]'));
  if(!cards.length)return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fromHash=decodeURIComponent(window.location.hash.slice(1));
  let index=Math.max(0,cards.findIndex(card=>card.id===fromHash));
  let version=0;
  let moving=false;
  let running:Animation[]=[];
  let frame=0;
  let wheelBuffer=0;
  let lastWheel=0;
  let lastReadingScroll=0;
  let touchY=0;
  let touchBoundary:'start'|'end'|'both'|null=null;

  const reveal=(card:HTMLElement)=>{
   card.querySelectorAll<HTMLElement>('[data-reveal]').forEach(node=>node.classList.add('is-visible'));
  };
  const accessibility=(card:HTMLElement,visible:boolean)=>{
   card.inert=!visible;
   card.setAttribute('aria-hidden',visible?'false':'true');
  };
  const updateProgress=()=>{
   frame=0;
   const card=cards[index];
   const extent=Math.max(0,card.scrollHeight-card.clientHeight);
   const fraction=extent>0?Math.min(1,card.scrollTop/extent):1;
   if(progressRef.current){
    progressRef.current.style.transform='scaleX('+((index+fraction)/cards.length)+')';
   }
   const phase=extent>0?fraction:.5;
   card.style.setProperty('--scene-progress',phase.toFixed(3));
   card.style.setProperty('--scene-presence',Math.sin(Math.PI*phase).toFixed(3));
   card.style.setProperty('--scene-drift',((phase-.5)*24).toFixed(1)+'px');
  };
  const queueProgress=()=>{if(!frame)frame=window.requestAnimationFrame(updateProgress);};
  const settle=()=>{
   running.forEach(animation=>animation.cancel());
   running=[];
   cards.forEach((card,i)=>{
    card.classList.remove('deck-outgoing');
    card.classList.toggle('deck-current',i===index);
    card.classList.toggle('is-illuminated',i===index);
    accessibility(card,i===index);
   });
   moving=false;
   wheelBuffer=0;
   queueProgress();
  };
  const cancel=()=>{version++;settle();};
  const turn=async(to:number,fast:boolean,run:number):Promise<boolean>=>{
   if(run!==version)return false;
   const outgoing=cards[index],incoming=cards[to];
   const direction=to>index?1:-1;
   reveal(incoming);
   incoming.classList.add('deck-current','is-illuminated');
   outgoing.classList.add('deck-outgoing');
   accessibility(incoming,true);
   accessibility(outgoing,false);
   index=to;
   if(motion.matches||!('animate' in incoming)){
    outgoing.classList.remove('deck-current','deck-outgoing','is-illuminated');
    queueProgress();
    return true;
   }
   // The REAL full-size panels rotate, two compositor layers at a time.
   const duration=fast?135:280;
   const exiting=outgoing.animate([
    {opacity:1,transform:'perspective(1500px) rotateY(0deg) translateX(0)'},
    {opacity:.18,transform:'perspective(1500px) rotateY('+(-direction*66)+'deg) translateX('+(-direction*7)+'%)'}
   ],{duration,easing:'cubic-bezier(.6,0,.85,.45)',fill:'both'});
   const entering=incoming.animate([
    {opacity:.3,transform:'perspective(1500px) rotateY('+(direction*44)+'deg) translateX('+(direction*6)+'%)'},
    {opacity:1,transform:'perspective(1500px) rotateY(0deg) translateX(0)'}
   ],{duration,easing:'cubic-bezier(.18,.7,.18,1)',fill:'both'});
   running=[exiting,entering];
   await Promise.allSettled([exiting.finished,entering.finished]);
   if(run!==version)return false;
   outgoing.classList.remove('deck-current','deck-outgoing','is-illuminated');
   exiting.cancel();
   entering.cancel();
   running=[];
   queueProgress();
   return true;
  };
  const navigate=(id:string,history:boolean,focus:boolean)=>{
   const to=cards.findIndex(card=>card.id===id);
   if(to<0)return;
   cancel();
   const run=version;
   if(to===index){
    if(history&&window.location.hash!=='#'+id)window.history.pushState(null,'','#'+id);
    setActive(id);
    if(focus)cards[index].focus({preventScroll:true});
    return;
   }
   moving=true;
   const direction=to>index?1:-1;
   const route:number[]=[];
   for(let i=index+direction;direction>0?i<=to:i>=to;i+=direction)route.push(i);
   void (async()=>{
    for(let i=0;i<route.length;i++){
     if(!await turn(route[i],i<route.length-1,run))return;
    }
    if(run!==version)return;
    settle();
    const card=cards[index];
    setActive(card.id);
    if(history&&window.location.hash!=='#'+card.id){
     window.history.pushState(null,'','#'+card.id);
    }
    if(focus)card.focus({preventScroll:true});
   })();
  };
  navigateSectionRef.current=id=>navigate(id,true,true);
  document.body.classList.add('card-deck-enabled');
  main.classList.add('card-deck-ready');
  cards.forEach((card,i)=>{
   if(!card.hasAttribute('tabindex')){
    card.tabIndex=-1;
    card.dataset.deckTabindex='true';
   }
   card.classList.toggle('deck-current',i===index);
   card.classList.toggle('is-illuminated',i===index);
   accessibility(card,i===index);
  });
  reveal(cards[index]);
  setActive(cards[index].id);
  window.scrollTo({top:0,behavior:'instant'});
  queueProgress();

  const onScroll=(event:Event)=>{
   if(event.target===cards[index]){
    lastReadingScroll=window.performance.now();
    wheelBuffer=0;
    queueProgress();
   }
  };
  const onWheel=(event:WheelEvent)=>{
   if(event.ctrlKey||!(event.target instanceof Element))return;
   if(event.target.closest('.constellation-scroller'))return;
   const card=cards[index];
   if(!card.contains(event.target)||!event.deltaY)return;
   const forward=event.deltaY>0;
   const atEnd=card.scrollTop+card.clientHeight>=card.scrollHeight-3;
   const atStart=card.scrollTop<=3;
   const turnable=forward?atEnd&&index<cards.length-1:atStart&&index>0;
   if(!turnable){wheelBuffer=0;return;}
   event.preventDefault();
   if(moving)return;
   const now=window.performance.now();
   // Ignore the inertial tail of the gesture that just finished reading.
   // A deliberate extra gesture after a short pause turns the card.
   if(now-lastReadingScroll<260){wheelBuffer=0;return;}
   if(now-lastWheel>650)wheelBuffer=0;
   lastWheel=now;
   const unit=event.deltaMode===1?16:event.deltaMode===2?card.clientHeight:1;
   wheelBuffer+=Math.min(120,Math.abs(event.deltaY)*unit);
   if(wheelBuffer>=155){
    wheelBuffer=0;
    navigate(cards[index+(forward?1:-1)].id,false,false);
   }
  };
  const onTouchStart=(event:TouchEvent)=>{
   if(!(event.target instanceof Element)||!cards[index].contains(event.target))return;
   if(event.target.closest('.constellation-scroller'))return;
   const card=cards[index];
   touchY=event.touches[0]?.clientY??0;
   const atStart=card.scrollTop<=3;
   const atEnd=card.scrollTop+card.clientHeight>=card.scrollHeight-3;
   touchBoundary=atStart&&atEnd?'both':atStart?'start':atEnd?'end':null;
  };
  const onTouchEnd=(event:TouchEvent)=>{
   if(moving||!touchBoundary||!event.changedTouches.length)return;
   const delta=touchY-event.changedTouches[0].clientY;
   if((touchBoundary==='end'||touchBoundary==='both')&&delta>85&&index<cards.length-1){
    navigate(cards[index+1].id,false,false);
   }else if((touchBoundary==='start'||touchBoundary==='both')&&delta< -85&&index>0){
    navigate(cards[index-1].id,false,false);
   }
   touchBoundary=null;
  };
  const onKeyDown=(event:KeyboardEvent)=>{
   if(event.defaultPrevented||event.altKey||event.metaKey||event.ctrlKey||event.shiftKey)return;
   if(!(event.target instanceof Element))return;
   if(event.target.closest('input,textarea,select,button,a,summary,[role="button"],[contenteditable="true"],.constellation-scroller'))return;
   const forward=event.key==='PageDown'||event.key==='ArrowDown'||event.key===' ';
   const back=event.key==='PageUp'||event.key==='ArrowUp';
   if(!forward&&!back)return;
   const card=cards[index];
   if(forward&&card.scrollTop+card.clientHeight>=card.scrollHeight-3&&index<cards.length-1){
    event.preventDefault();
    if(!moving)navigate(cards[index+1].id,false,false);
   }else if(back&&card.scrollTop<=3&&index>0){
    event.preventDefault();
    if(!moving)navigate(cards[index-1].id,false,false);
   }else{
    // Body scrolling is locked in deck mode, so explicitly scroll the
    // current card for keyboard users who are reading a long section.
    event.preventDefault();
    const amount=event.key.startsWith('Arrow')?72:card.clientHeight*.75;
    card.scrollBy({top:(forward?1:-1)*amount,behavior:motion.matches?'instant':'smooth'});
   }
  };
  const onClick=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   if(!(event.target instanceof Element))return;
   const anchor=event.target.closest<HTMLAnchorElement>('a[href^="#"]');
   if(!anchor||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self'))return;
   const id=decodeURIComponent(anchor.hash.slice(1));
   if(!cards.some(card=>card.id===id))return;
   event.preventDefault();
   navigate(id,true,true);
  };
  const onHistory=()=>{
   const id=decodeURIComponent(window.location.hash.slice(1));
   if(cards.some(card=>card.id===id)&&cards[index].id!==id)navigate(id,false,true);
  };
  main.addEventListener('scroll',onScroll,true);
  main.addEventListener('wheel',onWheel,{passive:false});
  main.addEventListener('touchstart',onTouchStart,{passive:true});
  main.addEventListener('touchend',onTouchEnd,{passive:true});
  document.addEventListener('keydown',onKeyDown);
  document.addEventListener('click',onClick);
  window.addEventListener('popstate',onHistory);
  window.addEventListener('hashchange',onHistory);
  window.addEventListener('resize',queueProgress);
  return ()=>{
   cancel();
   if(frame)window.cancelAnimationFrame(frame);
   navigateSectionRef.current=()=>{};
   main.removeEventListener('scroll',onScroll,true);
   main.removeEventListener('wheel',onWheel);
   main.removeEventListener('touchstart',onTouchStart);
   main.removeEventListener('touchend',onTouchEnd);
   document.removeEventListener('keydown',onKeyDown);
   document.removeEventListener('click',onClick);
   window.removeEventListener('popstate',onHistory);
   window.removeEventListener('hashchange',onHistory);
   window.removeEventListener('resize',queueProgress);
   cards.forEach(card=>{
    card.inert=false;
    card.removeAttribute('aria-hidden');
    if(card.dataset.deckTabindex){
     card.removeAttribute('tabindex');
     delete card.dataset.deckTabindex;
    }
    card.classList.remove('deck-current','deck-outgoing','is-illuminated');
    card.style.removeProperty('--scene-progress');
    card.style.removeProperty('--scene-presence');
    card.style.removeProperty('--scene-drift');
   });
   main.classList.remove('card-deck-ready');
   document.body.classList.remove('card-deck-enabled');
  };
 },[setActive,progressRef,navigateSectionRef]);
}
