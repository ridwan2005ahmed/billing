const MAX_SMS_LENGTH = 10000;
const TOKEN_LENGTH = 20;

const TOKEN_SPLIT_PATTERN = /[\s,\r\n]+/g;
const DIGIT_TOKEN_PATTERN = /\d[\d-]*\d|\d{20}/g;
const DIGIT_RUN_PATTERN = /\d+/g;

function normalizeChunk(chunk) {
  return chunk.replace(/[-\s]/g, '');
}

function isValidTokenCandidate(candidate) {
  return /^\d{20}$/.test(candidate);
}

function extractTokenCandidates(text) {
  const matches = [];
  const fragments = text.split(TOKEN_SPLIT_PATTERN);

  for (const fragment of fragments) {
    if (!fragment) {
      continue;
    }

    const digitRuns = fragment.match(DIGIT_TOKEN_PATTERN) || [];
    for (const run of digitRuns) {
      const cleaned = normalizeChunk(run);
      if (isValidTokenCandidate(cleaned)) {
        matches.push({ raw: run, token: cleaned });
      }
    }
  }

  return matches;
}

function extractDigitRuns(text) {
  return text.match(DIGIT_RUN_PATTERN) || [];
}

export function tokenizeSms(text) {
  const source = (text || '').trim();
  const digitRuns = extractDigitRuns(source);
  const tokenCandidates = extractTokenCandidates(source);

  const tokens = [];
  const seen = new Set();
  const duplicateTokens = new Set();
  const invalidLengthCandidates = [];
  const maskedOrIncompleteCandidates = [];

  const fragments = source.split(TOKEN_SPLIT_PATTERN);
  for (const fragment of fragments) {
    if (!fragment) {
      continue;
    }

    const digitRuns = fragment.match(DIGIT_TOKEN_PATTERN) || [];
    for (const run of digitRuns) {
      const digitCount = (run.match(/\d/g) || []).length;
      const cleaned = normalizeChunk(run);

      if (
        (fragment.includes('*') || digitCount >= 8)
        && !isValidTokenCandidate(cleaned)
        && digitCount > 0
        && digitCount < TOKEN_LENGTH
      ) {
        invalidLengthCandidates.push(run.trim());
      }
    }

    const containsMask = fragment.includes('*');
    const maskDigits = (fragment.match(/\d/g) || []).length;
    if (containsMask && maskDigits > 0 && maskDigits < TOKEN_LENGTH) {
      maskedOrIncompleteCandidates.push(fragment.trim());
    }
  }

  for (const item of tokenCandidates) {
    if (seen.has(item.token)) {
      duplicateTokens.add(item.token);
      continue;
    }

    seen.add(item.token);
    tokens.push(item.token);
  }

  return {
    rawText: source,
    tokens,
    tokenCandidates: tokenCandidates.map((item) => item.token),
    duplicateTokens: Array.from(duplicateTokens),
    invalidLengthCandidates,
    maskedOrIncompleteCandidates,
    digitRuns,
    stats: {
      totalCharacters: source.length,
      tokenCount: tokens.length,
      candidateCount: tokenCandidates.length,
    },
    warnings: {
      tooManyCharacters: source.length > MAX_SMS_LENGTH,
      tooFewCharacters: source.length > 0 && tokens.length === 0,
      emptyInput: source.length === 0,
      missingToken: maskedOrIncompleteCandidates.length > 0,
      invalidLength: invalidLengthCandidates.length > 0,
      duplicateToken: duplicateTokens.size > 0,
    },
  };
}

export function getNextSequence(currentSequence) {
  if (currentSequence === '' || currentSequence === null || currentSequence === undefined) {
    return null;
  }

  const numeric = Number(currentSequence);
  if (Number.isNaN(numeric)) {
    return null;
  }

  const next = numeric + 1;
  return next;
}

export function getRecommendedTokenIndex(currentSequence) {
  if (currentSequence === '' || currentSequence === null || currentSequence === undefined) {
    return null;
  }

  const numeric = Number(currentSequence);
  if (Number.isNaN(numeric)) {
    return null;
  }

  return numeric + 3;
}

export function getSequenceLabel(sequence) {
  if (sequence === null || sequence === undefined || sequence === '') {
    return 'নির্বাচিত নয়';
  }

  return String(sequence);
}

export function formatSmsDate(date = new Date()) {
  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function buildHistoryEntry({ tokenCount, selectedSequence, recommendedToken }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    tokenCount,
    selectedSequence,
    recommendedToken,
  };
}

export const TOKEN_ORDER = [
  -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
];

export function getTokenNumberFromSequence(sequence) {
  const numeric = Number(sequence);
  if (Number.isNaN(numeric)) {
    return null;
  }

  return numeric + 2;
}

export function getRecommendedToken(tokens, currentSequence) {
  const tokenNumber = getRecommendedTokenIndex(currentSequence);
  if (tokenNumber === null) {
    return null;
  }

  const tokenIndex = tokenNumber - 1;
  if (tokenIndex < 0 || tokenIndex >= tokens.length) {
    return null;
  }

  return {
    tokenNumber,
    sequenceNumber: getNextSequence(currentSequence),
    tokenValue: tokens[tokenIndex],
  };
}

export function getReadableValidationMessages(warnings) {
  const messages = [];

  if (warnings.emptyInput) {
    messages.push('SMS খালি আছে।');
  }

  if (warnings.tooManyCharacters) {
    messages.push('SMS খুব বড়। অনুগ্রহ করে অপ্রয়োজনীয় অংশ সরিয়ে আবার দিন।');
  }

  if (warnings.tooFewCharacters) {
    messages.push('কোনো বৈধ ২০ ডিজিটের টোকেন পাওয়া যায়নি।');
  }

  if (warnings.invalidLength) {
    messages.push('কিছু টোকেনের দৈর্ঘ্য ২০ ডিজিট নয়।');
  }

  if (warnings.missingToken) {
    messages.push('কিছু টোকেন অসম্পূর্ণ বা মাস্ক করা আছে।');
  }

  if (warnings.duplicateToken) {
    messages.push('একই টোকেন একাধিকবার এসেছে।');
  }

  return messages;
}
