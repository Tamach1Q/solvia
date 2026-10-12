import type { InspectionItem, KnowledgeCard } from '../types'

// DEMO MOCK DATA: 事例はすべて架空です。メーカー名・アラームコードは意図的に伏せています。
export const knowledgeCards: KnowledgeCard[] = [
  {
    id: 'K-101', equipmentType: 'PCS', maker: 'メーカーA', modelClass: '50kW級PCS', event: '内部温度異常による停止', causeGroup: '冷却ファン停止',
    title: '再起動で一時復旧→再停止するなら冷却ファンを最優先で確認',
    symptom: '内部温度異常で停止。遠隔再起動で一時的に復旧するが、20〜30分で再停止する。',
    steps: ['監視で停止前の内部温度の推移を確認', '遠隔再起動し、再停止までの時間を記録', '現地で冷却ファンの回転・異音を確認', 'ファン交換後、30分間 出力と内部温度を確認'],
    cause: '冷却ファンの停止（軸受の摩耗）', action: '冷却ファン交換（作業約45分）',
    cautions: ['再起動で戻っても、冷却系が原因なら必ず再停止する。復旧扱いにしない', '夏場・南向き設置で多い'],
    bring: ['交換用冷却ファン'], dispatch: '現地対応',
    sources: [{ kind: 'ヘルプデスク通話', caseId: 'INC-2025-0812-014' }, { kind: '駆けつけレポート', caseId: 'INC-2025-0812-014' }],
    base: '九州拠点', author: '山下', usedCount: 14, updatedAt: '2026/08/12',
  },
  {
    id: 'K-102', equipmentType: 'PCS', maker: 'メーカーA', modelClass: '50kW級PCS', event: '内部温度異常による停止', causeGroup: '吸排気の閉塞',
    title: '吸気フィルタの目詰まりで温度上昇。清掃のみで復旧',
    symptom: '日中の高負荷時間帯だけ内部温度異常で停止する。夕方には自然復旧する。',
    steps: ['停止が日中の高負荷時間帯に集中しているか確認', '現地で吸気フィルタの汚れを確認', 'フィルタ清掃後、ピーク時間帯の内部温度を監視'],
    cause: '吸気フィルタの目詰まり（粉じん）', action: 'フィルタ清掃・交換',
    cautions: ['近くに畑・未舗装路がある現場は目詰まりが早い。定期点検でフィルタ確認を追加'],
    bring: ['交換用フィルタ', 'ブロワ'], dispatch: '現地対応',
    sources: [{ kind: '点検報告書', caseId: 'INS-2025-0620-07' }],
    base: '関東拠点', author: '小林', usedCount: 9, updatedAt: '2026/06/20',
  },
  {
    id: 'K-103', equipmentType: 'PCS', maker: 'メーカーA', modelClass: '50kW級PCS', event: '内部温度異常による停止', causeGroup: '吸排気の閉塞',
    title: '吸気口に落ち葉・鳥の巣。周辺環境もあわせて撮影する',
    symptom: '内部温度異常で停止。ファンは回転している。',
    steps: ['ファンが回っていれば吸排気口の閉塞を疑う', '吸気口・排気口の異物を確認・撮影', '除去後、再起動して内部温度を確認'],
    cause: '吸気口への落ち葉の堆積・鳥の営巣', action: '異物除去、防鳥ネットの設置を提案',
    cautions: ['春先は営巣が多い。除去前に写真を残す（オーナー報告用）'],
    bring: ['防鳥ネット', 'ブロワ'], dispatch: '現地対応',
    sources: [{ kind: '駆けつけレポート', caseId: 'INC-2026-0415-003' }],
    base: '東北拠点', author: '佐藤', usedCount: 6, updatedAt: '2026/04/15',
  },
  {
    id: 'K-104', equipmentType: 'PCS', maker: 'メーカーA', modelClass: '50kW級PCS', event: '内部温度異常による停止', causeGroup: '冷却ファン停止',
    title: 'ファンのコネクタ半抜け。交換前に必ず確認',
    symptom: '内部温度異常で停止。ファンが回っていない。',
    steps: ['ファンが回っていない場合、交換前にファン電源コネクタの嵌合を確認', '再嵌合して回転を確認', '固定バンドで抜け止め'],
    cause: '振動によるファン電源コネクタの半抜け', action: 'コネクタ再嵌合・固定（部品交換なし）',
    cautions: ['ファン交換と判断する前にコネクタを見る。部品の取り寄せが不要になる'],
    bring: ['結束バンド'], dispatch: '現地対応',
    sources: [{ kind: 'ヘルプデスク通話', caseId: 'INC-2026-0218-009' }],
    base: '中部拠点', author: '伊藤', usedCount: 8, updatedAt: '2026/02/18',
  },
  {
    id: 'K-105', equipmentType: 'PCS', maker: 'メーカーA', modelClass: '50kW級PCS', event: '内部温度異常による停止', causeGroup: '冷却ファン停止',
    title: 'ファン異音の段階で交換すれば停止を防げた事例',
    symptom: '前回の定期点検でファン異音の記録あり。その3か月後に内部温度異常で停止。',
    steps: ['過去の点検報告書でファン異音の記録を検索', '異音の記録がある同型PCSを一覧化し、前倒しで交換'],
    cause: '冷却ファンの劣化', action: '冷却ファン交換',
    cautions: ['定期点検の「異音あり・経過観察」は、停止の予兆として扱う'],
    bring: ['交換用冷却ファン'], dispatch: '現地対応',
    sources: [{ kind: '点検報告書', caseId: 'INS-2025-1104-02' }, { kind: '社内CRM', caseId: 'CRM-28841' }],
    base: '近畿拠点', author: '中村', usedCount: 5, updatedAt: '2025/11/04',
  },
  {
    id: 'K-106', equipmentType: 'PCS', maker: 'メーカーA', modelClass: '50kW級PCS', event: '内部温度異常による停止', causeGroup: '温度センサ・基板',
    title: '実際は高温でないのに停止。温度センサの誤検知',
    symptom: '内部温度異常で停止するが、筐体は熱くなく、ファン・吸排気も正常。',
    steps: ['PCS表示の内部温度と、筐体表面の実温度を比べる', '差が大きければセンサ異常としてメーカーに問い合わせ'],
    cause: '内部温度センサの故障', action: 'メーカー対応（基板交換）',
    cautions: ['冷却系に異常がなければこのパターン。早めにメーカーへエスカレーション'],
    bring: ['非接触温度計'], dispatch: '現地対応',
    sources: [{ kind: 'ヘルプデスク通話', caseId: 'INC-2025-0903-021' }],
    base: '九州拠点', author: '山下', usedCount: 3, updatedAt: '2025/09/03',
  },
  {
    id: 'K-201', equipmentType: 'ストリング・パネル', maker: '—', modelClass: '野立て高圧', event: '絶縁抵抗低下・地絡検出', causeGroup: 'コネクタ浸水',
    title: '雨の後だけ出て晴れると消える地絡は、接続箱単位で切り分け',
    symptom: '雨天後に地絡検出で停止。晴れると自然に解消する。',
    steps: ['発生が降雨と連動しているか監視データで確認', '接続箱ごとに絶縁抵抗を測定して系統を絞る', '該当ストリングのコネクタ・ケーブル被覆を確認'],
    cause: 'コネクタ部への浸水', action: 'コネクタ交換・防水処理',
    cautions: ['晴天時に行くと再現しない。雨の翌日に測定する'],
    bring: ['絶縁抵抗計', '交換用コネクタ'], dispatch: '現地対応',
    sources: [{ kind: '駆けつけレポート', caseId: 'INC-2026-0611-011' }],
    base: '関東拠点', author: '小林', usedCount: 11, updatedAt: '2026/06/11',
  },
  {
    id: 'K-202', equipmentType: '系統', maker: '—', modelClass: '高圧連系', event: '系統異常による停止', causeGroup: '系統側要因',
    title: '晴天の昼に停止が繰り返すなら系統電圧の上昇を疑う',
    symptom: '晴天の昼に系統異常で停止と復帰を繰り返す。設備側に異常なし。',
    steps: ['停止時刻と系統電圧のログを照合', '近隣の発電所でも同時刻に停止していないか確認', '整定値を確認し、電力会社へ相談'],
    cause: '系統側の電圧上昇', action: '電力会社と協議（設備側の対応なし）',
    cautions: ['現地に行っても直らない。出動前に系統ログを確認する'],
    bring: [], dispatch: '遠隔で解決',
    sources: [{ kind: '社内CRM', caseId: 'CRM-30217' }],
    base: '中部拠点', author: '伊藤', usedCount: 7, updatedAt: '2026/05/22',
  },
  {
    id: 'K-203', equipmentType: '監視・通信', maker: '—', modelClass: '監視装置', event: '監視データの途絶', causeGroup: '通信機器',
    title: 'データ途絶でも発電は継続。ルーター再起動で出動不要',
    symptom: '監視データが途絶し、発電量がゼロに見える。',
    steps: ['同じ回線の他設備のデータも途絶しているか確認', '受電量・売電メーターで発電の継続を確認', 'ルーターを遠隔再起動'],
    cause: '通信ルーターのフリーズ', action: 'ルーター遠隔再起動（出動なし）',
    cautions: ['データ途絶＝停止ではない。出動前に発電の継続を確認する'],
    bring: [], dispatch: '出動不要',
    sources: [{ kind: 'ヘルプデスク通話', caseId: 'INC-2026-0730-006' }],
    base: '近畿拠点', author: '中村', usedCount: 19, updatedAt: '2026/07/30',
  },
  {
    id: 'K-204', equipmentType: 'ストリング・パネル', maker: '—', modelClass: '野立て高圧', event: 'ストリング電流の低下', causeGroup: 'パネル・断線',
    title: 'ストリング電流の継続的な低下はドローンのサーモで先に絞る',
    symptom: '特定ストリングの電流が、他より10%以上低い状態が続く。',
    steps: ['低下が天候によらず継続しているか確認', 'ドローンのサーモでホットスポット・断線を確認', '該当パネル・コネクタを現地で確認'],
    cause: 'パネルのホットスポット、またはストリング内の断線', action: 'パネル交換・コネクタ補修',
    cautions: ['パネル枚数が多い現場では、目視より先にサーモで絞ると作業が半分以下になる'],
    bring: ['交換用パネル', 'IVカーブトレーサ'], dispatch: '現地対応',
    sources: [{ kind: '点検報告書', caseId: 'INS-2026-0303-05' }],
    base: '東北拠点', author: '佐藤', usedCount: 12, updatedAt: '2026/03/03',
  },
]

export const incidentQuery = { equipmentType: 'PCS', event: '内部温度異常による停止', modelClass: '50kW級PCS' } as const

const ref = (id: string) => {
  const card = knowledgeCards.find(entry => entry.id === id)!
  return { id, label: card.title, base: card.base }
}

// 監視拠点で確認する手順（遠隔）と、担当者のiPadへ送る手順（現地）
export const remoteSteps = [
  { title: '停止前の内部温度の推移を確認', note: '停止前30分で内部温度が上昇していた', refs: ['K-101', 'K-106'] },
  { title: '遠隔再起動し、再停止までの時間を記録', note: '一時復旧しても再停止するなら冷却系を疑う', refs: ['K-101'] },
]

export const fieldProcedure: InspectionItem[] = [
  {
    inspectionItemId: 'PROC-01', inspectionId: 'INS-INC-2026-0909-003', equipmentId: 'PCS-03', type: 'priority', priority: 'high',
    title: 'PCS表示と実温度を比べる', reason: '表示温度と実際の温度に差があれば、温度センサの誤検知です。冷却系を見る前に切り分けます。',
    evidence: ['ナレッジ K-106'], checks: ['停止履歴', '表示の内部温度', '筐体表面の温度'], requiredPhoto: true, photoTargets: ['PCS表示画面'], requiredMeasurement: { label: '筐体表面温度', unit: '℃', reference: '表示温度と10℃以上差があればセンサ異常を疑う' },
    result: null, comment: '', knowledgeRefs: [ref('K-106')], knowledgeTip: '冷却系に異常がなければこのパターン。早めにメーカーへ。',
  },
  {
    inspectionItemId: 'PROC-02', inspectionId: 'INS-INC-2026-0909-003', equipmentId: 'PCS-03', type: 'priority', priority: 'high',
    title: '吸気口・排気口の閉塞', reason: '同型PCSの内部温度異常6件のうち2件は、吸排気の閉塞（フィルタ目詰まり・落ち葉・鳥の巣）でした。',
    evidence: ['ナレッジ K-102', 'ナレッジ K-103'], checks: ['フィルタの汚れ', '落ち葉・鳥の巣', '排気口の障害物'], requiredPhoto: true, photoTargets: ['吸気口', '排気口'], requiredMeasurement: null,
    result: null, comment: '', knowledgeRefs: [ref('K-102'), ref('K-103')], knowledgeTip: '除去する前に写真を残す（オーナー報告用）。',
  },
  {
    inspectionItemId: 'PROC-03', inspectionId: 'INS-INC-2026-0909-003', equipmentId: 'PCS-03', type: 'priority', priority: 'high',
    title: '冷却ファンの回転・コネクタ', reason: '6件のうち3件は冷却ファンの停止でした。交換の前に、コネクタの半抜けを確認します。',
    evidence: ['ナレッジ K-101', 'ナレッジ K-104'], checks: ['ファンの回転', '異音', '電源コネクタの嵌合', '手回しの重さ'], requiredPhoto: true, photoTargets: ['冷却ファン部'], requiredMeasurement: null,
    result: null, comment: '', knowledgeRefs: [ref('K-101'), ref('K-104')], knowledgeTip: 'コネクタが原因なら部品交換は不要。交換用ファンは車に積んである前提。',
  },
  {
    inspectionItemId: 'PROC-04', inspectionId: 'INS-INC-2026-0909-003', equipmentId: 'PCS-03', type: 'priority', priority: 'medium',
    title: '処置後30分の復旧確認', reason: '再起動直後に戻っても、冷却系が原因なら再停止します。30分間、出力と内部温度を確認してから完了にします。',
    evidence: ['ナレッジ K-101'], checks: ['出力', '内部温度', 'アラーム解除'], requiredPhoto: true, photoTargets: ['運転表示'], requiredMeasurement: { label: '処置後30分の出力', unit: 'kW', reference: '他PCSと同等（47〜49kW）であれば復旧' },
    result: null, comment: '', knowledgeRefs: [ref('K-101')], knowledgeTip: '復旧を確認してから現場を離れる。',
  },
]

// 案件完了時の材料（モック）
export const captureMaterials = {
  report: { caseId: 'INC-2026-0909-003', author: '佐藤 健（東北拠点）', text: 'PCS-03 冷却ファン停止。吸排気口は異常なし。ファン電源コネクタは正常、手回しが重く軸受摩耗と判断。冷却ファンを交換し、30分後の出力47.8kW・アラーム解除を確認。' },
  call: {
    duration: '3:12', at: '2026/09/09 13:41',
    lines: [
      { who: '現場（佐藤）', text: 'PCS-03、ファンが回ってないです。吸気側はきれいです。' },
      { who: 'ヘルプデスク', text: 'コネクタは見ましたか。中部で半抜けの事例があります。' },
      { who: '現場（佐藤）', text: 'コネクタは問題ないです。軸がガタついていて、手で回すと重いです。' },
      { who: 'ヘルプデスク', text: '軸受の摩耗ですね。交換して、30分は出力と温度を見てください。' },
      { who: '現場（佐藤）', text: 'そういえば監視の履歴で、2週間くらい前から温度警告がちょこちょこ出てました。' },
      { who: 'ヘルプデスク', text: 'それは残しましょう。警告の段階で行けたかもしれない。' },
    ],
  },
  photos: ['冷却ファン部（交換前）', '冷却ファン部（交換後）', '運転表示'],
}

export const extractedDraft: KnowledgeCard = {
  id: 'K-301', equipmentType: 'PCS', maker: 'メーカーA', modelClass: '50kW級PCS', event: '内部温度異常による停止', causeGroup: '冷却ファン停止',
  title: '温度警告が2週間続いたら、停止前にファンを点検する',
  symptom: '内部温度異常で停止。遠隔再起動で一時復旧するが約20分で再停止。',
  steps: ['監視で停止前の内部温度の推移と、過去の温度警告を確認', '遠隔再起動し、再停止までの時間を記録', '吸排気口の閉塞を確認（異常なし）', 'ファンの回転・コネクタを確認（コネクタ正常・手回しが重い）', '軸受摩耗と判断し冷却ファンを交換', '交換後30分、出力と内部温度を確認'],
  cause: '冷却ファンの軸受摩耗による回転停止', action: '冷却ファン交換（作業約45分）',
  cautions: ['コネクタ半抜け（K-104）との切り分けは「手回しの重さ」で判断できる'],
  bring: ['交換用冷却ファン'], dispatch: '現地対応',
  sources: [{ kind: 'ヘルプデスク通話', caseId: 'INC-2026-0909-003' }, { kind: '駆けつけレポート', caseId: 'INC-2026-0909-003' }],
  base: '東北拠点', author: '佐藤', usedCount: 0, updatedAt: '2026/09/09',
  newInsight: '停止の約2週間前から温度警告が断続的に出ていた。警告の段階で点検すれば、停止を防げた可能性がある。',
}
