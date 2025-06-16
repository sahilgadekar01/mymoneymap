import { useState } from 'react';

interface ShareData {
  title: string;
  text: string;
  url: string;
}

export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  const shareResults = async (data: ShareData) => {
    setIsSharing(true);
    
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(`${data.title}\n${data.text}\n${data.url}`);
        throw new Error('Link copied to clipboard');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('copied')) {
        // This is our success case for the fallback
        return;
      }
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  return {
    shareResults,
    isSharing
  };
}
