import { useEffect, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { cn } from '@/lib/utils';

const DEBOUNCE_MS = 500;

const ExcalidrawWrapper = ({
  initialData,
  onElementsChange,
  onApiReady,
  className,
  viewModeEnabled = false,
}) => {
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (elements) => {
    if (!onElementsChange) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onElementsChange(elements);
    }, DEBOUNCE_MS);
  };

  return (
    <div className={cn('relative h-full min-h-[500px] w-full', className)}>
      <Excalidraw
        initialData={initialData}
        excalidrawAPI={onApiReady}
        onChange={handleChange}
        viewModeEnabled={viewModeEnabled}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
