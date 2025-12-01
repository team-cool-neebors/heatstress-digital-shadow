import React, { useCallback, useRef } from 'react';

type ImportHandler = (file: File) => void;

export function useFileImport(onFileReady: ImportHandler) {
  // Ref for the hidden input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle the file selection event
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileReady(file);
    }
    //Reset the input value so the same file can be selected again
    event.target.value = '';
  }, [onFileReady]);

  // Function to programmatically trigger the hidden input
  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    handleFileSelect,
    triggerImport,
  };
}