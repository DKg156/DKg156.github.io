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
  // Remember scroll direction so the returning card can come ABOVE the
  // newer section during reverse scrolling. CSS source order alone cannot
  // uncover a previous sticky card's final paragraphs.
  let lastScrollY=window.scrollY;
  let upward=false;
  let returningIndex=-1;
  const setReturning=(index:number)=>{
   if(returningIndex===index)return;
   if(returningIndex>=0)cards[returningIndex].classList.remove('card-returning');
   returningIndex=index;
   if(index>=0)cards[index].classList.add('card-returning');
  };
  const flipping=new Set<HTMLElement>();
  const clearFlip=(card:HTMLElement)=>{
   if(!flipping.has(card))return;
   card.style.removeProperty('transform');
   card.style.removeProperty('opacity');
   card.classList.remove('card-scroll-flipping');
   flipping.delete(card);
  };
  const clearAllFlips=()=>{for(const card of Array.from(flipping))clearFlip(card);};
  const update=()=>{
   raf=0;
   const viewport=window.innerHeight;
   const total=document.documentElement.scrollHeight-viewport;
   if(progressRef.current){
    progressRef.current.style.transform='scaleX('+(
     total>0?Math.min(1,Math.max(0,window.scrollY/total)):0
    )+')';
   }
   // Stable flow markers are not transformed or sticky. Read geometry first,
   // then write transforms so each scroll frame needs no forced layout.
   const currentScroll=window.scrollY;
   if(Math.abs(currentScroll-lastScrollY)>0.5)upward=currentScroll<lastScrollY;
   lastScrollY=currentScroll;
   const markerY=markers.map(marker=>marker.getBoundingClientRect().top);
   const rects=cards.map(card=>card.getBoundingClientRect());
   // The next card must have physically entered the reading area before a
   // reverse card comes forward. A higher z-index then exposes its bottom
   // paragraphs instead of leaving them buried under newer sticky cards.
   const start=viewport*.78;
   const finish=viewport*.43;
   const returningBoundary=upward&&!navigating
    ?markerY.findIndex((y,i)=>i>0&&y>=finish)
    :-1;
   setReturning(returningBoundary>0?returningBoundary-1:-1);
   let visibleIndex=0;
   markerY.forEach((y,i)=>{if(y<=viewport*(upward?.78:.55))visibleIndex=i;});
   cards.forEach((card,i)=>{
    const rect=rects[i];
    const visible=rect.bottom>0&&rect.top<viewport;
    const lit=visible&&i===visibleIndex;
    if(card.classList.contains('is-illuminated')!==lit){
     card.classList.toggle('is-illuminated',lit);
    }
    if(visible&&!motion.matches){
     const phase=Math.max(0,Math.min(1,(viewport-rect.top)/(viewport+rect.height)));
     card.style.setProperty('--scene-progress',phase.toFixed(3));
     card.style.setProperty('--scene-presence',Math.sin(Math.PI*phase).toFixed(3));
     card.style.setProperty('--scene-drift',((phase-.5)*24).toFixed(1)+'px');
    }
    // The same rotateX(±19deg) card turn used by navigation is now
    // driven continuously by the user's scroll, in either direction.
    // Sections outside the short transition band have no transform.
    if(motion.matches||navigating){
     clearFlip(card);
     return;
    }
    // Reversing: return the PREVIOUS real card above the later card, with
    // a small vertical flip-in. Once fully returned it stays above, so its
    // bottom content remains accessible instead of being overlapped.
    if(upward){
     const boundaryY=markerY[i+1];
     if(i!==returningIndex||boundaryY===undefined||
        boundaryY<=finish||boundaryY>=start){
      clearFlip(card);
      return;
     }
     const progress=(boundaryY-finish)/(start-finish);
     const eased=progress*progress*(3-2*progress);
     const remaining=1-eased;
     card.style.transform='perspective(1500px) rotateX('+(16*remaining).toFixed(2)+'deg) translateY('+(-16*remaining).toFixed(2)+'px)';
     card.style.opacity=(.2+.8*eased).toFixed(3);
    }else{
     // Forward: keep the existing scroll-linked vertical flip. Earlier
     // sections remain in their natural order until the new one arrives.
     if(i===0){
      clearFlip(card);
      return;
     }
     const y=markerY[i];
     if(y>=start||y<=finish){
      clearFlip(card);
      return;
     }
     const progress=(start-y)/(start-finish);
     const turn=Math.sin(Math.PI*progress);
     card.style.transform='perspective(1500px) rotateX('+(-19*turn).toFixed(2)+'deg) translateY('+(22*turn).toFixed(2)+'px)';
     card.style.opacity=(1-.25*turn).toFixed(3);
    }
    if(!flipping.has(card)){
     flipping.add(card);
     card.classList.add('card-scroll-flipping');
    }
   });
   if(!navigating&&visibleIndex!==activeIndex){
    activeIndex=visibleIndex;
    setActive(cards[visibleIndex].id);
   }
  };
  const queue=()=>{if(!raf)raf=window.requestAnimationFrame(update);};
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue);

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
   clearAllFlips();
   setReturning(-1);
  };
  const go=(id:string,saveHistory:boolean,focus:boolean,instant=false)=>{
   const targetIndex=cards.findIndex(card=>card.id===id);
   if(targetIndex<0)return;
   interrupt();
   const token=navigationToken;
   const direction=targetIndex>=activeIndex?1:-1;
   const card=cards[targetIndex];
   navigating=true;
   reveal(card);
   // One direct jump to the requested section. Intervening sections are
   // never animated, scrolled through, or displayed as placeholders.
   window.scrollTo({top:locate(targetIndex),behavior:'instant'});
   void (async()=>{
    if(!instant&&!motion.matches&&'animate' in card){
     currentAnimation=card.animate([
      {opacity:.75,transform:'perspective(1500px) rotateX('+(direction>0?-19:19)+'deg) translateY('+(direction>0?22:-22)+'px)'},
      {opacity:1,transform:'perspective(1500px) rotateX(0deg) translateY(0)'}
     ],{duration:310,easing:'cubic-bezier(.16,.7,.2,1)'});
     await currentAnimation.finished.catch(()=>{});
     currentAnimation=null;
    }
    if(token!==navigationToken)return;
    navigating=false;
    activeIndex=targetIndex;
    setActive(id);
    if(saveHistory&&window.location.hash!=='#'+id){
     window.history.pushState(null,'','#'+id);
    }
    if(focus)card.focus({preventScroll:true});
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
   setReturning(-1);
   clearAllFlips();
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
