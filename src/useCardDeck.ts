import {useEffect,useState} from 'react';

/**
 * Desktop has native CSS sticky card stacking. Touch-first devices and
 * narrower viewports keep the same card styling but scroll in normal flow.
 * Back-to-top travels through section boundaries in either mode.
 */
export default function useCardDeck(
 setActive:(id:string)=>void,
 progressRef:{current:HTMLDivElement|null},
 navigateSectionRef:{current:(id:string)=>void}
){
 const simpleQuery='(max-width: 1024px), (pointer: coarse), (hover: none)';
 const [simpleScroll,setSimpleScroll]=useState(
  ()=>typeof window!=='undefined'&&window.matchMedia(simpleQuery).matches
 );
 useEffect(()=>{
  const query=window.matchMedia(simpleQuery);
  const onChange=()=>setSimpleScroll(query.matches);
  onChange();
  query.addEventListener('change',onChange);
  return ()=>query.removeEventListener('change',onChange);
 },[]);
 useEffect(()=>{
  const main=document.querySelector<HTMLElement>('#main');
  if(!main)return;
  const cards=Array.from(main.querySelectorAll<HTMLElement>(':scope > section[id]'));
  if(!cards.length)return;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

  if(simpleScroll){
   // No sticky measurements, ResizeObserver, scroll transforms or large-card
   // animation on phones, tablets, or other touch-first devices.
   let progressFrame=0;
   let journeyFrame=0;
   let journeyToken=0;
   const cancelJourney=()=>{
    journeyToken++;
    if(journeyFrame)window.cancelAnimationFrame(journeyFrame);
    journeyFrame=0;
   };
   const getTop=(card:HTMLElement)=>{
    const header=document.querySelector<HTMLElement>('.header')?.offsetHeight??68;
    return Math.max(0,window.scrollY+card.getBoundingClientRect().top-header-10);
   };
   const go=(id:string,saveHistory:boolean,focus:boolean)=>{
    const card=cards.find(item=>item.id===id);
    if(!card)return;
    cancelJourney();
    window.scrollTo({top:getTop(card),behavior:'instant'});
    if(saveHistory&&window.location.hash!=='#'+id){
     window.history.pushState(null,'','#'+id);
    }
    setActive(id);
    if(focus)card.focus({preventScroll:true});
   };
   // Keep the specifically requested Back-to-top journey past each card,
   // but do not animate, rotate, or overlap the cards themselves.
   const backToTop=()=>{
    cancelJourney();
    if(reducedMotion.matches||window.scrollY<2){
     go('home',true,true);
     return;
    }
    const token=journeyToken;
    const origin=window.scrollY;
    const stops=cards.map(getTop).filter(y=>y>1&&y<origin-2).reverse();
    stops.push(0);
    const advance=(index:number)=>{
     if(token!==journeyToken)return;
     const from=window.scrollY,to=stops[index];
     const duration=Math.min(210,Math.max(130,110+Math.abs(from-to)*.025));
     const begun=window.performance.now();
     const tick=(now:number)=>{
      if(token!==journeyToken)return;
      const p=Math.min(1,(now-begun)/duration);
      const eased=p*p*(3-2*p);
      window.scrollTo({top:from+(to-from)*eased,behavior:'instant'});
      if(p<1)journeyFrame=window.requestAnimationFrame(tick);
      else if(index+1<stops.length)journeyFrame=window.requestAnimationFrame(()=>advance(index+1));
      else{
       journeyFrame=0;
       setActive('home');
       if(window.location.hash!=='#home')window.history.pushState(null,'','#home');
       cards[0].focus({preventScroll:true});
      }
     };
     journeyFrame=window.requestAnimationFrame(tick);
    };
    advance(0);
   };
   cards.forEach(card=>{
    if(!card.hasAttribute('tabindex')){
     card.tabIndex=-1;
     card.dataset.staticCardTabindex='true';
    }
   });
   navigateSectionRef.current=id=>go(id,true,true);
   const onClick=(event:MouseEvent)=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    if(!(event.target instanceof Element))return;
    const anchor=event.target.closest<HTMLAnchorElement>('a[href^="#"]');
    if(!anchor||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self'))return;
    const id=decodeURIComponent(anchor.hash.slice(1));
    if(!cards.some(card=>card.id===id))return;
    event.preventDefault();
    if(anchor.dataset.scrollThroughCards==='true')backToTop();
    else go(id,true,true);
   };
   const onHistory=()=>{
    const id=decodeURIComponent(window.location.hash.slice(1));
    if(cards.some(card=>card.id===id))go(id,false,true);
   };
   const observer=('IntersectionObserver' in window)
    ?new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);
     },{rootMargin:'-20% 0px -62% 0px',threshold:0})
    :null;
   cards.forEach(card=>observer?.observe(card));
   const updateProgress=()=>{
    progressFrame=0;
    const range=document.documentElement.scrollHeight-window.innerHeight;
    if(progressRef.current){
     progressRef.current.style.transform='scaleX('+
      (range>0?Math.min(1,Math.max(0,window.scrollY/range)):0)+')';
    }
   };
   const queueProgress=()=>{
    if(!progressFrame)progressFrame=window.requestAnimationFrame(updateProgress);
   };
   const interrupt=()=>cancelJourney();
   const onKeyDown=(event:KeyboardEvent)=>{
    if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))cancelJourney();
   };
   document.addEventListener('click',onClick);
   window.addEventListener('popstate',onHistory);
   window.addEventListener('hashchange',onHistory);
   window.addEventListener('scroll',queueProgress,{passive:true});
   window.addEventListener('resize',queueProgress);
   window.addEventListener('wheel',interrupt,{passive:true});
   window.addEventListener('touchstart',interrupt,{passive:true});
   window.addEventListener('keydown',onKeyDown);
   if(window.location.hash){
    const id=decodeURIComponent(window.location.hash.slice(1));
    if(cards.some(card=>card.id===id))window.requestAnimationFrame(()=>go(id,false,false));
   }
   queueProgress();
   return ()=>{
    cancelJourney();
    observer?.disconnect();
    if(progressFrame)window.cancelAnimationFrame(progressFrame);
    document.removeEventListener('click',onClick);
    window.removeEventListener('popstate',onHistory);
    window.removeEventListener('hashchange',onHistory);
    window.removeEventListener('scroll',queueProgress);
    window.removeEventListener('resize',queueProgress);
    window.removeEventListener('wheel',interrupt);
    window.removeEventListener('touchstart',interrupt);
    window.removeEventListener('keydown',onKeyDown);
    cards.forEach(card=>{
     if(card.dataset.staticCardTabindex){
      card.removeAttribute('tabindex');
      delete card.dataset.staticCardTabindex;
     }
    });
    navigateSectionRef.current=()=>{};
   };
  }
  let frame=0;
  const updateProgress=()=>{
   const range=document.documentElement.scrollHeight-window.innerHeight;
   const progress=range>0?Math.min(1,Math.max(0,window.scrollY/range)):0;
   if(progressRef.current)progressRef.current.style.transform='scaleX('+progress+')';
  };

  // Stable flow markers keep anchor locations correct even when a section
  // has been pinned by sticky positioning.
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
  const sizeObserver=('ResizeObserver' in window)
   ?new ResizeObserver(entries=>{
     for(const entry of entries){
      const card=entry.target as HTMLElement;
      const height=card.offsetHeight+'px';
      if(card.style.getPropertyValue('--stack-card-height')!==height){
       card.style.setProperty('--stack-card-height',height);
      }
     }
    }):null;
  cards.forEach(card=>{
   card.style.setProperty('--stack-card-height',card.offsetHeight+'px');
   sizeObserver?.observe(card);
   if(!card.hasAttribute('tabindex')){
    card.tabIndex=-1;
    card.dataset.stackTabindex='true';
   }
  });
  main.classList.add('scroll-stack-ready');
  let activeIndex=0;
  let destinationAnimation:Animation|null=null;
  let journeyFrame=0;
  let journeyToken=0;
  const cancelJourney=()=>{
   journeyToken++;
   if(journeyFrame)window.cancelAnimationFrame(journeyFrame);
   journeyFrame=0;
  };
  const update=()=>{
   frame=0;
   updateProgress();
   const viewport=window.innerHeight;
   // Collect layout reads first, then apply only lightweight decoration.
   const markerY=markers.map(marker=>marker.getBoundingClientRect().top);
   const rects=cards.map(card=>card.getBoundingClientRect());
   let current=0;
   markerY.forEach((y,i)=>{if(y<=viewport*.55)current=i;});
   if(current!==activeIndex){
    activeIndex=current;
    setActive(cards[current].id);
   }
   cards.forEach((card,i)=>{
    const rect=rects[i];
    const illuminated=i===current&&rect.bottom>0&&rect.top<viewport;
    if(card.classList.contains('is-illuminated')!==illuminated){
     card.classList.toggle('is-illuminated',illuminated);
    }
    if(rect.bottom<=0||rect.top>=viewport||reducedMotion.matches)return;
    const phase=Math.max(0,Math.min(1,(viewport-rect.top)/(viewport+rect.height)));
    card.style.setProperty('--scene-progress',phase.toFixed(3));
    card.style.setProperty('--scene-presence',Math.sin(Math.PI*phase).toFixed(3));
    card.style.setProperty('--scene-drift',((phase-.5)*24).toFixed(1)+'px');
   });
  };
  const queue=()=>{
   if(!frame)frame=window.requestAnimationFrame(update);
  };
  const locate=(i:number)=>{
   const offset=document.querySelector<HTMLElement>('.header')?.offsetHeight??78;
   return Math.max(0,window.scrollY+markers[i].getBoundingClientRect().top-offset-12);
  };
  const go=(id:string,saveHistory:boolean,focus:boolean,instant=false)=>{
   const index=cards.findIndex(card=>card.id===id);
   if(index<0)return;
   cancelJourney();
   destinationAnimation?.cancel();
   destinationAnimation=null;
   const card=cards[index];
   reveal(card);
   const alreadyHere=index===activeIndex;
   // The actual full-size destination card is placed directly on top.
   // No intermediate section playback or scrolling through the entire page.
   window.scrollTo({top:locate(index),behavior:'instant'});
   activeIndex=index;
   setActive(id);
   if(saveHistory&&window.location.hash!=='#'+id){
    window.history.pushState(null,'','#'+id);
   }
   if(focus)card.focus({preventScroll:true});
   if(!instant&&!alreadyHere&&!reducedMotion.matches&&'animate' in card){
    // A brief upward placement, never rotation or transparency.
    const animation=card.animate([
     {transform:'translateY(28px)'},
     {transform:'translateY(0px)'}
    ],{duration:240,easing:'cubic-bezier(.2,.8,.2,1)'});
    destinationAnimation=animation;
    void animation.finished.catch(()=>{}).then(()=>{
     if(destinationAnimation===animation)destinationAnimation=null;
    });
   }
   queue();
  };
  // Back to top is intentionally different from every other section link.
  // Scrub past each real card boundary on the way to Home, never teleport
  // over the intervening cards. A new navigation or user gesture cancels it.
  const backToTop=()=>{
   cancelJourney();
   destinationAnimation?.cancel();
   destinationAnimation=null;
   const startY=window.scrollY;
   if(startY<=1||reducedMotion.matches){
    go('home',true,true,true);
    return;
   }
   const token=journeyToken;
   const headerOffset=(document.querySelector<HTMLElement>('.header')?.offsetHeight??78)+12;
   const stops=markers.map(marker=>Math.max(0,window.scrollY+marker.getBoundingClientRect().top-headerOffset))
    .filter(y=>y<startY-3&&y>2).reverse();
   stops.push(0);
   const moveTo=(index:number)=>{
    if(token!==journeyToken)return;
    const from=window.scrollY;
    const to=stops[index];
    const distance=Math.abs(from-to);
    const duration=Math.min(210,Math.max(130,110+distance*.025));
    const start=window.performance.now();
    const tick=(now:number)=>{
     if(token!==journeyToken)return;
     const t=Math.min(1,(now-start)/duration);
     const eased=t*t*(3-2*t);
     window.scrollTo({top:from+(to-from)*eased,behavior:'instant'});
     if(t<1){
      journeyFrame=window.requestAnimationFrame(tick);
     }else if(index+1<stops.length){
      journeyFrame=window.requestAnimationFrame(()=>moveTo(index+1));
     }else{
      journeyFrame=0;
      activeIndex=0;
      setActive('home');
      if(window.location.hash!=='#home'){
       window.history.pushState(null,'','#home');
      }
      cards[0].focus({preventScroll:true});
      queue();
     }
    };
    journeyFrame=window.requestAnimationFrame(tick);
   };
   moveTo(0);
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
   if(anchor.dataset.scrollThroughCards==='true'){
    backToTop();
    return;
   }
   go(id,true,true);
  };
  const onHistory=()=>{
   const id=decodeURIComponent(window.location.hash.slice(1));
   if(cards.some(card=>card.id===id))go(id,false,true,true);
  };
  const cancelPlacement=()=>{
   destinationAnimation?.cancel();
   destinationAnimation=null;
   cancelJourney();
  };
  const onKeyboardInput=(event:KeyboardEvent)=>{
   if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)){
    cancelJourney();
   }
  };
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue);
  document.addEventListener('click',onClick);
  window.addEventListener('popstate',onHistory);
  window.addEventListener('hashchange',onHistory);
  window.addEventListener('wheel',cancelPlacement,{passive:true});
  window.addEventListener('touchstart',cancelPlacement,{passive:true});
  window.addEventListener('keydown',onKeyboardInput);
  if(window.location.hash){
   const id=decodeURIComponent(window.location.hash.slice(1));
   if(cards.some(card=>card.id===id)){
    window.requestAnimationFrame(()=>go(id,false,false,true));
   }
  }
  update();
  return ()=>{
   cancelPlacement();
   sizeObserver?.disconnect();
   if(frame)window.cancelAnimationFrame(frame);
   navigateSectionRef.current=()=>{};
   window.removeEventListener('scroll',queue);
   window.removeEventListener('resize',queue);
   document.removeEventListener('click',onClick);
   window.removeEventListener('popstate',onHistory);
   window.removeEventListener('hashchange',onHistory);
   window.removeEventListener('wheel',cancelPlacement);
   window.removeEventListener('touchstart',cancelPlacement);
   window.removeEventListener('keydown',onKeyboardInput);
   markers.forEach(marker=>marker.remove());
   cards.forEach(card=>{
    card.style.removeProperty('--stack-card-height');
    card.style.removeProperty('--scene-progress');
    card.style.removeProperty('--scene-presence');
    card.style.removeProperty('--scene-drift');
    card.classList.remove('is-illuminated','card-returning','card-scroll-flipping');
    card.style.removeProperty('transform');
    card.style.removeProperty('opacity');
    if(card.dataset.stackTabindex){
     card.removeAttribute('tabindex');
     delete card.dataset.stackTabindex;
    }
   });
   main.classList.remove('scroll-stack-ready');
  };
 },[setActive,progressRef,navigateSectionRef,simpleScroll]);
}
