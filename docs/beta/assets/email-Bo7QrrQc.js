import{B as e,E as t,R as n,S as r,b as i,g as a,l as o,ot as s,r as c,v as l}from"./ApiController-DWA16WV7.js";import{C as u,b as d,g as f,o as p,p as m,v as h}from"./wui-text-7EwTqPDT.js";import"./wui-button-1hK_JKc-.js";import{t as g}from"./ConstantsUtil-Ddzedzcw.js";import"./wui-link-S0P8t7x4.js";import{t as _}from"./w3m-email-otp-widget-5zvIvMzz.js";import"./wui-icon-box-BvoNYK9Z.js";import{n as v,t as y}from"./ref-aw1hX9cd.js";import"./wui-email-input-DT1_GAgP.js";var b=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},x=class extends _{constructor(){super(...arguments),this.onOtpSubmit=async a=>{try{if(this.authConnector){let e=c.state.activeChain,s=o.getConnections(e),u=n.state.remoteFeatures?.multiWallet,d=s.length>0;if(await this.authConnector.provider.connectOtp({otp:a}),i.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_PASS`}),e)await o.connectExternal(this.authConnector,e);else throw Error(`Active chain is not set on ChainController`);if(n.state.remoteFeatures?.emailCapture)return;if(n.state.siwx){l.close();return}if(d&&u){r.replace(`ProfileWallets`),t.showSuccess(`New Wallet Added`);return}l.close()}}catch(t){throw i.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_FAIL`,properties:{message:e.parseError(t)}}),t}},this.onOtpResend=async e=>{this.authConnector&&(await this.authConnector.provider.connectEmail({email:e}),i.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_SENT`}))}}};x=b([p(`w3m-email-verify-otp-view`)],x);var S=m`
  wui-icon-box {
    height: ${({spacing:e})=>e[16]};
    width: ${({spacing:e})=>e[16]};
  }
`,C=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},w=class extends h{constructor(){super(),this.email=r.state.data?.email,this.authConnector=a.getAuthConnector(),this.loading=!1,this.listenForDeviceApproval()}render(){if(!this.email)throw Error(`w3m-email-verify-device-view: No email provided`);if(!this.authConnector)throw Error(`w3m-email-verify-device-view: No auth connector provided`);return d`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${[`6`,`3`,`6`,`3`]}
        gap="4"
      >
        <wui-icon-box size="xl" color="accent-primary" icon="sealCheck"></wui-icon-box>

        <wui-flex flexDirection="column" alignItems="center" gap="3">
          <wui-flex flexDirection="column" alignItems="center">
            <wui-text variant="md-regular" color="primary">
              Approve the login link we sent to
            </wui-text>
            <wui-text variant="md-regular" color="primary"><b>${this.email}</b></wui-text>
          </wui-flex>

          <wui-text variant="sm-regular" color="secondary" align="center">
            The code expires in 20 minutes
          </wui-text>

          <wui-flex alignItems="center" id="w3m-resend-section" gap="2">
            <wui-text variant="sm-regular" color="primary" align="center">
              Didn't receive it?
            </wui-text>
            <wui-link @click=${this.onResendCode.bind(this)} .disabled=${this.loading}>
              Resend email
            </wui-link>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}async listenForDeviceApproval(){if(this.authConnector)try{await this.authConnector.provider.connectDevice(),i.sendEvent({type:`track`,event:`DEVICE_REGISTERED_FOR_EMAIL`}),i.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_SENT`}),r.replace(`EmailVerifyOtp`,{email:this.email})}catch{r.goBack()}}async onResendCode(){try{if(!this.loading){if(!this.authConnector||!this.email)throw Error(`w3m-email-login-widget: Unable to resend email`);this.loading=!0,await this.authConnector.provider.connectEmail({email:this.email}),this.listenForDeviceApproval(),t.showSuccess(`Code email resent`)}}catch(e){t.showError(e)}finally{this.loading=!1}}};w.styles=S,C([f()],w.prototype,`loading`,void 0),w=C([p(`w3m-email-verify-device-view`)],w);var T=u`
  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
  }
`,E=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},D=class extends h{constructor(){super(...arguments),this.formRef=y(),this.initialEmail=r.state.data?.email??``,this.redirectView=r.state.data?.redirectView,this.email=``,this.loading=!1}firstUpdated(){this.formRef.value?.addEventListener(`keydown`,e=>{e.key===`Enter`&&this.onSubmitEmail(e)})}render(){return d`
      <wui-flex flexDirection="column" padding="4" gap="4">
        <form ${v(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
          <wui-email-input
            value=${this.initialEmail}
            .disabled=${this.loading}
            @inputChange=${this.onEmailInputChange.bind(this)}
          >
          </wui-email-input>
          <input type="submit" hidden />
        </form>
        ${this.buttonsTemplate()}
      </wui-flex>
    `}onEmailInputChange(e){this.email=e.detail}async onSubmitEmail(e){try{if(this.loading)return;this.loading=!0,e.preventDefault();let t=a.getAuthConnector();if(!t)throw Error(`w3m-update-email-wallet: Auth connector not found`);let n=await t.provider.updateEmail({email:this.email});i.sendEvent({type:`track`,event:`EMAIL_EDIT`}),n.action===`VERIFY_SECONDARY_OTP`?r.push(`UpdateEmailSecondaryOtp`,{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView}):r.push(`UpdateEmailPrimaryOtp`,{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView})}catch(e){t.showError(e),this.loading=!1}}buttonsTemplate(){let e=!this.loading&&this.email.length>3&&this.email!==this.initialEmail;return this.redirectView?d`
      <wui-flex gap="3">
        <wui-button size="md" variant="neutral" fullWidth @click=${r.goBack}>
          Cancel
        </wui-button>

        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!e}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      </wui-flex>
    `:d`
        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!e}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      `}};D.styles=T,E([f()],D.prototype,`email`,void 0),E([f()],D.prototype,`loading`,void 0),D=E([p(`w3m-update-email-wallet-view`)],D);var O=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},k=class extends _{constructor(){super(),this.email=r.state.data?.email,this.onOtpSubmit=async t=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailPrimaryOtp({otp:t}),i.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_PASS`}),r.replace(`UpdateEmailSecondaryOtp`,r.state.data))}catch(t){throw i.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_FAIL`,properties:{message:e.parseError(t)}}),t}},this.onStartOver=()=>{r.replace(`UpdateEmailWallet`,r.state.data)}}};k=O([p(`w3m-update-email-primary-otp-view`)],k);var A=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},j=class extends _{constructor(){super(),this.email=r.state.data?.newEmail,this.redirectView=r.state.data?.redirectView,this.onOtpSubmit=async t=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailSecondaryOtp({otp:t}),i.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_PASS`}),this.redirectView&&r.reset(this.redirectView))}catch(t){throw i.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_FAIL`,properties:{message:e.parseError(t)}}),t}},this.onStartOver=()=>{r.replace(`UpdateEmailWallet`,r.state.data)}}};j=A([p(`w3m-update-email-secondary-otp-view`)],j);var M=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},N=class extends h{constructor(){super(),this.authConnector=a.getAuthConnector(),this.isEmailEnabled=n.state.remoteFeatures?.email,this.isAuthEnabled=this.checkIfAuthEnabled(a.state.connectors),this.connectors=a.state.connectors,a.subscribeKey(`connectors`,e=>{this.connectors=e,this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors)})}render(){if(!this.isEmailEnabled)throw Error(`w3m-email-login-view: Email is not enabled`);if(!this.isAuthEnabled)throw Error(`w3m-email-login-view: No auth connector provided`);return d`<wui-flex flexDirection="column" .padding=${[`1`,`3`,`3`,`3`]} gap="4">
      <w3m-email-login-widget></w3m-email-login-widget>
    </wui-flex> `}checkIfAuthEnabled(e){let t=e.filter(e=>e.type===g.CONNECTOR_TYPE_AUTH).map(e=>e.chain);return s.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(e=>t.includes(e))}};M([f()],N.prototype,`connectors`,void 0),N=M([p(`w3m-email-login-view`)],N);export{N as W3mEmailLoginView,_ as W3mEmailOtpWidget,w as W3mEmailVerifyDeviceView,x as W3mEmailVerifyOtpView,k as W3mUpdateEmailPrimaryOtpView,j as W3mUpdateEmailSecondaryOtpView,D as W3mUpdateEmailWalletView};