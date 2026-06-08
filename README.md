# প্রিপেইড মিটার টোকেন সহকারী

বাংলাদেশের প্রিপেইড বিদ্যুৎ ব্যবহারকারীদের জন্য একটি mobile-first PWA. একাধিক টোকেনসমৃদ্ধ SMS পেস্ট করলে অ্যাপটি ২০-ডিজিট টোকেনগুলো স্বয়ংক্রিয়ভাবে বের করে, সিকোয়েন্স অনুযায়ী কোন টোকেন আগে ইনপুট দিতে হবে তা দেখায়, এবং ধাপে ধাপে Bangla নির্দেশনা দেয়।

## প্রযুক্তি

- React 18
- Vite
- Tailwind CSS
- JavaScript
- LocalStorage
- Manual PWA service worker

## ফিচার

- 100% Bangla UI
- SMS থেকে স্বয়ংক্রিয় টোকেন এক্সট্রাকশন
- comma, space, newline, এবং mixed format সাপোর্ট
- sequence-based token recommendation
- token copy, print, PDF export
- dark mode
- install prompt
- offline caching
- history storage in LocalStorage
- accessibility-friendly large touch targets
- simple, beginner-friendly workflow

## লোকাল রান

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Vercel Deployment

এই প্রজেক্টটি Vercel-এ static Vite app হিসেবে সরাসরি deploy করা যায়।

1. Repository connect করুন।
2. Framework preset: Vite রাখুন।
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy করুন।

অতিরিক্ত কোনো পরিবর্তন দরকার নেই।

## GitHub Pages Deployment

এই repo-টি GitHub Pages-এ সরাসরি deploy করা যাবে।

1. GitHub-এ repo push করুন।
2. Repo settings -> Pages এ যান।
3. Source হিসেবে GitHub Actions নির্বাচন করুন।
4. `main` branch-এ push করলে workflow নিজে build করে deploy করবে।

সাইট URL সাধারণত হবে:

`https://ridwan2005ahmed.github.io/billing/`

যদি আপনার repository name বা owner পরিবর্তন হয়, তাহলে URL-ও সেই অনুযায়ী বদলাবে।

## SMS Format Example

নিচের মতো SMS থেকে অ্যাপটি টোকেন বের করতে পারে:

```text
Successful!Your BPDBprepaid Prepaid Token is 1960-2031-1264-1251-2016,0255-0413-8346-7664-7446,6169-6933-1668-2952-7674,6682-1049-4156-5535-3136,4088-9669-9122-5734-7901,0844-4826-2768-8090-0377,0408-1975-4705-5471-4592,1514-7971-2098-5644-6427,1324-4507-0077-8981-****,SquNo:0=8 for offline Meter No:10210586***
```

এই SMS-এ valid ২০-ডিজিট token গুলো আলাদা করে দেখানো হবে, incomplete token-এ validation warning দেখা যাবে, এবং sequence selection অনুযায়ী next recommended token highlight হবে।

## সহজ ব্যবহার

1. SMS পেস্ট করুন
2. সিকোয়েন্স নম্বর নির্বাচন করুন
3. প্রস্তাবিত টোকেন কপি করে মিটারে দিন

## Notes

- ইতিহাস, draft SMS, এবং theme preference LocalStorage-এ সংরক্ষিত হয়।
- `print` / `PDF` action ব্রাউজারের print dialog খুলে, যেখান থেকে PDF হিসেবে save করা যায়।
- প্রথমবার app open করার পর service worker offline cache activate হয়।
