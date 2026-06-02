import{t as e}from"./SwapController-drZgUoNx.js";import{F as t,I as n,K as r,Y as i,Z as a,_ as o,bt as s,c,d as l,ft as u,g as d,l as f,lt as p,m,p as h,s as g,ut as _,y as v}from"./index-fbLSaq3c.js";import"./wui-token-button-zdHuTJkr.js";var y={numericInputKeyDown(e,t,n){let r=[`Backspace`,`Meta`,`Ctrl`,`a`,`A`,`c`,`C`,`x`,`X`,`v`,`V`,`ArrowLeft`,`ArrowRight`,`Tab`],i=e.metaKey||e.ctrlKey,a=e.key,o=a.toLocaleLowerCase(),s=o===`a`,c=o===`c`,l=o===`v`,u=o===`x`,d=a===`,`,f=a===`.`,p=a>=`0`&&a<=`9`;!i&&(s||c||l||u)&&e.preventDefault(),t===`0`&&!d&&!f&&a===`0`&&e.preventDefault(),t===`0`&&p&&(n(a),e.preventDefault()),(d||f)&&(t||(n(`0.`),e.preventDefault()),(t?.includes(`.`)||t?.includes(`,`))&&e.preventDefault()),!p&&!r.includes(a)&&!f&&!d&&e.preventDefault()}},b=m`
  :host {
    width: 100%;
  }

  .details-container > wui-flex {
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[3]};
    width: 100%;
  }

  .details-container > wui-flex > button {
    border: none;
    background: none;
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
    cursor: pointer;
  }

  .details-content-container {
    padding: ${({spacing:e})=>e[2]};
    padding-top: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .details-content-container > wui-flex {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: ${({spacing:e})=>e[3]};
    padding-left: ${({spacing:e})=>e[3]};
    padding-right: ${({spacing:e})=>e[2]};
    border-radius: calc(
      ${({borderRadius:e})=>e[1]} + ${({borderRadius:e})=>e[1]}
    );
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .details-row-title {
    white-space: nowrap;
  }

  .details-row.provider-free-row {
    padding-right: ${({spacing:e})=>e[2]};
  }
`,x=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},S=u.CONVERT_SLIPPAGE_TOLERANCE,C=class extends d{constructor(){super(),this.unsubscribe=[],this.networkName=n.state.activeCaipNetwork?.name,this.detailsOpen=!1,this.sourceToken=e.state.sourceToken,this.toToken=e.state.toToken,this.toTokenAmount=e.state.toTokenAmount,this.sourceTokenPriceInUSD=e.state.sourceTokenPriceInUSD,this.toTokenPriceInUSD=e.state.toTokenPriceInUSD,this.priceImpact=e.state.priceImpact,this.maxSlippage=e.state.maxSlippage,this.networkTokenSymbol=e.state.networkTokenSymbol,this.inputError=e.state.inputError,this.unsubscribe.push(e.subscribe(e=>{this.sourceToken=e.sourceToken,this.toToken=e.toToken,this.toTokenAmount=e.toTokenAmount,this.priceImpact=e.priceImpact,this.maxSlippage=e.maxSlippage,this.sourceTokenPriceInUSD=e.sourceTokenPriceInUSD,this.toTokenPriceInUSD=e.toTokenPriceInUSD,this.inputError=e.inputError}))}render(){let e=this.toTokenAmount&&this.maxSlippage?s.bigNumber(this.toTokenAmount).minus(this.maxSlippage).toString():null;if(!this.sourceToken||!this.toToken||this.inputError)return null;let t=this.sourceTokenPriceInUSD&&this.toTokenPriceInUSD?1/this.toTokenPriceInUSD*this.sourceTokenPriceInUSD:0;return o`
      <wui-flex flexDirection="column" alignItems="center" gap="01" class="details-container">
        <wui-flex flexDirection="column">
          <button @click=${this.toggleDetails.bind(this)}>
            <wui-flex justifyContent="space-between" .padding=${[`0`,`2`,`0`,`2`]}>
              <wui-flex justifyContent="flex-start" flexGrow="1" gap="2">
                <wui-text variant="sm-regular" color="primary">
                  1 ${this.sourceToken.symbol} =
                  ${s.formatNumberToLocalString(t,3)}
                  ${this.toToken.symbol}
                </wui-text>
                <wui-text variant="sm-regular" color="secondary">
                  $${s.formatNumberToLocalString(this.sourceTokenPriceInUSD)}
                </wui-text>
              </wui-flex>
              <wui-icon name="chevronBottom"></wui-icon>
            </wui-flex>
          </button>
          ${this.detailsOpen?o`
                <wui-flex flexDirection="column" gap="2" class="details-content-container">
                  ${this.priceImpact?o` <wui-flex flexDirection="column" gap="2">
                        <wui-flex
                          justifyContent="space-between"
                          alignItems="center"
                          class="details-row"
                        >
                          <wui-flex alignItems="center" gap="2">
                            <wui-text
                              class="details-row-title"
                              variant="sm-regular"
                              color="secondary"
                            >
                              Price impact
                            </wui-text>
                            <w3m-tooltip-trigger
                              text="Price impact reflects the change in market price due to your trade"
                            >
                              <wui-icon size="sm" color="default" name="info"></wui-icon>
                            </w3m-tooltip-trigger>
                          </wui-flex>
                          <wui-flex>
                            <wui-text variant="sm-regular" color="secondary">
                              ${s.formatNumberToLocalString(this.priceImpact,3)}%
                            </wui-text>
                          </wui-flex>
                        </wui-flex>
                      </wui-flex>`:null}
                  ${this.maxSlippage&&this.sourceToken.symbol?o`<wui-flex flexDirection="column" gap="2">
                        <wui-flex
                          justifyContent="space-between"
                          alignItems="center"
                          class="details-row"
                        >
                          <wui-flex alignItems="center" gap="2">
                            <wui-text
                              class="details-row-title"
                              variant="sm-regular"
                              color="secondary"
                            >
                              Max. slippage
                            </wui-text>
                            <w3m-tooltip-trigger
                              text=${`Max slippage sets the minimum amount you must receive for the transaction to proceed. ${e?`Transaction will be reversed if you receive less than ${s.formatNumberToLocalString(e,6)} ${this.toToken.symbol} due to price changes.`:``}`}
                            >
                              <wui-icon size="sm" color="default" name="info"></wui-icon>
                            </w3m-tooltip-trigger>
                          </wui-flex>
                          <wui-flex>
                            <wui-text variant="sm-regular" color="secondary">
                              ${s.formatNumberToLocalString(this.maxSlippage,6)}
                              ${this.toToken.symbol} ${S}%
                            </wui-text>
                          </wui-flex>
                        </wui-flex>
                      </wui-flex>`:null}
                  <wui-flex flexDirection="column" gap="2">
                    <wui-flex
                      justifyContent="space-between"
                      alignItems="center"
                      class="details-row provider-free-row"
                    >
                      <wui-flex alignItems="center" gap="2">
                        <wui-text class="details-row-title" variant="sm-regular" color="secondary">
                          Provider fee
                        </wui-text>
                      </wui-flex>
                      <wui-flex>
                        <wui-text variant="sm-regular" color="secondary">0.85%</wui-text>
                      </wui-flex>
                    </wui-flex>
                  </wui-flex>
                </wui-flex>
              `:null}
        </wui-flex>
      </wui-flex>
    `}toggleDetails(){this.detailsOpen=!this.detailsOpen}};C.styles=[b],x([g()],C.prototype,`networkName`,void 0),x([c()],C.prototype,`detailsOpen`,void 0),x([g()],C.prototype,`sourceToken`,void 0),x([g()],C.prototype,`toToken`,void 0),x([g()],C.prototype,`toTokenAmount`,void 0),x([g()],C.prototype,`sourceTokenPriceInUSD`,void 0),x([g()],C.prototype,`toTokenPriceInUSD`,void 0),x([g()],C.prototype,`priceImpact`,void 0),x([g()],C.prototype,`maxSlippage`,void 0),x([g()],C.prototype,`networkTokenSymbol`,void 0),x([g()],C.prototype,`inputError`,void 0),C=x([f(`w3m-swap-details`)],C);var w=m`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-radius: ${({borderRadius:e})=>e[5]};
    padding: ${({spacing:e})=>e[5]};
    padding-right: ${({spacing:e})=>e[3]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow: inset 0px 0px 0px 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    width: 100%;
    height: 100px;
    box-sizing: border-box;
    position: relative;
  }

  wui-shimmer.market-value {
    opacity: 0;
  }

  :host > wui-flex > svg.input_mask {
    position: absolute;
    inset: 0;
    z-index: 5;
  }

  :host wui-flex .input_mask__border,
  :host wui-flex .input_mask__background {
    transition: fill ${({durations:e})=>e.md}
      ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: fill;
  }

  :host wui-flex .input_mask__border {
    fill: ${({tokens:e})=>e.core.glass010};
  }

  :host wui-flex .input_mask__background {
    fill: ${({tokens:e})=>e.theme.foregroundPrimary};
  }
`,T=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},E=class extends d{constructor(){super(...arguments),this.target=`sourceToken`}render(){return o`
      <wui-flex class justifyContent="space-between">
        <wui-flex
          flex="1"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
          class="swap-input"
          gap="1"
        >
          <wui-shimmer width="80px" height="40px" rounded variant="light"></wui-shimmer>
        </wui-flex>
        ${this.templateTokenSelectButton()}
      </wui-flex>
    `}templateTokenSelectButton(){return o`
      <wui-flex
        class="swap-token-button"
        flexDirection="column"
        alignItems="flex-end"
        justifyContent="center"
        gap="1"
      >
        <wui-shimmer width="80px" height="40px" rounded variant="light"></wui-shimmer>
      </wui-flex>
    `}};E.styles=[w],T([c()],E.prototype,`target`,void 0),E=T([f(`w3m-swap-input-skeleton`)],E);var D=m`
  :host > wui-flex {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-radius: ${({borderRadius:e})=>e[5]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    padding: ${({spacing:e})=>e[5]};
    padding-right: ${({spacing:e})=>e[3]};
    width: 100%;
    height: 100px;
    box-sizing: border-box;
    box-shadow: inset 0px 0px 0px 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    position: relative;
    transition: box-shadow ${({easings:e})=>e[`ease-out-power-1`]}
      ${({durations:e})=>e.lg};
    will-change: background-color;
  }

  :host wui-flex.focus {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:e})=>e.core.glass010};
  }

  :host > wui-flex .swap-input,
  :host > wui-flex .swap-token-button {
    z-index: 10;
  }

  :host > wui-flex .swap-input {
    -webkit-mask-image: linear-gradient(
      270deg,
      transparent 0px,
      transparent 8px,
      black 24px,
      black 25px,
      black 32px,
      black 100%
    );
    mask-image: linear-gradient(
      270deg,
      transparent 0px,
      transparent 8px,
      black 24px,
      black 25px,
      black 32px,
      black 100%
    );
  }

  :host > wui-flex .swap-input input {
    background: none;
    border: none;
    height: 42px;
    width: 100%;
    font-size: 32px;
    font-style: normal;
    font-weight: 400;
    line-height: 130%;
    letter-spacing: -1.28px;
    outline: none;
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
    color: ${({tokens:e})=>e.theme.textPrimary};
    padding: 0px;
  }

  :host > wui-flex .swap-input input:focus-visible {
    outline: none;
  }

  :host > wui-flex .swap-input input::-webkit-outer-spin-button,
  :host > wui-flex .swap-input input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .max-value-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: ${({tokens:e})=>e.core.glass010};
    padding-left: 0px;
  }

  .market-value {
    min-height: 18px;
  }
`,O=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},k=5e-5,A=class extends d{constructor(){super(...arguments),this.focused=!1,this.price=0,this.target=`sourceToken`,this.onSetAmount=null,this.onSetMaxValue=null,this.autoFocus=!1}firstUpdated(){this.autoFocus&&requestAnimationFrame(()=>{(this.shadowRoot?.querySelector(`input`))?.focus()})}render(){let e=this.marketValue||`0`,t=s.bigNumber(e).gt(`0`);return o`
      <wui-flex
        class="${this.focused?`focus`:``}"
        justifyContent="space-between"
        alignItems="center"
      >
        <wui-flex
          flex="1"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
          class="swap-input"
        >
          <input
            data-testid="swap-input-${this.target}"
            @focusin=${()=>this.onFocusChange(!0)}
            @focusout=${()=>this.onFocusChange(!1)}
            ?disabled=${this.disabled}
            value=${this.value||``}
            @input=${this.dispatchInputChangeEvent}
            @keydown=${this.handleKeydown}
            placeholder="0"
            type="text"
            inputmode="decimal"
            pattern="[0-9,.]*"
          />
          <wui-text class="market-value" variant="sm-regular" color="secondary">
            ${t?`$${s.formatNumberToLocalString(this.marketValue,2)}`:null}
          </wui-text>
        </wui-flex>
        ${this.templateTokenSelectButton()}
      </wui-flex>
    `}handleKeydown(e){return y.numericInputKeyDown(e,this.value,e=>this.onSetAmount?.(this.target,e))}dispatchInputChangeEvent(e){if(!this.onSetAmount)return;let t=e.target.value.replace(/[^0-9.]/gu,``);t===`,`||t===`.`?this.onSetAmount(this.target,`0.`):t.endsWith(`,`)?this.onSetAmount(this.target,t.replace(`,`,`.`)):this.onSetAmount(this.target,t)}setMaxValueToInput(){this.onSetMaxValue?.(this.target,this.balance)}templateTokenSelectButton(){return this.token?o`
      <wui-flex
        class="swap-token-button"
        flexDirection="column"
        alignItems="flex-end"
        justifyContent="center"
        gap="1"
      >
        <wui-token-button
          data-testid="swap-input-token-${this.target}"
          text=${this.token.symbol}
          imageSrc=${this.token.logoUri}
          @click=${this.onSelectToken.bind(this)}
        >
        </wui-token-button>
        <wui-flex alignItems="center" gap="1"> ${this.tokenBalanceTemplate()} </wui-flex>
      </wui-flex>
    `:o` <wui-button
        data-testid="swap-select-token-button-${this.target}"
        class="swap-token-button"
        size="md"
        variant="neutral-secondary"
        @click=${this.onSelectToken.bind(this)}
      >
        Select token
      </wui-button>`}tokenBalanceTemplate(){let e=s.multiply(this.balance,this.price),t=e?e?.gt(k):!1;return o`
      ${t?o`<wui-text variant="sm-regular" color="secondary">
            ${s.formatNumberToLocalString(this.balance,2)}
          </wui-text>`:null}
      ${this.target===`sourceToken`?this.tokenActionButtonTemplate(t):null}
    `}tokenActionButtonTemplate(e){return e?o` <button class="max-value-button" @click=${this.setMaxValueToInput.bind(this)}>
        <wui-text color="accent-primary" variant="sm-medium">Max</wui-text>
      </button>`:o` <button class="max-value-button" @click=${this.onBuyToken.bind(this)}>
      <wui-text color="accent-primary" variant="sm-medium">Buy</wui-text>
    </button>`}onFocusChange(e){this.focused=e}onSelectToken(){a.sendEvent({type:`track`,event:`CLICK_SELECT_TOKEN_TO_SWAP`}),i.push(`SwapSelectToken`,{target:this.target})}onBuyToken(){i.push(`OnRampProviders`)}};A.styles=[D],O([c()],A.prototype,`focused`,void 0),O([c()],A.prototype,`balance`,void 0),O([c()],A.prototype,`value`,void 0),O([c()],A.prototype,`price`,void 0),O([c()],A.prototype,`marketValue`,void 0),O([c()],A.prototype,`disabled`,void 0),O([c()],A.prototype,`target`,void 0),O([c()],A.prototype,`token`,void 0),O([c()],A.prototype,`onSetAmount`,void 0),O([c()],A.prototype,`onSetMaxValue`,void 0),O([c({type:Boolean})],A.prototype,`autoFocus`,void 0),A=O([f(`w3m-swap-input`)],A);var j=m`
  :host > wui-flex:first-child {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .action-button {
    width: 100%;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  .action-button:disabled {
    border-color: 1px solid ${({tokens:e})=>e.core.glass010};
  }

  .swap-inputs-container {
    position: relative;
  }

  wui-icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e[10]} !important;
    border: 4px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }

  .replace-tokens-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    gap: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[4]};
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    padding: ${({spacing:e})=>e[2]};
  }

  .details-container > wui-flex {
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[3]};
    width: 100%;
  }

  .details-container > wui-flex > button {
    border: none;
    background: none;
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
    transition: background ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background;
  }

  .details-container > wui-flex > button:hover {
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .details-content-container {
    padding: ${({spacing:e})=>e[2]};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .details-content-container > wui-flex {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[5]};
    border-radius: ${({borderRadius:e})=>e[3]};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
  }
`,M=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},N=class extends d{subscribe({resetSwapState:e,initializeSwapState:t}){return()=>{n.subscribeKey(`activeCaipNetwork`,n=>this.onCaipNetworkChange({newCaipNetwork:n,resetSwapState:e,initializeSwapState:t})),n.subscribeChainProp(`accountState`,n=>{this.onCaipAddressChange({newCaipAddress:n?.caipAddress,resetSwapState:e,initializeSwapState:t})})}}constructor(){super(),this.unsubscribe=[],this.initialParams=i.state.data?.swap,this.detailsOpen=!1,this.caipAddress=n.getAccountData()?.caipAddress,this.caipNetworkId=n.state.activeCaipNetwork?.caipNetworkId,this.initialized=e.state.initialized,this.loadingQuote=e.state.loadingQuote,this.loadingPrices=e.state.loadingPrices,this.loadingTransaction=e.state.loadingTransaction,this.sourceToken=e.state.sourceToken,this.sourceTokenAmount=e.state.sourceTokenAmount,this.sourceTokenPriceInUSD=e.state.sourceTokenPriceInUSD,this.toToken=e.state.toToken,this.toTokenAmount=e.state.toTokenAmount,this.toTokenPriceInUSD=e.state.toTokenPriceInUSD,this.inputError=e.state.inputError,this.fetchError=e.state.fetchError,this.lastTokenPriceUpdate=0,this.minTokenPriceUpdateInterval=1e4,this.visibilityChangeHandler=()=>{document?.hidden?(clearInterval(this.interval),this.interval=void 0):this.startTokenPriceInterval()},this.startTokenPriceInterval=()=>{this.interval&&Date.now()-this.lastTokenPriceUpdate<this.minTokenPriceUpdateInterval||(this.lastTokenPriceUpdate&&Date.now()-this.lastTokenPriceUpdate>this.minTokenPriceUpdateInterval&&this.fetchTokensAndValues(),clearInterval(this.interval),this.interval=setInterval(()=>{this.fetchTokensAndValues()},this.minTokenPriceUpdateInterval))},this.watchTokensAndValues=()=>{!this.sourceToken||!this.toToken||(this.subscribeToVisibilityChange(),this.startTokenPriceInterval())},this.onDebouncedGetSwapCalldata=_.debounce(async()=>{await e.swapTokens()},200),this.subscribe({resetSwapState:!0,initializeSwapState:!1})(),this.unsubscribe.push(this.subscribe({resetSwapState:!1,initializeSwapState:!0}),t.subscribeKey(`open`,t=>{t||e.resetState()}),i.subscribeKey(`view`,t=>{t.includes(`Swap`)||e.resetValues()}),e.subscribe(e=>{this.initialized=e.initialized,this.loadingQuote=e.loadingQuote,this.loadingPrices=e.loadingPrices,this.loadingTransaction=e.loadingTransaction,this.sourceToken=e.sourceToken,this.sourceTokenAmount=e.sourceTokenAmount,this.sourceTokenPriceInUSD=e.sourceTokenPriceInUSD,this.toToken=e.toToken,this.toTokenAmount=e.toTokenAmount,this.toTokenPriceInUSD=e.toTokenPriceInUSD,this.inputError=e.inputError,this.fetchError=e.fetchError,e.sourceToken&&e.toToken&&this.watchTokensAndValues()}))}async firstUpdated(){e.initializeState(),this.watchTokensAndValues(),await this.handleSwapParameters()}disconnectedCallback(){this.unsubscribe.forEach(e=>e?.()),clearInterval(this.interval),document?.removeEventListener(`visibilitychange`,this.visibilityChangeHandler)}render(){return o`
      <wui-flex flexDirection="column" .padding=${[`0`,`4`,`4`,`4`]} gap="3">
        ${this.initialized?this.templateSwap():this.templateLoading()}
      </wui-flex>
    `}subscribeToVisibilityChange(){document?.removeEventListener(`visibilitychange`,this.visibilityChangeHandler),document?.addEventListener(`visibilitychange`,this.visibilityChangeHandler)}fetchTokensAndValues(){e.getNetworkTokenPrice(),e.getMyTokensWithBalance(),e.swapTokens(),this.lastTokenPriceUpdate=Date.now()}templateSwap(){return o`
      <wui-flex flexDirection="column" gap="3">
        <wui-flex flexDirection="column" alignItems="center" gap="2" class="swap-inputs-container">
          ${this.templateTokenInput(`sourceToken`,this.sourceToken)}
          ${this.templateTokenInput(`toToken`,this.toToken)} ${this.templateReplaceTokensButton()}
        </wui-flex>
        ${this.templateDetails()} ${this.templateActionButton()}
      </wui-flex>
    `}actionButtonLabel(){let e=!this.sourceTokenAmount||this.sourceTokenAmount===`0`;return this.fetchError?`Swap`:!this.sourceToken||!this.toToken?`Select token`:e?`Enter amount`:this.inputError?this.inputError:`Review swap`}templateReplaceTokensButton(){return o`
      <wui-flex class="replace-tokens-button-container">
        <wui-icon-box
          @click=${this.onSwitchTokens.bind(this)}
          icon="recycleHorizontal"
          size="md"
          variant="default"
        ></wui-icon-box>
      </wui-flex>
    `}templateLoading(){return o`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex flexDirection="column" alignItems="center" gap="2" class="swap-inputs-container">
          <w3m-swap-input-skeleton target="sourceToken"></w3m-swap-input-skeleton>
          <w3m-swap-input-skeleton target="toToken"></w3m-swap-input-skeleton>
          ${this.templateReplaceTokensButton()}
        </wui-flex>
        ${this.templateActionButton()}
      </wui-flex>
    `}templateTokenInput(t,n){let r=e.state.myTokensWithBalance?.find(e=>e?.address===n?.address),i=t===`toToken`?this.toTokenAmount:this.sourceTokenAmount,a=t===`toToken`?this.toTokenPriceInUSD:this.sourceTokenPriceInUSD,c=s.parseLocalStringToNumber(i)*a;return o`<w3m-swap-input
      .value=${t===`toToken`?this.toTokenAmount:this.sourceTokenAmount}
      .disabled=${t===`toToken`}
      .onSetAmount=${this.handleChangeAmount.bind(this)}
      target=${t}
      .token=${n}
      .balance=${r?.quantity?.numeric}
      .price=${r?.price}
      .marketValue=${c}
      .onSetMaxValue=${this.onSetMaxValue.bind(this)}
      ?autoFocus=${t===`sourceToken`}
    ></w3m-swap-input>`}onSetMaxValue(t,n){let r=s.bigNumber(n||`0`);if(!r.gt(0)){this.handleChangeAmount(t,`0`);return}let i=t===`sourceToken`?this.sourceToken:this.toToken,a=i?.decimals??18,{networkAddress:o}=e.getParams(),c=e.state.gasFee;if(t===`sourceToken`&&i?.address===o&&c&&c!==`0`){let e=150000n*BigInt(c),n=s.bigNumber(e.toString()).div(s.bigNumber(10).pow(a)),i=r.minus(n);this.handleChangeAmount(t,i.gt(0)?i.toFixed(a,0):`0`)}else this.handleChangeAmount(t,r.toFixed(a,0))}templateDetails(){return!this.sourceToken||!this.toToken||this.inputError?null:o`<w3m-swap-details .detailsOpen=${this.detailsOpen}></w3m-swap-details>`}handleChangeAmount(t,n){e.clearError(),t===`sourceToken`?e.setSourceTokenAmount(n):e.setToTokenAmount(n),this.onDebouncedGetSwapCalldata()}templateActionButton(){let e=!this.toToken||!this.sourceToken,t=!this.sourceTokenAmount||this.sourceTokenAmount===`0`,n=this.loadingQuote||this.loadingPrices||this.loadingTransaction,r=n||e||t||this.inputError;return o` <wui-flex gap="2">
      <wui-button
        data-testid="swap-action-button"
        class="action-button"
        fullWidth
        size="lg"
        borderRadius="xs"
        variant="accent-primary"
        ?loading=${!!n}
        ?disabled=${!!r}
        @click=${this.onSwapPreview.bind(this)}
      >
        ${this.actionButtonLabel()}
      </wui-button>
    </wui-flex>`}async onSwitchTokens(){await e.switchTokens()}async onSwapPreview(){this.fetchError&&await e.swapTokens(),a.sendEvent({type:`track`,event:`INITIATE_SWAP`,properties:{network:this.caipNetworkId||``,swapFromToken:this.sourceToken?.symbol||``,swapToToken:this.toToken?.symbol||``,swapFromAmount:this.sourceTokenAmount||``,swapToAmount:this.toTokenAmount||``,isSmartAccount:r(n.state.activeChain)===p.ACCOUNT_TYPES.SMART_ACCOUNT}}),i.push(`SwapPreview`)}async handleSwapParameters(){this.initialParams&&(e.state.initialized||await new Promise(t=>{let n=e.subscribeKey(`initialized`,e=>{e&&(n?.(),t())})}),await this.setSwapParameters(this.initialParams))}async setSwapParameters({amount:t,fromToken:n,toToken:r}){(!e.state.tokens||!e.state.myTokensWithBalance)&&await new Promise(t=>{let n=e.subscribeKey(`myTokensWithBalance`,e=>{e&&e.length>0&&(n?.(),t())});setTimeout(()=>{n?.(),t()},5e3)});let i=[...e.state.tokens||[],...e.state.myTokensWithBalance||[]];if(n){let t=i.find(e=>e.symbol.toLowerCase()===n.toLowerCase());t&&e.setSourceToken(t)}if(r){let t=i.find(e=>e.symbol.toLowerCase()===r.toLowerCase());t&&e.setToToken(t)}t&&!isNaN(Number(t))&&e.setSourceTokenAmount(t)}onCaipAddressChange({newCaipAddress:t,resetSwapState:n,initializeSwapState:r}){this.caipAddress!==t&&(this.caipAddress=t,n&&e.resetState(),r&&e.initializeState())}onCaipNetworkChange({newCaipNetwork:t,resetSwapState:n,initializeSwapState:r}){this.caipNetworkId!==t?.caipNetworkId&&(this.caipNetworkId=t?.caipNetworkId,n&&e.resetState(),r&&e.initializeState())}};N.styles=j,M([c({type:Object})],N.prototype,`initialParams`,void 0),M([g()],N.prototype,`interval`,void 0),M([g()],N.prototype,`detailsOpen`,void 0),M([g()],N.prototype,`caipAddress`,void 0),M([g()],N.prototype,`caipNetworkId`,void 0),M([g()],N.prototype,`initialized`,void 0),M([g()],N.prototype,`loadingQuote`,void 0),M([g()],N.prototype,`loadingPrices`,void 0),M([g()],N.prototype,`loadingTransaction`,void 0),M([g()],N.prototype,`sourceToken`,void 0),M([g()],N.prototype,`sourceTokenAmount`,void 0),M([g()],N.prototype,`sourceTokenPriceInUSD`,void 0),M([g()],N.prototype,`toToken`,void 0),M([g()],N.prototype,`toTokenAmount`,void 0),M([g()],N.prototype,`toTokenPriceInUSD`,void 0),M([g()],N.prototype,`inputError`,void 0),M([g()],N.prototype,`fetchError`,void 0),M([g()],N.prototype,`lastTokenPriceUpdate`,void 0),N=M([f(`w3m-swap-view`)],N);var P=m`
  :host > wui-flex:first-child {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }

  .preview-container,
  .details-container {
    width: 100%;
  }

  .token-image {
    width: 24px;
    height: 24px;
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.core.glass010};
    border-radius: 12px;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .token-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[2]};
    height: 40px;
    border: none;
    border-radius: 80px;
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    cursor: pointer;
    transition: background ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background;
  }

  .token-item:hover {
    background: ${({tokens:e})=>e.core.glass010};
  }

  .preview-token-details-container {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[5]};
    border-radius: ${({borderRadius:e})=>e[3]};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .action-buttons-container {
    width: 100%;
    gap: ${({spacing:e})=>e[2]};
  }

  .action-buttons-container > button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    height: 48px;
    border-radius: ${({borderRadius:e})=>e[4]};
    border: none;
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
  }

  .action-buttons-container > button:disabled {
    opacity: 0.8;
    cursor: not-allowed;
  }

  .action-button > wui-loading-spinner {
    display: inline-block;
  }

  .cancel-button:hover,
  .action-button:hover {
    cursor: pointer;
  }

  .action-buttons-container > wui-button.cancel-button {
    flex: 2;
  }

  .action-buttons-container > wui-button.action-button {
    flex: 4;
  }

  .action-buttons-container > button.action-button > wui-text {
    color: white;
  }

  .details-container > wui-flex {
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[3]};
    width: 100%;
  }

  .details-container > wui-flex > button {
    border: none;
    background: none;
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
    transition: background ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background;
  }

  .details-container > wui-flex > button:hover {
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .details-content-container {
    padding: ${({spacing:e})=>e[2]};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .details-content-container > wui-flex {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[5]};
    border-radius: ${({borderRadius:e})=>e[3]};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
  }
`,F=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},I=class extends d{constructor(){super(),this.unsubscribe=[],this.detailsOpen=!0,this.approvalTransaction=e.state.approvalTransaction,this.swapTransaction=e.state.swapTransaction,this.sourceToken=e.state.sourceToken,this.sourceTokenAmount=e.state.sourceTokenAmount??``,this.sourceTokenPriceInUSD=e.state.sourceTokenPriceInUSD,this.balanceSymbol=n.getAccountData()?.balanceSymbol,this.toToken=e.state.toToken,this.toTokenAmount=e.state.toTokenAmount??``,this.toTokenPriceInUSD=e.state.toTokenPriceInUSD,this.caipNetwork=n.state.activeCaipNetwork,this.inputError=e.state.inputError,this.loadingQuote=e.state.loadingQuote,this.loadingApprovalTransaction=e.state.loadingApprovalTransaction,this.loadingBuildTransaction=e.state.loadingBuildTransaction,this.loadingTransaction=e.state.loadingTransaction,this.unsubscribe.push(n.subscribeChainProp(`accountState`,e=>{e?.balanceSymbol!==this.balanceSymbol&&i.goBack()}),n.subscribeKey(`activeCaipNetwork`,e=>{this.caipNetwork!==e&&(this.caipNetwork=e)}),e.subscribe(e=>{this.approvalTransaction=e.approvalTransaction,this.swapTransaction=e.swapTransaction,this.sourceToken=e.sourceToken,this.toToken=e.toToken,this.toTokenPriceInUSD=e.toTokenPriceInUSD,this.sourceTokenAmount=e.sourceTokenAmount??``,this.toTokenAmount=e.toTokenAmount??``,this.inputError=e.inputError,e.inputError&&i.goBack(),this.loadingQuote=e.loadingQuote,this.loadingApprovalTransaction=e.loadingApprovalTransaction,this.loadingBuildTransaction=e.loadingBuildTransaction,this.loadingTransaction=e.loadingTransaction}))}firstUpdated(){e.getTransaction(),this.refreshTransaction()}disconnectedCallback(){this.unsubscribe.forEach(e=>e?.()),clearInterval(this.interval)}render(){return o`
      <wui-flex flexDirection="column" .padding=${[`0`,`4`,`4`,`4`]} gap="3">
        ${this.templateSwap()}
      </wui-flex>
    `}refreshTransaction(){this.interval=setInterval(()=>{e.getApprovalLoadingState()||e.getTransaction()},1e4)}templateSwap(){let e=`${s.formatNumberToLocalString(parseFloat(this.sourceTokenAmount))} ${this.sourceToken?.symbol}`,t=`${s.formatNumberToLocalString(parseFloat(this.toTokenAmount))} ${this.toToken?.symbol}`,n=parseFloat(this.sourceTokenAmount)*this.sourceTokenPriceInUSD,r=parseFloat(this.toTokenAmount)*this.toTokenPriceInUSD,i=s.formatNumberToLocalString(n),a=s.formatNumberToLocalString(r),c=this.loadingQuote||this.loadingBuildTransaction||this.loadingTransaction||this.loadingApprovalTransaction;return o`
      <wui-flex flexDirection="column" alignItems="center" gap="4">
        <wui-flex class="preview-container" flexDirection="column" alignItems="flex-start" gap="4">
          <wui-flex
            class="preview-token-details-container"
            alignItems="center"
            justifyContent="space-between"
            gap="4"
          >
            <wui-flex flexDirection="column" alignItems="flex-start" gap="01">
              <wui-text variant="sm-regular" color="secondary">Send</wui-text>
              <wui-text variant="md-regular" color="primary">$${i}</wui-text>
            </wui-flex>
            <wui-token-button
              flexDirection="row-reverse"
              text=${e}
              imageSrc=${this.sourceToken?.logoUri}
            >
            </wui-token-button>
          </wui-flex>
          <wui-icon name="recycleHorizontal" color="default" size="md"></wui-icon>
          <wui-flex
            class="preview-token-details-container"
            alignItems="center"
            justifyContent="space-between"
            gap="4"
          >
            <wui-flex flexDirection="column" alignItems="flex-start" gap="01">
              <wui-text variant="sm-regular" color="secondary">Receive</wui-text>
              <wui-text variant="md-regular" color="primary">$${a}</wui-text>
            </wui-flex>
            <wui-token-button
              flexDirection="row-reverse"
              text=${t}
              imageSrc=${this.toToken?.logoUri}
            >
            </wui-token-button>
          </wui-flex>
        </wui-flex>

        ${this.templateDetails()}

        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="2">
          <wui-icon size="sm" color="default" name="info"></wui-icon>
          <wui-text variant="sm-regular" color="secondary">Review transaction carefully</wui-text>
        </wui-flex>

        <wui-flex
          class="action-buttons-container"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-button
            class="cancel-button"
            fullWidth
            size="lg"
            borderRadius="xs"
            variant="neutral-secondary"
            @click=${this.onCancelTransaction.bind(this)}
          >
            <wui-text variant="md-medium" color="secondary">Cancel</wui-text>
          </wui-button>
          <wui-button
            class="action-button"
            fullWidth
            size="lg"
            borderRadius="xs"
            variant="accent-primary"
            ?loading=${c}
            ?disabled=${c}
            @click=${this.onSendTransaction.bind(this)}
          >
            <wui-text variant="md-medium" color="invert"> ${this.actionButtonLabel()} </wui-text>
          </wui-button>
        </wui-flex>
      </wui-flex>
    `}templateDetails(){return!this.sourceToken||!this.toToken||this.inputError?null:o`<w3m-swap-details .detailsOpen=${this.detailsOpen}></w3m-swap-details>`}actionButtonLabel(){return this.loadingApprovalTransaction?`Approving...`:this.approvalTransaction?`Approve`:`Swap`}onCancelTransaction(){i.goBack()}onSendTransaction(){this.approvalTransaction?e.sendTransactionForApproval(this.approvalTransaction):e.sendTransactionForSwap(this.swapTransaction)}};I.styles=P,F([g()],I.prototype,`interval`,void 0),F([g()],I.prototype,`detailsOpen`,void 0),F([g()],I.prototype,`approvalTransaction`,void 0),F([g()],I.prototype,`swapTransaction`,void 0),F([g()],I.prototype,`sourceToken`,void 0),F([g()],I.prototype,`sourceTokenAmount`,void 0),F([g()],I.prototype,`sourceTokenPriceInUSD`,void 0),F([g()],I.prototype,`balanceSymbol`,void 0),F([g()],I.prototype,`toToken`,void 0),F([g()],I.prototype,`toTokenAmount`,void 0),F([g()],I.prototype,`toTokenPriceInUSD`,void 0),F([g()],I.prototype,`caipNetwork`,void 0),F([g()],I.prototype,`inputError`,void 0),F([g()],I.prototype,`loadingQuote`,void 0),F([g()],I.prototype,`loadingApprovalTransaction`,void 0),F([g()],I.prototype,`loadingBuildTransaction`,void 0),F([g()],I.prototype,`loadingTransaction`,void 0),I=F([f(`w3m-swap-preview-view`)],I);var L=m`
  :host {
    width: 100%;
    height: 60px;
    min-height: 60px;
  }

  :host > wui-flex {
    cursor: pointer;
    height: 100%;
    display: flex;
    column-gap: ${({spacing:e})=>e[3]};
    padding: ${({spacing:e})=>e[2]};
    padding-right: ${({spacing:e})=>e[4]};
    width: 100%;
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
    color: ${({tokens:e})=>e.theme.foregroundSecondary};
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color, opacity;
  }

  @media (hover: hover) and (pointer: fine) {
    :host > wui-flex:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }

    :host > wui-flex:active {
      background-color: ${({tokens:e})=>e.core.glass010};
    }
  }

  :host([disabled]) > wui-flex {
    opacity: 0.6;
  }

  :host([disabled]) > wui-flex:hover {
    background-color: transparent;
  }

  :host > wui-flex > wui-flex {
    flex: 1;
  }

  :host > wui-flex > wui-image,
  :host > wui-flex > .token-item-image-placeholder {
    width: 40px;
    max-width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:e})=>e[20]};
    position: relative;
  }

  :host > wui-flex > .token-item-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host > wui-flex > wui-image::after,
  :host > wui-flex > .token-item-image-placeholder::after {
    position: absolute;
    content: '';
    inset: 0;
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
    border-radius: ${({borderRadius:e})=>e[8]};
  }

  button > wui-icon-box[data-variant='square-blue'] {
    border-radius: ${({borderRadius:e})=>e[2]};
    position: relative;
    border: none;
    width: 36px;
    height: 36px;
  }
`,R=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},z=class extends d{constructor(){super(),this.observer=new IntersectionObserver(()=>void 0),this.imageSrc=void 0,this.name=void 0,this.symbol=void 0,this.price=void 0,this.amount=void 0,this.visible=!1,this.imageError=!1,this.observer=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting?this.visible=!0:this.visible=!1})},{threshold:.1})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){if(!this.visible)return null;let e=this.amount&&this.price?s.multiply(this.price,this.amount)?.toFixed(3):null;return o`
      <wui-flex alignItems="center">
        ${this.visualTemplate()}
        <wui-flex flexDirection="column" gap="1">
          <wui-flex justifyContent="space-between">
            <wui-text variant="md-medium" color="primary" lineClamp="1">${this.name}</wui-text>
            ${e?o`
                  <wui-text variant="md-medium" color="primary">
                    $${s.formatNumberToLocalString(e,3)}
                  </wui-text>
                `:null}
          </wui-flex>
          <wui-flex justifyContent="space-between">
            <wui-text variant="sm-regular" color="secondary" lineClamp="1">${this.symbol}</wui-text>
            ${this.amount?o`<wui-text variant="sm-regular" color="secondary">
                  ${s.formatNumberToLocalString(this.amount,5)}
                </wui-text>`:null}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}visualTemplate(){return this.imageError?o`<wui-flex class="token-item-image-placeholder">
        <wui-icon name="image" color="inherit"></wui-icon>
      </wui-flex>`:this.imageSrc?o`<wui-image
        width="40"
        height="40"
        src=${this.imageSrc}
        @onLoadError=${this.imageLoadError}
      ></wui-image>`:null}imageLoadError(){this.imageError=!0}};z.styles=[h,l,L],R([c()],z.prototype,`imageSrc`,void 0),R([c()],z.prototype,`name`,void 0),R([c()],z.prototype,`symbol`,void 0),R([c()],z.prototype,`price`,void 0),R([c()],z.prototype,`amount`,void 0),R([g()],z.prototype,`visible`,void 0),R([g()],z.prototype,`imageError`,void 0),z=R([f(`wui-token-list-item`)],z);var B=m`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    cursor: pointer;
    height: 100%;
    width: 100%;
    display: flex;
    column-gap: ${({spacing:e})=>e[3]};
    padding: ${({spacing:e})=>e[2]};
    padding-right: ${({spacing:e})=>e[4]};
  }

  wui-flex {
    display: flex;
    flex: 1;
  }
`,V=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},H=class extends d{render(){return o`
      <wui-flex alignItems="center">
        <wui-shimmer width="40px" height="40px"></wui-shimmer>
        <wui-flex flexDirection="column" gap="1">
          <wui-shimmer width="72px" height="16px" borderRadius="4xs"></wui-shimmer>
          <wui-shimmer width="148px" height="14px" borderRadius="4xs"></wui-shimmer>
        </wui-flex>
        <wui-flex flexDirection="column" gap="1" alignItems="flex-end">
          <wui-shimmer width="24px" height="12px" borderRadius="4xs"></wui-shimmer>
          <wui-shimmer width="32px" height="12px" borderRadius="4xs"></wui-shimmer>
        </wui-flex>
      </wui-flex>
    `}};H.styles=[h,B],H=V([f(`wui-token-list-item-loader`)],H);var U=m`
  :host {
    --tokens-scroll--top-opacity: 0;
    --tokens-scroll--bottom-opacity: 1;
    --suggested-tokens-scroll--left-opacity: 0;
    --suggested-tokens-scroll--right-opacity: 1;
  }

  :host > wui-flex:first-child {
    overflow-y: hidden;
    overflow-x: hidden;
    scrollbar-width: none;
    scrollbar-height: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .suggested-tokens-container {
    overflow-x: auto;
    mask-image: linear-gradient(
      to right,
      rgba(0, 0, 0, calc(1 - var(--suggested-tokens-scroll--left-opacity))) 0px,
      rgba(200, 200, 200, calc(1 - var(--suggested-tokens-scroll--left-opacity))) 1px,
      black 50px,
      black 90px,
      black calc(100% - 90px),
      black calc(100% - 50px),
      rgba(155, 155, 155, calc(1 - var(--suggested-tokens-scroll--right-opacity))) calc(100% - 1px),
      rgba(0, 0, 0, calc(1 - var(--suggested-tokens-scroll--right-opacity))) 100%
    );
  }

  .suggested-tokens-container::-webkit-scrollbar {
    display: none;
  }

  .tokens-container {
    border-top: 1px solid ${({tokens:e})=>e.core.glass010};
    height: 100%;
    max-height: 390px;
  }

  .tokens {
    width: 100%;
    overflow-y: auto;
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, calc(1 - var(--tokens-scroll--top-opacity))) 0px,
      rgba(200, 200, 200, calc(1 - var(--tokens-scroll--top-opacity))) 1px,
      black 50px,
      black 90px,
      black calc(100% - 90px),
      black calc(100% - 50px),
      rgba(155, 155, 155, calc(1 - var(--tokens-scroll--bottom-opacity))) calc(100% - 1px),
      rgba(0, 0, 0, calc(1 - var(--tokens-scroll--bottom-opacity))) 100%
    );
  }

  .network-search-input,
  .select-network-button {
    height: 40px;
  }

  .select-network-button {
    border: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[3]};
    padding: ${({spacing:e})=>e[2]};
    align-items: center;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
  }

  .select-network-button:hover {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .select-network-button > wui-image {
    width: 26px;
    height: 26px;
    border-radius: ${({borderRadius:e})=>e[4]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
  }
`,W=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},G=class extends d{constructor(){super(),this.unsubscribe=[],this.targetToken=i.state.data?.target,this.sourceToken=e.state.sourceToken,this.sourceTokenAmount=e.state.sourceTokenAmount,this.toToken=e.state.toToken,this.myTokensWithBalance=e.state.myTokensWithBalance,this.popularTokens=e.state.popularTokens,this.suggestedTokens=e.state.suggestedTokens,this.tokensLoading=e.state.tokensLoading,this.searchValue=``,this.unsubscribe.push(e.subscribe(e=>{this.sourceToken=e.sourceToken,this.toToken=e.toToken,this.myTokensWithBalance=e.myTokensWithBalance,this.popularTokens=e.popularTokens,this.suggestedTokens=e.suggestedTokens,this.tokensLoading=e.tokensLoading}))}async firstUpdated(){await e.getTokenList()}updated(){(this.renderRoot?.querySelector(`.suggested-tokens-container`))?.addEventListener(`scroll`,this.handleSuggestedTokensScroll.bind(this)),(this.renderRoot?.querySelector(`.tokens`))?.addEventListener(`scroll`,this.handleTokenListScroll.bind(this))}disconnectedCallback(){super.disconnectedCallback();let e=this.renderRoot?.querySelector(`.suggested-tokens-container`),t=this.renderRoot?.querySelector(`.tokens`);e?.removeEventListener(`scroll`,this.handleSuggestedTokensScroll.bind(this)),t?.removeEventListener(`scroll`,this.handleTokenListScroll.bind(this)),clearInterval(this.interval)}render(){return o`
      <wui-flex flexDirection="column" gap="3">
        ${this.templateSearchInput()} ${this.templateSuggestedTokens()} ${this.templateTokens()}
      </wui-flex>
    `}onSelectToken(t){this.targetToken===`sourceToken`?e.setSourceToken(t):(e.setToToken(t),this.sourceToken&&this.sourceTokenAmount&&e.swapTokens()),i.goBack()}templateSearchInput(){return o`
      <wui-flex .padding=${[`1`,`3`,`0`,`3`]} gap="2">
        <wui-input-text
          data-testid="swap-select-token-search-input"
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
          .value=${this.searchValue}
          @inputChange=${this.onSearchInputChange.bind(this)}
        ></wui-input-text>
      </wui-flex>
    `}templateMyTokens(){let e=this.myTokensWithBalance?Object.values(this.myTokensWithBalance):[],t=this.filterTokensWithText(e,this.searchValue);return t?.length>0?o`<wui-flex justifyContent="flex-start" padding="2">
          <wui-text variant="md-medium" color="secondary">Your tokens</wui-text>
        </wui-flex>
        ${t.map(e=>{let t=e.symbol===this.sourceToken?.symbol||e.symbol===this.toToken?.symbol;return o`
            <wui-token-list-item
              data-testid="swap-select-token-item-${e.symbol}"
              name=${e.name}
              ?disabled=${t}
              symbol=${e.symbol}
              price=${e?.price}
              amount=${e?.quantity?.numeric}
              imageSrc=${e.logoUri}
              @click=${()=>{t||this.onSelectToken(e)}}
            >
            </wui-token-list-item>
          `})}`:null}templateAllTokens(){let e=this.popularTokens?this.popularTokens:[],t=this.filterTokensWithText(e,this.searchValue);return this.tokensLoading?o`
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
      `:t?.length>0?o`
        ${t.map(e=>o`
            <wui-token-list-item
              data-testid="swap-select-token-item-${e.symbol}"
              name=${e.name}
              symbol=${e.symbol}
              imageSrc=${e.logoUri}
              @click=${()=>this.onSelectToken(e)}
            >
            </wui-token-list-item>
          `)}
      `:null}templateTokens(){return o`
      <wui-flex class="tokens-container">
        <wui-flex class="tokens" .padding=${[`0`,`2`,`2`,`2`]} flexDirection="column">
          ${this.templateMyTokens()}
          <wui-flex justifyContent="flex-start" padding="3">
            <wui-text variant="md-medium" color="secondary">Tokens</wui-text>
          </wui-flex>
          ${this.templateAllTokens()}
        </wui-flex>
      </wui-flex>
    `}templateSuggestedTokens(){let e=this.suggestedTokens?this.suggestedTokens.slice(0,8):null;return this.tokensLoading?o`
        <wui-flex
          class="suggested-tokens-container"
          .padding=${[`0`,`3`,`0`,`3`]}
          gap="2"
        >
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
        </wui-flex>
      `:e?o`
      <wui-flex
        class="suggested-tokens-container"
        .padding=${[`0`,`3`,`0`,`3`]}
        gap="2"
      >
        ${e.map(e=>o`
            <wui-token-button
              text=${e.symbol}
              imageSrc=${e.logoUri}
              @click=${()=>this.onSelectToken(e)}
            >
            </wui-token-button>
          `)}
      </wui-flex>
    `:null}onSearchInputChange(e){this.searchValue=e.detail}handleSuggestedTokensScroll(){let e=this.renderRoot?.querySelector(`.suggested-tokens-container`);e&&(e.style.setProperty(`--suggested-tokens-scroll--left-opacity`,v.interpolate([0,100],[0,1],e.scrollLeft).toString()),e.style.setProperty(`--suggested-tokens-scroll--right-opacity`,v.interpolate([0,100],[0,1],e.scrollWidth-e.scrollLeft-e.offsetWidth).toString()))}handleTokenListScroll(){let e=this.renderRoot?.querySelector(`.tokens`);e&&(e.style.setProperty(`--tokens-scroll--top-opacity`,v.interpolate([0,100],[0,1],e.scrollTop).toString()),e.style.setProperty(`--tokens-scroll--bottom-opacity`,v.interpolate([0,100],[0,1],e.scrollHeight-e.scrollTop-e.offsetHeight).toString()))}filterTokensWithText(e,t){return e.filter(e=>`${e.symbol} ${e.name} ${e.address}`.toLowerCase().includes(t.toLowerCase())).sort((e,n)=>{let r=`${e.symbol} ${e.name} ${e.address}`.toLowerCase(),i=`${n.symbol} ${n.name} ${n.address}`.toLowerCase();return r.indexOf(t.toLowerCase())-i.indexOf(t.toLowerCase())})}};G.styles=U,W([g()],G.prototype,`interval`,void 0),W([g()],G.prototype,`targetToken`,void 0),W([g()],G.prototype,`sourceToken`,void 0),W([g()],G.prototype,`sourceTokenAmount`,void 0),W([g()],G.prototype,`toToken`,void 0),W([g()],G.prototype,`myTokensWithBalance`,void 0),W([g()],G.prototype,`popularTokens`,void 0),W([g()],G.prototype,`suggestedTokens`,void 0),W([g()],G.prototype,`tokensLoading`,void 0),W([g()],G.prototype,`searchValue`,void 0),G=W([f(`w3m-swap-select-token-view`)],G);export{I as W3mSwapPreviewView,G as W3mSwapSelectTokenView,N as W3mSwapView};