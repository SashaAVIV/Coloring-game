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
  // הגורמים נבנים מתוך אותו זרע אך עם טווחים שונים, כך שציון כולל יישאר עקבי
  const factors = [
    {
      key: "naval",
      name: "נוכחות ימית בזירה",
      desc: "נושאות מטוסים, משחתות ו-ARG במפרץ הפרסי / ים סוף / מזרח הים התיכון",
      weight: 0.20,
      score: Math.round(between(62, 82))
    },
    {
      key: "air",
      name: "תעופה אסטרטגית",
      desc: "מפציצים, מטוסי תדלוק KC-135/46, תובלת C-17 ו-AWACS",
      weight: 0.20,
      score: Math.round(between(58, 78))
    },
    {
      key: "oil",
      name: "תנודתיות שוק האנרגיה",
      desc: "Brent / WTI / OVX · פרמיית סיכון באספקה",
      weight: 0.10,
      score: Math.round(between(45, 72))
    },
    {
      key: "proxy",
      name: "פעילות פרוקסי",
      desc: "חות׳ים, חיזבאללה, מיליציות עיראק, כוח קודס",
      weight: 0.15,
      score: Math.round(between(55, 85))
    },
    {
      key: "rhetoric",
      name: "רטוריקה דיפלומטית ואיומים רשמיים",
      desc: "הודעות בית הלבן, משרד החוץ האיראני, חמינאי, Telegram של IRGC",
      weight: 0.15,
      score: Math.round(between(50, 80))
    },
    {
      key: "nuke",
      name: "התקדמות גרעינית",
      desc: "מלאי העשרה 60%+, גישת סבא״א, תנועת צנטריפוגות",
      weight: 0.10,
      score: Math.round(between(60, 88))
    },
    {
      key: "alerts",
      name: "התרעות טילים / רחפנים",
      desc: "שיגורים לישראל / ברית המפרץ / שייט מסחרי",
      weight: 0.10,
      score: Math.round(between(30, 70))
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

  // ============== מחירי נפט ==============
  const brentBase = 82;
  const wtiBase = 78;
  const brent = jitter(brentBase, 0.08);
  const wti = jitter(wtiBase, 0.08);
  const ovx = between(38, 58);
  const brentChange = (rand() - 0.3) * 4;
  const wtiChange = (rand() - 0.3) * 4;
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
      name: "חות׳ים (תימן)",
      region: "ים סוף · באב אל-מנדב",
      metric: "שיגורים לשייט (7י׳)",
      value: Math.round(between(6, 18)),
      level: null
    },
    {
      name: "חיזבאללה",
      region: "גבול לבנון",
      metric: "מטחים לישראל (7י׳)",
      value: Math.round(between(0, 8)),
      level: null
    },
    {
      name: "כת׳איב חיזבאללה",
      region: "מיליציות עיראק",
      metric: "תקיפות על בסיסי ארה״ב (7י׳)",
      value: Math.round(between(2, 12)),
      level: null
    },
    {
      name: "כוח קודס",
      region: "סוריה / עיראק",
      metric: "תנועות מודיעין (אינדקס)",
      value: Math.round(between(55, 92)),
      level: null
    },
  ];
  proxies.forEach(p => p.level = levelFromScore(
    p.metric.includes("אינדקס") ? p.value :
    p.metric.includes("שיגורים") ? Math.min(100, p.value * 6) :
    p.metric.includes("מטחים") ? Math.min(100, p.value * 15) :
    Math.min(100, p.value * 10)
  ));

  // ============== חדשות / איתותים ==============
  const newsPool = [
    { time: "שעה", title: "נשיא ארה״ב: 'כל תקיפה על כוחותינו תיתקל בתגובה חסרת תקדים'", tag: "hawk" },
    { time: "2ש׳", title: "חמינאי: 'משמרות המהפכה ערוכים לכל תרחיש'", tag: "hawk" },
    { time: "3ש׳", title: "משלחת עומאנית נחתה בטהרן לשיחות חשאיות", tag: "dove" },
    { time: "4ש׳", title: "דובר הפנטגון: 'הפסקת האש מחזיקה, אך מוכנים להגיב'", tag: "neutral" },
    { time: "6ש׳", title: "חות׳ים איימו על נתיב השיט בבאב אל-מנדב", tag: "hawk" },
    { time: "8ש׳", title: "סבא״א: 'גישה חלקית לאתר פורדו במהלך הסיור האחרון'", tag: "hawk" },
    { time: "10ש׳", title: "סוחרי נפט מדווחים על עליית פרמיית סיכון", tag: "neutral" },
    { time: "12ש׳", title: "איראן: 'מוכנים לשוב לשיחות אם הסנקציות יוסרו'", tag: "dove" },
    { time: "14ש׳", title: "CENTCOM: תרגיל משולב עם חילות סעודיים ואמירתים", tag: "neutral" },
    { time: "18ש׳", title: "מקור בממשל: 'איראן העבירה ציוד רגיש מאתר איספהאן'", tag: "hawk" },
    { time: "22ש׳", title: "שליח ה-EU: 'חלון הזדמנויות צר אך קיים'", tag: "dove" },
  ];
  // ערבוב מבוסס זרע לשמירה על יציבות בטווח הדקה
  const news = newsPool.sort(() => rand() - 0.5).slice(0, 8);

  // ============== גרעין ==============
  const enrichKg = Math.round(between(128, 182));
  const nukeStats = [
    { k: "העשרה 60%+", v: `${enrichKg} ק״ג`},
    { k: "העשרה 20%", v: `${Math.round(between(600, 900))} ק״ג`},
    { k: "צנטריפוגות פעילות", v: `${Math.round(between(11000, 15000))}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")},
    { k: "זמן פריצה מוערך", v: `${(between(0.8, 2.4)).toFixed(1)} חודשים`},
  ];

  // ============== היסטוריה 30 ימים ==============
  const history = Array.from({length: 30}, (_, i) => {
    const t = i / 29;
    const base = 45 + t * 25;
    return Math.max(25, Math.min(95, Math.round(base + Math.sin(i * 0.7) * 7 + (rand() - 0.5) * 6)));
  });
  history[history.length - 1] = overallScore;

  const historyEvents = [
    "20/4 · תקיפה מיוחסת באיספהאן",
    "15/4 · מתקפה איראנית על ישראל",
    "5/4 · תקיפה בדמשק",
  ];

  // ============== כותרות דינמיות ==============
  const headlines = [
    "פריסה מוגברת של צי ארה״ב במפרץ — עקומת הסיכון במגמת עלייה",
    "איתותים מעורבים: ערוצי דיפלומטיה פעילים במקביל להתגברות רטוריקה",
    "נוכחות מפציצים ב-Diego Garcia ובאל-עודייד מעל הממוצע החודשי",
    "שיגורי חות׳ים ומיליציות עיראק דוחפים את המדד כלפי מעלה",
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
    nukeStats,
    enrichKg,
    history,
    historyEvents,
    headline,
  };
});
