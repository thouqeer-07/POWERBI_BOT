"use strict";(globalThis.webpackChunksuperset=globalThis.webpackChunksuperset||[]).push([[7936],{81788:(e,t,o)=>{o.d(t,{TZ:()=>s,u7:()=>i,B8:()=>l,mf:()=>d});var n=o(31069),r=o(68492);const a=(e,t,o)=>{let n=`api/v1/dashboard/${e}/filter_state`;return t&&(n=n.concat(`/${t}`)),o&&(n=n.concat(`?tab_id=${o}`)),n},s=(e,t,o,s)=>n.Z.put({endpoint:a(e,o,s),jsonPayload:{value:t}}).then((e=>e.json.message)).catch((e=>(r.Z.error(e),null))),i=(e,t,o)=>n.Z.post({endpoint:a(e,void 0,o),jsonPayload:{value:t}}).then((e=>e.json.key)).catch((e=>(r.Z.error(e),null))),l=(e,t)=>n.Z.get({endpoint:a(e,t)}).then((e=>{let{json:t}=e;return JSON.parse(t.value)})).catch((e=>(r.Z.error(e),null))),d=e=>n.Z.get({endpoint:`/api/v1/dashboard/permalink/${e}`}).then((e=>{let{json:t}=e;return t})).catch((e=>(r.Z.error(e),null)))},37936:(e,t,o)=>{o.r(t),o.d(t,{DashboardPage:()=>H,DashboardPageIdContext:()=>B,MigrationContext:()=>U,default:()=>Y});var n=o(78580),r=o.n(n),a=o(67294),s=o(16550),i=o(51995),l=o(93185),d=o(55867),c=o(78161),u=o(28062),p=o(78718),h=o.n(p),f=o(28216),b=o(11965),m=o(14114),v=o(38703),g=o(74069),_=o(35932);const x=(0,i.iK)(g.Z)`
  .modal-content {
    height: 900px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .modal-header {
    flex: 0 1 auto;
  }

  .modal-body {
    flex: 1 1 auto;
    overflow: auto;
  }

  .modal-footer {
    flex: 0 1 auto;
  }

  .ant-modal-body {
    overflow: auto;
  }
`,y=e=>{let{onClickReview:t,onClickSnooze:o,onHide:n,show:r,hideFooter:s=!1}=e;return(0,b.tZ)(x,{show:r,onHide:n,title:(0,d.t)("Ready to review filters in this dashboard?"),hideFooter:s,footer:(0,b.tZ)(a.Fragment,null,(0,b.tZ)(_.Z,{buttonSize:"small",onClick:o},(0,d.t)("Remind me in 24 hours")),(0,b.tZ)(_.Z,{buttonSize:"small",onClick:n},(0,d.t)("Cancel")),(0,b.tZ)(_.Z,{buttonSize:"small",buttonStyle:"primary",onClick:t},(0,d.t)("Start Review"))),responsive:!0},(0,b.tZ)("div",null,(0,d.t)("filter_box will be deprecated in a future version of Superset. Please replace filter_box by dashboard filter components.")))};var E=o(42582),S=o(63389),w=o(50810),Z=o(14505),$=o(48911),R=o(72570),I=o(61337),C=o(69856),D=o(27600),O=o(23525),k=o(22318),N=o(52794),T=o(9467),z=o(81788);const F=e=>b.iv`
  body {
    h1 {
      font-weight: ${e.typography.weights.bold};
      line-height: 1.4;
      font-size: ${e.typography.sizes.xxl}px;
      letter-spacing: -0.2px;
      margin-top: ${3*e.gridUnit}px;
      margin-bottom: ${3*e.gridUnit}px;
    }

    h2 {
      font-weight: ${e.typography.weights.bold};
      line-height: 1.4;
      font-size: ${e.typography.sizes.xl}px;
      margin-top: ${3*e.gridUnit}px;
      margin-bottom: ${2*e.gridUnit}px;
    }

    h3,
    h4,
    h5,
    h6 {
      font-weight: ${e.typography.weights.bold};
      line-height: 1.4;
      font-size: ${e.typography.sizes.l}px;
      letter-spacing: 0.2px;
      margin-top: ${2*e.gridUnit}px;
      margin-bottom: ${e.gridUnit}px;
    }
  }
`,j=e=>b.iv`
  .filter-card-popover {
    width: 240px;
    padding: 0;
    border-radius: 4px;

    &.ant-popover-placement-bottom {
      padding-top: ${e.gridUnit}px;
    }

    &.ant-popover-placement-left {
      padding-right: ${3*e.gridUnit}px;
    }

    .ant-popover-inner {
      box-shadow: 0 0 8px rgb(0 0 0 / 10%);
    }

    .ant-popover-inner-content {
      padding: ${4*e.gridUnit}px;
    }

    .ant-popover-arrow {
      display: none;
    }
  }

  .filter-card-tooltip {
    &.ant-tooltip-placement-bottom {
      padding-top: 0;
      & .ant-tooltip-arrow {
        top: -13px;
      }
    }
  }
`;var Q=o(14670),L=o.n(Q),P=o(43399);const U=a.createContext(C.Qi.NOOP),B=a.createContext("");(0,$.Z)();const M=a.lazy((()=>Promise.all([o.e(1216),o.e(8494),o.e(8453),o.e(7167),o.e(678),o.e(876),o.e(6052),o.e(2907),o.e(5207),o.e(5640),o.e(5010),o.e(8888),o.e(9507),o.e(986),o.e(8274),o.e(2923),o.e(4717),o.e(452)]).then(o.bind(o,19299)))),A=document.title,K=()=>{const e=(0,I.rV)(I.dR.dashboard__explore_context,{});return Object.fromEntries(Object.entries(e).filter((e=>{let[,t]=e;return!t.isRedundant})))},V=(e,t)=>{const o=K();(0,I.LS)(I.dR.dashboard__explore_context,{...o,[e]:t})},H=e=>{let{idOrSlug:t}=e;const o=(0,f.I0)(),n=(0,i.Fg)(),p=(0,s.k6)(),g=(0,f.v9)((e=>e.user)),_=(()=>{const e=(0,a.useMemo)((()=>L().generate()),[]),t=(0,f.v9)((t=>{var o,n,r;let{dashboardInfo:a,dashboardState:s,nativeFilters:i,dataMask:l}=t;return{labelColors:(null==(o=a.metadata)?void 0:o.label_colors)||{},sharedLabelColors:(null==(n=a.metadata)?void 0:n.shared_label_colors)||{},colorScheme:null==s?void 0:s.colorScheme,chartConfiguration:(null==(r=a.metadata)?void 0:r.chart_configuration)||{},nativeFilters:Object.entries(i.filters).reduce(((e,t)=>{let[o,n]=t;return{...e,[o]:h()(n,["chartsInScope"])}}),{}),dataMask:l,dashboardId:a.id,filterBoxFilters:(0,P.De)(),dashboardPageId:e}}));return(0,a.useEffect)((()=>(V(e,t),()=>{V(e,{...t,isRedundant:!0})})),[t,e]),e})(),{addDangerToast:x}=(0,m.e1)(),{result:$,error:Q}=(0,E.QU)(t),{result:H,error:Y}=(0,E.Es)(t),{result:J,error:q,status:G}=(0,E.JL)(t),X=(0,a.useRef)(!1),W=Q||Y,ee=Boolean($&&H),te=(0,O.eY)(D.KD.migrationState),oe=(0,l.c)(l.T.ENABLE_FILTER_BOX_MIGRATION),{dashboard_title:ne,css:re,metadata:ae,id:se=0}=$||{},[ie,le]=(0,a.useState)(te||C.Qi.NOOP);if((0,a.useEffect)((()=>{const e=()=>{const e=K();(0,I.LS)(I.dR.dashboard__explore_context,{...e,[_]:{...e[_],isRedundant:!0}})};return window.addEventListener("beforeunload",e),()=>{window.removeEventListener("beforeunload",e)}}),[_]),(0,a.useEffect)((()=>{o((0,T.sL)(G))}),[o,G]),(0,a.useEffect)((()=>{const e=null==H?void 0:H.some((e=>{var t;return"filter_box"===(null==(t=e.form_data)?void 0:t.viz_type)}));if($&&(0,k.Ms)($,g)){if(null!=ae&&ae.native_filter_configuration)return void le(oe?C.Qi.CONVERTED:C.Qi.NOOP);if(e)if(oe){var t;if(te&&r()(t=Object.values(C.Qi)).call(t,te))return void le(te);const e=(0,I.rV)(I.dR.filter_box_transition_snoozed_at,{});if(Date.now()-(e[se]||0)<C.Yd)return void le(C.Qi.SNOOZED);le(C.Qi.UNDECIDED)}else(0,l.c)(l.T.DASHBOARD_NATIVE_FILTERS)&&o((0,R.Dz)((0,d.t)("filter_box will be deprecated in a future version of Superset. Please replace filter_box by dashboard filter components.")))}}),[ee]),(0,a.useEffect)((()=>{se&&async function(){const e=(0,O.eY)(D.KD.permalinkKey),t=(0,O.eY)(D.KD.nativeFiltersKey),n=(0,O.eY)(D.KD.nativeFilters);let r,a=t||{};if(e){const t=await(0,z.mf)(e);t&&({dataMask:a,activeTabs:r}=t.state)}else t&&(a=await(0,z.B8)(se,t));n&&(a=n),ee&&(X.current||(X.current=!0,(0,l.c)(l.T.DASHBOARD_NATIVE_FILTERS_SET)&&o((0,N.pi)(se))),o((0,S.Y)({history:p,dashboard:$,charts:H,activeTabs:r,filterboxMigrationState:ie,dataMask:a})))}()}),[ee,ie]),(0,a.useEffect)((()=>(ne&&(document.title=ne),()=>{document.title=A})),[ne]),(0,a.useEffect)((()=>"string"==typeof re?(0,Z.Z)(re):()=>{}),[re]),(0,a.useEffect)((()=>{const e=(0,c.ZP)();return e.source=c.Ag.dashboard,()=>{u.getNamespace(null==ae?void 0:ae.color_namespace).resetColors(),e.clear()}}),[null==ae?void 0:ae.color_namespace]),(0,a.useEffect)((()=>{q?x((0,d.t)("Error loading chart datasources. Filters may not work correctly.")):o((0,w.Fy)(J))}),[x,J,q,o]),W)throw W;return ee?(0,b.tZ)(a.Fragment,null,(0,b.tZ)(b.xB,{styles:[j(n),F(n),"",""]}),(0,b.tZ)(y,{show:ie===C.Qi.UNDECIDED,hideFooter:!oe,onHide:()=>{le(C.Qi.SNOOZED)},onClickReview:()=>{le(C.Qi.REVIEWING)},onClickSnooze:()=>{const e=(0,I.rV)(I.dR.filter_box_transition_snoozed_at,{});(0,I.LS)(I.dR.filter_box_transition_snoozed_at,{...e,[se]:Date.now()}),le(C.Qi.SNOOZED)}}),(0,b.tZ)(U.Provider,{value:ie},(0,b.tZ)(B.Provider,{value:_},(0,b.tZ)(M,null)))):(0,b.tZ)(v.Z,null)},Y=H},14505:(e,t,o)=>{function n(e){const t="CssEditor-css",o=document.head||document.getElementsByTagName("head")[0],n=document.querySelector(`.${t}`)||function(e){const t=document.createElement("style");return t.className="CssEditor-css",t.type="text/css",t}();return"styleSheet"in n?n.styleSheet.cssText=e:n.innerHTML=e,o.appendChild(n),function(){n.remove()}}o.d(t,{Z:()=>n})},42582:(e,t,o)=>{o.d(t,{s_:()=>n.s_,hb:()=>l,QU:()=>d,Es:()=>c,JL:()=>u,Xx:()=>b,zA:()=>m});var n=o(42190),r=o(15926),a=o.n(r);function s(e){let{owners:t}=e;return t?t.map((e=>`${e.first_name} ${e.last_name}`)):null}const i=a().encode({columns:["owners.first_name","owners.last_name"],keys:["none"]});function l(e){return(0,n.l6)((0,n.s_)(`/api/v1/chart/${e}?q=${i}`),s)}const d=e=>(0,n.l6)((0,n.s_)(`/api/v1/dashboard/${e}`),(e=>({...e,metadata:e.json_metadata&&JSON.parse(e.json_metadata)||{},position_data:e.position_json&&JSON.parse(e.position_json)}))),c=e=>(0,n.s_)(`/api/v1/dashboard/${e}/charts`),u=e=>(0,n.s_)(`/api/v1/dashboard/${e}/datasets`);var p=o(67294),h=o(78926),f=o(31069);function b(e){const{dbId:t,onSuccess:o,onError:n}=e||{},r=(0,p.useRef)(!1),s={dbId:t},i=(0,h.useQuery)(["schemas",{dbId:t}],(()=>function(e){let{dbId:t,forceRefresh:o}=e;const n=`/api/v1/database/${t}/schemas/?q=${a().encode({force:o})}`;return f.Z.get({endpoint:n})}({...s,forceRefresh:r.current})),{select:e=>{let{json:t}=e;return t.result.map((e=>({value:e,label:e,title:e})))},enabled:Boolean(t),onSuccess:o,onError:n,onSettled:()=>{r.current=!1}});return{...i,refetch:()=>(r.current=!0,i.refetch())}}function m(e){const{data:t,isFetching:o}=b({dbId:e.dbId}),n=(0,p.useMemo)((()=>new Set(null==t?void 0:t.map((e=>{let{value:t}=e;return t})))),[t]),{dbId:r,schema:s,onSuccess:i,onError:l}=e||{},d=(0,p.useRef)(!1),c={dbId:r,schema:s},u=(0,h.useQuery)(["tables",{dbId:r,schema:s}],(()=>function(e){let{dbId:t,schema:o,forceRefresh:n}=e;const r=o?encodeURIComponent(o):"",s=`/api/v1/database/${null!=t?t:"undefined"}/tables/?q=${a().encode({force:n,schema_name:r})}`;return f.Z.get({endpoint:s})}({...c,forceRefresh:d.current})),{select:e=>{let{json:t}=e;return{options:t.result,hasMore:t.count>t.result.length}},enabled:Boolean(r&&s&&!o&&n.has(s)),onSuccess:i,onError:l,onSettled:()=>{d.current=!1}});return{...u,refetch:()=>(d.current=!0,u.refetch())}}}}]);
//# sourceMappingURL=04d1351f02a6393ca6fe.chunk.js.map