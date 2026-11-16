import {useEffect,useState} from 'react';

/**
 * Desktop: natural-height cards stack through CSS sticky positioning.
 * The next opaque card comes over the previous one as the page scrolls.
 * Mobile and touch-first devices retain normal document scrolling.
 */
export default function useCardDeck(
 setActive:(id:string)=>void,
 progressRef:{current:HTMLDivElement|null},
 navigateSectionRef:{current:(id:string)=>void}
){
 const plainScrollQuery='(max-width: 1024px), (pointer: coarse), (hover: none)';
 const [plainScroll,setPlainScroll]=useState(
  ()=>typeof window!=='undefined'&&window.matchMedia(plainScrollQuery).matches
 );
 useEffect(()=>{
  const query=window.matchMedia(plainScrollQuery);
  const onChange=()=>setPlainScroll(query.matches);
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
  let frame=0;
  const updateProgress=()=>{
   const range=document.documentElement.scrollHeight-window.innerHeight;
   const progress=range>0?Math.min(1,Math.max(0,window.scrollY/range)):0;
   if(progressRef.current)progressRef.current.style.transform='scaleX('+progress+')';
  };
  const queueProgress=()=>{
   if(!frame)frame=window.requestAnimationFrame(()=>{
    frame=0;
    updateProgress();
   });
  };

  if(plainScroll){
   // Ordinary anchors and unmodified sections; no sticky or card controller.
   navigateSectionRef.current=id=>{
    const target=cards.find(card=>card.id===id);
    if(!target)return;
    if(window.location.hash!=='#'+id)window.history.pushState(null,'','#'+id);
    setActive(id);
    target.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
   };
   const observer=('IntersectionObserver' in window)
    ?new IntersectionObserver(entries=>{
      for(const entry of entries){
       if(entry.isIntersecting)setActive(entry.target.id);
      }
     },{rootMargin:'-20% 0px -62% 0px',threshold:0})
    :null;
   cards.forEach(card=>observer?.observe(card));
   window.addEventListener('scroll',queueProgress,{passive:true});
   window.addEventListener('resize',queueProgress);
   queueProgress();
   return ()=>{
    observer?.disconnect();
    if(frame)window.cancelAnimationFrame(frame);
    window.removeEventListener('scroll',queueProgress);
    window.removeEventListener('resize',queueProgress);
    navigateSectionRef.current=()=>{};
   };
  }

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
  const cancelPlacement=()=>{
   destinationAnimation?.cancel();
   destinationAnimation=null;
  };
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue);
  document.addEventListener('click',onClick);
  window.addEventListener('popstate',onHistory);
  window.addEventListener('hashchange',onHistory);
  window.addEventListener('wheel',cancelPlacement,{passive:true});
  window.addEventListener('touchstart',cancelPlacement,{passive:true});
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
 },[setActive,progressRef,navigateSectionRef,plainScroll]);
}
