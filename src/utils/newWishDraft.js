const DRAFT_KEY = 'heartbeat_list_new_wish_draft';

export function getNewWishDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('[newWishDraft] 读取草稿失败:', e);
    return {};
  }
}

export function saveNewWishDraft(partialDraft) {
  try {
    const nextDraft = {
      ...getNewWishDraft(),
      ...partialDraft,
      updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(nextDraft));
    return true;
  } catch (e) {
    console.error('[newWishDraft] 保存草稿失败:', e);
    return false;
  }
}

export function clearNewWishDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    console.error('[newWishDraft] 清除草稿失败:', e);
  }
}
