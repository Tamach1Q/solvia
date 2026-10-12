import { extractedDraft, knowledgeCards } from '../data/knowledgeData'
import type { KnowledgeCard } from '../types'

// MOCK ADAPTER: 実運用では通話の文字起こし・駆けつけレポート・報告書/CRMを入力に、AIで要点を抽出する想定。
// デモでは固定の下書きを返し、公開したカードはこのブラウザにだけ保存する。
const storageKey = 'solvia_knowledge_published'

const readPublished = (): KnowledgeCard[] => {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) as KnowledgeCard[] : []
  } catch { return [] }
}

export const knowledgeService = {
  list(): KnowledgeCard[] {
    return [...readPublished(), ...structuredClone(knowledgeCards)]
  },
  match(cards: KnowledgeCard[], query: { equipmentType: string; event: string }) {
    return cards.filter(card => card.equipmentType === query.equipmentType && card.event === query.event)
  },
  async extractFromCase(_caseId: string): Promise<KnowledgeCard> {
    await new Promise(resolve => setTimeout(resolve, 1800))
    return structuredClone(extractedDraft)
  },
  publish(card: KnowledgeCard): KnowledgeCard[] {
    const published = [{ ...card, isNew: true }, ...readPublished().filter(entry => entry.id !== card.id)]
    try { localStorage.setItem(storageKey, JSON.stringify(published)) } catch { /* デモ：保存できなくても画面上は反映 */ }
    return [...published, ...structuredClone(knowledgeCards)]
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
