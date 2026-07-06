import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function ImageSwiper({
  cards,
  cardWidth = 256,
  cardHeight = 352,
  className = ''
}) {
  const cardStackRef = useRef(null);
  const isSwiping = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const activeCardRef = useRef(null);
  const animationFrameId = useRef(null);
  const [cardOrder, setCardOrder] = useState(() => Array.from({
    length: cards.length
  }, (_, i) => i));

  const getCards = useCallback(() => {
    if (!cardStackRef.current) return [];
    return Array.from(cardStackRef.current.querySelectorAll('.image-card'));
  }, []);

  const getActiveCard = useCallback(() => {
    return getCards()[0] || null;
  }, [getCards]);

  const updateCardPositions = useCallback(() => {
    getCards().forEach((card, i) => {
      card.style.setProperty('--i', i.toString());
      card.style.setProperty('--swipe-x', '0px');
      card.style.setProperty('--swipe-rotate', '0deg');
      card.style.opacity = '1';
      card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    });
  }, [getCards]);

  const applySwipeStyles = useCallback(deltaX => {
    const card = activeCardRef.current;
    if (!card) return;
    const rotation = deltaX * 0.1;
    const opacity = 1 - Math.abs(deltaX) / (cardWidth * 1.5);
    card.style.setProperty('--swipe-x', `${deltaX}px`);
    card.style.setProperty('--swipe-rotate', `${rotation}deg`);
    card.style.opacity = opacity.toString();
  }, [cardWidth]);

  const handleStart = useCallback(clientX => {
    if (isSwiping.current) return;
    isSwiping.current = true;
    startX.current = clientX;
    currentX.current = clientX;
    activeCardRef.current = getActiveCard();
    
    if (activeCardRef.current) {
      activeCardRef.current.style.transition = 'none';
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, [getActiveCard]);

  const handleMove = useCallback(clientX => {
    if (!isSwiping.current) return;
    currentX.current = clientX;
    animationFrameId.current = requestAnimationFrame(() => {
      const deltaX = currentX.current - startX.current;
      applySwipeStyles(deltaX);
    });
  }, [applySwipeStyles]);

  const handleEnd = useCallback(() => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    const deltaX = currentX.current - startX.current;
    const threshold = cardWidth / 3;
    const card = activeCardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    if (Math.abs(deltaX) > threshold) {
      const direction = Math.sign(deltaX);
      const swipeOutX = direction * (cardWidth * 1.5);
      card.style.setProperty('--swipe-x', `${swipeOutX}px`);
      card.style.setProperty('--swipe-rotate', `${direction * 15}deg`);
      card.style.opacity = '0';
      
      setTimeout(() => {
        card.style.transition = 'none'; // Instantly teleport to back
        setCardOrder(prev => [...prev.slice(1), prev[0]]);
        
        // Re-enable transitions safely after teleport
        setTimeout(() => {
          if (card) {
            card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
          }
        }, 50);
      }, 300);
    } else {
      applySwipeStyles(0);
    }
  }, [getActiveCard, applySwipeStyles, cardWidth]);

  useEffect(() => {
    const element = cardStackRef.current;
    if (!element) return;
    const onPointerDown = e => handleStart(e.clientX);
    const onPointerMove = e => handleMove(e.clientX);
    const onPointerUp = () => handleEnd();
    const onPointerLeave = () => handleEnd();
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointerleave', onPointerLeave);
    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointerleave', onPointerLeave);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleStart, handleMove, handleEnd]);

  useEffect(() => {
    updateCardPositions();
  }, [cardOrder, updateCardPositions]);

  return (
    <section ref={cardStackRef} className={`relative grid place-content-center select-none ${className}`} style={{
      width: cardWidth + 32,
      height: cardHeight + 32,
      perspective: '1000px',
      touchAction: 'none'
    }}>
      {cardOrder.map((originalIndex, displayIndex) => {
        const card = cards[originalIndex];
        return (
          <article key={card.id || displayIndex} className="image-card absolute cursor-grab active:cursor-grabbing place-self-center border border-gold/20 rounded-2xl shadow-xl overflow-hidden will-change-transform bg-zinc-900" style={{
            '--i': displayIndex.toString(),
            '--swipe-x': '0px',
            '--swipe-rotate': '0deg',
            width: cardWidth,
            height: cardHeight,
            zIndex: cards.length - displayIndex,
            transform: `
              translateY(calc(var(--i) * 20px))
              scale(calc(1 - var(--i) * 0.06))
              rotate(calc(var(--i) * -1.5deg))
              translateX(var(--swipe-x))
              rotate(calc(var(--swipe-rotate)))
            `
          }}>
            <img src={card.imageUrl || card.image} alt={card.title || "Image"} className="w-full h-full object-cover pointer-events-none" draggable={false} onError={e => {
              const target = e.target;
              target.onerror = null;
              target.src = `https://placehold.co/${cardWidth}x${cardHeight}/2d3748/e2e8f0?text=Image+Not+Found`;
            }} />
            
            {card.title && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                  <div className="h-[2px] w-10 bg-[#d4af37] mb-3 opacity-80" />
                  <h3 className="text-white font-serif text-xl font-light mb-2">{card.title}</h3>
                  {card.description && (
                    <p className="text-white/80 text-sm leading-relaxed">{card.description}</p>
                  )}
                </div>
              </>
            )}
          </article>
        );
      })}
    </section>
  );
}
