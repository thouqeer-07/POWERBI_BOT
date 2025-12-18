"use strict";(globalThis.webpackChunksuperset=globalThis.webpackChunksuperset||[]).push([[4717],{2275:(e,t,i)=>{i.d(t,{cP:()=>o,$6:()=>d,Rw:()=>c,Er:()=>h,DZ:()=>p,$X:()=>u,ck:()=>b});var r=i(45697),l=i.n(r),a=i(81255),n=i(713),s=i(79271);const o=l().shape({id:l().string.isRequired,type:l().oneOf(Object.values(a.ZP)).isRequired,parents:l().arrayOf(l().string),children:l().arrayOf(l().string),meta:l().shape({width:l().number,height:l().number,headerSize:l().oneOf(s.Z.map((e=>e.value))),background:l().oneOf(n.Z.map((e=>e.value))),chartId:l().number})}),d=l().shape({id:l().number.isRequired,chartAlert:l().string,chartStatus:l().string,chartUpdateEndTime:l().number,chartUpdateStartTime:l().number,latestQueryFormData:l().object,queryController:l().shape({abort:l().func}),queriesResponse:l().arrayOf(l().object),triggerQuery:l().bool,lastRendered:l().number}),c=l().shape({slice_id:l().number.isRequired,slice_url:l().string.isRequired,slice_name:l().string.isRequired,datasource:l().string,datasource_name:l().string,datasource_link:l().string,changed_on:l().number.isRequired,modified:l().string,viz_type:l().string.isRequired,description:l().string,description_markeddown:l().string,owners:l().arrayOf(l().string)}),h=l().shape({chartId:l().number.isRequired,componentId:l().string.isRequired,filterName:l().string.isRequired,datasourceId:l().string.isRequired,directPathToFilter:l().arrayOf(l().string).isRequired,isDateFilter:l().bool.isRequired,isInstantFilter:l().bool.isRequired,columns:l().object,labels:l().object,scopes:l().object}),p=l().shape({sliceIds:l().arrayOf(l().number),expandedSlices:l().object,editMode:l().bool,isPublished:l().bool,colorNamespace:l().string,colorScheme:l().string,updatedColorScheme:l().bool,hasUnsavedChanges:l().bool}),u=l().shape({id:l().number,metadata:l().object,slug:l().string,dash_edit_perm:l().bool,dash_save_perm:l().bool,common:l().object,userId:l().string}),m=l().shape({value:l().oneOfType([l().number,l().string]).isRequired,label:l().string.isRequired}),g={value:l().oneOfType([l().number,l().string]).isRequired,label:l().string.isRequired,children:l().arrayOf(l().oneOfType([l().shape((f=()=>g,()=>f().apply(void 0,arguments))),m]))};var f;const b=l().oneOfType([l().shape(g),m])},79789:(e,t,i)=>{i.d(t,{Z:()=>d});var r=i(67294),l=i(51995),a=i(55867),n=i(70163),s=i(58593),o=i(11965);const d=function(e){let{certifiedBy:t,details:i,size:d="l"}=e;const c=(0,l.Fg)();return(0,o.tZ)(s.u,{id:"certified-details-tooltip",title:(0,o.tZ)(r.Fragment,null,t&&(0,o.tZ)("div",null,(0,o.tZ)("strong",null,(0,a.t)("Certified by %s",t))),(0,o.tZ)("div",null,i))},(0,o.tZ)(n.Z.Certified,{iconColor:c.colors.primary.base,iconSize:d}))}},17198:(e,t,i)=>{i.d(t,{Z:()=>p});var r=i(51995),l=i(55867),a=i(67294),n=i(9875),s=i(74069),o=i(49238),d=i(11965);const c=r.iK.div`
  padding-top: 8px;
  width: 50%;
  label {
    color: ${e=>{let{theme:t}=e;return t.colors.grayscale.base}};
    text-transform: uppercase;
  }
`,h=r.iK.div`
  line-height: 40px;
  padding-top: 16px;
`;function p(e){let{description:t,onConfirm:i,onHide:r,open:p,title:u}=e;const[m,g]=(0,a.useState)(!0),[f,b]=(0,a.useState)(""),v=()=>{b(""),i()};return(0,d.tZ)(s.Z,{disablePrimaryButton:m,onHide:()=>{b(""),r()},onHandledPrimaryAction:v,primaryButtonName:(0,l.t)("delete"),primaryButtonType:"danger",show:p,title:u},(0,d.tZ)(h,null,t),(0,d.tZ)(c,null,(0,d.tZ)(o.lX,{htmlFor:"delete"},(0,l.t)('Type "%s" to confirm',(0,l.t)("DELETE"))),(0,d.tZ)(n.II,{type:"text",id:"delete",autoComplete:"off",value:f,onChange:e=>{var t;const i=null!=(t=e.target.value)?t:"";g(i.toUpperCase()!==(0,l.t)("DELETE")),b(i)},onPressEnter:()=>{m||v()}})))}},36674:(e,t,i)=>{i.d(t,{Z:()=>h});var r=i(67294),l=i(51995),a=i(11965),n=i(55867),s=i(58593),o=i(33626),d=i(70163);const c=l.iK.a`
  ${e=>{let{theme:t}=e;return a.iv`
    font-size: ${t.typography.sizes.xl}px;
    display: flex;
    padding: 0 0 0 ${2*t.gridUnit}px;
  `}};
`,h=e=>{let{itemId:t,isStarred:i,showTooltip:l,saveFaveStar:h,fetchFaveStar:p}=e;(0,o.J)((()=>{p&&p(t)}));const u=(0,r.useCallback)((e=>{e.preventDefault(),h(t,!!i)}),[i,t,h]),m=(0,a.tZ)(c,{href:"#",onClick:u,className:"fave-unfave-icon",role:"button"},i?(0,a.tZ)(d.Z.FavoriteSelected,null):(0,a.tZ)(d.Z.FavoriteUnselected,null));return l?(0,a.tZ)(s.u,{id:"fave-unfave-tooltip",title:(0,n.t)("Click to favorite/unfavorite")},m):m}},4144:(e,t,i)=>{i.d(t,{Z:()=>c});var r=i(5872),l=i.n(r),a=i(67294),n=i(51995),s=i(68492),o=i(11965);const d=n.iK.div`
  background-image: url(${e=>{let{src:t}=e;return t}});
  background-size: cover;
  background-position: center ${e=>{let{position:t}=e;return t}};
  display: inline-block;
  height: calc(100% - 1px);
  width: calc(100% - 2px);
  margin: 1px 1px 0 1px;
`;function c(e){let{src:t,fallback:i,isLoading:r,position:n,...c}=e;const[h,p]=(0,a.useState)(i);return(0,a.useEffect)((()=>(t&&fetch(t).then((e=>e.blob())).then((e=>{if(/image/.test(e.type)){const t=URL.createObjectURL(e);p(t)}})).catch((e=>{s.Z.error(e),p(i)})),()=>{p(i)})),[t,i]),(0,o.tZ)(d,l()({src:r?i:h},c,{position:n}))}},20818:(e,t,i)=>{i.d(t,{Z:()=>M});var r=i(78580),l=i.n(r),a=i(67294),n=i(9875),s=i(49238),o=i(51127),d=i.n(o),c=i(35932),h=i(4715),p=i(15926),u=i.n(p),m=i(51995),g=i(55867),f=i(81545),b=i(31069),v=i(55786),F=i(78161),y=i(28062),x=i(74069),Z=i(94670),C=i(45697),k=i.n(C),S=i(76787),$=i(11965);const w={onChange:k().func,labelMargin:k().number,colorScheme:k().string,hasCustomLabelColors:k().bool};class N extends a.PureComponent{constructor(e){super(e),this.state={hovered:!1},this.categoricalSchemeRegistry=(0,f.Z)(),this.choices=this.categoricalSchemeRegistry.keys().map((e=>[e,e])),this.schemes=this.categoricalSchemeRegistry.getMap()}setHover(e){this.setState({hovered:e})}render(){const{colorScheme:e,labelMargin:t=0,hasCustomLabelColors:i}=this.props;return(0,$.tZ)(S.Z,{description:(0,g.t)("Any color palette selected here will override the colors applied to this dashboard's individual charts"),labelMargin:t,name:"color_scheme",onChange:this.props.onChange,value:e,choices:this.choices,clearable:!0,schemes:this.schemes,hovered:this.state.hovered,hasCustomLabelColors:i})}}N.propTypes=w,N.defaultProps={hasCustomLabelColors:!1,colorScheme:void 0,onChange:()=>{}};const I=N;var _=i(87999),O=i(98286),U=i(14114),R=i(91877),E=i(93185);const T=(0,m.iK)(s.xJ)`
  margin-bottom: 0;
`,q=(0,m.iK)(Z.Ad)`
  border-radius: ${e=>{let{theme:t}=e;return t.borderRadius}}px;
  border: 1px solid ${e=>{let{theme:t}=e;return t.colors.secondary.light2}};
`,M=(0,U.ZP)((e=>{let{addSuccessToast:t,addDangerToast:i,colorScheme:r,dashboardId:o,dashboardInfo:p,dashboardTitle:m,onHide:C=(()=>{}),onlyApply:k=!1,onSubmit:S=(()=>{}),show:w=!1}=e;const[N]=h.qz.useForm(),[U,M]=(0,a.useState)(!1),[j,A]=(0,a.useState)(!1),[L,X]=(0,a.useState)(r),[z,J]=(0,a.useState)(""),[K,D]=(0,a.useState)(),[B,P]=(0,a.useState)([]),[H,W]=(0,a.useState)([]),V=k?(0,g.t)("Apply"):(0,g.t)("Save"),Q=(0,f.Z)(),G=async e=>{const{error:t,statusText:i,message:r}=await(0,O.O$)(e);let l=t||i||(0,g.t)("An error has occurred");"object"==typeof r&&"json_metadata"in r?l=r.json_metadata:"string"==typeof r&&(l=r,"Forbidden"===r&&(l=(0,g.t)("You do not have permission to edit this dashboard"))),x.Z.error({title:(0,g.t)("Error"),content:l,okButtonProps:{danger:!0,className:"btn-danger"}})},Y=(0,a.useCallback)((function(e,t,i,r){void 0===e&&(e="owners"),void 0===t&&(t="");const l=u().encode({filter:t,page:i,page_size:r});return b.Z.get({endpoint:`/api/v1/dashboard/related/${e}?q=${l}`}).then((e=>({data:e.json.result.filter((e=>void 0===e.extra.active||e.extra.active)).map((e=>({value:e.value,label:e.text}))),totalCount:e.json.count})))}),[]),ee=(0,a.useCallback)((e=>{const{id:t,dashboard_title:i,slug:r,certified_by:l,certification_details:a,owners:n,roles:s,metadata:o,is_managed_externally:c}=e,h={id:t,title:i,slug:r||"",certifiedBy:l||"",certificationDetails:a||"",isManagedExternally:c||!1};N.setFieldsValue(h),D(h),P(n),W(s),X(o.color_scheme),null!=o&&o.positions&&delete o.positions;const p={...o};delete p.shared_label_colors,delete p.color_scheme_domain,J(p?d()(p):"")}),[N]),te=(0,a.useCallback)((()=>{M(!0),b.Z.get({endpoint:`/api/v1/dashboard/${o}`}).then((e=>{var t;const i=e.json.result,r=null!=(t=i.json_metadata)&&t.length?JSON.parse(i.json_metadata):{};ee({...i,metadata:r}),M(!1)}),G)}),[o,ee]),ie=()=>{try{return null!=z&&z.length?JSON.parse(z):{}}catch(e){return{}}},re=e=>{const t=(0,v.Z)(e).map((e=>({id:e.value,full_name:e.label})));P(t)},le=e=>{const t=(0,v.Z)(e).map((e=>({id:e.value,name:e.label})));W(t)},ae=()=>(B||[]).map((e=>({value:e.id,label:e.full_name||`${e.first_name} ${e.last_name}`}))),ne=function(e,t){void 0===e&&(e="");let{updateMetadata:i=!0}=void 0===t?{}:t;const r=Q.keys(),a=ie();if(e&&!l()(r).call(r,e))throw x.Z.error({title:(0,g.t)("Error"),content:(0,g.t)("A valid color scheme is required"),okButtonProps:{danger:!0,className:"btn-danger"}}),new Error("A valid color scheme is required");i&&(a.color_scheme=e,a.label_colors=a.label_colors||{},J(d()(a))),X(e)};return(0,a.useEffect)((()=>{w&&(p?ee(p):te()),Z.Ad.preload()}),[p,te,ee,w]),(0,a.useEffect)((()=>{m&&K&&K.title!==m&&N.setFieldsValue({...K,title:m})}),[K,m,N]),(0,$.tZ)(x.Z,{show:w,onHide:C,title:(0,g.t)("Dashboard properties"),footer:(0,$.tZ)(a.Fragment,null,(0,$.tZ)(c.Z,{htmlType:"button",buttonSize:"small",onClick:C,cta:!0},(0,g.t)("Cancel")),(0,$.tZ)(c.Z,{onClick:N.submit,buttonSize:"small",buttonStyle:"primary",className:"m-r-5",cta:!0,disabled:null==K?void 0:K.isManagedExternally,tooltip:null!=K&&K.isManagedExternally?(0,g.t)("This dashboard is managed externally, and can't be edited in Superset"):""},V)),responsive:!0},(0,$.tZ)(h.qz,{form:N,onFinish:()=>{var e,r,l,a;const{title:n,slug:s,certifiedBy:c,certificationDetails:h}=N.getFieldsValue();let p,u=L,m="",f=z;try{if(!f.startsWith("{")||!f.endsWith("}"))throw new Error;p=JSON.parse(f)}catch(e){return void i((0,g.t)("JSON metadata is invalid!"))}u=(null==(e=p)?void 0:e.color_scheme)||L,m=null==(r=p)?void 0:r.color_namespace,null!=(l=p)&&l.shared_label_colors&&delete p.shared_label_colors,null!=(a=p)&&a.color_scheme_domain&&delete p.color_scheme_domain;const v=(0,F.ZP)();var x;y.getNamespace(m).resetColors(),u?(v.updateColorMap(m,u),p.shared_label_colors=Object.fromEntries(v.getColorMap()),p.color_scheme_domain=(null==(x=Q.get(L))?void 0:x.colors)||[]):(v.reset(),p.shared_label_colors={},p.color_scheme_domain=[]),f=d()(p),ne(u,{updateMetadata:!1});const Z={},$={};(0,R.cr)(E.T.DASHBOARD_RBAC)&&(Z.roles=H,$.roles=(H||[]).map((e=>e.id)));const w={id:o,title:n,slug:s,jsonMetadata:f,owners:B,colorScheme:u,colorNamespace:m,certifiedBy:c,certificationDetails:h,...Z};k?(S(w),C(),t((0,g.t)("Dashboard properties updated"))):b.Z.put({endpoint:`/api/v1/dashboard/${o}`,headers:{"Content-Type":"application/json"},body:JSON.stringify({dashboard_title:n,slug:s||null,json_metadata:f||null,owners:(B||[]).map((e=>e.id)),certified_by:c||null,certification_details:c&&h?h:null,...$})}).then((()=>{S(w),C(),t((0,g.t)("The dashboard has been saved"))}),G)},layout:"vertical",initialValues:K},(0,$.tZ)(h.X2,null,(0,$.tZ)(h.JX,{xs:24,md:24},(0,$.tZ)("h3",null,(0,g.t)("Basic information")))),(0,$.tZ)(h.X2,{gutter:16},(0,$.tZ)(h.JX,{xs:24,md:12},(0,$.tZ)(s.xJ,{label:(0,g.t)("Title"),name:"title"},(0,$.tZ)(n.II,{type:"text",disabled:U}))),(0,$.tZ)(h.JX,{xs:24,md:12},(0,$.tZ)(T,{label:(0,g.t)("URL slug"),name:"slug"},(0,$.tZ)(n.II,{type:"text",disabled:U})),(0,$.tZ)("p",{className:"help-block"},(0,g.t)("A readable URL for your dashboard")))),(0,R.cr)(E.T.DASHBOARD_RBAC)?(()=>{const e=ie(),t=!!Object.keys((null==e?void 0:e.label_colors)||{}).length;return(0,$.tZ)(a.Fragment,null,(0,$.tZ)(h.X2,null,(0,$.tZ)(h.JX,{xs:24,md:24},(0,$.tZ)("h3",{style:{marginTop:"1em"}},(0,g.t)("Access")))),(0,$.tZ)(h.X2,{gutter:16},(0,$.tZ)(h.JX,{xs:24,md:12},(0,$.tZ)(T,{label:(0,g.t)("Owners")},(0,$.tZ)(h.qb,{allowClear:!0,ariaLabel:(0,g.t)("Owners"),disabled:U,mode:"multiple",onChange:re,options:(e,t,i)=>Y("owners",e,t,i),value:ae()})),(0,$.tZ)("p",{className:"help-block"},(0,g.t)("Owners is a list of users who can alter the dashboard. Searchable by name or username."))),(0,$.tZ)(h.JX,{xs:24,md:12},(0,$.tZ)(T,{label:(0,g.t)("Roles")},(0,$.tZ)(h.qb,{allowClear:!0,ariaLabel:(0,g.t)("Roles"),disabled:U,mode:"multiple",onChange:le,options:(e,t,i)=>Y("roles",e,t,i),value:(H||[]).map((e=>({value:e.id,label:`${e.name}`})))})),(0,$.tZ)("p",{className:"help-block"},(0,g.t)("Roles is a list which defines access to the dashboard. Granting a role access to a dashboard will bypass dataset level checks. If no roles are defined, then the dashboard is available to all roles.")))),(0,$.tZ)(h.X2,null,(0,$.tZ)(h.JX,{xs:24,md:12},(0,$.tZ)(I,{hasCustomLabelColors:t,onChange:ne,colorScheme:L,labelMargin:4}))))})():(()=>{const e=ie(),t=!!Object.keys((null==e?void 0:e.label_colors)||{}).length;return(0,$.tZ)(h.X2,{gutter:16},(0,$.tZ)(h.JX,{xs:24,md:12},(0,$.tZ)("h3",{style:{marginTop:"1em"}},(0,g.t)("Access")),(0,$.tZ)(T,{label:(0,g.t)("Owners")},(0,$.tZ)(h.qb,{allowClear:!0,ariaLabel:(0,g.t)("Owners"),disabled:U,mode:"multiple",onChange:re,options:(e,t,i)=>Y("owners",e,t,i),value:ae()})),(0,$.tZ)("p",{className:"help-block"},(0,g.t)("Owners is a list of users who can alter the dashboard. Searchable by name or username."))),(0,$.tZ)(h.JX,{xs:24,md:12},(0,$.tZ)("h3",{style:{marginTop:"1em"}},(0,g.t)("Colors")),(0,$.tZ)(I,{hasCustomLabelColors:t,onChange:ne,colorScheme:L,labelMargin:4})))})(),(0,$.tZ)(h.X2,null,(0,$.tZ)(h.JX,{xs:24,md:24},(0,$.tZ)("h3",null,(0,g.t)("Certification")))),(0,$.tZ)(h.X2,{gutter:16},(0,$.tZ)(h.JX,{xs:24,md:12},(0,$.tZ)(T,{label:(0,g.t)("Certified by"),name:"certifiedBy"},(0,$.tZ)(n.II,{type:"text",disabled:U})),(0,$.tZ)("p",{className:"help-block"},(0,g.t)("Person or group that has certified this dashboard."))),(0,$.tZ)(h.JX,{xs:24,md:12},(0,$.tZ)(T,{label:(0,g.t)("Certification details"),name:"certificationDetails"},(0,$.tZ)(n.II,{type:"text",disabled:U})),(0,$.tZ)("p",{className:"help-block"},(0,g.t)("Any additional detail to show in the certification tooltip.")))),(0,$.tZ)(h.X2,null,(0,$.tZ)(h.JX,{xs:24,md:24},(0,$.tZ)("h3",{style:{marginTop:"1em"}},(0,$.tZ)(c.Z,{buttonStyle:"link",onClick:()=>A(!j)},(0,$.tZ)("i",{className:"fa fa-angle-"+(j?"down":"right"),style:{minWidth:"1em"}}),(0,g.t)("Advanced"))),j&&(0,$.tZ)(a.Fragment,null,(0,$.tZ)(T,{label:(0,g.t)("JSON metadata")},(0,$.tZ)(q,{showLoadingForImport:!0,name:"json_metadata",value:z,onChange:J,tabSize:2,width:"100%",height:"200px",wrapEnabled:!0})),(0,$.tZ)("p",{className:"help-block"},(0,g.t)("This JSON object is generated dynamically when clicking the save or overwrite button in the dashboard view. It is exposed here for reference and for power users who may want to alter specific parameters."),k&&(0,$.tZ)(a.Fragment,null," ",(0,g.t)('Please DO NOT overwrite the "filter_scopes" key.')," ",(0,$.tZ)(_.Z,{triggerNode:(0,$.tZ)("span",{className:"alert-link"},(0,g.t)('Use "%(menuName)s" menu instead.',{menuName:(0,g.t)("Set filter mapping")}))}))))))))}))},87999:(e,t,i)=>{i.d(t,{Z:()=>be});var r=i(67294),l=i(51995),a=i(1304),n=i(28216),s=i(14890),o=i(81395),d=i(9467),c=i(78580),h=i.n(c),p=i(45697),u=i.n(p),m=i(94184),g=i.n(m),f=i(35932),b=i(11965),v=i(55867),F=i(41609),y=i.n(F),x=i(80621),Z=i(81255);const C=[Z.gn,Z.U0];function k(e){let{currentNode:t={},components:i={},filterFields:r=[],selectedChartId:l}=e;if(!t)return null;const{type:a}=t;if(Z.dW===a&&t&&t.meta&&t.meta.chartId){const e={value:t.meta.chartId,label:t.meta.sliceName||`${a} ${t.meta.chartId}`,type:a,showCheckbox:l!==t.meta.chartId};return{...e,children:r.map((i=>({value:`${t.meta.chartId}:${i}`,label:`${e.label}`,type:"filter_box",showCheckbox:!1})))}}let n=[];if(t.children&&t.children.length&&t.children.forEach((e=>{const t=k({currentNode:i[e],components:i,filterFields:r,selectedChartId:l}),a=i[e].type;h()(C).call(C,a)?n.push(t):n=n.concat(t)})),h()(C).call(C,a)){let e=null;return e=a===Z.U0?(0,v.t)("All charts"):t.meta&&t.meta.text?t.meta.text:`${a} ${t.id}`,{value:t.id,label:e,type:a,children:n}}return n}function S(e){let{components:t={},filterFields:i=[],selectedChartId:r}=e;return y()(t)?[]:[{...k({currentNode:t[x._4],components:t,filterFields:i,selectedChartId:r})}]}function $(e,t){void 0===e&&(e=[]),void 0===t&&(t=-1);const i=[],r=(e,l)=>{e&&e.children&&(-1===t||l<t)&&(i.push(e.value),e.children.forEach((e=>r(e,l+1))))};return e.length>0&&e.forEach((e=>{r(e,0)})),i}var w=i(9679);function N(e){let{activeFilterField:t,checkedFilterFields:i}=e;return(0,w.o)(t?[t]:i)}var I=i(20194);function _(e){let{activeFilterField:t,checkedFilterFields:i}=e;if(t)return(0,I._)(t).chartId;if(i.length){const{chartId:e}=(0,I._)(i[0]);return i.some((t=>(0,I._)(t).chartId!==e))?null:e}return null}function O(e){let{checkedFilterFields:t=[],activeFilterField:i,filterScopeMap:r={},layout:l={}}=e;const a=N({checkedFilterFields:t,activeFilterField:i}),n=i?[i]:t,s=S({components:l,filterFields:n,selectedChartId:_({checkedFilterFields:t,activeFilterField:i})}),o=new Set;n.forEach((e=>{(r[e].checked||[]).forEach((t=>{o.add(`${t}:${e}`)}))}));const d=[...o],c=r[a]?r[a].expanded:$(s,1);return{[a]:{nodes:s,nodesFiltered:[...s],checked:d,expanded:c}}}var U=i(94654),R=i.n(U),E=i(83927),T=i.n(E),q=i(58809),M=i.n(q),j=i(8816),A=i.n(j);function L(e){let{tabScopes:t,parentNodeValue:i,forceAggregate:r=!1,hasChartSiblings:l=!1,tabChildren:a=[],immuneChartSiblings:n=[]}=e;if(r||!l&&Object.entries(t).every((e=>{let[t,{scope:i}]=e;return i&&i.length&&t===i[0]}))){const e=function(e){let{tabs:t=[],tabsInScope:i=[]}=e;const r=[];return t.forEach((e=>{let{value:t,children:l}=e;l&&!h()(i).call(i,t)&&l.forEach((e=>{let{value:t,children:l}=e;l&&!h()(i).call(i,t)&&r.push(...l.filter((e=>{let{type:t}=e;return t===Z.dW})))}))})),r.map((e=>{let{value:t}=e;return t}))}({tabs:a,tabsInScope:R()(t,(e=>{let{scope:t}=e;return t}))}),r=R()(Object.values(t),(e=>{let{immune:t}=e;return t}));return{scope:[i],immune:[...new Set([...e,...r])]}}const s=Object.values(t).filter((e=>{let{scope:t}=e;return t&&t.length}));return{scope:R()(s,(e=>{let{scope:t}=e;return t})),immune:s.length?R()(s,(e=>{let{immune:t}=e;return t})):R()(Object.values(t),(e=>{let{immune:t}=e;return t})).concat(n)}}function X(e){let{currentNode:t={},filterId:i,checkedChartIds:r=[]}=e;if(!t)return{};const{value:l,children:a}=t,n=a.filter((e=>{let{type:t}=e;return t===Z.dW})),s=a.filter((e=>{let{type:t}=e;return t===Z.gn})),o=n.filter((e=>{let{value:t}=e;return i!==t&&!h()(r).call(r,t)})).map((e=>{let{value:t}=e;return t})),d=A()(M()((e=>e.value)),T()((e=>X({currentNode:e,filterId:i,checkedChartIds:r}))))(s);if(!y()(n)&&n.some((e=>{let{value:t}=e;return h()(r).call(r,t)}))){if(y()(s))return{scope:[l],immune:o};const{scope:e,immune:t}=L({tabScopes:d,parentNodeValue:l,forceAggregate:!0,tabChildren:s});return{scope:e,immune:o.concat(t)}}return s.length?L({tabScopes:d,parentNodeValue:l,hasChartSiblings:!y()(n),tabChildren:s,immuneChartSiblings:o}):{scope:[],immune:o}}function z(e){let{filterKey:t,nodes:i=[],checkedChartIds:r=[]}=e;if(i.length){const{chartId:e}=(0,I._)(t);return X({currentNode:i[0],filterId:e,checkedChartIds:r})}return{}}var J=i(43399),K=i(2275),D=i(28388),B=i.n(D),P=i(70163);const H=(0,l.iK)(P.Z.BarChartOutlined)`
  ${e=>{let{theme:t}=e;return`\n    position: relative;\n    top: ${t.gridUnit-1}px;\n    color: ${t.colors.primary.base};\n    margin-right: ${2*t.gridUnit}px;\n  `}}
`;function W(e){let{currentNode:t={},selectedChartId:i}=e;if(!t)return null;const{label:r,value:l,type:a,children:n}=t;if(n&&n.length){const e=n.map((e=>W({currentNode:e,selectedChartId:i})));return{...t,label:(0,b.tZ)("span",{className:g()(`filter-scope-type ${a.toLowerCase()}`,{"selected-filter":i===l})},a===Z.dW&&(0,b.tZ)(H,null),r),children:e}}return{...t,label:(0,b.tZ)("span",{className:g()(`filter-scope-type ${a.toLowerCase()}`,{"selected-filter":i===l})},r)}}function V(e){let{nodes:t,selectedChartId:i}=e;return t?t.map((e=>W({currentNode:e,selectedChartId:i}))):[]}var Q=i(13842);const G={check:(0,b.tZ)(Q.lU,null),uncheck:(0,b.tZ)(Q.zq,null),halfCheck:(0,b.tZ)(Q.dc,null),expandClose:(0,b.tZ)("span",{className:"rct-icon rct-icon-expand-close"}),expandOpen:(0,b.tZ)("span",{className:"rct-icon rct-icon-expand-open"}),expandAll:(0,b.tZ)("span",{className:"rct-icon rct-icon-expand-all"},(0,v.t)("Expand all")),collapseAll:(0,b.tZ)("span",{className:"rct-icon rct-icon-collapse-all"},(0,v.t)("Collapse all")),parentClose:(0,b.tZ)("span",{className:"rct-icon rct-icon-parent-close"}),parentOpen:(0,b.tZ)("span",{className:"rct-icon rct-icon-parent-open"}),leaf:(0,b.tZ)("span",{className:"rct-icon rct-icon-leaf"})},Y={nodes:u().arrayOf(K.ck).isRequired,checked:u().arrayOf(u().oneOfType([u().number,u().string])).isRequired,expanded:u().arrayOf(u().oneOfType([u().number,u().string])).isRequired,onCheck:u().func.isRequired,onExpand:u().func.isRequired,selectedChartId:u().number},ee=()=>{};function te(e){let{nodes:t=[],checked:i=[],expanded:r=[],onCheck:l,onExpand:a,selectedChartId:n}=e;return(0,b.tZ)(B(),{showExpandAll:!0,expandOnClick:!0,showNodeIcon:!1,nodes:V({nodes:t,selectedChartId:n}),checked:i,expanded:r,onCheck:l,onExpand:a,onClick:ee,icons:G})}te.propTypes=Y,te.defaultProps={selectedChartId:null};var ie=i(49238);const re={label:u().string.isRequired,isSelected:u().bool.isRequired};function le(e){let{label:t,isSelected:i}=e;return(0,b.tZ)("span",{className:g()("filter-field-item filter-container",{"is-selected":i})},(0,b.tZ)(ie.lX,{htmlFor:t},t))}function ae(e){let{nodes:t,activeKey:i}=e;if(!t)return[];const r=t[0],l=r.children.map((e=>({...e,children:e.children.map((e=>{const{label:t,value:r}=e;return{...e,label:(0,b.tZ)(le,{isSelected:r===i,label:t})}}))})));return[{...r,label:(0,b.tZ)("span",{className:"root"},r.label),children:l}]}le.propTypes=re;const ne={activeKey:u().string,nodes:u().arrayOf(K.ck).isRequired,checked:u().arrayOf(u().oneOfType([u().number,u().string])).isRequired,expanded:u().arrayOf(u().oneOfType([u().number,u().string])).isRequired,onCheck:u().func.isRequired,onExpand:u().func.isRequired,onClick:u().func.isRequired};function se(e){let{activeKey:t,nodes:i=[],checked:r=[],expanded:l=[],onClick:a,onCheck:n,onExpand:s}=e;return(0,b.tZ)(B(),{showExpandAll:!0,showNodeIcon:!1,expandOnClick:!0,nodes:ae({nodes:i,activeKey:t}),checked:r,expanded:l,onClick:a,onCheck:n,onExpand:s,icons:G})}se.propTypes=ne,se.defaultProps={activeKey:null};const oe={dashboardFilters:u().objectOf(K.Er).isRequired,layout:u().object.isRequired,updateDashboardFiltersScope:u().func.isRequired,setUnsavedChanges:u().func.isRequired,onCloseModal:u().func.isRequired},de=l.iK.div`
  ${e=>{let{theme:t}=e;return b.iv`
    display: flex;
    flex-direction: column;
    height: 80%;
    margin-right: ${-6*t.gridUnit}px;
    font-size: ${t.typography.sizes.m}px;

    & .nav.nav-tabs {
      border: none;
    }

    & .filter-scope-body {
      flex: 1;
      max-height: calc(100% - ${32*t.gridUnit}px);

      .filter-field-pane,
      .filter-scope-pane {
        overflow-y: auto;
      }
    }

    & .warning-message {
      padding: ${6*t.gridUnit}px;
    }
  `}}
`,ce=l.iK.div`
  ${e=>{let{theme:t}=e;return b.iv`
    &.filter-scope-body {
      flex: 1;
      max-height: calc(100% - ${32*t.gridUnit}px);

      .filter-field-pane,
      .filter-scope-pane {
        overflow-y: auto;
      }
    }
  `}}
`,he=l.iK.div`
  ${e=>{let{theme:t}=e;return b.iv`
    height: ${16*t.gridUnit}px;
    border-bottom: 1px solid ${t.colors.grayscale.light2};
    padding-left: ${6*t.gridUnit}px;
    margin-left: ${-6*t.gridUnit}px;

    h4 {
      margin-top: 0;
    }

    .selected-fields {
      margin: ${3*t.gridUnit}px 0 ${4*t.gridUnit}px;
      visibility: hidden;

      &.multi-edit-mode {
        visibility: visible;
      }

      .selected-scopes {
        padding-left: ${t.gridUnit}px;
      }
    }
  `}}
`,pe=l.iK.div`
  ${e=>{let{theme:t}=e;return b.iv`
    &.filters-scope-selector {
      display: flex;
      flex-direction: row;
      position: relative;
      height: 100%;

      a,
      a:active,
      a:hover {
        color: inherit;
        text-decoration: none;
      }

      .react-checkbox-tree .rct-icon.rct-icon-expand-all,
      .react-checkbox-tree .rct-icon.rct-icon-collapse-all {
        font-family: ${t.typography.families.sansSerif};
        font-size: ${t.typography.sizes.m}px;
        color: ${t.colors.primary.base};

        &::before {
          content: '';
        }

        &:hover {
          text-decoration: underline;
        }

        &:focus {
          outline: none;
        }
      }

      .filter-field-pane {
        position: relative;
        width: 40%;
        padding: ${4*t.gridUnit}px;
        padding-left: 0;
        border-right: 1px solid ${t.colors.grayscale.light2};

        .filter-container label {
          font-weight: ${t.typography.weights.normal};
          margin: 0 0 0 ${4*t.gridUnit}px;
          word-break: break-all;
        }

        .filter-field-item {
          height: ${9*t.gridUnit}px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 ${6*t.gridUnit}px;
          margin-left: ${-6*t.gridUnit}px;

          &.is-selected {
            border: 1px solid ${t.colors.text.label};
            border-radius: ${t.borderRadius}px;
            background-color: ${t.colors.grayscale.light4};
            margin-left: ${-6*t.gridUnit}px;
          }
        }

        .react-checkbox-tree {
          .rct-title .root {
            font-weight: ${t.typography.weights.bold};
          }

          .rct-text {
            height: ${10*t.gridUnit}px;
          }
        }
      }

      .filter-scope-pane {
        position: relative;
        flex: 1;
        padding: ${4*t.gridUnit}px;
        padding-right: ${6*t.gridUnit}px;
      }

      .react-checkbox-tree {
        flex-direction: column;
        color: ${t.colors.grayscale.dark1};
        font-size: ${t.typography.sizes.m}px;

        .filter-scope-type {
          padding: ${2*t.gridUnit}px 0;
          display: flex;
          align-items: center;

          &.chart {
            font-weight: ${t.typography.weights.normal};
          }

          &.selected-filter {
            padding-left: ${7*t.gridUnit}px;
            position: relative;
            color: ${t.colors.text.label};

            &::before {
              content: ' ';
              position: absolute;
              left: 0;
              top: 50%;
              width: ${4*t.gridUnit}px;
              height: ${4*t.gridUnit}px;
              border-radius: ${t.borderRadius}px;
              margin-top: ${-2*t.gridUnit}px;
              box-shadow: inset 0 0 0 2px ${t.colors.grayscale.light2};
              background: ${t.colors.grayscale.light3};
            }
          }

          &.root {
            font-weight: ${t.typography.weights.bold};
          }
        }

        .rct-checkbox {
          svg {
            position: relative;
            top: 3px;
            width: ${4.5*t.gridUnit}px;
          }
        }

        .rct-node-leaf {
          .rct-bare-label {
            &::before {
              padding-left: ${t.gridUnit}px;
            }
          }
        }

        .rct-options {
          text-align: left;
          margin-left: 0;
          margin-bottom: ${2*t.gridUnit}px;
        }

        .rct-text {
          margin: 0;
          display: flex;
        }

        .rct-title {
          display: block;
        }

        // disable style from react-checkbox-trees.css
        .rct-node-clickable:hover,
        .rct-node-clickable:focus,
        label:hover,
        label:active {
          background: none !important;
        }
      }

      .multi-edit-mode {
        &.filter-scope-pane {
          .rct-node.rct-node-leaf .filter-scope-type.filter_box {
            display: none;
          }
        }

        .filter-field-item {
          padding: 0 ${4*t.gridUnit}px 0 ${12*t.gridUnit}px;
          margin-left: ${-12*t.gridUnit}px;

          &.is-selected {
            margin-left: ${-13*t.gridUnit}px;
          }
        }
      }

      .scope-search {
        position: absolute;
        right: ${4*t.gridUnit}px;
        top: ${4*t.gridUnit}px;
        border-radius: ${t.borderRadius}px;
        border: 1px solid ${t.colors.grayscale.light2};
        padding: ${t.gridUnit}px ${2*t.gridUnit}px;
        font-size: ${t.typography.sizes.m}px;
        outline: none;

        &:focus {
          border: 1px solid ${t.colors.primary.base};
        }
      }
    }
  `}}
`,ue=l.iK.div`
  ${e=>{let{theme:t}=e;return`\n    height: ${16*t.gridUnit}px;\n\n    border-top: ${t.gridUnit/4}px solid ${t.colors.primary.light3};\n    padding: ${6*t.gridUnit}px;\n    margin: 0 0 0 ${6*-t.gridUnit}px;\n    text-align: right;\n\n    .btn {\n      margin-right: ${4*t.gridUnit}px;\n\n      &:last-child {\n        margin-right: 0;\n      }\n    }\n  `}}
`;class me extends r.PureComponent{constructor(e){super(e);const{dashboardFilters:t,layout:i}=e;if(Object.keys(t).length>0){const e=function(e){let{dashboardFilters:t={}}=e;const i=Object.values(t).map((e=>{const{chartId:t,filterName:i,columns:r,labels:l}=e,a=Object.keys(r).map((e=>({value:(0,I.w)({chartId:t,column:e}),label:l[e]||e})));return{value:t,label:i,children:a,showCheckbox:!0}}));return[{value:x.dU,type:Z.U0,label:(0,v.t)("All filters"),children:i}]}({dashboardFilters:t}),r=e[0].children;this.allfilterFields=[],r.forEach((e=>{let{children:t}=e;t.forEach((e=>{this.allfilterFields.push(e.value)}))})),this.defaultFilterKey=r[0].children[0].value;const l=Object.values(t).reduce(((e,r)=>{let{chartId:l,columns:a}=r;return{...e,...Object.keys(a).reduce(((e,r)=>{const a=(0,I.w)({chartId:l,column:r}),n=S({components:i,filterFields:[a],selectedChartId:l}),s=$(n,1),o=((0,J.up)({filterScope:t[l].scopes[r]})||[]).filter((e=>e!==l));return{...e,[a]:{nodes:n,nodesFiltered:[...n],checked:o,expanded:s}}}),{})}}),{}),{chartId:a}=(0,I._)(this.defaultFilterKey),n=[],s=this.defaultFilterKey,o=[x.dU].concat(a),d=O({checkedFilterFields:n,activeFilterField:s,filterScopeMap:l,layout:i});this.state={showSelector:!0,activeFilterField:s,searchText:"",filterScopeMap:{...l,...d},filterFieldNodes:e,checkedFilterFields:n,expandedFilterIds:o}}else this.state={showSelector:!1};this.filterNodes=this.filterNodes.bind(this),this.onChangeFilterField=this.onChangeFilterField.bind(this),this.onCheckFilterScope=this.onCheckFilterScope.bind(this),this.onExpandFilterScope=this.onExpandFilterScope.bind(this),this.onSearchInputChange=this.onSearchInputChange.bind(this),this.onCheckFilterField=this.onCheckFilterField.bind(this),this.onExpandFilterField=this.onExpandFilterField.bind(this),this.onClose=this.onClose.bind(this),this.onSave=this.onSave.bind(this)}onCheckFilterScope(e){void 0===e&&(e=[]);const{activeFilterField:t,filterScopeMap:i,checkedFilterFields:r}=this.state,l=N({activeFilterField:t,checkedFilterFields:r}),a=t?[t]:r,n={...i[l],checked:e},s=function(e){let{checked:t=[],filterFields:i=[],filterScopeMap:r={}}=e;const l=t.reduce(((e,t)=>{const[i,r]=t.split(":");return{...e,[r]:(e[r]||[]).concat(parseInt(i,10))}}),{});return i.reduce(((e,t)=>{const{chartId:i}=(0,I._)(t),a=(l[t]||[]).filter((e=>e!==i));return{...e,[t]:{...r[t],checked:a}}}),{})}({checked:e,filterFields:a,filterScopeMap:i});this.setState((()=>({filterScopeMap:{...i,...s,[l]:n}})))}onExpandFilterScope(e){void 0===e&&(e=[]);const{activeFilterField:t,checkedFilterFields:i,filterScopeMap:r}=this.state,l=N({activeFilterField:t,checkedFilterFields:i}),a={...r[l],expanded:e};this.setState((()=>({filterScopeMap:{...r,[l]:a}})))}onCheckFilterField(e){void 0===e&&(e=[]);const{layout:t}=this.props,{filterScopeMap:i}=this.state,r=O({checkedFilterFields:e,activeFilterField:null,filterScopeMap:i,layout:t});this.setState((()=>({activeFilterField:null,checkedFilterFields:e,filterScopeMap:{...i,...r}})))}onExpandFilterField(e){void 0===e&&(e=[]),this.setState((()=>({expandedFilterIds:e})))}onChangeFilterField(e){var t;void 0===e&&(e={});const{layout:i}=this.props,r=e.value,{activeFilterField:l,checkedFilterFields:a,filterScopeMap:n}=this.state;if(r===l){const e=O({checkedFilterFields:a,activeFilterField:null,filterScopeMap:n,layout:i});this.setState({activeFilterField:null,filterScopeMap:{...n,...e}})}else if(h()(t=this.allfilterFields).call(t,r)){const e=O({checkedFilterFields:a,activeFilterField:r,filterScopeMap:n,layout:i});this.setState({activeFilterField:r,filterScopeMap:{...n,...e}})}}onSearchInputChange(e){this.setState({searchText:e.target.value},this.filterTree)}onClose(){this.props.onCloseModal()}onSave(){const{filterScopeMap:e}=this.state,t=this.allfilterFields.reduce(((t,i)=>{const{nodes:r}=e[i];return{...t,[i]:z({filterKey:i,nodes:r,checkedChartIds:e[i].checked})}}),{});this.props.updateDashboardFiltersScope(t),this.props.setUnsavedChanges(!0),this.props.onCloseModal()}filterTree(){if(this.state.searchText){const e=e=>{const{activeFilterField:t,checkedFilterFields:i,filterScopeMap:r}=e,l=N({activeFilterField:t,checkedFilterFields:i}),a=r[l].nodes.reduce(this.filterNodes,[]),n=$([...a]),s={...r[l],nodesFiltered:a,expanded:n};return{filterScopeMap:{...r,[l]:s}}};this.setState(e)}else this.setState((e=>{const{activeFilterField:t,checkedFilterFields:i,filterScopeMap:r}=e,l=N({activeFilterField:t,checkedFilterFields:i}),a={...r[l],nodesFiltered:r[l].nodes};return{filterScopeMap:{...r,[l]:a}}}))}filterNodes(e,t){void 0===e&&(e=[]),void 0===t&&(t={});const{searchText:i}=this.state,r=(t.children||[]).reduce(this.filterNodes,[]);return(t.label.toLocaleLowerCase().indexOf(i.toLocaleLowerCase())>-1||r.length)&&e.push({...t,children:r}),e}renderFilterFieldList(){const{activeFilterField:e,filterFieldNodes:t,checkedFilterFields:i,expandedFilterIds:r}=this.state;return(0,b.tZ)(se,{activeKey:e,nodes:t,checked:i,expanded:r,onClick:this.onChangeFilterField,onCheck:this.onCheckFilterField,onExpand:this.onExpandFilterField})}renderFilterScopeTree(){const{filterScopeMap:e,activeFilterField:t,checkedFilterFields:i,searchText:l}=this.state,a=N({activeFilterField:t,checkedFilterFields:i}),n=_({activeFilterField:t,checkedFilterFields:i});return(0,b.tZ)(r.Fragment,null,(0,b.tZ)("input",{className:"filter-text scope-search multi-edit-mode",placeholder:(0,v.t)("Search..."),type:"text",value:l,onChange:this.onSearchInputChange}),(0,b.tZ)(te,{nodes:e[a].nodesFiltered,checked:e[a].checked,expanded:e[a].expanded,onCheck:this.onCheckFilterScope,onExpand:this.onExpandFilterScope,selectedChartId:n}))}renderEditingFiltersName(){const{dashboardFilters:e}=this.props,{activeFilterField:t,checkedFilterFields:i}=this.state,r=[].concat(t||i).map((t=>{const{chartId:i,column:r}=(0,I._)(t);return e[i].labels[r]||r}));return(0,b.tZ)("div",{className:"selected-fields multi-edit-mode"},0===r.length&&(0,v.t)("No filter is selected."),1===r.length&&(0,v.t)("Editing 1 filter:"),r.length>1&&(0,v.t)("Batch editing %d filters:",r.length),(0,b.tZ)("span",{className:"selected-scopes"},r.join(", ")))}render(){const{showSelector:e}=this.state;return(0,b.tZ)(de,null,(0,b.tZ)(he,null,(0,b.tZ)("h4",null,(0,v.t)("Configure filter scopes")),e&&this.renderEditingFiltersName()),(0,b.tZ)(ce,{className:"filter-scope-body"},e?(0,b.tZ)(pe,{className:"filters-scope-selector"},(0,b.tZ)("div",{className:g()("filter-field-pane multi-edit-mode")},this.renderFilterFieldList()),(0,b.tZ)("div",{className:"filter-scope-pane multi-edit-mode"},this.renderFilterScopeTree())):(0,b.tZ)("div",{className:"warning-message"},(0,v.t)("There are no filters in this dashboard."))),(0,b.tZ)(ue,null,(0,b.tZ)(f.Z,{buttonSize:"small",onClick:this.onClose},(0,v.t)("Close")),e&&(0,b.tZ)(f.Z,{buttonSize:"small",buttonStyle:"primary",onClick:this.onSave},(0,v.t)("Save"))))}}me.propTypes=oe;const ge=(0,n.$j)((function(e){let{dashboardLayout:t,dashboardFilters:i}=e;return{dashboardFilters:i,layout:t.present}}),(function(e){return(0,s.DE)({updateDashboardFiltersScope:o.l6,setUnsavedChanges:d.if},e)}))(me),fe=l.iK.div((e=>{let{theme:{gridUnit:t}}=e;return{padding:2*t,paddingBottom:3*t}}));class be extends r.PureComponent{constructor(e){super(e),this.modal=void 0,this.modal=r.createRef(),this.handleCloseModal=this.handleCloseModal.bind(this)}handleCloseModal(){var e,t;null==this||null==(e=this.modal)||null==(t=e.current)||null==t.close||t.close()}render(){const e={onCloseModal:this.handleCloseModal};return(0,b.tZ)(a.Z,{ref:this.modal,triggerNode:this.props.triggerNode,modalBody:(0,b.tZ)(fe,null,(0,b.tZ)(ge,e)),width:"80%"})}}},713:(e,t,i)=>{i.d(t,{Z:()=>a});var r=i(55867),l=i(80621);const a=[{value:l.HE,label:(0,r.t)("Transparent"),className:"background--transparent"},{value:l.b5,label:(0,r.t)("White"),className:"background--white"}]},79271:(e,t,i)=>{i.d(t,{Z:()=>a});var r=i(55867),l=i(80621);const a=[{value:l.u_,label:(0,r.t)("Small"),className:"header-style-option header-small"},{value:l.OE,label:(0,r.t)("Medium"),className:"header-style-option header-medium"},{value:l.pQ,label:(0,r.t)("Large"),className:"header-style-option header-large"}]},33626:(e,t,i)=>{i.d(t,{J:()=>l});var r=i(67294);const l=e=>{(0,r.useEffect)(e,[])}}}]);
//# sourceMappingURL=4717.09d661f36f726eacecb3.entry.js.map