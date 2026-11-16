import {useEffect} from 'react';

/**
 * Section cards use the ordinary document scroll, retaining their natural
 * full height. CSS sticky stacks them only as the next card arrives.
 * The section itself makes a restrained vertical (X-axis) turn, not a
 * horizontal Y-axis page flip or an artificial scrolling gate.
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
  let raf=0;
  let activeIndex=0;
  let navigating=false;
  let navigationToken=0;
  let currentAnimation:Animation|null=null;

  // These zero-height markers are in document flow and never become sticky.
  // They give anchor navigation stable coordinates even when the card itself
  // is pinned by CSS sticky positioning.
  const markers=cards.map(card=>{
   const marker=document.createElement('span');
   marker.className='card-flow-anchor';
   marker.setAttribute('aria-hidden','true');
   card.before(marker);
   return marker;
  });
  const reveal=(card:HTMLElement)=>{
   card.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el=>el.classList.add('is-visible'));
  };
  const sizes=('ResizeObserver' in window)?new ResizeObserver(entries=>{
   for(const entry of entries){
    const card=entry.target as HTMLElement;
    const measured=card.offsetHeight+'px';
    if(card.style.getPropertyValue('--stack-card-height')!==measured){
     card.style.setProperty('--stack-card-height',measured);
    }
   }
  }):null;
  cards.forEach(card=>{
   card.style.setProperty('--stack-card-height',card.offsetHeight+'px');
   sizes?.observe(card);
   if(!card.hasAttribute('tabindex')){
    card.tabIndex=-1;
    card.dataset.shuffleTabindex='true';
   }
  });
  main.classList.add('scroll-stack-ready');
  const update=()=>{
   raf=0;
   const viewport=window.innerHeight;
   const total=document.documentElement.scrollHeight-viewport;
   if(progressRef.current){
    progressRef.current.style.transform='scaleX('+(
      total>0?Math.min(1,Math.max(0,window.scrollY/total)):0
    )+')';
   }
   // Batch reads before writes; only visible sections receive decoration work.
   const rects=cards.map(card=>card.getBoundingClientRect());
   let visibleIndex=0;
   rects.forEach((rect,i)=>{
    if(rect.top<viewport*.55 && rect.bottom>viewport*.18)visibleIndex=i;
   });
   rects.forEach((rect,i)=>{
    const card=cards[i];
    const visible=rect.bottom>0 && rect.top<viewport;
    const lit=visible && i===visibleIndex;
    if(card.classList.contains('is-illuminated')!==lit)card.classList.toggle('is-illuminated',lit);
    if(!visible||motion.matches)return;
    const phase=Math.max(0,Math.min(1,(viewport-rect.top)/(viewport+rect.height)));
    card.style.setProperty('--scene-progress',phase.toFixed(3));
    card.style.setProperty('--scene-presence',Math.sin(Math.PI*phase).toFixed(3));
    card.style.setProperty('--scene-drift',((phase-.5)*24).toFixed(1)+'px');
   });
   if(!navigating && visibleIndex!==activeIndex){
    activeIndex=visibleIndex;
    setActive(cards[visibleIndex].id);
   }
  };
  const queue=()=>{if(!raf)raf=window.requestAnimationFrame(update);};
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue);

  // A full-sized entering card gently pitches around its HORIZONTAL edge.
  // The element and its real content animate; there is no text preview.
  const entryObserver=('IntersectionObserver' in window)?
   new IntersectionObserver(entries=>{
    for(const entry of entries){
     if(!entry.isIntersecting || navigating)continue;
     const card=entry.target as HTMLElement;
     entryObserver?.unobserve(card);
     if(card===cards[0]||motion.matches)continue;
     card.animate([
      {opacity:.78,transform:'perspective(1500px) rotateX(-13deg) translateY(18px)'},
      {opacity:1,transform:'perspective(1500px) rotateX(0deg) translateY(0)'}
     ],{duration:370,easing:'cubic-bezier(.2,.78,.2,1)'});
    }
   },{rootMargin:'0px 0px -12% 0px',threshold:0}):null;
  cards.slice(1).forEach(card=>entryObserver?.observe(card));
  const locate=(i:number)=>{
   const marker=markers[i];
   return Math.max(0,window.scrollY+marker.getBoundingClientRect().top
    - (document.querySelector<HTMLElement>('.header')?.offsetHeight??78)-12);
  };
  const interrupt=()=>{
   navigationToken++;
   currentAnimation?.cancel();
   currentAnimation=null;
   navigating=false;
  };
  const go=(id:string,saveHistory:boolean,focus:boolean,instant=false)=>{
   const targetIndex=cards.findIndex(card=>card.id===id);
   if(targetIndex<0)return;
   interrupt();
   const token=navigationToken;
   const direction=targetIndex>=activeIndex?1:-1;
   const steps:number[]=[];
   if(instant||motion.matches||targetIndex===activeIndex){
    steps.push(targetIndex);
   }else{
    for(let i=activeIndex+direction;direction>0?i<=targetIndex:i>=targetIndex;i+=direction){
     steps.push(i);
    }
   }
   navigating=true;
   void (async()=>{
    for(let n=0;n<steps.length;n++){
     if(token!==navigationToken)return;
     const step=steps[n];
     const card=cards[step];
     reveal(card);
     // This is an instantaneous position change, not a smooth-page scroll.
     // The real section panel performs the visible vertical card turn.
     window.scrollTo({top:locate(step),behavior:'instant'});
     if(!instant&&!motion.matches && 'animate' in card){
      const last=n===steps.length-1;
      currentAnimation=card.animate([
       {opacity:.52,transform:'perspective(1500px) rotateX('+(direction>0?-19:19)+'deg) translateY('+(direction>0?22:-22)+'px)'},
       {opacity:1,transform:'perspective(1500px) rotateX(0deg) translateY(0)'}
      ],{duration:last?310:115,easing:'cubic-bezier(.16,.7,.2,1)'});
      await currentAnimation.finished.catch(()=>{});
      currentAnimation=null;
     }
    }
    if(token!==navigationToken)return;
    navigating=false;
    activeIndex=targetIndex;
    setActive(id);
    if(saveHistory && window.location.hash!=='#'+id){
     window.history.pushState(null,'','#'+id);
    }
    if(focus)cards[targetIndex].focus({preventScroll:true});
    queue();
   })();
  };
  navigateSectionRef.current=id=>go(id,true,true);
  const onClick=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   if(!(event.target instanceof Element))return;
   const anchor=event.target.closest<HTMLAnchorElement>('a[href^="#"]');
   if(!anchor||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self'))return;
   const id=decodeURIComponent(anchor.hash.slice(1));
   if(!cards.some(card=>card.id===id))return;
   event.preventDefault();
   go(id,true,true);
  };
  const onHistory=()=>{
   const id=decodeURIComponent(window.location.hash.slice(1));
   if(cards.some(card=>card.id===id))go(id,false,true,true);
  };
  const onUserInput=()=>{if(navigating)interrupt();};
  document.addEventListener('click',onClick);
  window.addEventListener('popstate',onHistory);
  window.addEventListener('hashchange',onHistory);
  window.addEventListener('wheel',onUserInput,{passive:true});
  window.addEventListener('touchstart',onUserInput,{passive:true});
  // Hash links opened from outside the site must also land correctly.
  if(window.location.hash){
   const id=decodeURIComponent(window.location.hash.slice(1));
   if(cards.some(card=>card.id===id)){
    window.requestAnimationFrame(()=>go(id,false,false,true));
   }
  }
  update();
  return ()=>{
   interrupt();
   sizes?.disconnect();
   entryObserver?.disconnect();
   if(raf)window.cancelAnimationFrame(raf);
   navigateSectionRef.current=()=>{};
   document.removeEventListener('click',onClick);
   window.removeEventListener('popstate',onHistory);
   window.removeEventListener('hashchange',onHistory);
   window.removeEventListener('wheel',onUserInput);
   window.removeEventListener('touchstart',onUserInput);
   window.removeEventListener('scroll',queue);
   window.removeEventListener('resize',queue);
   markers.forEach(marker=>marker.remove());
   cards.forEach(card=>{
    card.style.removeProperty('--stack-card-height');
    card.style.removeProperty('--scene-progress');
    card.style.removeProperty('--scene-presence');
    card.style.removeProperty('--scene-drift');
    card.classList.remove('is-illuminated');
    if(card.dataset.shuffleTabindex){
     card.removeAttribute('tabindex');
     delete card.dataset.shuffleTabindex;
    }
   });
   main.classList.remove('scroll-stack-ready');
  };
 },[setActive,progressRef,navigateSectionRef]);
}
