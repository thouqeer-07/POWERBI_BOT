"use strict";(globalThis.webpackChunksuperset=globalThis.webpackChunksuperset||[]).push([[8774],{27989:(e,t,a)=>{a.d(t,{Z:()=>p});var r=a(67294),l=a(51995),n=a(55867),o=a(35932),i=a(74069),s=a(4715),d=a(34858),u=a(60972),c=a(11965);const h=l.iK.div`
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
`,p=e=>{let{resourceName:t,resourceLabel:a,passwordsNeededMessage:l,confirmOverwriteMessage:p,onModelImport:b,show:g,onHide:y,passwordFields:f=[],setPasswordFields:Z=(()=>{})}=e;const[_,w]=(0,r.useState)(!0),[v,S]=(0,r.useState)({}),[x,C]=(0,r.useState)(!1),[k,E]=(0,r.useState)(!1),[I,T]=(0,r.useState)([]),[D,A]=(0,r.useState)(!1),[N,$]=(0,r.useState)(),H=()=>{T([]),Z([]),S({}),C(!1),E(!1),A(!1),$("")},{state:{alreadyExists:F,passwordsNeeded:M},importResource:O}=(0,d.PW)(t,a,(e=>{$(e)}));(0,r.useEffect)((()=>{Z(M),M.length>0&&A(!1)}),[M,Z]),(0,r.useEffect)((()=>{C(F.length>0),F.length>0&&A(!1)}),[F,C]);return _&&g&&w(!1),(0,c.tZ)(i.Z,{name:"model",className:"import-model-modal",disablePrimaryButton:0===I.length||x&&!k||D,onHandledPrimaryAction:()=>{var e;(null==(e=I[0])?void 0:e.originFileObj)instanceof File&&(A(!0),O(I[0].originFileObj,v,k).then((e=>{e&&(H(),b())})))},onHide:()=>{w(!0),y(),H()},primaryButtonName:x?(0,n.t)("Overwrite"):(0,n.t)("Import"),primaryButtonType:x?"danger":"primary",width:"750px",show:g,title:(0,c.tZ)("h4",null,(0,n.t)("Import %s",a))},(0,c.tZ)(m,null,(0,c.tZ)(s.gq,{name:"modelFile",id:"modelFile",accept:".yaml,.json,.yml,.zip",fileList:I,onChange:e=>{T([{...e.file,status:"done"}])},onRemove:e=>(T(I.filter((t=>t.uid!==e.uid))),!1),customRequest:()=>{},disabled:D},(0,c.tZ)(o.Z,{loading:D},(0,n.t)("Select file")))),N&&(0,c.tZ)(u.Z,{errorMessage:N,showDbInstallInstructions:f.length>0}),0===f.length?null:(0,c.tZ)(r.Fragment,null,(0,c.tZ)("h5",null,(0,n.t)("Database passwords")),(0,c.tZ)(h,null,l),f.map((e=>(0,c.tZ)(m,{key:`password-for-${e}`},(0,c.tZ)("div",{className:"control-label"},e,(0,c.tZ)("span",{className:"required"},"*")),(0,c.tZ)("input",{name:`password-${e}`,autoComplete:`password-${e}`,type:"password",value:v[e],onChange:t=>S({...v,[e]:t.target.value})}))))),x?(0,c.tZ)(r.Fragment,null,(0,c.tZ)(m,null,(0,c.tZ)("div",{className:"confirm-overwrite"},p),(0,c.tZ)("div",{className:"control-label"},(0,n.t)('Type "%s" to confirm',(0,n.t)("OVERWRITE"))),(0,c.tZ)("input",{id:"overwrite",type:"text",onChange:e=>{var t,a;const r=null!=(t=null==(a=e.currentTarget)?void 0:a.value)?t:"";E(r.toUpperCase()===(0,n.t)("OVERWRITE"))}}))):null)}},23767:(e,t,a)=>{a.r(t),a.d(t,{default:()=>O});var r,l=a(55867),n=a(51995),o=a(31069),i=a(67294),s=a(73727),d=a(15926),u=a.n(d),c=a(91877),h=a(93185),m=a(40768),p=a(34858),b=a(19259),g=a(32228),y=a(38703),f=a(20755),Z=a(18782),_=a(61337),w=a(14114),v=a(34581),S=a(70163),x=a(17198),C=a(36674),k=a(20818),E=a(58593),I=a(27989),T=a(79789),D=a(20292),A=a(99415);!function(e){e.PUBLISHED="published",e.DRAFT="draft"}(r||(r={}));var N=a(11965);const $=(0,l.t)('The passwords for the databases below are needed in order to import them together with the dashboards. Please note that the "Secure Extra" and "Certificate" sections of the database configuration are not present in export files, and should be added manually after the import if they are needed.'),H=(0,l.t)("You are importing one or more dashboards that already exist. Overwriting might cause you to lose some of your work. Are you sure you want to overwrite?"),F=n.iK.div`
  color: ${e=>{let{theme:t}=e;return t.colors.grayscale.base}};
`,M=(0,D.Z)(),O=(0,w.ZP)((function(e){var t,a;const{addDangerToast:n,addSuccessToast:d,user:{userId:w}}=e,{state:{loading:D,resourceCount:O,resourceCollection:z,bulkSelectEnabled:B},setResourceCollection:P,hasPerm:R,fetchData:U,toggleBulkSelect:L,refreshData:V}=(0,p.Yi)("dashboard",(0,l.t)("dashboard"),n),j=(0,i.useMemo)((()=>z.map((e=>e.id))),[z]),[q,W]=(0,p.NE)("dashboard",j,n),[Y,K]=(0,i.useState)(null),[X,G]=(0,i.useState)(null),[J,Q]=(0,i.useState)(!1),[ee,te]=(0,i.useState)([]),[ae,re]=(0,i.useState)(!1),le=null==M||null==(t=M.common)||null==(a=t.conf)?void 0:a.ENABLE_BROAD_ACTIVITY_ACCESS,ne=(0,_.OH)(null==w?void 0:w.toString(),null),oe=R("can_write"),ie=R("can_write"),se=R("can_write"),de=R("can_export")&&(0,c.cr)(h.T.VERSIONED_EXPORT),ue=[{id:"changed_on_delta_humanized",desc:!0}];function ce(e){K(e)}function he(e){return o.Z.get({endpoint:`/api/v1/dashboard/${e.id}`}).then((e=>{let{json:t={}}=e;P(z.map((e=>{var a;if(e.id===(null==t||null==(a=t.result)?void 0:a.id)){const{changed_by_name:a,changed_by_url:r,changed_by:l,dashboard_title:n="",slug:o="",json_metadata:i="",changed_on_delta_humanized:s,url:d="",certified_by:u="",certification_details:c="",owners:h}=t.result;return{...e,changed_by_name:a,changed_by_url:r,changed_by:l,dashboard_title:n,slug:o,json_metadata:i,changed_on_delta_humanized:s,url:d,certified_by:u,certification_details:c,owners:h}}return e})))}),(0,m.v$)((e=>n((0,l.t)("An error occurred while fetching dashboards: %s",e)))))}const me=e=>{const t=e.map((e=>{let{id:t}=e;return t}));(0,g.Z)("dashboard",t,(()=>{re(!1)})),re(!0)},pe=(0,i.useMemo)((()=>[{Cell:e=>{let{row:{original:{id:t}}}=e;return w&&(0,N.tZ)(C.Z,{itemId:t,saveFaveStar:q,isStarred:W[t]})},Header:"",id:"id",disableSortBy:!0,size:"xs",hidden:!w},{Cell:e=>{let{row:{original:{url:t,dashboard_title:a,certified_by:r,certification_details:l}}}=e;return(0,N.tZ)(s.rU,{to:t},r&&(0,N.tZ)(i.Fragment,null,(0,N.tZ)(T.Z,{certifiedBy:r,details:l})," "),a)},Header:(0,l.t)("Title"),accessor:"dashboard_title"},{Cell:e=>{let{row:{original:{changed_by_name:t,changed_by_url:a}}}=e;return le?(0,N.tZ)("a",{href:a},t):(0,N.tZ)(i.Fragment,null,t)},Header:(0,l.t)("Modified by"),accessor:"changed_by.first_name",size:"xl"},{Cell:e=>{let{row:{original:{status:t}}}=e;return t===r.PUBLISHED?(0,l.t)("Published"):(0,l.t)("Draft")},Header:(0,l.t)("Status"),accessor:"published",size:"xl"},{Cell:e=>{let{row:{original:{changed_on_delta_humanized:t}}}=e;return(0,N.tZ)("span",{className:"no-wrap"},t)},Header:(0,l.t)("Modified"),accessor:"changed_on_delta_humanized",size:"xl"},{Cell:e=>{let{row:{original:{created_by:t}}}=e;return t?`${t.first_name} ${t.last_name}`:""},Header:(0,l.t)("Created by"),accessor:"created_by",disableSortBy:!0,size:"xl"},{Cell:e=>{let{row:{original:{owners:t=[]}}}=e;return(0,N.tZ)(v.Z,{users:t})},Header:(0,l.t)("Owners"),accessor:"owners",disableSortBy:!0,size:"xl"},{Cell:e=>{let{row:{original:t}}=e;return(0,N.tZ)(F,{className:"actions"},se&&(0,N.tZ)(b.Z,{title:(0,l.t)("Please confirm"),description:(0,N.tZ)(i.Fragment,null,(0,l.t)("Are you sure you want to delete")," ",(0,N.tZ)("b",null,t.dashboard_title),"?"),onConfirm:()=>(0,m.Iu)(t,V,d,n)},(e=>(0,N.tZ)(E.u,{id:"delete-action-tooltip",title:(0,l.t)("Delete"),placement:"bottom"},(0,N.tZ)("span",{role:"button",tabIndex:0,className:"action-button",onClick:e},(0,N.tZ)(S.Z.Trash,null))))),de&&(0,N.tZ)(E.u,{id:"export-action-tooltip",title:(0,l.t)("Export"),placement:"bottom"},(0,N.tZ)("span",{role:"button",tabIndex:0,className:"action-button",onClick:()=>me([t])},(0,N.tZ)(S.Z.Share,null))),ie&&(0,N.tZ)(E.u,{id:"edit-action-tooltip",title:(0,l.t)("Edit"),placement:"bottom"},(0,N.tZ)("span",{role:"button",tabIndex:0,className:"action-button",onClick:()=>ce(t)},(0,N.tZ)(S.Z.EditAlt,null))))},Header:(0,l.t)("Actions"),id:"actions",hidden:!ie&&!se&&!de,disableSortBy:!0}]),[w,ie,se,de,q,W,V,d,n]),be=(0,i.useMemo)((()=>({Header:(0,l.t)("Favorite"),key:"favorite",id:"id",urlDisplay:"favorite",input:"select",operator:Z.p.dashboardIsFav,unfilteredLabel:(0,l.t)("Any"),selects:[{label:(0,l.t)("Yes"),value:!0},{label:(0,l.t)("No"),value:!1}]})),[]),ge=(0,i.useMemo)((()=>[{Header:(0,l.t)("Search"),key:"search",id:"dashboard_title",input:"search",operator:Z.p.titleOrSlug},{Header:(0,l.t)("Owner"),key:"owner",id:"owners",input:"select",operator:Z.p.relationManyMany,unfilteredLabel:(0,l.t)("All"),fetchSelects:(0,m.tm)("dashboard","owners",(0,m.v$)((e=>n((0,l.t)("An error occurred while fetching dashboard owner values: %s",e)))),e.user),paginate:!0},{Header:(0,l.t)("Created by"),key:"created_by",id:"created_by",input:"select",operator:Z.p.relationOneMany,unfilteredLabel:(0,l.t)("All"),fetchSelects:(0,m.tm)("dashboard","created_by",(0,m.v$)((e=>n((0,l.t)("An error occurred while fetching dashboard created by values: %s",e)))),e.user),paginate:!0},{Header:(0,l.t)("Status"),key:"published",id:"published",input:"select",operator:Z.p.equals,unfilteredLabel:(0,l.t)("Any"),selects:[{label:(0,l.t)("Published"),value:!0},{label:(0,l.t)("Draft"),value:!1}]},...w?[be]:[],{Header:(0,l.t)("Certified"),key:"certified",id:"id",urlDisplay:"certified",input:"select",operator:Z.p.dashboardIsCertified,unfilteredLabel:(0,l.t)("Any"),selects:[{label:(0,l.t)("Yes"),value:!0},{label:(0,l.t)("No"),value:!1}]}]),[n,be,e.user]),ye=[{desc:!1,id:"dashboard_title",label:(0,l.t)("Alphabetical"),value:"alphabetical"},{desc:!0,id:"changed_on_delta_humanized",label:(0,l.t)("Recently modified"),value:"recently_modified"},{desc:!1,id:"changed_on_delta_humanized",label:(0,l.t)("Least recently modified"),value:"least_recently_modified"}],fe=(0,i.useCallback)((e=>(0,N.tZ)(A.Z,{dashboard:e,hasPerm:R,bulkSelectEnabled:B,showThumbnails:ne?ne.thumbnails:(0,c.cr)(h.T.THUMBNAILS),userId:w,loading:D,openDashboardEditModal:ce,saveFavoriteStatus:q,favoriteStatus:W[e.id],handleBulkDashboardExport:me,onDelete:e=>G(e)})),[B,W,R,D,w,q,ne]),Ze=[];return(se||de)&&Ze.push({name:(0,l.t)("Bulk select"),buttonStyle:"secondary","data-test":"bulk-select",onClick:L}),oe&&(Ze.push({name:(0,N.tZ)(i.Fragment,null,(0,N.tZ)("i",{className:"fa fa-plus"})," ",(0,l.t)("Dashboard")),buttonStyle:"primary",onClick:()=>{window.location.assign("/dashboard/new")}}),(0,c.cr)(h.T.VERSIONED_EXPORT)&&Ze.push({name:(0,N.tZ)(E.u,{id:"import-tooltip",title:(0,l.t)("Import dashboards"),placement:"bottomRight"},(0,N.tZ)(S.Z.Import,null)),buttonStyle:"link",onClick:()=>{Q(!0)}})),(0,N.tZ)(i.Fragment,null,(0,N.tZ)(f.Z,{name:(0,l.t)("Dashboards"),buttons:Ze}),(0,N.tZ)(b.Z,{title:(0,l.t)("Please confirm"),description:(0,l.t)("Are you sure you want to delete the selected dashboards?"),onConfirm:function(e){return o.Z.delete({endpoint:`/api/v1/dashboard/?q=${u().encode(e.map((e=>{let{id:t}=e;return t})))}`}).then((e=>{let{json:t={}}=e;V(),d(t.message)}),(0,m.v$)((e=>n((0,l.t)("There was an issue deleting the selected dashboards: ",e)))))}},(e=>{const t=[];return se&&t.push({key:"delete",name:(0,l.t)("Delete"),type:"danger",onSelect:e}),de&&t.push({key:"export",name:(0,l.t)("Export"),type:"primary",onSelect:me}),(0,N.tZ)(i.Fragment,null,Y&&(0,N.tZ)(k.Z,{dashboardId:Y.id,show:!0,onHide:()=>K(null),onSubmit:he}),X&&(0,N.tZ)(x.Z,{description:(0,N.tZ)(i.Fragment,null,(0,l.t)("Are you sure you want to delete")," ",(0,N.tZ)("b",null,X.dashboard_title),"?"),onConfirm:()=>{(0,m.Iu)(X,V,d,n,void 0,w),G(null)},onHide:()=>G(null),open:!!X,title:(0,l.t)("Please confirm")}),(0,N.tZ)(Z.Z,{bulkActions:t,bulkSelectEnabled:B,cardSortSelectOptions:ye,className:"dashboard-list-view",columns:pe,count:O,data:z,disableBulkSelect:L,fetchData:U,filters:ge,initialSort:ue,loading:D,pageSize:25,showThumbnails:ne?ne.thumbnails:(0,c.cr)(h.T.THUMBNAILS),renderCard:fe,defaultViewMode:(0,c.cr)(h.T.LISTVIEWS_DEFAULT_CARD_VIEW)?"card":"table"}))})),(0,N.tZ)(I.Z,{resourceName:"dashboard",resourceLabel:(0,l.t)("dashboard"),passwordsNeededMessage:$,confirmOverwriteMessage:H,addDangerToast:n,addSuccessToast:d,onModelImport:()=>{Q(!1),V(),d((0,l.t)("Dashboard imported"))},show:J,onHide:()=>{Q(!1)},passwordFields:ee,setPasswordFields:te}),ae&&(0,N.tZ)(y.Z,null))}))}}]);
//# sourceMappingURL=a968fa323e1bd7dabe65.chunk.js.map