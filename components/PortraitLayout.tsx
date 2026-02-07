
import React, { memo, useCallback, useMemo } from 'react';
import { BedLayoutProps, BedState } from '../types';
import { PORTRAIT_PAIRS_CONFIG } from '../constants/layout';
import { PortraitBedRow } from './PortraitBedRow';

export const PortraitLayout: React.FC<BedLayoutProps> = memo(({ beds, presets }) => {
  
  const getBed = useCallback((id: number): BedState => {
    return beds.find(b => b.id === id) || beds[0];
  }, [beds]);

  const groupedPairs = useMemo(() => {
    const groups = [];
    for (let i = 0; i < PORTRAIT_PAIRS_CONFIG.length; i += 2) {
      groups.push(PORTRAIT_PAIRS_CONFIG.slice(i, i + 2));
    }
    return groups;
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-32 max-w-4xl mx-auto px-1 sm:px-1.5">
      {groupedPairs.map((group, groupIdx) => (
        <div key={`group-${groupIdx}`} className="flex flex-col gap-[1px]">
          {group.map((pair, idx) => {
            const leftBed = getBed(pair.left);
            const rightBed = pair.right ? getBed(pair.right) : null;

            return (
              <PortraitBedRow 
                key={`${groupIdx}-${idx}`}
                leftBed={leftBed}
                rightBed={rightBed}
                presets={presets}
                beds={beds}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
});
