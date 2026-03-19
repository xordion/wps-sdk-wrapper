export interface SearchMatchItem {
  text: string;
  pos: number;
  len: number;
  end: number;
  similarity: number;
}

export interface SearchQuery {
  targetText: string;
  precision: number;
  caseSensitive?: boolean;
  highlight?: boolean;
  clearPreviousHighlight?: boolean;
}

export interface SearchResult {
  targetText: string;
  topMatches: SearchMatchItem[];
  matches: SearchMatchItem[];
  precision: number;
  topSimilarity: number;
}

/**
 * 处理转义字符，将字符串中的转义序列转换为真正的字符
 * @param str 包含转义字符的字符串
 * @returns 处理后的字符串
 */
function unescapeString(str: string): string {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r")
    .replace(/\\f/g, "\f")
    .replace(/\\v/g, "\v")
    .replace(/\\\\/g, "\\");
}

/**
 * 归一化精确度参数，限制在 0~100 之间
 */
function normalizePrecision(value: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function isOverlapped(a: SearchMatchItem, b: SearchMatchItem): boolean {
  return a.pos < b.end && b.pos < a.end;
}

/**
 * 对重叠窗口做去重，保留相似度更高的候选
 */
function dedupeOverlappedMatches(matches: SearchMatchItem[]): SearchMatchItem[] {
  if (!matches.length) return [];

  const sortedByScore = [...matches].sort((a, b) => {
    if (b.similarity !== a.similarity) return b.similarity - a.similarity;
    return a.pos - b.pos;
  });

  const selected: SearchMatchItem[] = [];
  for (const candidate of sortedByScore) {
    const hasOverlap = selected.some((item) => isOverlapped(item, candidate));
    if (!hasOverlap) {
      selected.push(candidate);
    }
  }

  return selected.sort((a, b) => a.pos - b.pos);
}

function boundedLevenshteinDistance(
  left: string,
  right: string,
  maxDistance: number
): number | null {
  const leftLen = left.length;
  const rightLen = right.length;
  const lengthDiff = Math.abs(leftLen - rightLen);
  if (lengthDiff > maxDistance) return null;

  if (left === right) return 0;
  if (leftLen === 0) return rightLen <= maxDistance ? rightLen : null;
  if (rightLen === 0) return leftLen <= maxDistance ? leftLen : null;

  const sentinel = maxDistance + 1;
  const prev = new Array<number>(rightLen + 1);
  const curr = new Array<number>(rightLen + 1);

  for (let j = 0; j <= rightLen; j += 1) {
    prev[j] = j;
  }

  for (let i = 1; i <= leftLen; i += 1) {
    curr[0] = i;
    const from = Math.max(1, i - maxDistance);
    const to = Math.min(rightLen, i + maxDistance);

    // 带宽之外设置哨兵值，避免使用到上一轮的残留值
    for (let j = 1; j < from; j += 1) curr[j] = sentinel;
    for (let j = to + 1; j <= rightLen; j += 1) curr[j] = sentinel;

    let rowMin = curr[0];
    for (let j = from; j <= to; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      const del = prev[j] + 1;
      const ins = curr[j - 1] + 1;
      const sub = prev[j - 1] + cost;
      const value = Math.min(del, ins, sub);
      curr[j] = value;
      if (value < rowMin) rowMin = value;
    }

    if (rowMin > maxDistance) return null;

    for (let j = 0; j <= rightLen; j += 1) {
      prev[j] = curr[j];
    }
  }

  const distance = prev[rightLen];
  return distance <= maxDistance ? distance : null;
}

function distanceToSimilarity(distance: number, leftLen: number, rightLen: number): number {
  const base = Math.max(leftLen, rightLen);
  if (!base) return 0;
  return ((base - distance) / base) * 100;
}

async function getDocumentText(app: any): Promise<string> {
  try {
    const documentRange = await app?.ActiveDocument?.GetDocumentRange?.();
    const end = await documentRange?.End;
    const docLength = Math.max(0, Number(end || 0) - 8);
    const range = await app?.ActiveDocument?.Range?.(0, docLength);
    return (await range?.Text) || "";
  } catch (error) {
    console.error("读取文档全文失败:", error);
    return "";
  }
}

function buildSlidingWindowMatches(
  fullText: string,
  targetText: string,
  precision: number,
  caseSensitive: boolean
): SearchMatchItem[] {
  const targetLen = targetText.length;
  if (!targetLen || fullText.length < targetLen) return [];

  const candidates: SearchMatchItem[] = [];
  const maxStart = fullText.length - targetLen;
  const normalizedTarget = caseSensitive ? targetText : targetText.toLowerCase();
  const normalizedFullText = caseSensitive ? fullText : fullText.toLowerCase();
  const maxDistance = Math.floor((1 - precision / 100) * targetLen);

  for (let start = 0; start <= maxStart; start += 1) {
    const textForCompare = normalizedFullText.slice(start, start + targetLen);
    const distance = boundedLevenshteinDistance(
      textForCompare,
      normalizedTarget,
      maxDistance
    );
    if (distance !== null) {
      const similarity = distanceToSimilarity(distance, targetLen, targetLen);
      candidates.push({
        text: fullText.slice(start, start + targetLen),
        pos: start,
        len: targetLen,
        end: start + targetLen,
        similarity: Number(similarity.toFixed(2)),
      });
    }
  }

  return dedupeOverlappedMatches(candidates);
}

function pickTopSimilarityMatches(matches: SearchMatchItem[]): SearchMatchItem[] {
  if (!matches.length) return [];
  const highestSimilarity = Math.max(...matches.map((item) => item.similarity));
  return matches.filter(
    (item) => Math.abs(item.similarity - highestSimilarity) < 0.0001
  );
}

async function highlightMatches(app: any, matches: SearchMatchItem[]) {
  if (!app || !matches.length) return;
  const find = app?.ActiveDocument?.Find;

  try {
    await find?.ClearHitHighlight?.();
  } catch (error) {
    console.warn("清理高亮状态失败:", error);
  }

  const highlightedTexts = new Set<string>();
  for (const item of matches) {
    const keyword = item.text?.trim();
    if (!keyword || highlightedTexts.has(keyword)) continue;

    try {
      await find?.Execute?.(keyword, true);
      highlightedTexts.add(keyword);
    } catch (error) {
      console.warn(`高亮匹配片段失败(pos=${item.pos}, text=${keyword}):`, error);
    }
  }
}

/**
 * 统一搜索入口：仅接收对象参数，返回最高匹配（含并列）
 */
export async function searchAndLocateText(
  app: any,
  query: SearchQuery
): Promise<SearchResult | null> {
  if (!app) return null;

  const targetText = unescapeString(query.targetText || "");
  if (!targetText) return null;

  const precision = normalizePrecision(query.precision);
  const caseSensitive = Boolean(query.caseSensitive);
  const shouldHighlight = query.highlight ?? true;
  const shouldClearPreviousHighlight = query.clearPreviousHighlight ?? true;

  const fullText = await getDocumentText(app);
  if (!fullText) return null;

  const matches = buildSlidingWindowMatches(
    fullText,
    targetText,
    precision,
    caseSensitive
  );
  if (!matches.length) {
    if (shouldClearPreviousHighlight) {
      await app?.ActiveDocument?.Find?.ClearHitHighlight?.();
    }
    console.warn(`搜索失败: 未找到满足阈值的文本 "${targetText}"`);
    return null;
  }

  const topMatches = pickTopSimilarityMatches(matches);
  if (shouldHighlight) {
    if (!shouldClearPreviousHighlight) {
      // 高亮函数默认会清空；不清空时直接逐个 Execute
      const find = app?.ActiveDocument?.Find;
      const highlightedTexts = new Set<string>();
      for (const item of topMatches) {
        const keyword = item.text?.trim();
        if (!keyword || highlightedTexts.has(keyword)) continue;
        await find?.Execute?.(keyword, true);
        highlightedTexts.add(keyword);
      }
    } else {
      await highlightMatches(app, topMatches);
    }
  }
  return {
    targetText,
    topMatches,
    matches,
    precision,
    topSimilarity: topMatches[0].similarity,
  };
}
