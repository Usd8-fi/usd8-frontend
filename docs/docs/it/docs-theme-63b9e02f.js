(function () {
    document.title = "USD8 docs";

    function injectSidebarLogo() {
        var scrollbox = document.querySelector("#mdbook-sidebar .sidebar-scrollbox");
        if (!scrollbox || scrollbox.querySelector(".sidebar-brand")) return;

        var brand = document.createElement("div");
        brand.className = "sidebar-brand";

        var link = document.createElement("a");
        link.className = "sidebar-logo";
        link.href = "/";
        link.setAttribute("aria-label", "USD8 home");

        var logo = document.createElement("img");
        logo.src = "/assets/usd8Logo.svg";
        logo.alt = "USD8";
        link.appendChild(logo);

        var wordmark = document.createElement("img");
        wordmark.className = "sidebar-wordmark";
        wordmark.src = "/assets/usd8-wordmark.svg";
        wordmark.alt = "USD8.fi";
        link.appendChild(wordmark);

        var betaLink = document.createElement("a");
        betaLink.className = "sidebar-beta-link";
        betaLink.href = "faqs.html#whats-different-in-beta";
        betaLink.textContent = "beta";

        brand.appendChild(link);
        brand.appendChild(betaLink);
        scrollbox.prepend(brand);
    }

    // Translated books live at /docs/<lang>/; English at /docs/.
    var DOC_LANGUAGES = [
        ["en", "English"], ["zh", "简体中文"], ["zh-TW", "繁體中文"], ["ko", "한국어"], ["ja", "日本語"],
        ["de", "Deutsch"], ["es", "Español"], ["it", "Italiano"], ["ru", "Русский"], ["pt", "Português (Brasil)"], ["fr", "Français"], ["tr", "Türkçe"], ["vi", "Tiếng Việt"], ["id", "Bahasa Indonesia"], ["uk", "Українська"], ["th", "ไทย"], ["ar", "العربية"], ["fa", "فارسی"]
    ];
    var UI_TEXT = {
        en: { app: "USD8 App", language: "Language" },
        zh: { app: "USD8应用", language: "语言" },
        "zh-TW": { app: "USD8應用程式", language: "語言" },
        ko: { app: "USD8 앱", language: "언어" },
        ja: { app: "USD8アプリ", language: "言語" },
        de: { app: "USD8-App", language: "Sprache" },
        es: { app: "App de USD8", language: "Idioma" },
        it: { app: "App USD8", language: "Lingua" },
        ru: { app: "Приложение USD8", language: "Язык" },
        pt: { app: "App USD8", language: "Idioma" },
        fr: { app: "App USD8", language: "Langue" },
        tr: { app: "USD8 Uygulaması", language: "Dil" },
        vi: { app: "Ứng dụng USD8", language: "Ngôn ngữ" },
        id: { app: "Aplikasi USD8", language: "Bahasa" },
        uk: { app: "Застосунок USD8", language: "Мова" },
        th: { app: "แอป USD8", language: "ภาษา" },
        ar: { app: "تطبيق USD8", language: "اللغة" },
        fa: { app: "اپلیکیشن USD8", language: "زبان" }
    };
    function docsLocation() {
        var match = window.location.pathname.match(/^(.*\/docs\/)(?:(zh-TW|zh|ko|ja|de|es|it|ru|pt|fr|tr|vi|id|uk|th|ar|fa)\/)?(.*)$/);
        if (!match) return { base: "/docs/", lang: "en", page: "" };
        return { base: match[1], lang: match[2] || "en", page: match[3] };
    }
    var DOC_LANG = docsLocation().lang;
    function uiText(key) { return (UI_TEXT[DOC_LANG] || UI_TEXT.en)[key]; }

    // Text the docs widgets (booster check, timelock queue) write at runtime.
    // Exposed as window.usd8DocsText(key, vars) for those scripts, which load after this one.
    var WIDGET_TEXT = {
        en: { invalidAddress: "Enter a valid Ethereum address.", checking: "Checking...", noBoosters: "No Boosters found for this address.", found_one: "Congratulations! You have {count} Booster.", found_other: "Congratulations! You have {count} Boosters.", error: "Error: {message}", fetchFailed: "could not fetch balance", executed: "Executed", cancelled: "Cancelled", queued: "Queued · {time}", ready: "Ready to Execute", executableFrom: "Executable from {date}", transaction: "Transaction", description: "Description", status: "Status", empty: "No timelock transactions yet", loading: "Loading", loadFailed: "Timelock transactions could not be loaded", retry: "Retry", hoursLeft: "{n}h left", minutesLeft: "{n}m left", antiScamInvalid: "Enter a valid {platform} username.", antiScamOfficial: "@{handle} is an official USD8 {platform} account.", antiScamUnknown: "@{handle} is not an official USD8 {platform} account. Treat it as a likely scam: do not send funds, sign transactions or share your seed phrase.", antiScamUnavailable: "Could not run the check in this browser." },
        zh: { invalidAddress: "请输入有效的以太坊地址。", checking: "查询中…", noBoosters: "该地址暂无加成卡。", found_one: "恭喜！你拥有{count}张加成卡。", found_other: "恭喜！你拥有{count}张加成卡。", error: "出错了：{message}", fetchFailed: "无法获取余额", executed: "已执行", cancelled: "已取消", queued: "排队中 · {time}", ready: "可执行", executableFrom: "{date}起可执行", transaction: "交易", description: "说明", status: "状态", empty: "暂无时间锁交易", loading: "加载中", loadFailed: "时间锁交易加载失败", retry: "重试", hoursLeft: "剩余{n}小时", minutesLeft: "剩余{n}分钟", antiScamInvalid: "请输入有效的{platform}用户名。", antiScamOfficial: "@{handle}是USD8官方{platform}账号。", antiScamUnknown: "@{handle}不是USD8官方{platform}账号。请将其视为疑似诈骗：不要转账、不要签署交易，也不要透露你的助记词。", antiScamUnavailable: "当前浏览器无法完成核查。" },
        "zh-TW": { invalidAddress: "請輸入有效的以太坊地址。", checking: "查詢中…", noBoosters: "這個地址目前沒有加成卡。", found_one: "恭喜！你擁有{count}張加成卡。", found_other: "恭喜！你擁有{count}張加成卡。", error: "發生錯誤：{message}", fetchFailed: "無法取得餘額", executed: "已執行", cancelled: "已取消", queued: "排隊中 · {time}", ready: "可執行", executableFrom: "{date}起可執行", transaction: "交易", description: "說明", status: "狀態", empty: "目前沒有時間鎖交易", loading: "載入中", loadFailed: "無法載入時間鎖交易", retry: "重試", hoursLeft: "剩餘{n}小時", minutesLeft: "剩餘{n}分鐘", antiScamInvalid: "請輸入有效的{platform}使用者名稱。", antiScamOfficial: "@{handle}是USD8官方{platform}帳號。", antiScamUnknown: "@{handle}不是USD8官方{platform}帳號。請將其視為疑似詐騙：不要轉帳、不要簽署交易，也不要透露你的助記詞。", antiScamUnavailable: "目前的瀏覽器無法完成查核。" },
        ko: { invalidAddress: "올바른 Ethereum 주소를 입력하세요.", checking: "확인 중...", noBoosters: "이 주소에는 부스터가 없습니다.", found_one: "축하합니다! 부스터 {count}개를 보유하고 있습니다.", found_other: "축하합니다! 부스터 {count}개를 보유하고 있습니다.", error: "오류: {message}", fetchFailed: "잔액을 불러오지 못했습니다", executed: "실행 완료", cancelled: "취소됨", queued: "대기 중 · {time}", ready: "실행 가능", executableFrom: "{date}부터 실행 가능", transaction: "트랜잭션", description: "설명", status: "상태", empty: "아직 타임락 트랜잭션이 없습니다", loading: "불러오는 중", loadFailed: "타임락 트랜잭션을 불러오지 못했습니다", retry: "다시 시도", hoursLeft: "{n}시간 남음", minutesLeft: "{n}분 남음", antiScamInvalid: "올바른 {platform} 사용자 이름을 입력하세요.", antiScamOfficial: "@{handle}: USD8 공식 {platform} 계정입니다.", antiScamUnknown: "@{handle}: USD8 공식 {platform} 계정이 아닙니다. 사기일 가능성이 높으니 자금을 보내거나 트랜잭션에 서명하거나 시드 문구를 알려 주지 마세요.", antiScamUnavailable: "이 브라우저에서는 확인할 수 없습니다." },
        ja: { invalidAddress: "有効なEthereumアドレスを入力してください。", checking: "確認中…", noBoosters: "このアドレスが保有するブースターはありません。", found_one: "おめでとうございます！ブースターを{count}個保有しています。", found_other: "おめでとうございます！ブースターを{count}個保有しています。", error: "エラー：{message}", fetchFailed: "残高を取得できませんでした", executed: "実行済み", cancelled: "キャンセル済み", queued: "予約済み・{time}", ready: "実行可能", executableFrom: "{date}から実行可能", transaction: "トランザクション", description: "内容", status: "ステータス", empty: "タイムロックのトランザクションはまだありません", loading: "読み込み中", loadFailed: "タイムロックのトランザクションを読み込めませんでした", retry: "再試行", hoursLeft: "残り{n}時間", minutesLeft: "残り{n}分", antiScamInvalid: "有効な{platform}のユーザー名を入力してください。", antiScamOfficial: "@{handle}はUSD8の公式{platform}アカウントです。", antiScamUnknown: "@{handle}はUSD8の公式{platform}アカウントではありません。詐欺の可能性が高いため、送金、トランザクションへの署名、シードフレーズの共有は絶対にしないでください。", antiScamUnavailable: "このブラウザでは確認できませんでした。" },
        de: { invalidAddress: "Bitte geben Sie eine gültige Ethereum-Adresse ein.", checking: "Wird geprüft…", noBoosters: "Für diese Adresse wurden keine Booster gefunden.", found_one: "Glückwunsch! Sie besitzen {count} Booster.", found_other: "Glückwunsch! Sie besitzen {count} Booster.", error: "Fehler: {message}", fetchFailed: "Guthaben konnte nicht abgerufen werden", executed: "Ausgeführt", cancelled: "Abgebrochen", queued: "Geplant · {time}", ready: "Bereit zur Ausführung", executableFrom: "Ausführbar ab {date}", transaction: "Transaktion", description: "Beschreibung", status: "Status", empty: "Noch keine Timelock-Transaktionen", loading: "Wird geladen", loadFailed: "Timelock-Transaktionen konnten nicht geladen werden", retry: "Erneut versuchen", hoursLeft: "noch {n} Std.", minutesLeft: "noch {n} Min.", antiScamInvalid: "Bitte geben Sie einen gültigen {platform}-Benutzernamen ein.", antiScamOfficial: "@{handle} ist ein offizielles USD8-Konto auf {platform}.", antiScamUnknown: "@{handle} ist kein offizielles USD8-Konto auf {platform}. Es handelt sich wahrscheinlich um Betrug: Senden Sie kein Geld, signieren Sie keine Transaktionen und geben Sie Ihre Seed-Phrase nicht weiter.", antiScamUnavailable: "Die Prüfung ist in diesem Browser nicht möglich." },
        es: { invalidAddress: "Introduce una dirección de Ethereum válida.", checking: "Comprobando...", noBoosters: "Esta dirección no tiene Boosters.", found_one: "¡Felicidades! Tienes {count} Booster.", found_other: "¡Felicidades! Tienes {count} Boosters.", error: "Error: {message}", fetchFailed: "no se pudo obtener el saldo", executed: "Ejecutada", cancelled: "Cancelada", queued: "En cola · {time}", ready: "Lista para ejecutar", executableFrom: "Ejecutable desde {date}", transaction: "Transacción", description: "Descripción", status: "Estado", empty: "Aún no hay transacciones en el Timelock", loading: "Cargando", loadFailed: "No se pudieron cargar las transacciones del Timelock", retry: "Reintentar", hoursLeft: "ejecutable en {n} h", minutesLeft: "ejecutable en {n} min", antiScamInvalid: "Introduce un nombre de usuario de {platform} válido.", antiScamOfficial: "@{handle} es una cuenta oficial de USD8 en {platform}.", antiScamUnknown: "@{handle} no es una cuenta oficial de USD8 en {platform}. Trátala como una probable estafa: no envíes fondos, no firmes transacciones y no compartas tu frase semilla.", antiScamUnavailable: "No se pudo hacer la comprobación en este navegador." },
        it: { invalidAddress: "Inserisci un indirizzo Ethereum valido.", checking: "Verifica in corso…", noBoosters: "Nessun Booster trovato per questo indirizzo.", found_one: "Congratulazioni! Hai {count} Booster.", found_other: "Congratulazioni! Hai {count} Booster.", error: "Errore: {message}", fetchFailed: "impossibile recuperare il saldo", executed: "Eseguita", cancelled: "Annullata", queued: "In coda · {time}", ready: "Pronta per l’esecuzione", executableFrom: "Eseguibile da: {date}", transaction: "Transazione", description: "Descrizione", status: "Stato", empty: "Nessuna transazione nel Timelock per ora", loading: "Caricamento", loadFailed: "Impossibile caricare le transazioni del Timelock", retry: "Riprova", hoursLeft: "ancora {n} h", minutesLeft: "ancora {n} min", antiScamInvalid: "Inserisci un nome utente {platform} valido.", antiScamOfficial: "@{handle} è un account {platform} ufficiale di USD8.", antiScamUnknown: "@{handle} non è un account {platform} ufficiale di USD8. Consideralo una probabile truffa: non inviare fondi, non firmare transazioni e non condividere la tua seed phrase.", antiScamUnavailable: "Impossibile eseguire la verifica in questo browser." },
        ru: { invalidAddress: "Введите корректный адрес Ethereum.", checking: "Проверяем…", noBoosters: "На этом адресе бустеров нет.", found_one: "Поздравляем! У вас {count} бустер.", found_few: "Поздравляем! У вас {count} бустера.", found_many: "Поздравляем! У вас {count} бустеров.", found_other: "Поздравляем! У вас {count} бустера.", error: "Ошибка: {message}", fetchFailed: "не удалось получить баланс", executed: "Выполнено", cancelled: "Отменено", queued: "В очереди · {time}", ready: "Можно выполнить", executableFrom: "Можно выполнить с {date}", transaction: "Транзакция", description: "Описание", status: "Статус", empty: "В очереди таймлока пока нет транзакций", loading: "Загрузка", loadFailed: "Не удалось загрузить транзакции таймлока", retry: "Повторить", hoursLeft: "ещё {n} ч", minutesLeft: "ещё {n} мин", antiScamInvalid: "Введите корректное имя пользователя {platform}.", antiScamOfficial: "@{handle} — официальный аккаунт USD8 в {platform}.", antiScamUnknown: "@{handle} — не является официальным аккаунтом USD8 в {platform}. Скорее всего, это мошенники: не отправляйте средства, не подписывайте транзакции и никому не сообщайте свою сид-фразу.", antiScamUnavailable: "Не удалось выполнить проверку в этом браузере." },
        pt: { invalidAddress: "Digite um endereço Ethereum válido.", checking: "Verificando...", noBoosters: "Nenhum Booster encontrado para este endereço.", found_one: "Parabéns! Você tem {count} Booster.", found_many: "Parabéns! Você tem {count} Boosters.", found_other: "Parabéns! Você tem {count} Boosters.", error: "Erro: {message}", fetchFailed: "não foi possível consultar o saldo", executed: "Executada", cancelled: "Cancelada", queued: "Na fila · {time}", ready: "Pronta para execução", executableFrom: "Executável a partir de {date}", transaction: "Transação", description: "Descrição", status: "Status", empty: "Ainda não há transações no Timelock", loading: "Carregando", loadFailed: "Não foi possível carregar as transações do Timelock", retry: "Tentar novamente", hoursLeft: "executável em {n} h", minutesLeft: "executável em {n} min", antiScamInvalid: "Digite um nome de usuário válido do {platform}.", antiScamOfficial: "@{handle} é uma conta oficial do USD8 no {platform}.", antiScamUnknown: "@{handle} não é uma conta oficial do USD8 no {platform}. Trate como um provável golpe: não envie fundos, não assine transações e não compartilhe sua frase de recuperação.", antiScamUnavailable: "Não foi possível fazer a verificação neste navegador." },
        fr: { invalidAddress: "Saisissez une adresse Ethereum valide.", checking: "Vérification…", noBoosters: "Aucun Booster trouvé pour cette adresse.", found_one: "Félicitations ! Vous avez {count} Booster.", found_many: "Félicitations ! Vous avez {count} de Boosters.", found_other: "Félicitations ! Vous avez {count} Boosters.", error: "Erreur : {message}", fetchFailed: "impossible de récupérer le solde", executed: "Exécutée", cancelled: "Annulée", queued: "Programmée · {time}", ready: "Prête à être exécutée", executableFrom: "Exécutable à partir de {date}", transaction: "Transaction", description: "Description", status: "Statut", empty: "Aucune transaction dans le Timelock pour le moment", loading: "Chargement", loadFailed: "Impossible de charger les transactions du Timelock", retry: "Réessayer", hoursLeft: "encore {n} h", minutesLeft: "encore {n} min", antiScamInvalid: "Saisissez un nom d’utilisateur {platform} valide.", antiScamOfficial: "@{handle} est un compte {platform} officiel d’USD8.", antiScamUnknown: "@{handle} n’est pas un compte {platform} officiel d’USD8. Considérez-le comme une arnaque probable\u00a0: n’envoyez pas de fonds, ne signez aucune transaction et ne communiquez jamais votre phrase de récupération.", antiScamUnavailable: "Impossible d’effectuer la vérification dans ce navigateur." },
        tr: { invalidAddress: "Geçerli bir Ethereum adresi girin.", checking: "Sorgulanıyor...", noBoosters: "Bu adreste Booster bulunamadı.", found_one: "Tebrikler! {count} Booster'ınız var.", found_other: "Tebrikler! {count} Booster'ınız var.", error: "Hata: {message}", fetchFailed: "bakiye alınamadı", executed: "Yürütüldü", cancelled: "İptal Edildi", queued: "Kuyrukta · {time}", ready: "Yürütülmeye Hazır", executableFrom: "Yürütülebileceği tarih: {date}", transaction: "İşlem", description: "Açıklama", status: "Durum", empty: "Henüz Timelock işlemi yok", loading: "Yükleniyor", loadFailed: "Timelock işlemleri yüklenemedi", retry: "Tekrar Dene", hoursLeft: "{n} sa kaldı", minutesLeft: "{n} dk kaldı", antiScamInvalid: "Geçerli bir {platform} kullanıcı adı girin.", antiScamOfficial: "@{handle} resmî bir USD8 {platform} hesabıdır.", antiScamUnknown: "@{handle} resmî bir USD8 {platform} hesabı değildir. Büyük olasılıkla dolandırıcılıktır: para göndermeyin, işlem imzalamayın ve kurtarma ifadenizi paylaşmayın.", antiScamUnavailable: "Bu tarayıcıda kontrol yapılamadı." },
        vi: { invalidAddress: "Hãy nhập một địa chỉ Ethereum hợp lệ.", checking: "Đang kiểm tra...", noBoosters: "Không tìm thấy Booster nào cho địa chỉ này.", found_one: "Chúc mừng! Bạn đang có {count} Booster.", found_other: "Chúc mừng! Bạn đang có {count} Booster.", error: "Lỗi: {message}", fetchFailed: "không lấy được số dư", executed: "Đã thực thi", cancelled: "Đã hủy", queued: "Đã lên lịch · {time}", ready: "Sẵn sàng thực thi", executableFrom: "Có thể thực thi từ {date}", transaction: "Giao dịch", description: "Mô tả", status: "Trạng thái", empty: "Chưa có giao dịch Timelock nào", loading: "Đang tải", loadFailed: "Không tải được các giao dịch Timelock", retry: "Thử lại", hoursLeft: "còn {n} giờ", minutesLeft: "còn {n} phút", antiScamInvalid: "Hãy nhập tên người dùng {platform} hợp lệ.", antiScamOfficial: "@{handle} là tài khoản {platform} chính thức của USD8.", antiScamUnknown: "@{handle} không phải tài khoản {platform} chính thức của USD8. Nhiều khả năng đây là lừa đảo: đừng gửi tiền, đừng ký giao dịch và đừng chia sẻ cụm từ khôi phục của bạn.", antiScamUnavailable: "Không thể kiểm tra trên trình duyệt này." },
        id: { invalidAddress: "Masukkan alamat Ethereum yang valid.", checking: "Mengecek...", noBoosters: "Tidak ada Booster di alamat ini.", found_one: "Selamat! Anda memiliki {count} Booster.", found_other: "Selamat! Anda memiliki {count} Booster.", error: "Kesalahan: {message}", fetchFailed: "saldo gagal diambil", executed: "Dieksekusi", cancelled: "Dibatalkan", queued: "Dalam antrean · {time}", ready: "Siap Dieksekusi", executableFrom: "Dapat dieksekusi mulai {date}", transaction: "Transaksi", description: "Deskripsi", status: "Status", empty: "Belum ada transaksi timelock", loading: "Memuat", loadFailed: "Transaksi timelock gagal dimuat", retry: "Coba Lagi", hoursLeft: "sisa {n} jam", minutesLeft: "sisa {n} mnt", antiScamInvalid: "Masukkan nama pengguna {platform} yang valid.", antiScamOfficial: "@{handle} adalah akun {platform} resmi USD8.", antiScamUnknown: "@{handle} bukan akun {platform} resmi USD8. Anggap ini kemungkinan besar penipuan: jangan kirim dana, jangan tanda tangani transaksi, dan jangan bagikan frasa pemulihan Anda.", antiScamUnavailable: "Pemeriksaan tidak dapat dijalankan di browser ini." },
        uk: { invalidAddress: "Введіть коректну адресу Ethereum.", checking: "Перевіряємо…", noBoosters: "На цій адресі немає бустерів.", found_one: "Вітаємо! У вас {count} бустер.", found_few: "Вітаємо! У вас {count} бустери.", found_many: "Вітаємо! У вас {count} бустерів.", found_other: "Вітаємо! У вас {count} бустера.", error: "Помилка: {message}", fetchFailed: "не вдалося отримати баланс", executed: "Виконано", cancelled: "Скасовано", queued: "У черзі · {time}", ready: "Можна виконати", executableFrom: "Можна виконати з {date}", transaction: "Транзакція", description: "Опис", status: "Статус", empty: "Транзакцій у черзі таймлоку поки немає", loading: "Завантаження", loadFailed: "Не вдалося завантажити транзакції таймлоку", retry: "Повторити", hoursLeft: "ще {n} год", minutesLeft: "ще {n} хв", antiScamInvalid: "Введіть коректне ім’я користувача {platform}.", antiScamOfficial: "@{handle} — офіційний акаунт USD8 у {platform}.", antiScamUnknown: "@{handle} — не є офіційним акаунтом USD8 у {platform}. Найімовірніше, це шахраї: не надсилайте кошти, не підписуйте транзакції й нікому не повідомляйте свою сід-фразу.", antiScamUnavailable: "Не вдалося виконати перевірку в цьому браузері." },
        th: { invalidAddress: "โปรดใส่ที่อยู่ Ethereum ที่ถูกต้อง", checking: "กำลังตรวจสอบ...", noBoosters: "ไม่พบบูสเตอร์ในที่อยู่นี้", found_one: "ยินดีด้วย! คุณมีบูสเตอร์ {count} ชิ้น", found_other: "ยินดีด้วย! คุณมีบูสเตอร์ {count} ชิ้น", error: "ข้อผิดพลาด: {message}", fetchFailed: "ดึงยอดคงเหลือไม่ได้", executed: "ดำเนินการแล้ว", cancelled: "ยกเลิกแล้ว", queued: "รอคิว · {time}", ready: "พร้อมดำเนินการ", executableFrom: "ดำเนินการได้ตั้งแต่ {date}", transaction: "ธุรกรรม", description: "รายละเอียด", status: "สถานะ", empty: "ยังไม่มีธุรกรรมใน Timelock", loading: "กำลังโหลด", loadFailed: "โหลดธุรกรรมของ Timelock ไม่ได้", retry: "ลองอีกครั้ง", hoursLeft: "เหลือ {n} ชม.", minutesLeft: "เหลือ {n} นาที", antiScamInvalid: "โปรดใส่ชื่อผู้ใช้ {platform} ที่ถูกต้อง", antiScamOfficial: "@{handle} เป็นบัญชี {platform} ทางการของ USD8", antiScamUnknown: "@{handle} ไม่ใช่บัญชี {platform} ทางการของ USD8 ให้ถือว่าน่าจะเป็นมิจฉาชีพ: อย่าโอนเงิน อย่าลงนามธุรกรรม และอย่าเปิดเผยวลีกู้คืนของคุณ", antiScamUnavailable: "ไม่สามารถตรวจสอบบนเบราว์เซอร์นี้ได้" },
        ar: { invalidAddress: "أدخِل عنوان Ethereum صالحًا.", checking: "جارٍ التحقق…", noBoosters: "لا توجد معززات لهذا العنوان.", found_zero: "لا توجد لديك معززات.", found_one: "تهانينا! لديك معزز واحد.", found_two: "تهانينا! لديك معززان.", found_few: "تهانينا! لديك {count} معززات.", found_many: "تهانينا! لديك {count} معززًا.", found_other: "تهانينا! لديك {count} معزز.", error: "خطأ: {message}", fetchFailed: "تعذّر جلب الرصيد", executed: "نُفّذت", cancelled: "أُلغيت", queued: "مجدولة · {time}", ready: "جاهزة للتنفيذ", executableFrom: "قابلة للتنفيذ اعتبارًا من {date}", transaction: "المعاملة", description: "الوصف", status: "الحالة", empty: "لا توجد معاملات في القفل الزمني بعد", loading: "جارٍ التحميل", loadFailed: "تعذّر تحميل معاملات القفل الزمني", retry: "إعادة المحاولة", hoursLeft: "يتبقى {n} س", minutesLeft: "يتبقى {n} د", antiScamInvalid: "أدخِل اسم مستخدم صالحًا على {platform}.", antiScamOfficial: "\u2066@{handle}\u2069 حساب رسمي لـ\u00a0USD8 على {platform}.", antiScamUnknown: "\u2066@{handle}\u2069 ليس حسابًا رسميًا لـ\u00a0USD8 على {platform}. تعامل معه على أنه احتيال محتمل: لا ترسل أموالًا، ولا توقّع أي معاملة، ولا تشارك عبارة الاسترداد الخاصة بك.", antiScamUnavailable: "تعذّر إجراء التحقق في هذا المتصفح." },
        fa: { invalidAddress: "یک آدرس Ethereum معتبر وارد کنید.", checking: "در حال بررسی…", noBoosters: "هیچ بوستری برای این آدرس پیدا نشد.", found_one: "تبریک! شما {count} بوستر دارید.", found_other: "تبریک! شما {count} بوستر دارید.", error: "خطا: {message}", fetchFailed: "دریافت موجودی ممکن نشد", executed: "اجراشده", cancelled: "لغوشده", queued: "در صف · {time}", ready: "آماده‌ی اجرا", executableFrom: "قابل اجرا از {date}", transaction: "تراکنش", description: "توضیحات", status: "وضعیت", empty: "هنوز تراکنشی در قفل زمانی ثبت نشده است", loading: "در حال بارگذاری", loadFailed: "تراکنش‌های قفل زمانی بارگذاری نشد", retry: "تلاش دوباره", hoursLeft: "{n} ساعت مانده", minutesLeft: "{n} دقیقه مانده", antiScamInvalid: "یک نام کاربری معتبر در {platform} وارد کنید.", antiScamOfficial: "\u2066@{handle}\u2069 حساب رسمی USD8 در {platform} است.", antiScamUnknown: "\u2066@{handle}\u2069 حساب رسمی USD8 در {platform} نیست. احتمالاً کلاهبرداری است: پولی نفرستید، هیچ تراکنشی را امضا نکنید و عبارت بازیابی خود را به کسی ندهید.", antiScamUnavailable: "بررسی در این مرورگر ممکن نشد." }
    };
    window.usd8DocsText = function (key, vars) {
        var table = WIDGET_TEXT[DOC_LANG] || WIDGET_TEXT.en;
        if (vars && typeof vars.count === "number" && WIDGET_TEXT.en[key + "_other"]) {
            var form = "other";
            try { form = new Intl.PluralRules(document.documentElement.lang || "en").select(vars.count); } catch (_) {}
            key = table[key + "_" + form] ? key + "_" + form : key + "_other";
        }
        var text = table[key] || WIDGET_TEXT.en[key] || key;
        return text.replace(/\{(\w+)\}/g, function (match, name) { return vars && vars[name] !== undefined ? String(vars[name]) : match; });
    };

    function injectLanguagePicker() {
        // The theme hides .right-buttons, so the menu sits directly in the bar, pushed right.
        var bar = document.getElementById("mdbook-menu-bar") || document.getElementById("menu-bar");
        if (!bar || bar.querySelector(".docs-language-select")) return;
        var select = document.createElement("select");
        select.className = "docs-language-select";
        select.setAttribute("aria-label", uiText("language"));
        DOC_LANGUAGES.forEach(function (pair) {
            var option = document.createElement("option");
            option.value = pair[0];
            option.textContent = pair[1];
            if (pair[0] === DOC_LANG) option.selected = true;
            select.appendChild(option);
        });
        select.addEventListener("change", function () {
            var where = docsLocation();
            try { localStorage.setItem("usd8.language", select.value); } catch (_) {}
            window.location.href = where.base + (select.value === "en" ? "" : select.value + "/") + where.page + window.location.hash;
        });
        bar.appendChild(select);
    }

    function injectAppLink() {
        var chapter = document.querySelector("#mdbook-sidebar .chapter");
        if (!chapter || chapter.querySelector(".sidebar-app-link")) return;

        var item = document.createElement("li");
        item.className = "chapter-item sidebar-app-link";

        var wrapper = document.createElement("span");
        wrapper.className = "chapter-link-wrapper";

        var link = document.createElement("a");
        link.href = "/";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = uiText("app");
        var externalIcon = document.createElement("span");
        externalIcon.className = "sidebar-external-icon";
        externalIcon.setAttribute("aria-hidden", "true");
        externalIcon.textContent = "↗";
        link.appendChild(externalIcon);
        wrapper.appendChild(link);
        item.appendChild(wrapper);
        chapter.appendChild(item);
    }

    function addSocialLink(container, className, href, label, glyph) {
        var link = document.createElement("a");
        link.className = className;
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", label);

        var mark = document.createElement("span");
        mark.setAttribute("aria-hidden", "true");
        if (className === "sidebar-x") {
            mark.className = "x-mark";
        } else {
            mark.textContent = glyph;
        }
        link.appendChild(mark);
        container.appendChild(link);
    }

    function injectSocialLinks() {
        var sidebar = document.getElementById("mdbook-sidebar");
        if (!sidebar || sidebar.querySelector(".sidebar-social")) return;

        var social = document.createElement("div");
        social.className = "sidebar-social";
        addSocialLink(social, "sidebar-telegram", "https://t.me/+e84i2oYk1ao1MTk1", "Join our Telegram", "");
        addSocialLink(social, "sidebar-x", "https://x.com/usd8_fi", "Visit our X account", "");
        addSocialLink(social, "sidebar-github", "https://github.com/Usd8-fi", "Visit our GitHub", "");
        sidebar.appendChild(social);
    }

    function initializeFaqs() {
        var title = document.querySelector(".faq-title");
        if (!title) return;

        for (var element = title.nextElementSibling; element;) {
            if (element.tagName !== "H2") {
                element = element.nextElementSibling;
                continue;
            }

            var question = element;
            var answer = document.createElement("div");
            answer.className = "faq-answer";
            answer.hidden = true;

            var next = question.nextElementSibling;
            while (next && next.tagName !== "H2") {
                var following = next.nextElementSibling;
                answer.appendChild(next);
                next = following;
            }
            question.after(answer);

            var link = question.querySelector("a.header");
            if (link) {
                link.classList.add("faq-question");
                link.setAttribute("role", "button");
                link.setAttribute("aria-expanded", "false");
                link.addEventListener("click", function (event) {
                    event.preventDefault();
                    var expanded = this.getAttribute("aria-expanded") === "true";
                    this.setAttribute("aria-expanded", String(!expanded));
                    this.closest("h2").nextElementSibling.hidden = expanded;
                });
            }

            element = next;
        }
    }

    function expandFaqFromHash() {
        if (!window.location.hash) return;

        var id;
        try {
            id = decodeURIComponent(window.location.hash.slice(1));
        } catch (_) {
            return;
        }

        var question = document.getElementById(id);
        if (!question || question.tagName !== "H2") return;

        var link = question.querySelector("a.faq-question");
        var answer = question.nextElementSibling;
        if (!link || !answer || !answer.classList.contains("faq-answer")) return;

        link.setAttribute("aria-expanded", "true");
        answer.hidden = false;
    }

    // Anything that leaves the docs (other sites, Etherscan, and the app
    // itself) opens in a new tab; links between docs pages stay in place.
    function isOutsideDocs(link) {
        var href = link.getAttribute("href");
        if (!href || href.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(href)) return false;
        var url;
        try {
            url = new URL(link.href, window.location.href);
        } catch (error) {
            return false;
        }
        if (url.origin !== window.location.origin) return true;
        return url.pathname.indexOf("/docs/") !== 0;
    }

    function openOutsideLinksInNewTab(root) {
        root.querySelectorAll("a[href]").forEach(function (link) {
            if (!isOutsideDocs(link)) return;
            link.setAttribute("target", "_blank");
            if (!link.hasAttribute("rel")) link.setAttribute("rel", "noreferrer");
        });
    }

    function initialize() {
        injectSidebarLogo();
        injectAppLink();
        injectLanguagePicker();
        injectSocialLinks();
        openOutsideLinksInNewTab(document);
        initializeFaqs();
        expandFaqFromHash();
    }

    window.addEventListener("hashchange", expandFaqFromHash);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
