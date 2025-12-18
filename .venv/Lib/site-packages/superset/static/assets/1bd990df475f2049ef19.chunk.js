(globalThis.webpackChunksuperset=globalThis.webpackChunksuperset||[]).push([[665],{45578:(e,t,a)=>{var r=a(67206),l=a(45652);e.exports=function(e,t){return e&&e.length?l(e,r(t,2)):[]}},27989:(e,t,a)=>{"use strict";a.d(t,{Z:()=>h});var r=a(67294),l=a(51995),n=a(55867),o=a(35932),i=a(74069),s=a(4715),d=a(34858),c=a(60972),u=a(11965);const p=l.iK.div`
  display: block;
  color: ${e=>{let{theme:t}=e;return t.colors.grayscale.base}};
  font-size: ${e=>{let{theme:t}=e;return t.typography.sizes.s}}px;
`,m=l.iK.div`
  padding-bottom: ${e=>{let{theme:t}=e;return 2*t.gridUnit}}px;
  padding-top: ${e=>{let{theme:t}=e;return 2*t.gridUnit}}px;

  & > div {
    margin: ${e=>{let{theme:t}=e;return t.gridUnit}}px 0;
  }

  &.extra-container {
    padding-top: 8px;
  }

  .confirm-overwrite {
    margin-bottom: ${e=>{let{theme:t}=e;return 2*t.gridUnit}}px;
  }

  .input-container {
    display: flex;
    align-items: center;

    label {
      display: flex;
      margin-right: ${e=>{let{theme:t}=e;return 2*t.gridUnit}}px;
    }

    i {
      margin: 0 ${e=>{let{theme:t}=e;return t.gridUnit}}px;
    }
  }

  input,
  textarea {
    flex: 1 1 auto;
  }

  textarea {
    height: 160px;
    resize: none;
  }

  input::placeholder,
  textarea::placeholder {
    color: ${e=>{let{theme:t}=e;return t.colors.grayscale.light1}};
  }

  textarea,
  input[type='text'],
  input[type='number'] {
    padding: ${e=>{let{theme:t}=e;return 1.5*t.gridUnit}}px
      ${e=>{let{theme:t}=e;return 2*t.gridUnit}}px;
    border-style: none;
    border: 1px solid ${e=>{let{theme:t}=e;return t.colors.grayscale.light2}};
    border-radius: ${e=>{let{theme:t}=e;return t.gridUnit}}px;

    &[name='name'] {
      flex: 0 1 auto;
      width: 40%;
    }

    &[name='sqlalchemy_uri'] {
      margin-right: ${e=>{let{theme:t}=e;return 3*t.gridUnit}}px;
    }
  }
`,h=e=>{let{resourceName:t,resourceLabel:a,passwordsNeededMessage:l,confirmOverwriteMessage:h,onModelImport:b,show:g,onHide:y,passwordFields:f=[],setPasswordFields:v=(()=>{})}=e;const[Z,w]=(0,r.useState)(!0),[_,x]=(0,r.useState)({}),[S,k]=(0,r.useState)(!1),[C,$]=(0,r.useState)(!1),[E,T]=(0,r.useState)([]),[N,I]=(0,r.useState)(!1),[M,A]=(0,r.useState)(),H=()=>{T([]),v([]),x({}),k(!1),$(!1),I(!1),A("")},{state:{alreadyExists:z,passwordsNeeded:D},importResource:F}=(0,d.PW)(t,a,(e=>{A(e)}));(0,r.useEffect)((()=>{v(D),D.length>0&&I(!1)}),[D,v]),(0,r.useEffect)((()=>{k(z.length>0),z.length>0&&I(!1)}),[z,k]);return Z&&g&&w(!1),(0,u.tZ)(i.Z,{name:"model",className:"import-model-modal",disablePrimaryButton:0===E.length||S&&!C||N,onHandledPrimaryAction:()=>{var e;(null==(e=E[0])?void 0:e.originFileObj)instanceof File&&(I(!0),F(E[0].originFileObj,_,C).then((e=>{e&&(H(),b())})))},onHide:()=>{w(!0),y(),H()},primaryButtonName:S?(0,n.t)("Overwrite"):(0,n.t)("Import"),primaryButtonType:S?"danger":"primary",width:"750px",show:g,title:(0,u.tZ)("h4",null,(0,n.t)("Import %s",a))},(0,u.tZ)(m,null,(0,u.tZ)(s.gq,{name:"modelFile",id:"modelFile",accept:".yaml,.json,.yml,.zip",fileList:E,onChange:e=>{T([{...e.file,status:"done"}])},onRemove:e=>(T(E.filter((t=>t.uid!==e.uid))),!1),customRequest:()=>{},disabled:N},(0,u.tZ)(o.Z,{loading:N},(0,n.t)("Select file")))),M&&(0,u.tZ)(c.Z,{errorMessage:M,showDbInstallInstructions:f.length>0}),0===f.length?null:(0,u.tZ)(r.Fragment,null,(0,u.tZ)("h5",null,(0,n.t)("Database passwords")),(0,u.tZ)(p,null,l),f.map((e=>(0,u.tZ)(m,{key:`password-for-${e}`},(0,u.tZ)("div",{className:"control-label"},e,(0,u.tZ)("span",{className:"required"},"*")),(0,u.tZ)("input",{name:`password-${e}`,autoComplete:`password-${e}`,type:"password",value:_[e],onChange:t=>x({..._,[e]:t.target.value})}))))),S?(0,u.tZ)(r.Fragment,null,(0,u.tZ)(m,null,(0,u.tZ)("div",{className:"confirm-overwrite"},h),(0,u.tZ)("div",{className:"control-label"},(0,n.t)('Type "%s" to confirm',(0,n.t)("OVERWRITE"))),(0,u.tZ)("input",{id:"overwrite",type:"text",onChange:e=>{var t,a;const r=null!=(t=null==(a=e.currentTarget)?void 0:a.value)?t:"";$(r.toUpperCase()===(0,n.t)("OVERWRITE"))}}))):null)}},33320:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>Q});var r=a(45578),l=a.n(r),n=a(51995),o=a(55867),i=a(11064),s=a(31069),d=a(55786),c=a(67294),u=a(15926),p=a.n(u),m=a(30381),h=a.n(m),b=a(91877),g=a(93185),y=a(40768),f=a(34858),v=a(32228),Z=a(19259),w=a(20755),_=a(36674),x=a(73727),S=a(16550),k=a(18782),C=a(63279),$=a(58593),E=a(11965);const T=n.iK.div`
  .link {
    color: ${e=>{let{theme:t}=e;return t.colors.grayscale.light5}};
    display: block;
    text-decoration: underline;
  }
`;function N(e){let{children:t,crossLinks:a=[],moreItems:r,show:l=!1}=e;return(0,E.tZ)($.u,{placement:"top",title:l&&(0,E.tZ)(T,null,a.map((e=>(0,E.tZ)(x.rU,{className:"link",key:e.to,to:e.to,target:"_blank",rel:"noreferer noopener"},e.title))),r&&(0,E.tZ)("span",null,(0,o.t)("+ %s more",r)))},t)}const I=n.iK.div`
  ${e=>{let{theme:t}=e;return`\n    & > span {\n      width: 100%;\n      display: flex;\n\n      .ant-tooltip-open {\n        display: inline;\n      }\n\n      .truncated {\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n        display: inline-block;\n        width: 100%;\n        vertical-align: bottom;\n      }\n\n      .count {\n        cursor: pointer;\n        color: ${t.colors.grayscale.base};\n        font-weight: ${t.typography.weights.bold};\n      }\n    }\n  `}}
`;function M(e){let{crossLinks:t,maxLinks:a=20,linkPrefix:r="/superset/dashboard/"}=e;const l=(0,c.useRef)(null),n=(0,c.useRef)(null),[o,i]=(0,C.ro)(l,n),s=(0,c.useMemo)((()=>t.length>a?t.length-a:void 0),[t,a]),d=(0,c.useMemo)((()=>(0,E.tZ)("span",{className:"truncated",ref:l},t.map(((e,t)=>(0,E.tZ)(x.rU,{key:e.id,to:r+e.id,target:"_blank",rel:"noreferer noopener"},0===t?e.title:`, ${e.title}`))))),[t]),u=(0,c.useMemo)((()=>t.slice(0,a).map((e=>({title:e.title,to:r+e.id})))),[t,a]);return(0,E.tZ)(I,null,(0,E.tZ)(N,{moreItems:s,crossLinks:u,show:!!o},d,i&&(0,E.tZ)("span",{ref:n,className:"count"},"+",o)))}var A=a(38703),H=a(61337),z=a(14114),D=a(83673),F=a(27989),L=a(70163),B=a(1510),U=a(48911),R=a(8272),O=a(79789),P=a(85931),q=a(20292),V=a(94394);const j=n.iK.div`
  align-items: center;
  display: flex;

  a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
  }

  svg {
    margin-right: ${e=>{let{theme:t}=e;return t.gridUnit}}px;
  }
`,K=(0,o.t)('The passwords for the databases below are needed in order to import them together with the charts. Please note that the "Secure Extra" and "Certificate" sections of the database configuration are not present in export files, and should be added manually after the import if they are needed.'),W=(0,o.t)("You are importing one or more charts that already exist. Overwriting might cause you to lose some of your work. Are you sure you want to overwrite?");(0,U.Z)();const Y=(0,i.Z)(),X=async function(e,t,a){var r;void 0===e&&(e="");const n=e?{filters:[{col:"table_name",opr:"sw",value:e}]}:{},o=p().encode({columns:["datasource_name","datasource_id"],keys:["none"],order_column:"table_name",order_direction:"asc",page:t,page_size:a,...n}),{json:i={}}=await s.Z.get({endpoint:`/api/v1/dataset/?q=${o}`}),d=null==i||null==(r=i.result)?void 0:r.map((e=>{let{table_name:t,id:a}=e;return{label:t,value:a}}));return{data:l()(d,"value"),totalCount:null==i?void 0:i.count}},G=n.iK.div`
  color: ${e=>{let{theme:t}=e;return t.colors.grayscale.base}};
`,J=(0,q.Z)(),Q=(0,z.ZP)((function(e){const{addDangerToast:t,addSuccessToast:a,user:{userId:r}}=e,n=(0,S.k6)(),{state:{loading:i,resourceCount:u,resourceCollection:m,bulkSelectEnabled:C},setResourceCollection:T,hasPerm:N,fetchData:I,toggleBulkSelect:z,refreshData:U}=(0,f.Yi)("chart",(0,o.t)("chart"),t),q=(0,c.useMemo)((()=>m.map((e=>e.id))),[m]),[Q,ee]=(0,f.NE)("chart",q,t),{sliceCurrentlyEditing:te,handleChartUpdated:ae,openChartEditModal:re,closeChartEditModal:le}=(0,f.fF)(T,m),[ne,oe]=(0,c.useState)(!1),[ie,se]=(0,c.useState)([]),[de,ce]=(0,c.useState)(!1),ue=(0,H.OH)(null==r?void 0:r.toString(),null),pe=N("can_write"),me=N("can_write"),he=N("can_write"),be=N("can_export")&&(0,b.cr)(g.T.VERSIONED_EXPORT),ge=[{id:"changed_on_delta_humanized",desc:!0}],ye=J.common.conf.ENABLE_BROAD_ACTIVITY_ACCESS,fe=e=>{const t=e.map((e=>{let{id:t}=e;return t}));(0,v.Z)("chart",t,(()=>{ce(!1)})),ce(!0)},ve=e=>null!=e&&e.first_name?`${null==e?void 0:e.first_name} ${null==e?void 0:e.last_name}`:null,Ze=async function(e,a,r){var n,i,d;void 0===e&&(e="");const c=e?{filters:[{col:"dashboards",opr:k.p.relationManyMany,value:e}]}:{},u=p().encode({columns:["dashboard_title","id"],keys:["none"],order_column:"dashboard_title",order_direction:"asc",page:a,page_size:r,...c}),m=await s.Z.get({endpoint:e?`/api/v1/chart/?q=${u}`:`/api/v1/dashboard/?q=${u}`}).catch((()=>t((0,o.t)("An error occurred while fetching dashboards")))),h=null==m||null==(n=m.json)||null==(i=n.result)?void 0:i.map((e=>{let{dashboard_title:t,id:a}=e;return{label:t,value:a}}));return{data:l()(h,"value"),totalCount:null==m||null==(d=m.json)?void 0:d.count}},we=(0,c.useMemo)((()=>[{Cell:e=>{let{row:{original:{id:t}}}=e;return r&&(0,E.tZ)(_.Z,{itemId:t,saveFaveStar:Q,isStarred:ee[t]})},Header:"",id:"id",disableSortBy:!0,size:"xs",hidden:!r},{Cell:e=>{let{row:{original:{url:t,slice_name:a,certified_by:r,certification_details:l,description:n}}}=e;return(0,E.tZ)(j,null,(0,E.tZ)(x.rU,{to:t},r&&(0,E.tZ)(c.Fragment,null,(0,E.tZ)(O.Z,{certifiedBy:r,details:l})," "),a),n&&(0,E.tZ)(R.Z,{tooltip:n,viewBox:"0 -1 24 24"}))},Header:(0,o.t)("Chart"),accessor:"slice_name"},{Cell:e=>{var t;let{row:{original:{viz_type:a}}}=e;return(null==(t=Y.get(a))?void 0:t.name)||a},Header:(0,o.t)("Visualization type"),accessor:"viz_type",size:"xxl"},{Cell:e=>{let{row:{original:{datasource_name_text:t,datasource_url:a}}}=e;return(0,E.tZ)(P.m,{to:a},t)},Header:(0,o.t)("Dataset"),accessor:"datasource_id",disableSortBy:!0,size:"xl"},{Cell:e=>{let{row:{original:{dashboards:t}}}=e;return(0,E.tZ)(M,{crossLinks:(0,d.Z)(t).map((e=>({title:e.dashboard_title,id:e.id})))})},Header:(0,o.t)("Dashboards added to"),accessor:"dashboards",disableSortBy:!0,size:"xxl",hidden:!0},{Cell:e=>{let{row:{original:{last_saved_by:t,changed_by_url:a}}}=e;return ye?(0,E.tZ)("a",{href:a},ve(t)):(0,E.tZ)(c.Fragment,null,ve(t))},Header:(0,o.t)("Modified by"),accessor:"last_saved_by.first_name",size:"xl"},{Cell:e=>{let{row:{original:{last_saved_at:t}}}=e;return(0,E.tZ)("span",{className:"no-wrap"},t?h().utc(t).fromNow():null)},Header:(0,o.t)("Last modified"),accessor:"last_saved_at",size:"xl"},{accessor:"owners",hidden:!0,disableSortBy:!0},{Cell:e=>{let{row:{original:{created_by:t}}}=e;return t?`${t.first_name} ${t.last_name}`:""},Header:(0,o.t)("Created by"),accessor:"created_by",disableSortBy:!0,size:"xl"},{Cell:e=>{let{row:{original:r}}=e;return me||he||be?(0,E.tZ)(G,{className:"actions"},he&&(0,E.tZ)(Z.Z,{title:(0,o.t)("Please confirm"),description:(0,E.tZ)(c.Fragment,null,(0,o.t)("Are you sure you want to delete")," ",(0,E.tZ)("b",null,r.slice_name),"?"),onConfirm:()=>(0,y.Gm)(r,a,t,U)},(e=>(0,E.tZ)($.u,{id:"delete-action-tooltip",title:(0,o.t)("Delete"),placement:"bottom"},(0,E.tZ)("span",{role:"button",tabIndex:0,className:"action-button",onClick:e},(0,E.tZ)(L.Z.Trash,null))))),be&&(0,E.tZ)($.u,{id:"export-action-tooltip",title:(0,o.t)("Export"),placement:"bottom"},(0,E.tZ)("span",{role:"button",tabIndex:0,className:"action-button",onClick:()=>fe([r])},(0,E.tZ)(L.Z.Share,null))),me&&(0,E.tZ)($.u,{id:"edit-action-tooltip",title:(0,o.t)("Edit"),placement:"bottom"},(0,E.tZ)("span",{role:"button",tabIndex:0,className:"action-button",onClick:()=>re(r)},(0,E.tZ)(L.Z.EditAlt,null)))):null},Header:(0,o.t)("Actions"),id:"actions",disableSortBy:!0,hidden:!me&&!he}]),[r,me,he,be,Q,ee,U,a,t]),_e=(0,c.useMemo)((()=>({Header:(0,o.t)("Favorite"),key:"favorite",id:"id",urlDisplay:"favorite",input:"select",operator:k.p.chartIsFav,unfilteredLabel:(0,o.t)("Any"),selects:[{label:(0,o.t)("Yes"),value:!0},{label:(0,o.t)("No"),value:!1}]})),[]),xe=(0,c.useMemo)((()=>[{Header:(0,o.t)("Owner"),key:"owner",id:"owners",input:"select",operator:k.p.relationManyMany,unfilteredLabel:(0,o.t)("All"),fetchSelects:(0,y.tm)("chart","owners",(0,y.v$)((e=>t((0,o.t)("An error occurred while fetching chart owners values: %s",e)))),e.user),paginate:!0},{Header:(0,o.t)("Created by"),key:"created_by",id:"created_by",input:"select",operator:k.p.relationOneMany,unfilteredLabel:(0,o.t)("All"),fetchSelects:(0,y.tm)("chart","created_by",(0,y.v$)((e=>t((0,o.t)("An error occurred while fetching chart created by values: %s",e)))),e.user),paginate:!0},{Header:(0,o.t)("Chart type"),key:"viz_type",id:"viz_type",input:"select",operator:k.p.equals,unfilteredLabel:(0,o.t)("All"),selects:Y.keys().filter((e=>{var t;return(0,B.X3)((null==(t=Y.get(e))?void 0:t.behaviors)||[])})).map((e=>{var t;return{label:(null==(t=Y.get(e))?void 0:t.name)||e,value:e}})).sort(((e,t)=>e.label&&t.label?e.label>t.label?1:e.label<t.label?-1:0:0))},{Header:(0,o.t)("Dataset"),key:"dataset",id:"datasource_id",input:"select",operator:k.p.equals,unfilteredLabel:(0,o.t)("All"),fetchSelects:X,paginate:!0},{Header:(0,o.t)("Dashboards"),key:"dashboards",id:"dashboards",input:"select",operator:k.p.relationManyMany,unfilteredLabel:(0,o.t)("All"),fetchSelects:Ze,paginate:!0},...r?[_e]:[],{Header:(0,o.t)("Certified"),key:"certified",id:"id",urlDisplay:"certified",input:"select",operator:k.p.chartIsCertified,unfilteredLabel:(0,o.t)("Any"),selects:[{label:(0,o.t)("Yes"),value:!0},{label:(0,o.t)("No"),value:!1}]},{Header:(0,o.t)("Search"),key:"search",id:"slice_name",input:"search",operator:k.p.chartAllText}]),[t,_e,e.user]),Se=[{desc:!1,id:"slice_name",label:(0,o.t)("Alphabetical"),value:"alphabetical"},{desc:!0,id:"changed_on_delta_humanized",label:(0,o.t)("Recently modified"),value:"recently_modified"},{desc:!1,id:"changed_on_delta_humanized",label:(0,o.t)("Least recently modified"),value:"least_recently_modified"}],ke=(0,c.useCallback)((e=>(0,E.tZ)(V.Z,{chart:e,showThumbnails:ue?ue.thumbnails:(0,b.cr)(g.T.THUMBNAILS),hasPerm:N,openChartEditModal:re,bulkSelectEnabled:C,addDangerToast:t,addSuccessToast:a,refreshData:U,userId:r,loading:i,favoriteStatus:ee[e.id],saveFavoriteStatus:Q,handleBulkChartExport:fe})),[t,a,C,ee,N,i]),Ce=[];return(he||be)&&Ce.push({name:(0,o.t)("Bulk select"),buttonStyle:"secondary","data-test":"bulk-select",onClick:z}),pe&&(Ce.push({name:(0,E.tZ)(c.Fragment,null,(0,E.tZ)("i",{className:"fa fa-plus"})," ",(0,o.t)("Chart")),buttonStyle:"primary",onClick:()=>{n.push("/chart/add")}}),(0,b.cr)(g.T.VERSIONED_EXPORT)&&Ce.push({name:(0,E.tZ)($.u,{id:"import-tooltip",title:(0,o.t)("Import charts"),placement:"bottomRight"},(0,E.tZ)(L.Z.Import,null)),buttonStyle:"link",onClick:()=>{oe(!0)}})),(0,E.tZ)(c.Fragment,null,(0,E.tZ)(w.Z,{name:(0,o.t)("Charts"),buttons:Ce}),te&&(0,E.tZ)(D.Z,{onHide:le,onSave:ae,show:!0,slice:te}),(0,E.tZ)(Z.Z,{title:(0,o.t)("Please confirm"),description:(0,o.t)("Are you sure you want to delete the selected charts?"),onConfirm:function(e){s.Z.delete({endpoint:`/api/v1/chart/?q=${p().encode(e.map((e=>{let{id:t}=e;return t})))}`}).then((e=>{let{json:t={}}=e;U(),a(t.message)}),(0,y.v$)((e=>t((0,o.t)("There was an issue deleting the selected charts: %s",e)))))}},(e=>{const t=[];return he&&t.push({key:"delete",name:(0,o.t)("Delete"),type:"danger",onSelect:e}),be&&t.push({key:"export",name:(0,o.t)("Export"),type:"primary",onSelect:fe}),(0,E.tZ)(k.Z,{bulkActions:t,bulkSelectEnabled:C,cardSortSelectOptions:Se,className:"chart-list-view",columns:we,count:u,data:m,disableBulkSelect:z,fetchData:I,filters:xe,initialSort:ge,loading:i,pageSize:25,renderCard:ke,showThumbnails:ue?ue.thumbnails:(0,b.cr)(g.T.THUMBNAILS),defaultViewMode:(0,b.cr)(g.T.LISTVIEWS_DEFAULT_CARD_VIEW)?"card":"table"})})),(0,E.tZ)(F.Z,{resourceName:"chart",resourceLabel:(0,o.t)("chart"),passwordsNeededMessage:K,confirmOverwriteMessage:W,addDangerToast:t,addSuccessToast:a,onModelImport:()=>{oe(!1),U(),a((0,o.t)("Chart imported"))},show:ne,onHide:()=>{oe(!1)},passwordFields:ie,setPasswordFields:se}),de&&(0,E.tZ)(A.Z,null))}))}}]);
//# sourceMappingURL=1bd990df475f2049ef19.chunk.js.map