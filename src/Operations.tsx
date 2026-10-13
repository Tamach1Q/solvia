import { useMemo, useState } from 'react'
import {
  Activity, BookOpen, Send, AlertCircle, AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronRight, ClipboardCheck,
  ExternalLink, History, MapPin, Monitor, PencilLine, RefreshCcw, ShieldCheck, Sparkles, Sun,
  Wrench, X, Zap,
} from 'lucide-react'
import { extractedDraft, fieldProcedure, incidentQuery, remoteSteps } from './data/knowledgeData'
import { KnowledgeCaseStatus, KnowledgeDrawer, RecentKnowledge } from './Knowledge'
import { causeBreakdown, isPublished, knowledgeService } from './services/knowledgeService'
import type { KnowledgeCard } from './types'

const plants = [
  { name: '青森大間発電所', area: '青森県下北郡', system: 'FusionSolar', output: '0 / 1,240 kW', alert: 'PCS-03停止', status: '要対応', tone: 'red' },
  { name: '熊本芦北発電所', area: '熊本県葦北郡', system: 'SMA Sunny Portal', output: '812 / 980 kW', alert: '日射比 低下', status: '要確認', tone: 'amber' },
  { name: '徳島川島山田発電所', area: '徳島県吉野川市', system: 'SolarEdge', output: '1,428 / 1,500 kW', alert: '—', status: '正常', tone: 'green' },
  { name: '香川三豊発電所', area: '香川県三豊市', system: 'FusionSolar', output: '650 / 920 kW', alert: '接続箱 CB交換', status: '修繕中', tone: 'blue' },
  { name: '千葉いすみ発電所', area: '千葉県いすみ市', system: 'SmartLogger', output: '1,020 / 1,180 kW', alert: 'ストリング出力低下', status: '要対応', tone: 'red' },
]

export function MonitoringDashboard({ phase, knowledge, onIncident, onOpenKnowledge }: { phase: number; knowledge: KnowledgeCard[]; onIncident: () => void; onOpenKnowledge: (id?: string) => void }) {
  return <div className="page operations-page" data-testid="monitoring-dashboard"><div className="page-heading"><div><p className="eyebrow">PORTFOLIO MONITORING</p><h1>統合監視</h1><p>複数の監視システムを横断し、異常後の対応業務までつなぎます。</p></div><span className="sync-time"><RefreshCcw />最終同期 10:42</span></div>
    <div className="ops-kpis"><OpsKpi label="要対応" value={phase >= 6 ? '2' : '3'} icon={<AlertTriangle />} tone="red" /><OpsKpi label="要確認" value="2" icon={<AlertCircle />} tone="amber" /><OpsKpi label="修繕対応中" value={phase >= 2 && phase < 6 ? '2' : '1'} icon={<Wrench />} tone="blue" /><OpsKpi label="正常稼働" value="12 / 18" icon={<Activity />} tone="green" /></div>
    
    <RecentKnowledge cards={knowledge} onOpen={onOpenKnowledge} />
    <section className="panel ops-table"><div className="ops-section-head"><div><h2>発電所一覧</h2><p>18発電所・4監視システムを横断</p></div><span className="mock-label">監視データ：モック</span></div><table><thead><tr><th>発電所</th><th>監視システム</th><th>状態</th><th>現在出力 / 容量</th><th>最新アラーム</th><th>連携</th></tr></thead><tbody>{plants.map((plant, index) => <tr key={plant.name} className={index === 0 ? 'priority-row' : ''} onClick={index === 0 ? onIncident : undefined} data-testid={index === 0 ? 'monitoring-incident-row' : undefined}><td><div className="ops-plant"><span><Sun /></span><div><strong>{plant.name}</strong><small><MapPin />{plant.area}</small></div></div></td><td><span className="system-badge"><i />{plant.system}</span></td><td><span className={`ops-status ${plant.tone}`}><i />{index === 0 && phase >= 6 ? '正常' : plant.status}</span></td><td><strong>{index === 0 && phase >= 6 ? '1,118 / 1,240 kW' : plant.output}</strong></td><td><span className={plant.tone === 'red' ? 'red-text' : ''}>{index === 0 && phase >= 6 ? 'PCS-03 復旧済み' : plant.alert}</span><small className="updated">更新 {index + 1}分前</small></td><td><div className="ops-links"><a href="https://jp5.fusionsolar.huawei.com/pvmswebsite/assets/build/index.html#/home/list" target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()}><ExternalLink />監視画面</a><a className="misora" href="https://test.facilities.green-energy.se-misora.com/event/eventList" target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()}><PencilLine />報告書・CRM</a></div></td></tr>)}</tbody></table></section>
  </div>
}

function OpsKpi({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) { return <div className={`ops-kpi ${tone}`}><div><span>{label}</span><strong>{value}<small>件</small></strong></div><i>{icon}</i></div> }

export function IncidentCase({ phase, knowledge, knowledgeState, fieldStatus, onBack, onInspectionRequest, onRestart, onWork, onClose, onOpenKnowledge }: { phase: number; knowledge: KnowledgeCard[]; knowledgeState: 'none' | 'extracting' | 'pending' | 'published'; fieldStatus?: string; onBack: () => void; onInspectionRequest: () => void; onRestart: () => void; onWork: () => void; onClose: () => void; onOpenKnowledge: (id?: string) => void }) {
  const steps = ['異常検知', '原因確認', '遠隔対応', '現地対応決定', '現地作業', '復旧確認', '完了']
  const current = phase >= 6 ? 7 : phase >= 5 ? 6 : phase >= 2 ? 4 : 2
  const matched = useMemo(() => knowledgeService.match(knowledge, incidentQuery).filter(card => card.id !== extractedDraft.id), [knowledge])
  const causes = causeBreakdown(matched)
  const caseCard = knowledge.find(card => card.id === extractedDraft.id)
  const [drawer, setDrawer] = useState<{ open: boolean; focusId?: string }>({ open: false })
  const openCase = (focusId?: string) => setDrawer({ open: true, focusId })
  const status = phase >= 6 ? '完了' : phase >= 2 ? '現地対応' : '要対応'
  return <div className="page incident-page" data-testid="incident-page"><button className="back-button" onClick={onBack}><ArrowLeft />統合監視へ戻る</button>
    <div className="incident-heading"><div><span className={`ops-status ${phase >= 6 ? 'green' : 'red'}`}><i />{status}</span><h1>青森大間発電所　PCS-03 停止</h1><p><MapPin />青森県下北郡大間町　／　50kW級PCS　／　10:02 検知（40分経過）</p></div><div className="incident-heading-actions"><button className="secondary-action" onClick={() => openCase()} data-testid="similar-cases"><History />過去の類似事例（{matched.length}件）</button><button className="incident-inspection-button" onClick={onInspectionRequest} data-testid="incident-inspection-request"><Send />担当者のiPadへ手順を送る</button></div></div>
    <div className="case-steps">{steps.map((step, index) => <div className={index + 1 < current ? 'done' : index + 1 === current ? 'active' : ''} key={step}><span>{index + 1 < current ? <Check /> : index + 1}</span><strong>{step}</strong></div>)}</div>
    <div className="incident-main">
      <section className="panel case-panel"><OpsTitle icon={<Monitor />} title="現在の状態" note="監視データ（デモ）" /><div className="telemetry"><div className="danger"><small>PCS-03 の出力</small><strong>{phase >= 5 ? '47.8' : '0'}<em>kW</em></strong></div><div><small>ほかのPCS</small><strong>正常</strong></div><div><small>日射量</small><strong>十分</strong></div><div><small>停止前の内部温度</small><strong className={phase >= 5 ? '' : 'warn-text'}>{phase >= 5 ? '正常' : '上昇'}</strong></div></div><div className={`alarm ${phase >= 5 ? 'cleared' : ''}`}>{phase >= 5 ? <CheckCircle2 /> : <AlertTriangle />}<strong>{phase >= 5 ? '復旧後、アラームの解除を確認しました' : 'PCS内部温度異常で40分間停止しています'}</strong></div></section>
      <button className="k-match-strip" onClick={() => openCase()} data-testid="knowledge-match"><BookOpen /><span>同じ型のPCSで、同じ異常が起きた<strong>過去の事例 {matched.length}件</strong>をもとに、原因と手順を表示しています</span><b>事例を見る<ChevronRight /></b></button>
      <div className="incident-two">
        <section className="panel case-panel"><OpsTitle icon={<Sparkles />} title="考えられる原因" note={`過去の事例 ${matched.length}件の内訳`} /><ul className="k-causes">{causes.map((cause, index) => <li key={cause.label}><button onClick={() => openCase(cause.ids[0])}><span className="k-cause-rank">{index + 1}</span><span className="k-cause-main"><strong>{cause.label}</strong><i><em style={{ width: `${cause.percent}%` }} /></i></span><span className="k-cause-count">{matched.length}件中 <b>{cause.count}件</b></span><ChevronRight /></button></li>)}</ul></section>
        <section className="panel case-panel"><OpsTitle icon={<ShieldCheck />} title="切り分け手順" note="過去の事例から組み立てた順番" />
          <h3 className="k-proc-group">監視拠点で確認</h3>
          <ol className="k-proc">{remoteSteps.map((step, index) => { const done = index === 0 || phase >= 2; return <li className={done ? 'done' : ''} key={step.title}><span>{done ? <Check /> : index + 1}</span><div><strong>{step.title}</strong><small>{index === 1 && phase >= 2 ? '一時復旧 → 22分後に再停止（過去の事例と同じパターン）' : step.note}</small></div></li> })}</ol>
          {phase < 2 ? <button className="primary-button full" onClick={onRestart} data-testid="restart-ops"><RefreshCcw />遠隔再起動を実施</button> : <div className="restart-failed"><AlertCircle /><span><strong>一時復旧しましたが、22分後に再停止しました</strong>冷却系の可能性が高いため、現地対応が必要です。</span></div>}
          <h3 className="k-proc-group">現地で確認<small>担当者のiPadに届きます</small></h3>
          <ol className="k-proc" start={3}>{fieldProcedure.map((item, index) => <li className={phase >= 5 ? 'done' : ''} key={item.inspectionItemId}><span>{phase >= 5 ? <Check /> : index + 3}</span><div><strong>{item.title}</strong></div></li>)}</ol>
        </section>
      </div>
      {phase >= 2 && <section className="decision-card"><div><AlertTriangle /><span><small>対応判定</small><h2>現地対応が必要です</h2></span><b>優先度 高</b></div><div className="decision-details"><div><small>対応期限</small><strong>本日 16:00</strong></div><div><small>作業時間の目安</small><strong>60分</strong></div><div><small>担当</small><strong>東北拠点 佐藤</strong></div><div><small>持っていくもの</small><strong>交換用冷却ファン・フィルタ</strong></div></div><p>理由：再起動しても再停止し、日射は十分で、ほかのPCSは正常です。過去の事例{matched.length}件のうち{matched.filter(card => card.causeGroup !== '温度センサ・基板').length}件が冷却系で、現地での清掃・部品交換が必要でした。</p></section>}
      {phase >= 2 && <section className="panel case-panel repair-result"><OpsTitle icon={<Wrench />} title={phase >= 5 ? '現地作業の結果' : '現地作業'} note="駆けつけレポート（デモ）" />{phase < 5 ? <div className="k-field-wait"><p><Send />{fieldStatus === 'in_progress' ? '担当者がiPadで入力しています。提出されると、自動で完了まで進みます。' : fieldStatus === 'requested' ? '担当者のiPadへ手順を送りました。提出されると、自動で完了まで進みます。' : '担当者のiPadから提出されると、自動で完了まで進みます。'}</p><button className="secondary-action" onClick={onWork} data-testid="work-complete-ops">iPadを使わずに完了にする</button></div> : <div className="repair-summary"><CheckCircle2 /><span><strong>冷却ファンを交換し、PCSは正常に稼働しています</strong>出力 0kW → 47.8kW</span>{phase < 6 ? <button className="success-button" onClick={onClose} data-testid="close-ops">復旧を確認して完了</button> : <b>案件完了</b>}</div>}</section>}
      {phase >= 6 && knowledgeState !== 'none' && <KnowledgeCaseStatus state={knowledgeState} card={caseCard} onOpen={onOpenKnowledge} />}
    </div>
    {drawer.open && <KnowledgeDrawer cards={[...knowledge.filter(card => card.id === extractedDraft.id && isPublished(card)), ...matched]} focusId={drawer.focusId} onClose={() => setDrawer({ open: false })} onOpenBase={() => { setDrawer({ open: false }); onOpenKnowledge() }} />}
  </div>
}

function OpsTitle({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) { return <div className="ops-title"><span>{icon}</span><div><h2>{title}</h2><p>{note}</p></div></div> }
