import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

export type BookmarkType = 'pet' | 'event' | 'vlog' | 'merch' | 'missingPet';

export interface BookmarkItem {
  id: string | number;
  type: BookmarkType;
  title: string;
  image?: string;
  data: any;
  bookmarkedAt: string;
}

interface BookmarkContextType {
  bookmarks: BookmarkItem[];
  addBookmark: (item: Omit<BookmarkItem, 'bookmarkedAt'>) => void;
  removeBookmark: (id: string | number, type: BookmarkType) => void;
  isBookmarked: (id: string | number, type: BookmarkType) => boolean;
  getBookmarksByType: (type: BookmarkType) => BookmarkItem[];
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('userBookmarks');

      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBookmarks(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userBookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks]);
  // useEffect(() => {
  //   localStorage.setItem('userBookmarks', JSON.stringify(bookmarks));
  // }, [bookmarks]);

  const addBookmark = (item: Omit<BookmarkItem, 'bookmarkedAt'>) => {
    const newBookmark: BookmarkItem = {
      ...item,
      bookmarkedAt: new Date().toISOString()
    };

    setBookmarks(prev => [...prev, newBookmark]);
    toast.success(`Added ${item.title} to bookmarks!`, {
      description: 'You can access your bookmarks from your account.'
    });
  };

  const removeBookmark = (id: string | number, type: BookmarkType) => {
    setBookmarks(prev => prev.filter(b => !(b.id === id && b.type === type)));
    toast.info('Removed from bookmarks');
  };

  const isBookmarked = (id: string | number, type: BookmarkType) => {
    return bookmarks.some(b => b.id === id && b.type === type);
  };

  const getBookmarksByType = (type: BookmarkType) => {
    return bookmarks.filter(b => b.type === type);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked, getBookmarksByType }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);

  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }

  return context;
}
