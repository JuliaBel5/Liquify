'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import en from '../../../messages/en.json';
import ru from '../../../messages/ru.json';

const messages = {
  en,
  ru,
};

export type Locale = keyof typeof messages;
type TranslationValues = Record<string, number | string>;
type Translate = (key: string, values?: TranslationValues) => string;

const DEFAULT_LOCALE: Locale = 'ru';
const LOCALE_STORAGE_KEY = 'liquify:locale:v1';

interface LocaleContextValue {
  locale: Locale;
  setLocale(locale: Locale): void;
  translate(namespace: string, key: string, values?: TranslationValues): string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === 'en' || stored === 'ru' ? stored : DEFAULT_LOCALE;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function resolveMessage(locale: Locale, namespace: string, key: string): string {
  const path = [...namespace.split('.'), ...key.split('.')];
  let current: unknown = messages[locale];

  for (const segment of path) {
    if (!isRecord(current) || !(segment in current)) {
      return path.join('.');
    }

    current = current[segment];
  }

  return typeof current === 'string' ? current : path.join('.');
}

function interpolate(message: string, values?: TranslationValues): string {
  if (values === undefined) return message;

  return Object.entries(values).reduce(
    (nextMessage, [key, value]) => nextMessage.replaceAll(`{${key}}`, String(value)),
    message,
  );
}

export function useLocaleSwitcher(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (context === null) {
    throw new Error('useLocaleSwitcher must be used inside Providers');
  }

  return context;
}

export function useTranslations(namespace: string): Translate {
  const { translate } = useLocaleSwitcher();

  return (key, values) => translate(namespace, key, values);
}

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = readStoredLocale();
    setLocaleState(stored);
    document.documentElement.lang = stored;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = messages[locale].metadata.title;

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description !== null) {
      description.content = messages[locale].metadata.description;
    }
  }, [locale]);

  const localeContextValue = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale(nextLocale) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      document.documentElement.lang = nextLocale;
      setLocaleState(nextLocale);
    },
    translate(namespace, key, values) {
      return interpolate(resolveMessage(locale, namespace, key), values);
    },
  }), [locale]);

  return (
    <LocaleContext.Provider value={localeContextValue}>
      {children}
    </LocaleContext.Provider>
  );
}
