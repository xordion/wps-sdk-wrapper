import { Wps } from '@/interface';
import { highlightByRange } from './highlight';
import type { RevisionInfo } from './common';
import {
  delay,
  getLatestRevisionDate,
  getRevisionByDate,
  getRevisionsAfterIndex,
} from './common';

// 重新导出 common 中的内容，保持向后兼容
export type { RevisionInfo } from './common';
export {
  delay,
  getLatestRevisionDate,
  getRevisionByDate,
  getRevisionsAfterIndex,
  collectRevisionInfos,
} from './common';

/**
 * @deprecated Use `cancelRevisions` or `handleRevisionContent` for business-level revision operations. 业务侧请优先使用 `cancelRevisions` 或 `handleRevisionContent`。
 */
export const handleMatchingRevisions = async (revisions: RevisionInfo[], type?: 'reject' | 'accept') => {
  for (const info of revisions) {
    try {
      if (type === 'reject') {
        await info.revision.Reject();
      } else {
        await info.revision.Accept();
      }
      await delay(300);
    } catch (rejectError) {
      console.error('拒绝修订失败:', info.index, rejectError);
    }
  }
};

export const handleRevisionContent = async (
  app: Wps,
  date: string,
  isReject = false,
) => {
  try {
    const revisionsToReject = await getRevisionByDate(app, date);
    if (isReject) {
      await handleMatchingRevisions(revisionsToReject, 'reject');
    } else {
      const textFilter = revisionsToReject.filter(item =>
        item.text.trim(),
      )?.[0];
      if (!textFilter) {
        console.warn('匹配原文失败，请手动定位修订');
        return;
      }
      highlightByRange(app, textFilter.start, textFilter.text.length);
    }
  } catch (error) {
    console.error('处理修订时出错:', error);
  }
};

/**
 * 操作后比对修订列表，收集本次新增修订的 date 数组。
 * 取消时只撤销这些 date，不受后续用户编辑影响。
 */
export const collectNewRevisionDatesAfter = async (
  app: Wps,
  countBefore: number
): Promise<string[]> => {
  const newRevisions = await getRevisionsAfterIndex(app, countBefore);
  return [...new Set(newRevisions.map((r) => r.date).filter(Boolean))];
};

/**
 * 取消修订：按 dates 撤销匹配的修订。未传日期则不执行。
 */
export const cancelRevisions = async (
  app: Wps,
  dates: string[]
): Promise<boolean> => {
  if (!dates.length) return false;
  const allRevisions = (
    await Promise.all(dates.map((date) => getRevisionByDate(app, date)))
  ).flat();
  const uniqueByIndex = [...new Map(allRevisions.map((r) => [r.index, r])).values()].sort(
    (a, b) => b.index - a.index
  );
  if (!uniqueByIndex.length) return false;
  await handleMatchingRevisions(uniqueByIndex, 'reject');
  return true;
};


export const toggleRevisionHandler = async (app: Wps, isShow: boolean) => {
  // 获取修订对象
  const revisions = await app.ActiveDocument.Revisions

  // 隐藏接受/拒绝修订的按钮
  await revisions.SwitchRevisionBtn(isShow)
}