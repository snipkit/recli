import { useEffect, useState } from 'react';
import { Khulnasoft } from '@khulnasoft.com/sdk';

export function useIsPreviewing() {
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (Khulnasoft.isEditing || Khulnasoft.isPreviewing) {
      setIsPreviewing(true);
    }
  }, []);

  return isPreviewing;
}
