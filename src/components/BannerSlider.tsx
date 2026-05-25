import { useState, useRef, type UIEvent } from 'react';

export default function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getSlideScrollWidth = () => {
    if (!scrollRef.current || !scrollRef.current.firstElementChild) return 0;
    // Slide width + gap (12px for gap-3 in Tailwind)
    return (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 12;
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const slideWidth = getSlideScrollWidth();
    if (slideWidth === 0) return;
    
    const scrollPosition = e.currentTarget.scrollLeft;
    const newIndex = Math.round(scrollPosition / slideWidth);
    
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const slideWidth = getSlideScrollWidth();
    scrollRef.current.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative w-full py-3">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto flex snap-x snap-mandatory gap-3 px-3" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="w-[90%] shrink-0 snap-center snap-always h-48 bg-blue-500 flex items-center justify-center rounded-xl">
          <span className="text-white text-2xl font-bold">Slide 1</span>
        </div>
        <div className="w-[90%] shrink-0 snap-center snap-always h-48 bg-green-500 flex items-center justify-center rounded-xl">
          <span className="text-white text-2xl font-bold">Slide 2</span>
        </div>
        <div className="w-[90%] shrink-0 snap-center snap-always h-48 bg-red-500 flex items-center justify-center rounded-xl">
          <span className="text-white text-2xl font-bold">Slide 3</span>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              activeIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
