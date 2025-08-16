// Translation system for MangoMoney
import { it } from './it';
import { en } from './en';

export type TranslationKey = keyof typeof it;

export const translations = {
  it,
  en
};

export type Language = keyof typeof translations;

// Language configuration
export const languages = {
  it: { name: 'Italiano', flag: '🇮🇹' },
  en: { name: 'English', flag: '🇬🇧' }
} as const;

// Translation helper function type
export type TranslationFunction = (key: TranslationKey) => string;
