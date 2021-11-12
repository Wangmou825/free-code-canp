import React, { ComponentPropsWithoutRef, FC } from 'react';

import styles from './skeleton-styles';

// TODO: unsure about parameter typing
function SkeletonSprite({}: FC<ComponentPropsWithoutRef<'svg'>>): JSX.Element {
  return (
    <div className='sprite-container'>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <svg className='sprite-svg'>
        <rect
          className='sprite'
          fill='var(--gray-75)'
          height='100%'
          stroke='var(--gray-75)'
          width='2px'
          x='0'
          y='0'
        />
      </svg>
    </div>
  );
}

SkeletonSprite.displayName = 'SkeletonSprite';

export default SkeletonSprite;
