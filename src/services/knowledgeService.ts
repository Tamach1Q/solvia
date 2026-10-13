import { extractedDraft, knowledgeCards } from '../data/knowledgeData'
import type { InspectionItem, KnowledgeCard } from '../types'

// MOCK ADAPTER: 実運用では現場入力・通話の文字起こし・駆けつけレポートを入力に、AIで要点を抽出する想定。
// デモでは固定の下書きに現場入力を差し込み、追加したカードはこのブラウザにだけ保存する。
const storageKey = 'solvia_knowledge_published'

const readAdded = (): KnowledgeCard[] => {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) as KnowledgeCard[] : []
  } catch { return [] }
}
const writeAdded = (cards: KnowledgeCard[]) => {
  try { localStorage.setItem(storageKey, JSON.stringify(cards)) } catch { /* デモ：保存できなくても画面上は反映 */ }
}
const withBase = (added: KnowledgeCard[]) => [...added, ...structuredClone(knowledgeCards)]

export const isPublished = (card: KnowledgeCard) => card.status !== '確認待ち'

export const knowledgeService = {
  list(): KnowledgeCard[] {
    return withBase(readAdded())
  },
  match(cards: KnowledgeCard[], query: { equipmentType: string; event: string }) {
    return cards.filter(card => isPublished(card) && card.equipmentType === query.equipmentType && card.event === query.event)
  },
  // 現場入力（＋通話・レポート）から下書きを作る。現場入力がなければ通話・レポートのみ。
  async draftFromCase(field: { items: InspectionItem[]; measurements: Record<string, string>; photos: number } | null): Promise<KnowledgeCard> {
    await new Promise(resolve => setTimeout(resolve, 1800))
    const draft = structuredClone(extractedDraft)
    draft.status = '確認待ち'
    if (!field) {
      draft.sources = [{ kind: 'ヘルプデスク通話', caseId: draft.sources[0].caseId }, { kind: '駆けつけレポート', caseId: draft.sources[0].caseId }]
      return draft
    }
    // 現場で入力された項目は現場の記録で、未入力の項目は通話・レポートから抽出した内容で手順を組み立てる
    const fieldLine = (id: string, fallback: string) => {
      const item = field.items.find(entry => entry.inspectionItemId === id)
      if (!item) return fallback
      const measured = item.requiredMeasurement && field.measurements[id] ? `${field.measurements[id]}${item.requiredMeasurement.unit}` : ''
      const parts = [item.result, item.comment, measured].filter(Boolean)
      return parts.length ? `${item.title}：${parts.join('・')}` : fallback
    }
    const [monitor, restart, intake, fan, replace, recovery] = draft.steps
    draft.steps = [monitor, restart, fieldLine('PROC-01', 'PCS表示と実温度を比較（差なし）'), fieldLine('PROC-02', intake), fieldLine('PROC-03', fan), replace, fieldLine('PROC-04', recovery)]
    draft.fieldSummary = {
      items: field.items.length,
      answered: field.items.filter(item => item.result || item.comment).length,
      abnormal: field.items.filter(item => item.result === '異常').length,
      photos: field.photos,
    }
    draft.sources = [{ kind: '現場入力（iPad）', caseId: draft.sources[0].caseId }, ...draft.sources]
    return draft
  },
  addPending(card: KnowledgeCard): KnowledgeCard[] {
    const added = [{ ...card, status: '確認待ち' as const, isNew: true }, ...readAdded().filter(entry => entry.id !== card.id)]
    writeAdded(added)
    return withBase(added)
  },
  approve(card: KnowledgeCard): KnowledgeCard[] {
    const added = [{ ...card, status: '公開' as const, isNew: true }, ...readAdded().filter(entry => entry.id !== card.id)]
    writeAdded(added)
    return withBase(added)
  },
  reset(): KnowledgeCard[] {
    try { localStorage.removeItem(storageKey) } catch { /* noop */ }
    return structuredClone(knowledgeCards)
  },
}

// 原因の内訳（照合したナレッジの件数から算出）
export function causeBreakdown(cards: KnowledgeCard[]) {
  const groups = new Map<string, KnowledgeCard[]>()
  cards.forEach(card => groups.set(card.causeGroup, [...(groups.get(card.causeGroup) || []), card]))
  return [...groups.entries()]
    .map(([label, entries]) => ({ label, count: entries.length, percent: Math.round(entries.length / cards.length * 100), ids: entries.map(entry => entry.id) }))
    .sort((a, b) => b.count - a.count)
}
