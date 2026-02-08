import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} | JUST BULL 就是牛跑团`;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
