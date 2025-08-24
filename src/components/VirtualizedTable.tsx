import React, { useState, useRef, useMemo, useCallback } from 'react';

interface VirtualizedTableProps<T> {
  data: T[];
  rowHeight: number;
  containerHeight: number;
  renderRow: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualizedTable<T>({
  data,
  rowHeight,
  containerHeight,
  renderRow,
  renderHeader,
  overscan = 5,
  className = '',
  onScroll
}: VirtualizedTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calcola range visibile
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / rowHeight),
      data.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(data.length - 1, endIndex + overscan)
    };
  }, [scrollTop, rowHeight, containerHeight, data.length, overscan]);

  // Elementi visibili
  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end + 1);
  }, [data, visibleRange]);

  // Gestione scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);



  const totalHeight = data.length * rowHeight;
  const offsetY = visibleRange.start * rowHeight;

  return (
    <div className={`overflow-hidden ${className}`}>
      {renderHeader && (
        <div className="sticky top-0 z-10">
          {renderHeader()}
        </div>
      )}
      
      <div
        ref={scrollElementRef}
        style={{ height: containerHeight }}
        className="overflow-auto"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {visibleItems.map((item, index) => {
              const actualIndex = visibleRange.start + index;
              const style: React.CSSProperties = {
                height: rowHeight,
                position: 'relative'
              };
              
              return (
                <div key={actualIndex}>
                  {renderRow(item, actualIndex, style)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
