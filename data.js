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
      note: "⚠️ נפגע · 14 טילים בליסטיים איראניים"
    },
    {
      name: "Diego Garcia",
      hebName: "דייגו גרסיה",
      type: "base",
      lat: -7.32, lng: 72.42,
      note: "B-2 Spirit · תקיפות אסטרטגיות באיראן"
    },
    // מטרות איראניות שנפגעו על-ידי ארה״ב
    {
      name: "IRGC-Navy HQ Bandar Abbas",
      hebName: "🎯 בנדר עבאס — מטה IRGC-Navy",
      type: "strike",
      lat: 27.183, lng: 56.267,
      note: "נפגע · פיקוד חיל הים של IRGC"
    },
    {
      name: "Bushehr Naval Base",
      hebName: "🎯 בסיס הימי בושהר",
      type: "strike",
      lat: 28.977, lng: 50.836,
      note: "נפגע · מערכות טילים אנטי-ימיים"
    },
    {
      name: "Chabahar Coastal Radar",
      hebName: "🎯 רדארים חופיים צ'אבהאר",
      type: "strike",
      lat: 25.29, lng: 60.643,
      note: "נפגע · רדארים ומערכות זיהוי חופיות"
    },
  ];

  // ============== ציוני גורמים (0-100) ==============
  // עודכן לאירועי 7-8 ביולי 2026: הפסקת אש נשברה, ארה״ב תקפה 80+ מטרות באיראן,
  // איראן הגיבה על בסיסי ארה״ב במפרץ, מוג׳תבא חמינאי (מנהיג חדש) נעדר
  const factors = [
    {
      key: "us_strikes",
      name: "תקיפות אמריקאיות באיראן",
      desc: "80+ מטרות נפגעו · הגנ״א, פיקוד ובקרה, רדארים חופיים, 60+ סירות IRGC",
      weight: 0.20,
      score: Math.round(between(88, 96))
    },
    {
      key: "iran_strikes",
      name: "תקיפות איראניות על ארה״ב ובעלות ברית",
      desc: "3 מכליות תוקפו בהורמוז · טילים על עלי אל-סאלם ואל-עודייד · כווית בהתרעה",
      weight: 0.20,
      score: Math.round(between(80, 92))
    },
    {
      key: "proxy",
      name: "התכנסות פרוקסי לפעולה",
      desc: "חות׳ים בים סוף · חיזבאללה בגבול · כת׳איב חיזבאללה בעיראק · IRGC-Q",
      weight: 0.15,
      score: Math.round(between(75, 88))
    },
    {
      key: "regime",
      name: "יציבות משטר איראני",
      desc: "מוג׳תבא חמינאי (מנהיג חדש) נעדר · לוויה 4-9/7 · פילוגים בין IRGC וממשלה",
      weight: 0.15,
      score: Math.round(between(82, 94))
    },
    {
      key: "oil",
      name: "הידרדרות שוק האנרגיה",
      desc: "Brent > $110 · ארה״ב שללה יכולת מכירת נפט איראני · פאניקה בשוק",
      weight: 0.10,
      score: Math.round(between(82, 94))
    },
    {
      key: "regional",
      name: "מעורבות אזורית",
      desc: "ישראל בכוננות · ערה״ס וקטאר בנטרליות מתוחה · אמירויות מחוץ ל-OPEC · עיראק מאוימת",
      weight: 0.10,
      score: Math.round(between(66, 80))
    },
    {
      key: "escalation",
      name: "סיכון להסלמה כוללת",
      desc: "טראמפ: 'הפסקת האש נגמרה' · אין ערוץ עומאני פעיל · מסלול תגובה-נגד פתוח",
      weight: 0.10,
      score: Math.round(between(70, 84))
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

  // ============== מחירי נפט (הפסקת האש נשברה — פאניקה) ==============
  const brentBase = 118;
  const wtiBase = 114;
  const brent = jitter(brentBase, 0.05);
  const wti = jitter(wtiBase, 0.05);
  const ovx = between(78, 96);
  const brentChange = (rand() + 0.4) * 6;
  const wtiChange = (rand() + 0.4) * 6;
  const ovxChange = (rand() - 0.3) * 6;

  // גרף נפט 30 יום: מ-$92 להתייצבות סביב $100, ואז זינוק ל-$118 עם שבירת הפסקת האש
  const oilHistory = Array.from({length: 30}, (_, i) => {
    const t = i / 29;
    let trend;
    if (t < 0.7) {
      // 21 ימים ראשונים: התייצבות סביב $95-105
      trend = 96 + Math.sin(t * Math.PI * 3) * 5;
    } else if (t < 0.9) {
      // 6 ימים: התמתנות סביב $100
      trend = 100 + Math.sin(t * Math.PI * 4) * 4;
    } else {
      // 3 ימים אחרונים: זינוק (הפסקת אש נשברה 7/7)
      trend = 100 + (t - 0.9) * 10 * 18;
    }
    return +(trend + (rand() - 0.5) * 2.4).toFixed(2);
  });
  oilHistory[oilHistory.length - 1] = +brent.toFixed(2);

  // ============== פרוקסי ==============
  const levelFromScore = (s) => s > 80 ? 'CRIT' : s > 65 ? 'HIGH' : s > 45 ? 'MED' : 'LOW';
  const proxies = [
    {
      name: "IRGC-Navy · סירות מהירות",
      region: "מצרי הורמוז",
      metric: "60+ סירות הושמדו · 12 פעילות שריד (24ש׳)",
      value: Math.round(between(12, 22)),
      level: null
    },
    {
      name: "חות׳ים (תימן)",
      region: "ים סוף · באב אל-מנדב",
      metric: "שיגורים על שייט (24ש׳)",
      value: Math.round(between(11, 24)),
      level: null
    },
    {
      name: "כת׳איב חיזבאללה + AAH",
      region: "עלי אל-סאלם · עין אל-אסד",
      metric: "רקטות ורחפנים על בסיסי ארה״ב (24ש׳)",
      value: Math.round(between(15, 32)),
      level: null
    },
    {
      name: "חיזבאללה / חמאס",
      region: "גבול לבנון וגזרת עזה",
      metric: "אינדקס מוכנות לפעולה",
      value: Math.round(between(76, 92)),
      level: null
    },
  ];
  proxies.forEach(p => p.level = levelFromScore(
    p.metric.includes("אינדקס") ? p.value :
    p.metric.includes("סירות") ? 92 :
    p.metric.includes("שיגורים") ? Math.min(100, 60 + p.value * 3) :
    p.metric.includes("רקטות") ? Math.min(100, 55 + p.value * 2) :
    Math.min(100, p.value * 6)
  ));

  // ============== חדשות / איתותים (8 ביולי 2026) ==============
  const newsPool = [
    { time: "20ד׳", title: "🚨 בזק: איראן שיגרה 14 טילים בליסטיים לעבר בסיס עלי אל-סאלם בכווית", tag: "hawk" },
    { time: "1ש׳", title: "CENTCOM: 'תקפנו 80+ מטרות באיראן — הגנ״א, פיקוד ובקרה, רדארים'", tag: "hawk" },
    { time: "2ש׳", title: "טראמפ: 'הפסקת האש נגמרה. זה בזבוז זמן לנהל דיאלוג איתם'", tag: "hawk" },
    { time: "3ש׳", title: "60+ סירות מהירות של IRGC הושמדו בהורמוז", tag: "hawk" },
    { time: "4ש׳", title: "ארה״ב שוללת רשמית את יכולת איראן למכור נפט בשוק העולמי", tag: "hawk" },
    { time: "5ש׳", title: "Brent חצה $118 — עלייה של 18% ב-24 שעות", tag: "neutral" },
    { time: "6ש׳", title: "מוג׳תבא חמינאי (מנהיג עליון חדש) עדיין לא הופיע פומבית", tag: "neutral" },
    { time: "8ש׳", title: "איראן תקפה 3 מכליות מסחריות בהורמוז — הטריגר להסלמה", tag: "hawk" },
    { time: "10ש׳", title: "ישראל בכוננות מוגברת · סירן הפעיל בשגרירויות המפרץ", tag: "hawk" },
    { time: "14ש׳", title: "לוויית אייתאללה חמינאי נמשכת · טהרן, קום, נג'ף, כרבלא", tag: "neutral" },
    { time: "18ש׳", title: "רוסיה וסין דורשות ישיבת מועצת הביטחון בהולאום", tag: "neutral" },
    { time: "24ש׳", title: "אלפי חיילים אמריקאים ובני משפחתם מפונים מבסיסים במפרץ", tag: "hawk" },
    { time: "30ש׳", title: "שר החוץ הסעודי: 'המצב חורג מכל מסגרת דיפלומטית'", tag: "hawk" },
  ];
  // ערבוב מבוסס זרע לשמירה על יציבות בטווח הדקה
  const news = newsPool.sort(() => rand() - 0.5).slice(0, 8);

  // ============== לוח בזקים · תקיפות פעילות (24ש׳) ==============
  const stuckShips = Math.round(between(72, 88));
  const usStrikes = 80 + Math.round(between(4, 24));
  const iranStrikes = Math.round(between(24, 46));
  const hormuzStats = [
    { k: "מטרות איראניות שנפגעו (ארה״ב)", v: `${usStrikes}`},
    { k: "תקיפות איראניות (24ש׳)", v: `${iranStrikes}`},
    { k: "ביטוח מלחמה Lloyd's", v: `${(between(9.5, 14.0)).toFixed(1)}% מערך מטען`},
    { k: "ספינות תקועות בהורמוז", v: `${stuckShips}`},
  ];

  // ============== היסטוריה 30 ימים (תחילת יוני → סוף יולי) ==============
  // עלייה איטית בסוף יוני, יציבות במאי-יוני עם Project Freedom, ואז פיצוץ ב-7/7
  const history = Array.from({length: 30}, (_, i) => {
    const t = i / 29;
    let base;
    if (t < 0.6) {
      // 18 ימים ראשונים: 55-72 (מתח מוגבר, הפסקת אש רופפת)
      base = 60 + Math.sin(i * 0.45) * 8 + t * 12;
    } else if (t < 0.9) {
      // 9 ימים: 72-82 (הסלמה מתמשכת, הידרדרות)
      base = 72 + (t - 0.6) * 30;
    } else {
      // 3 ימים אחרונים: זינוק — הפסקת האש נשברה 7/7
      base = 82 + (t - 0.9) * 100;
    }
    return Math.max(50, Math.min(98, Math.round(base + (rand() - 0.5) * 4)));
  });
  history[history.length - 1] = overallScore;

  const historyEvents = [
    "8/7 · איראן תקיפה על בסיסי ארה״ב",
    "7/7 · ארה״ב תקפה 80+ מטרות באיראן",
    "7/7 · הפסקת האש נשברה",
    "4/7 · תחילת לוויית חמינאי",
    "29/6 · IRGC חוזר לתקיפות על שייט",
  ];

  // ============== כותרות דינמיות (8/7/2026) ==============
  const headlines = [
    "🚨 הפסקת האש נשברה · ארה״ב תקפה 80+ מטרות באיראן · איראן הגיבה על בסיסים",
    "טראמפ: 'הפסקת האש נגמרה — בזבוז זמן לדבר איתם'",
    "60+ סירות מהירות של IRGC הושמדו בהורמוז · מלחמה ימית פעילה",
    "מוג׳תבא חמינאי נעדר · שאלת פיקוד באיראן עומדת פתוחה",
    "Brent חצה $118 · פאניקה בשוקי האנרגיה העולמיים",
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
