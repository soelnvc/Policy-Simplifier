import React, { useEffect, useRef, useState } from 'react';

const ScrollSequence = ({ 
  frameCount = 192, 
  path = '/SequenceAnimation/_MConverter.eu_Digital_page_floating_202604192114-', 
  extension = 'png' 
}) => {
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // 1. Preload all images into memory
  useEffect(() => {
    const loadedImages = [];
    let loadedCount = 0;

    const preloadImages = () => {
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        // Handle zero-padding (e.g., 000, 001, 010, 100)
        const frameNumber = String(i).padStart(3, '0');
        img.src = `${path}${frameNumber}.${extension}`;
        img.onload = () => {
          loadedCount++;
          setLoadProgress(Math.floor((loadedCount / frameCount) * 100));
          if (loadedCount === frameCount) {
            setImages(loadedImages);
            setIsLoading(false);
          }
        };
        img.onerror = () => {
          console.error(`Failed to load frame: ${img.src}`);
          loadedCount++; // Increment anyway so the loader moves forward
          if (loadedCount === frameCount) {
            setImages(loadedImages);
            setIsLoading(false);
          }
        };
        loadedImages[i] = img;
      }
    };

    preloadImages();
  }, [frameCount, path, extension]);

  // 2. Main Render Loop
  useEffect(() => {
    if (isLoading || images.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const renderFrame = (index) => {
      const img = images[index];
      if (!img) return;

      // Clear and draw with "cover" logic
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.width;
      const imgHeight = img.height;
      
      const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;
      const x = (canvasWidth - newWidth) / 2;
      const y = (canvasHeight - newHeight) / 2;

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.drawImage(img, x, y, newWidth, newHeight);
    };

    // 3. Scroll Listener
    const handleScroll = () => {
      const html = document.documentElement;
      const section = canvas.closest('.hero-track');
      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight - window.innerHeight;
      const scrollTop = window.pageYOffset || html.scrollTop;
      
      // Calculate how far we are through the HERO TRACK
      let scrollFraction = (scrollTop - sectionTop) / sectionHeight;
      
      // Clamp between 0 and 1
      scrollFraction = Math.max(0, Math.min(scrollFraction, 1));

      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount) + 1
      );

      requestAnimationFrame(() => renderFrame(frameIndex));
    };

    // Initial render
    renderFrame(1);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', () => {
      // Handle canvas resize
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      handleScroll();
    });

    // Set initial size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLoading, images, frameCount]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--onyx-rich)',
          zIndex: 10
        }}>
          <p className="text-overline" style={{ marginBottom: '1rem' }}>Loading Sequence</p>
          <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div style={{ 
              width: `${loadProgress}%`, 
              height: '100%', 
              background: 'var(--snow)', 
              transition: 'width 0.2s ease-out' 
            }} />
          </div>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 1s ease'
        }} 
      />
    </div>
  );
};

export default ScrollSequence;
