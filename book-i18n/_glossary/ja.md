# USD8 用語集：日本語（ja）

アプリUI（src/locales/ja/）、ドキュメント（book-i18n/ja/）、ドキュメントのウィジェット・Cookieバナー（book-i18n/_review/ja-shared.json）で共通して使う訳語です。

## 製品用語（English -> 日本語）

APY -> 年利（例：「年利」「高い年利」）
7D APY / 30D APY -> 7日平均年利 / 30日平均年利（ボタン表記は「7日」「30日」＋「平均年利」）
TVL -> 預け入れ総額
Cover Pool -> カバープール（例：wstETHカバープール、USD8カバープール）
Cover Pool LP -> カバープールLP
Pool Filled -> プール充足率（数値は「充足率{n}%」）
Insurance Score -> 保険スコア
Available score -> 利用可能なスコア
Score Rate -> スコア獲得レート（値は「1 USD8あたり{rate}/日」）
Spend score -> スコアを使用する（「消費」は使わない）
Booster / Boosters -> ブースター
300% boosted rate / x300% (beta) -> 通常の3倍（300%）／ラベルは「3倍」（レートが3倍になる意味。「300%アップ」「+300%」とは書かない）
Holding requirement (at least N blocks / 7 days before) -> 「〜以上前から保有している」（「以上」を省かない）
Claim (noun) -> 請求（保険金そのものの文脈では「保険金を請求」）
File a Claim -> 請求を提出する / 請求の提出（ボタン：「請求する」「請求を提出」、見出し：「保険金の請求」）
Cancel Claim -> 請求の取り下げ / 請求を取り下げる
Claimer / claimant -> 請求者
Settle / Settlement -> 精算する / 精算
Settlement root -> 精算ルート
Finalize Payouts -> 支払いの確定
Payout -> 支払い（金額は「支払額」、保険の文脈では「保険金」）
Accept Payout -> 支払いを受け取る
Return Tokens（エスクローの返却）-> トークンを引き出す
Payout limit / cap -> 支払い上限 / 支払い枠
Insured Token -> 保険対象トークン
Max coverage -> 最大補償率
Coverage -> 補償
Loss cap -> 損失上限
White Hat Economy -> ホワイトハット・エコノミー
Timelock -> タイムロック（コントラクト名として示す場合は Timelock のまま）
Timelock Queues -> タイムロックキュー
Queued (timelock) -> 予約済み
Escrow / escrowed -> エスクロー / エスクローに預けた・エスクロー中
Exit queue -> 出金キュー
Exit epoch -> 出金エポック
Withdraw -> 引き出し / 引き出す
Cooldown -> クールダウン
Deposit -> 預け入れ / 預け入れる
Deposit cap -> 預け入れ上限
Earnings (cover pool rewards) -> 収益（「収益を引き出す」）
Bond -> 保証金（請求時は「請求保証金」、ドキュメント初出は「保証金（ボンド）」）
Incident -> インシデント
Dispute -> 異議申し立て
Approve (token allowance) -> 承認（「ウォレットで{token}の使用を承認」）
Transaction confirmed -> トランザクションが完了（「承認」は approve 専用）
Finalized (chain) -> ファイナライズ済み
Beta -> ベータ版（バッジは「ベータ」、期間は「ベータ期間中」）
Admin -> 管理者
Treasury -> トレジャリー（コントラクト名は Treasury）
Treasury yield -> トレジャリー利回り
DeFi Insurance -> DeFi保険（コントラクト名は DeFi Insurance / DefiInsurance）
System Stats -> システム統計
Addresses -> アドレス（フッターは「アドレス一覧」）
Transparency -> 透明性
FAQs -> よくある質問
Legal -> 法的情報
Philosophical Roots -> 思想的ルーツ
Stablecoin -> ステーブルコイン
Yield -> 利回り
Vault -> ボールト
Strategy -> 戦略
Mint / Redeem / Burn -> ミント / 償還 / バーン
Check (button) -> 確認
Learn More -> 詳しくはこちら

## 英語のまま残す語

USD8、sUSD8、USDC、wstETH、aUSDC などのトークンシンボル、TEE、TWAP、LP、NFT、RPC、L2、プロトコル名・企業名（Aave、Morpho、Chainlink、OpenZeppelin、Brevis、Telegram、X、Github、Google Analytics）、コントラクト名・関数名（Registry、Treasury、DefiInsurance、Timelock、endBetaMode）、アドレス表のコントラクト名、アドレス、URL、数値。

## スタイルメモ

- 逐語訳ではなく意味を訳す。文の順序の入れ替え・分割・統合は自由だが、事実・条件・数値・リスクの説明は増減させない。
- 説明文は「です・ます」調。ボタン・ラベルは体言止めや短い動詞句（「請求する」「収益を引き出す」）。
- 和文と英数字・{プレースホルダー}の間にスペースを入れない（例：USD8を保有、最大80%、ブロック{block}）。英数字どうしの間は通常の半角スペース（例：10 USD8、{amount} {symbol}）。
- 句読点・括弧・コロンは全角（、。（）：）。数値・小数点・%は半角のまま、桁区切りは付けない。
- 「利用可能な残高」系の表示は「利用可能：{amount}」の形にする。
