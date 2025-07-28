import React, { Suspense, ReactNode } from 'react';

const SuspenseBoundary = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      {children}
    </Suspense>
  );
};

export default SuspenseBoundary; 