import{I as e,Y as t,_ as n,c as r,g as i,ht as a,it as o,l as s,mt as c,rt as l,s as u,u as d,v as f}from"./index-fbLSaq3c.js";import{n as p}from"./features-DuJxT8FR.js";import{t as m}from"./w3m-email-otp-widget-BKwDMORB.js";var h=f`
  .email-sufixes {
    display: flex;
    flex-direction: row;
    gap: var(--wui-spacing-3xs);
    overflow-x: auto;
    max-width: 100%;
    margin-top: var(--wui-spacing-s);
    margin-bottom: calc(-1 * var(--wui-spacing-m));
    padding-bottom: var(--wui-spacing-m);
    margin-left: calc(-1 * var(--wui-spacing-m));
    margin-right: calc(-1 * var(--wui-spacing-m));
    padding-left: var(--wui-spacing-m);
    padding-right: var(--wui-spacing-m);

    &::-webkit-scrollbar {
      display: none;
    }
  }
`,g=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},_=[`@gmail.com`,`@outlook.com`,`@yahoo.com`,`@hotmail.com`,`@aol.com`,`@icloud.com`,`@zoho.com`],v=class extends i{constructor(){super(...arguments),this.email=``}render(){let e=_.filter(this.filter.bind(this)).map(this.item.bind(this));return e.length===0?null:n`<div class="email-sufixes">${e}</div>`}filter(e){if(!this.email)return!1;let t=this.email.split(`@`);if(t.length<2)return!0;let n=t.pop();return e.includes(n)&&e!==`@${n}`}item(e){return n`<wui-button variant="neutral" size="sm" @click=${()=>{let t=this.email.split(`@`);t.length>1&&t.pop();let n=t[0]+e;this.dispatchEvent(new CustomEvent(`change`,{detail:n,bubbles:!0,composed:!0}))}}
      >${e}</wui-button
    >`}};v.styles=[h],g([r()],v.prototype,`email`,void 0),v=g([s(`w3m-email-suffixes-widget`)],v);var y=f`
  .recent-emails {
    display: flex;
    flex-direction: column;
    padding: var(--wui-spacing-s) 0;
    border-top: 1px solid var(--wui-color-gray-glass-005);
    border-bottom: 1px solid var(--wui-color-gray-glass-005);
  }

  .recent-emails-heading {
    margin-bottom: var(--wui-spacing-s);
  }

  .recent-emails-list-item {
    --wui-color-gray-glass-002: transparent;
  }
`,b=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},x=class extends i{constructor(){super(...arguments),this.emails=[]}render(){return this.emails.length===0?null:n`<div class="recent-emails">
      <wui-text variant="micro-600" color="fg-200" class="recent-emails-heading"
        >Recently used emails</wui-text
      >
      ${this.emails.map(this.item.bind(this))}
    </div>`}item(e){return n`<wui-list-item
      @click=${()=>{this.dispatchEvent(new CustomEvent(`select`,{detail:e,bubbles:!0,composed:!0}))}}
      ?chevron=${!0}
      icon="mail"
      iconVariant="overlay"
      class="recent-emails-list-item"
    >
      <wui-text variant="paragraph-500" color="fg-100">${e}</wui-text>
    </wui-list-item>`}};x.styles=[y],b([r()],x.prototype,`emails`,void 0),x=b([s(`w3m-recent-emails-widget`)],x);var S=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},C=class extends m{constructor(){super(...arguments),this.siwx=o.state.siwx,this.onOtpSubmit=async e=>{await this.siwx.confirmEmailOtp({code:e}),t.replace(`SIWXSignMessage`)},this.onOtpResend=async t=>{let n=e.getAccountData();if(!n?.caipAddress)throw Error(`No account data found`);await this.siwx.requestEmailOtp({email:t,account:n.caipAddress})}}connectedCallback(){(!this.siwx||!(this.siwx instanceof p))&&l.showError(`ReownAuthentication is not initialized.`),super.connectedCallback()}shouldSubmitOnOtpChange(){return this.otp.length===m.OTP_LENGTH}};S([u()],C.prototype,`siwx`,void 0),C=S([s(`w3m-data-capture-otp-confirm-view`)],C);var w=f`
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--wui-spacing-3xs);

    transition-property: margin, height;
    transition-duration: var(--wui-duration-md);
    transition-timing-function: var(--wui-ease-out-power-1);
    margin-top: -100px;

    &[data-state='loading'] {
      margin-top: 0px;
    }

    position: relative;
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      height: 252px;
      width: 360px;
      background: radial-gradient(
        96.11% 53.95% at 50% 51.28%,
        transparent 0%,
        color-mix(in srgb, var(--wui-color-bg-100) 5%, transparent) 49%,
        color-mix(in srgb, var(--wui-color-bg-100) 65%, transparent) 99.43%
      );
    }
  }

  .hero-main-icon {
    width: 176px;
    transition-property: background-color;
    transition-duration: var(--wui-duration-lg);
    transition-timing-function: var(--wui-ease-out-power-1);

    &[data-state='loading'] {
      width: 56px;
    }
  }

  .hero-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: var(--wui-spacing-3xs);
    flex-wrap: nowrap;
    min-width: fit-content;

    &:nth-child(1) {
      transform: translateX(-30px);
    }

    &:nth-child(2) {
      transform: translateX(30px);
    }

    &:nth-child(4) {
      transform: translateX(40px);
    }

    transition-property: height;
    transition-duration: var(--wui-duration-md);
    transition-timing-function: var(--wui-ease-out-power-1);
    height: 68px;

    &[data-state='loading'] {
      height: 0px;
    }
  }

  .hero-row-icon {
    opacity: 0.1;
    transition-property: opacity;
    transition-duration: var(--wui-duration-md);
    transition-timing-function: var(--wui-ease-out-power-1);

    &[data-state='loading'] {
      opacity: 0;
    }
  }
`,T=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},E=class extends i{constructor(){super(...arguments),this.email=t.state.data?.email??e.getAccountData()?.user?.email??``,this.address=e.getAccountData()?.address??``,this.loading=!1,this.appName=o.state.metadata?.name??`AppKit`,this.siwx=o.state.siwx,this.isRequired=Array.isArray(o.state.remoteFeatures?.emailCapture)&&o.state.remoteFeatures?.emailCapture.includes(`required`),this.recentEmails=this.getRecentEmails()}connectedCallback(){(!this.siwx||!(this.siwx instanceof p))&&l.showError(`ReownAuthentication is not initialized. Please contact support.`),super.connectedCallback()}firstUpdated(){this.loading=!1,this.recentEmails=this.getRecentEmails(),this.email&&this.onSubmit()}render(){return n`
      <wui-flex flexDirection="column" .padding=${[`3xs`,`m`,`m`,`m`]} gap="l">
        ${this.hero()} ${this.paragraph()} ${this.emailInput()} ${this.recentEmailsWidget()}
        ${this.footerActions()}
      </wui-flex>
    `}hero(){return n`
      <div class="hero" data-state=${this.loading?`loading`:`default`}>
        ${this.heroRow([`id`,`mail`,`wallet`,`x`,`solana`,`qrCode`])}
        ${this.heroRow([`mail`,`farcaster`,`wallet`,`discord`,`mobile`,`qrCode`])}
        <div class="hero-row">
          ${this.heroIcon(`github`)} ${this.heroIcon(`bank`)}
          <wui-icon-box
            size="xl"
            iconSize="xxl"
            iconColor=${this.loading?`fg-100`:`accent-100`}
            backgroundColor=${this.loading?`fg-100`:`accent-100`}
            icon=${this.loading?`id`:`user`}
            isOpaque
            class="hero-main-icon"
            data-state=${this.loading?`loading`:`default`}
          >
          </wui-icon-box>
          ${this.heroIcon(`id`)} ${this.heroIcon(`card`)}
        </div>
        ${this.heroRow([`google`,`id`,`github`,`verify`,`apple`,`mobile`])}
      </div>
    `}heroRow(e){return n`
      <div class="hero-row" data-state=${this.loading?`loading`:`default`}>
        ${e.map(this.heroIcon.bind(this))}
      </div>
    `}heroIcon(e){return n`
      <wui-icon-box
        size="xl"
        iconSize="xxl"
        iconColor="fg-100"
        backgroundColor="fg-100"
        icon=${e}
        data-state=${this.loading?`loading`:`default`}
        isOpaque
        class="hero-row-icon"
      >
      </wui-icon-box>
    `}paragraph(){return this.loading?n`
        <wui-text variant="paragraph-400" color="fg-200" align="center"
          >We are verifying your account with email
          <wui-text variant="paragraph-600" color="accent-100">${this.email}</wui-text> and address
          <wui-text variant="paragraph-600" color="fg-100">
            ${d.getTruncateString({string:this.address,charsEnd:4,charsStart:4,truncate:`middle`})} </wui-text
          >, please wait a moment.</wui-text
        >
      `:this.isRequired?n`
        <wui-text variant="paragraph-600" color="fg-100" align="center">
          ${this.appName} requires your email for authentication.
        </wui-text>
      `:n`
      <wui-flex flexDirection="column" gap="xs" alignItems="center">
        <wui-text variant="paragraph-600" color="fg-100" align="center" size>
          ${this.appName} would like to collect your email.
        </wui-text>

        <wui-text variant="small-400" color="fg-200" align="center">
          Don't worry, it's optional&mdash;you can skip this step.
        </wui-text>
      </wui-flex>
    `}emailInput(){if(this.loading)return null;let e=e=>{e.key===`Enter`&&this.onSubmit()},t=e=>{this.email=e.detail};return n`
      <wui-flex flexDirection="column">
        <wui-email-input
          .value=${this.email}
          .disabled=${this.loading}
          @inputChange=${t}
          @keydown=${e}
        ></wui-email-input>

        <w3m-email-suffixes-widget
          .email=${this.email}
          @change=${t}
        ></w3m-email-suffixes-widget>
      </wui-flex>
    `}recentEmailsWidget(){return this.recentEmails.length===0||this.loading?null:n`
      <w3m-recent-emails-widget
        .emails=${this.recentEmails}
        @select=${e=>{this.email=e.detail,this.onSubmit()}}
      ></w3m-recent-emails-widget>
    `}footerActions(){return n`
      <wui-flex flexDirection="row" fullWidth gap="s">
        ${this.isRequired?null:n`<wui-button
              size="lg"
              variant="neutral"
              fullWidth
              .disabled=${this.loading}
              @click=${this.onSkip.bind(this)}
              >Skip this step</wui-button
            >`}

        <wui-button
          size="lg"
          variant="main"
          type="submit"
          fullWidth
          .disabled=${!this.email||!this.isValidEmail(this.email)}
          .loading=${this.loading}
          @click=${this.onSubmit.bind(this)}
        >
          Continue
        </wui-button>
      </wui-flex>
    `}async onSubmit(){if(!(this.siwx instanceof p)){l.showError(`ReownAuthentication is not initialized. Please contact support.`);return}let n=e.getActiveCaipAddress();if(!n)throw Error(`Account is not connected.`);if(!this.isValidEmail(this.email)){l.showError(`Please provide a valid email.`);return}try{this.loading=!0;let e=await this.siwx.requestEmailOtp({email:this.email,account:n});this.pushRecentEmail(this.email),e.uuid===null?t.replace(`SIWXSignMessage`):t.replace(`DataCaptureOtpConfirm`,{email:this.email})}catch{l.showError(`Failed to send email OTP`),this.loading=!1}}onSkip(){t.replace(`SIWXSignMessage`)}getRecentEmails(){let e=c.getItem(a.RECENT_EMAILS);return(e?e.split(`,`):[]).filter(this.isValidEmail.bind(this)).slice(0,3)}pushRecentEmail(e){let t=this.getRecentEmails(),n=Array.from(new Set([e,...t])).slice(0,3);c.setItem(a.RECENT_EMAILS,n.join(`,`))}isValidEmail(e){return/^\S+@\S+\.\S+$/u.test(e)}};E.styles=[w],T([u()],E.prototype,`email`,void 0),T([u()],E.prototype,`address`,void 0),T([u()],E.prototype,`loading`,void 0),T([u()],E.prototype,`appName`,void 0),T([u()],E.prototype,`siwx`,void 0),T([u()],E.prototype,`isRequired`,void 0),T([u()],E.prototype,`recentEmails`,void 0),E=T([s(`w3m-data-capture-view`)],E);export{C as W3mDataCaptureOtpConfirmView,E as W3mDataCaptureView,v as W3mEmailSuffixesWidget,x as W3mRecentEmailsWidget};