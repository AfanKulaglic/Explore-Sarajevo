'use client';

import * as React from 'react';

type BreadcrumbContextValue = {
  /** Replaces the last breadcrumb segment label (e.g. business name on edit pages). */
  tailLabel: string | null;
  setTailLabel: (label: string | null) => void;
};

const BreadcrumbContext = React.createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [tailLabel, setTailLabel] = React.useState<string | null>(null);

  const value = React.useMemo(
    () => ({ tailLabel, setTailLabel }),
    [tailLabel]
  );

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

export function usePageBreadcrumb(label: string | null) {
  const ctx = React.useContext(BreadcrumbContext);

  React.useEffect(() => {
    if (!ctx) return;
    ctx.setTailLabel(label);
    return () => ctx.setTailLabel(null);
  }, [ctx, label]);
}

export function useBreadcrumbTailLabel() {
  return React.useContext(BreadcrumbContext)?.tailLabel ?? null;
}
