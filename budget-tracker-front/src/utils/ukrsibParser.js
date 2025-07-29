const dateRe   = /^\d{2}\.\d{2}\.\d{4}$/;
const currRe   = /^(UAH|USD|EUR|PLN|GBP|CHF|CAD|AUD|JPY|CZK|HUF|NOK|SEK|DKK|RON|TRY|RUB)$/i;
const amountRe = /^-?\d{1,3}(?:[\s\u202F]\d{3})*(?:[.,]\d+)?$/;

const SEC_RE = {
  debt:    /Інформація\s+про\s+поточну\s+заборгованість\s+по\s+рахунку/i,
  cardAcc: /Операції\s+за\s+картковим\s+рахунком/i,
  cardPay: /Операції\s+за\s+платіжними\s+картками/i,
  holds:   /Поточні\s+блокування\s+по\s+рахунку/i
};

// ---------- helpers ----------
const cleanAmount = s => parseFloat(String(s).replace(/\s/g, "").replace(",", "."));

const extractAuthCode = str => (str.match(/^\s*(\d{3,})\b/) || ["", ""])[1];

const stripLeadingDigits = str =>
  str.replace(/^\s*\d{3,}\b\s*/, "")
     .replace(/^\s*[№#]?\d+\s+/, "")
     .trim();

// : ... ****1234 -> cardTail (вырезаем)
function splitCardTail(str) {
  const m = /:\s*([^:]*\*{4}\d{4}.*)$/.exec(str);
  if (!m) return { text: str.trim(), cardTail: "" };
  return { text: str.slice(0, m.index).trim(), cardTail: m[1].replace(/\.$/, "").trim() };
}

function findMaskedCards(str) {
  const all = str.match(/\b\d{6}\*{4}\d{4}\b/g);
  return all ? Array.from(new Set(all)) : [];
}

const splitByBackslashes = str =>
  str.split(/\\+/).map(s => s.trim()).filter(Boolean);

// address: берём все блоки по 3 токена CODE\CC\CITY
function cutAddressTokens(str) {
  let tokens = splitByBackslashes(str);
  const addresses = [];
  const isCode    = t => /^[A-Z0-9_]+$/i.test(t);
  const isCountry = t => /^[A-Z]{2}$/.test(t);

  let i = 0;
  while (i < tokens.length - 2) {
    if (isCode(tokens[i]) && isCountry(tokens[i + 1])) {
      const block = [tokens[i], tokens[i + 1], tokens[i + 2]].join("\\");
      addresses.push(block);
      tokens.splice(i, 3);
      continue;
    }
    i++;
  }

  return {
    text: tokens.join(" \\ ").replace(/\s{2,}/g, " ").trim(),
    address: addresses.join(" | ")
  };
}

// убираем "через MasterCard \ Visa"
function stripMcVisa(str) {
  return str
    .replace(/через\s+master\s*card(?:\s*[\\/]+\s*|\/\s*)visa/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// убираем заголовки таблиц внутри name (если вдруг протиснулись)
function stripTableHeaderGarbage(str) {
  return str
    .replace(/Дата\s+Код\s+Опис\s+операції[\s\S]*?(?=\b\d{2}\.\d{2}\.\d{4}\b)/i, "")
    .replace(/Дата\s+Опис\s+операції[\s\S]*?(?=\b\d{2}\.\d{2}\.\d{4}\b)/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// спец-фразы transfer/deposit
function handleTransferDeposit(text) {
  const reTransfer = /^(Переказ\s+грошових\s+коштів\s+з\s+картки\s+на\s+картку)/i;
  const mTr = text.match(reTransfer);
  if (mTr) {
    const phrase = mTr[1];
    const card = (text.match(/\b\d{6}\*{4}\d{4}\b/) || [""])[0];
    const nameOverride = `${phrase}${card ? " " + card : ""}`.trim();
    return { applied: true, type: phrase, textAfter: "", nameOverride };
  }

  const reDep = /^(Зарахування\s+грошових\s+коштів)/i;
  const mDep = text.match(reDep);
  if (mDep) {
    const phrase = mDep[1];
    const card = (text.match(/\b\d{6}\*{4}\d{4}\b/) || [""])[0];
    const nameOverride = `${phrase}${card ? " " + card : ""}`.trim();
    return { applied: true, type: phrase, textAfter: "", nameOverride };
  }
  return { applied: false };
}

// TYPE extraction
function extractType(text) {
  let out = text.trim(), type = "", nameOverride = "";

  const td = handleTransferDeposit(out);
  if (td.applied) return { text: td.textAfter, type: td.type, nameOverride: td.nameOverride };

  const tokens = splitByBackslashes(out);
  const startsWithTokens = (...w) =>
    w.every((word, idx) => (tokens[idx] || "").toLowerCase().startsWith(word.toLowerCase()));

  if (startsWithTokens("Оплата товарів", "послуг")) {
    type = "Оплата товарів \\ послуг";
    out  = tokens.slice(2).join(" \\ ").trim();
    return { text: out, type, nameOverride };
  }
  if (startsWithTokens("Повернення коштів за товар", "послугу")) {
    type = "Повернення коштів за товар \\ послугу";
    out  = tokens.slice(2).join(" \\ ").trim();
    return { text: out, type, nameOverride };
  }

  const reIB = /^(Оплата\s+послуг\s+за\s+допомогою\s+інтернет\s*-\s*банкінгу)/i;
  const mIB  = out.match(reIB);
  if (mIB) {
    type = mIB[1];
    out = out.replace(reIB, "").trim().replace(/_+/g, " ").replace(/\s{2,}/g, " ").trim();
    return { text: out, type, nameOverride };
  }

  const reGig = /^(Виплата\s+винагороди\s+за\s+гіг\s*-\s*контрактом\s+від\s+ТОВ\s+".+?")/i;
  const mGig  = out.match(reGig);
  if (mGig) {
    type = mGig[1];
    out = out.replace(reGig, "").trim().replace(/_+/g, " ").replace(/\s{2,}/g, " ").trim();
    return { text: out, type, nameOverride };
  }

  const reCommission = /^Комісія\s+за\s+переказ\s+грошових\s+коштів/i;
  if (reCommission.test(out)) {
    type = "Комісія за переказ";
    return { text: out, type, nameOverride };
  }

  const rePayment = /^Платіж\s+за\s+тарифний\s+план/i;
  if (rePayment.test(out)) {
    type = "Платіж";
    return { text: out, type, nameOverride };
  }

  const norm = out.replace(/\u00A0|\u202F/g, " ").replace(/\s+/g, " ").toLowerCase();
  if (norm.includes("перерахування на рахунок")) {
    type = "Перерахування";
    return { text: out, type, nameOverride };
  }

  return { text: out, type, nameOverride };
}

// TITLE
function extractTitle(nameStr) {
  const segs = nameStr.split(/\\+/).map(s => s.trim()).filter(Boolean);
  return segs.length ? segs[segs.length - 1] : nameStr.trim();
}

// detect section by scanning few next lines
function detectSection(lines, idx) {
  const window = lines.slice(idx, idx + 5).join(" ").replace(/\s+/g, " ");
  for (const [key, rex] of Object.entries(SEC_RE)) {
    if (rex.test(window)) return key;
  }
  return null;
}

// skip table header rows like "Дата  Дата  Опис..."
function skipTableHeader(lines, idx) {
  let i = idx;
  while (
    i < lines.length &&
    /(Дата|Код|Опис|Операц|Валюта|Сума)/i.test(lines[i]) &&
    !dateRe.test(lines[i])
  ) {
    i++;
  }
  return i;
}

// --- глобально вырезаем шапки из текста до парсинга ---
function purgeTableHeaders(text) {
  return text
    .replace(/Дата[\s\n]+Код[\s\n]+Опис[\s\n]+операції[\s\S]*?(?=\b\d{2}\.\d{2}\.\d{4}\b)/gi, "")
    .replace(/Дата[\s\n]+Опис[\s\n]+операції[\s\S]*?(?=\b\d{2}\.\d{2}\.\d{4}\b)/gi, "");
}

// ---------------- MAIN ----------------
export function parseAll(fullText) {
  // 1. Удалим глобальные шапки
  fullText = purgeTableHeaders(fullText);

  // 2. Разобьём по строкам
  const lines = fullText
    .replace(/\u00A0|\u202F/g, " ")
    .replace(/\r/g, "")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const sections = {
    debtInfo: { raw: "", status: "" },
    cardAcc: [],
    cardPay: [],
    holds: []
  };

  let currentSection = null;
  let debtBuf = [];
  const opsAll = [];
  let i = 0;

  while (i < lines.length) {
    const sec = detectSection(lines, i);
    if (sec) {
      currentSection = sec === "debt" ? "debt" : sec;
      if (sec === "debt") debtBuf = [];
      i = skipTableHeader(lines, i + 1);
      continue;
    }

    if (currentSection === "debt") {
      if (detectSection(lines, i)) continue; // уже поймается в начале
      debtBuf.push(lines[i]);
      i++;
      continue;
    }

    // --- операции ---
    if (!dateRe.test(lines[i])) { i++; continue; }

    const date = lines[i];

    let k = i + 1;
    if (k < lines.length && dateRe.test(lines[k])) k++; // вторая дата

    const descParts = [];
    while (k < lines.length && !currRe.test(lines[k])) {
      if (detectSection(lines, k)) break;
      descParts.push(lines[k]);
      k++;
    }
    if (k >= lines.length || !currRe.test(lines[k])) { i++; continue; }

    const currency   = lines[k];
    const amountLine = lines[k + 1];
    if (!amountLine || !amountRe.test(amountLine)) { i++; continue; }

    const amount   = cleanAmount(amountLine);
    const rawDesc  = descParts.join(" ").replace(/\s{2,}/g, " ").trim();

    const authCode = extractAuthCode(rawDesc);
    const noDigits = stripLeadingDigits(rawDesc);

    const { text: afterType, type, nameOverride } = extractType(noDigits);
    const { text: afterTail, cardTail }           = splitCardTail(afterType);
    const { text: afterAddr, address }            = cutAddressTokens(afterTail);

    const masked = findMaskedCards(noDigits);
    let card = cardTail;
    if (masked.length) {
      const add = masked.filter(c => !card.includes(c));
      if (add.length) card = card ? card + " | " + add.join(" | ") : add.join(" | ");
    }

    let finalName = nameOverride ? nameOverride : afterAddr;
    finalName = stripMcVisa(finalName);
    finalName = stripTableHeaderGarbage(finalName);

    const title = extractTitle(finalName);

    const op = { date, currency, amount, name: finalName, authCode, card, address, type, title };

    opsAll.push(op);
    if (currentSection === "cardPay") {
      sections.cardPay.push(op);
    } else if (currentSection === "holds") {
      sections.holds.push(op);
    } else {
      sections.cardAcc.push(op);
    }

    i = k + 2;
  }

  if (debtBuf.length) {
    sections.debtInfo.raw = debtBuf.join(" ");
    if (/Заборгованість\s+відсутня/i.test(sections.debtInfo.raw)) {
      sections.debtInfo.status = "Заборгованість відсутня.";
    }
  }

  return { sections, operations: opsAll };
}

export function mapToPrepare(op) {
  const transferWords = ["переказ", "перерахування"];
  const t = (op.type || "").toLowerCase();
  let type = 2;
  if (transferWords.some((w) => t.includes(w))) type = 0;
  else if (op.amount > 0) type = 1;

  return {
    title: op.title || op.name,
    amount: Math.abs(op.amount),
    currency: op.currency,
    date: new Date(op.date.split(".").reverse().join("-")).toISOString(),
    type,
    description: op.name,
    authCode: op.authCode || "",
  };
}
