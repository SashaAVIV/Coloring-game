/* ============================================================
   data.js — מחולל אינדיקטורים סימולטיבי
   הערה: ללא חיבור מקוון לא ניתן למשוך AIS/ADS-B/EIA בזמן אמת.
   הקובץ מייצר נתונים ריאליסטיים מבוססי טווחים פומביים ידועים,
   עם רעש אקראי כדי לדמות "נשימה" של דשבורד חי.
   ============================================================ */

const DATA = (() => {
  // זרע פסאודו-אקראי דטרמיניסטי לפי שעה => הנתונים "מתעדכנים" כל דקה
  const seedTime = Math.floor(Date.now() / 60000);
  let seed = seedTime;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const between = (min, max) => min + rand() * (max - min);
  const jitter = (base, pct) => base * (1 + (rand() - 0.5) * 2 * pct);

  // ============== נכסים ימיים — מבוסס OSINT פומבי ==============
  const navalAssets = [
    {
      name: "USS Dwight D. Eisenhower (CVN-69)",
      hebName: "נושאת מטוסים איק",
      type: "carrier",
      lat: 25.3 + (rand() - 0.5) * 0.8,
      lng: 56.6 + (rand() - 0.5) * 0.8,
      crew: 5000,
      note: "סיירת ה-5 · איתות הרתעה קבוע"
    },
    {
      name: "USS Harry S. Truman (CVN-75)",
      hebName: "נושאת מטוסים טרומן",
      type: "carrier",
      lat: 35.2 + (rand() - 0.5) * 0.4,
      lng: 18.4 + (rand() - 0.5) * 0.4,
      crew: 5000,
      note: "ים התיכון המזרחי · בגיבוי CSG"
    },
    {
      name: "USS Bataan (LHD-5)",
      hebName: "ספינת נחיתה בטאן",
      type: "amph",
      lat: 27.3 + (rand() - 0.5) * 0.3,
      lng: 51.2 + (rand() - 0.5) * 0.3,
      crew: 1000,
      note: "ARG/MEU · מרינס על סיפון"
    },
    {
      name: "USS Gravely (DDG-107)",
      hebName: "משחתת גרבלי",
      type: "ddg",
      lat: 12.8, lng: 43.2,
      crew: 300,
      note: "ים סוף · יירוטי Houthi"
    },
    {
      name: "USS Mason (DDG-87)",
      hebName: "משחתת מייסון",
      type: "ddg",
      lat: 13.6, lng: 49.0,
      crew: 300,
      note: "מפרץ עדן"
    },
    {
      name: "USS Carney (DDG-64)",
      hebName: "משחתת קארני",
      type: "ddg",
      lat: 34.0, lng: 33.4,
      crew: 300,
      note: "ים התיכון המזרחי"
    },
    {
      name: "USS Laboon (DDG-58)",
      hebName: "משחתת לאבון",
      type: "ddg",
      lat: 24.6, lng: 54.2,
      crew: 300,
      note: "מפרץ פרסי"
    },
    {
      name: "Al Udeid Air Base",
      hebName: "בסיס אל-עודייד (קטאר)",
      type: "base",
      lat: 25.117, lng: 51.315,
      note: "CENTCOM HQ · מפציצי B-1B / B-52"
    },
    {
      name: "NSA Bahrain (5th Fleet HQ)",
      hebName: "מטה הצי ה-5 (בחריין)",
      type: "base",
      lat: 26.21, lng: 50.6,
      note: "פיקוד ימי CENTCOM"
    },
    {
      name: "Prince Sultan AB",
      hebName: "בסיס הנסיך סולטאן (ערה״ס)",
      type: "base",
      lat: 24.062, lng: 47.58,
      note: "F-22 · מערך הגנה אווירית"
    },
    {
      name: "Ali Al Salem AB",
      hebName: "בסיס עלי אל-סאלם (כווית)",
      type: "base",
      lat: 29.347, lng: 47.52,
      note: "A-10 · מטוסי תובלה"
    },
    {
      name: "Diego Garcia",
      hebName: "דייגו גרסיה",
      type: "base",
      lat: -7.32, lng: 72.42,
      note: "B-2 Spirit · סיקור אסטרטגי"
    },
  ];

  // ============== ציוני גורמים (0-100) ==============
  // טווחים מכוילים לאירועים בפועל (4 במאי 2026): Project Freedom פעיל,
  // תקיפת רחפנים על מכלית ADNOC, רטוריקה "blast them away", אמירויות פרשה מ-OPEC
  const factors = [
    {
      key: "naval",
      name: "נוכחות ימית בזירה",
      desc: "Project Freedom פעיל בהורמוז · 2 CSG פרוסות · 4 משחתות בים סוף ומפרץ פרסי",
      weight: 0.22,
      score: Math.round(between(86, 95))
    },
    {
      key: "air",
      name: "תעופה אסטרטגית",
      desc: "מפציצים B-2/B-52, KC-135/46 בקצב מבצעי, תובלת C-17/C-5, AWACS מעל הורמוז",
      weight: 0.22,
      score: Math.round(between(76, 88))
    },
    {
      key: "proxy",
      name: "פעילות פרוקסי / IRGC",
      desc: "רחפני IRGC על ADNOC · חות׳ים על שייט · מיליציות עיראק על בסיסי ארה״ב",
      weight: 0.17,
      score: Math.round(between(72, 84))
    },
    {
      key: "rhetoric",
      name: "רטוריקה דיפלומטית ואיומים רשמיים",
      desc: "טראמפ: 'blast them away' · UAE: 'פיראטיות של IRGC' · חמינאי: 'התשובה תהיה כואבת'",
      weight: 0.17,
      score: Math.round(between(82, 94))
    },
    {
      key: "oil",
      name: "תנודתיות שוק האנרגיה",
      desc: "Brent / WTI / OVX · פרמיית סיכון בהורמוז · מכליות מנותבות מחדש",
      weight: 0.11,
      score: Math.round(between(68, 84))
    },
    {
      key: "alerts",
      name: "התרעות טילים / רחפנים",
      desc: "תקיפות פעילות ב-7י׳: ADNOC, USS Mason · שיגורים מתימן · רחפנים בעיראק",
      weight: 0.11,
      score: Math.round(between(78, 92))
    },
  ];

  const overallScore = Math.round(
    factors.reduce((s, f) => s + f.score * f.weight, 0)
  );
  const delta = Math.round((rand() - 0.4) * 8);

  // ============== פעילות אווירית ==============
  const airActivity = {
    bombers: { label: "מפציצים אסטרטגיים", value: Math.round(between(4, 9)), unit: "גיחות", trend: "up" },
    tankers: { label: "מטוסי תדלוק לאזור", value: Math.round(between(18, 34)), unit: "טיסות/יום", trend: "up" },
    transport: { label: "תובלת C-17/C-5", value: Math.round(between(12, 22)), unit: "נחיתות", trend: "flat" },
    awacs: { label: "AWACS / מודיעין RC-135", value: Math.round(between(3, 7)), unit: "סבבים", trend: "up" },
  };

  const tankerHistory = Array.from({length: 14}, (_, i) => {
    return Math.round(between(14, 32) + i * 0.4);
  });

  // ============== מחירי נפט (משקפים פרמיית הורמוז) ==============
  const brentBase = 96;
  const wtiBase = 92;
  const brent = jitter(brentBase, 0.06);
  const wti = jitter(wtiBase, 0.06);
  const ovx = between(58, 78);
  const brentChange = (rand() + 0.1) * 4;
  const wtiChange = (rand() + 0.1) * 4;
  const ovxChange = (rand() - 0.3) * 6;

  const oilHistory = Array.from({length: 30}, (_, i) => {
    const t = i / 29;
    const trend = brentBase + Math.sin(t * Math.PI * 2) * 3 + t * 4;
    return +(trend + (rand() - 0.5) * 2.4).toFixed(2);
  });
  oilHistory[oilHistory.length - 1] = +brent.toFixed(2);

  // ============== פרוקסי ==============
  const levelFromScore = (s) => s > 80 ? 'CRIT' : s > 65 ? 'HIGH' : s > 45 ? 'MED' : 'LOW';
  const proxies = [
    {
      name: "IRGC (משמרות המהפכה)",
      region: "מצרי הורמוז",
      metric: "תקיפות רחפנים על שייט (7י׳)",
      value: Math.round(between(3, 9)),
      level: null
    },
    {
      name: "חות׳ים (תימן)",
      region: "ים סוף · באב אל-מנדב",
      metric: "שיגורים לשייט (7י׳)",
      value: Math.round(between(8, 22)),
      level: null
    },
    {
      name: "מיליציות עיראק (כת׳איב חיזבאללה)",
      region: "אל-אסד · עין אל-אסד",
      metric: "תקיפות על בסיסי ארה״ב (7י׳)",
      value: Math.round(between(4, 14)),
      level: null
    },
    {
      name: "כוח קודס",
      region: "סוריה / עיראק / לבנון",
      metric: "תנועות מודיעין (אינדקס)",
      value: Math.round(between(72, 95)),
      level: null
    },
  ];
  proxies.forEach(p => p.level = levelFromScore(
    p.metric.includes("אינדקס") ? p.value :
    p.metric.includes("רחפנים") ? Math.min(100, 60 + p.value * 6) :
    p.metric.includes("שיגורים") ? Math.min(100, p.value * 5) :
    Math.min(100, p.value * 8)
  ));

  // ============== חדשות / איתותים (4 במאי 2026) ==============
  const newsPool = [
    { time: "שעה", title: "אמירויות: 'תקיפת הרחפנים על מכלית ADNOC היא מעשה פיראטיות של IRGC'", tag: "hawk" },
    { time: "2ש׳", title: "טראמפ: 'אם השיחות ייכשלו — אפוצץ אותם'", tag: "hawk" },
    { time: "3ש׳", title: "Project Freedom: ספינה אמריקאית מלווה מכלית ראשונה דרך הורמוז", tag: "neutral" },
    { time: "4ש׳", title: "טהרן: 'משימת הורמוז של טראמפ מהווה הפרת הפסקת אש'", tag: "hawk" },
    { time: "6ש׳", title: "אנואר ג'רגאש (יועץ נשיא אמירויות): 'לא ניתן לסמוך על איראן'", tag: "hawk" },
    { time: "8ש׳", title: "טראמפ: 'אנו מנהלים דיונים מאוד חיוביים עם איראן'", tag: "dove" },
    { time: "10ש׳", title: "Brent חצה $96 — פרמיית סיכון בהורמוז ברמת שיא", tag: "neutral" },
    { time: "12ש׳", title: "טראמפ: 'לא מרוצה מהצעת השלום של איראן'", tag: "hawk" },
    { time: "14ש׳", title: "ארה״ב מכחישה שפריגטה נפגעה ע״י טילים בהורמוז", tag: "neutral" },
    { time: "18ש׳", title: "אמירויות פרשה רשמית מ-OPEC לאחר עשרות שנים", tag: "neutral" },
    { time: "22ש׳", title: "עומאן: 'ערוץ דיפלומטי עדיין פתוח בין וושינגטון לטהרן'", tag: "dove" },
    { time: "26ש׳", title: "טראמפ לקונגרס: 'עוינויות 28 בפברואר הסתיימו עם הפסקת אש'", tag: "neutral" },
  ];
  // ערבוב מבוסס זרע לשמירה על יציבות בטווח הדקה
  const news = newsPool.sort(() => rand() - 0.5).slice(0, 8);

  // ============== מצרי הורמוז (Strait of Hormuz Status) ==============
  const stuckShips = Math.round(between(38, 64));
  const dronesIntercepted = Math.round(between(11, 24));
  const hormuzStats = [
    { k: "ספינות מסחרית תקועות", v: `${stuckShips}`},
    { k: "רחפנים יורטו (7י׳)", v: `${dronesIntercepted}`},
    { k: "ביטוח מלחמה Lloyd's", v: `${(between(2.4, 4.8)).toFixed(1)}% מערך מטען`},
    { k: "ניתוב מחדש דרך כף התקווה", v: `${Math.round(between(28, 52))} מכליות`},
  ];

  // ============== היסטוריה 30 ימים ==============
  const history = Array.from({length: 30}, (_, i) => {
    const t = i / 29;
    // יום 1 = 7 באפריל (יום הפסקת אש) → ירידה → עליה הדרגתית עם הסלמה
    const base = 55 + t * 30;
    return Math.max(35, Math.min(96, Math.round(base + Math.sin(i * 0.55) * 8 + (rand() - 0.5) * 5)));
  });
  history[history.length - 1] = overallScore;

  const historyEvents = [
    "4/5 · תקיפת רחפנים על ADNOC",
    "3/5 · תחילת Project Freedom",
    "29/4 · אמירויות יוצאת מ-OPEC",
    "21/4 · הפסקת אש הוארכה",
    "7/4 · הפסקת אש ראשונית",
  ];

  // ============== כותרות דינמיות ==============
  const headlines = [
    "Project Freedom פעיל — חיל ים אמריקאי מלווה מכליות דרך הורמוז",
    "אמירויות מאשימה את IRGC ב'פיראטיות' לאחר תקיפת רחפנים על ADNOC",
    "טראמפ: 'אם השיחות ייכשלו — אפוצץ אותם' · רטוריקה ברמת שיא",
    "מנותב מחדש: עשרות מכליות בוחרות בכף התקווה במקום הורמוז",
    "פרישת אמירויות מ-OPEC משנה את מאזן הברית במפרץ",
  ];
  const headline = headlines[Math.floor(rand() * headlines.length)];

  return {
    timestamp: new Date(),
    overallScore,
    delta,
    factors,
    navalAssets,
    airActivity,
    tankerHistory,
    oil: {
      brent: +brent.toFixed(2),
      wti: +wti.toFixed(2),
      ovx: +ovx.toFixed(2),
      brentChange: +brentChange.toFixed(2),
      wtiChange: +wtiChange.toFixed(2),
      ovxChange: +ovxChange.toFixed(2),
      history: oilHistory,
    },
    proxies,
    news,
    hormuzStats,
    stuckShips,
    history,
    historyEvents,
    headline,
  };
});
