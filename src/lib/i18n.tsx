import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Translation layer — fully decoupled from the UI.
 * To add a language (e.g. Arabic): add an entry to `locales` and `dictionaries`.
 */

export type Locale = "en" | "fa" | "de" | "fr" | "ar" | "es" | "zh";

export const locales: {
  code: Locale;
  label: string;
  name: string;
  dir: "ltr" | "rtl";
  font: string;
  flag: string;
}[] = [
  { code: "en", label: "EN", name: "English", dir: "ltr", font: "var(--font-latin)", flag: "🇺🇸" },
  { code: "fa", label: "فا", name: "فارسی", dir: "rtl", font: "var(--font-farsi)", flag: "🇮🇷" },
  { code: "de", label: "DE", name: "Deutsch", dir: "ltr", font: "var(--font-latin)", flag: "🇩🇪" },
  { code: "fr", label: "FR", name: "Français", dir: "ltr", font: "var(--font-latin)", flag: "🇫🇷" },
  { code: "ar", label: "عرب", name: "العربية", dir: "rtl", font: "var(--font-farsi)", flag: "🇸🇦" },
  { code: "es", label: "ES", name: "Español", dir: "ltr", font: "var(--font-latin)", flag: "🇪🇸" },
  { code: "zh", label: "中文", name: "中文", dir: "ltr", font: "var(--font-latin)", flag: "🇨🇳" },
];

export const defaultLocale: Locale = "en";

type Dict = Record<string, string>;

const dictionaries: Record<Locale, Dict> = {
  en: {
    "app.name": "ChemStudio",
    "app.tagline":
      "Publication-grade vector graphics workbench & reaction studio for chemistry research.",
    "head.title": "ChemStudio — Scientific Vector Workbench for Chemistry",
    "head.description":
      "Publication-grade vector graphics workbench for chemistry papers, reaction schemes, 3D structures, and journal submission dossiers.",
    "lang.switch": "Change language",
    "input.label": "Paper text or reaction description",
    "input.placeholder":
      "Paste an abstract, experimental section, or reaction description.\n\nExample: Pd-catalyzed Suzuki–Miyaura coupling of 4-bromoanisole with phenylboronic acid (K2CO3, DMF/H2O, 80 °C, 6 h) affords 4-methoxybiphenyl in 92% yield.",
    "input.hint": "Enter scientific, chemical, or pharmacological text in English or Persian.",
    "input.chars": "characters",
    generate: "Generate Graphical Abstract",
    generating: "Generating…",
    "quota.remaining": "{n} of {max} free generations left today",
    "quota.reached":
      "You have reached the free limit of {max} generations for today. Please come back tomorrow.",
    "error.tooShort":
      "Please enter chemical or scientific text to generate the graphical abstract.",
    "error.failed": "Image generation failed. Please try again.",
    "session.error": "We couldn't start a session right now. Please retry.",
    "session.retry": "Retry",
    "loading.1": "Reading the text…",
    "loading.2": "Analyzing chemical reaction…",
    "loading.3": "Identifying reagents and conditions…",
    "loading.4": "Laying out scheme and arrows…",
    "loading.5": "Rendering graphical abstract…",
    "output.title": "Graphical abstract",
    "output.empty": "Your generated abstract will appear here.",
    "output.dimensions": "16:9 Table of Contents (TOC) Format",
    "output.palette": "CPK Color Palette",
    "output.inspect3d": "3D Reaction Precursor",
    "output.renderedView": "Publication Abstract",
    "history.title": "Recent Reactions",
    "history.subtitle": "History of generated chemical abstractions and reaction schemes.",
    "history.empty":
      "No reactions in history yet. Generate an abstract or load a sample reaction to get started.",
    "history.load": "Load Into Workspace",
    "history.loaded": "Loaded into Workspace",
    "history.copyText": "Copy Text",
    "history.copied": "Copied!",
    "history.clear": "Clear History",
    "history.clearConfirm": "Are you sure you want to clear your local reaction history?",
    "history.revisit": "Revisit past chemical reactions",
    "history.searchPlaceholder": "Search reactions, reagents, catalysts…",
    "history.count": "{n} reactions recorded",
    "history.viewFull": "Inspect Full 16:9",
    "history.delete": "Remove",
    "history.deleteConfirm": "Remove this reaction from history?",
    "history.loadSample": "Restore Sample Reactions",
    "history.expandView": "Expand Panel",
    "history.collapseView": "Compact Drawer",
    "history.filterAll": "All Reactions",
    "history.filterCoupling": "Cross-Coupling",
    "history.filterPhotoredox": "Photoredox",
    "history.filterAldol": "Aldol",
    "history.filterEster": "Esterification",
    "history.export": "Export JSON",
    "workspace.symbols": "Insert Symbol",
    "workspace.presets": "Sample Reactions",
    "workspace.preset.coupling": "Suzuki-Miyaura Coupling",
    "workspace.preset.photoredox": "Photoredox Functionalization",
    "workspace.preset.aldol": "Enantioselective Aldol",
    "workspace.preset.ester": "Fischer Esterification",
    "workspace.validateReaction": "Reaction & SMILES Audit",
    "workspace.validateReactionTitle":
      "Scientific validation of valency, chemical formula, SMILES, and atom economy",
    "workspace.auditTab": "Reaction Audit",
    "workspace.preflightModal": "Journal Pre-Flight & Dossier",
    "workspace.preflightModalTitle":
      "Phase 4: Full submission dossier, peer-review pre-flight inspection, and AI transparency certificate",
    "output.submissionDossier": "Submission Dossier (ZIP)",
    "output.vectorMechanism": "Vector Mechanism & Arrows",
    "output.download": "Download PNG",
    "output.publicationReady": "300 DPI Publication Export",
    "output.journalSpecs": "Journal Specs & Compliance",
    "output.copy": "Copy to Clipboard",
    "output.copied": "Copied to Clipboard!",
    "output.copyImage": "Copy Image",
    "output.fullRes": "Open full resolution",
    "output.regenerate": "Regenerate",
    "regen.left": "{n} free regenerations left",
    "regen.exhausted": "You've used your 3 free regenerations for this image.",
    "regen.guestNote": "Sign in to keep every version of your image in your history.",
    "output.edit": "Edit",
    "editor.stationery": "Stationery & Tools",
    "editor.pencil": "Pencil",
    "editor.pen": "Pen",
    "editor.highlighter": "Highlighter",
    "editor.brushTool": "Brush",
    "editor.erase": "Eraser",
    "editor.whiteout": "Erase Text Box",
    "editor.whiteoutHint": "Drag a box over text or unwanted parts to erase cleanly",
    "editor.line": "Line",
    "editor.arrow": "Reaction Arrow",
    "editor.rect": "Rectangle Box",
    "editor.stamp": "Chemical Symbol",
    "editor.eyedropper": "Eyedropper",
    "editor.text": "Text",
    "editor.crop": "Crop",
    "editor.undo": "Undo",
    "editor.redo": "Redo",
    "editor.reset": "Reset to Original",
    "editor.clear": "Clear Edits",
    "editor.save": "Download PNG",
    "editor.applyToPreview": "Apply to Graphic",
    "editor.close": "Close Editor",
    "editor.brush": "Stroke Size",
    "editor.opacity": "Opacity",
    "editor.color": "Color",
    "editor.palette": "Color Palette",
    "editor.zoom": "Zoom",
    "editor.eraseToColor": "Erase with canvas background (off = transparent)",
    "editor.textPlaceholder": "Enter text or formula (e.g. Pd(PPh3)4, 80 °C)…",
    "editor.size": "Font Size",
    "editor.textColor": "Text Color",
    "editor.textHint": "Click anywhere on the image to place your text.",
    "editor.cropHint": "Drag a rectangle on the image, then apply crop.",
    "editor.applyCrop": "Apply Crop",
    "editor.background": "Background",
    "editor.applyBackground": "Fill Background",
    "beta.title": "Beta release",
    "beta.body":
      "This is an early version. Structures are illustrative and not chemically validated — always review before publication. We would love your feedback.",
    "beta.cta": "Send feedback",
    "nav.pricing": "Pricing",
    "auth.signIn": "Log In",
    "auth.signUp": "Sign Up",
    "auth.signOut": "Sign out",
    "auth.title.signIn": "Log in to ChemStudio",
    "auth.title.signUp": "Create your ChemStudio account",
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
    "quota.guestReached":
      "You have used your {max} free trial generations. Sign up to get {free} free generations every day.",
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
    "nav.studio": "Abstract Studio",
    "nav.drawer": "2D Structure",
    "nav.explorer": "Chemical DB",
    "nav.stoich": "Stoich & Table",
    "nav.workbench": "CHEM WORKBENCH",
    "workspace.examples": "Examples:",
    "workspace.symbols": "Symbols:",
    "workspace.clear": "Clear",
    "workspace.graphic": "Graphic",
    "workspace.editor": "Editor",
    "workspace.view3d": "3D View",
    "workspace.preflight": "Pre-Flight",
    "workspace.overlay": "Mechanism Overlay",
    "workspace.quickPng": "Quick PNG download",
    "workspace.uploadImage": "Upload Image",
    "workspace.trySample": "Try Sample Output",
  },
  fa: {
    "app.name": "ChemStudio",
    "app.tagline": "استودیوی جامع رسم شیمیایی، وکتور واکنش‌ها و فایل‌های آماده انتشار مقالات.",
    "head.title": "ChemStudio — میزکار علمی شیمی و طراحی وکتور مقالات",
    "head.description":
      "پلتفرم جامع طراحی وکتور شیمیایی، موازنه واکنش، مشاهده‌گر سه‌بعدی و پرونده‌های داوری ژورنال‌های ACS و Elsevier.",
    "lang.switch": "تغییر زبان",
    "input.label": "متن مقاله یا شرح واکنش شیمیایی",
    "input.placeholder":
      "چکیده مقاله، بخش تجربی یا شرح واکنش را اینجا بچسبانید.\n\nنمونه: جفت‌شدن سوزوکی–میاورا با کاتالیزور پالادیم بین ۴-برومو آنیزول و فنیل بورونیک اسید (K2CO3، DMF/H2O، ۸۰ درجه، ۶ ساعت) با بازده ۹۲٪ به ۴-متوکسی بی‌فنیل می‌رسد.",
    "input.hint":
      "متن علمی، توصیف واکنش شیمیایی یا مکانیسم بیوشیمیایی را به فارسی یا انگلیسی وارد کنید.",
    "input.chars": "کاراکتر",
    generate: "ساخت چکیده تصویری",
    generating: "در حال ساخت…",
    "quota.remaining": "{n} از {max} تولید رایگان امروز باقی مانده است",
    "quota.reached": "شما به سقف {max} تولید رایگان امروز رسیده‌اید. لطفاً فردا مراجعه کنید.",
    "error.tooShort": "لطفاً متن واکنش یا مفهوم شیمیایی/دارویی مورد نظر خود را وارد کنید.",
    "error.failed": "تولید تصویر انجام نشد. لطفاً دوباره تلاش کنید.",
    "session.error": "فعلاً نمی‌توان نشست را آغاز کرد. لطفاً دوباره تلاش کنید.",
    "session.retry": "تلاش مجدد",
    "loading.1": "در حال خواندن متن…",
    "loading.2": "در حال تحلیل واکنش شیمیایی…",
    "loading.3": "شناسایی معرف‌ها و شرایط واکنش…",
    "loading.4": "چیدمان طرح واکنش و فلش‌ها…",
    "loading.5": "در حال رندر چکیده تصویری…",
    "output.title": "چکیده تصویری",
    "output.empty": "تصویر ساخته‌شده اینجا نمایش داده می‌شود.",
    "output.dimensions": "فرمت استاندارد ۱۶:۹ چکیده مقالات",
    "output.palette": "طیف رنگی عناصر CPK",
    "output.inspect3d": "پیش‌ماده سه‌بعدی واکنش",
    "output.renderedView": "چکیده نهایی انتشار",
    "history.title": "واکنش‌های اخیر",
    "history.subtitle": "تاریخچه چکیده‌های تصویری و واکنش‌های تولیدشده.",
    "history.empty":
      "هنوز واکنشی در تاریخچه نیست. اولین چکیده تصویری خود را بسازید یا یکی از واکنش‌های نمونه را بارگذاری کنید.",
    "history.load": "بارگذاری در محیط کار",
    "history.loaded": "در محیط کار بارگذاری شد",
    "history.copyText": "کپی متن",
    "history.copied": "کپی شد!",
    "history.clear": "پاکسازی تاریخچه",
    "history.clearConfirm": "آیا از پاکسازی تمام تاریخچه واکنش‌های محلی مطمئن هستید؟",
    "history.revisit": "بازبینی واکنش‌های قبلی",
    "history.searchPlaceholder": "جستجو در واکنش‌ها، معرف‌ها، کاتالیزورها…",
    "history.count": "{n} واکنش ثبت‌شده",
    "history.viewFull": "نمایش کامل ۱۶:۹",
    "history.delete": "حذف",
    "history.deleteConfirm": "آیا از حذف این واکنش از تاریخچه مطمئن هستید؟",
    "history.loadSample": "بازگردانی واکنش‌های نمونه",
    "history.expandView": "گسترش پنل",
    "history.collapseView": "نمای کشویی",
    "history.filterAll": "همه واکنش‌ها",
    "history.filterCoupling": "جفت‌شدن",
    "history.filterPhotoredox": "نوری",
    "history.filterAldol": "آلدول",
    "history.filterEster": "استری‌شدن",
    "history.export": "خروجی JSON",
    "workspace.symbols": "درج نماد شیمی",
    "workspace.presets": "نمونه واکنش‌ها",
    "workspace.preset.coupling": "جفت‌شدن سوزوکی–میاورا",
    "workspace.preset.photoredox": "عملکردی‌سازی با نور",
    "workspace.preset.aldol": "افزایش آلدول نامتقارن",
    "workspace.preset.ester": "استری‌شدن فیشر",
    "workspace.validateReaction": "اعتبارسنجی واکنش و SMILES",
    "workspace.validateReactionTitle":
      "اعتبارسنجی علمی ولانس، ساختارها، SMILES و موازنه اتمی واکنش",
    "workspace.auditTab": "آنالیز علمی",
    "workspace.preflightModal": "پکیج سابمیت و پیش‌پرواز (فاز ۴)",
    "workspace.preflightModalTitle":
      "فاز ۴: پکیج کامل سابمیت ژورنال، شبیه‌ساز داوری، و گواهی شفافیت هوش مصنوعی",
    "output.submissionDossier": "پکیج کامل سابمیت (ZIP)",
    "output.vectorMechanism": "مکانیسم و فلش‌های وکتور",
    "output.download": "دانلود PNG",
    "output.publicationReady": "خروجی چاپ ژورنال (300 DPI)",
    "output.journalSpecs": "مشخصات و الزامات ژورنال",
    "output.copy": "کپی در کلیپ‌بورد",
    "output.copied": "در کلیپ‌بورد کپی شد!",
    "output.copyImage": "کپی تصویر",
    "output.fullRes": "نمایش با کیفیت کامل",
    "output.regenerate": "ساخت مجدد",
    "regen.left": "{n} ساخت مجدد رایگان باقی مانده است",
    "regen.exhausted": "شما ۳ ساخت مجدد رایگان این تصویر را استفاده کرده‌اید.",
    "regen.guestNote": "برای نگه‌داشتن همه نسخه‌ها در تاریخچه، وارد حساب خود شوید.",
    "output.edit": "ویرایش",
    "editor.stationery": "نوشت‌افزار و ابزارها",
    "editor.pencil": "مداد",
    "editor.pen": "خودکار",
    "editor.highlighter": "هایلایتر",
    "editor.brushTool": "قلم‌مو",
    "editor.erase": "پاک‌کن",
    "editor.whiteout": "حذف کادری متن",
    "editor.whiteoutHint": "برای حذف متن یا بخش ناخواسته، کادر مستطیلی روی آن بکشید",
    "editor.line": "خط مستقیم",
    "editor.arrow": "پیکان واکنش",
    "editor.rect": "کادر مستطیل",
    "editor.stamp": "نماد شیمیایی",
    "editor.eyedropper": "قطره‌چکان",
    "editor.text": "متن",
    "editor.crop": "برش",
    "editor.undo": "واگرد",
    "editor.redo": "انجام مجدد",
    "editor.reset": "بازنشانی به اصلی",
    "editor.clear": "پاکسازی ویرایش‌ها",
    "editor.save": "دانلود PNG",
    "editor.applyToPreview": "اعمال روی تصویر",
    "editor.close": "بستن ویرایشگر",
    "editor.brush": "ضخامت قلم",
    "editor.opacity": "شفافیت",
    "editor.color": "رنگ",
    "editor.palette": "پالت رنگ",
    "editor.zoom": "بزرگ‌نمایی",
    "editor.eraseToColor": "پاک کردن با رنگ پس‌زمینه (خاموش = شفاف)",
    "editor.textPlaceholder": "متن یا فرمول (مثلاً Pd(PPh3)4، 80 °C)…",
    "editor.size": "اندازه قلم",
    "editor.textColor": "رنگ متن",
    "editor.textHint": "برای درج متن، روی نقطه دلخواه تصویر کلیک کنید.",
    "editor.cropHint": "یک مستطیل روی تصویر بکشید و سپس اعمال کنید.",
    "editor.applyCrop": "اعمال برش",
    "editor.background": "رنگ پس‌زمینه",
    "editor.applyBackground": "پر کردن پس‌زمینه",
    "beta.title": "نسخه بتا",
    "beta.body":
      "این یک نسخه اولیه است. ساختارها جنبه نمایشی دارند و از نظر شیمیایی اعتبارسنجی نشده‌اند — پیش از انتشار بازبینی کنید. از بازخورد شما خوشحال می‌شویم.",
    "beta.cta": "ارسال بازخورد",
    "nav.pricing": "تعرفه‌ها",
    "auth.signIn": "ورود",
    "auth.signUp": "ثبت‌نام",
    "auth.signOut": "خروج",
    "auth.title.signIn": "ورود به ChemStudio",
    "auth.title.signUp": "ساخت حساب ChemStudio",
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
    "quota.guestReached":
      "شما {max} تولید آزمایشی رایگان خود را استفاده کرده‌اید. با ثبت‌نام روزانه {free} تولید رایگان بگیرید.",
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
    "nav.studio": "استودیو تصویر",
    "nav.drawer": "رسم ساختار ۲بعدی",
    "nav.explorer": "بانک ترکیبات",
    "nav.stoich": "آزمایشگاه و جدول",
    "nav.workbench": "پلتفرم جامع شیمی",
    "workspace.examples": "نمونه‌ها:",
    "workspace.symbols": "نمادها:",
    "workspace.clear": "پاک‌کردن",
    "workspace.graphic": "تصویر",
    "workspace.editor": "ویرایشگر",
    "workspace.view3d": "نمای 3D",
    "workspace.preflight": "پیش‌پرواز",
    "workspace.overlay": "فلش‌های مکانیزم",
    "workspace.quickPng": "دانلود سریع PNG",
    "workspace.uploadImage": "بارگذاری تصویر",
    "workspace.trySample": "مشاهده نمونه آماده",
  },
  de: {
    "app.name": "ChemStudio",
    "app.tagline": "Erstellen Sie publikationsreife Vektorgrafiken und Reaktionsschemata.",
    generate: "Grafisches Abstract Erstellen",
    generating: "Wird erstellt…",
    "input.label": "Papiertext oder Reaktionsbeschreibung",
    "input.placeholder": "Fügen Sie ein Abstract oder eine Reaktionsbeschreibung ein…",
    "output.title": "Grafisches Abstract",
    "history.title": "Kürzliche Reaktionen",
    "pricing.title": "Preise",
  },
  fr: {
    "app.name": "ChemStudio",
    "app.tagline": "Studio graphique vectoriel pour les sciences chimiques et les publications.",
    generate: "Générer le Résumé Graphique",
    generating: "Génération en cours…",
    "input.label": "Texte de l'article ou description de la réaction",
    "input.placeholder": "Collez un extrait ou une réaction ici…",
    "output.title": "Résumé Graphique",
    "history.title": "Réactions Récentes",
    "pricing.title": "Tarifs",
  },
  ar: {
    "app.name": "ChemStudio",
    "app.tagline": "منصة الرسوم المتجهة الكيميائية الجاهزة للنشر والدراسات العلمية.",
    generate: "إنشاء الملخص الجرافيكي",
    generating: "جاري الإنشاء…",
    "input.label": "نص البحث أو وصف التفاعل الكيميائي",
    "input.placeholder": "الصق نص البحث أو التفاعل الكيميائي هنا…",
    "output.title": "الملخص الجرافيكي",
    "history.title": "التفاعلات الأخيرة",
    "pricing.title": "الأسعار",
  },
  es: {
    "app.name": "ChemStudio",
    "app.tagline": "Estudio gráfico vectorial para publicaciones e investigaciones químicas.",
    generate: "Generar Resumen Gráfico",
    generating: "Generando…",
    "input.label": "Texto del artículo o descripción de reacción",
    "input.placeholder": "Pegue un extracto o descripción de reacción aquí…",
    "output.title": "Resumen Gráfico",
    "history.title": "Reacciones Recientes",
    "pricing.title": "Precios",
  },
  zh: {
    "app.name": "ChemStudio",
    "app.tagline": "适用于化学研究与学术发表的矢量图形与反应工作台。",
    generate: "生成图形摘要",
    generating: "正在生成…",
    "input.label": "论文文本或反应描述",
    "input.placeholder": "在此粘贴摘要或化学反应描述…",
    "output.title": "图形摘要",
    "history.title": "近期反应",
    "pricing.title": "价格方案",
  },
};

type Ctx = {
  locale: Locale;
  dir: "ltr" | "rtl";
  isRtl: boolean;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  l: (
    fa: string,
    en: string,
    de?: string,
    fr?: string,
    ar?: string,
    es?: string,
    zh?: string,
  ) => string;
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
  const isRtl = dir === "rtl" || locale === "fa" || locale === "ar";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      dir,
      isRtl,
      setLocale: (l) => {
        setLocaleState(l);
        window.localStorage.setItem(STORAGE_KEY, l);
      },
      t: (key, vars) => {
        let out = dictionaries[locale]?.[key] ?? dictionaries[defaultLocale]?.[key] ?? key;
        if (vars) {
          for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
        }
        return out;
      },
      l: (fa, en, de, fr, ar, es, zh) => {
        if (locale === "fa") return fa;
        if (locale === "ar") return ar || fa;
        if (locale === "de") return de || en;
        if (locale === "fr") return fr || en;
        if (locale === "es") return es || en;
        if (locale === "zh") return zh || en;
        return en;
      },
    }),
    [locale, dir, isRtl],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
