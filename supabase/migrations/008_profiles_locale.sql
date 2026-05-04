-- Store user locale preference for i18n (en/fr)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en'
CHECK (locale IN ('en', 'fr'));

CREATE INDEX IF NOT EXISTS profiles_locale_idx ON public.profiles(locale);
