import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Translation layer — fully decoupled from the UI.
 * To add a language (e.g. Arabic): add an entry to `locales` and `dictionaries`.
 */

export type Locale = "en" | "fa";

export const locales: { code: Locale; label: string; dir: "ltr" | "rtl"; font: string }[] = [
  { code: "en", label: "EN", dir: "ltr", font: "var(--font-latin)" },
  { code: "fa", label: "فا", dir: "rtl", font: "var(--font-farsi)" },
];

export const defaultLocale: Locale = "en";

type Dict = Record<string, string>;

const dictionaries: Record<Locale, Dict> = {
  en: {
    "app.name": "ChemAbstract",
    "app.tagline": "Turn a paper excerpt or reaction description into a publication-ready graphical abstract.",
    "head.title": "ChemAbstract — Graphical Abstract Generator for Chemistry",
    "head.description":
      "Generate a clean, publication-style graphical abstract from your chemistry paper text or reaction description.",
    "lang.switch": "Change language",
    "input.label": "Paper text or reaction description",
    "input.placeholder":
      "Paste an abstract, experimental section, or reaction description.\n\nExample: Pd-catalyzed Suzuki–Miyaura coupling of 4-bromoanisole with phenylboronic acid (K2CO3, DMF/H2O, 80 °C, 6 h) affords 4-methoxybiphenyl in 92% yield.",
    "input.hint": "Best results with 40–1500 characters of English scientific text.",
    "input.chars": "characters",
    "generate": "Generate Graphical Abstract",
    "generating": "Generating…",
    "quota.remaining": "{n} of {max} free generations left today",
    "quota.reached":
      "You have reached the free limit of {max} generations for today. Please come back tomorrow.",
    "error.tooShort": "Please paste at least 40 characters of text describing the chemistry.",
    "error.failed": "Image generation failed. Please try again.",
    "loading.1": "Reading the text…",
    "loading.2": "Analyzing chemical reaction…",
    "loading.3": "Identifying reagents and conditions…",
    "loading.4": "Laying out scheme and arrows…",
    "loading.5": "Rendering graphical abstract…",
    "output.title": "Graphical abstract",
    "output.empty": "Your generated abstract will appear here.",
    "output.download": "Download PNG",
    "output.fullRes": "Open full resolution",
    "output.regenerate": "Regenerate",
    "regen.left": "{n} free regenerations left",
    "regen.exhausted": "You've used your 3 free regenerations for this image.",
    "regen.guestNote": "Sign in to keep every version of your image in your history.",
    "beta.title": "Beta release",
    "beta.body":
      "This is an early version. Structures are illustrative and not chemically validated — always review before publication. We would love your feedback.",
    "beta.cta": "Send feedback",
    "nav.pricing": "Pricing",
    "auth.signIn": "Log In",
    "auth.signUp": "Sign Up",
    "auth.signOut": "Sign out",
    "auth.title.signIn": "Log in to ChemAbstract",
    "auth.title.signUp": "Create your ChemAbstract account",
    "auth.name": "Full name",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.google": "Continue with Google",
    "auth.or": "or",
    "auth.toSignUp": "New here? Create an account",
    "auth.toSignIn": "Already have an account? Log in",
    "auth.checkEmail": "Check your inbox to confirm your email address, then log in.",
    "auth.back": "Back to the generator",
    "menu.projects": "My Projects",
    "menu.projects.empty": "No saved abstracts yet.",
    "menu.plan": "My Plan",
    "menu.plan.free": "Free plan",
    "menu.plan.pro": "Pro plan",
    "menu.plan.usage": "{used} of {max} free generations used today",
    "menu.plan.upgrade": "See plans",
    "menu.support": "Support & Contact Us",
    "menu.support.body": "Questions, bugs or feature ideas? We usually reply within a day.",
    "menu.support.cta": "Email support",
    "banner.text": "Sign up to save your projects and unlock more free generations.",
    "banner.dismiss": "Dismiss",
    "quota.guestReached": "You have used your {max} free trial generations. Sign up to get {free} free generations every day.",
    "quota.signUpCta": "Sign up — it's free",
    "pricing.title": "Pricing",
    "pricing.subtitle": "Start free. Upgrade when your lab needs more.",
    "pricing.free": "Free",
    "pricing.free.price": "$0",
    "pricing.free.period": "forever",
    "pricing.free.f1": "3 generations per day",
    "pricing.free.f2": "Standard quality output",
    "pricing.free.f3": "Saved project history",
    "pricing.free.cta": "Current plan",
    "pricing.pro": "Pro",
    "pricing.pro.price": "$9",
    "pricing.pro.period": "per month",
    "pricing.pro.f1": "Unlimited generations",
    "pricing.pro.f2": "Higher quality output",
    "pricing.pro.f3": "Priority processing",
    "pricing.pro.f4": "Email support",
    "pricing.pro.cta": "Coming soon",
    "pricing.badge": "Coming Soon",
    "pricing.note": "Payments are not live yet — Pro will be available shortly.",
  },
  fa: {
    "app.name": "ChemAbstract",
    "app.tagline": "از متن مقاله یا شرح واکنش، یک چکیده تصویری آماده‌ی انتشار بساز.",
    "head.title": "ChemAbstract — سازنده چکیده تصویری برای مقالات شیمی",
    "head.description":
      "از متن مقاله یا شرح واکنش شیمیایی خود، یک چکیده تصویری تمیز و در سطح انتشار علمی تولید کنید.",
    "lang.switch": "تغییر زبان",
    "input.label": "متن مقاله یا شرح واکنش شیمیایی",
    "input.placeholder":
      "چکیده مقاله، بخش تجربی یا شرح واکنش را اینجا بچسبانید.\n\nنمونه: جفت‌شدن سوزوکی–میاورا با کاتالیزور پالادیم بین ۴-برومو آنیزول و فنیل بورونیک اسید (K2CO3، DMF/H2O، ۸۰ درجه، ۶ ساعت) با بازده ۹۲٪ به ۴-متوکسی بی‌فنیل می‌رسد.",
    "input.hint": "بهترین نتیجه با متن علمی بین ۴۰ تا ۱۵۰۰ کاراکتر به دست می‌آید.",
    "input.chars": "کاراکتر",
    "generate": "ساخت چکیده تصویری",
    "generating": "در حال ساخت…",
    "quota.remaining": "{n} از {max} تولید رایگان امروز باقی مانده است",
    "quota.reached":
      "شما به سقف {max} تولید رایگان امروز رسیده‌اید. لطفاً فردا مراجعه کنید.",
    "error.tooShort": "لطفاً حداقل ۴۰ کاراکتر متن مرتبط با شیمی وارد کنید.",
    "error.failed": "تولید تصویر انجام نشد. لطفاً دوباره تلاش کنید.",
    "loading.1": "در حال خواندن متن…",
    "loading.2": "در حال تحلیل واکنش شیمیایی…",
    "loading.3": "شناسایی معرف‌ها و شرایط واکنش…",
    "loading.4": "چیدمان طرح واکنش و فلش‌ها…",
    "loading.5": "در حال رندر چکیده تصویری…",
    "output.title": "چکیده تصویری",
    "output.empty": "تصویر ساخته‌شده اینجا نمایش داده می‌شود.",
    "output.download": "دانلود PNG",
    "output.fullRes": "نمایش با کیفیت کامل",
    "output.regenerate": "ساخت مجدد",
    "regen.left": "{n} ساخت مجدد رایگان باقی مانده است",
    "regen.exhausted": "شما ۳ ساخت مجدد رایگان این تصویر را استفاده کرده‌اید.",
    "regen.guestNote": "برای نگه‌داشتن همه نسخه‌ها در تاریخچه، وارد حساب خود شوید.",
    "beta.title": "نسخه بتا",
    "beta.body":
      "این یک نسخه اولیه است. ساختارها جنبه نمایشی دارند و از نظر شیمیایی اعتبارسنجی نشده‌اند — پیش از انتشار بازبینی کنید. از بازخورد شما خوشحال می‌شویم.",
    "beta.cta": "ارسال بازخورد",
    "nav.pricing": "تعرفه‌ها",
    "auth.signIn": "ورود",
    "auth.signUp": "ثبت‌نام",
    "auth.signOut": "خروج",
    "auth.title.signIn": "ورود به ChemAbstract",
    "auth.title.signUp": "ساخت حساب ChemAbstract",
    "auth.name": "نام و نام خانوادگی",
    "auth.email": "ایمیل",
    "auth.password": "گذرواژه",
    "auth.google": "ادامه با گوگل",
    "auth.or": "یا",
    "auth.toSignUp": "حساب ندارید؟ ثبت‌نام کنید",
    "auth.toSignIn": "حساب دارید؟ وارد شوید",
    "auth.checkEmail": "برای تأیید ایمیل، صندوق ورودی خود را بررسی کنید و سپس وارد شوید.",
    "auth.back": "بازگشت به سازنده چکیده",
    "menu.projects": "پروژه‌های من",
    "menu.projects.empty": "هنوز چکیده‌ای ذخیره نشده است.",
    "menu.plan": "اشتراک من",
    "menu.plan.free": "طرح رایگان",
    "menu.plan.pro": "طرح حرفه‌ای",
    "menu.plan.usage": "{used} از {max} تولید رایگان امروز استفاده شده",
    "menu.plan.upgrade": "مشاهده طرح‌ها",
    "menu.support": "پشتیبانی و تماس با ما",
    "menu.support.body": "سؤال، ایراد یا پیشنهاد دارید؟ معمولاً در یک روز پاسخ می‌دهیم.",
    "menu.support.cta": "ارسال ایمیل به پشتیبانی",
    "banner.text": "ثبت‌نام کنید تا پروژه‌هایتان ذخیره شود و تولید رایگان بیشتری بگیرید.",
    "banner.dismiss": "بستن",
    "quota.guestReached": "شما {max} تولید آزمایشی رایگان خود را استفاده کرده‌اید. با ثبت‌نام روزانه {free} تولید رایگان بگیرید.",
    "quota.signUpCta": "ثبت‌نام رایگان",
    "pricing.title": "تعرفه‌ها",
    "pricing.subtitle": "رایگان شروع کنید؛ هر زمان نیاز داشتید ارتقا دهید.",
    "pricing.free": "رایگان",
    "pricing.free.price": "۰ دلار",
    "pricing.free.period": "همیشه",
    "pricing.free.f1": "۳ تولید در روز",
    "pricing.free.f2": "کیفیت استاندارد",
    "pricing.free.f3": "ذخیره تاریخچه پروژه‌ها",
    "pricing.free.cta": "طرح فعلی",
    "pricing.pro": "حرفه‌ای",
    "pricing.pro.price": "۹ دلار",
    "pricing.pro.period": "ماهانه",
    "pricing.pro.f1": "تولید نامحدود",
    "pricing.pro.f2": "کیفیت بالاتر خروجی",
    "pricing.pro.f3": "پردازش با اولویت",
    "pricing.pro.f4": "پشتیبانی ایمیلی",
    "pricing.pro.cta": "به‌زودی",
    "pricing.badge": "به‌زودی",
    "pricing.note": "پرداخت هنوز فعال نیست — طرح حرفه‌ای به‌زودی ارائه می‌شود.",
  },
};

type Ctx = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "chemabstract.locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in dictionaries) setLocaleState(saved);
  }, []);

  const dir = locales.find((l) => l.code === locale)?.dir ?? "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      dir,
      setLocale: (l) => {
        setLocaleState(l);
        window.localStorage.setItem(STORAGE_KEY, l);
      },
      t: (key, vars) => {
        let out = dictionaries[locale][key] ?? dictionaries[defaultLocale][key] ?? key;
        if (vars) {
          for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
        }
        return out;
      },
    }),
    [locale, dir],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
