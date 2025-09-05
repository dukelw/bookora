# 🗺️ About the `[locale]` Folder Structure

This project uses the `next-intl` library to support internationalization (i18n). Therefore, all primary routes in the app are placed inside a dynamic `[locale]` folder to allow rendering content based on the selected language (e.g., `en`, `vi`).

## ✅ Why use `[locale]`?

Next.js allows dynamic routing, and `next-intl` works best when the locale is explicitly included in the URL, like this:

```bash
/en/dashboard
/vi/dashboard
```

## ⚠️ What if you don’t use `[locale]`?

- The app won’t know which locale is currently active.
- Hooks like `useTranslations()` and `useLocale()` will throw errors.
- Automatic loading of translation messages won’t work.
- You won’t be able to show content based on language-specific routes.

## 📌 Notes

- The `layout.tsx` inside `[locale]` must wrap the app with `NextIntlClientProvider` to provide `locale` and `messages` context.
- Pages that use `useTranslations()` must be marked as Client Components (with `"use client"`).
- To switch languages, update the first URL segment (`/en`, `/vi`) — for example, using `router.replace()` inside the `LanguageSwitcher`.

---
