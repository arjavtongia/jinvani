/*
 * Tithi (lunar day) calculation, done on the phone without internet.
 *
 * The tithi of a day is the one running at sunrise (उदय तिथि). Sun and moon
 * positions use the standard formulas from Jean Meeus, "Astronomical
 * Algorithms" (chapters 25 and 47), accurate to a few minutes of time.
 * Month names follow the purnimanta calendar used in North India
 * (a month ends on the full moon). Sunrise is taken for New Delhi.
 */
const PANCHANG = (function () {
  const RAD = Math.PI / 180;
  const DELTA_T_DAYS = 69.5 / 86400; /* TT minus UT, about 69.5 s in the 2020s */
  const PLACE = { lat: 28.6139, lon: 77.209 };

  function norm(x) {
    x %= 360;
    return x < 0 ? x + 360 : x;
  }

  function julianDay(ms) {
    return ms / 86400000 + 2440587.5;
  }

  function sunLongitude(jd) {
    const T = (jd + DELTA_T_DAYS - 2451545) / 36525;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * RAD) +
      (0.019993 - 0.000101 * T) * Math.sin(2 * M * RAD) +
      0.000289 * Math.sin(3 * M * RAD);
    const omega = 125.04 - 1934.136 * T;
    return norm(L0 + C - 0.00569 - 0.00478 * Math.sin(omega * RAD));
  }

  /* Main periodic terms of the moon's longitude: D, M, M', F, coefficient (millionths of a degree). */
  const MOON_TERMS = [
    [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
    [4, -1, 0, 0, 520], [1, 0, -2, 0, -487], [2, 1, 0, -2, -399], [0, 0, 2, -2, -381],
    [1, 1, 1, 0, 351], [3, 0, -2, 0, -340], [4, 0, -3, 0, 330], [2, -1, 2, 0, 327],
    [0, 2, 1, 0, -323], [1, 1, -1, 0, 299], [2, 0, 3, 0, 294]
  ];

  function moonLongitude(jd) {
    const T = (jd + DELTA_T_DAYS - 2451545) / 36525;
    const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
    const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
    const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;
    const E = 1 - 0.002516 * T - 0.0000074 * T2;
    const A1 = 119.75 + 131.849 * T;
    const A2 = 53.09 + 479264.29 * T;
    let sum = 0;
    MOON_TERMS.forEach(([d, m, mp, f, c]) => {
      const e = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1;
      sum += c * e * Math.sin((d * D + m * M + mp * Mp + f * F) * RAD);
    });
    sum += 3958 * Math.sin(A1 * RAD) + 1962 * Math.sin((Lp - F) * RAD) + 318 * Math.sin(A2 * RAD);
    const omega = 125.04452 - 1934.136261 * T;
    return norm(Lp + sum / 1e6 - 0.00478 * Math.sin(omega * RAD));
  }

  /* Angle of the moon ahead of the sun, 0..360. Each 12° is one tithi. */
  function elongation(jd) {
    return norm(moonLongitude(jd) - sunLongitude(jd));
  }

  /* Sunrise (Julian day, UT) on the calendar day that starts at jd0 (0h UT). */
  function sunrise(jd0) {
    let t = jd0 + (6 - PLACE.lon / 15) / 24;
    for (let i = 0; i < 3; i++) {
      const T = (t - 2451545) / 36525;
      const L0 = norm(280.46646 + 36000.76983 * T);
      const M = 357.52911 + 35999.05029 * T;
      const ecc = 0.016708634 - 0.000042037 * T;
      const C = (1.914602 - 0.004817 * T) * Math.sin(M * RAD) + 0.019993 * Math.sin(2 * M * RAD);
      const lambda = L0 + C - 0.00569;
      const eps = 23.439291 - 0.0130042 * T;
      const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD));
      const y = Math.tan(eps * RAD / 2) ** 2;
      const eqTime = 4 / RAD * (y * Math.sin(2 * L0 * RAD) - 2 * ecc * Math.sin(M * RAD) +
        4 * ecc * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) -
        0.5 * y * y * Math.sin(4 * L0 * RAD) - 1.25 * ecc * ecc * Math.sin(2 * M * RAD));
      const lat = PLACE.lat * RAD;
      const ha = Math.acos(Math.cos(90.833 * RAD) / (Math.cos(lat) * Math.cos(decl)) - Math.tan(lat) * Math.tan(decl)) / RAD;
      const minutes = 720 - 4 * (PLACE.lon + ha) - eqTime;
      t = jd0 + minutes / 1440;
    }
    return t;
  }

  /* Nearest new moon before jd. */
  function newMoonBefore(jd) {
    let t = jd - elongation(jd) / 12.1907;
    for (let i = 0; i < 5; i++) {
      let e = elongation(t);
      if (e > 180) e -= 360;
      t -= e / 12.1907;
    }
    return t;
  }

  /* Lahiri ayanamsa, for the sun's sidereal sign. */
  function sunSign(jd) {
    const years = (jd - 2451545) / 365.25;
    return Math.floor(norm(sunLongitude(jd) - (23.853 + 0.013969 * years)) / 30);
  }

  /* Amanta month of the lunation starting at new moon nm: 0 = Chaitra ... 11 = Phalguna. */
  function lunarMonth(nm) {
    const next = newMoonBefore(nm + 32);
    const signStart = sunSign(nm);
    const signEnd = sunSign(next);
    /* A month with no sankranti is "adhik" and takes the name of the month that follows it. */
    if (signStart === signEnd) return { index: (signEnd + 1) % 12, adhik: true };
    return { index: signEnd, adhik: false };
  }

  /* Tithi details for a calendar date (year, month 1-12, day) as seen in India. */
  function forDate(y, m, d) {
    const jd0 = julianDay(Date.UTC(y, m - 1, d));
    const rise = sunrise(jd0);
    const tithi = Math.floor(elongation(rise) / 12) + 1;
    const nm = newMoonBefore(rise);
    let month = lunarMonth(nm);
    /* Purnimanta: in the dark half the month already carries the next month's name. */
    if (tithi > 15) month = lunarMonth(newMoonBefore(nm + 32));
    return {
      tithi: tithi,
      paksha: tithi <= 15 ? 'shukla' : 'krishna',
      day: tithi <= 15 ? tithi : tithi - 15,
      month: month.index,
      adhik: month.adhik
    };
  }

  return { forDate: forDate, elongation: elongation, sunrise: sunrise, julianDay: julianDay };
})();

if (typeof module !== 'undefined') module.exports = PANCHANG;
