import { useEffect, useRef } from 'react';
import MobileEditorLayout from './MobileEditorLayout';
import { useEditorStore } from '@/store/editorStore';

const AUTO_SAVE_DELAY = 30_000;

export default function Editor() {
  const isDirty = useEditorStore((state) => state.isDirty);
  const saveStatus = useEditorStore((state) => state.saveStatus);
  const savePageToServer = useEditorStore((state) => state.savePageToServer);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isDirty && saveStatus !== 'saving') {
      timerRef.current = setTimeout(() => {
        savePageToServer();
      }, AUTO_SAVE_DELAY);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDirty, saveStatus, savePageToServer]);

  return <MobileEditorLayout />;
}
