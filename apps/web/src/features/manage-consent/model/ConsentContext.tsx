import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { applyAnalyticsConsent } from "@/shared/lib/analytics";
import {
  type ConsentChoice,
  readConsentChoice,
  writeConsentChoice,
} from "@/shared/lib/consent";

type ConsentContextValue = {
  choice: ConsentChoice | null;
  preferencesOpen: boolean;
  setChoice: (choice: ConsentChoice) => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ConsentChoice | null>(() =>
    typeof window === "undefined" ? null : readConsentChoice(window.localStorage),
  );
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    applyAnalyticsConsent(choice === "granted");
  }, [choice]);

  const setChoice = useCallback((nextChoice: ConsentChoice) => {
    applyAnalyticsConsent(nextChoice === "granted");
    writeConsentChoice(window.localStorage, nextChoice);
    setChoiceState(nextChoice);
    setPreferencesOpen(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      choice,
      preferencesOpen,
      setChoice,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }),
    [choice, preferencesOpen, setChoice],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

// Context hooks intentionally share the provider module.
// eslint-disable-next-line react-refresh/only-export-components
export function useConsent(): ConsentContextValue {
  const value = useContext(ConsentContext);
  if (!value) throw new Error("useConsent must be used inside ConsentProvider");
  return value;
}
