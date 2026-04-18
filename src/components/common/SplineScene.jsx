import React, { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

/**
 * SplineScene — Production-ready lazy-loaded Spline wrapper
 * 
 * IMPORTANT: The parent container MUST have explicit width and height.
 */
function SplineScene({ scene, className, onLoad, style }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            ...style
          }}
        >
          <div className="spline-loader-spinner" />
        </div>
      }
    >
      <Spline 
        scene={scene} 
        className={className} 
        onLoad={onLoad} 
        style={style}
      />
    </Suspense>
  );
}

export default SplineScene;
