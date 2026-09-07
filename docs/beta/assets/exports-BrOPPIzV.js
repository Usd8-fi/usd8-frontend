import{r as e}from"./rolldown-runtime-C_s2cVnS.js";import{B as t,E as n,G as r,J as i,K as a,P as o,R as s,S as c,b as l,c as ee,g as u,it as d,l as f,m as te,o as ne,ot as p,r as m,rt as re,tt as h,v as g,z as ie}from"./ApiController-DWA16WV7.js";import{C as ae,_,b as v,c as oe,g as y,h as b,m as se,o as x,p as S,s as ce,t as le,u as ue,v as C}from"./wui-text-7EwTqPDT.js";import{t as de}from"./MathUtil-B2UslVSw.js";import"./wui-button-1hK_JKc-.js";import"./wui-icon-DQgkzRr-.js";import"./wui-icon-link-Cz0vUGsZ.js";import"./wui-image-BsTMaRYV.js";import"./wui-list-item-B4dQaeD3.js";import"./wui-loading-spinner-DAInCTsC.js";import{t as w}from"./wui-wallet-switch-CFtR4IU2.js";import"./wui-separator-Chmnz9ei.js";import"./wui-shimmer-BXAOW0LB.js";var fe=S`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:e})=>e.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,T=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},E=class extends C{constructor(){super(...arguments),this.icon=`card`,this.variant=`primary`,this.type=`accent`,this.size=`md`,this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return v`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${b(this.iconSize)}></wui-icon>
    </button>`}};E.styles=[ue,oe,fe],T([_()],E.prototype,`icon`,void 0),T([_()],E.prototype,`variant`,void 0),T([_()],E.prototype,`type`,void 0),T([_()],E.prototype,`size`,void 0),T([_()],E.prototype,`iconSize`,void 0),T([_({type:Boolean})],E.prototype,`fullWidth`,void 0),T([_({type:Boolean})],E.prototype,`disabled`,void 0),E=T([x(`wui-icon-button`)],E);var D={INVALID_PAYMENT_CONFIG:`INVALID_PAYMENT_CONFIG`,INVALID_RECIPIENT:`INVALID_RECIPIENT`,INVALID_ASSET:`INVALID_ASSET`,INVALID_AMOUNT:`INVALID_AMOUNT`,UNKNOWN_ERROR:`UNKNOWN_ERROR`,UNABLE_TO_INITIATE_PAYMENT:`UNABLE_TO_INITIATE_PAYMENT`,INVALID_CHAIN_NAMESPACE:`INVALID_CHAIN_NAMESPACE`,GENERIC_PAYMENT_ERROR:`GENERIC_PAYMENT_ERROR`,UNABLE_TO_GET_EXCHANGES:`UNABLE_TO_GET_EXCHANGES`,ASSET_NOT_SUPPORTED:`ASSET_NOT_SUPPORTED`,UNABLE_TO_GET_PAY_URL:`UNABLE_TO_GET_PAY_URL`,UNABLE_TO_GET_BUY_STATUS:`UNABLE_TO_GET_BUY_STATUS`,UNABLE_TO_GET_TOKEN_BALANCES:`UNABLE_TO_GET_TOKEN_BALANCES`,UNABLE_TO_GET_QUOTE:`UNABLE_TO_GET_QUOTE`,UNABLE_TO_GET_QUOTE_STATUS:`UNABLE_TO_GET_QUOTE_STATUS`,INVALID_RECIPIENT_ADDRESS_FOR_ASSET:`INVALID_RECIPIENT_ADDRESS_FOR_ASSET`},O={[D.INVALID_PAYMENT_CONFIG]:`Invalid payment configuration`,[D.INVALID_RECIPIENT]:`Invalid recipient address`,[D.INVALID_ASSET]:`Invalid asset specified`,[D.INVALID_AMOUNT]:`Invalid payment amount`,[D.INVALID_RECIPIENT_ADDRESS_FOR_ASSET]:`Invalid recipient address for the asset selected`,[D.UNKNOWN_ERROR]:`Unknown payment error occurred`,[D.UNABLE_TO_INITIATE_PAYMENT]:`Unable to initiate payment`,[D.INVALID_CHAIN_NAMESPACE]:`Invalid chain namespace`,[D.GENERIC_PAYMENT_ERROR]:`Unable to process payment`,[D.UNABLE_TO_GET_EXCHANGES]:`Unable to get exchanges`,[D.ASSET_NOT_SUPPORTED]:`Asset not supported by the selected exchange`,[D.UNABLE_TO_GET_PAY_URL]:`Unable to get payment URL`,[D.UNABLE_TO_GET_BUY_STATUS]:`Unable to get buy status`,[D.UNABLE_TO_GET_TOKEN_BALANCES]:`Unable to get token balances`,[D.UNABLE_TO_GET_QUOTE]:`Unable to get quote. Please choose a different token`,[D.UNABLE_TO_GET_QUOTE_STATUS]:`Unable to get quote status`},k=class e extends Error{get message(){return O[this.code]}constructor(t,n){super(O[t]),this.name=`AppKitPayError`,this.code=t,this.details=n,Error.captureStackTrace&&Error.captureStackTrace(this,e)}},pe=`https://rpc.walletconnect.org/v1/json-rpc`,me=`reown_test`;function he(){let{chainNamespace:e}=h.parseCaipNetworkId(R.state.paymentAsset.network);if(!t.isAddress(R.state.recipient,e))throw new k(D.INVALID_RECIPIENT_ADDRESS_FOR_ASSET,`Provide valid recipient address for namespace "${e}"`)}async function ge(e,t,n){if(t!==p.CHAIN.EVM)throw new k(D.INVALID_CHAIN_NAMESPACE);if(!n.fromAddress)throw new k(D.INVALID_PAYMENT_CONFIG,`fromAddress is required for native EVM payments.`);let r=typeof n.amount==`string`?parseFloat(n.amount):n.amount;if(isNaN(r))throw new k(D.INVALID_PAYMENT_CONFIG);let i=e.metadata?.decimals??18,a=f.parseUnits(r.toString(),i);if(typeof a!=`bigint`)throw new k(D.GENERIC_PAYMENT_ERROR);return await f.sendTransaction({chainNamespace:t,to:n.recipient,address:n.fromAddress,value:a,data:`0x`})??void 0}async function _e(e,t){if(!t.fromAddress)throw new k(D.INVALID_PAYMENT_CONFIG,`fromAddress is required for ERC20 EVM payments.`);let n=e.asset,r=t.recipient,i=Number(e.metadata.decimals),a=f.parseUnits(t.amount.toString(),i);if(a===void 0)throw new k(D.GENERIC_PAYMENT_ERROR);return await f.writeContract({fromAddress:t.fromAddress,tokenAddress:n,args:[r,a],method:`transfer`,abi:re.getERC20Abi(n),chainNamespace:p.CHAIN.EVM})??void 0}async function ve(e,t){if(e!==p.CHAIN.SOLANA)throw new k(D.INVALID_CHAIN_NAMESPACE);if(!t.fromAddress)throw new k(D.INVALID_PAYMENT_CONFIG,`fromAddress is required for Solana payments.`);let n=typeof t.amount==`string`?parseFloat(t.amount):t.amount;if(isNaN(n)||n<=0)throw new k(D.INVALID_PAYMENT_CONFIG,`Invalid payment amount.`);try{if(!ne.getProvider(e))throw new k(D.GENERIC_PAYMENT_ERROR,`No Solana provider available.`);let r=await f.sendTransaction({chainNamespace:p.CHAIN.SOLANA,to:t.recipient,value:n,tokenMint:t.tokenMint});if(!r)throw new k(D.GENERIC_PAYMENT_ERROR,`Transaction failed.`);return r}catch(e){throw e instanceof k?e:new k(D.GENERIC_PAYMENT_ERROR,`Solana payment failed: ${e}`)}}async function ye({sourceToken:e,toToken:t,amount:n,recipient:r}){let i=f.parseUnits(n,e.metadata.decimals),a=f.parseUnits(n,t.metadata.decimals);return Promise.resolve({type:Re,origin:{amount:i?.toString()??`0`,currency:e},destination:{amount:a?.toString()??`0`,currency:t},fees:[{id:`service`,label:`Service Fee`,amount:`0`,currency:t}],steps:[{requestId:Re,type:`deposit`,deposit:{amount:i?.toString()??`0`,currency:e.asset,receiver:r}}],timeInSeconds:6})}function A(e){if(!e)return null;let t=e.steps[0];return!t||t.type!==`deposit`?null:t}function j(e,t=0){if(!e)return[];let n=e.steps.filter(e=>e.type===ze),r=n.filter((e,n)=>n+1>t);return n.length>0&&n.length<3?r:[]}var M=new ie({baseUrl:t.getApiUrl(),clientId:null}),be=class extends Error{};function xe(){return`${pe}?projectId=${s.getSnapshot().projectId}`}function N(){let{projectId:e,sdkType:t,sdkVersion:n}=s.state;return{projectId:e,st:t||`appkit`,sv:n||`html-wagmi-4.2.2`}}async function Se(e,t){let n=xe(),{sdkType:r,sdkVersion:i,projectId:a}=s.getSnapshot(),o={jsonrpc:`2.0`,id:1,method:e,params:{...t||{},st:r,sv:i,projectId:a}},c=await(await fetch(n,{method:`POST`,body:JSON.stringify(o),headers:{"Content-Type":`application/json`}})).json();if(c.error)throw new be(c.error.message);return c}async function Ce(e){return(await Se(`reown_getExchanges`,e)).result}async function we(e){return(await Se(`reown_getExchangePayUrl`,e)).result}async function Te(e){return(await Se(`reown_getExchangeBuyStatus`,e)).result}async function Ee(e){let t=d.bigNumber(e.amount).times(10**e.toToken.metadata.decimals).toString(),{chainId:n,chainNamespace:r}=h.parseCaipNetworkId(e.sourceToken.network),{chainId:i,chainNamespace:a}=h.parseCaipNetworkId(e.toToken.network),o=e.sourceToken.asset===`native`?te(r):e.sourceToken.asset,s=e.toToken.asset===`native`?te(a):e.toToken.asset;return await M.post({path:`/appkit/v1/transfers/quote`,body:{user:e.address,originChainId:n.toString(),originCurrency:o,destinationChainId:i.toString(),destinationCurrency:s,recipient:e.recipient,amount:t},params:N()})}async function De(e){let t=w.isLowerCaseMatch(e.sourceToken.network,e.toToken.network),n=w.isLowerCaseMatch(e.sourceToken.asset,e.toToken.asset);return t&&n?ye(e):Ee(e)}async function Oe(e){return await M.get({path:`/appkit/v1/transfers/status`,params:{requestId:e.requestId,...N()}})}async function ke(e){return await M.get({path:`/appkit/v1/transfers/assets/exchanges/${e}`,params:N()})}var Ae=[`eip155`,`solana`],je={eip155:{native:{assetNamespace:`slip44`,assetReference:`60`},defaultTokenNamespace:`erc20`},solana:{native:{assetNamespace:`slip44`,assetReference:`501`},defaultTokenNamespace:`token`}},Me={56:`714`,204:`714`};function P(e,t){let{chainNamespace:n,chainId:r}=h.parseCaipNetworkId(e),i=je[n];if(!i)throw Error(`Unsupported chain namespace for CAIP-19 formatting: ${n}`);let a=i.native.assetNamespace,o=i.native.assetReference;return t===`native`?n===`eip155`&&Me[r]&&(o=Me[r]):(a=i.defaultTokenNamespace,o=t),`${`${n}:${r}`}/${a}:${o}`}function Ne(e){let{chainNamespace:t}=h.parseCaipNetworkId(e);return Ae.includes(t)}function Pe(e){let n=m.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===e.chainId),r=e.address;if(!n)throw Error(`Target network not found for balance chainId "${e.chainId}"`);if(w.isLowerCaseMatch(e.symbol,n.nativeCurrency.symbol))r=`native`;else if(t.isCaipAddress(r)){let{address:e}=h.parseCaipAddress(r);r=e}else if(!r)throw Error(`Balance address not found for balance symbol "${e.symbol}"`);return{network:n.caipNetworkId,asset:r,metadata:{name:e.name,symbol:e.symbol,decimals:Number(e.quantity.decimals),logoURI:e.iconUrl},amount:e.quantity.numeric}}function Fe(e){return{chainId:e.network,address:`${e.network}:${e.asset}`,symbol:e.metadata.symbol,name:e.metadata.name,iconUrl:e.metadata.logoURI||``,price:0,quantity:{numeric:`0`,decimals:e.metadata.decimals.toString()}}}function F(e){let t=d.bigNumber(e,{safe:!0});return t.lt(.001)?`<0.001`:t.round(4).toString()}function Ie(e){let t=m.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===e.network);return t?!!t.testnet:!1}var Le=0,I=`unknown`,Re=`direct-transfer`,ze=`transaction`,L=a({paymentAsset:{network:`eip155:1`,asset:`0x0`,metadata:{name:`0x0`,symbol:`0x0`,decimals:0}},recipient:`0x0`,amount:0,isConfigured:!1,error:null,isPaymentInProgress:!1,exchanges:[],isLoading:!1,openInNewTab:!0,redirectUrl:void 0,payWithExchange:void 0,currentPayment:void 0,analyticsSet:!1,paymentId:void 0,choice:`pay`,tokenBalances:{[p.CHAIN.EVM]:[],[p.CHAIN.SOLANA]:[]},isFetchingTokenBalances:!1,selectedPaymentAsset:null,quote:void 0,quoteStatus:`waiting`,quoteError:null,isFetchingQuote:!1,selectedExchange:void 0,exchangeUrlForQuote:void 0,requestId:void 0}),R={state:L,subscribe(e){return i(L,()=>e(L))},subscribeKey(e,t){return r(L,e,t)},async handleOpenPay(e){this.resetState(),this.setPaymentConfig(e),this.initializeAnalytics(),he(),await this.prepareTokenLogo(),L.isConfigured=!0,l.sendEvent({type:`track`,event:`PAY_MODAL_OPEN`,properties:{exchanges:L.exchanges,configuration:{network:L.paymentAsset.network,asset:L.paymentAsset.asset,recipient:L.recipient,amount:L.amount}}}),await g.open({view:`Pay`})},resetState(){L.paymentAsset={network:`eip155:1`,asset:`0x0`,metadata:{name:`0x0`,symbol:`0x0`,decimals:0}},L.recipient=`0x0`,L.amount=0,L.isConfigured=!1,L.error=null,L.isPaymentInProgress=!1,L.isLoading=!1,L.currentPayment=void 0,L.selectedExchange=void 0,L.exchangeUrlForQuote=void 0,L.requestId=void 0},resetQuoteState(){L.quote=void 0,L.quoteStatus=`waiting`,L.quoteError=null,L.isFetchingQuote=!1,L.requestId=void 0},setPaymentConfig(e){if(!e.paymentAsset)throw new k(D.INVALID_PAYMENT_CONFIG);try{L.choice=e.choice??`pay`,L.paymentAsset=e.paymentAsset,L.recipient=e.recipient,L.amount=e.amount,L.openInNewTab=e.openInNewTab??!0,L.redirectUrl=e.redirectUrl,L.payWithExchange=e.payWithExchange,L.error=null}catch(e){throw new k(D.INVALID_PAYMENT_CONFIG,e.message)}},setSelectedPaymentAsset(e){L.selectedPaymentAsset=e},setSelectedExchange(e){L.selectedExchange=e},setRequestId(e){L.requestId=e},setPaymentInProgress(e){L.isPaymentInProgress=e},getPaymentAsset(){return L.paymentAsset},getExchanges(){return L.exchanges},async fetchExchanges(){try{L.isLoading=!0,L.exchanges=(await Ce({page:Le})).exchanges.slice(0,2)}catch{throw n.showError(O.UNABLE_TO_GET_EXCHANGES),new k(D.UNABLE_TO_GET_EXCHANGES)}finally{L.isLoading=!1}},async getAvailableExchanges(e){try{let t=e?.asset&&e?.network?P(e.network,e.asset):void 0;return await Ce({page:e?.page??Le,asset:t,amount:e?.amount?.toString()})}catch{throw new k(D.UNABLE_TO_GET_EXCHANGES)}},async getPayUrl(e,t,n=!1){try{let r=Number(t.amount),i=await we({exchangeId:e,asset:P(t.network,t.asset),amount:r.toString(),recipient:`${t.network}:${t.recipient}`});return l.sendEvent({type:`track`,event:`PAY_EXCHANGE_SELECTED`,properties:{source:`pay`,exchange:{id:e},configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:r},currentPayment:{type:`exchange`,exchangeId:e},headless:n}}),n&&(this.initiatePayment(),l.sendEvent({type:`track`,event:`PAY_INITIATED`,properties:{source:`pay`,paymentId:L.paymentId||I,configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:r},currentPayment:{type:`exchange`,exchangeId:e}}})),i}catch(e){throw e instanceof Error&&e.message.includes(`is not supported`)?new k(D.ASSET_NOT_SUPPORTED):Error(e.message)}},async generateExchangeUrlForQuote({exchangeId:e,paymentAsset:t,amount:n,recipient:r}){let i=await we({exchangeId:e,asset:P(t.network,t.asset),amount:n.toString(),recipient:r});L.exchangeSessionId=i.sessionId,L.exchangeUrlForQuote=i.url},async openPayUrl(e,n,r=!1){try{let i=await this.getPayUrl(e.exchangeId,n,r);if(!i)throw new k(D.UNABLE_TO_GET_PAY_URL);let a=e.openInNewTab??!0?`_blank`:`_self`;return t.openHref(i.url,a),i}catch(e){throw L.error=e instanceof k?e.message:O.GENERIC_PAYMENT_ERROR,new k(D.UNABLE_TO_GET_PAY_URL)}},async onTransfer({chainNamespace:e,fromAddress:t,toAddress:r,amount:i,paymentAsset:a}){if(L.currentPayment={type:`wallet`,status:`IN_PROGRESS`},!L.isPaymentInProgress)try{this.initiatePayment();let n=m.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===a.network);if(!n)throw Error(`Target network not found`);let o=m.state.activeCaipNetwork;switch(w.isLowerCaseMatch(o?.caipNetworkId,n.caipNetworkId)||await m.switchActiveNetwork(n),e){case p.CHAIN.EVM:a.asset===`native`&&(L.currentPayment.result=await ge(a,e,{recipient:r,amount:i,fromAddress:t})),a.asset.startsWith(`0x`)&&(L.currentPayment.result=await _e(a,{recipient:r,amount:i,fromAddress:t})),L.currentPayment.status=`SUCCESS`;break;case p.CHAIN.SOLANA:L.currentPayment.result=await ve(e,{recipient:r,amount:i,fromAddress:t,tokenMint:a.asset===`native`?void 0:a.asset}),L.currentPayment.status=`SUCCESS`;break;default:throw new k(D.INVALID_CHAIN_NAMESPACE)}}catch(e){throw L.error=e instanceof k?e.message:O.GENERIC_PAYMENT_ERROR,L.currentPayment.status=`FAILED`,n.showError(L.error),e}finally{L.isPaymentInProgress=!1}},async onSendTransaction(e){try{let{namespace:t,transactionStep:n}=e;R.initiatePayment();let r=m.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===L.paymentAsset?.network);if(!r)throw Error(`Target network not found`);let i=m.state.activeCaipNetwork;if(w.isLowerCaseMatch(i?.caipNetworkId,r.caipNetworkId)||await m.switchActiveNetwork(r),t===p.CHAIN.EVM){let{from:e,to:r,data:i,value:a}=n.transaction;await f.sendTransaction({address:e,to:r,data:i,value:BigInt(a),chainNamespace:t})}else if(t===p.CHAIN.SOLANA){let{instructions:e}=n.transaction;await f.writeSolanaTransaction({instructions:e})}}catch(e){throw L.error=e instanceof k?e.message:O.GENERIC_PAYMENT_ERROR,n.showError(L.error),e}finally{L.isPaymentInProgress=!1}},getExchangeById(e){return L.exchanges.find(t=>t.id===e)},validatePayConfig(e){let{paymentAsset:t,recipient:n,amount:r}=e;if(!t)throw new k(D.INVALID_PAYMENT_CONFIG);if(!n)throw new k(D.INVALID_RECIPIENT);if(!t.asset)throw new k(D.INVALID_ASSET);if(r==null||r<=0)throw new k(D.INVALID_AMOUNT)},async handlePayWithExchange(e){try{L.currentPayment={type:`exchange`,exchangeId:e};let{network:t,asset:n}=L.paymentAsset,r={network:t,asset:n,amount:L.amount,recipient:L.recipient},i=await this.getPayUrl(e,r);if(!i)throw new k(D.UNABLE_TO_INITIATE_PAYMENT);return L.currentPayment.sessionId=i.sessionId,L.currentPayment.status=`IN_PROGRESS`,L.currentPayment.exchangeId=e,this.initiatePayment(),{url:i.url,openInNewTab:L.openInNewTab}}catch(e){return L.error=e instanceof k?e.message:O.GENERIC_PAYMENT_ERROR,L.isPaymentInProgress=!1,n.showError(L.error),null}},async getBuyStatus(e,n){try{let r=await Te({sessionId:n,exchangeId:e});return(r.status===`SUCCESS`||r.status===`FAILED`)&&l.sendEvent({type:`track`,event:r.status===`SUCCESS`?`PAY_SUCCESS`:`PAY_ERROR`,properties:{message:r.status===`FAILED`?t.parseError(L.error):void 0,source:`pay`,paymentId:L.paymentId||I,configuration:{network:L.paymentAsset.network,asset:L.paymentAsset.asset,recipient:L.recipient,amount:L.amount},currentPayment:{type:`exchange`,exchangeId:L.currentPayment?.exchangeId,sessionId:L.currentPayment?.sessionId,result:r.txHash}}}),r}catch{throw new k(D.UNABLE_TO_GET_BUY_STATUS)}},async fetchTokensFromEOA({caipAddress:e,caipNetwork:t,namespace:n}){if(!e)return[];let{address:r}=h.parseCaipAddress(e),i=t;return n===p.CHAIN.EVM&&(i=void 0),await ee.getMyTokensWithBalance({address:r,caipNetwork:i})},async fetchTokensFromExchange(){if(!L.selectedExchange)return[];let e=await ke(L.selectedExchange.id),n=Object.values(e.assets).flat();return await Promise.all(n.map(async e=>{let n=Fe(e),{chainNamespace:r}=h.parseCaipNetworkId(n.chainId),i=n.address;if(t.isCaipAddress(i)){let{address:e}=h.parseCaipAddress(i);i=e}return n.iconUrl=await o.getImageByToken(i??``,r).catch(()=>void 0)??``,n}))},async fetchTokens({caipAddress:e,caipNetwork:t,namespace:r}){try{L.isFetchingTokenBalances=!0;let n=await(L.selectedExchange?this.fetchTokensFromExchange():this.fetchTokensFromEOA({caipAddress:e,caipNetwork:t,namespace:r}));L.tokenBalances={...L.tokenBalances,[r]:n}}catch(e){let t=e instanceof Error?e.message:`Unable to get token balances`;n.showError(t)}finally{L.isFetchingTokenBalances=!1}},async fetchQuote({amount:e,address:t,sourceToken:r,toToken:i,recipient:a}){try{R.resetQuoteState(),L.isFetchingQuote=!0;let n=await De({amount:e,address:L.selectedExchange?void 0:t,sourceToken:r,toToken:i,recipient:a});if(L.selectedExchange){let e=A(n);if(e){let t=`${r.network}:${e.deposit.receiver}`,n=d.formatNumber(e.deposit.amount,{decimals:r.metadata.decimals??0,round:8});await R.generateExchangeUrlForQuote({exchangeId:L.selectedExchange.id,paymentAsset:r,amount:n.toString(),recipient:t})}}L.quote=n}catch(e){let t=O.UNABLE_TO_GET_QUOTE;if(e instanceof Error&&e.cause&&e.cause instanceof Response)try{let n=await e.cause.json();n.error&&typeof n.error==`string`&&(t=n.error)}catch{}throw L.quoteError=t,n.showError(t),new k(D.UNABLE_TO_GET_QUOTE)}finally{L.isFetchingQuote=!1}},async fetchQuoteStatus({requestId:e}){try{if(e===`direct-transfer`){let e=L.selectedExchange,t=L.exchangeSessionId;if(e&&t){switch((await this.getBuyStatus(e.id,t)).status){case`IN_PROGRESS`:L.quoteStatus=`waiting`;break;case`SUCCESS`:L.quoteStatus=`success`,L.isPaymentInProgress=!1;break;case`FAILED`:L.quoteStatus=`failure`,L.isPaymentInProgress=!1;break;case`UNKNOWN`:L.quoteStatus=`waiting`;break;default:L.quoteStatus=`waiting`}return}L.quoteStatus=`success`;return}let{status:t}=await Oe({requestId:e});L.quoteStatus=t}catch{throw L.quoteStatus=`failure`,new k(D.UNABLE_TO_GET_QUOTE_STATUS)}},initiatePayment(){L.isPaymentInProgress=!0,L.paymentId=crypto.randomUUID()},initializeAnalytics(){L.analyticsSet||(L.analyticsSet=!0,this.subscribeKey(`isPaymentInProgress`,e=>{if(L.currentPayment?.status&&L.currentPayment.status!==`UNKNOWN`){let e={IN_PROGRESS:`PAY_INITIATED`,SUCCESS:`PAY_SUCCESS`,FAILED:`PAY_ERROR`}[L.currentPayment.status];l.sendEvent({type:`track`,event:e,properties:{message:L.currentPayment.status===`FAILED`?t.parseError(L.error):void 0,source:`pay`,paymentId:L.paymentId||I,configuration:{network:L.paymentAsset.network,asset:L.paymentAsset.asset,recipient:L.recipient,amount:L.amount},currentPayment:{type:L.currentPayment.type,exchangeId:L.currentPayment.exchangeId,sessionId:L.currentPayment.sessionId,result:L.currentPayment.result}}})}}))},async prepareTokenLogo(){if(!L.paymentAsset.metadata.logoURI)try{let{chainNamespace:e}=h.parseCaipNetworkId(L.paymentAsset.network),t=await o.getImageByToken(L.paymentAsset.asset,e);L.paymentAsset.metadata.logoURI=t}catch{}}},Be=S`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1) var(--apkt-spacing-2)
      calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
  }

  .token-display {
    padding: var(--apkt-spacing-3) var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-5);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    margin-top: var(--apkt-spacing-3);
    margin-bottom: var(--apkt-spacing-3);
  }

  .token-display wui-text {
    text-transform: none;
  }

  wui-loading-spinner {
    padding: var(--apkt-spacing-2);
  }

  .left-image-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 40px;
    height: 40px;
  }

  .chain-image {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .payment-methods-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[8]};
    border-top-left-radius: ${({borderRadius:e})=>e[8]};
  }
`,z=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},B=class extends C{constructor(){super(),this.unsubscribe=[],this.amount=R.state.amount,this.namespace=void 0,this.paymentAsset=R.state.paymentAsset,this.activeConnectorIds=u.state.activeConnectorIds,this.caipAddress=void 0,this.exchanges=R.state.exchanges,this.isLoading=R.state.isLoading,this.initializeNamespace(),this.unsubscribe.push(R.subscribeKey(`amount`,e=>this.amount=e)),this.unsubscribe.push(u.subscribeKey(`activeConnectorIds`,e=>this.activeConnectorIds=e)),this.unsubscribe.push(R.subscribeKey(`exchanges`,e=>this.exchanges=e)),this.unsubscribe.push(R.subscribeKey(`isLoading`,e=>this.isLoading=e)),R.fetchExchanges(),R.setSelectedExchange(void 0)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return v`
      <wui-flex flexDirection="column">
        ${this.paymentDetailsTemplate()} ${this.paymentMethodsTemplate()}
      </wui-flex>
    `}paymentMethodsTemplate(){return v`
      <wui-flex flexDirection="column" padding="3" gap="2" class="payment-methods-container">
        ${this.payWithWalletTemplate()} ${this.templateSeparator()}
        ${this.templateExchangeOptions()}
      </wui-flex>
    `}initializeNamespace(){let e=m.state.activeChain;this.namespace=e,this.caipAddress=m.getAccountData(e)?.caipAddress,this.unsubscribe.push(m.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress},e))}paymentDetailsTemplate(){let e=m.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network);return v`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        .padding=${[`6`,`8`,`6`,`8`]}
        gap="2"
      >
        <wui-flex alignItems="center" gap="1">
          <wui-text variant="h1-regular" color="primary">
            ${F(this.amount||`0`)}
          </wui-text>

          <wui-flex flexDirection="column">
            <wui-text variant="h6-regular" color="secondary">
              ${this.paymentAsset.metadata.symbol||`Unknown`}
            </wui-text>
            <wui-text variant="md-medium" color="secondary"
              >on ${e?.name||`Unknown`}</wui-text
            >
          </wui-flex>
        </wui-flex>

        <wui-flex class="left-image-container">
          <wui-image
            src=${b(this.paymentAsset.metadata.logoURI)}
            class="token-image"
          ></wui-image>
          <wui-image
            src=${b(o.getNetworkImage(e))}
            class="chain-image"
          ></wui-image>
        </wui-flex>
      </wui-flex>
    `}payWithWalletTemplate(){return Ne(this.paymentAsset.network)?this.caipAddress?this.connectedWalletTemplate():this.disconnectedWalletTemplate():v``}connectedWalletTemplate(){let{name:e,image:t}=this.getWalletProperties({namespace:this.namespace});return v`
      <wui-flex flexDirection="column" gap="3">
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${this.onWalletPayment}
          .boxed=${!1}
          ?chevron=${!0}
          ?fullSize=${!1}
          ?rounded=${!0}
          data-testid="wallet-payment-option"
          imageSrc=${b(t)}
          imageSize="3xl"
        >
          <wui-text variant="lg-regular" color="primary">Pay with ${e}</wui-text>
        </wui-list-item>

        <wui-list-item
          type="secondary"
          icon="power"
          iconColor="error"
          @click=${this.onDisconnect}
          data-testid="disconnect-button"
          ?chevron=${!1}
          boxColor="foregroundSecondary"
        >
          <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `}disconnectedWalletTemplate(){return v`<wui-list-item
      type="secondary"
      boxColor="foregroundSecondary"
      variant="icon"
      iconColor="default"
      iconVariant="overlay"
      icon="wallet"
      @click=${this.onWalletPayment}
      ?chevron=${!0}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay with wallet</wui-text>
    </wui-list-item>`}templateExchangeOptions(){if(this.isLoading)return v`<wui-flex justifyContent="center" alignItems="center">
        <wui-loading-spinner size="md"></wui-loading-spinner>
      </wui-flex>`;let e=this.exchanges.filter(e=>Ie(this.paymentAsset)?e.id===me:e.id!==me);return e.length===0?v`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`:e.map(e=>v`
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${()=>this.onExchangePayment(e)}
          data-testid="exchange-option-${e.id}"
          ?chevron=${!0}
          imageSrc=${b(e.imageUrl)}
        >
          <wui-text flexGrow="1" variant="lg-regular" color="primary">
            Pay with ${e.name}
          </wui-text>
        </wui-list-item>
      `)}templateSeparator(){return v`<wui-separator text="or" bgColor="secondary"></wui-separator>`}async onWalletPayment(){if(!this.namespace)throw Error(`Namespace not found`);this.caipAddress?c.push(`PayQuote`):(await u.connect(),await g.open({view:`PayQuote`}))}onExchangePayment(e){R.setSelectedExchange(e),c.push(`PayQuote`)}async onDisconnect(){try{await f.disconnect(),await g.open({view:`Pay`})}catch{console.error(`Failed to disconnect`),n.showError(`Failed to disconnect`)}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let n=u.getConnector({id:t,namespace:e});if(!n)return{name:void 0,image:void 0};let r=o.getConnectorImage(n);return{name:n.name,image:r}}};B.styles=Be,z([y()],B.prototype,`amount`,void 0),z([y()],B.prototype,`namespace`,void 0),z([y()],B.prototype,`paymentAsset`,void 0),z([y()],B.prototype,`activeConnectorIds`,void 0),z([y()],B.prototype,`caipAddress`,void 0),z([y()],B.prototype,`exchanges`,void 0),z([y()],B.prototype,`isLoading`,void 0),B=z([x(`w3m-pay-view`)],B);var Ve=S`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-container {
    position: relative;
    width: var(--pulse-size);
    height: var(--pulse-size);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-rings {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid var(--pulse-color);
    opacity: 0;
    animation: pulse var(--pulse-duration, 2s) ease-out infinite;
  }

  .pulse-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: var(--pulse-opacity, 0.3);
    }
    50% {
      opacity: calc(var(--pulse-opacity, 0.3) * 0.5);
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`,V=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},He=3,Ue=2,We=.3,Ge=`200px`,Ke={"accent-primary":se.tokens.core.backgroundAccentPrimary},H=class extends C{constructor(){super(...arguments),this.rings=He,this.duration=Ue,this.opacity=We,this.size=Ge,this.variant=`accent-primary`}render(){let e=Ke[this.variant];this.style.cssText=`
      --pulse-size: ${this.size};
      --pulse-duration: ${this.duration}s;
      --pulse-color: ${e};
      --pulse-opacity: ${this.opacity};
    `;let t=Array.from({length:this.rings},(e,t)=>this.renderRing(t,this.rings));return v`
      <div class="pulse-container">
        <div class="pulse-rings">${t}</div>
        <div class="pulse-content">
          <slot></slot>
        </div>
      </div>
    `}renderRing(e,t){let n=`animation-delay: ${e/t*this.duration}s;`;return v`<div class="pulse-ring" style=${n}></div>`}};H.styles=[ue,Ve],V([_({type:Number})],H.prototype,`rings`,void 0),V([_({type:Number})],H.prototype,`duration`,void 0),V([_({type:Number})],H.prototype,`opacity`,void 0),V([_()],H.prototype,`size`,void 0),V([_()],H.prototype,`variant`,void 0),H=V([x(`wui-pulse`)],H);var qe=[{id:`received`,title:`Receiving funds`,icon:`dollar`},{id:`processing`,title:`Swapping asset`,icon:`recycleHorizontal`},{id:`sending`,title:`Sending asset to the recipient address`,icon:`send`}],Je=[`success`,`submitted`,`failure`,`timeout`,`refund`],Ye=S`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }

  .token-badge-container {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: ${({borderRadius:e})=>e[4]};
    z-index: 3;
    min-width: 105px;
  }

  .token-badge-container.loading {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border: 3px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .token-badge-container.success {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border: 3px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .token-image-container {
    position: relative;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 64px;
    height: 64px;
  }

  .token-image.success {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .token-image.error {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .token-image.loading {
    background: ${({colors:e})=>e.accent010};
  }

  .token-image wui-icon {
    width: 32px;
    height: 32px;
  }

  .token-badge {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  .token-badge wui-text {
    white-space: nowrap;
  }

  .payment-lifecycle-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[6]};
    border-top-left-radius: ${({borderRadius:e})=>e[6]};
  }

  .payment-step-badge {
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  .payment-step-badge.loading {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .payment-step-badge.error {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  .payment-step-badge.success {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  .step-icon-container {
    position: relative;
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:e})=>e.round};
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .step-icon-box {
    position: absolute;
    right: -4px;
    bottom: -1px;
    padding: 2px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .step-icon-box.success {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }
`,U=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Xe={received:[`pending`,`success`,`submitted`],processing:[`success`,`submitted`],sending:[`success`,`submitted`]},Ze=3e3,W=class extends C{constructor(){super(),this.unsubscribe=[],this.pollingInterval=null,this.paymentAsset=R.state.paymentAsset,this.quoteStatus=R.state.quoteStatus,this.quote=R.state.quote,this.amount=R.state.amount,this.namespace=void 0,this.caipAddress=void 0,this.profileName=null,this.activeConnectorIds=u.state.activeConnectorIds,this.selectedExchange=R.state.selectedExchange,this.initializeNamespace(),this.unsubscribe.push(R.subscribeKey(`quoteStatus`,e=>this.quoteStatus=e),R.subscribeKey(`quote`,e=>this.quote=e),u.subscribeKey(`activeConnectorIds`,e=>this.activeConnectorIds=e),R.subscribeKey(`selectedExchange`,e=>this.selectedExchange=e))}connectedCallback(){super.connectedCallback(),this.startPolling()}disconnectedCallback(){super.disconnectedCallback(),this.stopPolling(),this.unsubscribe.forEach(e=>e())}render(){return v`
      <wui-flex flexDirection="column" .padding=${[`3`,`0`,`0`,`0`]} gap="2">
        ${this.tokenTemplate()} ${this.paymentTemplate()} ${this.paymentLifecycleTemplate()}
      </wui-flex>
    `}tokenTemplate(){let e=F(this.amount||`0`),t=this.paymentAsset.metadata.symbol??`Unknown`,n=m.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network),r=this.quoteStatus===`failure`||this.quoteStatus===`timeout`||this.quoteStatus===`refund`;return this.quoteStatus===`success`||this.quoteStatus===`submitted`?v`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image success">
          <wui-icon name="checkmark" color="success" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:r?v`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image error">
          <wui-icon name="close" color="error" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:v`
      <wui-flex alignItems="center" justifyContent="center">
        <wui-flex class="token-image-container">
          <wui-pulse size="125px" rings="3" duration="4" opacity="0.5" variant="accent-primary">
            <wui-flex justifyContent="center" alignItems="center" class="token-image loading">
              <wui-icon name="paperPlaneTitle" color="accent-primary" size="inherit"></wui-icon>
            </wui-flex>
          </wui-pulse>

          <wui-flex
            justifyContent="center"
            alignItems="center"
            class="token-badge-container loading"
          >
            <wui-flex
              alignItems="center"
              justifyContent="center"
              gap="01"
              padding="1"
              class="token-badge"
            >
              <wui-image
                src=${b(o.getNetworkImage(n))}
                class="chain-image"
                size="mdl"
              ></wui-image>

              <wui-text variant="lg-regular" color="primary">${e} ${t}</wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}paymentTemplate(){return v`
      <wui-flex flexDirection="column" gap="2" .padding=${[`0`,`6`,`0`,`6`]}>
        ${this.renderPayment()}
        <wui-separator></wui-separator>
        ${this.renderWallet()}
      </wui-flex>
    `}paymentLifecycleTemplate(){let e=this.getStepsWithStatus();return v`
      <wui-flex flexDirection="column" padding="4" gap="2" class="payment-lifecycle-container">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">PAYMENT CYCLE</wui-text>

          ${this.renderPaymentCycleBadge()}
        </wui-flex>

        <wui-flex flexDirection="column" gap="5" .padding=${[`2`,`0`,`2`,`0`]}>
          ${e.map(e=>this.renderStep(e))}
        </wui-flex>
      </wui-flex>
    `}renderPaymentCycleBadge(){let e=this.quoteStatus===`failure`||this.quoteStatus===`timeout`||this.quoteStatus===`refund`,t=this.quoteStatus===`success`||this.quoteStatus===`submitted`;if(e)return v`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge error"
          gap="1"
        >
          <wui-icon name="close" color="error" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="error">Failed</wui-text>
        </wui-flex>
      `;if(t)return v`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge success"
          gap="1"
        >
          <wui-icon name="checkmark" color="success" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="success">Completed</wui-text>
        </wui-flex>
      `;let n=this.quote?.timeInSeconds??0;return v`
      <wui-flex alignItems="center" justifyContent="space-between" gap="3">
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge loading"
          gap="1"
        >
          <wui-icon name="clock" color="default" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="primary">Est. ${n} sec</wui-text>
        </wui-flex>

        <wui-icon name="chevronBottom" color="default" size="xxs"></wui-icon>
      </wui-flex>
    `}renderPayment(){let e=m.getAllRequestedCaipNetworks().find(e=>{let t=this.quote?.origin.currency.network;if(!t)return!1;let{chainId:n}=h.parseCaipNetworkId(t);return w.isLowerCaseMatch(e.id.toString(),n.toString())}),t=F(d.formatNumber(this.quote?.origin.amount||`0`,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString()),n=this.quote?.origin.currency.metadata.symbol??`Unknown`;return v`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${[`3`,`0`,`3`,`0`]}
      >
        <wui-text variant="lg-regular" color="secondary">Payment Method</wui-text>

        <wui-flex flexDirection="column" alignItems="flex-end" gap="1">
          <wui-flex alignItems="center" gap="01">
            <wui-text variant="lg-regular" color="primary">${t}</wui-text>
            <wui-text variant="lg-regular" color="secondary">${n}</wui-text>
          </wui-flex>

          <wui-flex alignItems="center" gap="1">
            <wui-text variant="md-regular" color="secondary">on</wui-text>
            <wui-image
              src=${b(o.getNetworkImage(e))}
              size="xs"
            ></wui-image>
            <wui-text variant="md-regular" color="secondary">${e?.name}</wui-text>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}renderWallet(){return v`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${[`3`,`0`,`3`,`0`]}
      >
        <wui-text variant="lg-regular" color="secondary"
          >${this.selectedExchange?`Exchange`:`Wallet`}</wui-text
        >

        ${this.renderWalletText()}
      </wui-flex>
    `}renderWalletText(){let{image:e}=this.getWalletProperties({namespace:this.namespace}),{address:t}=this.caipAddress?h.parseCaipAddress(this.caipAddress):{},n=this.selectedExchange?.name;return this.selectedExchange?v`
        <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
          <wui-text variant="lg-regular" color="primary">${n}</wui-text>
          <wui-image src=${b(this.selectedExchange.imageUrl)} size="mdl"></wui-image>
        </wui-flex>
      `:v`
      <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
        <wui-text variant="lg-regular" color="primary">
          ${ce.getTruncateString({string:this.profileName||t||n||``,charsStart:this.profileName?16:4,charsEnd:this.profileName?0:6,truncate:this.profileName?`end`:`middle`})}
        </wui-text>

        <wui-image src=${b(e)} size="mdl"></wui-image>
      </wui-flex>
    `}getStepsWithStatus(){return this.quoteStatus===`failure`||this.quoteStatus===`timeout`||this.quoteStatus===`refund`?qe.map(e=>({...e,status:`failed`})):qe.map(e=>{let t=(Xe[e.id]??[]).includes(this.quoteStatus)?`completed`:`pending`;return{...e,status:t}})}renderStep({title:e,icon:t,status:n}){return v`
      <wui-flex alignItems="center" gap="3">
        <wui-flex justifyContent="center" alignItems="center" class="step-icon-container">
          <wui-icon name=${t} color="default" size="mdl"></wui-icon>

          <wui-flex alignItems="center" justifyContent="center" class=${le({"step-icon-box":!0,success:n===`completed`})}>
            ${this.renderStatusIndicator(n)}
          </wui-flex>
        </wui-flex>

        <wui-text variant="md-regular" color="primary">${e}</wui-text>
      </wui-flex>
    `}renderStatusIndicator(e){return e===`completed`?v`<wui-icon size="sm" color="success" name="checkmark"></wui-icon>`:e===`failed`?v`<wui-icon size="sm" color="error" name="close"></wui-icon>`:e===`pending`?v`<wui-loading-spinner color="accent-primary" size="sm"></wui-loading-spinner>`:null}startPolling(){this.pollingInterval||=(this.fetchQuoteStatus(),setInterval(()=>{this.fetchQuoteStatus()},Ze))}stopPolling(){this.pollingInterval&&=(clearInterval(this.pollingInterval),null)}async fetchQuoteStatus(){let e=R.state.requestId;if(!e||Je.includes(this.quoteStatus))this.stopPolling();else try{await R.fetchQuoteStatus({requestId:e}),Je.includes(this.quoteStatus)&&this.stopPolling()}catch{this.stopPolling()}}initializeNamespace(){let e=m.state.activeChain;this.namespace=e,this.caipAddress=m.getAccountData(e)?.caipAddress,this.profileName=m.getAccountData(e)?.profileName??null,this.unsubscribe.push(m.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress,this.profileName=e?.profileName??null},e))}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let n=u.getConnector({id:t,namespace:e});if(!n)return{name:void 0,image:void 0};let r=o.getConnectorImage(n);return{name:n.name,image:r}}};W.styles=Ye,U([y()],W.prototype,`paymentAsset`,void 0),U([y()],W.prototype,`quoteStatus`,void 0),U([y()],W.prototype,`quote`,void 0),U([y()],W.prototype,`amount`,void 0),U([y()],W.prototype,`namespace`,void 0),U([y()],W.prototype,`caipAddress`,void 0),U([y()],W.prototype,`profileName`,void 0),U([y()],W.prototype,`activeConnectorIds`,void 0),U([y()],W.prototype,`selectedExchange`,void 0),W=U([x(`w3m-pay-loading-view`)],W);var Qe=ae`
  :host {
    display: block;
  }
`,$e=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},G=class extends C{render(){return v`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-shimmer width="60px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Network Fee</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-shimmer
              width="75px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>

            <wui-flex alignItems="center" gap="01">
              <wui-shimmer width="14px" height="14px" rounded variant="light"></wui-shimmer>
              <wui-shimmer
                width="49px"
                height="14px"
                borderRadius="4xs"
                variant="light"
              ></wui-shimmer>
            </wui-flex>
          </wui-flex>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Service Fee</wui-text>
          <wui-shimmer width="75px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>
      </wui-flex>
    `}};G.styles=[Qe],G=$e([x(`w3m-pay-fees-skeleton`)],G);var et=S`
  :host {
    display: block;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }
`,tt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},K=class extends C{constructor(){super(),this.unsubscribe=[],this.quote=R.state.quote,this.unsubscribe.push(R.subscribeKey(`quote`,e=>this.quote=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=d.formatNumber(this.quote?.origin.amount||`0`,{decimals:this.quote?.origin.currency.metadata.decimals??0,round:6}).toString();return v`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-text variant="md-regular" color="primary">
            ${e} ${this.quote?.origin.currency.metadata.symbol||`Unknown`}
          </wui-text>
        </wui-flex>

        ${this.quote&&this.quote.fees.length>0?this.quote.fees.map(e=>this.renderFee(e)):null}
      </wui-flex>
    `}renderFee(e){let t=e.id===`network`,n=d.formatNumber(e.amount||`0`,{decimals:e.currency.metadata.decimals??0,round:6}).toString();if(t){let t=m.getAllRequestedCaipNetworks().find(t=>w.isLowerCaseMatch(t.caipNetworkId,e.currency.network));return v`
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">${e.label}</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-text variant="md-regular" color="primary">
              ${n} ${e.currency.metadata.symbol||`Unknown`}
            </wui-text>

            <wui-flex alignItems="center" gap="01">
              <wui-image
                src=${b(o.getNetworkImage(t))}
                size="xs"
              ></wui-image>
              <wui-text variant="sm-regular" color="secondary">
                ${t?.name||`Unknown`}
              </wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      `}return v`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-text variant="md-regular" color="secondary">${e.label}</wui-text>
        <wui-text variant="md-regular" color="primary">
          ${n} ${e.currency.metadata.symbol||`Unknown`}
        </wui-text>
      </wui-flex>
    `}};K.styles=[et],tt([y()],K.prototype,`quote`,void 0),K=tt([x(`w3m-pay-fees`)],K);var nt=S`
  :host {
    display: block;
    width: 100%;
  }

  .disabled-container {
    padding: ${({spacing:e})=>e[2]};
    min-height: 168px;
  }

  wui-icon {
    width: ${({spacing:e})=>e[8]};
    height: ${({spacing:e})=>e[8]};
  }

  wui-flex > wui-text {
    max-width: 273px;
  }
`,rt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},q=class extends C{constructor(){super(),this.unsubscribe=[],this.selectedExchange=R.state.selectedExchange,this.unsubscribe.push(R.subscribeKey(`selectedExchange`,e=>this.selectedExchange=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=!!this.selectedExchange;return v`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
        class="disabled-container"
      >
        <wui-icon name="coins" color="default" size="inherit"></wui-icon>

        <wui-text variant="md-regular" color="primary" align="center">
          You don't have enough funds to complete this transaction
        </wui-text>

        ${e?null:v`<wui-button
              size="md"
              variant="neutral-secondary"
              @click=${this.dispatchConnectOtherWalletEvent.bind(this)}
              >Connect other wallet</wui-button
            >`}
      </wui-flex>
    `}dispatchConnectOtherWalletEvent(){this.dispatchEvent(new CustomEvent(`connectOtherWallet`,{detail:!0,bubbles:!0,composed:!0}))}};q.styles=[nt],rt([_({type:Array})],q.prototype,`selectedExchange`,void 0),q=rt([x(`w3m-pay-options-empty`)],q);var it=S`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    min-height: 60px;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .chain-image {
    position: absolute;
    bottom: -3px;
    right: -5px;
    border: 2px solid ${({tokens:e})=>e.theme.foregroundSecondary};
  }
`,at=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},J=class extends C{render(){return v`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.renderOptionEntry()} ${this.renderOptionEntry()} ${this.renderOptionEntry()}
      </wui-flex>
    `}renderOptionEntry(){return v`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-shimmer
              width="32px"
              height="32px"
              rounded
              variant="light"
              class="token-image"
            ></wui-shimmer>
            <wui-shimmer
              width="16px"
              height="16px"
              rounded
              variant="light"
              class="chain-image"
            ></wui-shimmer>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-shimmer
              width="74px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
            <wui-shimmer
              width="46px"
              height="14px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}};J.styles=[it],J=at([x(`w3m-pay-options-skeleton`)],J);var ot=S`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    mask-image: var(--options-mask-image);
    -webkit-mask-image: var(--options-mask-image);
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    cursor: pointer;
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: background-color;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 32px;
    height: 32px;
  }

  .chain-image {
    position: absolute;
    width: 16px;
    height: 16px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  @media (hover: hover) and (pointer: fine) {
    .pay-option-container:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }
`,Y=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},st=300,X=class extends C{constructor(){super(),this.unsubscribe=[],this.options=[],this.selectedPaymentAsset=null}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.resizeObserver?.disconnect(),(this.shadowRoot?.querySelector(`.pay-options-container`))?.removeEventListener(`scroll`,this.handleOptionsListScroll.bind(this))}firstUpdated(){let e=this.shadowRoot?.querySelector(`.pay-options-container`);e&&(requestAnimationFrame(this.handleOptionsListScroll.bind(this)),e?.addEventListener(`scroll`,this.handleOptionsListScroll.bind(this)),this.resizeObserver=new ResizeObserver(()=>{this.handleOptionsListScroll()}),this.resizeObserver?.observe(e),this.handleOptionsListScroll())}render(){return v`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.options.map(e=>this.payOptionTemplate(e))}
      </wui-flex>
    `}payOptionTemplate(e){let{network:t,metadata:n,asset:r,amount:i=`0`}=e,a=m.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===t),s=`${t}:${r}`==`${this.selectedPaymentAsset?.network}:${this.selectedPaymentAsset?.asset}`,c=d.bigNumber(i,{safe:!0}),l=c.gt(0);return v`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        @click=${()=>this.onSelect?.(e)}
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-image
              src=${b(n.logoURI)}
              class="token-image"
              size="3xl"
            ></wui-image>
            <wui-image
              src=${b(o.getNetworkImage(a))}
              class="chain-image"
              size="md"
            ></wui-image>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="lg-regular" color="primary">${n.symbol}</wui-text>
            ${l?v`<wui-text variant="sm-regular" color="secondary">
                  ${c.round(6).toString()} ${n.symbol}
                </wui-text>`:null}
          </wui-flex>
        </wui-flex>

        ${s?v`<wui-icon name="checkmark" size="md" color="success"></wui-icon>`:null}
      </wui-flex>
    `}handleOptionsListScroll(){let e=this.shadowRoot?.querySelector(`.pay-options-container`);e&&(e.scrollHeight>st?(e.style.setProperty(`--options-mask-image`,`linear-gradient(
          to bottom,
          rgba(0, 0, 0, calc(1 - var(--options-scroll--top-opacity))) 0px,
          rgba(200, 200, 200, calc(1 - var(--options-scroll--top-opacity))) 1px,
          black 50px,
          black calc(100% - 50px),
          rgba(155, 155, 155, calc(1 - var(--options-scroll--bottom-opacity))) calc(100% - 1px),
          rgba(0, 0, 0, calc(1 - var(--options-scroll--bottom-opacity))) 100%
        )`),e.style.setProperty(`--options-scroll--top-opacity`,de.interpolate([0,50],[0,1],e.scrollTop).toString()),e.style.setProperty(`--options-scroll--bottom-opacity`,de.interpolate([0,50],[0,1],e.scrollHeight-e.scrollTop-e.offsetHeight).toString())):(e.style.setProperty(`--options-mask-image`,`none`),e.style.setProperty(`--options-scroll--top-opacity`,`0`),e.style.setProperty(`--options-scroll--bottom-opacity`,`0`)))}};X.styles=[ot],Y([_({type:Array})],X.prototype,`options`,void 0),Y([_()],X.prototype,`selectedPaymentAsset`,void 0),Y([_()],X.prototype,`onSelect`,void 0),X=Y([x(`w3m-pay-options`)],X);var ct=S`
  .payment-methods-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[5]};
    border-top-left-radius: ${({borderRadius:e})=>e[5]};
  }

  .pay-options-container {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[5]};
    padding: ${({spacing:e})=>e[1]};
  }

  w3m-tooltip-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: fit-content;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }

  w3m-pay-options.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`,Z=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Q={eip155:`ethereum`,solana:`solana`,bip122:`bitcoin`,ton:`ton`},lt={eip155:{icon:Q.eip155,label:`EVM`},solana:{icon:Q.solana,label:`Solana`},bip122:{icon:Q.bip122,label:`Bitcoin`},ton:{icon:Q.ton,label:`Ton`}},$=class extends C{constructor(){super(),this.unsubscribe=[],this.profileName=null,this.paymentAsset=R.state.paymentAsset,this.namespace=void 0,this.caipAddress=void 0,this.amount=R.state.amount,this.recipient=R.state.recipient,this.activeConnectorIds=u.state.activeConnectorIds,this.selectedPaymentAsset=R.state.selectedPaymentAsset,this.selectedExchange=R.state.selectedExchange,this.isFetchingQuote=R.state.isFetchingQuote,this.quoteError=R.state.quoteError,this.quote=R.state.quote,this.isFetchingTokenBalances=R.state.isFetchingTokenBalances,this.tokenBalances=R.state.tokenBalances,this.isPaymentInProgress=R.state.isPaymentInProgress,this.exchangeUrlForQuote=R.state.exchangeUrlForQuote,this.completedTransactionsCount=0,this.unsubscribe.push(R.subscribeKey(`paymentAsset`,e=>this.paymentAsset=e)),this.unsubscribe.push(R.subscribeKey(`tokenBalances`,e=>this.onTokenBalancesChanged(e))),this.unsubscribe.push(R.subscribeKey(`isFetchingTokenBalances`,e=>this.isFetchingTokenBalances=e)),this.unsubscribe.push(u.subscribeKey(`activeConnectorIds`,e=>this.activeConnectorIds=e)),this.unsubscribe.push(R.subscribeKey(`selectedPaymentAsset`,e=>this.selectedPaymentAsset=e)),this.unsubscribe.push(R.subscribeKey(`isFetchingQuote`,e=>this.isFetchingQuote=e)),this.unsubscribe.push(R.subscribeKey(`quoteError`,e=>this.quoteError=e)),this.unsubscribe.push(R.subscribeKey(`quote`,e=>this.quote=e)),this.unsubscribe.push(R.subscribeKey(`amount`,e=>this.amount=e)),this.unsubscribe.push(R.subscribeKey(`recipient`,e=>this.recipient=e)),this.unsubscribe.push(R.subscribeKey(`isPaymentInProgress`,e=>this.isPaymentInProgress=e)),this.unsubscribe.push(R.subscribeKey(`selectedExchange`,e=>this.selectedExchange=e)),this.unsubscribe.push(R.subscribeKey(`exchangeUrlForQuote`,e=>this.exchangeUrlForQuote=e)),this.resetQuoteState(),this.initializeNamespace(),this.fetchTokens()}disconnectedCallback(){super.disconnectedCallback(),this.resetAssetsState(),this.unsubscribe.forEach(e=>e())}updated(e){super.updated(e),e.has(`selectedPaymentAsset`)&&this.fetchQuote()}render(){return v`
      <wui-flex flexDirection="column">
        ${this.profileTemplate()}

        <wui-flex
          flexDirection="column"
          gap="4"
          class="payment-methods-container"
          .padding=${[`4`,`4`,`5`,`4`]}
        >
          ${this.paymentOptionsViewTemplate()} ${this.amountWithFeeTemplate()}

          <wui-flex
            alignItems="center"
            justifyContent="space-between"
            .padding=${[`1`,`0`,`1`,`0`]}
          >
            <wui-separator></wui-separator>
          </wui-flex>

          ${this.paymentActionsTemplate()}
        </wui-flex>
      </wui-flex>
    `}profileTemplate(){if(this.selectedExchange){let e=d.formatNumber(this.quote?.origin.amount,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return v`
        <wui-flex
          .padding=${[`4`,`3`,`4`,`3`]}
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-text variant="lg-regular" color="secondary">Paying with</wui-text>

          ${this.quote?v`<wui-text variant="lg-regular" color="primary">
                ${d.bigNumber(e,{safe:!0}).round(6).toString()}
                ${this.quote.origin.currency.metadata.symbol}
              </wui-text>`:v`<wui-shimmer width="80px" height="18px" variant="light"></wui-shimmer>`}
        </wui-flex>
      `}let e=t.getPlainAddress(this.caipAddress)??``,{name:n,image:r}=this.getWalletProperties({namespace:this.namespace}),{icon:i,label:a}=lt[this.namespace]??{};return v`
      <wui-flex
        .padding=${[`4`,`3`,`4`,`3`]}
        alignItems="center"
        justifyContent="space-between"
        gap="2"
      >
        <wui-wallet-switch
          profileName=${b(this.profileName)}
          address=${b(e)}
          imageSrc=${b(r)}
          alt=${b(n)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        <wui-wallet-switch
          profileName=${b(a)}
          address=${b(e)}
          icon=${b(i)}
          iconSize="xs"
          .enableGreenCircle=${!1}
          alt=${b(a)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
      </wui-flex>
    `}initializeNamespace(){let e=m.state.activeChain;this.namespace=e,this.caipAddress=m.getAccountData(e)?.caipAddress,this.profileName=m.getAccountData(e)?.profileName??null,this.unsubscribe.push(m.subscribeChainProp(`accountState`,e=>this.onAccountStateChanged(e),e))}async fetchTokens(){if(this.namespace){let e;if(this.caipAddress){let{chainId:t,chainNamespace:n}=h.parseCaipAddress(this.caipAddress),r=`${n}:${t}`;e=m.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===r)}await R.fetchTokens({caipAddress:this.caipAddress,caipNetwork:e,namespace:this.namespace})}}fetchQuote(){if(this.amount&&this.recipient&&this.selectedPaymentAsset&&this.paymentAsset){let{address:e}=this.caipAddress?h.parseCaipAddress(this.caipAddress):{};R.fetchQuote({amount:this.amount.toString(),address:e,sourceToken:this.selectedPaymentAsset,toToken:this.paymentAsset,recipient:this.recipient})}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let n=u.getConnector({id:t,namespace:e});if(!n)return{name:void 0,image:void 0};let r=o.getConnectorImage(n);return{name:n.name,image:r}}paymentOptionsViewTemplate(){return v`
      <wui-flex flexDirection="column" gap="2">
        <wui-text variant="sm-regular" color="secondary">CHOOSE PAYMENT OPTION</wui-text>
        <wui-flex class="pay-options-container">${this.paymentOptionsTemplate()}</wui-flex>
      </wui-flex>
    `}paymentOptionsTemplate(){let e=this.getPaymentAssetFromTokenBalances();if(this.isFetchingTokenBalances)return v`<w3m-pay-options-skeleton></w3m-pay-options-skeleton>`;if(e.length===0)return v`<w3m-pay-options-empty
        @connectOtherWallet=${this.onConnectOtherWallet.bind(this)}
      ></w3m-pay-options-empty>`;let t={disabled:this.isFetchingQuote};return v`<w3m-pay-options
      class=${le(t)}
      .options=${e}
      .selectedPaymentAsset=${b(this.selectedPaymentAsset)}
      .onSelect=${this.onSelectedPaymentAssetChanged.bind(this)}
    ></w3m-pay-options>`}amountWithFeeTemplate(){return this.isFetchingQuote||!this.selectedPaymentAsset||this.quoteError?v`<w3m-pay-fees-skeleton></w3m-pay-fees-skeleton>`:v`<w3m-pay-fees></w3m-pay-fees>`}paymentActionsTemplate(){let e=this.isFetchingQuote||this.isFetchingTokenBalances,t=this.isFetchingQuote||this.isFetchingTokenBalances||!this.selectedPaymentAsset||!!this.quoteError,n=d.formatNumber(this.quote?.origin.amount??0,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return this.selectedExchange?e||t?v`
          <wui-shimmer width="100%" height="48px" variant="light" ?rounded=${!0}></wui-shimmer>
        `:v`<wui-button
        size="lg"
        fullWidth
        variant="accent-secondary"
        @click=${this.onPayWithExchange.bind(this)}
      >
        ${`Continue in ${this.selectedExchange.name}`}

        <wui-icon name="arrowRight" color="inherit" size="sm" slot="iconRight"></wui-icon>
      </wui-button>`:v`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="md-regular" color="secondary">Order Total</wui-text>

          ${e||t?v`<wui-shimmer width="58px" height="32px" variant="light"></wui-shimmer>`:v`<wui-flex alignItems="center" gap="01">
                <wui-text variant="h4-regular" color="primary">${F(n)}</wui-text>

                <wui-text variant="lg-regular" color="secondary">
                  ${this.quote?.origin.currency.metadata.symbol||`Unknown`}
                </wui-text>
              </wui-flex>`}
        </wui-flex>

        ${this.actionButtonTemplate({isLoading:e,isDisabled:t})}
      </wui-flex>
    `}actionButtonTemplate(e){let t=j(this.quote),{isLoading:n,isDisabled:r}=e,i=`Pay`;return t.length>1&&this.completedTransactionsCount===0&&(i=`Approve`),v`
      <wui-button
        size="lg"
        variant="accent-primary"
        ?loading=${n||this.isPaymentInProgress}
        ?disabled=${r||this.isPaymentInProgress}
        @click=${()=>{t.length>0?this.onSendTransactions():this.onTransfer()}}
      >
        ${i}
        ${n?null:v`<wui-icon
              name="arrowRight"
              color="inherit"
              size="sm"
              slot="iconRight"
            ></wui-icon>`}
      </wui-button>
    `}getPaymentAssetFromTokenBalances(){return this.namespace?(this.tokenBalances[this.namespace]??[]).map(e=>{try{return Pe(e)}catch{return null}}).filter(e=>!!e).filter(e=>{let{chainId:t}=h.parseCaipNetworkId(e.network),{chainId:n}=h.parseCaipNetworkId(this.paymentAsset.network);return w.isLowerCaseMatch(e.asset,this.paymentAsset.asset)?!0:!this.selectedExchange||!w.isLowerCaseMatch(t.toString(),n.toString())}):[]}onTokenBalancesChanged(e){this.tokenBalances=e;let[t]=this.getPaymentAssetFromTokenBalances();t&&R.setSelectedPaymentAsset(t)}async onConnectOtherWallet(){await u.connect(),await g.open({view:`PayQuote`})}onAccountStateChanged(e){let{address:t}=this.caipAddress?h.parseCaipAddress(this.caipAddress):{};if(this.caipAddress=e?.caipAddress,this.profileName=e?.profileName??null,t){let{address:e}=this.caipAddress?h.parseCaipAddress(this.caipAddress):{};e?w.isLowerCaseMatch(e,t)||(this.resetAssetsState(),this.resetQuoteState(),this.fetchTokens()):g.close()}}onSelectedPaymentAssetChanged(e){this.isFetchingQuote||R.setSelectedPaymentAsset(e)}async onTransfer(){let e=A(this.quote);if(e){if(!w.isLowerCaseMatch(this.selectedPaymentAsset?.asset,e.deposit.currency))throw Error(`Quote asset is not the same as the selected payment asset`);let t=this.selectedPaymentAsset?.amount??`0`,r=d.formatNumber(e.deposit.amount,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!d.bigNumber(t).gte(r)){n.showError(`Insufficient funds`);return}if(this.quote&&this.selectedPaymentAsset&&this.caipAddress&&this.namespace){let{address:t}=h.parseCaipAddress(this.caipAddress);await R.onTransfer({chainNamespace:this.namespace,fromAddress:t,toAddress:e.deposit.receiver,amount:r,paymentAsset:this.selectedPaymentAsset}),R.setRequestId(e.requestId),c.push(`PayLoading`)}}}async onSendTransactions(){let e=this.selectedPaymentAsset?.amount??`0`,t=d.formatNumber(this.quote?.origin.amount??0,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!d.bigNumber(e).gte(t)){n.showError(`Insufficient funds`);return}let r=j(this.quote),[i]=j(this.quote,this.completedTransactionsCount);i&&this.namespace&&(await R.onSendTransaction({namespace:this.namespace,transactionStep:i}),this.completedTransactionsCount+=1,this.completedTransactionsCount===r.length&&(R.setRequestId(i.requestId),c.push(`PayLoading`)))}onPayWithExchange(){if(this.exchangeUrlForQuote){let e=t.returnOpenHref(``,`popupWindow`,`scrollbar=yes,width=480,height=720`);if(!e)throw Error(`Could not create popup window`);e.location.href=this.exchangeUrlForQuote;let n=A(this.quote);n&&R.setRequestId(n.requestId),R.initiatePayment(),c.push(`PayLoading`)}}resetAssetsState(){R.setSelectedPaymentAsset(null)}resetQuoteState(){R.resetQuoteState()}};$.styles=ct,Z([y()],$.prototype,`profileName`,void 0),Z([y()],$.prototype,`paymentAsset`,void 0),Z([y()],$.prototype,`namespace`,void 0),Z([y()],$.prototype,`caipAddress`,void 0),Z([y()],$.prototype,`amount`,void 0),Z([y()],$.prototype,`recipient`,void 0),Z([y()],$.prototype,`activeConnectorIds`,void 0),Z([y()],$.prototype,`selectedPaymentAsset`,void 0),Z([y()],$.prototype,`selectedExchange`,void 0),Z([y()],$.prototype,`isFetchingQuote`,void 0),Z([y()],$.prototype,`quoteError`,void 0),Z([y()],$.prototype,`quote`,void 0),Z([y()],$.prototype,`isFetchingTokenBalances`,void 0),Z([y()],$.prototype,`tokenBalances`,void 0),Z([y()],$.prototype,`isPaymentInProgress`,void 0),Z([y()],$.prototype,`exchangeUrlForQuote`,void 0),Z([y()],$.prototype,`completedTransactionsCount`,void 0),$=Z([x(`w3m-pay-quote-view`)],$);var ut=3e5;async function dt(e){return R.handleOpenPay(e)}async function ft(e,t=ut){if(t<=0)throw new k(D.INVALID_PAYMENT_CONFIG,`Timeout must be greater than 0`);try{await dt(e)}catch(e){throw e instanceof k?e:new k(D.UNABLE_TO_INITIATE_PAYMENT,e.message)}return new Promise((e,n)=>{let r=!1,i=setTimeout(()=>{r||(r=!0,o(),n(new k(D.GENERIC_PAYMENT_ERROR,`Payment timeout`)))},t);function a(){if(r)return;let t=R.state.currentPayment,n=R.state.error,a=R.state.isPaymentInProgress;if(t?.status===`SUCCESS`){r=!0,o(),clearTimeout(i),e({success:!0,result:t.result});return}if(t?.status===`FAILED`){r=!0,o(),clearTimeout(i),e({success:!1,error:n||`Payment failed`});return}n&&!a&&!t&&(r=!0,o(),clearTimeout(i),e({success:!1,error:n}))}let o=vt([_t(`currentPayment`,a),_t(`error`,a),_t(`isPaymentInProgress`,a)]);a()})}function pt(){return R.getExchanges()}function mt(){return R.state.currentPayment?.result}function ht(){return R.state.error}function gt(){return R.state.isPaymentInProgress}function _t(e,t){return R.subscribeKey(e,t)}function vt(e){return()=>{e.forEach(e=>{try{e()}catch{}})}}var yt={network:`eip155:8453`,asset:`native`,metadata:{name:`Ethereum`,symbol:`ETH`,decimals:18}},bt={network:`eip155:8453`,asset:`0x833589fcd6edb6e08f4c7c32d4f71b54bda02913`,metadata:{name:`USD Coin`,symbol:`USDC`,decimals:6}},xt={network:`eip155:84532`,asset:`native`,metadata:{name:`Ethereum`,symbol:`ETH`,decimals:18}},St={network:`eip155:1`,asset:`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`,metadata:{name:`USD Coin`,symbol:`USDC`,decimals:6}},Ct={network:`eip155:10`,asset:`0x0b2c639c533813f4aa9d7837caf62653d097ff85`,metadata:{name:`USD Coin`,symbol:`USDC`,decimals:6}},wt={network:`eip155:42161`,asset:`0xaf88d065e77c8cC2239327C5EDb3A432268e5831`,metadata:{name:`USD Coin`,symbol:`USDC`,decimals:6}},Tt={network:`eip155:137`,asset:`0x3c499c542cef5e3811e1192ce70d8cc03d5c3359`,metadata:{name:`USD Coin`,symbol:`USDC`,decimals:6}},Et={network:`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`,asset:`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`,metadata:{name:`USD Coin`,symbol:`USDC`,decimals:6}},Dt={network:`eip155:1`,asset:`0xdAC17F958D2ee523a2206206994597C13D831ec7`,metadata:{name:`Tether USD`,symbol:`USDT`,decimals:6}},Ot={network:`eip155:10`,asset:`0x94b008aA00579c1307B0EF2c499aD98a8ce58e58`,metadata:{name:`Tether USD`,symbol:`USDT`,decimals:6}},kt={network:`eip155:42161`,asset:`0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`,metadata:{name:`Tether USD`,symbol:`USDT`,decimals:6}},At={network:`eip155:137`,asset:`0xc2132d05d31c914a87c6611c10748aeb04b58e8f`,metadata:{name:`Tether USD`,symbol:`USDT`,decimals:6}},jt={network:`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`,asset:`Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`,metadata:{name:`Tether USD`,symbol:`USDT`,decimals:6}},Mt={network:`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`,asset:`native`,metadata:{name:`Solana`,symbol:`SOL`,decimals:9}},Nt=e({PayController:()=>R,W3mPayLoadingView:()=>W,W3mPayQuoteView:()=>$,W3mPayView:()=>B,arbitrumUSDC:()=>wt,arbitrumUSDT:()=>kt,baseETH:()=>yt,baseSepoliaETH:()=>xt,baseUSDC:()=>bt,ethereumUSDC:()=>St,ethereumUSDT:()=>Dt,getExchanges:()=>pt,getIsPaymentInProgress:()=>gt,getPayError:()=>ht,getPayResult:()=>mt,openPay:()=>dt,optimismUSDC:()=>Ct,optimismUSDT:()=>Ot,pay:()=>ft,polygonUSDC:()=>Tt,polygonUSDT:()=>At,solanaSOL:()=>Mt,solanaUSDC:()=>Et,solanaUSDT:()=>jt});export{R as n,Nt as t};