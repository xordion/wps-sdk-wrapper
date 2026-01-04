import { Wps } from '@/interface';
import { highlightByRange } from './highlight';
import type { RevisionInfo } from './common';
import { delay, getLatestRevisionDate, getRevisionByDate } from './common';

// 重新导出 common 中的内容，保持向后兼容
export type { RevisionInfo } from './common';
export { delay, getLatestRevisionDate, getRevisionByDate, collectRevisionInfos } from './common';

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


export const toggleRevisionHandler = async (app: Wps, isShow: boolean) => {
  // 获取修订对象
  const revisions = await app.ActiveDocument.Revisions

  // 隐藏接受/拒绝修订的按钮
  await revisions.SwitchRevisionBtn(isShow)
}