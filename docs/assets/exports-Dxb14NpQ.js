import{r as e}from"./rolldown-runtime-C_s2cVnS.js";import{y as t}from"./defineChain-m38zM7l1.js";import{t as n}from"./fallback-BTQOXFyB.js";import{n as r,r as i,t as a}from"./wui-list-wallet-C7BBOzTc.js";import{$ as o,B as s,C as c,E as l,F as u,H as d,I as ee,N as te,P as f,R as p,S as m,V as ne,_ as re,b as h,d as ie,g,h as ae,l as _,n as oe,ot as v,r as y,t as b,tt as se,v as x,w as ce,x as le}from"./ApiController-CuG_Qvhw.js";import"./w3m-activity-list-BuJ24rnG.js";import{t as ue}from"./NavigationUtil-CLCRNDHF.js";import{n as de,r as fe,t as pe}from"./wui-list-social-DZd1lDa2.js";import{C as me,_ as S,b as C,c as w,g as T,h as E,o as D,p as O,s as k,t as he,u as A,v as j}from"./wui-text-DdqDVVll.js";import{t as ge}from"./AlertController-BrOlG41X.js";import"./w3m-tooltip-C4D53e0z.js";import{t as _e}from"./wui-loading-thumbnail-B7f8WK5s.js";import{t as M}from"./ExchangeController-BLsl0Z0o.js";import{t as ve}from"./MathUtil-B2UslVSw.js";import"./wui-loading-spinner-oXBCaDJX.js";import"./wui-button-uk6CL7QJ.js";import"./wui-icon-CyCfeB4c.js";import"./wui-icon-link-Csxq2pXY.js";import"./wui-image-Bqag7By0.js";import"./wui-list-item-BOx2yAyk.js";import"./wui-loading-spinner-DhyYR1F_.js";import{n as ye,t as N}from"./wui-wallet-switch-KaJLcLgq.js";import"./wui-separator-D-MWfeED.js";import"./wui-icon-box-DE5dwISV.js";import{t as P}from"./ConstantsUtil-Bn8iuqNQ.js";import"./wui-shimmer-TuSKjOg_.js";import"./wui-shimmer-DXCN0YPq.js";import"./wui-link-DcBAE0Cj.js";import"./wui-icon-box-DIY3HiHJ.js";import{n as be,t as xe}from"./ref-C1mDyImE.js";import"./wui-input-text-Dzkyf0S5.js";import"./wui-email-input-Be12XHws.js";import{t as Se}from"./HelpersUtil-DuSnYqLx.js";import"./wui-avatar-DZPTTqiw.js";import"./w3m-onramp-providers-footer-uEbzk9Qk.js";import"./wui-list-token-Cn3Ht2Vc.js";import"./wui-qr-code-DqNvFqYC.js";import"./wui-visual-CjbqazhJ.js";import"./wui-input-text-DwV4ogif.js";var Ce={ConnectorExplorerIds:{[v.CONNECTOR_ID.COINBASE]:`d0ca99ff52b99abc48743dad0f7fc891e041be73574f7fac4afe5d4bb83845c8`,[v.CONNECTOR_ID.COINBASE_SDK]:`d0ca99ff52b99abc48743dad0f7fc891e041be73574f7fac4afe5d4bb83845c8`,[v.CONNECTOR_ID.BASE_ACCOUNT]:`fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa`,[v.CONNECTOR_ID.SAFE]:`225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f`,[v.CONNECTOR_ID.LEDGER]:`19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927`,[v.CONNECTOR_ID.OKX]:`971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709`,[P.METMASK_CONNECTOR_NAME]:`c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96`,[P.TRUST_CONNECTOR_NAME]:`4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0`,[P.SOLFLARE_CONNECTOR_NAME]:`1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79`,[P.PHANTOM_CONNECTOR_NAME]:`a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393`,[P.COIN98_CONNECTOR_NAME]:`2a3c89040ac3b723a1972a33a125b1db11e258a6975d3a61252cd64e6ea5ea01`,[P.MAGIC_EDEN_CONNECTOR_NAME]:`8b830a2b724a9c3fbab63af6f55ed29c9dfa8a55e732dc88c80a196a2ba136c6`,[P.BACKPACK_CONNECTOR_NAME]:`2bd8c14e035c2d48f184aaa168559e86b0e3433228d3c4075900a221785019b0`,[P.BITGET_CONNECTOR_NAME]:`38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662`,[P.FRONTIER_CONNECTOR_NAME]:`85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041`,[P.XVERSE_CONNECTOR_NAME]:`2a87d74ae02e10bdd1f51f7ce6c4e1cc53cd5f2c0b6b5ad0d7b3007d2b13de7b`,[P.LEATHER_CONNECTOR_NAME]:`483afe1df1df63daf313109971ff3ef8356ddf1cc4e45877d205eee0b7893a13`,[P.OKX_CONNECTOR_NAME]:`971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709`,[P.BINANCE_CONNECTOR_NAME]:`2fafea35bb471d22889ccb49c08d99dd0a18a37982602c33f696a5723934ba25`},NetworkImageIds:{1:`ba0ba0cd-17c6-4806-ad93-f9d174f17900`,42161:`3bff954d-5cb0-47a0-9a23-d20192e74600`,43114:`30c46e53-e989-45fb-4549-be3bd4eb3b00`,56:`93564157-2e8e-4ce7-81df-b264dbee9b00`,250:`06b26297-fe0c-4733-5d6b-ffa5498aac00`,10:`ab9c186a-c52f-464b-2906-ca59d760a400`,137:`41d04d42-da3b-4453-8506-668cc0727900`,5e3:`e86fae9b-b770-4eea-e520-150e12c81100`,295:`6a97d510-cac8-4e58-c7ce-e8681b044c00`,11155111:`e909ea0a-f92a-4512-c8fc-748044ea6800`,84532:`a18a7ecd-e307-4360-4746-283182228e00`,1301:`4eeea7ef-0014-4649-5d1d-07271a80f600`,130:`2257980a-3463-48c6-cbac-a42d2a956e00`,10143:`0a728e83-bacb-46db-7844-948f05434900`,143:`0a728e83-bacb-46db-7844-948f05434900`,100:`02b53f6a-e3d4-479e-1cb4-21178987d100`,9001:`f926ff41-260d-4028-635e-91913fc28e00`,324:`b310f07f-4ef7-49f3-7073-2a0a39685800`,314:`5a73b3dd-af74-424e-cae0-0de859ee9400`,4689:`34e68754-e536-40da-c153-6ef2e7188a00`,1088:`3897a66d-40b9-4833-162f-a2c90531c900`,1284:`161038da-44ae-4ec7-1208-0ea569454b00`,1285:`f1d73bb6-5450-4e18-38f7-fb6484264a00`,7777777:`845c60df-d429-4991-e687-91ae45791600`,42220:`ab781bbc-ccc6-418d-d32d-789b15da1f00`,8453:`7289c336-3981-4081-c5f4-efc26ac64a00`,1313161554:`3ff73439-a619-4894-9262-4470c773a100`,2020:`b8101fc0-9c19-4b6f-ec65-f6dfff106e00`,2021:`b8101fc0-9c19-4b6f-ec65-f6dfff106e00`,80094:`e329c2c9-59b0-4a02-83e4-212ff3779900`,2741:`fc2427d1-5af9-4a9c-8da5-6f94627cd900`,"5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp":`a1b58899-f671-4276-6a5e-56ca5bd59700`,"4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z":`a1b58899-f671-4276-6a5e-56ca5bd59700`,EtWTRABZaYq6iMfeYKouRu166VU2xqa1:`a1b58899-f671-4276-6a5e-56ca5bd59700`,"000000000019d6689c085ae165831e93":`0b4838db-0161-4ffe-022d-532bf03dba00`,"000000000933ea01ad0ee984209779ba":`39354064-d79b-420b-065d-f980c4b78200`,"00000008819873e925422c1ff0f99f7c":`b3406e4a-bbfc-44fb-e3a6-89673c78b700`,"-239":`20f673c0-095e-49b2-07cf-eb5049dcf600`,"-3":`20f673c0-095e-49b2-07cf-eb5049dcf600`,"0x2b6653dc":`3502bb86-cc4e-420f-a387-59ea63a28b00`,"0x94a9059e":`3502bb86-cc4e-420f-a387-59ea63a28b00`,"0xcd8690dc":`3502bb86-cc4e-420f-a387-59ea63a28b00`},ConnectorImageIds:{[v.CONNECTOR_ID.COINBASE]:`0c2840c3-5b04-4c44-9661-fbd4b49e1800`,[v.CONNECTOR_ID.COINBASE_SDK]:`0c2840c3-5b04-4c44-9661-fbd4b49e1800`,[v.CONNECTOR_ID.BASE_ACCOUNT]:`bba2c8be-7fd1-463e-42b1-796ecb0ad200`,[v.CONNECTOR_ID.SAFE]:`461db637-8616-43ce-035a-d89b8a1d5800`,[v.CONNECTOR_ID.LEDGER]:`54a1aa77-d202-4f8d-0fb2-5d2bb6db0300`,[v.CONNECTOR_ID.WALLET_CONNECT]:`ef1a1fcf-7fe8-4d69-bd6d-fda1345b4400`,[v.CONNECTOR_ID.INJECTED]:`07ba87ed-43aa-4adf-4540-9e6a2b9cae00`},ConnectorNamesMap:{[v.CONNECTOR_ID.INJECTED]:`Browser Wallet`,[v.CONNECTOR_ID.WALLET_CONNECT]:`WalletConnect`,[v.CONNECTOR_ID.COINBASE]:`Coinbase`,[v.CONNECTOR_ID.COINBASE_SDK]:`Coinbase`,[v.CONNECTOR_ID.BASE_ACCOUNT]:`Base Account`,[v.CONNECTOR_ID.LEDGER]:`Ledger`,[v.CONNECTOR_ID.SAFE]:`Safe`},ConnectorTypesMap:{[v.CONNECTOR_ID.INJECTED]:`INJECTED`,[v.CONNECTOR_ID.WALLET_CONNECT]:`WALLET_CONNECT`,[v.CONNECTOR_ID.EIP6963]:`ANNOUNCED`,[v.CONNECTOR_ID.AUTH]:`AUTH`,[v.CONNECTOR_ID.COINBASE]:`EXTERNAL`,[v.CONNECTOR_ID.COINBASE_SDK]:`EXTERNAL`,[v.CONNECTOR_ID.BASE_ACCOUNT]:`EXTERNAL`,[P.CONNECTOR_TYPE_AUTH]:`AUTH`},WalletConnectRpcChainIds:[1,5,11155111,10,420,42161,421613,137,80001,42220,1313161554,1313161555,56,97,43114,43113,100,8453,84531,7777777,999,324,280]},we=`rpc.walletconnect.org`;function Te(e,t){let n=new URL(`https://rpc.walletconnect.org/v1/`);return n.searchParams.set(`chainId`,e),n.searchParams.set(`projectId`,t),n.toString()}var Ee=`near:mainnet.solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp.eip155:1101.eip155:56.eip155:42161.eip155:7777777.eip155:59144.eip155:324.solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1.eip155:5000.solana:4sgjmw1sunhzsxgspuhpqldx6wiyjntz.eip155:80084.eip155:5003.eip155:100.eip155:8453.eip155:42220.eip155:1313161555.eip155:17000.eip155:1.eip155:300.eip155:1313161554.eip155:1329.eip155:84532.eip155:421614.eip155:11155111.eip155:8217.eip155:43114.solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z.eip155:999999999.eip155:11155420.eip155:80002.eip155:97.eip155:43113.eip155:137.eip155:10.eip155:1301.eip155:80094.eip155:80069.eip155:560048.eip155:31.eip155:2818.eip155:57054.eip155:911867.eip155:534351.eip155:1112.eip155:534352.eip155:1111.eip155:146.eip155:130.eip155:1284.eip155:30.eip155:2810.eip155:55931.bip122:000000000019d6689c085ae165831e93.bip122:000000000933ea01ad0ee984209779ba.tron:0x2b6653dc.tron:0xcd8690dc`.split(`.`),De={extendRpcUrlWithProjectId(e,t){let n=!1;try{n=new URL(e).host===we}catch{n=!1}if(n){let n=new URL(e);return n.searchParams.has(`projectId`)||n.searchParams.set(`projectId`,t),n.toString()}return e},isCaipNetwork(e){return`chainNamespace`in e&&`caipNetworkId`in e},getChainNamespace(e){return this.isCaipNetwork(e)?e.chainNamespace:v.CHAIN.EVM},getCaipNetworkId(e){return this.isCaipNetwork(e)?e.caipNetworkId:`${v.CHAIN.EVM}:${e.id}`},getDefaultRpcUrl(e,t,n){let r=e.rpcUrls?.default?.http?.[0];return Ee.includes(t)?Te(t,n):r||``},extendCaipNetwork(e,{customNetworkImageUrls:t,projectId:n,customRpcUrls:r}){let i=this.getChainNamespace(e),a=this.getCaipNetworkId(e),o=e.rpcUrls?.default?.http?.[0],s=this.getDefaultRpcUrl(e,a,n),c=e?.rpcUrls?.chainDefault?.http?.[0]||o,l=r?.[a]?.map(e=>e.url)||[],u=[...l,...s?[s]:[]],d=[...l];return c&&!d.includes(c)&&d.push(c),{...e,chainNamespace:i,caipNetworkId:a,assets:{imageId:Ce.NetworkImageIds[e.id],imageUrl:t?.[e.id]},rpcUrls:{...e.rpcUrls,default:{http:u},chainDefault:{http:d}}}},extendCaipNetworks(e,{customNetworkImageUrls:t,projectId:n,customRpcUrls:r}){return e.map(e=>De.extendCaipNetwork(e,{customNetworkImageUrls:t,customRpcUrls:r,projectId:n}))},getViemTransport(e,r,i){let a=[];return i?.forEach(e=>{a.push(t(e.url,e.config))}),Ee.includes(e.caipNetworkId)&&a.push(t(Te(e.caipNetworkId,r),{fetchOptions:{headers:{"Content-Type":`text/plain`}}})),e?.rpcUrls?.default?.http?.forEach(e=>{a.push(t(e))}),n(a)},extendWagmiTransports(e,r,i){if(Ee.includes(e.caipNetworkId)){let a=this.getDefaultRpcUrl(e,e.caipNetworkId,r);return n([i,t(a)])}return i},getUnsupportedNetwork(e){return{id:e.split(`:`)[1],caipNetworkId:e,name:v.UNSUPPORTED_NETWORK_NAME,chainNamespace:e.split(`:`)[0],nativeCurrency:{name:``,decimals:0,symbol:``},rpcUrls:{default:{http:[]}}}},getCaipNetworkFromStorage(e){let t=ne.getActiveCaipNetworkId(),n=y.getAllRequestedCaipNetworks(),r=Array.from(y.state.chains?.keys()||[]),i=t?.split(`:`)[0],a=i?r.includes(i):!1,o=n?.find(e=>e.caipNetworkId===t);return a&&!o&&t?this.getUnsupportedNetwork(t):o||e||n?.[0]}},Oe=O`
  :host {
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e[20]};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[1]};
    color: ${({tokens:e})=>e.theme.textSecondary};
    border-radius: ${({borderRadius:e})=>e[16]};
    height: 32px;
    transition: box-shadow ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: box-shadow;
  }

  button wui-flex.avatar-container {
    width: 28px;
    height: 24px;
    position: relative;

    wui-flex.network-image-container {
      position: absolute;
      bottom: 0px;
      right: 0px;
      width: 12px;
      height: 12px;
    }

    wui-flex.network-image-container wui-icon {
      background: ${({tokens:e})=>e.theme.foregroundPrimary};
    }

    wui-avatar {
      width: 24px;
      min-width: 24px;
      height: 24px;
    }

    wui-icon {
      width: 12px;
      height: 12px;
    }
  }

  wui-image,
  wui-icon {
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  wui-text {
    white-space: nowrap;
  }

  button wui-flex.balance-container {
    height: 100%;
    border-radius: ${({borderRadius:e})=>e[16]};
    padding-left: ${({spacing:e})=>e[1]};
    padding-right: ${({spacing:e})=>e[1]};
    background: ${({tokens:e})=>e.theme.foregroundSecondary};
    color: ${({tokens:e})=>e.theme.textPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled,
  button:focus-visible:enabled,
  button:active:enabled {
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.2);

    wui-flex.balance-container {
      background: ${({tokens:e})=>e.theme.foregroundTertiary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled wui-text,
  button:disabled wui-flex.avatar-container {
    opacity: 0.3;
  }
`,ke=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},F=class extends j{constructor(){super(...arguments),this.networkSrc=void 0,this.avatarSrc=void 0,this.balance=void 0,this.isUnsupportedChain=void 0,this.disabled=!1,this.loading=!1,this.address=``,this.profileName=``,this.charsStart=4,this.charsEnd=6}render(){return C`
      <button
        ?disabled=${this.disabled}
        class=${E(this.balance?void 0:`local-no-balance`)}
        data-error=${E(this.isUnsupportedChain)}
      >
        ${this.imageTemplate()} ${this.addressTemplate()} ${this.balanceTemplate()}
      </button>
    `}imageTemplate(){let e=this.networkSrc?C`<wui-image src=${this.networkSrc}></wui-image>`:C` <wui-icon size="inherit" color="inherit" name="networkPlaceholder"></wui-icon> `;return C`<wui-flex class="avatar-container">
      <wui-avatar
        .imageSrc=${this.avatarSrc}
        alt=${this.address}
        address=${this.address}
      ></wui-avatar>

      <wui-flex class="network-image-container">${e}</wui-flex>
    </wui-flex>`}addressTemplate(){return C`<wui-text variant="md-regular" color="inherit">
      ${this.address?k.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?18:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?`end`:`middle`}):null}
    </wui-text>`}balanceTemplate(){if(this.balance){let e=this.loading?C`<wui-loading-spinner size="md" color="inherit"></wui-loading-spinner>`:C`<wui-text variant="md-regular" color="inherit"> ${this.balance}</wui-text>`;return C`<wui-flex alignItems="center" justifyContent="center" class="balance-container"
        >${e}</wui-flex
      >`}return null}};F.styles=[A,w,Oe],ke([S()],F.prototype,`networkSrc`,void 0),ke([S()],F.prototype,`avatarSrc`,void 0),ke([S()],F.prototype,`balance`,void 0),ke([S({type:Boolean})],F.prototype,`isUnsupportedChain`,void 0),ke([S({type:Boolean})],F.prototype,`disabled`,void 0),ke([S({type:Boolean})],F.prototype,`loading`,void 0),ke([S()],F.prototype,`address`,void 0),ke([S()],F.prototype,`profileName`,void 0),ke([S()],F.prototype,`charsStart`,void 0),ke([S()],F.prototype,`charsEnd`,void 0),F=ke([D(`wui-account-button`)],F);var I=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},L=class extends j{constructor(){super(...arguments),this.unsubscribe=[],this.disabled=!1,this.balance=`show`,this.charsStart=4,this.charsEnd=6,this.namespace=void 0,this.isSupported=p.state.allowUnsupportedChain?!0:!y.state.activeChain||y.checkIfSupportedNetwork(y.state.activeChain)}connectedCallback(){super.connectedCallback(),this.setAccountData(y.getAccountData(this.namespace)),this.setNetworkData(y.getNetworkData(this.namespace))}firstUpdated(){let e=this.namespace;e?this.unsubscribe.push(y.subscribeChainProp(`accountState`,e=>{this.setAccountData(e)},e),y.subscribeChainProp(`networkState`,t=>{this.setNetworkData(t),this.isSupported=y.checkIfSupportedNetwork(e,t?.caipNetwork?.caipNetworkId)},e)):this.unsubscribe.push(u.subscribeNetworkImages(()=>{this.networkImage=f.getNetworkImage(this.network)}),y.subscribeKey(`activeCaipAddress`,e=>{this.caipAddress=e}),y.subscribeChainProp(`accountState`,e=>{this.setAccountData(e)}),y.subscribeKey(`activeCaipNetwork`,e=>{this.network=e,this.networkImage=f.getNetworkImage(e),this.isSupported=!e?.chainNamespace||y.checkIfSupportedNetwork(e?.chainNamespace),this.fetchNetworkImage(e)}))}updated(){this.fetchNetworkImage(this.network)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!y.state.activeChain)return null;let e=this.balance===`show`,t=typeof this.balanceVal!=`string`,{formattedText:n}=s.parseBalance(this.balanceVal,this.balanceSymbol);return C`
      <wui-account-button
        .disabled=${!!this.disabled}
        .isUnsupportedChain=${!p.state.allowUnsupportedChain&&!this.isSupported}
        address=${E(s.getPlainAddress(this.caipAddress))}
        profileName=${E(this.profileName)}
        networkSrc=${E(this.networkImage)}
        avatarSrc=${E(this.profileImage)}
        balance=${e?n:``}
        @click=${this.onClick.bind(this)}
        data-testid=${`account-button${this.namespace?`-${this.namespace}`:``}`}
        .charsStart=${this.charsStart}
        .charsEnd=${this.charsEnd}
        ?loading=${t}
      >
      </wui-account-button>
    `}onClick(){this.isSupported||p.state.allowUnsupportedChain?x.open({namespace:this.namespace}):x.open({view:`UnsupportedChain`})}async fetchNetworkImage(e){e?.assets?.imageId&&(this.networkImage=await f.fetchNetworkImage(e?.assets?.imageId))}setAccountData(e){e&&(this.caipAddress=e.caipAddress,this.balanceVal=e.balance,this.balanceSymbol=e.balanceSymbol,this.profileName=e.profileName,this.profileImage=e.profileImage)}setNetworkData(e){e&&(this.network=e.caipNetwork,this.networkImage=f.getNetworkImage(e.caipNetwork))}};I([S({type:Boolean})],L.prototype,`disabled`,void 0),I([S()],L.prototype,`balance`,void 0),I([S()],L.prototype,`charsStart`,void 0),I([S()],L.prototype,`charsEnd`,void 0),I([S()],L.prototype,`namespace`,void 0),I([T()],L.prototype,`caipAddress`,void 0),I([T()],L.prototype,`balanceVal`,void 0),I([T()],L.prototype,`balanceSymbol`,void 0),I([T()],L.prototype,`profileName`,void 0),I([T()],L.prototype,`profileImage`,void 0),I([T()],L.prototype,`network`,void 0),I([T()],L.prototype,`networkImage`,void 0),I([T()],L.prototype,`isSupported`,void 0);var Ae=class extends L{};Ae=I([D(`w3m-account-button`)],Ae);var je=class extends L{};je=I([D(`appkit-account-button`)],je);var Me=me`
  :host {
    display: block;
    width: max-content;
  }
`,Ne=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},R=class extends j{constructor(){super(...arguments),this.unsubscribe=[],this.disabled=!1,this.balance=void 0,this.size=void 0,this.label=void 0,this.loadingLabel=void 0,this.charsStart=4,this.charsEnd=6,this.namespace=void 0}firstUpdated(){this.caipAddress=this.namespace?y.getAccountData(this.namespace)?.caipAddress:y.state.activeCaipAddress,this.namespace?this.unsubscribe.push(y.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress},this.namespace)):this.unsubscribe.push(y.subscribeKey(`activeCaipAddress`,e=>this.caipAddress=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return this.caipAddress?C`
          <appkit-account-button
            .disabled=${!!this.disabled}
            balance=${E(this.balance)}
            .charsStart=${E(this.charsStart)}
            .charsEnd=${E(this.charsEnd)}
            namespace=${E(this.namespace)}
          >
          </appkit-account-button>
        `:C`
          <appkit-connect-button
            size=${E(this.size)}
            label=${E(this.label)}
            loadingLabel=${E(this.loadingLabel)}
            namespace=${E(this.namespace)}
          ></appkit-connect-button>
        `}};R.styles=Me,Ne([S({type:Boolean})],R.prototype,`disabled`,void 0),Ne([S()],R.prototype,`balance`,void 0),Ne([S()],R.prototype,`size`,void 0),Ne([S()],R.prototype,`label`,void 0),Ne([S()],R.prototype,`loadingLabel`,void 0),Ne([S()],R.prototype,`charsStart`,void 0),Ne([S()],R.prototype,`charsEnd`,void 0),Ne([S()],R.prototype,`namespace`,void 0),Ne([T()],R.prototype,`caipAddress`,void 0);var Pe=class extends R{};Pe=Ne([D(`w3m-button`)],Pe);var Fe=class extends R{};Fe=Ne([D(`appkit-button`)],Fe);var Ie=O`
  :host {
    position: relative;
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='sm'] {
    padding: ${({spacing:e})=>e[2]};
  }

  button[data-size='md'] {
    padding: ${({spacing:e})=>e[3]};
  }

  button[data-size='lg'] {
    padding: ${({spacing:e})=>e[4]};
  }

  button[data-variant='primary'] {
    background: ${({tokens:e})=>e.core.backgroundAccentPrimary};
  }

  button[data-variant='secondary'] {
    background: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  button:hover:enabled {
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  button:disabled {
    cursor: not-allowed;
  }

  button[data-loading='true'] {
    cursor: not-allowed;
  }

  button[data-loading='true'][data-size='sm'] {
    border-radius: ${({borderRadius:e})=>e[32]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
  }

  button[data-loading='true'][data-size='md'] {
    border-radius: ${({borderRadius:e})=>e[20]};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[4]};
  }

  button[data-loading='true'][data-size='lg'] {
    border-radius: ${({borderRadius:e})=>e[16]};
    padding: ${({spacing:e})=>e[4]} ${({spacing:e})=>e[5]};
  }
`,Le=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Re=class extends j{constructor(){super(...arguments),this.size=`md`,this.variant=`primary`,this.loading=!1,this.text=`Connect Wallet`}render(){return C`
      <button
        data-loading=${this.loading}
        data-variant=${this.variant}
        data-size=${this.size}
        ?disabled=${this.loading}
      >
        ${this.contentTemplate()}
      </button>
    `}contentTemplate(){let e={lg:`lg-regular`,md:`md-regular`,sm:`sm-regular`},t={primary:`invert`,secondary:`accent-primary`};return this.loading?C`<wui-loading-spinner
      color=${t[this.variant]}
      size=${this.size}
    ></wui-loading-spinner>`:C` <wui-text variant=${e[this.size]} color=${t[this.variant]}>
        ${this.text}
      </wui-text>`}};Re.styles=[A,w,Ie],Le([S()],Re.prototype,`size`,void 0),Le([S()],Re.prototype,`variant`,void 0),Le([S({type:Boolean})],Re.prototype,`loading`,void 0),Le([S()],Re.prototype,`text`,void 0),Re=Le([D(`wui-connect-button`)],Re);var ze=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Be=class extends j{constructor(){super(),this.unsubscribe=[],this.size=`md`,this.label=`Connect Wallet`,this.loadingLabel=`Connecting...`,this.open=x.state.open,this.loading=this.namespace?x.state.loadingNamespaceMap.get(this.namespace):x.state.loading,this.unsubscribe.push(x.subscribe(e=>{this.open=e.open,this.loading=this.namespace?e.loadingNamespaceMap.get(this.namespace):e.loading}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return C`
      <wui-connect-button
        size=${E(this.size)}
        .loading=${this.loading}
        @click=${this.onClick.bind(this)}
        data-testid=${`connect-button${this.namespace?`-${this.namespace}`:``}`}
      >
        ${this.loading?this.loadingLabel:this.label}
      </wui-connect-button>
    `}onClick(){this.open?x.close():this.loading||x.open({view:`Connect`,namespace:this.namespace})}};ze([S()],Be.prototype,`size`,void 0),ze([S()],Be.prototype,`label`,void 0),ze([S()],Be.prototype,`loadingLabel`,void 0),ze([S()],Be.prototype,`namespace`,void 0),ze([T()],Be.prototype,`open`,void 0),ze([T()],Be.prototype,`loading`,void 0);var Ve=class extends Be{};Ve=ze([D(`w3m-connect-button`)],Ve);var He=class extends Be{};He=ze([D(`appkit-connect-button`)],He);var Ue=O`
  :host {
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e[32]};
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]}
      ${({spacing:e})=>e[1]} ${({spacing:e})=>e[1]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button[data-size='sm'] > wui-icon-box,
  button[data-size='sm'] > wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='md'] > wui-icon-box,
  button[data-size='md'] > wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='lg'] > wui-icon-box,
  button[data-size='lg'] > wui-image {
    width: 24px;
    height: 24px;
  }

  wui-image,
  wui-icon-box {
    border-radius: ${({borderRadius:e})=>e[32]};
  }
`,We=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Ge=class extends j{constructor(){super(...arguments),this.imageSrc=void 0,this.isUnsupportedChain=void 0,this.disabled=!1,this.size=`lg`}render(){return C`
      <button data-size=${this.size} data-testid="wui-network-button" ?disabled=${this.disabled}>
        ${this.visualTemplate()}
        <wui-text variant=${{sm:`sm-regular`,md:`md-regular`,lg:`lg-regular`}[this.size]} color="primary">
          <slot></slot>
        </wui-text>
      </button>
    `}visualTemplate(){return this.isUnsupportedChain?C` <wui-icon-box color="error" icon="warningCircle"></wui-icon-box> `:this.imageSrc?C`<wui-image src=${this.imageSrc}></wui-image>`:C` <wui-icon size="xl" color="default" name="networkPlaceholder"></wui-icon> `}};Ge.styles=[A,w,Ue],We([S()],Ge.prototype,`imageSrc`,void 0),We([S({type:Boolean})],Ge.prototype,`isUnsupportedChain`,void 0),We([S({type:Boolean})],Ge.prototype,`disabled`,void 0),We([S()],Ge.prototype,`size`,void 0),Ge=We([D(`wui-network-button`)],Ge);var Ke=me`
  :host {
    display: block;
    width: max-content;
  }
`,qe=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Je=class extends j{constructor(){super(),this.unsubscribe=[],this.disabled=!1,this.network=y.state.activeCaipNetwork,this.networkImage=f.getNetworkImage(this.network),this.caipAddress=y.state.activeCaipAddress,this.loading=x.state.loading,this.isSupported=p.state.allowUnsupportedChain?!0:!y.state.activeChain||y.checkIfSupportedNetwork(y.state.activeChain),this.unsubscribe.push(u.subscribeNetworkImages(()=>{this.networkImage=f.getNetworkImage(this.network)}),y.subscribeKey(`activeCaipAddress`,e=>{this.caipAddress=e}),y.subscribeKey(`activeCaipNetwork`,e=>{this.network=e,this.networkImage=f.getNetworkImage(e),this.isSupported=!e?.chainNamespace||y.checkIfSupportedNetwork(e.chainNamespace),f.fetchNetworkImage(e?.assets?.imageId)}),x.subscribeKey(`loading`,e=>this.loading=e))}firstUpdated(){f.fetchNetworkImage(this.network?.assets?.imageId)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=!this.network||y.checkIfSupportedNetwork(this.network.chainNamespace);return C`
      <wui-network-button
        .disabled=${!!(this.disabled||this.loading)}
        .isUnsupportedChain=${!p.state.allowUnsupportedChain&&!e}
        imageSrc=${E(this.networkImage)}
        @click=${this.onClick.bind(this)}
        data-testid="w3m-network-button"
      >
        ${this.getLabel()}
        <slot></slot>
      </wui-network-button>
    `}getLabel(){return this.network?!this.isSupported&&!p.state.allowUnsupportedChain?`Switch Network`:this.network.name:this.label?this.label:this.caipAddress?`Unknown Network`:`Select Network`}onClick(){this.loading||(h.sendEvent({type:`track`,event:`CLICK_NETWORKS`}),x.open({view:`Networks`}))}};Je.styles=Ke,qe([S({type:Boolean})],Je.prototype,`disabled`,void 0),qe([S({type:String})],Je.prototype,`label`,void 0),qe([T()],Je.prototype,`network`,void 0),qe([T()],Je.prototype,`networkImage`,void 0),qe([T()],Je.prototype,`caipAddress`,void 0),qe([T()],Je.prototype,`loading`,void 0),qe([T()],Je.prototype,`isSupported`,void 0);var Ye=class extends Je{};Ye=qe([D(`w3m-network-button`)],Ye);var Xe=class extends Je{};Xe=qe([D(`appkit-network-button`)],Xe);var Ze=O`
  :host {
    display: block;
  }

  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[4]};
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  wui-flex > wui-icon {
    padding: ${({spacing:e})=>e[2]};
    color: ${({tokens:e})=>e.theme.textInvert};
    background-color: ${({tokens:e})=>e.core.backgroundAccentPrimary};
    border-radius: ${({borderRadius:e})=>e[2]};
    align-items: center;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent020};
    }
  }
`,Qe=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},$e=class extends j{constructor(){super(...arguments),this.label=``,this.description=``,this.icon=`wallet`}render(){return C`
      <button>
        <wui-flex gap="2" alignItems="center">
          <wui-icon weight="fill" size="lg" name=${this.icon} color="inherit"></wui-icon>
          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="md-medium" color="primary">${this.label}</wui-text>
            <wui-text variant="md-regular" color="tertiary">${this.description}</wui-text>
          </wui-flex>
        </wui-flex>
        <wui-icon size="lg" color="accent-primary" name="chevronRight"></wui-icon>
      </button>
    `}};$e.styles=[A,w,Ze],Qe([S()],$e.prototype,`label`,void 0),Qe([S()],$e.prototype,`description`,void 0),Qe([S()],$e.prototype,`icon`,void 0),$e=Qe([D(`wui-notice-card`)],$e);var et=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},tt=class extends j{constructor(){super(),this.unsubscribe=[],this.socialProvider=ne.getConnectedSocialProvider(),this.socialUsername=ne.getConnectedSocialUsername(),this.namespace=y.state.activeChain,this.unsubscribe.push(y.subscribeKey(`activeChain`,e=>{this.namespace=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=g.getConnectorId(this.namespace),t=g.getAuthConnector();if(!t||e!==v.CONNECTOR_ID.AUTH)return this.style.cssText=`display: none`,null;let n=t.provider.getEmail()??``;return!n&&!this.socialUsername?(this.style.cssText=`display: none`,null):C`
      <wui-list-item
        ?rounded=${!0}
        icon=${this.socialProvider??`mail`}
        data-testid="w3m-account-email-update"
        ?chevron=${!this.socialProvider}
        @click=${()=>{this.onGoToUpdateEmail(n,this.socialProvider)}}
      >
        <wui-text variant="lg-regular" color="primary">${this.getAuthName(n)}</wui-text>
      </wui-list-item>
    `}onGoToUpdateEmail(e,t){t||m.push(`UpdateEmailWallet`,{email:e,redirectView:`Account`})}getAuthName(e){return this.socialUsername?this.socialProvider===`discord`&&this.socialUsername.endsWith(`0`)?this.socialUsername.slice(0,-1):this.socialUsername:e.length>30?`${e.slice(0,-3)}...`:e}};et([T()],tt.prototype,`namespace`,void 0),tt=et([D(`w3m-account-auth-button`)],tt);var nt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},rt=class extends j{constructor(){super(),this.usubscribe=[],this.networkImages=u.state.networkImages,this.address=y.getAccountData()?.address,this.profileImage=y.getAccountData()?.profileImage,this.profileName=y.getAccountData()?.profileName,this.network=y.state.activeCaipNetwork,this.disconnecting=!1,this.remoteFeatures=p.state.remoteFeatures,this.usubscribe.push(y.subscribeChainProp(`accountState`,e=>{e&&(this.address=e.address,this.profileImage=e.profileImage,this.profileName=e.profileName)}),y.subscribeKey(`activeCaipNetwork`,e=>{e?.id&&(this.network=e)}),p.subscribeKey(`remoteFeatures`,e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.usubscribe.forEach(e=>e())}render(){if(!this.address)throw Error(`w3m-account-settings-view: No account provided`);let e=this.networkImages[this.network?.assets?.imageId??``];return C`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding=${[`0`,`5`,`3`,`5`]}
      >
        <wui-avatar
          alt=${this.address}
          address=${this.address}
          imageSrc=${E(this.profileImage)}
          size="lg"
        ></wui-avatar>
        <wui-flex flexDirection="column" alignItems="center">
          <wui-flex gap="1" alignItems="center" justifyContent="center">
            <wui-text variant="h5-medium" color="primary" data-testid="account-settings-address">
              ${k.getTruncateString({string:this.address,charsStart:4,charsEnd:6,truncate:`middle`})}
            </wui-text>
            <wui-icon-link
              size="md"
              icon="copy"
              iconColor="default"
              @click=${this.onCopyAddress}
            ></wui-icon-link>
          </wui-flex>
        </wui-flex>
      </wui-flex>
      <wui-flex flexDirection="column" gap="4">
        <wui-flex flexDirection="column" gap="2" .padding=${[`6`,`4`,`3`,`4`]}>
          ${this.authCardTemplate()}
          <w3m-account-auth-button></w3m-account-auth-button>
          <wui-list-item
            imageSrc=${E(e)}
            ?chevron=${this.isAllowedNetworkSwitch()}
            ?fullSize=${!0}
            ?rounded=${!0}
            @click=${this.onNetworks.bind(this)}
            data-testid="account-switch-network-button"
          >
            <wui-text variant="lg-regular" color="primary">
              ${this.network?.name??`Unknown`}
            </wui-text>
          </wui-list-item>
          ${this.smartAccountSettingsTemplate()} ${this.chooseNameButtonTemplate()}
          <wui-list-item
            ?rounded=${!0}
            icon="power"
            iconColor="error"
            ?chevron=${!1}
            .loading=${this.disconnecting}
            @click=${this.onDisconnect.bind(this)}
            data-testid="disconnect-button"
          >
            <wui-text variant="lg-regular" color="primary">Disconnect</wui-text>
          </wui-list-item>
        </wui-flex>
      </wui-flex>
    `}chooseNameButtonTemplate(){let e=this.network?.chainNamespace,t=g.getConnectorId(e),n=g.getAuthConnector();return!y.checkIfNamesSupported()||!n||t!==v.CONNECTOR_ID.AUTH||this.profileName?null:C`
      <wui-list-item
        icon="id"
        ?rounded=${!0}
        ?chevron=${!0}
        @click=${this.onChooseName.bind(this)}
        data-testid="account-choose-name-button"
      >
        <wui-text variant="lg-regular" color="primary">Choose account name </wui-text>
      </wui-list-item>
    `}authCardTemplate(){let e=g.getConnectorId(this.network?.chainNamespace),t=g.getAuthConnector(),{origin:n}=location;return!t||e!==v.CONNECTOR_ID.AUTH||n.includes(d.SECURE_SITE)?null:C`
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `}isAllowedNetworkSwitch(){let e=y.getAllRequestedCaipNetworks(),t=e?e.length>1:!1,n=e?.find(({id:e})=>e===this.network?.id);return t||!n}onCopyAddress(){try{this.address&&(s.copyToClopboard(this.address),l.showSuccess(`Address copied`))}catch{l.showError(`Failed to copy`)}}smartAccountSettingsTemplate(){let e=this.network?.chainNamespace,t=y.checkIfSmartAccountEnabled(),n=g.getConnectorId(e);return!g.getAuthConnector()||n!==v.CONNECTOR_ID.AUTH||!t?null:C`
      <wui-list-item
        icon="user"
        ?rounded=${!0}
        ?chevron=${!0}
        @click=${this.onSmartAccountSettings.bind(this)}
        data-testid="account-smart-account-settings-button"
      >
        <wui-text variant="lg-regular" color="primary">Smart Account Settings</wui-text>
      </wui-list-item>
    `}onChooseName(){m.push(`ChooseAccountName`)}onNetworks(){this.isAllowedNetworkSwitch()&&m.push(`Networks`)}async onDisconnect(){try{this.disconnecting=!0;let e=this.network?.chainNamespace,t=_.getConnections(e).length>0,n=e&&g.state.activeConnectorIds[e],r=this.remoteFeatures?.multiWallet;await _.disconnect(r?{id:n,namespace:e}:{}),t&&r&&(m.push(`ProfileWallets`),l.showSuccess(`Wallet deleted`))}catch{h.sendEvent({type:`track`,event:`DISCONNECT_ERROR`,properties:{message:`Failed to disconnect`}}),l.showError(`Failed to disconnect`)}finally{this.disconnecting=!1}}onGoToUpgradeView(){h.sendEvent({type:`track`,event:`EMAIL_UPGRADE_FROM_MODAL`}),m.push(`UpgradeEmailWallet`)}onSmartAccountSettings(){m.push(`SmartAccountSettings`)}};nt([T()],rt.prototype,`address`,void 0),nt([T()],rt.prototype,`profileImage`,void 0),nt([T()],rt.prototype,`profileName`,void 0),nt([T()],rt.prototype,`network`,void 0),nt([T()],rt.prototype,`disconnecting`,void 0),nt([T()],rt.prototype,`remoteFeatures`,void 0),rt=nt([D(`w3m-account-settings-view`)],rt);var it=O`
  :host {
    flex: 1;
    height: 100%;
  }

  button {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    column-gap: ${({spacing:e})=>e[1]};
    color: ${({tokens:e})=>e.theme.textSecondary};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: transparent;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-active='true'] {
    color: ${({tokens:e})=>e.theme.textPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundTertiary};
  }

  button:hover:enabled:not([data-active='true']),
  button:active:enabled:not([data-active='true']) {
    wui-text,
    wui-icon {
      color: ${({tokens:e})=>e.theme.textPrimary};
    }
  }
`,at=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ot={lg:`lg-regular`,md:`md-regular`,sm:`sm-regular`},st={lg:`md`,md:`sm`,sm:`sm`},ct=class extends j{constructor(){super(...arguments),this.icon=`mobile`,this.size=`md`,this.label=``,this.active=!1}render(){return C`
      <button data-active=${this.active}>
        ${this.icon?C`<wui-icon size=${st[this.size]} name=${this.icon}></wui-icon>`:``}
        <wui-text variant=${ot[this.size]}> ${this.label} </wui-text>
      </button>
    `}};ct.styles=[A,w,it],at([S()],ct.prototype,`icon`,void 0),at([S()],ct.prototype,`size`,void 0),at([S()],ct.prototype,`label`,void 0),at([S({type:Boolean})],ct.prototype,`active`,void 0),ct=at([D(`wui-tab-item`)],ct);var lt=O`
  :host {
    display: inline-flex;
    align-items: center;
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[32]};
    padding: ${({spacing:e})=>e[`01`]};
    box-sizing: border-box;
  }

  :host([data-size='sm']) {
    height: 26px;
  }

  :host([data-size='md']) {
    height: 36px;
  }
`,ut=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},dt=class extends j{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.size=`md`,this.activeTab=0}render(){return this.dataset.size=this.size,this.tabs.map((e,t)=>{let n=t===this.activeTab;return C`
        <wui-tab-item
          @click=${()=>this.onTabClick(t)}
          icon=${e.icon}
          size=${this.size}
          label=${e.label}
          ?active=${n}
          data-active=${n}
          data-testid="tab-${e.label?.toLowerCase()}"
        ></wui-tab-item>
      `})}onTabClick(e){this.activeTab=e,this.onTabChange(e)}};dt.styles=[A,w,lt],ut([S({type:Array})],dt.prototype,`tabs`,void 0),ut([S()],dt.prototype,`onTabChange`,void 0),ut([S()],dt.prototype,`size`,void 0),ut([T()],dt.prototype,`activeTab`,void 0),dt=ut([D(`wui-tabs`)],dt);var ft=O`
  wui-icon-link {
    margin-right: calc(${({spacing:e})=>e[8]} * -1);
  }

  wui-notice-card {
    margin-bottom: ${({spacing:e})=>e[1]};
  }

  wui-list-item > wui-text {
    flex: 1;
  }

  w3m-transactions-view {
    max-height: 200px;
  }

  .balance-container {
    display: inline;
  }

  .tab-content-container {
    height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .symbol {
    transform: translateY(-2px);
  }

  .tab-content-container::-webkit-scrollbar {
    display: none;
  }

  .account-button {
    width: auto;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[3]};
    height: 48px;
    padding: ${({spacing:e})=>e[2]};
    padding-right: ${({spacing:e})=>e[3]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[6]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
  }

  .account-button:hover {
    background-color: ${({tokens:e})=>e.core.glass010};
  }

  .avatar-container {
    position: relative;
  }

  wui-avatar.avatar {
    width: 32px;
    height: 32px;
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.core.glass010};
  }

  wui-wallet-switch {
    margin-top: ${({spacing:e})=>e[2]};
  }

  wui-avatar.network-avatar {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 100%;
    top: 100%;
    transform: translate(-75%, -75%);
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.core.glass010};
  }

  .account-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .account-links wui-flex {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    background: red;
    align-items: center;
    justify-content: center;
    height: 48px;
    padding: 10px;
    flex: 1 0 0;
    border-radius: var(--XS, 16px);
    border: 1px solid var(--dark-accent-glass-010, rgba(71, 161, 255, 0.1));
    background: var(--dark-accent-glass-010, rgba(71, 161, 255, 0.1));
    transition:
      background-color ${({durations:e})=>e.md}
        ${({easings:e})=>e[`ease-out-power-1`]},
      opacity ${({durations:e})=>e.md} ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: background-color, opacity;
  }

  .account-links wui-flex:hover {
    background: var(--dark-accent-glass-015, rgba(71, 161, 255, 0.15));
  }

  .account-links wui-flex wui-icon {
    width: var(--S, 20px);
    height: var(--S, 20px);
  }

  .account-links wui-flex wui-icon svg path {
    stroke: #667dff;
  }
`,z=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},B=class extends j{constructor(){super(),this.unsubscribe=[],this.caipAddress=y.getAccountData()?.caipAddress,this.address=s.getPlainAddress(y.getAccountData()?.caipAddress),this.profileImage=y.getAccountData()?.profileImage,this.profileName=y.getAccountData()?.profileName,this.disconnecting=!1,this.balance=y.getAccountData()?.balance,this.balanceSymbol=y.getAccountData()?.balanceSymbol,this.features=p.state.features,this.remoteFeatures=p.state.remoteFeatures,this.namespace=y.state.activeChain,this.activeConnectorIds=g.state.activeConnectorIds,this.unsubscribe.push(y.subscribeChainProp(`accountState`,e=>{this.address=s.getPlainAddress(e?.caipAddress),this.caipAddress=e?.caipAddress,this.balance=e?.balance,this.balanceSymbol=e?.balanceSymbol,this.profileName=e?.profileName,this.profileImage=e?.profileImage}),p.subscribeKey(`features`,e=>this.features=e),p.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e),g.subscribeKey(`activeConnectorIds`,e=>{this.activeConnectorIds=e}),y.subscribeKey(`activeChain`,e=>this.namespace=e),y.subscribeKey(`activeCaipNetwork`,e=>{e?.chainNamespace&&(this.namespace=e?.chainNamespace)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!this.caipAddress||!this.namespace)return null;let e=this.activeConnectorIds[this.namespace],t=e?g.getConnectorById(e):void 0,n=f.getConnectorImage(t),{value:r,decimals:i,symbol:a}=s.parseBalance(this.balance,this.balanceSymbol);return C`<wui-flex
        flexDirection="column"
        .padding=${[`0`,`5`,`4`,`5`]}
        alignItems="center"
        gap="3"
      >
        <wui-avatar
          alt=${E(this.caipAddress)}
          address=${E(s.getPlainAddress(this.caipAddress))}
          imageSrc=${E(this.profileImage===null?void 0:this.profileImage)}
          data-testid="single-account-avatar"
        ></wui-avatar>
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          imageSrc=${n}
          alt=${t?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
        <div class="balance-container">
          <wui-text variant="h3-regular" color="primary">${r}</wui-text>
          <wui-text variant="h3-regular" color="secondary">.${i}</wui-text>
          <wui-text variant="h6-medium" color="primary" class="symbol">${a}</wui-text>
        </div>
        ${this.explorerBtnTemplate()}
      </wui-flex>

      <wui-flex flexDirection="column" gap="2" .padding=${[`0`,`3`,`3`,`3`]}>
        ${this.authCardTemplate()} <w3m-account-auth-button></w3m-account-auth-button>
        ${this.orderedFeaturesTemplate()} ${this.activityTemplate()}
        <wui-list-item
          .rounded=${!0}
          icon="power"
          iconColor="error"
          ?chevron=${!1}
          .loading=${this.disconnecting}
          .rightIcon=${!1}
          @click=${this.onDisconnect.bind(this)}
          data-testid="disconnect-button"
        >
          <wui-text variant="lg-regular" color="primary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>`}fundWalletTemplate(){if(!this.namespace)return null;let e=d.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace),t=!!this.features?.receive,n=this.remoteFeatures?.onramp&&e,r=M.isPayWithExchangeEnabled();return!n&&!t&&!r?null:C`
      <wui-list-item
        .rounded=${!0}
        data-testid="w3m-account-default-fund-wallet-button"
        iconVariant="blue"
        icon="dollar"
        ?chevron=${!0}
        @click=${this.handleClickFundWallet.bind(this)}
      >
        <wui-text variant="lg-regular" color="primary">Fund wallet</wui-text>
      </wui-list-item>
    `}orderedFeaturesTemplate(){return(this.features?.walletFeaturesOrder||d.DEFAULT_FEATURES.walletFeaturesOrder).map(e=>{switch(e){case`onramp`:return this.fundWalletTemplate();case`swaps`:return this.swapsTemplate();case`send`:return this.sendTemplate();default:return null}})}activityTemplate(){return this.namespace&&this.remoteFeatures?.activity&&d.ACTIVITY_ENABLED_CHAIN_NAMESPACES.includes(this.namespace)?C` <wui-list-item
          .rounded=${!0}
          icon="clock"
          ?chevron=${!0}
          @click=${this.onTransactions.bind(this)}
          data-testid="w3m-account-default-activity-button"
        >
          <wui-text variant="lg-regular" color="primary">Activity</wui-text>
        </wui-list-item>`:null}swapsTemplate(){let e=this.remoteFeatures?.swaps,t=y.state.activeChain===v.CHAIN.EVM;return!e||!t?null:C`
      <wui-list-item
        .rounded=${!0}
        icon="recycleHorizontal"
        ?chevron=${!0}
        @click=${this.handleClickSwap.bind(this)}
        data-testid="w3m-account-default-swaps-button"
      >
        <wui-text variant="lg-regular" color="primary">Swap</wui-text>
      </wui-list-item>
    `}sendTemplate(){let e=this.features?.send,t=y.state.activeChain;if(!t)throw Error(`SendController:sendTemplate - namespace is required`);let n=d.SEND_SUPPORTED_NAMESPACES.includes(t);return!e||!n?null:C`
      <wui-list-item
        .rounded=${!0}
        icon="send"
        ?chevron=${!0}
        @click=${this.handleClickSend.bind(this)}
        data-testid="w3m-account-default-send-button"
      >
        <wui-text variant="lg-regular" color="primary">Send</wui-text>
      </wui-list-item>
    `}authCardTemplate(){let e=y.state.activeChain;if(!e)throw Error(`AuthCardTemplate:authCardTemplate - namespace is required`);let t=g.getConnectorId(e),n=g.getAuthConnector(),{origin:r}=location;return!n||t!==v.CONNECTOR_ID.AUTH||r.includes(d.SECURE_SITE)?null:C`
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `}handleClickFundWallet(){m.push(`FundWallet`)}handleClickSwap(){m.push(`Swap`)}handleClickSend(){m.push(`WalletSend`)}explorerBtnTemplate(){return y.getAccountData()?.addressExplorerUrl?C`
      <wui-button size="md" variant="accent-primary" @click=${this.onExplorer.bind(this)}>
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="compass"></wui-icon>
        Block Explorer
        <wui-icon size="sm" color="inherit" slot="iconRight" name="externalLink"></wui-icon>
      </wui-button>
    `:null}onTransactions(){h.sendEvent({type:`track`,event:`CLICK_TRANSACTIONS`,properties:{isSmartAccount:ae(y.state.activeChain)===te.ACCOUNT_TYPES.SMART_ACCOUNT}}),m.push(`Transactions`)}async onDisconnect(){try{this.disconnecting=!0;let e=_.getConnections(this.namespace).length>0,t=this.namespace&&g.state.activeConnectorIds[this.namespace],n=this.remoteFeatures?.multiWallet;await _.disconnect(n?{id:t,namespace:this.namespace}:{}),e&&n&&(m.push(`ProfileWallets`),l.showSuccess(`Wallet deleted`))}catch{h.sendEvent({type:`track`,event:`DISCONNECT_ERROR`,properties:{message:`Failed to disconnect`}}),l.showError(`Failed to disconnect`)}finally{this.disconnecting=!1}}onExplorer(){let e=y.getAccountData()?.addressExplorerUrl;e&&s.openHref(e,`_blank`)}onGoToUpgradeView(){h.sendEvent({type:`track`,event:`EMAIL_UPGRADE_FROM_MODAL`}),m.push(`UpgradeEmailWallet`)}onGoToProfileWalletsView(){m.push(`ProfileWallets`)}};B.styles=ft,z([T()],B.prototype,`caipAddress`,void 0),z([T()],B.prototype,`address`,void 0),z([T()],B.prototype,`profileImage`,void 0),z([T()],B.prototype,`profileName`,void 0),z([T()],B.prototype,`disconnecting`,void 0),z([T()],B.prototype,`balance`,void 0),z([T()],B.prototype,`balanceSymbol`,void 0),z([T()],B.prototype,`features`,void 0),z([T()],B.prototype,`remoteFeatures`,void 0),z([T()],B.prototype,`namespace`,void 0),z([T()],B.prototype,`activeConnectorIds`,void 0),B=z([D(`w3m-account-default-widget`)],B);var pt=O`
  span {
    font-weight: 500;
    font-size: 38px;
    color: ${({tokens:e})=>e.theme.textPrimary};
    line-height: 38px;
    letter-spacing: -2%;
    text-align: center;
    font-family: var(--apkt-fontFamily-regular);
  }

  .pennies {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }
`,mt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ht=class extends j{constructor(){super(...arguments),this.dollars=`0`,this.pennies=`00`}render(){return C`<span>$${this.dollars}<span class="pennies">.${this.pennies}</span></span>`}};ht.styles=[A,pt],mt([S()],ht.prototype,`dollars`,void 0),mt([S()],ht.prototype,`pennies`,void 0),ht=mt([D(`wui-balance`)],ht);var gt=O`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
  }

  /* -- Variants --------------------------------------------------------- */
  :host([data-variant='fill']) {
    background-color: ${({colors:e})=>e.neutrals100};
  }

  :host([data-variant='shade']) {
    background-color: ${({colors:e})=>e.neutrals900};
  }

  :host([data-variant='fill']) > wui-text {
    color: ${({colors:e})=>e.black};
  }

  :host([data-variant='shade']) > wui-text {
    color: ${({colors:e})=>e.white};
  }

  :host([data-variant='fill']) > wui-icon {
    color: ${({colors:e})=>e.neutrals100};
  }

  :host([data-variant='shade']) > wui-icon {
    color: ${({colors:e})=>e.neutrals900};
  }

  /* -- Sizes --------------------------------------------------------- */
  :host([data-size='sm']) {
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-size='md']) {
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  /* -- Placements --------------------------------------------------------- */
  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }
`,_t=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},vt={sm:`sm-regular`,md:`md-regular`},yt=class extends j{constructor(){super(...arguments),this.placement=`top`,this.variant=`fill`,this.size=`md`,this.message=``}render(){return this.dataset.variant=this.variant,this.dataset.size=this.size,C`<wui-icon data-placement=${this.placement} size="inherit" name="cursor"></wui-icon>
      <wui-text variant=${vt[this.size]}>${this.message}</wui-text>`}};yt.styles=[A,w,gt],_t([S()],yt.prototype,`placement`,void 0),_t([S()],yt.prototype,`variant`,void 0),_t([S()],yt.prototype,`size`,void 0),_t([S()],yt.prototype,`message`,void 0),yt=_t([D(`wui-tooltip`)],yt);var bt=me`
  :host {
    width: 100%;
    max-height: 280px;
    overflow: scroll;
    scrollbar-width: none;
  }

  :host::-webkit-scrollbar {
    display: none;
  }
`,xt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},St=class extends j{render(){return C`<w3m-activity-list page="account"></w3m-activity-list>`}};St.styles=bt,St=xt([D(`w3m-account-activity-widget`)],St);var Ct=O`
  :host {
    width: 100%;
  }

  button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({spacing:e})=>e[4]};
    padding: ${({spacing:e})=>e[4]};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    max-width: 174px;
  }

  .tag-container {
    width: fit-content;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }
`,wt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Tt=class extends j{constructor(){super(...arguments),this.icon=`card`,this.text=``,this.description=``,this.tag=void 0,this.disabled=!1}render(){return C`
      <button ?disabled=${this.disabled}>
        <wui-flex alignItems="center" gap="3">
          <wui-icon-box padding="2" color="secondary" icon=${this.icon} size="lg"></wui-icon-box>
          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="md-medium" color="primary">${this.text}</wui-text>
            ${this.description?C`<wui-text variant="md-regular" color="secondary">
                  ${this.description}</wui-text
                >`:null}
          </wui-flex>
        </wui-flex>

        <wui-flex class="tag-container" alignItems="center" gap="1" justifyContent="flex-end">
          ${this.tag?C`<wui-tag tagType="main" size="sm">${this.tag}</wui-tag>`:null}
          <wui-icon size="md" name="chevronRight" color="default"></wui-icon>
        </wui-flex>
      </button>
    `}};Tt.styles=[A,w,Ct],wt([S()],Tt.prototype,`icon`,void 0),wt([S()],Tt.prototype,`text`,void 0),wt([S()],Tt.prototype,`description`,void 0),wt([S()],Tt.prototype,`tag`,void 0),wt([S({type:Boolean})],Tt.prototype,`disabled`,void 0),Tt=wt([D(`wui-list-description`)],Tt);var Et=me`
  :host {
    width: 100%;
  }

  wui-flex {
    width: 100%;
  }

  .contentContainer {
    max-height: 280px;
    overflow: scroll;
    scrollbar-width: none;
  }

  .contentContainer::-webkit-scrollbar {
    display: none;
  }
`,Dt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Ot=class extends j{constructor(){super(),this.unsubscribe=[],this.tokenBalance=y.getAccountData()?.tokenBalance,this.remoteFeatures=p.state.remoteFeatures,this.unsubscribe.push(y.subscribeChainProp(`accountState`,e=>{this.tokenBalance=e?.tokenBalance}),p.subscribeKey(`remoteFeatures`,e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return C`${this.tokenTemplate()}`}tokenTemplate(){return this.tokenBalance&&this.tokenBalance?.length>0?C`<wui-flex class="contentContainer" flexDirection="column" gap="2">
        ${this.tokenItemTemplate()}
      </wui-flex>`:C` <wui-flex flexDirection="column">
      ${this.onRampTemplate()}
      <wui-list-description
        @click=${this.onReceiveClick.bind(this)}
        text="Receive funds"
        description="Scan the QR code and receive funds"
        icon="qrCode"
        iconColor="fg-200"
        iconBackgroundColor="fg-200"
        data-testid="w3m-account-receive-button"
      ></wui-list-description
    ></wui-flex>`}onRampTemplate(){return this.remoteFeatures?.onramp?C`<wui-list-description
        @click=${this.onBuyClick.bind(this)}
        text="Buy Crypto"
        description="Easy with card or bank account"
        icon="card"
        iconColor="success-100"
        iconBackgroundColor="success-100"
        tag="popular"
        data-testid="w3m-account-onramp-button"
      ></wui-list-description>`:C``}tokenItemTemplate(){return this.tokenBalance?.map(e=>C`<wui-list-token
          tokenName=${e.name}
          tokenImageUrl=${e.iconUrl}
          tokenAmount=${e.quantity.numeric}
          tokenValue=${e.value}
          tokenCurrency=${e.symbol}
        ></wui-list-token>`)}onReceiveClick(){m.push(`WalletReceive`)}onBuyClick(){h.sendEvent({type:`track`,event:`SELECT_BUY_CRYPTO`,properties:{isSmartAccount:ae(y.state.activeChain)===te.ACCOUNT_TYPES.SMART_ACCOUNT}}),m.push(`OnRampProviders`)}};Ot.styles=Et,Dt([T()],Ot.prototype,`tokenBalance`,void 0),Dt([T()],Ot.prototype,`remoteFeatures`,void 0),Ot=Dt([D(`w3m-account-tokens-widget`)],Ot);var kt=O`
  wui-flex {
    width: 100%;
  }

  wui-promo {
    position: absolute;
    top: -32px;
  }

  wui-profile-button {
    margin-top: calc(-1 * ${({spacing:e})=>e[4]});
  }

  wui-promo + wui-profile-button {
    margin-top: ${({spacing:e})=>e[4]};
  }

  wui-tabs {
    width: 100%;
  }

  .contentContainer {
    height: 280px;
  }

  .contentContainer > wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  .contentContainer > .textContent {
    width: 65%;
  }
`,At=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},V=class extends j{constructor(){super(...arguments),this.unsubscribe=[],this.network=y.state.activeCaipNetwork,this.profileName=y.getAccountData()?.profileName,this.address=y.getAccountData()?.address,this.currentTab=y.getAccountData()?.currentTab,this.tokenBalance=y.getAccountData()?.tokenBalance,this.features=p.state.features,this.namespace=y.state.activeChain,this.activeConnectorIds=g.state.activeConnectorIds,this.remoteFeatures=p.state.remoteFeatures}firstUpdated(){y.fetchTokenBalance(),this.unsubscribe.push(y.subscribeChainProp(`accountState`,e=>{e?.address?(this.address=e.address,this.profileName=e.profileName,this.currentTab=e.currentTab,this.tokenBalance=e.tokenBalance):x.close()}),g.subscribeKey(`activeConnectorIds`,e=>{this.activeConnectorIds=e}),y.subscribeKey(`activeChain`,e=>this.namespace=e),y.subscribeKey(`activeCaipNetwork`,e=>this.network=e),p.subscribeKey(`features`,e=>this.features=e),p.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e)),this.watchSwapValues()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),clearInterval(this.watchTokenBalance)}render(){if(!this.address)throw Error(`w3m-account-features-widget: No account provided`);if(!this.namespace)return null;let e=this.activeConnectorIds[this.namespace],t=e?g.getConnectorById(e):void 0,{icon:n,iconSize:r}=this.getAuthData();return C`<wui-flex
      flexDirection="column"
      .padding=${[`0`,`3`,`4`,`3`]}
      alignItems="center"
      gap="4"
      data-testid="w3m-account-wallet-features-widget"
    >
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center" gap="2">
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          icon=${n}
          iconSize=${r}
          alt=${t?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        ${this.tokenBalanceTemplate()}
      </wui-flex>
      ${this.orderedWalletFeatures()} ${this.tabsTemplate()} ${this.listContentTemplate()}
    </wui-flex>`}orderedWalletFeatures(){let e=this.features?.walletFeaturesOrder||d.DEFAULT_FEATURES.walletFeaturesOrder;if(e.every(e=>e===`send`||e===`receive`?!this.features?.[e]:e===`swaps`||e===`onramp`?!this.remoteFeatures?.[e]:!0))return null;let t=e.map(e=>e===`receive`||e===`onramp`?`fund`:e),n=[...new Set(t)];return C`<wui-flex gap="2">
      ${n.map(e=>{switch(e){case`fund`:return this.fundWalletTemplate();case`swaps`:return this.swapsTemplate();case`send`:return this.sendTemplate();default:return null}})}
    </wui-flex>`}fundWalletTemplate(){if(!this.namespace)return null;let e=d.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace),t=this.features?.receive,n=this.remoteFeatures?.onramp&&e,r=M.isPayWithExchangeEnabled();return!n&&!t&&!r?null:C`
      <w3m-tooltip-trigger text="Fund wallet">
        <wui-button
          data-testid="wallet-features-fund-wallet-button"
          @click=${this.onFundWalletClick.bind(this)}
          variant="accent-secondary"
          size="lg"
          fullWidth
        >
          <wui-icon name="dollar"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `}swapsTemplate(){let e=this.remoteFeatures?.swaps,t=y.state.activeChain===v.CHAIN.EVM;return!e||!t?null:C`
      <w3m-tooltip-trigger text="Swap">
        <wui-button
          fullWidth
          data-testid="wallet-features-swaps-button"
          @click=${this.onSwapClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="recycleHorizontal"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `}sendTemplate(){let e=this.features?.send,t=y.state.activeChain,n=d.SEND_SUPPORTED_NAMESPACES.includes(t);return!e||!n?null:C`
      <w3m-tooltip-trigger text="Send">
        <wui-button
          fullWidth
          data-testid="wallet-features-send-button"
          @click=${this.onSendClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="send"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `}watchSwapValues(){this.watchTokenBalance=setInterval(()=>y.fetchTokenBalance(e=>this.onTokenBalanceError(e)),1e4)}onTokenBalanceError(e){e instanceof Error&&e.cause instanceof Response&&e.cause.status===v.HTTP_STATUS_CODES.SERVICE_UNAVAILABLE&&clearInterval(this.watchTokenBalance)}listContentTemplate(){return this.currentTab===0?C`<w3m-account-tokens-widget></w3m-account-tokens-widget>`:this.currentTab===1?C`<w3m-account-activity-widget></w3m-account-activity-widget>`:C`<w3m-account-tokens-widget></w3m-account-tokens-widget>`}tokenBalanceTemplate(){if(this.tokenBalance&&this.tokenBalance?.length>=0){let e=s.calculateBalance(this.tokenBalance),{dollars:t=`0`,pennies:n=`00`}=s.formatTokenBalance(e);return C`<wui-balance dollars=${t} pennies=${n}></wui-balance>`}return C`<wui-balance dollars="0" pennies="00"></wui-balance>`}tabsTemplate(){let e=Se.getTabsByNamespace(y.state.activeChain);return e.length===0?null:C`<wui-tabs
      .onTabChange=${this.onTabChange.bind(this)}
      .activeTab=${this.currentTab}
      .tabs=${e}
    ></wui-tabs>`}onTabChange(e){y.setAccountProp(`currentTab`,e,this.namespace)}onFundWalletClick(){m.push(`FundWallet`)}onSwapClick(){this.network?.caipNetworkId&&!d.SWAP_SUPPORTED_NETWORKS.includes(this.network?.caipNetworkId)?m.push(`UnsupportedChain`,{swapUnsupportedChain:!0}):(h.sendEvent({type:`track`,event:`OPEN_SWAP`,properties:{network:this.network?.caipNetworkId||``,isSmartAccount:ae(y.state.activeChain)===te.ACCOUNT_TYPES.SMART_ACCOUNT}}),m.push(`Swap`))}getAuthData(){let e=ne.getConnectedSocialProvider(),t=ne.getConnectedSocialUsername(),n=g.getAuthConnector()?.provider.getEmail()??``;return{name:c.getAuthName({email:n,socialUsername:t,socialProvider:e}),icon:e??`mail`,iconSize:e?`xl`:`md`}}onGoToProfileWalletsView(){m.push(`ProfileWallets`)}onSendClick(){h.sendEvent({type:`track`,event:`OPEN_SEND`,properties:{network:this.network?.caipNetworkId||``,isSmartAccount:ae(y.state.activeChain)===te.ACCOUNT_TYPES.SMART_ACCOUNT}}),m.push(`WalletSend`)}};V.styles=kt,At([T()],V.prototype,`watchTokenBalance`,void 0),At([T()],V.prototype,`network`,void 0),At([T()],V.prototype,`profileName`,void 0),At([T()],V.prototype,`address`,void 0),At([T()],V.prototype,`currentTab`,void 0),At([T()],V.prototype,`tokenBalance`,void 0),At([T()],V.prototype,`features`,void 0),At([T()],V.prototype,`namespace`,void 0),At([T()],V.prototype,`activeConnectorIds`,void 0),At([T()],V.prototype,`remoteFeatures`,void 0),V=At([D(`w3m-account-wallet-features-widget`)],V);var jt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Mt=class extends j{constructor(){super(),this.unsubscribe=[],this.namespace=y.state.activeChain,this.unsubscribe.push(y.subscribeKey(`activeChain`,e=>{this.namespace=e}))}render(){if(!this.namespace)return null;let e=g.getConnectorId(this.namespace),t=g.getAuthConnector();return C`
      ${t&&e===v.CONNECTOR_ID.AUTH?this.walletFeaturesTemplate():this.defaultTemplate()}
    `}walletFeaturesTemplate(){return C`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`}defaultTemplate(){return C`<w3m-account-default-widget></w3m-account-default-widget>`}};jt([T()],Mt.prototype,`namespace`,void 0),Mt=jt([D(`w3m-account-view`)],Mt);var Nt=O`
  wui-image {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  wui-image,
  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  wui-icon:not(.custom-icon, .icon-badge) {
    cursor: pointer;
  }

  .icon-box {
    position: relative;
    border-radius: ${({borderRadius:e})=>e[2]};
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .icon-badge {
    position: absolute;
    top: 18px;
    left: 23px;
    z-index: 3;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: 50%;
    padding: ${({spacing:e})=>e[`01`]};
  }

  .icon-badge {
    width: 8px;
    height: 8px;
  }
`,H=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},U=class extends j{constructor(){super(...arguments),this.address=``,this.profileName=``,this.content=[],this.alt=``,this.imageSrc=``,this.icon=void 0,this.iconSize=`md`,this.iconBadge=void 0,this.iconBadgeSize=`md`,this.buttonVariant=`neutral-primary`,this.enableMoreButton=!1,this.charsStart=4,this.charsEnd=6}render(){return C`
      <wui-flex flexDirection="column" rowgap="2">
        ${this.topTemplate()} ${this.bottomTemplate()}
      </wui-flex>
    `}topTemplate(){return C`
      <wui-flex alignItems="flex-start" justifyContent="space-between">
        ${this.imageOrIconTemplate()}
        <wui-icon-link
          variant="secondary"
          size="md"
          icon="copy"
          @click=${this.dispatchCopyEvent}
        ></wui-icon-link>
        <wui-icon-link
          variant="secondary"
          size="md"
          icon="externalLink"
          @click=${this.dispatchExternalLinkEvent}
        ></wui-icon-link>
        ${this.enableMoreButton?C`<wui-icon-link
              variant="secondary"
              size="md"
              icon="threeDots"
              @click=${this.dispatchMoreButtonEvent}
              data-testid="wui-active-profile-wallet-item-more-button"
            ></wui-icon-link>`:null}
      </wui-flex>
    `}bottomTemplate(){return C` <wui-flex flexDirection="column">${this.contentTemplate()}</wui-flex> `}imageOrIconTemplate(){return this.icon?C`
        <wui-flex flexGrow="1" alignItems="center">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon size="lg" color="default" name=${this.icon} class="custom-icon"></wui-icon>

            ${this.iconBadge?C`<wui-icon
                  color="accent-primary"
                  size="inherit"
                  name=${this.iconBadge}
                  class="icon-badge"
                ></wui-icon>`:null}
          </wui-flex>
        </wui-flex>
      `:C`
      <wui-flex flexGrow="1" alignItems="center">
        <wui-image objectFit="contain" src=${this.imageSrc} alt=${this.alt}></wui-image>
      </wui-flex>
    `}contentTemplate(){return this.content.length===0?null:C`
      <wui-flex flexDirection="column" rowgap="3">
        ${this.content.map(e=>this.labelAndTagTemplate(e))}
      </wui-flex>
    `}labelAndTagTemplate({address:e,profileName:t,label:n,description:r,enableButton:i,buttonType:a,buttonLabel:o,buttonVariant:s,tagVariant:c,tagLabel:l,alignItems:u=`flex-end`}){return C`
      <wui-flex justifyContent="space-between" alignItems=${u} columngap="1">
        <wui-flex flexDirection="column" rowgap="01">
          ${n?C`<wui-text variant="sm-medium" color="secondary">${n}</wui-text>`:null}

          <wui-flex alignItems="center" columngap="1">
            <wui-text variant="md-regular" color="primary">
              ${k.getTruncateString({string:t||e,charsStart:t?16:this.charsStart,charsEnd:t?0:this.charsEnd,truncate:t?`end`:`middle`})}
            </wui-text>

            ${c&&l?C`<wui-tag variant=${c} size="sm">${l}</wui-tag>`:null}
          </wui-flex>

          ${r?C`<wui-text variant="sm-regular" color="secondary">${r}</wui-text>`:null}
        </wui-flex>

        ${i?this.buttonTemplate({buttonType:a,buttonLabel:o,buttonVariant:s}):null}
      </wui-flex>
    `}buttonTemplate({buttonType:e,buttonLabel:t,buttonVariant:n}){return C`
      <wui-button
        size="sm"
        variant=${n}
        @click=${e===`disconnect`?this.dispatchDisconnectEvent.bind(this):this.dispatchSwitchEvent.bind(this)}
        data-testid=${e===`disconnect`?`wui-active-profile-wallet-item-disconnect-button`:`wui-active-profile-wallet-item-switch-button`}
      >
        ${t}
      </wui-button>
    `}dispatchDisconnectEvent(){this.dispatchEvent(new CustomEvent(`disconnect`,{bubbles:!0,composed:!0}))}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent(`switch`,{bubbles:!0,composed:!0}))}dispatchExternalLinkEvent(){this.dispatchEvent(new CustomEvent(`externalLink`,{bubbles:!0,composed:!0}))}dispatchMoreButtonEvent(){this.dispatchEvent(new CustomEvent(`more`,{bubbles:!0,composed:!0}))}dispatchCopyEvent(){this.dispatchEvent(new CustomEvent(`copy`,{bubbles:!0,composed:!0}))}};U.styles=[A,w,Nt],H([S()],U.prototype,`address`,void 0),H([S()],U.prototype,`profileName`,void 0),H([S({type:Array})],U.prototype,`content`,void 0),H([S()],U.prototype,`alt`,void 0),H([S()],U.prototype,`imageSrc`,void 0),H([S()],U.prototype,`icon`,void 0),H([S()],U.prototype,`iconSize`,void 0),H([S()],U.prototype,`iconBadge`,void 0),H([S()],U.prototype,`iconBadgeSize`,void 0),H([S()],U.prototype,`buttonVariant`,void 0),H([S({type:Boolean})],U.prototype,`enableMoreButton`,void 0),H([S({type:Number})],U.prototype,`charsStart`,void 0),H([S({type:Number})],U.prototype,`charsEnd`,void 0),U=H([D(`wui-active-profile-wallet-item`)],U);var Pt=O`
  wui-image,
  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  .right-icon {
    cursor: pointer;
  }

  .icon-box {
    position: relative;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .icon-badge {
    position: absolute;
    top: 18px;
    left: 23px;
    z-index: 3;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: 50%;
    padding: ${({spacing:e})=>e[`01`]};
  }

  .icon-badge {
    width: 8px;
    height: 8px;
  }
`,W=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},G=class extends j{constructor(){super(...arguments),this.address=``,this.profileName=``,this.alt=``,this.buttonLabel=``,this.buttonVariant=`accent-primary`,this.imageSrc=``,this.icon=void 0,this.iconSize=`md`,this.iconBadgeSize=`md`,this.rightIcon=`signOut`,this.rightIconSize=`md`,this.loading=!1,this.charsStart=4,this.charsEnd=6}render(){return C`
      <wui-flex alignItems="center" columngap="2">
        ${this.imageOrIconTemplate()} ${this.labelAndDescriptionTemplate()}
        ${this.buttonActionTemplate()}
      </wui-flex>
    `}imageOrIconTemplate(){return this.icon?C`
        <wui-flex alignItems="center" justifyContent="center" class="icon-box">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon size="lg" color="default" name=${this.icon} class="custom-icon"></wui-icon>

            ${this.iconBadge?C`<wui-icon
                  color="default"
                  size="inherit"
                  name=${this.iconBadge}
                  class="icon-badge"
                ></wui-icon>`:null}
          </wui-flex>
        </wui-flex>
      `:C`<wui-image objectFit="contain" src=${this.imageSrc} alt=${this.alt}></wui-image>`}labelAndDescriptionTemplate(){return C`
      <wui-flex
        flexDirection="column"
        flexGrow="1"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <wui-text variant="lg-regular" color="primary">
          ${k.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?16:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?`end`:`middle`})}
        </wui-text>
      </wui-flex>
    `}buttonActionTemplate(){return C`
      <wui-flex columngap="1" alignItems="center" justifyContent="center">
        <wui-button
          size="sm"
          variant=${this.buttonVariant}
          .loading=${this.loading}
          @click=${this.handleButtonClick}
          data-testid="wui-inactive-profile-wallet-item-button"
        >
          ${this.buttonLabel}
        </wui-button>

        <wui-icon-link
          variant="secondary"
          size="md"
          icon=${E(this.rightIcon)}
          class="right-icon"
          @click=${this.handleIconClick}
        ></wui-icon-link>
      </wui-flex>
    `}handleButtonClick(){this.dispatchEvent(new CustomEvent(`buttonClick`,{bubbles:!0,composed:!0}))}handleIconClick(){this.dispatchEvent(new CustomEvent(`iconClick`,{bubbles:!0,composed:!0}))}};G.styles=[A,w,Pt],W([S()],G.prototype,`address`,void 0),W([S()],G.prototype,`profileName`,void 0),W([S()],G.prototype,`alt`,void 0),W([S()],G.prototype,`buttonLabel`,void 0),W([S()],G.prototype,`buttonVariant`,void 0),W([S()],G.prototype,`imageSrc`,void 0),W([S()],G.prototype,`icon`,void 0),W([S()],G.prototype,`iconSize`,void 0),W([S()],G.prototype,`iconBadge`,void 0),W([S()],G.prototype,`iconBadgeSize`,void 0),W([S()],G.prototype,`rightIcon`,void 0),W([S()],G.prototype,`rightIconSize`,void 0),W([S({type:Boolean})],G.prototype,`loading`,void 0),W([S({type:Number})],G.prototype,`charsStart`,void 0),W([S({type:Number})],G.prototype,`charsEnd`,void 0),G=W([D(`wui-inactive-profile-wallet-item`)],G);var Ft={getAuthData(e){let t=e.connectorId===v.CONNECTOR_ID.AUTH;if(!t)return{isAuth:!1,icon:void 0,iconSize:void 0,name:void 0};let n=e?.auth?.name??ne.getConnectedSocialProvider(),r=e?.auth?.username??ne.getConnectedSocialUsername(),i=g.getAuthConnector()?.provider.getEmail()??``;return{isAuth:!0,icon:n??`mail`,iconSize:n?`xl`:`md`,name:t?c.getAuthName({email:i,socialUsername:r,socialProvider:n}):void 0}}},It=O`
  :host {
    --connect-scroll--top-opacity: 0;
    --connect-scroll--bottom-opacity: 0;
  }

  .balance-amount {
    flex: 1;
  }

  .wallet-list {
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
    transition: opacity ${({easings:e})=>e[`ease-out-power-1`]}
      ${({durations:e})=>e.md};
    will-change: opacity;
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, calc(1 - var(--connect-scroll--top-opacity))) 0px,
      rgba(200, 200, 200, calc(1 - var(--connect-scroll--top-opacity))) 1px,
      black 40px,
      black calc(100% - 40px),
      rgba(155, 155, 155, calc(1 - var(--connect-scroll--bottom-opacity))) calc(100% - 1px),
      rgba(0, 0, 0, calc(1 - var(--connect-scroll--bottom-opacity))) 100%
    );
  }

  .active-wallets {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  .active-wallets-box {
    height: 330px;
  }

  .empty-wallet-list-box {
    height: 400px;
  }

  .empty-box {
    width: 100%;
    padding: ${({spacing:e})=>e[4]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-separator {
    margin: ${({spacing:e})=>e[2]} 0 ${({spacing:e})=>e[2]} 0;
  }

  .active-connection {
    padding: ${({spacing:e})=>e[2]};
  }

  .recent-connection {
    padding: ${({spacing:e})=>e[2]} 0 ${({spacing:e})=>e[2]} 0;
  }

  @media (max-width: 430px) {
    .active-wallets-box,
    .empty-wallet-list-box {
      height: auto;
      max-height: clamp(360px, 470px, 80vh);
    }
  }
`,K=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},q={ADDRESS_DISPLAY:{START:4,END:6},BADGE:{SIZE:`md`,ICON:`lightbulb`},SCROLL_THRESHOLD:50,OPACITY_RANGE:[0,1]},Lt={eip155:`ethereum`,solana:`solana`,bip122:`bitcoin`,ton:`ton`,tron:`tron`},Rt=[{namespace:`eip155`,icon:Lt.eip155,label:`EVM`},{namespace:`solana`,icon:Lt.solana,label:`Solana`},{namespace:`bip122`,icon:Lt.bip122,label:`Bitcoin`},{namespace:`ton`,icon:Lt.ton,label:`Ton`},{namespace:`tron`,icon:Lt.tron,label:`Tron`}],zt={eip155:{title:`Add EVM Wallet`,description:`Add your first EVM wallet`},solana:{title:`Add Solana Wallet`,description:`Add your first Solana wallet`},bip122:{title:`Add Bitcoin Wallet`,description:`Add your first Bitcoin wallet`},ton:{title:`Add TON Wallet`,description:`Add your first TON wallet`},tron:{title:`Add TRON Wallet`,description:`Add your first TRON wallet`}},J=class extends j{constructor(){super(),this.unsubscribers=[],this.currentTab=0,this.namespace=y.state.activeChain,this.namespaces=Array.from(y.state.chains.keys()),this.caipAddress=void 0,this.profileName=void 0,this.activeConnectorIds=g.state.activeConnectorIds,this.lastSelectedAddress=``,this.lastSelectedConnectorId=``,this.isSwitching=!1,this.caipNetwork=y.state.activeCaipNetwork,this.user=y.getAccountData()?.user,this.remoteFeatures=p.state.remoteFeatures,this.currentTab=this.namespace?this.namespaces.indexOf(this.namespace):0,this.caipAddress=y.getAccountData(this.namespace)?.caipAddress,this.profileName=y.getAccountData(this.namespace)?.profileName,this.unsubscribers.push(_.subscribeKey(`connections`,()=>this.onConnectionsChange()),_.subscribeKey(`recentConnections`,()=>this.requestUpdate()),g.subscribeKey(`activeConnectorIds`,e=>{this.activeConnectorIds=e}),y.subscribeKey(`activeCaipNetwork`,e=>this.caipNetwork=e),y.subscribeChainProp(`accountState`,e=>{this.user=e?.user}),p.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e)),this.chainListener=y.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress,this.profileName=e?.profileName},this.namespace)}disconnectedCallback(){this.unsubscribers.forEach(e=>e()),this.resizeObserver?.disconnect(),this.removeScrollListener(),this.chainListener?.()}firstUpdated(){let e=this.shadowRoot?.querySelector(`.wallet-list`);if(!e)return;let t=()=>this.updateScrollOpacity(e);requestAnimationFrame(t),e.addEventListener(`scroll`,t),this.resizeObserver=new ResizeObserver(t),this.resizeObserver.observe(e),t()}render(){let e=this.namespace;if(!e)throw Error(`Namespace is not set`);return C`
      <wui-flex flexDirection="column" .padding=${[`0`,`4`,`4`,`4`]} gap="4">
        ${this.renderTabs()} ${this.renderHeader(e)} ${this.renderConnections(e)}
        ${this.renderAddConnectionButton(e)}
      </wui-flex>
    `}renderTabs(){let e=this.namespaces.map(e=>Rt.find(t=>t.namespace===e)).filter(Boolean);return e.length>1?C`
        <wui-tabs
          .onTabChange=${e=>this.handleTabChange(e)}
          .activeTab=${this.currentTab}
          .tabs=${e}
        ></wui-tabs>
      `:null}renderHeader(e){let t=this.getActiveConnections(e).flatMap(({accounts:e})=>e).length+ +!!this.caipAddress;return C`
      <wui-flex alignItems="center" columngap="1">
        <wui-icon
          size="sm"
          name=${Lt[e]??Lt.eip155}
        ></wui-icon>
        <wui-text color="secondary" variant="lg-regular"
          >${t>1?`Wallets`:`Wallet`}</wui-text
        >
        <wui-text
          color="primary"
          variant="lg-regular"
          class="balance-amount"
          data-testid="balance-amount"
        >
          ${t}
        </wui-text>
        <wui-link
          color="secondary"
          variant="secondary"
          @click=${()=>_.disconnect({namespace:e})}
          ?disabled=${!this.hasAnyConnections(e)}
          data-testid="disconnect-all-button"
        >
          Disconnect All
        </wui-link>
      </wui-flex>
    `}renderConnections(e){let t=this.hasAnyConnections(e);return C`
      <wui-flex flexDirection="column" class=${he({"wallet-list":!0,"active-wallets-box":t,"empty-wallet-list-box":!t})} rowgap="3">
        ${t?this.renderActiveConnections(e):this.renderEmptyState(e)}
      </wui-flex>
    `}renderActiveConnections(e){let t=this.getActiveConnections(e),n=this.activeConnectorIds[e],r=this.getPlainAddress();return C`
      ${r||n||t.length>0?C`<wui-flex
            flexDirection="column"
            .padding=${[`4`,`0`,`4`,`0`]}
            class="active-wallets"
          >
            ${this.renderActiveProfile(e)} ${this.renderActiveConnectionsList(e)}
          </wui-flex>`:null}
      ${this.renderRecentConnections(e)}
    `}renderActiveProfile(e){let t=this.activeConnectorIds[e];if(!t)return null;let{connections:n}=ie.getConnectionsData(e),r=g.getConnectorById(t),i=f.getConnectorImage(r),a=this.getPlainAddress();if(!a)return null;let o=e===v.CHAIN.BITCOIN,s=Ft.getAuthData({connectorId:t,accounts:[]}),c=this.getActiveConnections(e).flatMap(e=>e.accounts).length>0,l=n.find(e=>e.connectorId===t),u=l?.accounts.filter(e=>!N.isLowerCaseMatch(e.address,a));return C`
      <wui-flex flexDirection="column" .padding=${[`0`,`4`,`0`,`4`]}>
        <wui-active-profile-wallet-item
          address=${a}
          alt=${r?.name}
          .content=${this.getProfileContent({address:a,connections:n,connectorId:t,namespace:e})}
          .charsStart=${q.ADDRESS_DISPLAY.START}
          .charsEnd=${q.ADDRESS_DISPLAY.END}
          .icon=${s.icon}
          .iconSize=${s.iconSize}
          .iconBadge=${this.isSmartAccount(a)?q.BADGE.ICON:void 0}
          .iconBadgeSize=${this.isSmartAccount(a)?q.BADGE.SIZE:void 0}
          imageSrc=${i}
          ?enableMoreButton=${s.isAuth}
          @copy=${()=>this.handleCopyAddress(a)}
          @disconnect=${()=>this.handleDisconnect(e,t)}
          @switch=${()=>{o&&l&&u?.[0]&&this.handleSwitchWallet(l,u[0].address,e)}}
          @externalLink=${()=>this.handleExternalLink(a)}
          @more=${()=>this.handleMore()}
          data-testid="wui-active-profile-wallet-item"
        ></wui-active-profile-wallet-item>
        ${c?C`<wui-separator></wui-separator>`:null}
      </wui-flex>
    `}renderActiveConnectionsList(e){let t=this.getActiveConnections(e);return t.length===0?null:C`
      <wui-flex flexDirection="column" .padding=${[`0`,`2`,`0`,`2`]}>
        ${this.renderConnectionList(t,!1,e)}
      </wui-flex>
    `}renderRecentConnections(e){let{recentConnections:t}=ie.getConnectionsData(e);return t.flatMap(e=>e.accounts).length===0?null:C`
      <wui-flex flexDirection="column" .padding=${[`0`,`2`,`0`,`2`]} rowGap="2">
        <wui-text color="secondary" variant="sm-medium" data-testid="recently-connected-text"
          >RECENTLY CONNECTED</wui-text
        >
        <wui-flex flexDirection="column" .padding=${[`0`,`2`,`0`,`2`]}>
          ${this.renderConnectionList(t,!0,e)}
        </wui-flex>
      </wui-flex>
    `}renderConnectionList(e,t,n){return e.filter(e=>e.accounts.length>0).map((e,r)=>{let i=g.getConnectorById(e.connectorId),a=f.getConnectorImage(i)??``,o=Ft.getAuthData(e);return e.accounts.map((i,s)=>{let c=r!==0||s!==0,l=this.isAccountLoading(e.connectorId,i.address);return C`
            <wui-flex flexDirection="column">
              ${c?C`<wui-separator></wui-separator>`:null}
              <wui-inactive-profile-wallet-item
                address=${i.address}
                alt=${e.connectorId}
                buttonLabel=${t?`Connect`:`Switch`}
                buttonVariant=${t?`neutral-secondary`:`accent-secondary`}
                rightIcon=${t?`bin`:`power`}
                rightIconSize="sm"
                class=${t?`recent-connection`:`active-connection`}
                data-testid=${t?`recent-connection`:`active-connection`}
                imageSrc=${a}
                .iconBadge=${this.isSmartAccount(i.address)?q.BADGE.ICON:void 0}
                .iconBadgeSize=${this.isSmartAccount(i.address)?q.BADGE.SIZE:void 0}
                .icon=${o.icon}
                .iconSize=${o.iconSize}
                .loading=${l}
                .showBalance=${!1}
                .charsStart=${q.ADDRESS_DISPLAY.START}
                .charsEnd=${q.ADDRESS_DISPLAY.END}
                @buttonClick=${()=>this.handleSwitchWallet(e,i.address,n)}
                @iconClick=${()=>this.handleWalletAction({connection:e,address:i.address,isRecentConnection:t,namespace:n})}
              ></wui-inactive-profile-wallet-item>
            </wui-flex>
          `})})}renderAddConnectionButton(e){if(!this.isMultiWalletEnabled()&&this.caipAddress||!this.hasAnyConnections(e))return null;let{title:t}=this.getChainLabelInfo(e);return C`
      <wui-list-item
        variant="icon"
        iconVariant="overlay"
        icon="plus"
        iconSize="sm"
        ?chevron=${!0}
        @click=${()=>this.handleAddConnection(e)}
        data-testid="add-connection-button"
      >
        <wui-text variant="md-medium" color="secondary">${t}</wui-text>
      </wui-list-item>
    `}renderEmptyState(e){let{title:t,description:n}=this.getChainLabelInfo(e);return C`
      <wui-flex alignItems="flex-start" class="empty-template" data-testid="empty-template">
        <wui-flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          rowgap="3"
          class="empty-box"
        >
          <wui-icon-box size="xl" icon="wallet" color="secondary"></wui-icon-box>

          <wui-flex flexDirection="column" alignItems="center" justifyContent="center" gap="1">
            <wui-text color="primary" variant="lg-regular" data-testid="empty-state-text"
              >No wallet connected</wui-text
            >
            <wui-text color="secondary" variant="md-regular" data-testid="empty-state-description"
              >${n}</wui-text
            >
          </wui-flex>

          <wui-link
            @click=${()=>this.handleAddConnection(e)}
            data-testid="empty-state-button"
            icon="plus"
          >
            ${t}
          </wui-link>
        </wui-flex>
      </wui-flex>
    `}handleTabChange(e){let t=this.namespaces[e];t&&(this.chainListener?.(),this.currentTab=this.namespaces.indexOf(t),this.namespace=t,this.caipAddress=y.getAccountData(t)?.caipAddress,this.profileName=y.getAccountData(t)?.profileName,this.chainListener=y.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress},t))}async handleSwitchWallet(e,t,n){try{this.isSwitching=!0,this.lastSelectedConnectorId=e.connectorId,this.lastSelectedAddress=t,this.caipNetwork?.chainNamespace!==n&&e?.caipNetwork&&(g.setFilterByNamespace(n),await y.switchActiveNetwork(e?.caipNetwork)),await _.switchConnection({connection:e,address:t,namespace:n,closeModalOnConnect:!1,onChange({hasSwitchedAccount:e,hasSwitchedWallet:t}){t?l.showSuccess(`Wallet switched`):e&&l.showSuccess(`Account switched`)}})}catch{l.showError(`Failed to switch wallet`)}finally{this.isSwitching=!1}}handleWalletAction(e){let{connection:t,address:n,isRecentConnection:r,namespace:i}=e;r?(ne.deleteAddressFromConnection({connectorId:t.connectorId,address:n,namespace:i}),_.syncStorageConnections(),l.showSuccess(`Wallet deleted`)):this.handleDisconnect(i,t.connectorId)}async handleDisconnect(e,t){try{await _.disconnect({id:t,namespace:e}),l.showSuccess(`Wallet disconnected`)}catch{l.showError(`Failed to disconnect wallet`)}}handleCopyAddress(e){s.copyToClopboard(e),l.showSuccess(`Address copied`)}handleMore(){m.push(`AccountSettings`)}handleExternalLink(e){let t=this.caipNetwork?.blockExplorers?.default.url;t&&s.openHref(`${t}/address/${e}`,`_blank`)}handleAddConnection(e){g.setFilterByNamespace(e),m.push(`Connect`,{addWalletForNamespace:e})}getChainLabelInfo(e){return zt[e]??{title:`Add Wallet`,description:`Add your first wallet`}}isSmartAccount(e){if(!this.namespace)return!1;let t=this.user?.accounts?.find(e=>e.type===`smartAccount`);return t&&e?N.isLowerCaseMatch(t.address,e):!1}getPlainAddress(){return this.caipAddress?s.getPlainAddress(this.caipAddress):void 0}getActiveConnections(e){let t=this.activeConnectorIds[e],{connections:n}=ie.getConnectionsData(e),[r]=n.filter(e=>N.isLowerCaseMatch(e.connectorId,t));if(!t)return n;let i=e===v.CHAIN.BITCOIN,{address:a}=this.caipAddress?se.parseCaipAddress(this.caipAddress):{},o=[...a?[a]:[]];return i&&r&&(o=r.accounts.map(e=>e.address)||[]),ie.excludeConnectorAddressFromConnections({connectorId:t,addresses:o,connections:n})}hasAnyConnections(e){let t=this.getActiveConnections(e),{recentConnections:n}=ie.getConnectionsData(e);return!!this.caipAddress||t.length>0||n.length>0}isAccountLoading(e,t){return N.isLowerCaseMatch(this.lastSelectedConnectorId,e)&&N.isLowerCaseMatch(this.lastSelectedAddress,t)&&this.isSwitching}getProfileContent(e){let{address:t,connections:n,connectorId:r,namespace:i}=e,[a]=n.filter(e=>N.isLowerCaseMatch(e.connectorId,r));if(i===v.CHAIN.BITCOIN&&a?.accounts.every(e=>typeof e.type==`string`))return this.getBitcoinProfileContent(a.accounts,t);let o=Ft.getAuthData({connectorId:r,accounts:[]});return[{address:t,tagLabel:`Active`,tagVariant:`success`,enableButton:!0,profileName:this.profileName,buttonType:`disconnect`,buttonLabel:`Disconnect`,buttonVariant:`neutral-secondary`,...o.isAuth?{description:this.isSmartAccount(t)?`Smart Account`:`EOA Account`}:{}}]}getBitcoinProfileContent(e,t){let n=e.length>1,r=this.getPlainAddress();return e.map(e=>{let i=N.isLowerCaseMatch(e.address,r),a=`PAYMENT`;return e.type===`ordinal`&&(a=`ORDINALS`),{address:e.address,tagLabel:N.isLowerCaseMatch(e.address,t)?`Active`:void 0,tagVariant:N.isLowerCaseMatch(e.address,t)?`success`:void 0,enableButton:!0,...n?{label:a,alignItems:`flex-end`,buttonType:i?`disconnect`:`switch`,buttonLabel:i?`Disconnect`:`Switch`,buttonVariant:i?`neutral-secondary`:`accent-secondary`}:{alignItems:`center`,buttonType:`disconnect`,buttonLabel:`Disconnect`,buttonVariant:`neutral-secondary`}}})}removeScrollListener(){let e=this.shadowRoot?.querySelector(`.wallet-list`);e&&e.removeEventListener(`scroll`,()=>this.handleConnectListScroll())}handleConnectListScroll(){let e=this.shadowRoot?.querySelector(`.wallet-list`);e&&this.updateScrollOpacity(e)}isMultiWalletEnabled(){return!!this.remoteFeatures?.multiWallet}updateScrollOpacity(e){e.style.setProperty(`--connect-scroll--top-opacity`,ve.interpolate([0,q.SCROLL_THRESHOLD],q.OPACITY_RANGE,e.scrollTop).toString()),e.style.setProperty(`--connect-scroll--bottom-opacity`,ve.interpolate([0,q.SCROLL_THRESHOLD],q.OPACITY_RANGE,e.scrollHeight-e.scrollTop-e.offsetHeight).toString())}onConnectionsChange(){if(this.isMultiWalletEnabled()&&this.namespace){let{connections:e}=ie.getConnectionsData(this.namespace);e.length===0&&m.reset(`ProfileWallets`)}this.requestUpdate()}};J.styles=It,K([T()],J.prototype,`currentTab`,void 0),K([T()],J.prototype,`namespace`,void 0),K([T()],J.prototype,`namespaces`,void 0),K([T()],J.prototype,`caipAddress`,void 0),K([T()],J.prototype,`profileName`,void 0),K([T()],J.prototype,`activeConnectorIds`,void 0),K([T()],J.prototype,`lastSelectedAddress`,void 0),K([T()],J.prototype,`lastSelectedConnectorId`,void 0),K([T()],J.prototype,`isSwitching`,void 0),K([T()],J.prototype,`caipNetwork`,void 0),K([T()],J.prototype,`user`,void 0),K([T()],J.prototype,`remoteFeatures`,void 0),J=K([D(`w3m-profile-wallets-view`)],J);var Bt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Vt=class extends j{constructor(){super(),this.unsubscribe=[],this.activeCaipNetwork=y.state.activeCaipNetwork,this.features=p.state.features,this.remoteFeatures=p.state.remoteFeatures,this.exchangesLoading=M.state.isLoading,this.exchanges=M.state.exchanges,this.unsubscribe.push(p.subscribeKey(`features`,e=>this.features=e),p.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e),y.subscribeKey(`activeCaipNetwork`,e=>{this.activeCaipNetwork=e,this.setDefaultPaymentAsset()}),M.subscribeKey(`isLoading`,e=>this.exchangesLoading=e),M.subscribeKey(`exchanges`,e=>this.exchanges=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}async firstUpdated(){M.isPayWithExchangeSupported()&&(await this.setDefaultPaymentAsset(),await M.fetchExchanges())}render(){return C`
      <wui-flex flexDirection="column" .padding=${[`1`,`3`,`3`,`3`]} gap="2">
        ${this.onrampTemplate()} ${this.receiveTemplate()} ${this.depositFromExchangeTemplate()}
      </wui-flex>
    `}async setDefaultPaymentAsset(){if(!this.activeCaipNetwork)return;let e=await M.getAssetsForNetwork(this.activeCaipNetwork.caipNetworkId),t=e.find(e=>e.metadata.symbol===`USDC`)||e[0];t&&M.setPaymentAsset(t)}onrampTemplate(){if(!this.activeCaipNetwork)return null;let e=this.remoteFeatures?.onramp,t=d.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.activeCaipNetwork.chainNamespace);return!e||!t?null:C`
      <wui-list-item
        @click=${this.onBuyCrypto.bind(this)}
        icon="card"
        data-testid="wallet-features-onramp-button"
      >
        <wui-text variant="lg-regular" color="primary">Buy crypto</wui-text>
      </wui-list-item>
    `}depositFromExchangeTemplate(){return!this.activeCaipNetwork||!M.isPayWithExchangeSupported()?null:C`
      <wui-list-item
        @click=${this.onDepositFromExchange.bind(this)}
        icon="arrowBottomCircle"
        data-testid="wallet-features-deposit-from-exchange-button"
        ?loading=${this.exchangesLoading}
        ?disabled=${this.exchangesLoading||!this.exchanges.length}
      >
        <wui-text variant="lg-regular" color="primary">Deposit from exchange</wui-text>
      </wui-list-item>
    `}receiveTemplate(){return this.features?.receive?C`
      <wui-list-item
        @click=${this.onReceive.bind(this)}
        icon="qrCode"
        data-testid="wallet-features-receive-button"
      >
        <wui-text variant="lg-regular" color="primary">Receive funds</wui-text>
      </wui-list-item>
    `:null}onBuyCrypto(){m.push(`OnRampProviders`)}onReceive(){m.push(`WalletReceive`)}onDepositFromExchange(){M.reset(),m.push(`PayWithExchange`,{redirectView:m.state.data?.redirectView})}};Bt([T()],Vt.prototype,`activeCaipNetwork`,void 0),Bt([T()],Vt.prototype,`features`,void 0),Bt([T()],Vt.prototype,`remoteFeatures`,void 0),Bt([T()],Vt.prototype,`exchangesLoading`,void 0),Bt([T()],Vt.prototype,`exchanges`,void 0),Vt=Bt([D(`w3m-fund-wallet-view`)],Vt);var Ht=O`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  label {
    position: relative;
    display: inline-block;
    user-select: none;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({colors:e})=>e.neutrals300};
    border-radius: ${({borderRadius:e})=>e.round};
    border: 1px solid transparent;
    will-change: border;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  span:before {
    content: '';
    position: absolute;
    background-color: ${({colors:e})=>e.white};
    border-radius: 50%;
  }

  /* -- Sizes --------------------------------------------------------- */
  label[data-size='lg'] {
    width: 48px;
    height: 32px;
  }

  label[data-size='md'] {
    width: 40px;
    height: 28px;
  }

  label[data-size='sm'] {
    width: 32px;
    height: 22px;
  }

  label[data-size='lg'] > span:before {
    height: 24px;
    width: 24px;
    left: 4px;
    top: 3px;
  }

  label[data-size='md'] > span:before {
    height: 20px;
    width: 20px;
    left: 4px;
    top: 3px;
  }

  label[data-size='sm'] > span:before {
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
  }

  /* -- Focus states --------------------------------------------------- */
  input:focus-visible:not(:checked) + span,
  input:focus:not(:checked) + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    background-color: ${({tokens:e})=>e.theme.textTertiary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  input:focus-visible:checked + span,
  input:focus:checked + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Checked states --------------------------------------------------- */
  input:checked + span {
    background-color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  label[data-size='lg'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='md'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='sm'] > input:checked + span:before {
    transform: translateX(calc(100% - 7px));
  }

  /* -- Hover states ------------------------------------------------------- */
  label:hover > input:not(:checked):not(:disabled) + span {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  label:hover > input:checked:not(:disabled) + span {
    background-color: ${({colors:e})=>e.accent080};
  }

  /* -- Disabled state --------------------------------------------------- */
  label:has(input:disabled) {
    pointer-events: none;
    user-select: none;
  }

  input:not(:checked):disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:checked:disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:not(:checked):disabled + span::before {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  input:checked:disabled + span::before {
    background-color: ${({tokens:e})=>e.theme.textTertiary};
  }
`,Ut=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Wt=class extends j{constructor(){super(...arguments),this.inputElementRef=xe(),this.checked=!1,this.disabled=!1,this.size=`md`}render(){return C`
      <label data-size=${this.size}>
        <input
          ${be(this.inputElementRef)}
          type="checkbox"
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent(`switchChange`,{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};Wt.styles=[A,w,Ht],Ut([S({type:Boolean})],Wt.prototype,`checked`,void 0),Ut([S({type:Boolean})],Wt.prototype,`disabled`,void 0),Ut([S()],Wt.prototype,`size`,void 0),Wt=Ut([D(`wui-toggle`)],Wt);var Gt=O`
  :host {
    height: auto;
  }

  :host > wui-flex {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`,Kt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},qt=class extends j{constructor(){super(...arguments),this.checked=!1}render(){return C`
      <wui-flex>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-toggle
          ?checked=${this.checked}
          size="sm"
          @switchChange=${this.handleToggleChange.bind(this)}
        ></wui-toggle>
      </wui-flex>
    `}handleToggleChange(e){e.stopPropagation(),this.checked=e.detail,this.dispatchSwitchEvent()}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent(`certifiedSwitchChange`,{detail:this.checked,bubbles:!0,composed:!0}))}};qt.styles=[A,w,Gt],Kt([S({type:Boolean})],qt.prototype,`checked`,void 0),qt=Kt([D(`wui-certified-switch`)],qt);var Jt=O`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.iconDefault};
    cursor: pointer;
    padding: ${({spacing:e})=>e[2]};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
  }

  @media (hover: hover) {
    wui-icon:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }
`,Yt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Xt=class extends j{constructor(){super(...arguments),this.inputComponentRef=xe(),this.inputValue=``}render(){return C`
      <wui-input-text
        ${be(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
        @inputChange=${this.onInputChange}
      >
        ${this.inputValue?C`<wui-icon
              @click=${this.clearValue}
              color="inherit"
              size="sm"
              name="close"
            ></wui-icon>`:null}
      </wui-input-text>
    `}onInputChange(e){this.inputValue=e.detail||``}clearValue(){let e=this.inputComponentRef.value?.inputElementRef.value;e&&(e.value=``,this.inputValue=``,e.focus(),e.dispatchEvent(new Event(`input`)))}};Xt.styles=[A,Jt],Yt([S()],Xt.prototype,`inputValue`,void 0),Xt=Yt([D(`wui-search-bar`)],Xt);var Zt=O`
  :host {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 104px;
    width: 104px;
    row-gap: ${({spacing:e})=>e[2]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    -webkit-clip-path: var(--apkt-path-network);
    clip-path: var(--apkt-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: ${({tokens:e})=>e.theme.foregroundSecondary};
    stroke-width: 1px;
  }

  @media (max-width: 350px) {
    :host {
      width: 100%;
    }
  }
`,Qt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},$t=class extends j{constructor(){super(...arguments),this.type=`wallet`}render(){return C`
      ${this.shimmerTemplate()}
      <wui-shimmer width="80px" height="20px"></wui-shimmer>
    `}shimmerTemplate(){return this.type===`network`?C` <wui-shimmer data-type=${this.type} width="48px" height="54px"></wui-shimmer>
        ${ye}`:C`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}};$t.styles=[A,w,Zt],Qt([S()],$t.prototype,`type`,void 0),$t=Qt([D(`wui-card-select-loader`)],$t);var en=me`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`,Y=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},X=class extends j{render(){return this.style.cssText=`
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap&&`var(--apkt-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--apkt-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--apkt-spacing-${this.gap})`};
      padding-top: ${this.padding&&k.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&k.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&k.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&k.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&k.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&k.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&k.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&k.getSpacingStyles(this.margin,3)};
    `,C`<slot></slot>`}};X.styles=[A,en],Y([S()],X.prototype,`gridTemplateRows`,void 0),Y([S()],X.prototype,`gridTemplateColumns`,void 0),Y([S()],X.prototype,`justifyItems`,void 0),Y([S()],X.prototype,`alignItems`,void 0),Y([S()],X.prototype,`justifyContent`,void 0),Y([S()],X.prototype,`alignContent`,void 0),Y([S()],X.prototype,`columnGap`,void 0),Y([S()],X.prototype,`rowGap`,void 0),Y([S()],X.prototype,`gap`,void 0),Y([S()],X.prototype,`padding`,void 0),Y([S()],X.prototype,`margin`,void 0),X=Y([D(`wui-grid`)],X);var tn=O`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[0]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: clamp(0px, ${({borderRadius:e})=>e[4]}, 20px);
    transition:
      color ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-1`]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-1`]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textPrimary};
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:disabled > wui-flex > wui-text {
    color: ${({tokens:e})=>e.core.glass010};
  }

  [data-selected='true'] {
    background-color: ${({colors:e})=>e.accent020};
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: ${({colors:e})=>e.accent010};
    }
  }

  [data-selected='true']:active:enabled {
    background-color: ${({colors:e})=>e.accent010};
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`,nn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Z=class extends j{constructor(){super(),this.observer=new IntersectionObserver(()=>void 0),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.isImpressed=!1,this.explorerId=``,this.walletQuery=``,this.certified=!1,this.displayIndex=0,this.wallet=void 0,this.observer=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting?(this.visible=!0,this.fetchImageSrc(),this.sendImpressionEvent()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){let e=this.wallet?.badge_type===`certified`;return C`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="1">
          <wui-text
            variant="md-regular"
            color="inherit"
            class=${E(e?`certified`:void 0)}
            >${this.wallet?.name}</wui-text
          >
          ${e?C`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){return!this.visible&&!this.imageSrc||this.imageLoading?this.shimmerTemplate():C`
      <wui-wallet-image
        size="lg"
        imageSrc=${E(this.imageSrc)}
        name=${E(this.wallet?.name)}
        .installed=${this.wallet?.installed??!1}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `}shimmerTemplate(){return C`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}async fetchImageSrc(){this.wallet&&(this.imageSrc=f.getWalletImage(this.wallet),!this.imageSrc&&(this.imageLoading=!0,this.imageSrc=await f.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}sendImpressionEvent(){!this.wallet||this.isImpressed||(this.isImpressed=!0,h.sendWalletImpressionEvent({name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.explorerId,view:m.state.view,query:this.walletQuery,certified:this.certified,displayIndex:this.displayIndex}))}};Z.styles=tn,nn([T()],Z.prototype,`visible`,void 0),nn([T()],Z.prototype,`imageSrc`,void 0),nn([T()],Z.prototype,`imageLoading`,void 0),nn([T()],Z.prototype,`isImpressed`,void 0),nn([S()],Z.prototype,`explorerId`,void 0),nn([S()],Z.prototype,`walletQuery`,void 0),nn([S()],Z.prototype,`certified`,void 0),nn([S()],Z.prototype,`displayIndex`,void 0),nn([S({type:Object})],Z.prototype,`wallet`,void 0),Z=nn([D(`w3m-all-wallets-list-item`)],Z);var rn=O`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  w3m-all-wallets-list-item {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e[`ease-inout-power-2`]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-loading-spinner {
    padding-top: ${({spacing:e})=>e[4]};
    padding-bottom: ${({spacing:e})=>e[4]};
    justify-content: center;
    grid-column: 1 / span 4;
  }
`,an=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},on=`local-paginator`,sn=class extends j{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!b.state.wallets.length,this.wallets=b.state.wallets,this.mobileFullScreen=p.state.enableMobileFullScreen,this.unsubscribe.push(b.subscribeKey(`wallets`,e=>this.wallets=e))}firstUpdated(){this.mobileFullScreen&&this.setAttribute(`data-mobile-fullscreen`,`true`),this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.paginationObserver?.disconnect()}render(){return C`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${[`0`,`3`,`3`,`3`]}
        gap="2"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){this.loading=!0;let e=this.shadowRoot?.querySelector(`wui-grid`);e&&(await b.fetchWalletsByPage({page:1}),await e.animate([{opacity:1},{opacity:0}],{duration:200,fill:`forwards`,easing:`ease`}).finished,this.loading=!1,e.animate([{opacity:0},{opacity:1}],{duration:200,fill:`forwards`,easing:`ease`}))}shimmerTemplate(e,t){return[...Array(e)].map(()=>C`
        <wui-card-select-loader type="wallet" id=${E(t)}></wui-card-select-loader>
      `)}walletsTemplate(){return ce.getWalletConnectWallets(this.wallets).map((e,t)=>C`
        <w3m-all-wallets-list-item
          data-testid="wallet-search-item-${e.id}"
          @click=${()=>this.onConnectWallet(e)}
          .wallet=${e}
          explorerId=${e.id}
          certified=${this.badge===`certified`}
          displayIndex=${t}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){let{wallets:e,recommended:t,featured:n,count:r,mobileFilteredOutWalletsLength:i}=b.state,a=window.innerWidth<352?3:4,o=e.length+t.length,s=Math.ceil(o/a)*a-o+a;return s-=e.length?n.length%a:0,r===0&&n.length>0?null:r===0||[...n,...e,...t].length<r-(i??0)?this.shimmerTemplate(s,on):null}createPaginationObserver(){let e=this.shadowRoot?.querySelector(`#${on}`);e&&(this.paginationObserver=new IntersectionObserver(([e])=>{if(e?.isIntersecting&&!this.loading){let{page:e,count:t,wallets:n}=b.state;n.length<t&&b.fetchWalletsByPage({page:e+1})}}),this.paginationObserver.observe(e))}onConnectWallet(e){g.selectWalletConnector(e)}};sn.styles=rn,an([T()],sn.prototype,`loading`,void 0),an([T()],sn.prototype,`wallets`,void 0),an([T()],sn.prototype,`badge`,void 0),an([T()],sn.prototype,`mobileFullScreen`,void 0),sn=an([D(`w3m-all-wallets-list`)],sn);var cn=me`
  wui-grid,
  wui-loading-spinner,
  wui-flex {
    height: 360px;
  }

  wui-grid {
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
    height: auto;
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`,ln=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},un=class extends j{constructor(){super(...arguments),this.prevQuery=``,this.prevBadge=void 0,this.loading=!0,this.mobileFullScreen=p.state.enableMobileFullScreen,this.query=``}render(){return this.mobileFullScreen&&this.setAttribute(`data-mobile-fullscreen`,`true`),this.onSearch(),this.loading?C`<wui-loading-spinner color="accent-primary"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){(this.query.trim()!==this.prevQuery.trim()||this.badge!==this.prevBadge)&&(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await b.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){let{search:e}=b.state,t=ce.markWalletsAsInstalled(e),n=ce.filterWalletsByWcSupport(t);return n.length?C`
      <wui-grid
        data-testid="wallet-list"
        .padding=${[`0`,`3`,`3`,`3`]}
        rowGap="4"
        columngap="2"
        justifyContent="space-between"
      >
        ${n.map((e,t)=>C`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(e)}
              .wallet=${e}
              data-testid="wallet-search-item-${e.id}"
              explorerId=${e.id}
              certified=${this.badge===`certified`}
              walletQuery=${this.query}
              displayIndex=${t}
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `:C`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="3"
          flexDirection="column"
        >
          <wui-icon-box size="lg" color="default" icon="wallet"></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="secondary" variant="md-medium">
            No Wallet found
          </wui-text>
        </wui-flex>
      `}onConnectWallet(e){g.selectWalletConnector(e)}};un.styles=cn,ln([T()],un.prototype,`loading`,void 0),ln([T()],un.prototype,`mobileFullScreen`,void 0),ln([S()],un.prototype,`query`,void 0),ln([S()],un.prototype,`badge`,void 0),un=ln([D(`w3m-all-wallets-search`)],un);var dn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},fn=class extends j{constructor(){super(...arguments),this.search=``,this.badge=void 0,this.onDebouncedSearch=s.debounce(e=>{this.search=e})}render(){let e=this.search.length>=2;return C`
      <wui-flex .padding=${[`1`,`3`,`3`,`3`]} gap="2" alignItems="center">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${this.badge===`certified`}
          @certifiedSwitchChange=${this.onCertifiedSwitchChange.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${e||this.badge?C`<w3m-all-wallets-search
            query=${this.search}
            .badge=${this.badge}
          ></w3m-all-wallets-search>`:C`<w3m-all-wallets-list .badge=${this.badge}></w3m-all-wallets-list>`}
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}onCertifiedSwitchChange(e){e.detail?(this.badge=`certified`,l.showSvg(`Only WalletConnect certified`,{icon:`walletConnectBrown`,iconColor:`accent-100`})):this.badge=void 0}qrButtonTemplate(){return s.isMobile()?C`
        <wui-icon-box
          size="xl"
          iconSize="xl"
          color="accent-primary"
          icon="qrCode"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){m.push(`ConnectingWalletConnect`)}};dn([T()],fn.prototype,`search`,void 0),dn([T()],fn.prototype,`badge`,void 0),fn=dn([D(`w3m-all-wallets-view`)],fn);var pn=O`
  button {
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[4]};
    width: 100%;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    justify-content: center;
    align-items: center;
  }

  :host([data-size='sm']) button {
    padding: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-size='md']) button {
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  button:hover {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  button:disabled {
    opacity: 0.5;
  }
`,mn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},hn=class extends j{constructor(){super(...arguments),this.text=``,this.disabled=!1,this.size=`lg`,this.icon=`copy`,this.tabIdx=void 0}render(){this.dataset.size=this.size;let e=`${this.size}-regular`;return C`
      <button ?disabled=${this.disabled} tabindex=${E(this.tabIdx)}>
        <wui-icon name=${this.icon} size=${this.size} color="default"></wui-icon>
        <wui-text align="center" variant=${e} color="primary">${this.text}</wui-text>
      </button>
    `}};hn.styles=[A,w,pn],mn([S()],hn.prototype,`text`,void 0),mn([S({type:Boolean})],hn.prototype,`disabled`,void 0),mn([S()],hn.prototype,`size`,void 0),mn([S()],hn.prototype,`icon`,void 0),mn([S()],hn.prototype,`tabIdx`,void 0),hn=mn([D(`wui-list-button`)],hn);var gn=O`
  wui-separator {
    margin: ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1);
    width: calc(100% + ${({spacing:e})=>e[3]} * 2);
  }

  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
  }

  wui-icon-link,
  wui-loading-spinner {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  wui-icon-link {
    right: ${({spacing:e})=>e[2]};
  }

  wui-loading-spinner {
    right: ${({spacing:e})=>e[3]};
  }

  wui-text {
    margin: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[0]} ${({spacing:e})=>e[3]};
  }
`,_n=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},vn=class extends j{constructor(){super(),this.unsubscribe=[],this.formRef=xe(),this.email=``,this.loading=!1,this.error=``,this.remoteFeatures=p.state.remoteFeatures,this.hasExceededUsageLimit=b.state.plan.hasExceededUsageLimit,this.unsubscribe.push(p.subscribeKey(`remoteFeatures`,e=>{this.remoteFeatures=e}),b.subscribeKey(`plan`,e=>this.hasExceededUsageLimit=e.hasExceededUsageLimit))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}firstUpdated(){this.formRef.value?.addEventListener(`keydown`,e=>{e.key===`Enter`&&this.onSubmitEmail(e)})}render(){let e=_.hasAnyConnection(v.CONNECTOR_ID.AUTH);return C`
      <form ${be(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
        <wui-email-input
          @focus=${this.onFocusEvent.bind(this)}
          .disabled=${this.loading}
          @inputChange=${this.onEmailInputChange.bind(this)}
          tabIdx=${E(this.tabIdx)}
          ?disabled=${e||this.hasExceededUsageLimit}
        >
        </wui-email-input>

        ${this.submitButtonTemplate()}${this.loadingTemplate()}
        <input type="submit" hidden />
      </form>
      ${this.templateError()}
    `}submitButtonTemplate(){return!this.loading&&this.email.length>3?C`
          <wui-icon-link
            size="lg"
            icon="chevronRight"
            iconcolor="accent-100"
            @click=${this.onSubmitEmail.bind(this)}
          >
          </wui-icon-link>
        `:null}loadingTemplate(){return this.loading?C`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:null}templateError(){return this.error?C`<wui-text variant="sm-medium" color="error">${this.error}</wui-text>`:null}onEmailInputChange(e){this.email=e.detail.trim(),this.error=``}async onSubmitEmail(e){if(!Se.isValidEmail(this.email)){ge.open({displayMessage:pe.ALERT_WARNINGS.INVALID_EMAIL.displayMessage},`warning`);return}if(!v.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(e=>e===y.state.activeChain)){let e=y.getFirstCaipNetworkSupportsAuthConnector();if(e){m.push(`SwitchNetwork`,{network:e});return}}try{if(this.loading)return;this.loading=!0,e.preventDefault();let t=g.getAuthConnector();if(!t)throw Error(`w3m-email-login-widget: Auth connector not found`);let{action:n}=await t.provider.connectEmail({email:this.email});if(h.sendEvent({type:`track`,event:`EMAIL_SUBMITTED`}),n===`VERIFY_OTP`)h.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_SENT`}),m.push(`EmailVerifyOtp`,{email:this.email});else if(n===`VERIFY_DEVICE`)m.push(`EmailVerifyDevice`,{email:this.email});else if(n===`CONNECT`){let e=this.remoteFeatures?.multiWallet;await _.connectExternal(t,y.state.activeChain),e?(m.replace(`ProfileWallets`),l.showSuccess(`New Wallet Added`)):m.replace(`Account`)}}catch(e){s.parseError(e)?.includes(`Invalid email`)?this.error=`Invalid email. Try again.`:l.showError(e)}finally{this.loading=!1}}onFocusEvent(){h.sendEvent({type:`track`,event:`EMAIL_LOGIN_SELECTED`})}};vn.styles=gn,_n([S()],vn.prototype,`tabIdx`,void 0),_n([T()],vn.prototype,`email`,void 0),_n([T()],vn.prototype,`loading`,void 0),_n([T()],vn.prototype,`error`,void 0),_n([T()],vn.prototype,`remoteFeatures`,void 0),_n([T()],vn.prototype,`hasExceededUsageLimit`,void 0),vn=_n([D(`w3m-email-login-widget`)],vn);var yn=O`
  :host {
    display: block;
    width: 100%;
  }

  button {
    width: 100%;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  @media (hover: hover) {
    button:hover:enabled {
      background: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`,bn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},xn=class extends j{constructor(){super(...arguments),this.logo=`google`,this.disabled=!1,this.tabIdx=void 0}render(){return C`
      <button ?disabled=${this.disabled} tabindex=${E(this.tabIdx)}>
        <wui-icon size="xxl" name=${this.logo}></wui-icon>
      </button>
    `}};xn.styles=[A,w,yn],bn([S()],xn.prototype,`logo`,void 0),bn([S({type:Boolean})],xn.prototype,`disabled`,void 0),bn([S()],xn.prototype,`tabIdx`,void 0),xn=bn([D(`wui-logo-select`)],xn);var Sn=O`
  wui-separator {
    margin: ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1)
      ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1);
    width: calc(100% + ${({spacing:e})=>e[3]} * 2);
  }
`,Cn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},wn=2,Tn=6,En=class extends j{constructor(){super(),this.unsubscribe=[],this.walletGuide=`get-started`,this.tabIdx=void 0,this.connectors=g.state.connectors,this.remoteFeatures=p.state.remoteFeatures,this.authConnector=this.connectors.find(e=>e.type===`AUTH`),this.isPwaLoading=!1,this.hasExceededUsageLimit=b.state.plan.hasExceededUsageLimit,this.unsubscribe.push(g.subscribeKey(`connectors`,e=>{this.connectors=e,this.authConnector=this.connectors.find(e=>e.type===`AUTH`)}),p.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e),b.subscribeKey(`plan`,e=>this.hasExceededUsageLimit=e.hasExceededUsageLimit))}connectedCallback(){super.connectedCallback(),this.handlePwaFrameLoad()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return C`
      <wui-flex
        class="container"
        flexDirection="column"
        gap="2"
        data-testid="w3m-social-login-widget"
      >
        ${this.topViewTemplate()}${this.bottomViewTemplate()}
      </wui-flex>
    `}topViewTemplate(){let e=this.walletGuide===`explore`,t=this.remoteFeatures?.socials;return!t&&e?(t=d.DEFAULT_SOCIALS,this.renderTopViewContent(t)):t?this.renderTopViewContent(t):null}renderTopViewContent(e){return e.length===2?C` <wui-flex gap="2">
        ${e.slice(0,wn).map(e=>C`<wui-logo-select
              data-testid=${`social-selector-${e}`}
              @click=${()=>{this.onSocialClick(e)}}
              logo=${e}
              tabIdx=${E(this.tabIdx)}
              ?disabled=${this.isPwaLoading||this.hasConnection()}
            ></wui-logo-select>`)}
      </wui-flex>`:C` <wui-list-button
      data-testid=${`social-selector-${e[0]}`}
      @click=${()=>{this.onSocialClick(e[0])}}
      size="lg"
      icon=${E(e[0])}
      text=${`Continue with ${k.capitalize(e[0])}`}
      tabIdx=${E(this.tabIdx)}
      ?disabled=${this.isPwaLoading||this.hasConnection()}
    ></wui-list-button>`}bottomViewTemplate(){let e=this.remoteFeatures?.socials,t=this.walletGuide===`explore`;return(!this.authConnector||!e||e.length===0)&&t&&(e=d.DEFAULT_SOCIALS),!e||e.length<=wn?null:e&&e.length>Tn?C`<wui-flex gap="2">
        ${e.slice(1,5).map(e=>C`<wui-logo-select
              data-testid=${`social-selector-${e}`}
              @click=${()=>{this.onSocialClick(e)}}
              logo=${e}
              tabIdx=${E(this.tabIdx)}
              ?focusable=${this.tabIdx!==void 0&&this.tabIdx>=0}
              ?disabled=${this.isPwaLoading||this.hasConnection()}
            ></wui-logo-select>`)}
        <wui-logo-select
          logo="more"
          tabIdx=${E(this.tabIdx)}
          @click=${this.onMoreSocialsClick.bind(this)}
          ?disabled=${this.isPwaLoading||this.hasConnection()}
          data-testid="social-selector-more"
        ></wui-logo-select>
      </wui-flex>`:e?C`<wui-flex gap="2">
      ${e.slice(1,e.length).map(e=>C`<wui-logo-select
            data-testid=${`social-selector-${e}`}
            @click=${()=>{this.onSocialClick(e)}}
            logo=${e}
            tabIdx=${E(this.tabIdx)}
            ?focusable=${this.tabIdx!==void 0&&this.tabIdx>=0}
            ?disabled=${this.isPwaLoading||this.hasConnection()}
          ></wui-logo-select>`)}
    </wui-flex>`:null}onMoreSocialsClick(){m.push(`ConnectSocials`)}async onSocialClick(e){if(this.hasExceededUsageLimit){m.push(`UsageExceeded`);return}if(!v.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(e=>e===y.state.activeChain)){let e=y.getFirstCaipNetworkSupportsAuthConnector();if(e){m.push(`SwitchNetwork`,{network:e});return}}e&&await de(e)}async handlePwaFrameLoad(){if(s.isPWA()){this.isPwaLoading=!0;try{this.authConnector?.provider instanceof fe&&await this.authConnector.provider.init()}catch(e){ge.open({displayMessage:`Error loading embedded wallet in PWA`,debugMessage:e.message},`error`)}finally{this.isPwaLoading=!1}}}hasConnection(){return _.hasAnyConnection(v.CONNECTOR_ID.AUTH)}};En.styles=Sn,Cn([S()],En.prototype,`walletGuide`,void 0),Cn([S()],En.prototype,`tabIdx`,void 0),Cn([T()],En.prototype,`connectors`,void 0),Cn([T()],En.prototype,`remoteFeatures`,void 0),Cn([T()],En.prototype,`authConnector`,void 0),Cn([T()],En.prototype,`isPwaLoading`,void 0),Cn([T()],En.prototype,`hasExceededUsageLimit`,void 0),En=Cn([D(`w3m-social-login-widget`)],En);var Dn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},On=class extends j{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=g.state.connectors,this.count=b.state.count,this.filteredCount=b.state.filteredWallets.length,this.isFetchingRecommendedWallets=b.state.isFetchingRecommendedWallets,this.unsubscribe.push(g.subscribeKey(`connectors`,e=>this.connectors=e),b.subscribeKey(`count`,e=>this.count=e),b.subscribeKey(`filteredWallets`,e=>this.filteredCount=e.length),b.subscribeKey(`isFetchingRecommendedWallets`,e=>this.isFetchingRecommendedWallets=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.connectors.find(e=>e.id===`walletConnect`),{allWallets:t}=p.state;if(!e||t===`HIDE`||t===`ONLY_MOBILE`&&!s.isMobile())return null;let n=b.state.featured.length,r=this.count+n,i=r<10?r:Math.floor(r/10)*10,a=this.filteredCount>0?this.filteredCount:i,o=`${a}`;this.filteredCount>0?o=`${this.filteredCount}`:a<r&&(o=`${a}+`);let c=_.hasAnyConnection(v.CONNECTOR_ID.WALLET_CONNECT);return C`
      <wui-list-wallet
        name="Search Wallet"
        walletIcon="search"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${o}
        tagVariant="info"
        data-testid="all-wallets"
        tabIdx=${E(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        ?disabled=${c}
        size="sm"
      ></wui-list-wallet>
    `}onAllWallets(){h.sendEvent({type:`track`,event:`CLICK_ALL_WALLETS`}),m.push(`AllWallets`,{redirectView:m.state.data?.redirectView})}};Dn([S()],On.prototype,`tabIdx`,void 0),Dn([T()],On.prototype,`connectors`,void 0),Dn([T()],On.prototype,`count`,void 0),Dn([T()],On.prototype,`filteredCount`,void 0),Dn([T()],On.prototype,`isFetchingRecommendedWallets`,void 0),On=Dn([D(`w3m-all-wallets-widget`)],On);var kn=O`
  :host {
    margin-top: ${({spacing:e})=>e[1]};
  }
  wui-separator {
    margin: ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1)
      ${({spacing:e})=>e[2]} calc(${({spacing:e})=>e[3]} * -1);
    width: calc(100% + ${({spacing:e})=>e[3]} * 2);
  }
`,An=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},jn=class extends j{constructor(){super(),this.unsubscribe=[],this.explorerWallets=b.state.explorerWallets,this.connections=_.state.connections,this.connectorImages=u.state.connectorImages,this.loadingTelegram=!1,this.unsubscribe.push(_.subscribeKey(`connections`,e=>this.connections=e),u.subscribeKey(`connectorImages`,e=>this.connectorImages=e),b.subscribeKey(`explorerFilteredWallets`,e=>{this.explorerWallets=e?.length?e:b.state.explorerWallets}),b.subscribeKey(`explorerWallets`,e=>{this.explorerWallets?.length||(this.explorerWallets=e)})),s.isTelegram()&&s.isIos()&&(this.loadingTelegram=!_.state.wcUri,this.unsubscribe.push(_.subscribeKey(`wcUri`,e=>this.loadingTelegram=!e)))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return C`
      <wui-flex flexDirection="column" gap="2"> ${this.connectorListTemplate()} </wui-flex>
    `}connectorListTemplate(){return c.connectorList().map((e,t)=>e.kind===`connector`?this.renderConnector(e,t):this.renderWallet(e,t))}getConnectorNamespaces(e){return e.subtype===`walletConnect`?[]:e.subtype===`multiChain`?e.connector.connectors?.map(e=>e.chain)||[]:[e.connector.chain]}renderConnector(e,t){let n=e.connector,r=f.getConnectorImage(n)||this.connectorImages[n?.imageId??``],i=(this.connections.get(n.chain)??[]).some(e=>N.isLowerCaseMatch(e.connectorId,n.id)),a,o;e.subtype===`walletConnect`?(a=`qr code`,o=`accent`):e.subtype===`injected`||e.subtype===`announced`?(a=i?`connected`:`installed`,o=i?`info`:`success`):(a=void 0,o=void 0);let s=_.hasAnyConnection(v.CONNECTOR_ID.WALLET_CONNECT),c=e.subtype===`walletConnect`||e.subtype===`external`?s:!1;return C`
      <w3m-list-wallet
        displayIndex=${t}
        imageSrc=${E(r)}
        .installed=${!0}
        name=${n.name??`Unknown`}
        .tagVariant=${o}
        tagLabel=${E(a)}
        data-testid=${`wallet-selector-${n.id.toLowerCase()}`}
        size="sm"
        @click=${()=>this.onClickConnector(e)}
        tabIdx=${E(this.tabIdx)}
        ?disabled=${c}
        rdnsId=${E(n.explorerWallet?.rdns||void 0)}
        walletRank=${E(n.explorerWallet?.order)}
        .namespaces=${this.getConnectorNamespaces(e)}
      >
      </w3m-list-wallet>
    `}onClickConnector(e){let t=m.state.data?.redirectView;if(e.subtype===`walletConnect`){g.setActiveConnector(e.connector),s.isMobile()?m.push(`AllWallets`):m.push(`ConnectingWalletConnect`,{redirectView:t});return}if(e.subtype===`multiChain`){g.setActiveConnector(e.connector),m.push(`ConnectingMultiChain`,{redirectView:t});return}if(e.subtype===`injected`){g.setActiveConnector(e.connector),m.push(`ConnectingExternal`,{connector:e.connector,redirectView:t,wallet:e.connector.explorerWallet});return}if(e.subtype===`announced`){if(e.connector.id===`walletConnect`){s.isMobile()?m.push(`AllWallets`):m.push(`ConnectingWalletConnect`,{redirectView:t});return}m.push(`ConnectingExternal`,{connector:e.connector,redirectView:t,wallet:e.connector.explorerWallet});return}m.push(`ConnectingExternal`,{connector:e.connector,redirectView:t})}renderWallet(e,t){let n=e.wallet,r=f.getWalletImage(n),i=_.hasAnyConnection(v.CONNECTOR_ID.WALLET_CONNECT),a=this.loadingTelegram,o=e.subtype===`recent`?`recent`:void 0,s=e.subtype===`recent`?`info`:void 0;return C`
      <w3m-list-wallet
        displayIndex=${t}
        imageSrc=${E(r)}
        name=${n.name??`Unknown`}
        @click=${()=>this.onClickWallet(e)}
        size="sm"
        data-testid=${`wallet-selector-${n.id}`}
        tabIdx=${E(this.tabIdx)}
        ?loading=${a}
        ?disabled=${i}
        rdnsId=${E(n.rdns||void 0)}
        walletRank=${E(n.order)}
        tagLabel=${E(o)}
        .tagVariant=${s}
      >
      </w3m-list-wallet>
    `}onClickWallet(e){let t=m.state.data?.redirectView,n=y.state.activeChain;if(e.subtype===`featured`){g.selectWalletConnector(e.wallet);return}if(e.subtype===`recent`){if(this.loadingTelegram)return;g.selectWalletConnector(e.wallet);return}if(e.subtype===`custom`){if(this.loadingTelegram)return;m.push(`ConnectingWalletConnect`,{wallet:e.wallet,redirectView:t});return}if(this.loadingTelegram)return;let r=n?g.getConnector({id:e.wallet.id,namespace:n}):void 0;r?m.push(`ConnectingExternal`,{connector:r,redirectView:t}):m.push(`ConnectingWalletConnect`,{wallet:e.wallet,redirectView:t})}};jn.styles=kn,An([S({type:Number})],jn.prototype,`tabIdx`,void 0),An([T()],jn.prototype,`explorerWallets`,void 0),An([T()],jn.prototype,`connections`,void 0),An([T()],jn.prototype,`connectorImages`,void 0),An([T()],jn.prototype,`loadingTelegram`,void 0),jn=An([D(`w3m-connector-list`)],jn);var Mn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Nn=class extends j{constructor(){super(...arguments),this.tabIdx=void 0}render(){return C`
      <wui-flex flexDirection="column" gap="2">
        <w3m-connector-list tabIdx=${E(this.tabIdx)}></w3m-connector-list>
        <w3m-all-wallets-widget tabIdx=${E(this.tabIdx)}></w3m-all-wallets-widget>
      </wui-flex>
    `}};Mn([S()],Nn.prototype,`tabIdx`,void 0),Nn=Mn([D(`w3m-wallet-login-list`)],Nn);var Pn=O`
  :host {
    --connect-scroll--top-opacity: 0;
    --connect-scroll--bottom-opacity: 0;
    --connect-mask-image: none;
  }

  .connect {
    max-height: clamp(360px, 470px, 80vh);
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity;
    mask-image: var(--connect-mask-image);
  }

  .guide {
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity;
  }

  .connect::-webkit-scrollbar {
    display: none;
  }

  .all-wallets {
    flex-flow: column;
  }

  .connect.disabled,
  .guide.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }

  wui-separator {
    margin: ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1);
    width: calc(100% + ${({spacing:e})=>e[3]} * 2);
  }
`,Fn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},In=470,Q=class extends j{constructor(){super(),this.unsubscribe=[],this.connectors=g.state.connectors,this.authConnector=this.connectors.find(e=>e.type===`AUTH`),this.features=p.state.features,this.remoteFeatures=p.state.remoteFeatures,this.enableWallets=p.state.enableWallets,this.noAdapters=y.state.noAdapters,this.walletGuide=`get-started`,this.checked=_e.state.isLegalCheckboxChecked,this.isEmailEnabled=this.remoteFeatures?.email&&!y.state.noAdapters,this.isSocialEnabled=this.remoteFeatures?.socials&&this.remoteFeatures.socials.length>0&&!y.state.noAdapters,this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors),this.unsubscribe.push(g.subscribeKey(`connectors`,e=>{this.connectors=e,this.authConnector=this.connectors.find(e=>e.type===`AUTH`),this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors)}),p.subscribeKey(`features`,e=>{this.features=e}),p.subscribeKey(`remoteFeatures`,e=>{this.remoteFeatures=e,this.setEmailAndSocialEnableCheck(this.noAdapters,this.remoteFeatures)}),p.subscribeKey(`enableWallets`,e=>this.enableWallets=e),y.subscribeKey(`noAdapters`,e=>this.setEmailAndSocialEnableCheck(e,this.remoteFeatures)),_e.subscribeKey(`isLegalCheckboxChecked`,e=>this.checked=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.resizeObserver?.disconnect(),(this.shadowRoot?.querySelector(`.connect`))?.removeEventListener(`scroll`,this.handleConnectListScroll.bind(this))}firstUpdated(){let e=this.shadowRoot?.querySelector(`.connect`);e&&(requestAnimationFrame(this.handleConnectListScroll.bind(this)),e?.addEventListener(`scroll`,this.handleConnectListScroll.bind(this)),this.resizeObserver=new ResizeObserver(()=>{this.handleConnectListScroll()}),this.resizeObserver?.observe(e),this.handleConnectListScroll())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=p.state,n=p.state.features?.legalCheckbox,r=!!(e||t)&&!!n&&this.walletGuide===`get-started`&&!this.checked,i={connect:!0,disabled:r},a=p.state.enableWalletGuide,o=this.enableWallets,s=this.isSocialEnabled||this.authConnector,c=r?-1:void 0;return C`
      <wui-flex flexDirection="column">
        ${this.legalCheckboxTemplate()}
        <wui-flex
          data-testid="w3m-connect-scroll-view"
          flexDirection="column"
          .padding=${[`0`,`0`,`4`,`0`]}
          class=${he(i)}
        >
          <wui-flex
            class="connect-methods"
            flexDirection="column"
            gap="2"
            .padding=${s&&o&&a&&this.walletGuide===`get-started`?[`0`,`3`,`0`,`3`]:[`0`,`3`,`3`,`3`]}
          >
            ${this.renderConnectMethod(c)}
          </wui-flex>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}reownBrandingTemplate(){return Se.hasFooter()||!this.remoteFeatures?.reownBranding?null:C`<wui-ux-by-reown></wui-ux-by-reown>`}setEmailAndSocialEnableCheck(e,t){this.isEmailEnabled=t?.email&&!e,this.isSocialEnabled=t?.socials&&t.socials.length>0&&!e,this.remoteFeatures=t,this.noAdapters=e}checkIfAuthEnabled(e){let t=e.filter(e=>e.type===P.CONNECTOR_TYPE_AUTH).map(e=>e.chain);return v.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(e=>t.includes(e))}renderConnectMethod(e){let t=ce.getConnectOrderMethod(this.features,this.connectors);return C`${t.map((t,n)=>{switch(t){case`email`:return C`${this.emailTemplate(e)} ${this.separatorTemplate(n,`email`)}`;case`social`:return C`${this.socialListTemplate(e)}
          ${this.separatorTemplate(n,`social`)}`;case`wallet`:return C`${this.walletListTemplate(e)}
          ${this.separatorTemplate(n,`wallet`)}`;default:return null}})}`}checkMethodEnabled(e){switch(e){case`wallet`:return this.enableWallets;case`social`:return this.isSocialEnabled&&this.isAuthEnabled;case`email`:return this.isEmailEnabled&&this.isAuthEnabled;default:return null}}checkIsThereNextMethod(e){let t=ce.getConnectOrderMethod(this.features,this.connectors)[e+1];if(t)return this.checkMethodEnabled(t)?t:this.checkIsThereNextMethod(e+1)}separatorTemplate(e,t){let n=this.checkIsThereNextMethod(e),r=this.walletGuide===`explore`;switch(t){case`wallet`:return this.enableWallets&&n&&!r?C`<wui-separator data-testid="wui-separator" text="or"></wui-separator>`:null;case`email`:{let e=n===`social`;return this.isAuthEnabled&&this.isEmailEnabled&&!e&&n?C`<wui-separator
              data-testid="w3m-email-login-or-separator"
              text="or"
            ></wui-separator>`:null}case`social`:{let e=n===`email`;return this.isAuthEnabled&&this.isSocialEnabled&&!e&&n?C`<wui-separator data-testid="wui-separator" text="or"></wui-separator>`:null}default:return null}}emailTemplate(e){return!this.isEmailEnabled||!this.isAuthEnabled?null:C`<w3m-email-login-widget tabIdx=${E(e)}></w3m-email-login-widget>`}socialListTemplate(e){return!this.isSocialEnabled||!this.isAuthEnabled?null:C`<w3m-social-login-widget
      walletGuide=${this.walletGuide}
      tabIdx=${E(e)}
    ></w3m-social-login-widget>`}walletListTemplate(e){let t=this.enableWallets,n=this.features?.emailShowWallets===!1,r=this.features?.collapseWallets,i=n||r;return!t||(s.isTelegram()&&(s.isSafari()||s.isIos())&&_.connectWalletConnect().catch(e=>({})),this.walletGuide===`explore`)?null:this.isAuthEnabled&&(this.isEmailEnabled||this.isSocialEnabled)&&i?C`<wui-list-button
        data-testid="w3m-collapse-wallets-button"
        tabIdx=${E(e)}
        @click=${this.onContinueWalletClick.bind(this)}
        text="Continue with a wallet"
        icon="wallet"
      ></wui-list-button>`:C`<w3m-wallet-login-list tabIdx=${E(e)}></w3m-wallet-login-list>`}legalCheckboxTemplate(){return this.walletGuide===`explore`?null:C`<w3m-legal-checkbox data-testid="w3m-legal-checkbox"></w3m-legal-checkbox>`}handleConnectListScroll(){let e=this.shadowRoot?.querySelector(`.connect`);e&&(e.scrollHeight>In?(e.style.setProperty(`--connect-mask-image`,`linear-gradient(
          to bottom,
          rgba(0, 0, 0, calc(1 - var(--connect-scroll--top-opacity))) 0px,
          rgba(200, 200, 200, calc(1 - var(--connect-scroll--top-opacity))) 1px,
          black 100px,
          black calc(100% - 100px),
          rgba(155, 155, 155, calc(1 - var(--connect-scroll--bottom-opacity))) calc(100% - 1px),
          rgba(0, 0, 0, calc(1 - var(--connect-scroll--bottom-opacity))) 100%
        )`),e.style.setProperty(`--connect-scroll--top-opacity`,ve.interpolate([0,50],[0,1],e.scrollTop).toString()),e.style.setProperty(`--connect-scroll--bottom-opacity`,ve.interpolate([0,50],[0,1],e.scrollHeight-e.scrollTop-e.offsetHeight).toString())):(e.style.setProperty(`--connect-mask-image`,`none`),e.style.setProperty(`--connect-scroll--top-opacity`,`0`),e.style.setProperty(`--connect-scroll--bottom-opacity`,`0`)))}onContinueWalletClick(){m.push(`ConnectWallets`)}};Q.styles=Pn,Fn([T()],Q.prototype,`connectors`,void 0),Fn([T()],Q.prototype,`authConnector`,void 0),Fn([T()],Q.prototype,`features`,void 0),Fn([T()],Q.prototype,`remoteFeatures`,void 0),Fn([T()],Q.prototype,`enableWallets`,void 0),Fn([T()],Q.prototype,`noAdapters`,void 0),Fn([S()],Q.prototype,`walletGuide`,void 0),Fn([T()],Q.prototype,`checked`,void 0),Fn([T()],Q.prototype,`isEmailEnabled`,void 0),Fn([T()],Q.prototype,`isSocialEnabled`,void 0),Fn([T()],Q.prototype,`isAuthEnabled`,void 0),Q=Fn([D(`w3m-connect-view`)],Q);var Ln=O`
  wui-flex {
    width: 100%;
    height: 52px;
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    padding-left: ${({spacing:e})=>e[3]};
    padding-right: ${({spacing:e})=>e[3]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[6]};
  }

  wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  wui-icon {
    width: 12px;
    height: 12px;
  }
`,Rn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},zn=class extends j{constructor(){super(...arguments),this.disabled=!1,this.label=``,this.buttonLabel=``}render(){return C`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="inherit">${this.label}</wui-text>
        <wui-button variant="accent-secondary" size="sm">
          ${this.buttonLabel}
          <wui-icon name="chevronRight" color="inherit" size="inherit" slot="iconRight"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};zn.styles=[A,w,Ln],Rn([S({type:Boolean})],zn.prototype,`disabled`,void 0),Rn([S()],zn.prototype,`label`,void 0),Rn([S()],zn.prototype,`buttonLabel`,void 0),zn=Rn([D(`wui-cta-button`)],zn);var Bn=O`
  :host {
    display: block;
    padding: 0 ${({spacing:e})=>e[5]} ${({spacing:e})=>e[5]};
  }
`,Vn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Hn=class extends j{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display=`none`,null;let{name:e,app_store:t,play_store:n,chrome_store:r,homepage:i}=this.wallet,a=s.isMobile(),o=s.isIos(),c=s.isAndroid(),l=[t,n,i,r].filter(Boolean).length>1,u=k.getTruncateString({string:e,charsStart:12,charsEnd:0,truncate:`end`});return l&&!a?C`
        <wui-cta-button
          label=${`Don't have ${u}?`}
          buttonLabel="Get"
          @click=${()=>m.push(`Downloads`,{wallet:this.wallet})}
        ></wui-cta-button>
      `:!l&&i?C`
        <wui-cta-button
          label=${`Don't have ${u}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:t&&o?C`
        <wui-cta-button
          label=${`Don't have ${u}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:n&&c?C`
        <wui-cta-button
          label=${`Don't have ${u}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display=`none`,null)}onAppStore(){this.wallet?.app_store&&s.openHref(this.wallet.app_store,`_blank`)}onPlayStore(){this.wallet?.play_store&&s.openHref(this.wallet.play_store,`_blank`)}onHomePage(){this.wallet?.homepage&&s.openHref(this.wallet.homepage,`_blank`)}};Hn.styles=[Bn],Vn([S({type:Object})],Hn.prototype,`wallet`,void 0),Hn=Vn([D(`w3m-mobile-download-links`)],Hn);var Un=O`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-wallet-image {
    width: 56px;
    height: 56px;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e[1]} * -1);
    bottom: calc(${({spacing:e})=>e[1]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition-property: opacity, transform;
    transition-duration: ${({durations:e})=>e.lg};
    transition-timing-function: ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:e})=>e[4]};
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:e})=>e[`ease-out-power-2`]} both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  w3m-mobile-download-links {
    padding: 0px;
    width: 100%;
  }
`,Wn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},$=class extends j{constructor(){super(),this.wallet=m.state.data?.wallet,this.connector=m.state.data?.connector,this.timeout=void 0,this.secondaryBtnIcon=`refresh`,this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=f.getConnectorImage(this.connector)??f.getWalletImage(this.wallet),this.name=this.wallet?.name??this.connector?.name??`Wallet`,this.isRetrying=!1,this.uri=_.state.wcUri,this.error=_.state.wcError,this.ready=!1,this.showRetry=!1,this.label=void 0,this.secondaryBtnLabel=`Try again`,this.secondaryLabel=`Accept connection request in the wallet`,this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(_.subscribeKey(`wcUri`,e=>{this.uri=e,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,this.onConnect?.())}),_.subscribeKey(`wcError`,e=>this.error=e)),(s.isTelegram()||s.isSafari())&&s.isIos()&&_.state.wcUri&&this.onConnect?.()}firstUpdated(){this.onAutoConnect?.(),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),_.setWcError(!1),clearTimeout(this.timeout)}render(){this.onRender?.(),this.onShowRetry();let e=this.error?`Connection can be declined if a previous request is still active`:this.secondaryLabel,t=``;return this.label?t=this.label:(t=`Continue in ${this.name}`,this.error&&(t=`Connection declined`)),C`
      <wui-flex
        data-error=${E(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${[`10`,`5`,`5`,`5`]}
        gap="6"
      >
        <wui-flex gap="2" justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${E(this.imageSrc)}></wui-wallet-image>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="6"> <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${[`2`,`0`,`0`,`0`]}
        >
          <wui-text align="center" variant="lg-medium" color=${this.error?`error`:`primary`}>
            ${t}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">${e}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel?C`
                <wui-button
                  variant="neutral-secondary"
                  size="md"
                  ?disabled=${this.isRetrying||this.isLoading}
                  @click=${this.onTryAgain.bind(this)}
                  data-testid="w3m-connecting-widget-secondary-button"
                >
                  <wui-icon
                    color="inherit"
                    slot="iconLeft"
                    name=${this.secondaryBtnIcon}
                  ></wui-icon>
                  ${this.secondaryBtnLabel}
                </wui-button>
              `:null}
      </wui-flex>

      ${this.isWalletConnect?C`
              <wui-flex .padding=${[`0`,`5`,`5`,`5`]} justifyContent="center">
                <wui-link
                  @click=${this.onCopyUri}
                  variant="secondary"
                  icon="copy"
                  data-testid="wui-link-copy"
                >
                  Copy link
                </wui-link>
              </wui-flex>
            `:null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links></wui-flex>
      </wui-flex>
    `}onShowRetry(){this.error&&!this.showRetry&&(this.showRetry=!0,(this.shadowRoot?.querySelector(`wui-button`))?.animate([{opacity:0},{opacity:1}],{fill:`forwards`,easing:`ease`}))}onTryAgain(){_.setWcError(!1),this.onRetry?(this.isRetrying=!0,this.onRetry?.()):this.onConnect?.()}loaderTemplate(){let e=re.state.themeVariables[`--w3m-border-radius-master`],t=e?parseInt(e.replace(`px`,``),10):4;return C`<wui-loading-thumbnail radius=${t*9}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(s.copyToClopboard(this.uri),l.showSuccess(`Link copied`))}catch{l.showError(`Failed to copy`)}}};$.styles=Un,Wn([T()],$.prototype,`isRetrying`,void 0),Wn([T()],$.prototype,`uri`,void 0),Wn([T()],$.prototype,`error`,void 0),Wn([T()],$.prototype,`ready`,void 0),Wn([T()],$.prototype,`showRetry`,void 0),Wn([T()],$.prototype,`label`,void 0),Wn([T()],$.prototype,`secondaryBtnLabel`,void 0),Wn([T()],$.prototype,`secondaryLabel`,void 0),Wn([T()],$.prototype,`isLoading`,void 0),Wn([S({type:Boolean})],$.prototype,`isMobile`,void 0),Wn([S()],$.prototype,`onRetry`,void 0);var Gn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Kn=class extends ${constructor(){if(super(),this.externalViewUnsubscribe=[],this.connectionsByNamespace=_.getConnections(this.connector?.chain),this.hasMultipleConnections=this.connectionsByNamespace.length>0,this.remoteFeatures=p.state.remoteFeatures,this.currentActiveConnectorId=g.state.activeConnectorIds[this.connector?.chain],!this.connector)throw Error(`w3m-connecting-view: No connector provided`);let e=this.connector?.chain;this.isAlreadyConnected(this.connector)&&(this.secondaryBtnLabel=void 0,this.label=`This account is already linked, change your account in ${this.connector.name}`,this.secondaryLabel=`To link a new account, open ${this.connector.name} and switch to the account you want to link`),h.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.connector.name??`Unknown`,platform:`browser`,displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:m.state.view}}),this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),this.isWalletConnect=!1,this.externalViewUnsubscribe.push(g.subscribeKey(`activeConnectorIds`,t=>{let n=t[e],r=this.remoteFeatures?.multiWallet,{redirectView:i}=m.state.data??{};n!==this.currentActiveConnectorId&&(this.hasMultipleConnections&&r?(m.replace(`ProfileWallets`),l.showSuccess(`New Wallet Added`)):i?m.replace(i):x.close())}),_.subscribeKey(`connections`,this.onConnectionsChange.bind(this)))}disconnectedCallback(){this.externalViewUnsubscribe.forEach(e=>e())}async onConnectProxy(){try{if(this.error=!1,this.connector){if(this.isAlreadyConnected(this.connector))return;(this.connector.id!==v.CONNECTOR_ID.COINBASE_SDK&&this.connector.id!==v.CONNECTOR_ID.BASE_ACCOUNT||!this.error)&&await _.connectExternal(this.connector,this.connector.chain)}}catch(e){e instanceof ee&&e.originalName===o.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?h.sendEvent({type:`track`,event:`USER_REJECTED`,properties:{message:e.message}}):h.sendEvent({type:`track`,event:`CONNECT_ERROR`,properties:{message:e?.message??`Unknown`}}),this.error=!0}}onConnectionsChange(e){if(this.connector?.chain&&e.get(this.connector.chain)&&this.isAlreadyConnected(this.connector)){let t=e.get(this.connector.chain)??[],n=this.remoteFeatures?.multiWallet;if(t.length===0)m.replace(`Connect`);else{let e=ie.getConnectionsByConnectorId(this.connectionsByNamespace,this.connector.id).flatMap(e=>e.accounts),r=ie.getConnectionsByConnectorId(t,this.connector.id).flatMap(e=>e.accounts);r.length===0?this.hasMultipleConnections&&n?(m.replace(`ProfileWallets`),l.showSuccess(`Wallet deleted`)):x.close():!e.every(e=>r.some(t=>N.isLowerCaseMatch(e.address,t.address)))&&n&&m.replace(`ProfileWallets`)}}}isAlreadyConnected(e){return!!e&&this.connectionsByNamespace.some(t=>N.isLowerCaseMatch(t.connectorId,e.id))}};Kn=Gn([D(`w3m-connecting-external-view`)],Kn);var qn=me`
  wui-flex,
  wui-list-wallet {
    width: 100%;
  }
`,Jn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Yn=class extends j{constructor(){super(),this.unsubscribe=[],this.activeConnector=g.state.activeConnector,this.unsubscribe.push(g.subscribeKey(`activeConnector`,e=>this.activeConnector=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return C`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${[`3`,`5`,`5`,`5`]}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image
            size="lg"
            imageSrc=${E(f.getConnectorImage(this.activeConnector))}
          ></wui-wallet-image>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${[`0`,`3`,`0`,`3`]}
        >
          <wui-text variant="lg-medium" color="primary">
            Select Chain for ${this.activeConnector?.name}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary"
            >Select which chain to connect to your multi chain wallet</wui-text
          >
        </wui-flex>
        <wui-flex
          flexGrow="1"
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${[`2`,`0`,`2`,`0`]}
        >
          ${this.networksTemplate()}
        </wui-flex>
      </wui-flex>
    `}networksTemplate(){return this.activeConnector?.connectors?.map((e,t)=>e.name?C`
            <w3m-list-wallet
              displayIndex=${t}
              imageSrc=${E(f.getChainImage(e.chain))}
              name=${v.CHAIN_NAME_MAP[e.chain]}
              @click=${()=>this.onConnector(e)}
              size="sm"
              data-testid="wui-list-chain-${e.chain}"
              rdnsId=${e.explorerWallet?.rdns}
            ></w3m-list-wallet>
          `:null)}onConnector(e){let t=this.activeConnector?.connectors?.find(t=>t.chain===e.chain),n=m.state.data?.redirectView;if(!t){l.showError(`Failed to find connector`);return}t.id===`walletConnect`?s.isMobile()?m.push(`AllWallets`):m.push(`ConnectingWalletConnect`,{redirectView:n}):m.push(`ConnectingExternal`,{connector:t,redirectView:n,wallet:this.activeConnector?.explorerWallet})}};Yn.styles=qn,Jn([T()],Yn.prototype,`activeConnector`,void 0),Yn=Jn([D(`w3m-connecting-multi-chain-view`)],Yn);var Xn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Zn=class extends j{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.generateTabs();return C`
      <wui-flex justifyContent="center" .padding=${[`0`,`0`,`4`,`0`]}>
        <wui-tabs .tabs=${e} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){let e=this.platforms.map(e=>e===`browser`?{label:`Browser`,icon:`extension`,platform:`browser`}:e===`mobile`?{label:`Mobile`,icon:`mobile`,platform:`mobile`}:e===`qrcode`?{label:`Mobile`,icon:`mobile`,platform:`qrcode`}:e===`web`?{label:`Webapp`,icon:`browser`,platform:`web`}:e===`desktop`?{label:`Desktop`,icon:`desktop`,platform:`desktop`}:{label:`Browser`,icon:`extension`,platform:`unsupported`});return this.platformTabs=e.map(({platform:e})=>e),e}onTabChange(e){let t=this.platformTabs[e];t&&this.onSelectPlatfrom?.(t)}};Xn([S({type:Array})],Zn.prototype,`platforms`,void 0),Xn([S()],Zn.prototype,`onSelectPlatfrom`,void 0),Zn=Xn([D(`w3m-connecting-header`)],Zn);var Qn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},$n=class extends ${constructor(){if(super(),!this.wallet)throw Error(`w3m-connecting-wc-browser: No wallet provided`);this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),h.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet.name,platform:`browser`,displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:m.state.view}})}async onConnectProxy(){try{this.error=!1;let{connectors:e}=g.state,t=e.find(e=>e.type===`ANNOUNCED`&&e.info?.rdns===this.wallet?.rdns||e.type===`INJECTED`||e.name===this.wallet?.name);if(t)await _.connectExternal(t,t.chain);else throw Error(`w3m-connecting-wc-browser: No connector found`);x.close()}catch(e){e instanceof ee&&e.originalName===o.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?h.sendEvent({type:`track`,event:`USER_REJECTED`,properties:{message:e.message}}):h.sendEvent({type:`track`,event:`CONNECT_ERROR`,properties:{message:e?.message??`Unknown`}}),this.error=!0}}};$n=Qn([D(`w3m-connecting-wc-browser`)],$n);var er=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},tr=class extends ${constructor(){if(super(),!this.wallet)throw Error(`w3m-connecting-wc-desktop: No wallet provided`);this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),h.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet.name,platform:`desktop`,displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:m.state.view}})}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onConnectProxy(){if(this.wallet?.desktop_link&&this.uri)try{this.error=!1;let{desktop_link:e,name:t}=this.wallet,{redirect:n,href:r}=s.formatNativeUrl(e,this.uri);_.setWcLinking({name:t,href:r}),_.setRecentWallet(this.wallet),s.openHref(n,`_blank`)}catch{this.error=!0}}};tr=er([D(`w3m-connecting-wc-desktop`)],tr);var nr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},rr=class extends ${constructor(){if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=p.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{ie.onConnectMobile(this.wallet)},!this.wallet)throw Error(`w3m-connecting-wc-mobile: No wallet provided`);this.secondaryBtnLabel=`Open`,this.secondaryLabel=d.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon=`externalLink`,this.onHandleURI(),this.unsubscribe.push(_.subscribeKey(`wcUri`,()=>{this.onHandleURI()})),h.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet.name,platform:`mobile`,displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:m.state.view}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onTryAgain(){_.setWcError(!1),this.onConnect?.()}};nr([T()],rr.prototype,`redirectDeeplink`,void 0),nr([T()],rr.prototype,`redirectUniversalLink`,void 0),nr([T()],rr.prototype,`target`,void 0),nr([T()],rr.prototype,`preferUniversalLinks`,void 0),nr([T()],rr.prototype,`isLoading`,void 0),rr=nr([D(`w3m-connecting-wc-mobile`)],rr);var ir=O`
  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e[`ease-out-power-2`]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`,ar=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},or=class extends ${constructor(){super(),this.basic=!1}firstUpdated(){this.basic||h.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet?.name??`WalletConnect`,platform:`qrcode`,displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:m.state.view}})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.forEach(e=>e())}render(){return this.onRenderProxy(),C`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${[`0`,`5`,`5`,`5`]}
        gap="5"
      >
        <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>
        <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0)}qrCodeTemplate(){if(!this.uri||!this.ready)return null;let e=this.wallet?this.wallet.name:void 0;_.setWcLinking(void 0),_.setRecentWallet(this.wallet);let t=re.state.themeVariables[`--apkt-qr-color`]??re.state.themeVariables[`--w3m-qr-color`];return C` <wui-qr-code
      theme=${re.state.themeMode}
      uri=${this.uri}
      imageSrc=${E(f.getWalletImage(this.wallet))}
      color=${E(t)}
      alt=${E(e)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`}copyTemplate(){let e=!this.uri||!this.ready;return C`<wui-button
      .disabled=${e}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      Copy link
      <wui-icon size="sm" color="inherit" name="copy" slot="iconRight"></wui-icon>
    </wui-button>`}};or.styles=ir,ar([S({type:Boolean})],or.prototype,`basic`,void 0),or=ar([D(`w3m-connecting-wc-qrcode`)],or);var sr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},cr=class extends j{constructor(){if(super(),this.wallet=m.state.data?.wallet,!this.wallet)throw Error(`w3m-connecting-wc-unsupported: No wallet provided`);h.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet.name,platform:`browser`,displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:m.state.view}})}render(){return C`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${[`10`,`5`,`5`,`5`]}
        gap="5"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${E(f.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="md-regular" color="primary">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};cr=sr([D(`w3m-connecting-wc-unsupported`)],cr);var lr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ur=class extends ${constructor(){if(super(),this.isLoading=!0,!this.wallet)throw Error(`w3m-connecting-wc-web: No wallet provided`);this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel=`Open`,this.secondaryLabel=d.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon=`externalLink`,this.updateLoadingState(),this.unsubscribe.push(_.subscribeKey(`wcUri`,()=>{this.updateLoadingState()})),h.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet.name,platform:`web`,displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:m.state.view}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){if(this.wallet?.webapp_link&&this.uri)try{this.error=!1;let{webapp_link:e,name:t}=this.wallet,{redirect:n,href:r}=s.formatUniversalUrl(e,this.uri);_.setWcLinking({name:t,href:r}),_.setRecentWallet(this.wallet),s.openHref(n,`_blank`)}catch{this.error=!0}}};lr([T()],ur.prototype,`isLoading`,void 0),ur=lr([D(`w3m-connecting-wc-web`)],ur);var dr=O`
  :host([data-mobile-fullscreen='true']) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :host([data-mobile-fullscreen='true']) wui-ux-by-reown {
    margin-top: auto;
  }
`,fr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},pr=class extends j{constructor(){super(),this.wallet=m.state.data?.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=!!p.state.siwx,this.remoteFeatures=p.state.remoteFeatures,this.displayBranding=!0,this.basic=!1,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(p.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return p.state.enableMobileFullScreen&&this.setAttribute(`data-mobile-fullscreen`,`true`),C`
      ${this.headerTemplate()}
      <div class="platform-container">${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){return!this.remoteFeatures?.reownBranding||!this.displayBranding?null:C`<wui-ux-by-reown></wui-ux-by-reown>`}async initializeConnection(e=!1){if(!(this.platform===`browser`||p.state.manualWCControl&&!e))try{let{wcPairingExpiry:t,status:n}=_.state,{redirectView:r}=m.state.data??{};if(e||p.state.enableEmbedded||s.isPairingExpired(t)||n===`connecting`){let e=_.getConnections(y.state.activeChain),t=this.remoteFeatures?.multiWallet,n=e.length>0;await _.connectWalletConnect({cache:`never`}),this.isSiwxEnabled||(n&&t?(m.replace(`ProfileWallets`),l.showSuccess(`New Wallet Added`)):r?m.replace(r):x.close())}}catch(e){if(e instanceof Error&&e.message.includes(`An error occurred when attempting to switch chain`)&&!p.state.enableNetworkSwitch&&y.state.activeChain){y.setActiveCaipNetwork(De.getUnsupportedNetwork(`${y.state.activeChain}:${y.state.activeCaipNetwork?.id}`)),y.showUnsupportedChainUI();return}e instanceof ee&&e.originalName===o.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?h.sendEvent({type:`track`,event:`USER_REJECTED`,properties:{message:e.message}}):h.sendEvent({type:`track`,event:`CONNECT_ERROR`,properties:{message:e?.message??`Unknown`}}),_.setWcError(!0),l.showError(e.message??`Connection error`),_.resetWcConnection(),m.goBack()}}determinePlatforms(){if(!this.wallet){this.platforms.push(`qrcode`),this.platform=`qrcode`;return}if(this.platform)return;let{mobile_link:e,desktop_link:t,webapp_link:n,injected:r,rdns:i}=this.wallet,a=r?.map(({injected_id:e})=>e).filter(Boolean),o=[...i?[i]:a??[]],c=!p.state.isUniversalProvider&&o.length,l=e,u=n,d=_.checkInstalled(o),ee=c&&d,te=t&&!s.isMobile();ee&&!y.state.noAdapters&&this.platforms.push(`browser`),l&&this.platforms.push(s.isMobile()?`mobile`:`qrcode`),u&&this.platforms.push(`web`),te&&this.platforms.push(`desktop`);let f=oe.isCustomDeeplinkWallet(this.wallet.id,y.state.activeChain);!ee&&c&&!y.state.noAdapters&&!f&&this.platforms.push(`unsupported`),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case`browser`:return C`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case`web`:return C`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case`desktop`:return C`
          <w3m-connecting-wc-desktop .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-desktop>
        `;case`mobile`:return C`
          <w3m-connecting-wc-mobile isMobile .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-mobile>
        `;case`qrcode`:return C`<w3m-connecting-wc-qrcode ?basic=${this.basic}></w3m-connecting-wc-qrcode>`;default:return C`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`}}headerTemplate(){return this.platforms.length>1?C`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `:null}async onSelectPlatform(e){let t=this.shadowRoot?.querySelector(`div`);t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:`forwards`,easing:`ease`}).finished,this.platform=e,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:`forwards`,easing:`ease`}))}};pr.styles=dr,fr([T()],pr.prototype,`platform`,void 0),fr([T()],pr.prototype,`platforms`,void 0),fr([T()],pr.prototype,`isSiwxEnabled`,void 0),fr([T()],pr.prototype,`remoteFeatures`,void 0),fr([S({type:Boolean})],pr.prototype,`displayBranding`,void 0),fr([S({type:Boolean})],pr.prototype,`basic`,void 0),pr=fr([D(`w3m-connecting-wc-view`)],pr);var mr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},hr=class extends j{constructor(){super(),this.unsubscribe=[],this.isMobile=s.isMobile(),this.remoteFeatures=p.state.remoteFeatures,this.unsubscribe.push(p.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(this.isMobile){let{featured:e,recommended:t}=b.state,{customWallets:n}=p.state,r=ne.getRecentWallets(),i=e.length||t.length||n?.length||r.length;return C`<wui-flex flexDirection="column" gap="2" .margin=${[`1`,`3`,`3`,`3`]}>
        ${i?C`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return C`<wui-flex flexDirection="column" .padding=${[`0`,`0`,`4`,`0`]}>
        <w3m-connecting-wc-view ?basic=${!0} .displayBranding=${!1}></w3m-connecting-wc-view>
        <wui-flex flexDirection="column" .padding=${[`0`,`3`,`0`,`3`]}>
          <w3m-all-wallets-widget></w3m-all-wallets-widget>
        </wui-flex>
      </wui-flex>
      ${this.reownBrandingTemplate()} `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding?C` <wui-flex flexDirection="column" .padding=${[`1`,`0`,`1`,`0`]}>
      <wui-ux-by-reown></wui-ux-by-reown>
    </wui-flex>`:null}};mr([T()],hr.prototype,`isMobile`,void 0),mr([T()],hr.prototype,`remoteFeatures`,void 0),hr=mr([D(`w3m-connecting-wc-basic-view`)],hr);var gr=me`
  .continue-button-container {
    width: 100%;
  }
`,_r=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},vr=class extends j{constructor(){super(...arguments),this.loading=!1}render(){return C`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="6"
        .padding=${[`0`,`0`,`4`,`0`]}
      >
        ${this.onboardingTemplate()} ${this.buttonsTemplate()}
        <wui-link
          @click=${()=>{s.openHref(ue.URLS.FAQ,`_blank`)}}
        >
          Learn more about names
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-link>
      </wui-flex>
    `}onboardingTemplate(){return C` <wui-flex
      flexDirection="column"
      gap="6"
      alignItems="center"
      .padding=${[`0`,`6`,`0`,`6`]}
    >
      <wui-flex gap="3" alignItems="center" justifyContent="center">
        <wui-icon-box icon="id" size="xl" iconSize="xxl" color="default"></wui-icon-box>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="3">
        <wui-text align="center" variant="lg-medium" color="primary">
          Choose your account name
        </wui-text>
        <wui-text align="center" variant="md-regular" color="primary">
          Finally say goodbye to 0x addresses, name your account to make it easier to exchange
          assets
        </wui-text>
      </wui-flex>
    </wui-flex>`}buttonsTemplate(){return C`<wui-flex
      .padding=${[`0`,`8`,`0`,`8`]}
      gap="3"
      class="continue-button-container"
    >
      <wui-button
        fullWidth
        .loading=${this.loading}
        size="lg"
        borderRadius="xs"
        @click=${this.handleContinue.bind(this)}
        >Choose name
      </wui-button>
    </wui-flex>`}handleContinue(){m.push(`RegisterAccountName`),h.sendEvent({type:`track`,event:`OPEN_ENS_FLOW`,properties:{isSmartAccount:ae(y.state.activeChain)===te.ACCOUNT_TYPES.SMART_ACCOUNT}})}};vr.styles=gr,_r([T()],vr.prototype,`loading`,void 0),vr=_r([D(`w3m-choose-account-name-view`)],vr);var yr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},br=class extends j{constructor(){super(...arguments),this.wallet=m.state.data?.wallet}render(){if(!this.wallet)throw Error(`w3m-downloads-view`);return C`
      <wui-flex gap="2" flexDirection="column" .padding=${[`3`,`3`,`4`,`3`]}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `}chromeTemplate(){return this.wallet?.chrome_store?C`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Chrome Extension</wui-text>
    </wui-list-item>`:null}iosTemplate(){return this.wallet?.app_store?C`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">iOS App</wui-text>
    </wui-list-item>`:null}androidTemplate(){return this.wallet?.play_store?C`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Android App</wui-text>
    </wui-list-item>`:null}homepageTemplate(){return this.wallet?.homepage?C`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="md-medium" color="primary">Website</wui-text>
      </wui-list-item>
    `:null}openStore(e){e.href&&this.wallet&&(h.sendEvent({type:`track`,event:`GET_WALLET`,properties:{name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.wallet.id,type:e.type}}),s.openHref(e.href,`_blank`))}onChromeStore(){this.wallet?.chrome_store&&this.openStore({href:this.wallet.chrome_store,type:`chrome_store`})}onAppStore(){this.wallet?.app_store&&this.openStore({href:this.wallet.app_store,type:`app_store`})}onPlayStore(){this.wallet?.play_store&&this.openStore({href:this.wallet.play_store,type:`play_store`})}onHomePage(){this.wallet?.homepage&&this.openStore({href:this.wallet.homepage,type:`homepage`})}};br=yr([D(`w3m-downloads-view`)],br);var xr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Sr=`https://walletguide.walletconnect.network`,Cr=class extends j{render(){return C`
      <wui-flex flexDirection="column" .padding=${[`0`,`3`,`3`,`3`]} gap="2">
        ${this.recommendedWalletsTemplate()}
        <w3m-list-wallet
          name="Explore all"
          showAllWallets
          walletIcon="allWallets"
          icon="externalLink"
          size="sm"
          @click=${()=>{s.openHref(`https://walletguide.walletconnect.network/`,`_blank`)}}
        ></w3m-list-wallet>
      </wui-flex>
    `}recommendedWalletsTemplate(){let{recommended:e,featured:t}=b.state,{customWallets:n}=p.state;return[...t,...n??[],...e].slice(0,4).map((e,t)=>C`
        <w3m-list-wallet
          displayIndex=${t}
          name=${e.name??`Unknown`}
          tagVariant="accent"
          size="sm"
          imageSrc=${E(f.getWalletImage(e))}
          @click=${()=>{this.onWalletClick(e)}}
        ></w3m-list-wallet>
      `)}onWalletClick(e){h.sendEvent({type:`track`,event:`GET_WALLET`,properties:{name:e.name,walletRank:void 0,explorerId:e.id,type:`homepage`}}),s.openHref(e.homepage??Sr,`_blank`)}};Cr=xr([D(`w3m-get-wallet-view`)],Cr);var wr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Tr=class extends j{constructor(){super(...arguments),this.data=[]}render(){return C`
      <wui-flex flexDirection="column" alignItems="center" gap="4">
        ${this.data.map(e=>C`
            <wui-flex flexDirection="column" alignItems="center" gap="5">
              <wui-flex flexDirection="row" justifyContent="center" gap="1">
                ${e.images.map(e=>C`<wui-visual size="sm" name=${e}></wui-visual>`)}
              </wui-flex>
            </wui-flex>
            <wui-flex flexDirection="column" alignItems="center" gap="1">
              <wui-text variant="md-regular" color="primary" align="center">${e.title}</wui-text>
              <wui-text variant="sm-regular" color="secondary" align="center"
                >${e.text}</wui-text
              >
            </wui-flex>
          `)}
      </wui-flex>
    `}};wr([S({type:Array})],Tr.prototype,`data`,void 0),Tr=wr([D(`w3m-help-widget`)],Tr);var Er=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Dr=[{images:[`login`,`profile`,`lock`],title:`One login for all of web3`,text:`Log in to any app by connecting your wallet. Say goodbye to countless passwords!`},{images:[`defi`,`nft`,`eth`],title:`A home for your digital assets`,text:`A wallet lets you store, send and receive digital assets like cryptocurrencies and NFTs.`},{images:[`browser`,`noun`,`dao`],title:`Your gateway to a new web`,text:`With your wallet, you can explore and interact with DeFi, NFTs, DAOs, and much more.`}],Or=class extends j{render(){return C`
      <wui-flex
        flexDirection="column"
        .padding=${[`6`,`5`,`5`,`5`]}
        alignItems="center"
        gap="5"
      >
        <w3m-help-widget .data=${Dr}></w3m-help-widget>
        <wui-button variant="accent-primary" size="md" @click=${this.onGetWallet.bind(this)}>
          <wui-icon color="inherit" slot="iconLeft" name="wallet"></wui-icon>
          Get a wallet
        </wui-button>
      </wui-flex>
    `}onGetWallet(){h.sendEvent({type:`track`,event:`CLICK_GET_WALLET_HELP`}),m.push(`GetWallet`)}};Or=Er([D(`w3m-what-is-a-wallet-view`)],Or);var kr=O`
  wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity;
  }
  wui-flex::-webkit-scrollbar {
    display: none;
  }
  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`,Ar=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},jr=class extends j{constructor(){super(),this.unsubscribe=[],this.checked=_e.state.isLegalCheckboxChecked,this.unsubscribe.push(_e.subscribeKey(`isLegalCheckboxChecked`,e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=p.state,n=p.state.features?.legalCheckbox,r=!!(e||t)&&!!n,i=r&&!this.checked,a=i?-1:void 0;return C`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${r?[`0`,`3`,`3`,`3`]:`3`}
        gap="2"
        class=${E(i?`disabled`:void 0)}
      >
        <w3m-wallet-login-list tabIdx=${E(a)}></w3m-wallet-login-list>
      </wui-flex>
    `}};jr.styles=kr,Ar([T()],jr.prototype,`checked`,void 0),jr=Ar([D(`w3m-connect-wallets-view`)],jr);var Mr=O`
  :host {
    display: block;
    width: 120px;
    height: 120px;
  }

  svg {
    width: 120px;
    height: 120px;
    fill: none;
    stroke: transparent;
    stroke-linecap: round;
  }

  use {
    stroke: ${e=>e.colors.accent100};
    stroke-width: 2px;
    stroke-dasharray: 54, 118;
    stroke-dashoffset: 172;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`,Nr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Pr=class extends j{render(){return C`
      <svg viewBox="0 0 54 59">
        <path
          id="wui-loader-path"
          d="M17.22 5.295c3.877-2.277 5.737-3.363 7.72-3.726a11.44 11.44 0 0 1 4.12 0c1.983.363 3.844 1.45 7.72 3.726l6.065 3.562c3.876 2.276 5.731 3.372 7.032 4.938a11.896 11.896 0 0 1 2.06 3.63c.683 1.928.688 4.11.688 8.663v7.124c0 4.553-.005 6.735-.688 8.664a11.896 11.896 0 0 1-2.06 3.63c-1.3 1.565-3.156 2.66-7.032 4.937l-6.065 3.563c-3.877 2.276-5.737 3.362-7.72 3.725a11.46 11.46 0 0 1-4.12 0c-1.983-.363-3.844-1.449-7.72-3.726l-6.065-3.562c-3.876-2.276-5.731-3.372-7.032-4.938a11.885 11.885 0 0 1-2.06-3.63c-.682-1.928-.688-4.11-.688-8.663v-7.124c0-4.553.006-6.735.688-8.664a11.885 11.885 0 0 1 2.06-3.63c1.3-1.565 3.156-2.66 7.032-4.937l6.065-3.562Z"
        />
        <use xlink:href="#wui-loader-path"></use>
      </svg>
    `}};Pr.styles=[A,Mr],Pr=Nr([D(`wui-loading-hexagon`)],Pr);var Fr=me`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: 4px;
    bottom: 0;
    opacity: 0;
    transform: scale(0.5);
    z-index: 1;
  }

  wui-button {
    display: none;
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  wui-button[data-retry='true'] {
    display: block;
    opacity: 1;
  }
`,Ir=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Lr=class extends j{constructor(){super(),this.network=m.state.data?.network,this.unsubscribe=[],this.showRetry=!1,this.error=!1}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}firstUpdated(){this.onSwitchNetwork()}render(){if(!this.network)throw Error(`w3m-network-switch-view: No network provided`);this.onShowRetry();let e=this.getLabel(),t=this.getSubLabel();return C`
      <wui-flex
        data-error=${this.error}
        flexDirection="column"
        alignItems="center"
        .padding=${[`10`,`5`,`10`,`5`]}
        gap="7"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-network-image
            size="lg"
            imageSrc=${E(f.getNetworkImage(this.network))}
          ></wui-network-image>

          ${this.error?null:C`<wui-loading-hexagon></wui-loading-hexagon>`}

          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="h6-regular" color="primary">${e}</wui-text>
          <wui-text align="center" variant="md-regular" color="secondary">${t}</wui-text>
        </wui-flex>

        <wui-button
          data-retry=${this.showRetry}
          variant="accent-primary"
          size="md"
          .disabled=${!this.error}
          @click=${this.onSwitchNetwork.bind(this)}
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try again
        </wui-button>
      </wui-flex>
    `}getSubLabel(){let e=g.getConnectorId(y.state.activeChain);return g.getAuthConnector()&&e===v.CONNECTOR_ID.AUTH?``:this.error?`Switch can be declined if chain is not supported by a wallet or previous request is still active`:`Accept connection request in your wallet`}getLabel(){let e=g.getConnectorId(y.state.activeChain);return g.getAuthConnector()&&e===v.CONNECTOR_ID.AUTH?`Switching to ${this.network?.name??`Unknown`} network...`:this.error?`Switch declined`:`Approve in wallet`}onShowRetry(){this.error&&!this.showRetry&&(this.showRetry=!0,(this.shadowRoot?.querySelector(`wui-button`))?.animate([{opacity:0},{opacity:1}],{fill:`forwards`,easing:`ease`}))}async onSwitchNetwork(){try{this.error=!1,y.state.activeChain!==this.network?.chainNamespace&&y.setIsSwitchingNamespace(!0),this.network&&(await y.switchActiveNetwork(this.network),await i.isAuthenticated()&&m.goBack())}catch{this.error=!0}}};Lr.styles=Fr,Ir([T()],Lr.prototype,`showRetry`,void 0),Ir([T()],Lr.prototype,`error`,void 0),Lr=Ir([D(`w3m-network-switch-view`)],Lr);var Rr=O`
  :host {
    width: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({spacing:e})=>e[3]};
    width: 100%;
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    text-transform: capitalize;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,zr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Br=class extends j{constructor(){super(...arguments),this.imageSrc=void 0,this.name=`Ethereum`,this.disabled=!1}render(){return C`
      <button ?disabled=${this.disabled} tabindex=${E(this.tabIdx)}>
        <wui-flex gap="2" alignItems="center">
          ${this.imageTemplate()}
          <wui-text variant="lg-regular" color="primary">${this.name}</wui-text>
        </wui-flex>
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `}imageTemplate(){return this.imageSrc?C`<wui-image ?boxed=${!0} src=${this.imageSrc}></wui-image>`:C`<wui-image
      ?boxed=${!0}
      icon="networkPlaceholder"
      size="lg"
      iconColor="default"
    ></wui-image>`}};Br.styles=[A,w,Rr],zr([S()],Br.prototype,`imageSrc`,void 0),zr([S()],Br.prototype,`name`,void 0),zr([S()],Br.prototype,`tabIdx`,void 0),zr([S({type:Boolean})],Br.prototype,`disabled`,void 0),Br=zr([D(`wui-list-network`)],Br);var Vr=me`
  .container {
    max-height: 360px;
    overflow: auto;
  }

  .container::-webkit-scrollbar {
    display: none;
  }
`,Hr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Ur=class extends j{constructor(){super(),this.unsubscribe=[],this.network=y.state.activeCaipNetwork,this.requestedCaipNetworks=y.getCaipNetworks(),this.search=``,this.onDebouncedSearch=s.debounce(e=>{this.search=e},100),this.unsubscribe.push(u.subscribeNetworkImages(()=>this.requestUpdate()),y.subscribeKey(`activeCaipNetwork`,e=>this.network=e),y.subscribe(()=>{this.requestedCaipNetworks=y.getAllRequestedCaipNetworks()}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return C`
      ${this.templateSearchInput()}
      <wui-flex
        class="container"
        .padding=${[`0`,`3`,`3`,`3`]}
        flexDirection="column"
        gap="2"
      >
        ${this.networksTemplate()}
      </wui-flex>
    `}templateSearchInput(){return C`
      <wui-flex gap="2" .padding=${[`0`,`3`,`3`,`3`]}>
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="md"
          placeholder="Search network"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}networksTemplate(){let e=y.getAllApprovedCaipNetworkIds(),t=s.sortRequestedNetworks(e,this.requestedCaipNetworks);return this.filteredNetworks=this.search?t?.filter(e=>e?.name?.toLowerCase().includes(this.search.toLowerCase())):t,this.filteredNetworks?.map(e=>C`
        <wui-list-network
          .selected=${this.network?.id===e.id}
          imageSrc=${E(f.getNetworkImage(e))}
          type="network"
          name=${e.name??e.id}
          @click=${()=>this.onSwitchNetwork(e)}
          .disabled=${y.isCaipNetworkDisabled(e)}
          data-testid=${`w3m-network-switch-${e.name??e.id}`}
        ></wui-list-network>
      `)}onSwitchNetwork(e){le.onSwitchNetwork({network:e})}};Ur.styles=Vr,Hr([T()],Ur.prototype,`network`,void 0),Hr([T()],Ur.prototype,`requestedCaipNetworks`,void 0),Hr([T()],Ur.prototype,`filteredNetworks`,void 0),Hr([T()],Ur.prototype,`search`,void 0),Ur=Hr([D(`w3m-networks-view`)],Ur);var Wr=O`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-visual {
    border-radius: calc(
      ${({borderRadius:e})=>e[1]} * 9 - ${({borderRadius:e})=>e[3]}
    );
    position: relative;
    overflow: hidden;
  }

  wui-visual::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: calc(
      ${({borderRadius:e})=>e[1]} * 9 - ${({borderRadius:e})=>e[3]}
    );
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e[1]} * -1);
    bottom: calc(${({spacing:e})=>e[1]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:e})=>e[4]};
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:e})=>e[`ease-out-power-2`]} both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  wui-link {
    padding: ${({spacing:e})=>e[`01`]} ${({spacing:e})=>e[2]};
  }

  .capitalize {
    text-transform: capitalize;
  }
`,Gr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Kr={eip155:`eth`,solana:`solana`,bip122:`bitcoin`,polkadot:void 0},qr=class extends j{constructor(){super(...arguments),this.unsubscribe=[],this.switchToChain=m.state.data?.switchToChain,this.caipNetwork=m.state.data?.network,this.activeChain=y.state.activeChain}firstUpdated(){this.unsubscribe.push(y.subscribeKey(`activeChain`,e=>this.activeChain=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.switchToChain?v.CHAIN_NAME_MAP[this.switchToChain]:`supported`;if(!this.switchToChain)return null;let t=v.CHAIN_NAME_MAP[this.switchToChain];return C`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${[`4`,`2`,`2`,`2`]}
        gap="4"
      >
        <wui-flex justifyContent="center" flexDirection="column" alignItems="center" gap="2">
          <wui-visual
            size="md"
            name=${E(Kr[this.switchToChain])}
          ></wui-visual>
          <wui-flex gap="2" flexDirection="column" alignItems="center">
            <wui-text
              data-testid=${`w3m-switch-active-chain-to-${t}`}
              variant="lg-regular"
              color="primary"
              align="center"
              >Switch to <span class="capitalize">${t}</span></wui-text
            >
            <wui-text variant="md-regular" color="secondary" align="center">
              Connected wallet doesn't support connecting to ${e} chain. You
              need to connect with a different wallet.
            </wui-text>
          </wui-flex>
          <wui-button
            data-testid="w3m-switch-active-chain-button"
            size="md"
            @click=${this.switchActiveChain.bind(this)}
            >Switch</wui-button
          >
        </wui-flex>
      </wui-flex>
    `}async switchActiveChain(){this.switchToChain&&(y.setIsSwitchingNamespace(!0),g.setFilterByNamespace(this.switchToChain),this.caipNetwork?await y.switchActiveNetwork(this.caipNetwork):y.setActiveNamespace(this.switchToChain),m.reset(`Connect`))}};qr.styles=Wr,Gr([S()],qr.prototype,`activeChain`,void 0),qr=Gr([D(`w3m-switch-active-chain-view`)],qr);var Jr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Yr=[{images:[`network`,`layers`,`system`],title:`The system’s nuts and bolts`,text:`A network is what brings the blockchain to life, as this technical infrastructure allows apps to access the ledger and smart contract services.`},{images:[`noun`,`defiAlt`,`dao`],title:`Designed for different uses`,text:`Each network is designed differently, and may therefore suit certain apps and experiences.`}],Xr=class extends j{render(){return C`
      <wui-flex
        flexDirection="column"
        .padding=${[`6`,`5`,`5`,`5`]}
        alignItems="center"
        gap="5"
      >
        <w3m-help-widget .data=${Yr}></w3m-help-widget>
        <wui-button
          variant="accent-primary"
          size="md"
          @click=${()=>{s.openHref(`https://ethereum.org/en/developers/docs/networks/`,`_blank`)}}
        >
          Learn more
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};Xr=Jr([D(`w3m-what-is-a-network-view`)],Xr);var Zr=me`
  :host > wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
  }

  :host > wui-flex::-webkit-scrollbar {
    display: none;
  }
`,Qr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},$r=class extends j{constructor(){super(),this.swapUnsupportedChain=m.state.data?.swapUnsupportedChain,this.unsubscribe=[],this.disconnecting=!1,this.remoteFeatures=p.state.remoteFeatures,this.unsubscribe.push(u.subscribeNetworkImages(()=>this.requestUpdate()),p.subscribeKey(`remoteFeatures`,e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return C`
      <wui-flex class="container" flexDirection="column" gap="0">
        <wui-flex
          class="container"
          flexDirection="column"
          .padding=${[`3`,`5`,`2`,`5`]}
          alignItems="center"
          gap="5"
        >
          ${this.descriptionTemplate()}
        </wui-flex>

        <wui-flex flexDirection="column" padding="3" gap="2"> ${this.networksTemplate()} </wui-flex>

        <wui-separator text="or"></wui-separator>
        <wui-flex flexDirection="column" padding="3" gap="2">
          <wui-list-item
            variant="icon"
            iconVariant="overlay"
            icon="signOut"
            ?chevron=${!1}
            .loading=${this.disconnecting}
            @click=${this.onDisconnect.bind(this)}
            data-testid="disconnect-button"
          >
            <wui-text variant="md-medium" color="secondary">Disconnect</wui-text>
          </wui-list-item>
        </wui-flex>
      </wui-flex>
    `}descriptionTemplate(){return this.swapUnsupportedChain?C`
        <wui-text variant="sm-regular" color="secondary" align="center">
          The swap feature doesn’t support your current network. Switch to an available option to
          continue.
        </wui-text>
      `:C`
      <wui-text variant="sm-regular" color="secondary" align="center">
        This app doesn’t support your current network. Switch to an available option to continue.
      </wui-text>
    `}networksTemplate(){let e=y.getAllRequestedCaipNetworks(),t=y.getAllApprovedCaipNetworkIds(),n=s.sortRequestedNetworks(t,e);return(this.swapUnsupportedChain?n.filter(e=>d.SWAP_SUPPORTED_NETWORKS.includes(e.caipNetworkId)):n).map(e=>C`
        <wui-list-network
          imageSrc=${E(f.getNetworkImage(e))}
          name=${e.name??`Unknown`}
          @click=${()=>this.onSwitchNetwork(e)}
        >
        </wui-list-network>
      `)}async onDisconnect(){try{this.disconnecting=!0;let e=y.state.activeChain,t=_.getConnections(e).length>0,n=e&&g.state.activeConnectorIds[e],r=this.remoteFeatures?.multiWallet;await _.disconnect(r?{id:n,namespace:e}:{}),t&&r&&(m.push(`ProfileWallets`),l.showSuccess(`Wallet deleted`))}catch{h.sendEvent({type:`track`,event:`DISCONNECT_ERROR`,properties:{message:`Failed to disconnect`}}),l.showError(`Failed to disconnect`)}finally{this.disconnecting=!1}}async onSwitchNetwork(e){let t=y.getActiveCaipAddress(),n=y.getAllApprovedCaipNetworkIds();y.getNetworkProp(`supportsAllNetworks`,e.chainNamespace);let r=m.state.data;t?n?.includes(e.caipNetworkId)?await y.switchActiveNetwork(e):m.push(`SwitchNetwork`,{...r,network:e}):t||(y.setActiveCaipNetwork(e),m.push(`Connect`))}};$r.styles=Zr,Qr([T()],$r.prototype,`disconnecting`,void 0),Qr([T()],$r.prototype,`remoteFeatures`,void 0),$r=Qr([D(`w3m-unsupported-chain-view`)],$r);var ei=O`
  wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
  }

  /* -- Types --------------------------------------------------------- */
  wui-flex[data-type='info'] {
    color: ${({tokens:e})=>e.theme.textSecondary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-flex[data-type='success'] {
    color: ${({tokens:e})=>e.core.textSuccess};
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  wui-flex[data-type='error'] {
    color: ${({tokens:e})=>e.core.textError};
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  wui-flex[data-type='warning'] {
    color: ${({tokens:e})=>e.core.textWarning};
    background-color: ${({tokens:e})=>e.core.backgroundWarning};
  }

  wui-flex[data-type='info'] wui-icon-box {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  wui-flex[data-type='success'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  wui-flex[data-type='error'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  wui-flex[data-type='warning'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundWarning};
  }

  wui-text {
    flex: 1;
  }
`,ti=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ni=class extends j{constructor(){super(...arguments),this.icon=`externalLink`,this.text=``,this.type=`info`}render(){return C`
      <wui-flex alignItems="center" data-type=${this.type}>
        <wui-icon-box size="sm" color="inherit" icon=${this.icon}></wui-icon-box>
        <wui-text variant="md-regular" color="inherit">${this.text}</wui-text>
      </wui-flex>
    `}};ni.styles=[A,w,ei],ti([S()],ni.prototype,`icon`,void 0),ti([S()],ni.prototype,`text`,void 0),ti([S()],ni.prototype,`type`,void 0),ni=ti([D(`wui-banner`)],ni);var ri=me`
  :host > wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
  }

  :host > wui-flex::-webkit-scrollbar {
    display: none;
  }
`,ii=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ai=class extends j{constructor(){super(),this.unsubscribe=[]}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return C` <wui-flex flexDirection="column" .padding=${[`2`,`3`,`3`,`3`]} gap="2">
      <wui-banner
        icon="warningCircle"
        text="You can only receive assets on these networks"
      ></wui-banner>
      ${this.networkTemplate()}
    </wui-flex>`}networkTemplate(){let e=y.getAllRequestedCaipNetworks(),t=y.getAllApprovedCaipNetworkIds(),n=y.state.activeCaipNetwork,r=y.checkIfSmartAccountEnabled(),i=s.sortRequestedNetworks(t,e);if(r&&ae(n?.chainNamespace)===te.ACCOUNT_TYPES.SMART_ACCOUNT){if(!n)return null;i=[n]}return i.filter(e=>e.chainNamespace===n?.chainNamespace).map(e=>C`
        <wui-list-network
          imageSrc=${E(f.getNetworkImage(e))}
          name=${e.name??`Unknown`}
          ?transparent=${!0}
        >
        </wui-list-network>
      `)}};ai.styles=ri,ai=ii([D(`w3m-wallet-compatible-networks-view`)],ai);var oi=O`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 56px;
    height: 56px;
    box-shadow: 0 0 0 8px ${({tokens:e})=>e.theme.borderPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    overflow: hidden;
  }

  :host([data-border-radius-full='true']) {
    border-radius: 50px;
  }

  wui-icon {
    width: 32px;
    height: 32px;
  }
`,si=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ci=class extends j{render(){return this.dataset.borderRadiusFull=this.borderRadiusFull?`true`:`false`,C`${this.templateVisual()}`}templateVisual(){return this.imageSrc?C`<wui-image src=${this.imageSrc} alt=${this.alt??``}></wui-image>`:C`<wui-icon
      data-parent-size="md"
      size="inherit"
      color="inherit"
      name="wallet"
    ></wui-icon>`}};ci.styles=[A,oi],si([S()],ci.prototype,`imageSrc`,void 0),si([S()],ci.prototype,`alt`,void 0),si([S({type:Boolean})],ci.prototype,`borderRadiusFull`,void 0),ci=si([D(`wui-visual-thumbnail`)],ci);var li=O`
  :host {
    display: flex;
    justify-content: center;
    gap: ${({spacing:e})=>e[4]};
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`,ui=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},di=class extends j{constructor(){super(...arguments),this.dappImageUrl=p.state.metadata?.icons,this.walletImageUrl=y.getAccountData()?.connectedWalletInfo?.icon}firstUpdated(){let e=this.shadowRoot?.querySelectorAll(`wui-visual-thumbnail`);e?.[0]&&this.createAnimation(e[0],`translate(18px)`),e?.[1]&&this.createAnimation(e[1],`translate(-18px)`)}render(){return C`
      <wui-visual-thumbnail
        ?borderRadiusFull=${!0}
        .imageSrc=${this.dappImageUrl?.[0]}
      ></wui-visual-thumbnail>
      <wui-visual-thumbnail .imageSrc=${this.walletImageUrl}></wui-visual-thumbnail>
    `}createAnimation(e,t){e.animate([{transform:`translateX(0px)`},{transform:t}],{duration:1600,easing:`cubic-bezier(0.56, 0, 0.48, 1)`,direction:`alternate`,iterations:1/0})}};di.styles=li,di=ui([D(`w3m-siwx-sign-message-thumbnails`)],di);var fi=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},pi=class extends j{constructor(){super(...arguments),this.dappName=p.state.metadata?.name,this.isCancelling=!1,this.isSigning=!1}render(){return C`
      <wui-flex justifyContent="center" .padding=${[`8`,`0`,`6`,`0`]}>
        <w3m-siwx-sign-message-thumbnails></w3m-siwx-sign-message-thumbnails>
      </wui-flex>
      <wui-flex .padding=${[`0`,`20`,`5`,`20`]} gap="3" justifyContent="space-between">
        <wui-text variant="lg-medium" align="center" color="primary"
          >${this.dappName??`Dapp`} needs to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${[`0`,`10`,`4`,`10`]} gap="3" justifyContent="space-between">
        <wui-text variant="md-regular" align="center" color="secondary"
          >Sign this message to prove you own this wallet and proceed. Canceling will disconnect
          you.</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${[`4`,`5`,`5`,`5`]} gap="3" justifyContent="space-between">
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral-secondary"
          ?loading=${this.isCancelling}
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          ${this.isCancelling?`Cancelling...`:`Cancel`}
        </wui-button>
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral-primary"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning?`Signing...`:`Sign`}
        </wui-button>
      </wui-flex>
    `}async onSign(){this.isSigning=!0;try{await i.requestSignMessage()}catch(e){if(e instanceof Error&&e.message.includes(`OTP is required`)){l.showError({message:`Something went wrong. We need to verify your account again.`}),m.replace(`DataCapture`);return}throw e}finally{this.isSigning=!1}}async onCancel(){this.isCancelling=!0,await i.cancelSignMessage().finally(()=>this.isCancelling=!1)}};fi([T()],pi.prototype,`isCancelling`,void 0),fi([T()],pi.prototype,`isSigning`,void 0),pi=fi([D(`w3m-siwx-sign-message-view`)],pi);var mi=e({AppKitAccountButton:()=>je,AppKitButton:()=>Fe,AppKitConnectButton:()=>He,AppKitNetworkButton:()=>Xe,W3mAccountButton:()=>Ae,W3mAccountSettingsView:()=>rt,W3mAccountView:()=>Mt,W3mAllWalletsView:()=>fn,W3mButton:()=>Pe,W3mChooseAccountNameView:()=>vr,W3mConnectButton:()=>Ve,W3mConnectView:()=>Q,W3mConnectWalletsView:()=>jr,W3mConnectingExternalView:()=>Kn,W3mConnectingMultiChainView:()=>Yn,W3mConnectingWcBasicView:()=>hr,W3mConnectingWcView:()=>pr,W3mDownloadsView:()=>br,W3mFooter:()=>r,W3mFundWalletView:()=>Vt,W3mGetWalletView:()=>Cr,W3mNetworkButton:()=>Ye,W3mNetworkSwitchView:()=>Lr,W3mNetworksView:()=>Ur,W3mProfileWalletsView:()=>J,W3mRouter:()=>a,W3mSIWXSignMessageView:()=>pi,W3mSwitchActiveChainView:()=>qr,W3mUnsupportedChainView:()=>$r,W3mWalletCompatibleNetworksView:()=>ai,W3mWhatIsANetworkView:()=>Xr,W3mWhatIsAWalletView:()=>Or});export{je as a,Fe as i,Xe as n,De as o,He as r,mi as t};