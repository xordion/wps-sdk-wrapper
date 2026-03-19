import { Wps } from '@/interface';

interface RevisionInfo {
  index: number;
  text: string;
  date: string;
  revision: any;
  start: number;
}

export type { RevisionInfo };

export const delay = (ms: number): Promise<void> =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

export const getRevisionCount = async (app: Wps): Promise<number> => {
  try {
    const revisions = await app?.ActiveDocument?.Revisions;
    const count = await revisions?.Count;
    return typeof count === 'number' ? count : 0;
  } catch {
    return 0;
  }
};

/** 获取索引大于 startIndex 的修订（用于撤销「本次替换」产生的全部修订：删除+新增） */
export const getRevisionsAfterIndex = async (
  app: Wps,
  startIndex: number
): Promise<RevisionInfo[]> => {
  try {
    const revisions = await app?.ActiveDocument?.Revisions;
    const revisionInfos = await collectRevisionInfos(revisions);
    return revisionInfos
      .filter((info) => info.index > startIndex)
      .sort((a, b) => b.index - a.index);
  } catch {
    return [];
  }
};

export const getLatestRevisionDate = async (app: Wps): Promise<string> => {
  try {
    const revisions = await app?.ActiveDocument?.Revisions;
    const count = await revisions?.Count;
    if (count > 0) {
      let latestDate: string | null = null;
      for (let i = 1; i <= count; i++) {
        const revision = await revisions?.Item(i);
        const currentDate = await revision.Date;
        if (!latestDate || currentDate > latestDate) {
          latestDate = currentDate;
        }
      }
      return latestDate || '';
    }
  } catch (error) {
    console.error('获取修订日期失败:', error);
  }
  return '';
};

export const collectRevisionInfos = async (revisions: any) => {
  const count = await revisions?.Count;
  const revisionInfos: RevisionInfo[] = [];
  for (let i = 1; i <= count; i++) {
    const revision = await revisions?.Item(i);
    const range = await revision.Range;
    const start = await range.Start;
    const text = await range.Text;
    const date = await revision.Date;
    revisionInfos.push({ index: i, text, date, revision, start });
  }
  return revisionInfos;
};

/**
 * @deprecated Use `handleRevisionContent` / `cancelRevisions` for revision workflows. 修订流程请优先使用 `handleRevisionContent` / `cancelRevisions`。
 */
export const getRevisionByDate = async (app: Wps, date?: string) => {
  if (!date) {
    console.warn('没有日期，无法获取修订信息');
    return [];
  }
  const revisions = await app?.ActiveDocument?.Revisions;
  const revisionInfos = await collectRevisionInfos(revisions);
  const currentRevisions = revisionInfos
    .filter(info => info.date === date)
    .sort((a, b) => b.index - a.index);
  return currentRevisions;
};

export const coloringTextByRange = async (app: any, {start, end}: {start: number, end: number}, color: string = '#0000ff') => {
  const range = await app?.ActiveDocument?.Range(start, end);
  range.Font.Color = color;
};

export const setInputColor = async (app: any, color: string) => {
  app.ActiveDocument.Selection.Font.Color = color;
};
