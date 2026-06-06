"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CARD_WIDTH = 256;
const CARD_HEIGHT = 171;
const NEIGHBOURS = [[0, -1], [0, 1], [1, 0], [-1, 0], [1, 1], [-1, 1], [-1, -1], [1, -1]];
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const applyDamping = (velocity, deltaTime) => {
  const dampingRate = 0.0028;
  return velocity * Math.exp(-dampingRate * deltaTime);
};
const smoothStep = (current, target, deltaTime, speed = 0.15) => current + (target - current) * (1 - Math.exp(-speed * deltaTime));

const useViewportSize = () => {
  const [size, setSize] = useState({
    width: 0,
    height: 0
  });
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

const useAnimationFrame = callback => {
  const requestRef = useRef(null);
  const previousTimeRef = useRef(undefined);
  const animate = useCallback(time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);
};

const Card = React.memo(({
  descriptor,
  x,
  y
}) => {
  const [opacity, setOpacity] = useState(0);
  const imgRef = useRef(null);
  
  useEffect(() => {
    setOpacity(0);
    const img = new Image();
    img.src = descriptor.src;
    const fadeIn = () => {
      let start = null;
      const fade = t => {
        if (start === null) start = t;
        const p = Math.min(1, (t - start) / 300);
        setOpacity(p);
        if (p < 1) requestAnimationFrame(fade);
      };
      requestAnimationFrame(fade);
    };
    if (img.decode) {
      img.decode().then(fadeIn).catch(fadeIn);
    } else {
      img.onload = fadeIn;
    }
  }, [descriptor]);

  return (
    <div 
      className="absolute overflow-hidden" 
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        willChange: 'transform',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        contain: 'layout style paint'
      }}
    >
      <div className="w-full h-full relative overflow-hidden border border-[#d4af37]/10 bg-zinc-900/50">
        <img 
          ref={imgRef} 
          src={descriptor.src} 
          alt={descriptor.title} 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" 
          style={{
            opacity,
            transition: 'opacity 0.4s ease-out',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }} 
          loading="lazy" 
          decoding="async" 
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => prevProps.descriptor === nextProps.descriptor && prevProps.x === nextProps.x && prevProps.y === nextProps.y);

Card.displayName = 'Card';

const InfiniteDraggableGrid = ({
  gallery
}) => {
  const viewportSize = useViewportSize();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [targetOffset, setTargetOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleCards, setVisibleCards] = useState([]);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());
  const picksRef = useRef({});
  const containerRef = useRef(null);
  const momentumRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const checkFullscreen = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        const isInFullscreenContainer = parent?.classList.contains('fixed') && parent?.classList.contains('inset-0');
        setIsFullscreen(isInFullscreenContainer || false);
      }
    };
    checkFullscreen();
    const observer = new MutationObserver(checkFullscreen);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
    return () => observer.disconnect();
  }, []);

  useAnimationFrame(useCallback(deltaTime => {
    if (!isDraggingRef.current) {
      momentumRef.current.x = applyDamping(momentumRef.current.x, deltaTime);
      momentumRef.current.y = applyDamping(momentumRef.current.y, deltaTime);
      if (Math.abs(momentumRef.current.x) < 0.01) momentumRef.current.x = 0;
      if (Math.abs(momentumRef.current.y) < 0.01) momentumRef.current.y = 0;
      setTargetOffset(prev => ({
        x: prev.x + momentumRef.current.x,
        y: prev.y + momentumRef.current.y
      }));
    }
    setOffset(prev => ({
      x: smoothStep(prev.x, targetOffset.x, deltaTime, isDraggingRef.current ? 0.4 : 0.18),
      y: smoothStep(prev.y, targetOffset.y, deltaTime, isDraggingRef.current ? 0.4 : 0.18)
    }));
  }, [targetOffset]));

  const handleDragStart = useCallback(e => {
    isDraggingRef.current = true;
    momentumRef.current = { x: 0, y: 0 };
    const point = 'touches' in e ? e.touches[0] : e;
    lastPositionRef.current = {
      x: point.clientX,
      y: point.clientY
    };
    lastTimeRef.current = Date.now();
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  }, []);

  const handleDragMove = useCallback(e => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const point = e instanceof TouchEvent ? e.touches[0] : e;
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTimeRef.current;
    const deltaX = point.clientX - lastPositionRef.current.x;
    const deltaY = point.clientY - lastPositionRef.current.y;
    if (timeDelta > 0) {
      const vx = deltaX / timeDelta * 16;
      const vy = deltaY / timeDelta * 16;
      setVelocity(prev => ({
        x: prev.x * 0.5 + vx * 0.5,
        y: prev.y * 0.5 + vy * 0.5
      }));
    }
    lastPositionRef.current = {
      x: point.clientX,
      y: point.clientY
    };
    lastTimeRef.current = currentTime;
    setTargetOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    momentumRef.current = {
      x: clamp(velocity.x, -30, 30),
      y: clamp(velocity.y, -30, 30)
    };
    setVelocity({ x: 0, y: 0 });
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  }, [velocity]);

  useEffect(() => {
    const move = e => handleDragMove(e);
    const end = () => handleDragEnd();
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchend', end);
    };
  }, [handleDragMove, handleDragEnd]);

  const visibleCardsData = useMemo(() => {
    if (!gallery.length || viewportSize.width === 0) return [];
    const getGalleryDescriptor = index => gallery[Math.abs(index % gallery.length)];
    const getRandomSafe = (col, row) => {
      let pick;
      let tries = 0;
      while (pick === undefined) {
        const rnd = Math.floor(Math.random() * gallery.length);
        const item = getGalleryDescriptor(rnd);
        let isSafe = true;
        for (const offsets of NEIGHBOURS) {
          const key = `${col + offsets[0]}:${row + offsets[1]}`;
          if (picksRef.current[key] === item) {
            isSafe = false;
            break;
          }
        }
        if (tries++ > 20 || isSafe) {
          pick = item;
        }
      }
      return pick;
    };
    const getRandomDescriptor = (col, row) => {
      const key = `${col}:${row}`;
      if (!picksRef.current[key]) {
        picksRef.current[key] = getRandomSafe(col, row);
      }
      return picksRef.current[key];
    };
    const getCardPos = (col, row) => {
      const x = col * CARD_WIDTH + Math.round(offset.x) % CARD_WIDTH - CARD_WIDTH;
      const y = row * CARD_HEIGHT + Math.round(offset.y) % CARD_HEIGHT - CARD_HEIGHT;
      return [x, y];
    };
    const isVisible = (x, y) => {
      const buffer = 100;
      return x + CARD_WIDTH > -buffer && y + CARD_HEIGHT > -buffer && x < viewportSize.width + buffer && y < viewportSize.height + buffer;
    };
    const viewCols = Math.ceil(viewportSize.width / CARD_WIDTH) + 4;
    const viewRows = Math.ceil(viewportSize.height / CARD_HEIGHT) + 4;
    const colOffset = Math.floor(offset.x / CARD_WIDTH) * -1;
    const rowOffset = Math.floor(offset.y / CARD_HEIGHT) * -1;
    const newVisibleCards = [];
    for (let row = -2; row < viewRows; row++) {
      for (let col = -2; col < viewCols; col++) {
        const tCol = colOffset + col;
        const tRow = rowOffset + row;
        const desc = getRandomDescriptor(tCol, tRow);
        const [x, y] = getCardPos(col, row);
        if (isVisible(x, y)) {
          newVisibleCards.push({
            key: `${tCol}:${tRow}`,
            descriptor: desc,
            x,
            y
          });
        }
      }
    }
    return newVisibleCards;
  }, [gallery, offset, viewportSize]);

  useEffect(() => {
    setVisibleCards(visibleCardsData);
  }, [visibleCardsData]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full select-none cursor-grab overflow-hidden ${isFullscreen ? 'fixed inset-0' : 'relative'}`} 
      onMouseDown={handleDragStart} 
      onTouchStart={handleDragStart} 
      style={{
        background: 'transparent',
        touchAction: 'none',
        minHeight: isFullscreen ? '100vh' : '400px',
        height: isFullscreen ? '100vh' : '100%',
        width: isFullscreen ? '100vw' : '100%',
        margin: 0,
        padding: 0
      }}
    >
      <div 
        className="absolute inset-0 overflow-hidden" 
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          width: '100%',
          height: '100%'
        }}
      >
        {visibleCards.map(card => (
          <Card key={card.key} descriptor={card.descriptor} x={card.x} y={card.y} />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h1 className="font-serif text-gold text-5xl md:text-7xl font-light tracking-widest opacity-60 select-none mix-blend-plus-lighter pointer-events-none">
          EXPLORE
        </h1>
      </div>
    </div>
  );
};

// Local gallery built from Yogi Studio assets
const LOCAL_GALLERY = [
  { id: 0, src: "src/assets/002.jpg", title: "Yogi Studio Photo 1" },
  { id: 1, src: "src/assets/01.jpg", title: "Yogi Studio Photo 2" },
  { id: 2, src: "src/assets/0G1A7726.jpg", title: "Yogi Studio Photo 3" },
  { id: 3, src: "src/assets/IMG-20240423-WA0045.jpg", title: "Yogi Studio Photo 4" },
  { id: 4, src: "src/assets/IMG-20240423-WA0055.jpg", title: "Yogi Studio Photo 5" },
  { id: 5, src: "src/assets/IMG-20240503-WA0019.jpg", title: "Yogi Studio Photo 6" },
  { id: 6, src: "src/assets/IMG-20240503-WA0021.jpg", title: "Yogi Studio Photo 7" },
  { id: 7, src: "src/assets/IMG-20240503-WA0022.jpg", title: "Yogi Studio Photo 8" },
  { id: 8, src: "src/assets/IMG-20240503-WA0027.jpg", title: "Yogi Studio Photo 9" },
  { id: 9, src: "src/assets/yogi-card-2.jpg", title: "Yogi Studio Photo 10" },
  { id: 10, src: "src/assets/yogi-card.jpg", title: "Yogi Studio Photo 11" }
];

export default function Infinitegrid() {
  return (
    <div className="w-full h-full bg-zinc-950 overflow-hidden m-0 min-h-[400px]">
      <InfiniteDraggableGrid gallery={LOCAL_GALLERY} />
    </div>
  );
}
