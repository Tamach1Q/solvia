import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, BookOpen, Building2, Check, CheckCircle2, ChevronDown, FileText, Image, Lightbulb, Loader2,
  MessageSquareText, Package, PhoneCall, RefreshCcw, Search, Sparkles, Truck, Users, X,
} from 'lucide-react'
import { captureMaterials } from './data/knowledgeData'
import { knowledgeService } from './services/knowledgeService'
import type { KnowledgeCard } from './types'

const dispatchTone: Record<KnowledgeCard['dispatch'], string> = { 現地対応: 'blue', 遠隔で解決: 'purple', 出動不要: 'green' }

export function KnowledgeCardView({ card, open, onToggle, highlight }: { card: KnowledgeCard; open: boolean; onToggle: () => void; highlight?: boolean }) {
  return <article className={`k-card ${open ? 'open' : ''} ${highlight ? 'highlight' : ''} ${card.isNew ? 'is-new' : ''}`} data-testid="knowledge-card">
    <button className="k-card-head" onClick={onToggle} aria-expanded={open}>
      <span className="k-id">{card.id}</span>
      <div>
        <div className="k-tags">{card.isNew && <b className="k-new">NEW</b>}<span>{card.equipmentType}</span><span>{card.event}</span><span className={`k-dispatch ${dispatchTone[card.dispatch]}`}>{card.dispatch}</span></div>
        <h3>{card.title}</h3>
        <p><Building2 />{card.base}・{card.author}<span>・</span>{card.sources.map(source => source.kind).filter((kind, index, all) => all.indexOf(kind) === index).join('＋')}<span>・</span>活用 {card.usedCount}回<span>・</span>{card.updatedAt}</p>
      </div>
      <ChevronDown className="k-chevron" />
    </button>
    {open && <div className="k-card-body">
      {card.newInsight && <div className="k-insight"><Lightbulb /><span><strong>この案件で増えた知見</strong>{card.newInsight}</span></div>}
      <dl className="k-facts"><div><dt>症状</dt><dd>{card.symptom}</dd></div><div><dt>原因</dt><dd>{card.cause}</dd></div><div><dt>処置</dt><dd>{card.action}</dd></div><div><dt>対象</dt><dd>{card.maker}・{card.modelClass}</dd></div></dl>
      <div className="k-steps"><h4>切り分け手順</h4><ol>{card.steps.map(step => <li key={step}>{step}</li>)}</ol></div>
      <div className="k-bottom">
        <div><h4>注意点</h4><ul>{card.cautions.map(caution => <li key={caution}>{caution}</li>)}</ul></div>
        <div><h4><Package />持参品</h4>{card.bring.length ? <ul>{card.bring.map(item => <li key={item}>{item}</li>)}</ul> : <p className="k-none">持参品なし</p>}</div>
        <div><h4><FileText />元の記録</h4><ul>{card.sources.map(source => <li key={source.kind + source.caseId}>{source.kind}<small>{source.caseId}</small></li>)}</ul></div>
      </div>
    </div>}
  </article>
}

export function KnowledgeDrawer({ cards, focusId, onClose, onOpenBase }: { cards: KnowledgeCard[]; focusId?: string; onClose: () => void; onOpenBase: () => void }) {
  const [openId, setOpenId] = useState<string | undefined>(focusId || cards[0]?.id)
  useEffect(() => { if (focusId) setOpenId(focusId) }, [focusId])
  const bases = new Set(cards.map(card => card.base)).size
  return <div className="k-drawer-backdrop" onClick={onClose}><aside className="k-drawer" onClick={event => event.stopPropagation()} role="dialog" aria-label="過去の類似事例" data-testid="knowledge-drawer">
    <header><div><span>KNOWLEDGE MATCH</span><h2>過去の類似事例</h2><p>同型PCS（メーカーA・50kW級）× 内部温度異常で照合</p></div><button onClick={onClose} aria-label="閉じる"><X /></button></header>
    <div className="k-drawer-summary"><div><strong>{cards.length}</strong><span>件ヒット</span></div><div><strong>{bases}</strong><span>拠点の知見</span></div><div><strong>{cards.reduce((sum, card) => sum + card.usedCount, 0)}</strong><span>回 活用済み</span></div></div>
    <p className="k-drawer-note"><Sparkles />過去の報告書・通話・CRMから抽出した事例です。担当者の経験によらず、同じ手順で切り分けられます。</p>
    <div className="k-drawer-list">{cards.map(card => <KnowledgeCardView key={card.id} card={card} open={openId === card.id} highlight={focusId === card.id} onToggle={() => setOpenId(openId === card.id ? undefined : card.id)} />)}</div>
    <footer><button className="text-button" onClick={onOpenBase}>ナレッジ一覧を開く<ArrowRight size={15} /></button></footer>
  </aside></div>
}

type CaptureState = 'idle' | 'extracting' | 'draft' | 'published'

export function KnowledgeCapture({ published, onPublish, onOpenBase }: { published: boolean; onPublish: (card: KnowledgeCard) => void; onOpenBase: () => void }) {
  const [state, setState] = useState<CaptureState>(published ? 'published' : 'idle')
  const [draft, setDraft] = useState<KnowledgeCard | null>(null)
  const [progress, setProgress] = useState(0)
  useEffect(() => { if (published) setState('published') }, [published])

  const extract = async () => {
    setState('extracting')
    setProgress(0)
    const timers = [500, 1100].map((delay, index) => window.setTimeout(() => setProgress(index + 1), delay))
    const card = await knowledgeService.extractFromCase(captureMaterials.report.caseId)
    timers.forEach(window.clearTimeout)
    setDraft(card)
    setState('draft')
  }
  const update = (patch: Partial<KnowledgeCard>) => setDraft(current => current ? { ...current, ...patch } : current)
  const updateStep = (index: number, value: string) => setDraft(current => current ? { ...current, steps: current.steps.map((step, stepIndex) => stepIndex === index ? value : step) } : current)

  return <section className="panel case-panel k-capture" data-testid="knowledge-capture">
    <div className="k-capture-head"><span><BookOpen /></span><div><h2>この案件をナレッジに残す</h2><p>通話とレポートから、AIが切り分け手順と判断を抽出します。担当者は確認するだけです。</p></div>{state === 'published' && <b className="k-published-pill"><CheckCircle2 />公開済み</b>}</div>

    {state === 'idle' && <>
      <div className="k-materials">
        <div className="k-material"><h4><FileText />駆けつけレポート</h4><small>{captureMaterials.report.author}</small><p>{captureMaterials.report.text}</p></div>
        <div className="k-material call"><h4><PhoneCall />ヘルプデスク通話<em>{captureMaterials.call.duration}</em></h4><small>{captureMaterials.call.at}・自動録音（文字起こし）</small><div className="k-transcript">{captureMaterials.call.lines.map((line, index) => <p key={index}><b>{line.who}</b>{line.text}</p>)}</div></div>
        <div className="k-material"><h4><Image />現場写真</h4><small>現場用URLから自動で取り込み</small><div className="k-photo-grid">{captureMaterials.photos.map(photo => <span key={photo}><Image />{photo}</span>)}</div></div>
      </div>
      <button className="primary-button k-extract" onClick={extract} data-testid="extract-knowledge"><Sparkles />AIで要点を抽出</button>
    </>}

    {state === 'extracting' && <div className="k-extracting">{['通話（3:12）とレポートを読み込み', '切り分け手順・原因・判断を抽出', '既存ナレッジと照合（K-101・K-104と関連）'].map((label, index) => <div key={label} className={progress > index ? 'done' : progress === index ? 'active' : ''}>{progress > index ? <Check /> : progress === index ? <Loader2 className="spin" /> : <i />}<span>{label}</span></div>)}</div>}

    {state === 'draft' && draft && <div className="k-draft" data-testid="knowledge-draft">
      <div className="k-insight"><Lightbulb /><span><strong>この案件で増えた知見</strong>{draft.newInsight}</span></div>
      <label className="k-field wide"><span>タイトル</span><input value={draft.title} onChange={event => update({ title: event.target.value })} /></label>
      <div className="k-field-grid">
        <label className="k-field"><span>症状</span><textarea rows={2} value={draft.symptom} onChange={event => update({ symptom: event.target.value })} /></label>
        <label className="k-field"><span>原因</span><textarea rows={2} value={draft.cause} onChange={event => update({ cause: event.target.value })} /></label>
      </div>
      <div className="k-field wide"><span>切り分け手順（通話から抽出）</span><ol className="k-step-edit">{draft.steps.map((step, index) => <li key={index}><i>{index + 1}</i><input value={step} onChange={event => updateStep(index, event.target.value)} /></li>)}</ol></div>
      <div className="k-field-grid">
        <label className="k-field"><span>処置</span><input value={draft.action} onChange={event => update({ action: event.target.value })} /></label>
        <label className="k-field"><span>注意点</span><input value={draft.cautions[0]} onChange={event => update({ cautions: [event.target.value] })} /></label>
      </div>
      <div className="k-draft-meta"><span><Users />提供：{draft.base}・{draft.author}</span><span><Truck />持参品：{draft.bring.join('・')}</span><span><MessageSquareText />元の記録：通話＋レポート（{draft.sources[0].caseId}）</span></div>
      <div className="k-draft-actions"><span>入力はゼロ。内容を確認して、必要なら直してから公開します。</span><button className="success-button" onClick={() => { onPublish(draft); setState('published') }} data-testid="publish-knowledge"><CheckCircle2 />確認して公開</button></div>
    </div>}

    {state === 'published' && <div className="k-done"><CheckCircle2 /><div><strong>ナレッジ K-301 として公開しました</strong><span>次に同型PCSで内部温度異常が起きたとき、全拠点の担当者の切り分け手順に表示されます。</span></div><button className="secondary-action" onClick={onOpenBase} data-testid="open-knowledge-from-case">ナレッジ一覧で見る<ArrowRight size={15} /></button></div>}
  </section>
}

export function KnowledgeBase({ cards, onReset }: { cards: KnowledgeCard[]; onReset: () => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [openId, setOpenId] = useState<string | undefined>(() => cards.find(card => card.isNew)?.id)
  const tree = useMemo(() => {
    const types = [...new Set(cards.map(card => card.equipmentType))]
    return types.map(type => ({ type, count: cards.filter(card => card.equipmentType === type).length, events: [...new Set(cards.filter(card => card.equipmentType === type).map(card => card.event))].map(event => ({ event, count: cards.filter(card => card.event === event).length })) }))
  }, [cards])
  const filtered = cards.filter(card => {
    const inCategory = category === 'all' || card.equipmentType === category || card.event === category
    const text = `${card.title}${card.symptom}${card.cause}${card.action}${card.steps.join('')}${card.base}`
    return inCategory && (!query || text.includes(query))
  })
  const newCount = cards.filter(card => card.isNew).length
  return <div className="page knowledge-page" data-testid="knowledge-page">
    <div className="page-heading"><div><p className="eyebrow">KNOWLEDGE BASE</p><h1>ナレッジ</h1><p>駆けつけの通話・レポート・点検報告書から、切り分け手順と判断を蓄積します。</p></div><button className="secondary-action" onClick={onReset} data-testid="reset-demo"><RefreshCcw size={15} />デモをリセット</button></div>
    <section className="ops-flow k-flow"><div><BookOpen /><span><strong>経験を、次の駆けつけの手順に</strong>書く手間を増やさずにノウハウが溜まる</span></div>{['通話・レポート', 'AIが要点を抽出', '担当者が確認・公開', '次の駆けつけで自動提示'].map((step, index) => <span key={step}><i>{index + 1}</i>{step}{index < 3 && <ArrowRight size={13} />}</span>)}</section>
    <div className="k-kpis"><div><small>登録ナレッジ</small><strong>{cards.length}<em>件</em></strong>{newCount > 0 && <b>+{newCount} 今日</b>}</div><div><small>累計の活用回数</small><strong>{cards.reduce((sum, card) => sum + card.usedCount, 0)}<em>回</em></strong></div><div><small>知見を提供した拠点</small><strong>{new Set(cards.map(card => card.base)).size}<em>拠点</em></strong></div><div><small>出動不要・遠隔で解決</small><strong>{cards.filter(card => card.dispatch !== '現地対応').length}<em>件</em></strong></div></div>
    <div className="k-layout">
      <nav className="panel k-tree"><h3>設備・事象で探す</h3><button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>すべて<b>{cards.length}</b></button>{tree.map(node => <div key={node.type}><button className={category === node.type ? 'active type' : 'type'} onClick={() => setCategory(node.type)}>{node.type}<b>{node.count}</b></button>{node.events.map(event => <button key={event.event} className={category === event.event ? 'active event' : 'event'} onClick={() => setCategory(event.event)}>{event.event}<b>{event.count}</b></button>)}</div>)}<p>メーカー名は伏せて表示しています（デモ）</p></nav>
      <section className="k-results"><label className="k-search"><Search /><input placeholder="症状・原因・手順で検索（例：ファン、地絡、出動不要）" value={query} onChange={event => setQuery(event.target.value)} /></label><p className="k-result-count">{filtered.length}件</p>{filtered.map(card => <KnowledgeCardView key={card.id} card={card} open={openId === card.id} onToggle={() => setOpenId(openId === card.id ? undefined : card.id)} />)}{!filtered.length && <div className="panel k-empty">該当するナレッジがありません</div>}</section>
    </div>
  </div>
}
