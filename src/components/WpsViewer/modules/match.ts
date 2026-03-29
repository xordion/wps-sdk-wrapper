import type { WpsApplication } from "@/interface";
import { searchAndLocateText } from "./search";
import { highlightByRange } from "./highlight";

export interface SearchMatchRange {
  pos: number;
  len: number;
}

export interface SelectionState {
  hasSelection: boolean;
  start: number | null;
  end: number | null;
}

export interface ComputeNextMatchIndexInput {
  direction: "prev" | "next";
  currentMatchIndex: number;
  latestMatchesLength: number;
  previousMatchesLength: number;
  forceSelectFirst?: boolean;
}

export interface NavigateTopMatchInput {
  app: WpsApplication;
  keyword: string;
  direction: "prev" | "next";
  currentMatchIndex: number;
  previousMatchesLength: number;
  precision?: number;
  forceSelectFirst?: boolean;
}

export interface NavigateTopMatchResult {
  matches: SearchMatchRange[];
  nextIndex: number;
  selected: boolean;
}

/**
 * @deprecated Internal compatibility helper. Prefer using `navigateTopMatch` directly. 兼容辅助函数，优先直接使用 `navigateTopMatch`。
 */
export const textPosToWpsPos = async (
  app: WpsApplication,
  textPos: number,
  maxIterations: number = 5
): Promise<number> => {
  const doc = app?.ActiveDocument;
  if (!doc) return textPos;

  let wpsPos = textPos;
  for (let i = 0; i < maxIterations; i += 1) {
    try {
      const range = await doc.Range?.(0, wpsPos);
      if (!range) break;
      const text: string = (await range.Text) ?? "";
      const diff = textPos - text.length;
      if (diff === 0) break;

      const nextPos = wpsPos + diff;
      if (nextPos === wpsPos) break;
      wpsPos = nextPos;
    } catch {
      break;
    }
  }

  return Math.max(0, wpsPos);
};

export const selectMatchRange = async (
  app: WpsApplication,
  match: SearchMatchRange
): Promise<boolean> => {
  if (!app || !match) return false;
  await highlightByRange(app, match.pos, match.len);
  return true;
};

/**
 * @deprecated Prefer `navigateTopMatch` when you also need selection behavior. 如需包含选中行为，优先使用 `navigateTopMatch`。
 */
export const queryTopMatches = async (
  app: WpsApplication,
  keyword: string,
  precision: number = 90
): Promise<SearchMatchRange[]> => {
  if (!app) return [];
  const result = await searchAndLocateText(app, {
    targetText: keyword,
    precision,
    highlight: true,
    clearPreviousHighlight: true,
  });
  if (!result?.topMatches?.length) return [];
  return result.topMatches.map((item) => ({ pos: item.pos, len: item.len }));
};

export const getSelectionState = async (
  app: WpsApplication
): Promise<SelectionState> => {
  try {
    const selection = await app?.ActiveDocument?.ActiveWindow?.Selection;
    const start = await selection?.Start;
    const end = await selection?.End;
    const hasSelection =
      typeof start === "number" &&
      typeof end === "number" &&
      Math.abs(end - start) > 0;
    return {
      hasSelection,
      start: typeof start === "number" ? start : null,
      end: typeof end === "number" ? end : null,
    };
  } catch {
    return { hasSelection: false, start: null, end: null };
  }
};

export const resolveCurrentMatchIndex = (
  currentMatchIndex: number,
  latestMatchesLength: number
): number => {
  if (latestMatchesLength <= 0) return -1;
  if (currentMatchIndex < 0) return -1;
  return Math.min(currentMatchIndex, latestMatchesLength - 1);
};

/**
 * @deprecated Internal compatibility helper. Prefer `navigateTopMatch` for index resolution. 兼容辅助函数，优先使用 `navigateTopMatch`。
 */
export const computeNextMatchIndex = ({
  direction,
  currentMatchIndex,
  latestMatchesLength,
  previousMatchesLength,
  forceSelectFirst = false,
}: ComputeNextMatchIndexInput): number => {
  if (latestMatchesLength <= 0) return -1;

  if (forceSelectFirst) return 0;

  const resolvedIndex = resolveCurrentMatchIndex(
    currentMatchIndex,
    latestMatchesLength
  );
  if (resolvedIndex < 0) return 0;

  if (latestMatchesLength !== previousMatchesLength) {
    return resolvedIndex;
  }

  return direction === "next"
    ? (resolvedIndex + 1) % latestMatchesLength
    : (resolvedIndex - 1 + latestMatchesLength) % latestMatchesLength;
};

export const navigateTopMatch = async ({
  app,
  keyword,
  direction,
  currentMatchIndex,
  previousMatchesLength,
  precision = 80,
  forceSelectFirst = false,
}: NavigateTopMatchInput): Promise<NavigateTopMatchResult> => {
  const normalizedKeyword = keyword.trim();
  if (!app || !normalizedKeyword) {
    return { matches: [], nextIndex: 0, selected: false };
  }

  const latestMatches = await queryTopMatches(app, normalizedKeyword, precision);
  if (!latestMatches.length) {
    return { matches: [], nextIndex: 0, selected: false };
  }

  const nextIndex = computeNextMatchIndex({
    direction,
    currentMatchIndex,
    latestMatchesLength: latestMatches.length,
    previousMatchesLength,
    forceSelectFirst,
  });

  const selected = await selectMatchRange(app, latestMatches[nextIndex]);
  return { matches: latestMatches, nextIndex, selected };
};
