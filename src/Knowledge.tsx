import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, Clock3, Lightbulb, Loader2,
  MapPin, PhoneCall, RefreshCcw, Search, Smartphone, X,
} from 'lucide-react'
import { captureMaterials } from './data/knowledgeData'
import { isPublished } from './services/knowledgeService'
import type { KnowledgeCard } from './types'

const dispatchTone: Record<KnowledgeCard['dispatch'], string> = { 現地対応: 'blue', 遠隔で解決: 'purple', 出動不要: 'green' }
const sourceText = (card: KnowledgeCard) => card.sources.map(source => source.kind).filter((kind, index, all) => all.indexOf(kind) === index).join('・')

function StatusBadge({ card }: { card: KnowledgeCard }) {
  if (card.status === '確認待ち') return <b className="k-pending"><Clock3 />確認待ち</b>
  if (card.isNew) return <b className="k-new">NEW</b>
  return null
}

export function KnowledgeCardView({ card, open, onToggle, highlight }: { card: KnowledgeCard; open: boolean; onToggle: () => void; highlight?: boolean }) {
  return <article className={`k-card ${open ? 'open' : ''} ${highlight ? 'highlight' : ''} ${card.isNew ? 'is-new' : ''}`} data-testid="knowledge-card">
    <button className="k-card-head" onClick={onToggle} aria-expanded={open}>
      <div>
        <h3><StatusBadge card={card} />{card.title}</h3>
        <p className="k-plant"><MapPin />{card.plant}　{card.equipmentLabel}<span className={`k-dispatch ${dispatchTone[card.dispatch]}`}>{card.dispatch}</span></p>
      </div>
      <span className="k-toggle">{open ? '閉じる' : '詳しく見る'}<ChevronDown className="k-chevron" /></span>
    </button>
    {open && <div className="k-card-body">
      {card.newInsight && <div className="k-insight"><Lightbulb /><span><strong>この案件で分かったこと</strong>{card.newInsight}</span></div>}
      <dl className="k-facts"><div><dt>症状</dt><dd>{card.symptom}</dd></div><div><dt>原因</dt><dd>{card.cause}</dd></div><div><dt>処置</dt><dd>{card.action}</dd></div><div><dt>持っていくもの</dt><dd>{card.bring.length ? card.bring.join('、') : 'なし'}</dd></div></dl>
      <div className="k-steps"><h4>切り分け手順</h4><ol>{card.steps.map(step => <li key={step}>{step}</li>)}</ol></div>
      {card.cautions.length > 0 && <div className="k-caution"><h4>注意点</h4><ul>{card.cautions.map(caution => <li key={caution}>{caution}</li>)}</ul></div>}
      <p className="k-meta">{card.event}　／　{card.base}・{card.author}　／　元の記録：{sourceText(card)}　／　活用 {card.usedCount}回　／　{card.updatedAt}</p>
    </div>}
  </article>
}

export function KnowledgeDrawer({ cards, focusId, onClose, onOpenBase }: { cards: KnowledgeCard[]; focusId?: string; onClose: () => void; onOpenBase: () => void }) {
  const [openId, setOpenId] = useState<string | undefined>(focusId || cards[0]?.id)
  useEffect(() => { if (focusId) setOpenId(focusId) }, [focusId])
  return <div className="k-drawer-backdrop" onClick={onClose}><aside className="k-drawer" onClick={event => event.stopPropagation()} role="dialog" aria-label="過去の類似事例" data-testid="knowledge-drawer">
    <header><div><h2>過去の類似事例</h2><p>同じ型のPCS・同じ異常の事例 {cards.length}件</p></div><button onClick={onClose} aria-label="閉じる"><X /></button></header>
    <div className="k-drawer-list">{cards.map(card => <KnowledgeCardView key={card.id} card={card} open={openId === card.id} highlight={focusId === card.id} onToggle={() => setOpenId(openId === card.id ? undefined : card.id)} />)}</div>
    <footer><button className="secondary-action" onClick={onOpenBase}>ナレッジ一覧を開く<ArrowRight size={18} /></button></footer>
  </aside></div>
}

const extractSteps = ['現場の入力と通話記録を読み込んでいます', '手順・原因・判断を抜き出しています', '過去の事例と照らし合わせています']

export function KnowledgeCaseStatus({ state, card, onOpen }: { state: 'extracting' | 'pending' | 'published'; card?: KnowledgeCard; onOpen: (id?: string) => void }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (state !== 'extracting') return
    setProgress(0)
    const timers = [500, 1100].map((delay, index) => window.setTimeout(() => setProgress(index + 1), delay))
    return () => timers.forEach(window.clearTimeout)
  }, [state])
  return <section className="panel case-panel k-capture" data-testid="knowledge-capture">
    <div className="k-capture-head"><BookOpen /><div><h2>この案件のナレッジ</h2><p>作業が完了すると、AIが下書きを作って自動で登録します。</p></div></div>
    {state === 'extracting' && <div className="k-extracting">{extractSteps.map((label, index) => <div key={label} className={progress > index ? 'done' : progress === index ? 'active' : ''}>{progress > index ? <Check /> : progress === index ? <Loader2 className="spin" /> : <i />}<span>{label}</span></div>)}</div>}
    {state !== 'extracting' && card && <div className={state === 'published' ? 'k-done' : 'k-done pending'} data-testid="knowledge-case-result">{state === 'published' ? <CheckCircle2 /> : <Clock3 />}<div><strong>{state === 'published' ? '全拠点に公開しました' : '確認待ちとして登録しました'}</strong><span>「{card.title}」</span><small>{state === 'published' ? '次に同じ異常が起きたとき、担当者の手順に表示されます。' : 'ナレッジ画面で内容を確認し、承認すると公開されます。'}</small></div><button className={state === 'published' ? 'secondary-action' : 'primary-button'} onClick={() => onOpen(card.id)} data-testid="open-knowledge-from-case">{state === 'published' ? 'ナレッジで見る' : '確認・承認する'}<ArrowRight size={18} /></button></div>}
  </section>
}

function KnowledgeReview({ card, onApprove }: { card: KnowledgeCard; onApprove: (card: KnowledgeCard) => void }) {
  const [draft, setDraft] = useState(card)
  const [showCall, setShowCall] = useState(false)
  const update = (patch: Partial<KnowledgeCard>) => setDraft(current => ({ ...current, ...patch }))
  const updateStep = (index: number, value: string) => setDraft(current => ({ ...current, steps: current.steps.map((step, stepIndex) => stepIndex === index ? value : step) }))
  return <article className="panel k-review" data-testid="knowledge-draft">
    <div className="k-review-head"><div><b className="k-pending"><Clock3 />確認待ち</b><h3>{draft.plant}　{draft.equipmentLabel}</h3><p>{draft.updatedAt}　{draft.base}・{draft.author}　AIが作成した下書き</p></div><button className="success-button" onClick={() => onApprove(draft)} data-testid="publish-knowledge"><CheckCircle2 />承認して公開</button></div>
    <div className="k-source-row">{draft.fieldSummary && <span><Smartphone />現場の入力：{draft.fieldSummary.answered}/{draft.fieldSummary.items}項目</span>}<button onClick={() => setShowCall(!showCall)}><PhoneCall />ヘルプデスク通話（{captureMaterials.call.duration}）を{showCall ? '閉じる' : '読む'}</button></div>
    {showCall && <div className="k-transcript">{captureMaterials.call.lines.map((line, index) => <p key={index}><b>{line.who}</b>{line.text}</p>)}</div>}
    <div className="k-draft">
      <div className="k-insight"><Lightbulb /><span><strong>この案件で分かったこと</strong>{draft.newInsight}</span></div>
      <label className="k-field"><span>タイトル</span><input value={draft.title} onChange={event => update({ title: event.target.value })} /></label>
      <div className="k-field-grid">
        <label className="k-field"><span>症状</span><textarea rows={2} value={draft.symptom} onChange={event => update({ symptom: event.target.value })} /></label>
        <label className="k-field"><span>原因</span><textarea rows={2} value={draft.cause} onChange={event => update({ cause: event.target.value })} /></label>
      </div>
      <div className="k-field"><span>切り分け手順</span><ol className="k-step-edit">{draft.steps.map((step, index) => <li key={index}><i>{index + 1}</i><input value={step} onChange={event => updateStep(index, event.target.value)} aria-label={`手順${index + 1}`} /></li>)}</ol></div>
      <div className="k-field-grid">
        <label className="k-field"><span>処置</span><input value={draft.action} onChange={event => update({ action: event.target.value })} /></label>
        <label className="k-field"><span>注意点</span><input value={draft.cautions[0]} onChange={event => update({ cautions: [event.target.value] })} /></label>
      </div>
    </div>
  </article>
}

export function RecentKnowledge({ cards, onOpen }: { cards: KnowledgeCard[]; onOpen: (id?: string) => void }) {
  const recent = [...cards.filter(card => card.isNew), ...cards.filter(card => !card.isNew).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))].slice(0, 3)
  const added = cards.filter(card => card.isNew).length
  return <section className="panel k-recent" data-testid="recent-knowledge">
    <div className="ops-section-head"><div><h2><BookOpen />最近増えたナレッジ</h2><p>作業が完了すると、自動でここに追加されます</p></div><div className="k-recent-stats">{added > 0 && <b className="k-plus" data-testid="knowledge-plus">今日 +{added}件</b>}<button className="text-button" onClick={() => onOpen()}>すべて見る<ArrowRight size={18} /></button></div></div>
    <div className="k-recent-list">{recent.map(card => <button key={card.id} className={card.isNew ? 'is-fresh' : ''} onClick={() => onOpen(card.id)} data-testid={card.isNew ? 'recent-knowledge-new' : undefined}>
      <div><strong><StatusBadge card={card} />{card.title}</strong><small><MapPin />{card.plant}　{card.equipmentLabel}　／　{card.updatedAt}</small></div>
      <ArrowRight />
    </button>)}</div>
  </section>
}

export function KnowledgeBase({ cards, focusId, onApprove, onReset }: { cards: KnowledgeCard[]; focusId?: string; onApprove: (card: KnowledgeCard) => void; onReset: () => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [openId, setOpenId] = useState<string | undefined>(() => focusId || cards.find(card => card.isNew && isPublished(card))?.id)
  const pending = cards.filter(card => card.status === '確認待ち')
  const published = cards.filter(isPublished)
  const tree = useMemo(() => {
    const types = [...new Set(published.map(card => card.equipmentType))]
    return types.map(type => ({ type, count: published.filter(card => card.equipmentType === type).length }))
  }, [published])
  const plants = useMemo(() => [...new Set(published.map(card => card.plant))].map(plant => ({ plant, count: published.filter(card => card.plant === plant).length })).sort((a, b) => b.count - a.count), [published])
  const filtered = published.filter(card => {
    const inCategory = category === 'all' || card.equipmentType === category || card.plant === category
    const text = `${card.title}${card.symptom}${card.cause}${card.action}${card.steps.join('')}${card.base}${card.plant}${card.equipmentLabel}${card.event}`
    return inCategory && (!query || text.includes(query))
  })
  const newCount = published.filter(card => card.isNew).length
  return <div className="page knowledge-page" data-testid="knowledge-page">
    <div className="page-heading"><div><h1>ナレッジ</h1><p>現場の対応から、切り分け手順と判断を集めています。承認したものは全拠点の担当者に届きます。</p></div><button className="text-button k-reset" onClick={onReset} data-testid="reset-demo"><RefreshCcw size={16} />デモをリセット</button></div>
    <div className="k-kpis"><div><small>公開中</small><strong>{published.length}<em>件</em></strong>{newCount > 0 && <b>今日 +{newCount}</b>}</div><div className={pending.length ? 'attention' : ''}><small>確認待ち</small><strong>{pending.length}<em>件</em></strong></div><div><small>これまでに使われた回数</small><strong>{published.reduce((sum, card) => sum + card.usedCount, 0)}<em>回</em></strong></div></div>
    {pending.length > 0 && <section className="k-pending-section" data-testid="pending-section"><h2>確認待ち（{pending.length}件）</h2><p>作業完了時にAIが作った下書きです。内容を確認して、承認してください。</p>{pending.map(card => <KnowledgeReview key={card.id} card={card} onApprove={onApprove} />)}</section>}
    <div className="k-layout">
      <nav className="panel k-tree" aria-label="絞り込み"><h3>設備で絞り込む</h3><button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>すべて<b>{published.length}</b></button>{tree.map(node => <button key={node.type} className={category === node.type ? 'active' : ''} onClick={() => setCategory(node.type)}>{node.type}<b>{node.count}</b></button>)}<h3 className="k-tree-sub">発電所で絞り込む</h3>{plants.map(entry => <button key={entry.plant} className={category === entry.plant ? 'active' : ''} onClick={() => setCategory(entry.plant)}>{entry.plant}<b>{entry.count}</b></button>)}</nav>
      <section className="k-results"><label className="k-search"><Search /><input placeholder="発電所名・症状・原因で探す（例：青森、ファン）" value={query} onChange={event => setQuery(event.target.value)} aria-label="ナレッジを検索" /></label><p className="k-result-count">{filtered.length}件</p>{filtered.map(card => <KnowledgeCardView key={card.id} card={card} open={openId === card.id} onToggle={() => setOpenId(openId === card.id ? undefined : card.id)} />)}{!filtered.length && <div className="panel k-empty">該当するナレッジがありません</div>}</section>
    </div>
  </div>
}
