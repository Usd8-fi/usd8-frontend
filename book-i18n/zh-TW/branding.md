# 品牌與素材 {#branding-and-assets}

任何人在提及USD8時，都可以免費使用USD8標誌和「Covered by USD8」徽章。請在下方下載SVG檔案，使用時保持原有的顏色和比例，並在標誌周圍留出足夠的空白。

## 標誌 {#logos}

<div class="brand-assets">
<figure class="brand-asset brand-asset-coin">
<img src="../assets/brand/usd8-logo.svg" width="96" height="96" alt="USD8硬幣">
<figcaption>USD8硬幣 <a href="../assets/brand/usd8-logo.svg" download>下載SVG</a></figcaption>
</figure>
</div>

<div class="brand-assets">
<figure class="brand-asset">
<div class="brand-swatch brand-swatch-dark"><img src="../assets/brand/usd8-logo-wordmark-on-dark.svg" width="188" height="56" alt="硬幣加文字，適用於深色背景"></div>
<figcaption>硬幣加文字，適用於深色背景 <a href="../assets/brand/usd8-logo-wordmark-on-dark.svg" download>下載SVG</a></figcaption>
</figure>
<figure class="brand-asset">
<div class="brand-swatch brand-swatch-light"><img src="../assets/brand/usd8-logo-wordmark-on-light.svg" width="188" height="56" alt="硬幣加文字，適用於淺色背景"></div>
<figcaption>硬幣加文字，適用於淺色背景 <a href="../assets/brand/usd8-logo-wordmark-on-light.svg" download>下載SVG</a></figcaption>
</figure>
</div>

## 「Covered by USD8」徽章 {#covered-by-usd8-badge}

代幣受USD8保障的合作夥伴，可以在自己的網站上展示這個徽章，並連結到https://usd8.fi。

<div class="brand-assets">
<figure class="brand-asset">
<div class="brand-swatch brand-swatch-dark"><a class="brand-badge-link" href="https://usd8.fi" target="_blank" rel="noopener"><img src="../assets/brand/covered-by-usd8-dark.svg" width="159" height="32" alt="Covered by USD8"></a></div>
<figcaption>小型徽章，深色 <a href="../assets/brand/covered-by-usd8-dark.svg" download>下載SVG</a></figcaption>
</figure>
<figure class="brand-asset">
<div class="brand-swatch brand-swatch-light"><a class="brand-badge-link" href="https://usd8.fi" target="_blank" rel="noopener"><img src="../assets/brand/covered-by-usd8-light.svg" width="159" height="32" alt="Covered by USD8"></a></div>
<figcaption>小型徽章，淺色 <a href="../assets/brand/covered-by-usd8-light.svg" download>下載SVG</a></figcaption>
</figure>
</div>

嵌入小型徽章時，把下面的程式碼貼到你的網頁：

```html
<a href="https://usd8.fi" target="_blank" rel="noopener">
  <img src="https://usd8.fi/assets/brand/covered-by-usd8-dark.svg"
       alt="Covered by USD8" width="159" height="32">
</a>
```

<div class="brand-assets">
<figure class="brand-asset">
<div class="brand-swatch brand-swatch-dark"><a class="brand-badge-link" href="https://usd8.fi" target="_blank" rel="noopener"><img src="../assets/brand/covered-by-usd8-medium-dark.svg" width="148" height="89" alt="Covered by USD8"></a></div>
<figcaption>中型徽章，深色 <a href="../assets/brand/covered-by-usd8-medium-dark.svg" download>下載SVG</a></figcaption>
</figure>
<figure class="brand-asset">
<div class="brand-swatch brand-swatch-light"><a class="brand-badge-link" href="https://usd8.fi" target="_blank" rel="noopener"><img src="../assets/brand/covered-by-usd8-medium-light.svg" width="148" height="89" alt="Covered by USD8"></a></div>
<figcaption>中型徽章，淺色 <a href="../assets/brand/covered-by-usd8-medium-light.svg" download>下載SVG</a></figcaption>
</figure>
</div>

嵌入中型徽章時，請改用這段程式碼：

```html
<a href="https://usd8.fi" target="_blank" rel="noopener">
  <img src="https://usd8.fi/assets/brand/covered-by-usd8-medium-dark.svg"
       alt="Covered by USD8" width="148" height="89">
</a>
```

如需任一徽章的淺色版本，把檔名中的`dark`改為`light`即可。

## 防詐騙查核 {#anti-scam-check}

有人自稱來自USD8並與你聯絡？在下方輸入對方的使用者名稱，確認是否為USD8官方帳號。

<div class="anti-scam-check" data-platform="telegram">
<label for="anti-scam-telegram">Telegram</label>
<div class="anti-scam-row">
<span class="anti-scam-field" dir="ltr"><span class="anti-scam-prefix" aria-hidden="true">@</span><input id="anti-scam-telegram" type="text" placeholder="使用者名稱" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="64"></span>
<button type="button">查核</button>
</div>
<div class="anti-scam-result" role="status" aria-live="polite"></div>
</div>

<div class="anti-scam-check" data-platform="x">
<label for="anti-scam-x">X (Twitter)</label>
<div class="anti-scam-row">
<span class="anti-scam-field" dir="ltr"><span class="anti-scam-prefix" aria-hidden="true">@</span><input id="anti-scam-x" type="text" placeholder="使用者名稱" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="64"></span>
<button type="button">查核</button>
</div>
<div class="anti-scam-result" role="status" aria-live="polite"></div>
</div>

<div class="anti-scam-check" data-platform="email">
<label for="anti-scam-email">電子郵件</label>
<div class="anti-scam-row">
<span class="anti-scam-field" dir="ltr"><input id="anti-scam-email" type="text" inputmode="email" placeholder="name@example.com" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="254"></span>
<button type="button">查核</button>
</div>
<div class="anti-scam-result" role="status" aria-live="polite"></div>
</div>

詐騙者常會照抄真實的名稱和頭像，只把使用者名稱改動一個字母、數字或底線，所以請逐字核對使用者名稱，而不是只看顯示名稱。USD8絕不會向你索取助記詞或私鑰，也不會要求你轉帳到任何地址。
