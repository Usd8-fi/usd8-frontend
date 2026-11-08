# Turkish (tr) glossary — USD8 docs + app UI

Style: polite "siz", but short UI copy (imperative buttons: "Yatır", "Çek", "Talep Oluştur"). Translate the idea, not the words: clauses may be reordered, merged or split; facts, numbers, conditions and risk caveats stay identical. Keep USD8, sUSD8, token symbols (USDC, wstETH, aUSDC, sGHO …), brand/protocol names (Aave, Morpho, Sky, Chainlink, Brevis, OpenZeppelin, GitHub, Telegram, X), TEE, TWAP, RPC, LP, NFT, zk, contract/function names (Registry, Treasury, DefiInsurance, endBetaMode, Timelock), addresses and code in English. Contract names in the Addresses table stay English (timelock-queue.js reads them as labels).

Typography: numbers keep English formatting (0.8, 50,400; never 0,8). Percent sign goes BEFORE the number, Turkish style, wherever the number is a bare value or literal ("%20", "%{percent}"); a placeholder that already carries "%" (e.g. `{share}`, `{percent}` in fileClaim.metric.scoreCommitted) is left as is. Dollar amounts stay "$500". Suffixes on Latin words take an apostrophe with vowel harmony: USD8'i/USD8'in/USD8'e, USDC'yi/USDC'nin, TEE'yi, token'lar, Booster'lar, stablecoin'dir, L2'leri. Never put a consonant-assimilating suffix (-de/-te, -den/-ten) on USD8 (readers say "eyt" or "sekiz", so the right form is ambiguous) and never suffix a {placeholder}; rephrase instead ("{network} ağında", "{symbol} varlığını", "Kullanılabilir: {amount}", "Doluluk oranı hakkında: {pool}"). "hâle", "hâlâ" with circumflex.

## Key decisions

- **APY → "Yıllık Getiri"** (prose: "yıllık getiri"). The standard Turkish finance phrase (banks, funds); "APY" is not used in Turkish retail finance and reads as an untranslated leftover. Window labels: "30G Yıllık Getiri"; toggle row "7G 30G Yıllık Getiri".
- **7D / 30D → "7G" / "30G"** (G = gün): the convention of Turkish chart toggles (1G, 1H, 1A, 1Y); as short as the English buttons.
- **TVL → "Toplam Yatırılan"** (total deposited): plain Turkish, matches what the figure is (assets deposited in the pool) and mirrors ja 預け入れ総額 / ko 총 예치액; Turkish media write "toplam kilitli değer (TVL)", but in a three-column pool card a plain label reads better than an acronym; "Toplam Kilitli Değer" is longer and a calque, "mevduat" is a regulated bank-deposit term and must be avoided for DeFi.
- **Cover Pool → "Teminat Havuzu"** (pl. Teminat Havuzları; "wstETH Teminat Havuzu"). "Teminat" is the Turkish insurance word for cover/coverage, and "teminat havuzu" is also the established Turkish capital-markets term for a covered-bond cover pool, so it is the closest existing term. Audit note: rejected "Sigorta Havuzu" (reads as the insured party's pool / a mutual, and would blur with "sigorta puanı", "sigortalı token"). Accepted risk: in DeFi, "teminat" alone also means collateral; that reading (assets that back claims) is not misleading here. Contract names in the address table stay English.
- **Bond → "depozito"** (claim bond = talep depozitosu). It is refundable, and "teminat" is already taken by Cover Pool/coverage.
- **Claim → "talep"** (file a claim = talepte bulunmak; button "Talep Oluştur"; claimant = talep sahibi); the money = **"tazminat"** (reimbursement), the transfer = **"ödeme"** (payout).
- **Settle / Settlement → "uzlaştırmak / uzlaştırma"** (the capital-markets term, "takas ve uzlaştırma"); settlement root = uzlaştırma kökü (settlement root).
- **Escrow → "emanet"** (escrowed = emanetteki; to escrow = emanete vermek).
- **Cooldown → "bekleme süresi"** (Start Cooldown = "Beklemeyi Başlat"; in cooldown = bekleme süresinde). The score's 7-day maturity is a different idea: **"elde tutma süresi"** (holding period).
- **Insurance Score → "Sigorta Puanı"** (short "puan").
- **Booster** stays "Booster" (NFT name), plural "Booster'lar"; Turkish keeps the singular after numbers ("3 Booster").
- **White Hat Economy → "Beyaz Şapka Ekonomisi"**: "beyaz şapkalı hacker" is the established Turkish security term; the program name reads naturally translated.
- **Timelock** stays "Timelock" (contract name; queues = "Timelock Kuyrukları"); first docs mention glossed "timelock (zaman kilidi)".
- **Mint / Redeem → "Bas" / "İtfa Et"** (basım / itfa): "basmak" is how Turkish crypto press says stablecoins are minted ("Tether 1 milyar USDT bastı"); "itfa" is the Turkish finance term for redemption. Audit note: kept "Bas" over "Mint Et" (NFT slang, clashes with formal "İtfa Et"). The bare button could be misread as "press", but it sits on the USD8 card next to "İtfa Et", opens a dialog titled "USD8 Bas", and every message uses "basım"/"basmak"; if the owner wants zero ambiguity, the landing button can become "USD8 Bas" (8 chars).
- **Private beta → "Kapalı Beta"** (the usual Turkish term); protocol beta mode stays "beta".

| English | Türkçe |
| --- | --- |
| Cover Pool / Cover Pools | Teminat Havuzu / Teminat Havuzları |
| Cover Pool LP | Teminat Havuzu LP'si (pl. LP'leri) |
| Cover Pool limit | Teminat Havuzu limiti |
| Insurance Payout Limit | Sigorta Ödeme Limiti |
| Insurance Score | Sigorta Puanı (short: puan) |
| Available score | kullanılabilir puan |
| Score to spend | harcanacak sigorta puanı |
| Score Rate | Puan Oranı ("Günde {unit} başına {rate}") |
| Score weight | puan ağırlığı |
| Booster(s) | Booster / Booster'lar |
| Claim (noun) / file a claim | talep / talepte bulunmak (button: Talep Oluştur) |
| File insurance claims (section) | Sigorta Tazminatı Talep Edin |
| Simulate Claim | Talep Simülasyonu |
| Cancel claim | Talebi İptal Et |
| Claimant / claimer | talep sahibi |
| Claim window | talep süresi |
| Claim bond / anti-spam bond | talep depozitosu / spam önleme depozitosu |
| Claim verification (service) | talep doğrulama (hizmeti) |
| Settle / settlement | uzlaştırmak / uzlaştırma |
| Settlement window | uzlaştırma süresi |
| Dispute / dispute window | itiraz etmek / itiraz süresi |
| Payout / payout window | ödeme / ödeme süresi |
| Accept / decline payout | ödemeyi kabul etmek / reddetmek |
| Finalize payout | ödemeyi sonuçlandırmak |
| Return tokens | Token'ları Geri Al |
| Reimbursement | tazminat |
| Loss cap | kayıp sınırı |
| Max coverage | azami teminat (oranı) |
| Coverage | teminat / kapsam |
| Insured token | sigortalı token |
| Underlying (asset) | dayanak varlık |
| Incident | olay |
| Holding requirement / holding period | elde tutma şartı / elde tutma süresi (fileClaim.holdingRequirement.* start with "Elde tutma süresi: …" so they fit after both tokenAmountHelp and boostersHelp) |
| Eligible / eligibility | uygun / talep hakkı |
| Escrow / escrowed | emanet / emanetteki |
| Forfeit | vazgeçmek (bond: iade edilmez) |
| Bond | depozito |
| Deposit (verb / noun) | yatırmak / yatırım ("Yatırımınız") |
| Deposit cap | yatırım üst limiti |
| Pool Filled | Doluluk Oranı |
| Withdraw / withdrawal | çekmek / çekim |
| Withdraw Earnings | Kazancı Çek |
| Cooldown | bekleme süresi |
| Exit / exit queue | çıkış / çıkış kuyruğu |
| Shares | pay |
| Earnings / rewards | kazanç |
| Balance | bakiye |
| Approve (ERC-20) | harcama onayı vermek |
| Mint / Redeem | basmak / itfa etmek |
| Redemption quote | itfa teklifi |
| Treasury / treasury yield | hazine / hazine getirisi (contract: Treasury) |
| Yield | getiri |
| APY | Yıllık Getiri |
| TVL | Toplam Yatırılan |
| 7D / 30D | 7G / 30G |
| Vault | kasa |
| Stablecoin | stablecoin |
| Onchain / offchain | zincir üstü / zincir dışı |
| Open source | açık kaynak |
| Finalized block | kesinleşmiş blok |
| Deployed on network | "{network} ağında mevcut" |
| Admin | yönetici |
| Timelock / Timelock Queues | Timelock / Timelock Kuyrukları |
| Queued / Executed (timelock) | Kuyrukta / Yürütüldü |
| Oracle | oracle (Chainlink oracle'ları) |
| Attestation | onay belgesi (attestation) |
| zk-coprocessor | zk yardımcı işlemci |
| Private beta | kapalı beta |
| White Hat Economy | Beyaz Şapka Ekonomisi |
| Philosophical Roots | Felsefi Kökenler |
| DeFi Insurance | DeFi Sigortası |
| Transparency | Şeffaflık |
| System Stats | Sistem İstatistikleri |
| FAQs | SSS |
| Legal | Yasal (legal.md stays English) |
| Docs | Belgeler |
| Check (booster) | Sorgula |
| About X (tooltip aria-label) | X hakkında / "… hakkında: {pool}" |
| Learn More | Daha Fazla Bilgi |
