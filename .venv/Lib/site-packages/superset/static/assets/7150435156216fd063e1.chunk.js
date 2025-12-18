"use strict";(globalThis.webpackChunksuperset=globalThis.webpackChunksuperset||[]).push([[2923],{32657:(e,t,n)=>{n.d(t,{Z:()=>de});var r,a=n(28216),i=n(14890),o=n(52256),l=n(97381),s=n(5872),d=n.n(s),c=n(45697),u=n.n(c),h=n(67294),p=n(55867),m=n(51995),g=n(68492),v=n(55786),b=n(91877),f=n(93185),y=n(9531),Z=n(38703),x=n(94301),S=n(57902),C=n(3741),w=n(27600),T=n(23525),k=n(71894);!function(e){e.Explore="explore",e.Dashboard="dashboard"}(r||(r={}));var D=n(42190),$=n(18446),I=n.n($),M=n(42933),_=n.n(M),R=n(16355),F=n(11064),E=n(88274),O=n(11965),A=n(90731),U=n(12617),z=n(83862),N=n(4715),P=n(41814),L=n(69175);const q=(e,t)=>{let{id:n,formData:r,onSelection:i,onClose:o}=e;const l=(0,a.v9)((e=>{var t;return(0,U.R)("can_explore","Superset",null==(t=e.user)?void 0:t.roles)})),[{filters:s,clientX:d,clientY:c},u]=(0,h.useState)({clientX:0,clientY:0}),p=[],m=(0,f.c)(f.T.DRILL_TO_DETAIL)&&l;m&&p.push((0,O.tZ)(P.p,{chartId:n,formData:r,filters:s,isContextMenu:!0,contextMenuY:c,onSelection:i}));const g=(0,h.useCallback)(((e,t,r)=>{var a;const i=[m?2:0].reduce(((e,t)=>e+t),0)||1,o=(0,L.$)(t,i);u({clientX:e,clientY:o,filters:r}),null==(a=document.getElementById(`hidden-span-${n}`))||a.click()}),[n,m]);return(0,h.useImperativeHandle)(t,(()=>({open:g})),[g]),A.createPortal((0,O.tZ)(N.Gj,{overlay:(0,O.tZ)(z.v,null,p.length?p:(0,O.tZ)(z.v.Item,{disabled:!0},"No actions")),trigger:["click"],onVisibleChange:e=>!e&&o()},(0,O.tZ)("span",{id:`hidden-span-${n}`,css:(0,O.iv)({visibility:"hidden",position:"fixed",top:c,left:d,width:1,height:1},"","")})),document.body)},V=(0,h.forwardRef)(q),j={annotationData:u().object,actions:u().object,chartId:u().number.isRequired,datasource:u().object,initialValues:u().object,formData:u().object.isRequired,latestQueryFormData:u().object,labelColors:u().object,sharedLabelColors:u().object,height:u().number,width:u().number,setControlValue:u().func,vizType:u().string.isRequired,triggerRender:u().bool,chartAlert:u().string,chartStatus:u().string,queriesResponse:u().arrayOf(u().object),triggerQuery:u().bool,chartIsStale:u().bool,addFilter:u().func,setDataMask:u().func,onFilterMenuOpen:u().func,onFilterMenuClose:u().func,ownState:u().object,postTransformProps:u().func,source:u().oneOf([r.Dashboard,r.Explore]),emitCrossFilters:u().bool},B={},H=[R.cg.INTERACTIVE_CHART],K={addFilter:()=>B,onFilterMenuOpen:()=>B,onFilterMenuClose:()=>B,initialValues:B,setControlValue(){},triggerRender:!1};class W extends h.Component{constructor(e){super(e),this.state={showContextMenu:e.source===r.Dashboard&&(0,f.c)(f.T.DRILL_TO_DETAIL),inContextMenu:!1},this.hasQueryResponseChange=!1,this.contextMenuRef=h.createRef(),this.handleAddFilter=this.handleAddFilter.bind(this),this.handleRenderSuccess=this.handleRenderSuccess.bind(this),this.handleRenderFailure=this.handleRenderFailure.bind(this),this.handleSetControlValue=this.handleSetControlValue.bind(this),this.handleOnContextMenu=this.handleOnContextMenu.bind(this),this.handleContextMenuSelected=this.handleContextMenuSelected.bind(this),this.handleContextMenuClosed=this.handleContextMenuClosed.bind(this),this.onContextMenuFallback=this.onContextMenuFallback.bind(this),this.hooks={onAddFilter:this.handleAddFilter,onContextMenu:this.state.showContextMenu?this.handleOnContextMenu:void 0,onError:this.handleRenderFailure,setControlValue:this.handleSetControlValue,onFilterMenuOpen:this.props.onFilterMenuOpen,onFilterMenuClose:this.props.onFilterMenuClose,setDataMask:e=>{var t;null==(t=this.props.actions)||t.updateDataMask(this.props.chartId,e)}}}shouldComponentUpdate(e,t){var n,r;return!(!(e.queriesResponse&&["success","rendered"].indexOf(e.chartStatus)>-1)||null!=(n=e.queriesResponse)&&null!=(r=n[0])&&r.error)&&(!I()(this.state,t)||(this.hasQueryResponseChange=e.queriesResponse!==this.props.queriesResponse,this.hasQueryResponseChange||!I()(e.datasource,this.props.datasource)||e.annotationData!==this.props.annotationData||e.ownState!==this.props.ownState||e.filterState!==this.props.filterState||e.height!==this.props.height||e.width!==this.props.width||e.triggerRender||e.labelColors!==this.props.labelColors||e.sharedLabelColors!==this.props.sharedLabelColors||e.formData.color_scheme!==this.props.formData.color_scheme||e.formData.stack!==this.props.formData.stack||e.cacheBusterProp!==this.props.cacheBusterProp||e.emitCrossFilters!==this.props.emitCrossFilters))}handleAddFilter(e,t,n,r){void 0===n&&(n=!0),void 0===r&&(r=!0),this.props.addFilter(e,t,n,r)}handleRenderSuccess(){const{actions:e,chartStatus:t,chartId:n,vizType:r}=this.props;["loading","rendered"].indexOf(t)<0&&e.chartRenderingSucceeded(n),this.hasQueryResponseChange&&e.logEvent(C.aD,{slice_id:n,viz_type:r,start_offset:this.renderStartTime,ts:(new Date).getTime(),duration:C.Yd.getTimestamp()-this.renderStartTime})}handleRenderFailure(e,t){const{actions:n,chartId:r}=this.props;g.Z.warn(e),n.chartRenderingFailed(e.toString(),r,t?t.componentStack:null),this.hasQueryResponseChange&&n.logEvent(C.aD,{slice_id:r,has_err:!0,error_details:e.toString(),start_offset:this.renderStartTime,ts:(new Date).getTime(),duration:C.Yd.getTimestamp()-this.renderStartTime})}handleSetControlValue(){const{setControlValue:e}=this.props;e&&e(...arguments)}handleOnContextMenu(e,t,n){this.contextMenuRef.current.open(e,t,n),this.setState({inContextMenu:!0})}handleContextMenuSelected(){this.setState({inContextMenu:!1})}handleContextMenuClosed(){this.setState({inContextMenu:!1})}onContextMenuFallback(e){this.state.inContextMenu||(e.preventDefault(),this.handleOnContextMenu(e.clientX,e.clientY))}render(){var e;const{chartAlert:t,chartStatus:n,chartId:a,emitCrossFilters:i}=this.props;if("loading"===n||t||null===n)return null;this.renderStartTime=C.Yd.getTimestamp();const{width:o,height:l,datasource:s,annotationData:c,initialValues:u,ownState:m,filterState:g,chartIsStale:v,formData:b,latestQueryFormData:f,queriesResponse:y,postTransformProps:Z}=this.props,S=v&&f?f:b,w=S.viz_type||this.props.vizType,T=_()(w),k="table"===w?`superset-chart-${T}`:T;let D;const $=(0,p.t)("No results were returned for this query"),I=this.props.source===r.Explore?(0,p.t)("Make sure that the controls are configured properly and the datasource contains data for the selected time range"):void 0,M="chart.svg";D=o>300&&l>220?(0,O.tZ)(x.XJ,{title:$,description:I,image:M}):(0,O.tZ)(x.Tc,{title:$,image:M});const A=null!=(e=(0,F.Z)().get(b.viz_type))&&e.behaviors.find((e=>e===R.cg.DRILL_TO_DETAIL))?{inContextMenu:this.state.inContextMenu}:{};return(0,O.tZ)(h.Fragment,null,this.state.showContextMenu&&(0,O.tZ)(V,{ref:this.contextMenuRef,id:a,formData:S,onSelection:this.handleContextMenuSelected,onClose:this.handleContextMenuClosed}),(0,O.tZ)("div",{onContextMenu:this.state.showContextMenu?this.onContextMenuFallback:void 0},(0,O.tZ)(E.Z,d()({disableErrorBoundary:!0,key:`${a}`,id:`chart-id-${a}`,className:k,chartType:w,width:o,height:l,annotationData:c,datasource:s,initialValues:u,formData:S,ownState:m,filterState:g,hooks:this.hooks,behaviors:H,queriesData:y,onRenderSuccess:this.handleRenderSuccess,onRenderFailure:this.handleRenderFailure,noResults:D,postTransformProps:Z,emitCrossFilters:i},A))))}}W.propTypes=j,W.defaultProps=K;const Q=W;var G=n(42582),Y=n(72875);const J=e=>{let{chartId:t,error:n,...r}=e;const{result:a}=(0,G.hb)(t),i=n&&{...n,extra:{...n.extra,owners:a}};return(0,O.tZ)(Y.Z,d()({},r,{error:i}))};var X=n(75701);const ee={annotationData:u().object,actions:u().object,chartId:u().number.isRequired,datasource:u().object,dashboardId:u().number,initialValues:u().object,formData:u().object.isRequired,labelColors:u().object,sharedLabelColors:u().object,width:u().number,height:u().number,setControlValue:u().func,timeout:u().number,vizType:u().string.isRequired,triggerRender:u().bool,force:u().bool,isFiltersInitialized:u().bool,isDeactivatedViz:u().bool,chartAlert:u().string,chartStatus:u().string,chartStackTrace:u().string,queriesResponse:u().arrayOf(u().object),triggerQuery:u().bool,chartIsStale:u().bool,errorMessage:u().node,addFilter:u().func,onQuery:u().func,onFilterMenuOpen:u().func,onFilterMenuClose:u().func,ownState:u().object,postTransformProps:u().func,datasetsStatus:u().oneOf(["loading","error","complete"]),isInView:u().bool,emitCrossFilters:u().bool},te={},ne=(0,p.t)("The dataset associated with this chart no longer exists"),re={addFilter:()=>te,onFilterMenuOpen:()=>te,onFilterMenuClose:()=>te,initialValues:te,setControlValue(){},triggerRender:!1,dashboardId:null,chartStackTrace:null,isDeactivatedViz:!1,force:!1,isInView:!0},ae=m.iK.div`
  min-height: ${e=>e.height}px;
  position: relative;

  .chart-tooltip {
    opacity: 0.75;
    font-size: ${e=>{let{theme:t}=e;return t.typography.sizes.s}}px;
  }

  .slice_container {
    height: ${e=>e.height}px;

    .pivot_table tbody tr {
      font-feature-settings: 'tnum' 1;
    }

    .alert {
      margin: ${e=>{let{theme:t}=e;return 2*t.gridUnit}}px;
    }
  }
`,ie=m.iK.div`
  font-family: ${e=>{let{theme:t}=e;return t.typography.families.monospace}};
  word-break: break-word;
  overflow-x: auto;
  white-space: pre-wrap;
`;class oe extends h.PureComponent{constructor(e){super(e),this.handleRenderContainerFailure=this.handleRenderContainerFailure.bind(this)}componentDidMount(){this.props.triggerQuery&&"UNDECIDED"!==this.props.filterboxMigrationState&&this.runQuery()}componentDidUpdate(){if(this.props.triggerQuery&&"UNDECIDED"!==this.props.filterboxMigrationState){if(this.props.isDeactivatedViz&&this.props.queriesResponse)return;this.runQuery()}}runQuery(){this.props.chartId>0&&(0,b.cr)(f.T.CLIENT_CACHE)?this.props.actions.getSavedChart(this.props.formData,this.props.force||(0,T.eY)(w.KD.force),this.props.timeout,this.props.chartId,this.props.dashboardId,this.props.ownState):this.props.actions.postChartFormData(this.props.formData,this.props.force||(0,T.eY)(w.KD.force),this.props.timeout,this.props.chartId,this.props.dashboardId,this.props.ownState)}handleRenderContainerFailure(e,t){const{actions:n,chartId:r}=this.props;g.Z.warn(e),n.chartRenderingFailed(e.toString(),r,t?t.componentStack:null),n.logEvent(C.aD,{slice_id:r,has_err:!0,error_details:e.toString(),start_offset:this.renderStartTime,ts:(new Date).getTime(),duration:C.Yd.getTimestamp()-this.renderStartTime})}renderErrorMessage(e){var t;const{chartId:n,chartAlert:a,chartStackTrace:i,datasource:o,dashboardId:l,height:s,datasetsStatus:d}=this.props,c=null==e||null==(t=e.errors)?void 0:t[0],u=a||(null==e?void 0:e.message);return void 0!==a&&a!==ne&&o===y.tw&&d!==D.ni.ERROR?(0,O.tZ)(ae,{key:n,"data-ui-anchor":"chart",className:"chart-container",height:s},(0,O.tZ)(Z.Z,null)):(0,O.tZ)(J,{key:n,chartId:n,error:c,subtitle:(0,O.tZ)(ie,null,u),copyText:u,link:e?e.link:null,source:l?r.Dashboard:r.Explore,stackTrace:i})}render(){const{height:e,chartAlert:t,chartStatus:n,errorMessage:r,chartIsStale:a,queriesResponse:i=[],isDeactivatedViz:o=!1,width:l}=this.props,s="loading"===n;return this.renderContainerStartTime=C.Yd.getTimestamp(),"failed"===n?i.map((e=>this.renderErrorMessage(e))):r&&0===(0,v.Z)(i).length?(0,O.tZ)(x.XJ,{title:(0,p.t)("Add required control values to preview chart"),description:(0,X.J)(!0),image:"chart.svg"}):s||t||r||!a||0!==(0,v.Z)(i).length?(0,O.tZ)(S.Z,{onError:this.handleRenderContainerFailure,showMessage:!1},(0,O.tZ)(ae,{"data-ui-anchor":"chart",className:"chart-container",height:e,width:l},(0,O.tZ)("div",{className:"slice_container"},this.props.isInView||!(0,b.cr)(f.T.DASHBOARD_VIRTUALIZATION)||(0,k.b)()?(0,O.tZ)(Q,d()({},this.props,{source:this.props.dashboardId?"dashboard":"explore"})):(0,O.tZ)(Z.Z,null)),s&&!o&&(0,O.tZ)(Z.Z,null))):(0,O.tZ)(x.XJ,{title:(0,p.t)("Your chart is ready to go!"),description:(0,O.tZ)("span",null,(0,p.t)('Click on "Create chart" button in the control panel on the left to preview a visualization or')," ",(0,O.tZ)("span",{role:"button",tabIndex:0,onClick:this.props.onQuery},(0,p.t)("click here")),"."),image:"chart.svg"})}}oe.propTypes=ee,oe.defaultProps=re;const le=oe;var se=n(74599);const de=(0,a.$j)(null,(function(e){return{actions:(0,i.DE)({...o,updateDataMask:se.eG,logEvent:l.logEvent},e)}}))(le)},96022:(e,t,n)=>{n.d(t,{ZN:()=>B,gT:()=>K});var r=n(78580),a=n.n(r),i=n(67294),o=n(28216),l=n(51995),s=n(11965),d=n(55867),c=n(70163),u=n(83862),h=n(1304),p=n(35932),m=n(14114),g=n(12515),v=n(56727),b=n(23525),f=n(10222),y=n(97634),Z=n(91877),x=n(93185),S=n(15423),C=n(9875),w=n(13433),T=n(27600),k=n(50909);const D=(0,l.iK)(k.qi)`
  && {
    margin: 0 0 ${e=>{let{theme:t}=e;return t.gridUnit}}px;
  }
`,$=e=>{let{formData:t,addDangerToast:n}=e;const[r,a]=(0,i.useState)("400"),[o,l]=(0,i.useState)("600"),[c,u]=(0,i.useState)(""),[h,p]=(0,i.useState)(""),m=(0,i.useCallback)((e=>{const{value:t,name:n}=e.currentTarget;"width"===n&&l(t),"height"===n&&a(t)}),[]),g=(0,i.useCallback)((()=>{u(""),(0,b.YE)(t).then((e=>{u(e),p("")})).catch((()=>{p((0,d.t)("Error")),n((0,d.t)("Sorry, something went wrong. Try again later."))}))}),[n,t]);(0,i.useEffect)((()=>{g()}),[]);const v=(0,i.useMemo)((()=>{if(!c)return"";const e=`${c}?${T.KD.standalone.name}=1&height=${r}`;return`<iframe\n  width="${o}"\n  height="${r}"\n  seamless\n  frameBorder="0"\n  scrolling="no"\n  src="${e}"\n>\n</iframe>`}),[r,c,o]),f=h||v||(0,d.t)("Generating link, please wait..");return(0,s.tZ)("div",{id:"embed-code-popover"},(0,s.tZ)("div",{css:s.iv`
          display: flex;
          flex-direction: column;
        `},(0,s.tZ)(w.Z,{shouldShowText:!1,text:v,copyNode:(0,s.tZ)(D,{buttonSize:"xsmall"},(0,s.tZ)("i",{className:"fa fa-clipboard"}))}),(0,s.tZ)(C.Kx,{name:"embedCode",disabled:!v,value:f,rows:"4",readOnly:!0,css:e=>s.iv`
            resize: vertical;
            padding: ${2*e.gridUnit}px;
            font-size: ${e.typography.sizes.s}px;
            border-radius: 4px;
            background-color: ${e.colors.secondary.light5};
          `})),(0,s.tZ)("div",{css:e=>s.iv`
          display: flex;
          margin-top: ${4*e.gridUnit}px;
          & > div {
            margin-right: ${2*e.gridUnit}px;
          }
          & > div:last-of-type {
            margin-right: 0;
            margin-left: ${2*e.gridUnit}px;
          }
        `},(0,s.tZ)("div",null,(0,s.tZ)("label",{htmlFor:"embed-height"},(0,d.t)("Chart height")),(0,s.tZ)(C.II,{type:"text",defaultValue:r,name:"height",onChange:m})),(0,s.tZ)("div",null,(0,s.tZ)("label",{htmlFor:"embed-width"},(0,d.t)("Chart width")),(0,s.tZ)(C.II,{type:"text",defaultValue:o,name:"width",onChange:m,id:"embed-width"}))))};var I=n(5872),M=n.n(I),_=n(73727);const R=e=>{let{chartId:t,dashboards:n=[],...r}=e;const o=(0,l.Fg)(),[h,p]=(0,i.useState)(),[m,g]=(0,i.useState)(),v=n.length>10,b=n.filter((e=>{var t;return!h||a()(t=e.dashboard_title.toLowerCase()).call(t,h.toLowerCase())})),f=0===n.length,y=h&&0===b.length,Z=t?`?focused_chart=${t}`:"";return(0,s.tZ)(i.Fragment,null,v&&(0,s.tZ)(C.II,{allowClear:!0,placeholder:(0,d.t)("Search"),prefix:(0,s.tZ)(c.Z.Search,{iconSize:"l"}),css:s.iv`
            width: ${220}px;
            margin: ${2*o.gridUnit}px ${3*o.gridUnit}px;
          `,value:h,onChange:e=>p(e.currentTarget.value)}),(0,s.tZ)("div",{css:s.iv`
          max-height: ${300}px;
          overflow: auto;
        `},b.map((e=>(0,s.tZ)(u.v.Item,M()({key:String(e.id),onMouseEnter:()=>g(e.id),onMouseLeave:()=>{m===e.id&&g(null)}},r),(0,s.tZ)(_.rU,{target:"_blank",rel:"noreferer noopener",to:`/superset/dashboard/${e.id}${Z}`},(0,s.tZ)("div",{css:s.iv`
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  max-width: ${220}px;
                `},(0,s.tZ)("div",{css:s.iv`
                    white-space: normal;
                  `},e.dashboard_title),(0,s.tZ)(c.Z.Full,{iconSize:"l",iconColor:o.colors.grayscale.base,css:s.iv`
                    margin-left: ${2*o.gridUnit}px;
                    visibility: ${m===e.id?"visible":"hidden"};
                  `})))))),y&&(0,s.tZ)("div",{css:s.iv`
              margin-left: ${3*o.gridUnit}px;
              margin-bottom: ${o.gridUnit}px;
            `},(0,d.t)("No results found")),f&&(0,s.tZ)(u.v.Item,M()({disabled:!0,css:s.iv`
              min-width: ${220}px;
            `},r),(0,d.t)("None"))))},F="edit_properties",E="export_to_csv",O="export_to_csv_pivoted",A="export_to_json",U="export_to_xlsx",z="download_as_image",N="copy_permalink",P="embed_code",L="share_by_email",q="view_query",V="run_in_sql_lab",j=["pivot_table","pivot_table_v2"],B=l.iK.div`
  ${e=>{let{theme:t}=e;return s.iv`
    display: flex;
    align-items: center;

    & svg {
      width: ${3*t.gridUnit}px;
      height: ${3*t.gridUnit}px;
    }

    & span[role='checkbox'] {
      display: inline-flex;
      margin-right: ${t.gridUnit}px;
    }
  `}}
`,H=((0,l.iK)(p.Z)`
  ${e=>{let{theme:t}=e;return s.iv`
    width: ${8*t.gridUnit}px;
    height: ${8*t.gridUnit}px;
    padding: 0;
    border: 1px solid ${t.colors.primary.dark2};

    &.ant-btn > span.anticon {
      line-height: 0;
      transition: inherit;
    }

    &:hover:not(:focus) > span.anticon {
      color: ${t.colors.primary.light1};
    }
  `}}
`,s.iv`
  .ant-dropdown-menu-item > & > .anticon:first-child {
    margin-right: 0;
    vertical-align: 0;
  }
`),K=(e,t,n,r,p,C,w)=>{const T=(0,l.Fg)(),{addDangerToast:k,addSuccessToast:D}=(0,m.e1)(),[I,M]=(0,i.useState)(null),[_,B]=(0,i.useState)(!1),[K,W]=(0,i.useState)([]),Q=(0,o.v9)((e=>{var t;return null==(t=e.charts)?void 0:t[(0,g.Jp)(e.explore)]})),{datasource:G}=e,Y=(0,i.useCallback)((async()=>{try{const t=(0,d.t)("Superset Chart"),n=await(0,b.YE)(e),r=encodeURIComponent((0,d.t)("%s%s","Check out this chart: ",n));window.location.href=`mailto:?Subject=${t}%20&Body=${r}`}catch(e){k((0,d.t)("Sorry, something went wrong. Try again later."))}}),[k,e]),J=(0,i.useCallback)((()=>t?(0,g.pe)({formData:e,ownState:C,resultType:"full",resultFormat:"csv"}):null),[t,e]),X=(0,i.useCallback)((()=>t?(0,g.pe)({formData:e,resultType:"post_processed",resultFormat:"csv"}):null),[t,e]),ee=(0,i.useCallback)((()=>(0,g.pe)({formData:e,resultType:"results",resultFormat:"json"})),[e]),te=(0,i.useCallback)((()=>(0,g.pe)({formData:e,resultType:"results",resultFormat:"xlsx"})),[e]),ne=(0,i.useCallback)((async()=>{try{if(!e)throw new Error;await(0,f.Z)((()=>(0,b.YE)(e))),D((0,d.t)("Copied to clipboard!"))}catch(e){k((0,d.t)("Sorry, something went wrong. Try again later."))}}),[k,D,e]),re=(0,i.useCallback)((t=>{var a;let{key:i,domEvent:o}=t;switch(i){case F:p(),B(!1);break;case E:J(),B(!1),W([]);break;case O:X(),B(!1),W([]);break;case A:ee(),B(!1),W([]);break;case U:te(),B(!1),W([]);break;case z:(0,v.Z)(".panel-body .chart-container",null!=(a=null==n?void 0:n.slice_name)?a:(0,d.t)("New chart"),!0)(o),B(!1),W([]);break;case N:ne(),B(!1),W([]);break;case P:B(!1),W([]);break;case L:Y(),B(!1),W([]);break;case q:B(!1);break;case V:r(e),B(!1)}}),[ne,J,X,ee,e,r,p,Y,null==n?void 0:n.slice_name]);return[(0,i.useMemo)((()=>(0,s.tZ)(u.v,{onClick:re,selectable:!1,openKeys:K,onOpenChange:W},(0,s.tZ)(i.Fragment,null,n&&(0,s.tZ)(u.v.Item,{key:F},(0,d.t)("Edit chart properties")),(0,s.tZ)(u.v.SubMenu,{title:(0,d.t)("Dashboards added to"),key:"dashboards_added_to"},(0,s.tZ)(R,{chartId:null==n?void 0:n.slice_id,dashboards:w})),(0,s.tZ)(u.v.Divider,null)),(0,s.tZ)(u.v.SubMenu,{title:(0,d.t)("Download"),key:"download_submenu"},a()(j).call(j,e.viz_type)?(0,s.tZ)(i.Fragment,null,(0,s.tZ)(u.v.Item,{key:E,icon:(0,s.tZ)(c.Z.FileOutlined,{css:H}),disabled:!t},(0,d.t)("Export to original .CSV")),(0,s.tZ)(u.v.Item,{key:O,icon:(0,s.tZ)(c.Z.FileOutlined,{css:H}),disabled:!t},(0,d.t)("Export to pivoted .CSV"))):(0,s.tZ)(u.v.Item,{key:E,icon:(0,s.tZ)(c.Z.FileOutlined,{css:H}),disabled:!t},(0,d.t)("Export to .CSV")),(0,s.tZ)(u.v.Item,{key:A,icon:(0,s.tZ)(c.Z.FileOutlined,{css:H})},(0,d.t)("Export to .JSON")),(0,s.tZ)(u.v.Item,{key:z,icon:(0,s.tZ)(c.Z.FileImageOutlined,{css:H})},(0,d.t)("Download as image")),(0,s.tZ)(u.v.Item,{key:U,icon:(0,s.tZ)(c.Z.FileOutlined,{css:H})},(0,d.t)("Export to Excel"))),(0,s.tZ)(u.v.SubMenu,{title:(0,d.t)("Share"),key:"share_submenu"},(0,s.tZ)(u.v.Item,{key:N},(0,d.t)("Copy permalink to clipboard")),(0,s.tZ)(u.v.Item,{key:L},(0,d.t)("Share chart by email")),(0,Z.cr)(x.T.EMBEDDABLE_CHARTS)?(0,s.tZ)(u.v.Item,{key:P},(0,s.tZ)(h.Z,{triggerNode:(0,s.tZ)("span",null,(0,d.t)("Embed code")),modalTitle:(0,d.t)("Embed code"),modalBody:(0,s.tZ)($,{formData:e,addDangerToast:k}),maxWidth:100*T.gridUnit+"px",destroyOnClose:!0,responsive:!0})):null),(0,s.tZ)(u.v.Divider,null),I?(0,s.tZ)(i.Fragment,null,(0,s.tZ)(u.v.SubMenu,{title:(0,d.t)("Manage email report")},(0,s.tZ)(y.Z,{chart:Q,setShowReportSubMenu:M,showReportSubMenu:I,setIsDropdownVisible:B,isDropdownVisible:_,useTextMenu:!0})),(0,s.tZ)(u.v.Divider,null)):(0,s.tZ)(u.v,null,(0,s.tZ)(y.Z,{chart:Q,setShowReportSubMenu:M,setIsDropdownVisible:B,isDropdownVisible:_,useTextMenu:!0})),(0,s.tZ)(u.v.Item,{key:q},(0,s.tZ)(h.Z,{triggerNode:(0,s.tZ)("span",null,(0,d.t)("View query")),modalTitle:(0,d.t)("View query"),modalBody:(0,s.tZ)(S.Z,{latestQueryFormData:e}),draggable:!0,resizable:!0,responsive:!0})),G&&(0,s.tZ)(u.v.Item,{key:V},(0,d.t)("Run in SQL Lab")))),[k,t,Q,w,re,_,e,K,I,n,T.gridUnit]),_,B]}},41814:(e,t,n)=>{n.d(t,{p:()=>oe});var r=n(5872),a=n.n(r),i=n(41609),o=n.n(i),l=n(67294),s=n(55867),d=n(11965),c=n(51995),u=n(11064),h=n(16355),p=n(69363),m=n(83862),g=n(70163),v=n(58593),b=n(16550),f=n(74069),y=n(35932),Z=n(28216),x=n(37936),S=n(88889),C=n(55786),w=n(99612),T=n(38703),k=n(27600);const D=function(e){let{value:t}=e;return(0,d.tZ)("span",null,t?k.Ly:k.gz)},$=function(){return(0,d.tZ)("span",{css:e=>d.iv`
          color: ${e.colors.grayscale.light1};
        `},k.Wq)};var I=n(42846),M=n(51115);const _=function(e){let{format:t=I.Z.DATABASE_DATETIME,value:n}=e;return n?(0,d.tZ)("span",null,(0,M.bt)(t).format(n)):(0,d.tZ)($,null)};var R=n(94301),F=n(52256),E=n(93197),O=n(59507),A=n(29487),U=n(42582),z=n(87183),N=n(4715),P=n(76697);const L=function(e){const{headerTitle:t,groupTitle:n,groupOptions:r,value:a,onChange:i}=e,o=(0,c.Fg)(),[s,u]=(0,l.useState)(!1);return(0,d.tZ)("div",{css:d.iv`
        display: flex;
        align-items: center;
      `},(0,d.tZ)(P.ZP,{trigger:"click",visible:s,content:(0,d.tZ)("div",null,(0,d.tZ)("div",{css:d.iv`
                font-weight: ${o.typography.weights.bold};
                margin-bottom: ${o.gridUnit}px;
              `},n),(0,d.tZ)(z.Y.Group,{value:a,onChange:e=>{i(e.target.value),u(!1)}},(0,d.tZ)(N.T,{direction:"vertical"},r.map((e=>(0,d.tZ)(z.Y,{key:e.value,value:e.value},e.label)))))),placement:"bottomLeft",arrowPointAtCenter:!0},(0,d.tZ)(g.Z.SettingOutlined,{iconSize:"m",iconColor:o.colors.grayscale.light1,css:d.iv`
            margin-top: 3px; // we need exactly 3px to align the icon
            margin-right: ${o.gridUnit}px;
          `,onClick:()=>u(!0)})),t)};var q=n(60331),V=n(72813),j=n(89555);function B(e){let{filters:t,setFilters:n,totalCount:r,loading:a,onReload:i}=e;const o=(0,c.Fg)(),u=(0,l.useMemo)((()=>Object.assign({},...t.map((e=>({[(0,V.GA)(e.col)?e.col.label:e.col]:e}))))),[t]),h=(0,l.useCallback)((e=>{const t={...u};delete t[e],n([...Object.values(t)])}),[u,n]),p=(0,l.useMemo)((()=>Object.entries(u).map((e=>{let[t,{val:n,formattedVal:r}]=e;return{colName:t,val:null!=r?r:n}})).sort(((e,t)=>e.colName.localeCompare(t.colName)))),[u]);return(0,d.tZ)("div",{css:d.iv`
        display: flex;
        justify-content: space-between;
        padding: ${o.gridUnit/2}px 0;
        margin-bottom: ${2*o.gridUnit}px;
      `},(0,d.tZ)("div",{css:d.iv`
          display: flex;
          flex-wrap: wrap;
          margin-bottom: -${4*o.gridUnit}px;
        `},p.map((e=>{let{colName:t,val:n}=e;return(0,d.tZ)(q.Z,{closable:!0,onClose:h.bind(null,t),key:t,css:d.iv`
              height: ${6*o.gridUnit}px;
              display: flex;
              align-items: center;
              padding: ${o.gridUnit/2}px ${2*o.gridUnit}px;
              margin-right: ${4*o.gridUnit}px;
              margin-bottom: ${4*o.gridUnit}px;
              line-height: 1.2;
            `},(0,d.tZ)("span",{css:d.iv`
                margin-right: ${o.gridUnit}px;
              `},t),(0,d.tZ)("strong",null,n))}))),(0,d.tZ)("div",{css:d.iv`
          display: flex;
          align-items: center;
          height: min-content;
        `},(0,d.tZ)(j.Z,{loading:a&&!r,rowcount:r}),(0,d.tZ)(g.Z.ReloadOutlined,{iconColor:o.colors.grayscale.light1,iconSize:"l","aria-label":(0,s.t)("Reload"),role:"button",onClick:i})))}var H,K=n(57557),W=n.n(K),Q=n(65946),G={name:"82a6rk",styles:"flex:1"};function Y(e){let{children:t}=e;const{ref:n,height:r}=(0,w.NB)();return(0,d.tZ)("div",{ref:n,css:G},l.cloneElement(t,{height:r}))}function J(e){let{formData:t,initialFilters:n}=e;const r=(0,c.Fg)(),[a,i]=(0,l.useState)(0),o=(0,l.useRef)(a),[u,h]=(0,l.useState)(n),[p,m]=(0,l.useState)(!1),[g,v]=(0,l.useState)(""),[b,f]=(0,l.useState)(new Map),[y,x]=(0,l.useState)({}),w=(0,Z.v9)((e=>e.common.conf.SAMPLES_ROW_LIMIT)),[k,I]=(0,l.useMemo)((()=>t.datasource.split("__")),[t.datasource]),M=(0,l.useMemo)((()=>{const e=b.get(a);return e?(o.current=a,e):b.get(o.current)}),[a,b]),z=(0,l.useMemo)((()=>(null==M?void 0:M.colNames.map(((e,t)=>({key:e,dataIndex:e,title:(null==M?void 0:M.colTypes[t])===S.Z.TEMPORAL?(0,d.tZ)(L,{headerTitle:e,groupTitle:(0,s.t)("Formatting"),groupOptions:[{label:(0,s.t)("Original value"),value:H.Original},{label:(0,s.t)("Formatted value"),value:H.Formatted}],value:y[e]===H.Original?H.Original:H.Formatted,onChange:t=>x((n=>({...n,[e]:t})))}):e,render:n=>!0===n||!1===n?(0,d.tZ)(D,{value:n}):null===n?(0,d.tZ)($,null):(null==M?void 0:M.colTypes[t])===S.Z.TEMPORAL&&y[e]!==H.Original&&("number"==typeof n||n instanceof Date)?(0,d.tZ)(_,{value:n}):String(n),width:150}))))||[]),[null==M?void 0:M.colNames,null==M?void 0:M.colTypes,y]),N=(0,l.useMemo)((()=>(null==M?void 0:M.data.map(((e,t)=>null==M?void 0:M.colNames.reduce(((t,n)=>({...t,[n]:e[n]})),{key:t}))))||[]),[null==M?void 0:M.colNames,null==M?void 0:M.data]),P=(0,l.useCallback)((()=>{v(""),f(new Map),i(0)}),[]);(0,l.useEffect)((()=>{v(""),f(new Map),i(0)}),[u]),(0,l.useEffect)((()=>{if(b.has(a)&&[...b.keys()].at(-1)!==a){const e=new Map(b);e.delete(a),f(e.set(a,b.get(a)))}}),[a,b]),(0,l.useEffect)((()=>{if(!g&&!p&&!b.has(a)){var e;m(!0);const n=null!=(e=function(e,t){if(!e)return;const n=(0,Q.Z)(e),r=W()(n.extras,"having"),a=[...(0,C.Z)(n.filters),...(0,C.Z)(t).map((e=>W()(e,"formattedVal")))];return{granularity:n.granularity,time_range:n.time_range,filters:a,extras:r}}(t,u))?e:{},r=Math.ceil(w/50);(0,F.getDatasourceSamples)(I,k,!1,n,50,a+1).then((e=>{f(new Map([...[...b.entries()].slice(1-r),[a,{total:e.total_count,data:e.data,colNames:(0,C.Z)(e.colnames),colTypes:(0,C.Z)(e.coltypes)}]])),v("")})).catch((e=>{v(`${e.name}: ${e.message}`)})).finally((()=>{m(!1)}))}}),[w,k,I,u,t,p,a,g,b]);const q=(0,U.s_)(`/api/v1/dataset/${k}`),V=!g&&!b.size||"loading"===q.status;let j=null;if(g)j=(0,d.tZ)("pre",{css:d.iv`
          margin-top: ${4*r.gridUnit}px;
        `},g);else if(V)j=(0,d.tZ)(T.Z,null);else if(0===(null==M?void 0:M.total)){const e=(0,s.t)("No rows were returned for this dataset");j=(0,d.tZ)(R.x3,{image:"document.svg",title:e})}else j=(0,d.tZ)(Y,null,(0,d.tZ)(E.ZP,{data:N,columns:z,size:E.ex.SMALL,defaultPageSize:50,recordCount:null==M?void 0:M.total,usePagination:!0,loading:p,onChange:e=>i(e.current?e.current-1:0),resizable:!0,virtualize:!0}));const K=(0,l.useMemo)((()=>{const{status:e,result:t}=q,n=[];if(t){var a,i;const{changed_on_humanized:e,created_on_humanized:r,description:o,table_name:l,changed_by:d,created_by:c,owners:u}=t,h=(0,s.t)("Not available"),p=`${null!=(a=null==c?void 0:c.first_name)?a:""} ${null!=(i=null==c?void 0:c.last_name)?i:""}`.trim()||h,m=d?`${d.first_name} ${d.last_name}`:h,g=u.length>0?u.map((e=>`${e.first_name} ${e.last_name}`)):[h];n.push({type:O.pG.TABLE,title:l}),n.push({type:O.pG.LAST_MODIFIED,value:e,modifiedBy:m}),n.push({type:O.pG.OWNER,createdBy:p,owners:g,createdOn:r}),o&&n.push({type:O.pG.DESCRIPTION,value:o})}return(0,d.tZ)("div",{css:d.iv`
          display: flex;
          margin-bottom: ${4*r.gridUnit}px;
        `},"complete"===e&&(0,d.tZ)(O.ZP,{items:n,tooltipPlacement:"bottom"}),"error"===e&&(0,d.tZ)(A.Z,{type:"error",message:(0,s.t)("There was an error loading the dataset metadata")}))}),[q,r.gridUnit]);return(0,d.tZ)(l.Fragment,null,!V&&K,!V&&(0,d.tZ)(B,{filters:u,setFilters:h,totalCount:null==M?void 0:M.total,loading:p,onReload:P}),j)}!function(e){e[e.Original=0]="Original",e[e.Formatted=1]="Formatted"}(H||(H={}));const X=e=>{let{exploreChart:t,closeModal:n}=e;return(0,d.tZ)(l.Fragment,null,(0,d.tZ)(y.Z,{buttonStyle:"secondary",buttonSize:"small",onClick:t},(0,s.t)("Edit chart")),(0,d.tZ)(y.Z,{buttonStyle:"primary",buttonSize:"small",onClick:n},(0,s.t)("Close")))};function ee(e){let{chartId:t,formData:n,initialFilters:r,showModal:a,onHideModal:i}=e;const o=(0,c.Fg)(),u=(0,b.k6)(),h=(0,l.useContext)(x.DashboardPageIdContext),{slice_name:p}=(0,Z.v9)((e=>e.sliceEntities.slices[t])),m=(0,l.useMemo)((()=>`/explore/?dashboard_page_id=${h}&slice_id=${t}`),[t,h]),g=(0,l.useCallback)((()=>{u.push(m)}),[m,u]);return(0,d.tZ)(f.Z,{show:a,onHide:null!=i?i:()=>null,css:d.iv`
        .ant-modal-body {
          display: flex;
          flex-direction: column;
        }
      `,title:(0,s.t)("Drill to detail: %s",p),footer:(0,d.tZ)(X,{exploreChart:g}),responsive:!0,resizable:!0,resizableConfig:{minHeight:128*o.gridUnit,minWidth:128*o.gridUnit,defaultSize:{width:"auto",height:"75vh"}},draggable:!0,destroyOnClose:!0,maskClosable:!1},(0,d.tZ)(J,{formData:n,initialFilters:r}))}var te=n(69175);const ne=(0,s.t)("Drill to detail by"),re=e=>{let{title:t}=e;return(0,d.tZ)(v.u,{title:t,placement:"top"},(0,d.tZ)(g.Z.InfoCircleOutlined,{css:e=>d.iv`
        color: ${e.colors.text.label};
        margin-left: ${2*e.gridUnit}px;
        &.anticon {
          font-size: unset;
          .anticon {
            line-height: unset;
            vertical-align: unset;
          }
        }
      `}))},ae=e=>{let{children:t,...n}=e;return(0,d.tZ)(m.v.Item,a()({disabled:!0},n),(0,d.tZ)("div",{css:d.iv`
        white-space: normal;
        max-width: 160px;
      `},t))},ie=c.iK.span`
  ${e=>{let{theme:t}=e;return`\n     font-weight: ${t.typography.weights.bold};\n     color: ${t.colors.primary.base};\n   `}}
`,oe=e=>{let{chartId:t,formData:n,filters:r=[],isContextMenu:i=!1,contextMenuY:c=0,onSelection:g=(()=>null),onClick:v=(()=>null),...b}=e;const[f,y]=(0,l.useState)([]),[Z,x]=(0,l.useState)(!1),S=(0,l.useCallback)(((e,t)=>{v(t),g(),y(e),x(!0)}),[v,g]),C=(0,l.useCallback)((()=>{x(!1)}),[]),w=(0,l.useMemo)((()=>{var e;return null==(e=(0,u.Z)().get(n.viz_type))?void 0:e.behaviors.find((e=>e===h.cg.DRILL_TO_DETAIL))}),[n.viz_type]),T=(0,l.useMemo)((()=>{const{metrics:e}=(0,p.Z)(n);return o()(e)}),[n]);let k,D;k=w&&T?(0,d.tZ)(ae,a()({},b,{key:"drill-detail-no-aggregations"}),(0,s.t)("Drill to detail"),(0,d.tZ)(re,{title:(0,s.t)("Drill to detail is disabled because this chart does not group data by dimension value.")})):(0,d.tZ)(m.v.Item,a()({},b,{key:"drill-detail-no-filters",onClick:S.bind(null,[])}),(0,s.t)("Drill to detail")),w||(D=(0,d.tZ)(ae,a()({},b,{key:"drill-detail-by-chart-not-supported"}),ne,(0,d.tZ)(re,{title:(0,s.t)("Drill to detail by value is not yet supported for this chart type.")}))),w&&T&&(D=(0,d.tZ)(ae,a()({},b,{key:"drill-detail-by-no-aggregations"}),ne));const $=(0,l.useMemo)((()=>{const e=r.length>1?r.length+1:r.length,t=c+4+te.x+4;return(0,te.$)(t,e)-t}),[c,r.length]);return w&&!T&&null!=r&&r.length&&(D=(0,d.tZ)(m.v.SubMenu,a()({},b,{popupOffset:[0,$],title:ne}),(0,d.tZ)("div",null,r.map(((e,t)=>(0,d.tZ)(m.v.Item,a()({},b,{key:`drill-detail-filter-${t}`,onClick:S.bind(null,[e])}),`${ne} `,(0,d.tZ)(ie,null,e.formattedVal)))),r.length>1&&(0,d.tZ)(m.v.Item,a()({},b,{key:"drill-detail-filter-all",onClick:S.bind(null,r)}),`${ne} `,(0,d.tZ)(ie,null,(0,s.t)("all")))))),!w||T||null!=r&&r.length||(D=(0,d.tZ)(ae,a()({},b,{key:"drill-detail-by-select-aggregation"}),ne,(0,d.tZ)(re,{title:(0,s.t)("Right-click on a dimension value to drill to detail by that value.")}))),(0,d.tZ)(l.Fragment,null,k,i&&D,(0,d.tZ)(ee,{chartId:t,formData:n,initialFilters:f,showModal:Z,onHideModal:C}))}},69175:(e,t,n)=>{n.d(t,{x:()=>r,$:()=>a});const r=32;function a(e,t){const n=Math.max(document.documentElement.clientHeight||0,window.innerHeight||0),a=r*t+32;return n-e<a?n-a:e}},9433:(e,t,n)=>{n.d(t,{CronPicker:()=>u});var r=n(5872),a=n.n(r),i=(n(67294),n(70338)),o=n(55867),l=n(51995),s=n(61247),d=n(11965);const c={everyText:(0,o.t)("every"),emptyMonths:(0,o.t)("every month"),emptyMonthDays:(0,o.t)("every day of the month"),emptyMonthDaysShort:(0,o.t)("day of the month"),emptyWeekDays:(0,o.t)("every day of the week"),emptyWeekDaysShort:(0,o.t)("day of the week"),emptyHours:(0,o.t)("every hour"),emptyMinutes:(0,o.t)("every minute"),emptyMinutesForHourPeriod:(0,o.t)("every"),yearOption:(0,o.t)("year"),monthOption:(0,o.t)("month"),weekOption:(0,o.t)("week"),dayOption:(0,o.t)("day"),hourOption:(0,o.t)("hour"),minuteOption:(0,o.t)("minute"),rebootOption:(0,o.t)("reboot"),prefixPeriod:(0,o.t)("Every"),prefixMonths:(0,o.t)("in"),prefixMonthDays:(0,o.t)("on"),prefixWeekDays:(0,o.t)("on"),prefixWeekDaysForMonthAndYearPeriod:(0,o.t)("and"),prefixHours:(0,o.t)("at"),prefixMinutes:(0,o.t)(":"),prefixMinutesForHourPeriod:(0,o.t)("at"),suffixMinutesForHourPeriod:(0,o.t)("minute(s)"),errorInvalidCron:(0,o.t)("Invalid cron expression"),clearButtonText:(0,o.t)("Clear"),weekDays:[(0,o.t)("Sunday"),(0,o.t)("Monday"),(0,o.t)("Tuesday"),(0,o.t)("Wednesday"),(0,o.t)("Thursday"),(0,o.t)("Friday"),(0,o.t)("Saturday")],months:[(0,o.t)("January"),(0,o.t)("February"),(0,o.t)("March"),(0,o.t)("April"),(0,o.t)("May"),(0,o.t)("June"),(0,o.t)("July"),(0,o.t)("August"),(0,o.t)("September"),(0,o.t)("October"),(0,o.t)("November"),(0,o.t)("December")],altWeekDays:[(0,o.t)("SUN"),(0,o.t)("MON"),(0,o.t)("TUE"),(0,o.t)("WED"),(0,o.t)("THU"),(0,o.t)("FRI"),(0,o.t)("SAT")],altMonths:[(0,o.t)("JAN"),(0,o.t)("FEB"),(0,o.t)("MAR"),(0,o.t)("APR"),(0,o.t)("MAY"),(0,o.t)("JUN"),(0,o.t)("JUL"),(0,o.t)("AUG"),(0,o.t)("SEP"),(0,o.t)("OCT"),(0,o.t)("NOV"),(0,o.t)("DEC")]},u=(0,l.iK)((e=>(0,d.tZ)(i.ZP,{getPopupContainer:e=>e.parentElement},(0,d.tZ)(s.Z,a()({locale:c},e)))))`
  .react-js-cron-field {
    margin-bottom: 0px;
  }
  .react-js-cron-select:not(.react-js-cron-custom-select) > div:first-of-type,
  .react-js-cron-custom-select {
    border-radius: ${e=>{let{theme:t}=e;return t.gridUnit}}px;
    background-color: ${e=>{let{theme:t}=e;return t.colors.grayscale.light4}} !important;
  }
  .react-js-cron-custom-select > div:first-of-type {
    border-radius: ${e=>{let{theme:t}=e;return t.gridUnit}}px;
  }
  .react-js-cron-custom-select .ant-select-selection-placeholder {
    flex: auto;
  }
  .react-js-cron-custom-select .ant-select-selection-overflow-item {
    align-self: center;
  }
`},88694:(e,t,n)=>{n.d(t,{Lt:()=>h,$i:()=>p});var r=n(5872),a=n.n(r),i=(n(67294),n(4715)),o=n(51995),l=n(70163),s=n(11965);const d=o.iK.div`
  width: ${e=>{let{theme:t}=e;return.75*t.gridUnit}}px;
  height: ${e=>{let{theme:t}=e;return.75*t.gridUnit}}px;
  border-radius: 50%;
  background-color: ${e=>{let{theme:t}=e;return t.colors.grayscale.light1}};

  font-weight: ${e=>{let{theme:t}=e;return t.typography.weights.normal}};
  display: inline-flex;
  position: relative;

  &:hover {
    background-color: ${e=>{let{theme:t}=e;return t.colors.primary.base}};

    &::before,
    &::after {
      background-color: ${e=>{let{theme:t}=e;return t.colors.primary.base}};
    }
  }

  &::before,
  &::after {
    position: absolute;
    content: ' ';
    width: ${e=>{let{theme:t}=e;return.75*t.gridUnit}}px;
    height: ${e=>{let{theme:t}=e;return.75*t.gridUnit}}px;
    border-radius: 50%;
    background-color: ${e=>{let{theme:t}=e;return t.colors.grayscale.light1}};
  }

  &::before {
    top: ${e=>{let{theme:t}=e;return t.gridUnit}}px;
  }

  &::after {
    bottom: ${e=>{let{theme:t}=e;return t.gridUnit}}px;
  }
`,c=o.iK.div`
  display: flex;
  align-items: center;
  padding: ${e=>{let{theme:t}=e;return 2*t.gridUnit}}px;
  padding-left: ${e=>{let{theme:t}=e;return t.gridUnit}}px;
`;var u;!function(e){e.VERTICAL="vertical",e.HORIZONTAL="horizontal"}(u||(u={}));const h=e=>{let{overlay:t,iconOrientation:n=u.VERTICAL,...r}=e;return(0,s.tZ)(i.Gj,a()({overlay:t},r),(0,s.tZ)(c,null,function(e){return void 0===e&&(e=u.VERTICAL),e===u.HORIZONTAL?(0,s.tZ)(l.Z.MoreHoriz,{iconSize:"xl"}):(0,s.tZ)(d,null)}(n)))},p=e=>(0,s.tZ)(i.Gj,a()({overlayStyle:{zIndex:99,animationDuration:"0s"}},e))},59507:(e,t,n)=>{n.d(t,{pG:()=>x,ZP:()=>S});var r=n(87185),a=n.n(r),i=n(67294),o=n(99612),l=n(51995),s=n(58593),d=n(55786),c=n(55867),u=n(70163),h=n(11965);const p=l.iK.div`
  font-weight: ${e=>{let{theme:t}=e;return t.typography.weights.bold}};
`,m=e=>{let{text:t,header:n}=e;const r=(0,d.Z)(t);return(0,h.tZ)(i.Fragment,null,n&&(0,h.tZ)(p,null,n),r.map((e=>(0,h.tZ)("div",{key:e},e))))},g=16,v={dashboards:0,table:1,sql:2,rows:3,tags:4,description:5,owner:6,lastModified:7},b=l.iK.div`
  ${e=>{let{theme:t,count:n}=e;return`\n    display: flex;\n    align-items: center;\n    padding: 8px 12px;\n    background-color: ${t.colors.grayscale.light4};\n    color: ${t.colors.grayscale.base};\n    font-size: ${t.typography.sizes.s}px;\n    min-width: ${24+32*n-g}px;\n    border-radius: ${t.borderRadius}px;\n    line-height: 1;\n  `}}
`,f=l.iK.div`
  ${e=>{let{theme:t,collapsed:n,last:r,onClick:a}=e;return`\n    display: flex;\n    align-items: center;\n    max-width: ${174+(r?0:g)}px;\n    min-width: ${n?16+(r?0:g):94+(r?0:g)}px;\n    padding-right: ${r?0:g}px;\n    cursor: ${a?"pointer":"default"};\n    & .metadata-icon {\n      color: ${a&&n?t.colors.primary.base:t.colors.grayscale.base};\n      padding-right: ${n?0:8}px;\n      & .anticon {\n        line-height: 0;\n      }\n    }\n    & .metadata-text {\n      min-width: 70px;\n      overflow: hidden;\n      text-overflow: ${n?"unset":"ellipsis"};\n      white-space: nowrap;\n      text-decoration: ${a?"underline":"none"};\n    }\n  `}}
`,y=l.iK.div`
  display: -webkit-box;
  -webkit-line-clamp: 20;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`,Z=e=>{let{barWidth:t,contentType:n,collapsed:r,last:a=!1,tooltipPlacement:o}=e;const{icon:l,title:d,tooltip:p=d}=(e=>{const{type:t}=e;switch(t){case x.DASHBOARDS:return{icon:u.Z.FundProjectionScreenOutlined,title:e.title,tooltip:e.description?(0,h.tZ)("div",null,(0,h.tZ)(m,{header:e.title,text:e.description})):void 0};case x.DESCRIPTION:return{icon:u.Z.BookOutlined,title:e.value};case x.LAST_MODIFIED:return{icon:u.Z.EditOutlined,title:e.value,tooltip:(0,h.tZ)("div",null,(0,h.tZ)(m,{header:(0,c.t)("Last modified"),text:e.value}),(0,h.tZ)(m,{header:(0,c.t)("Modified by"),text:e.modifiedBy}))};case x.OWNER:return{icon:u.Z.UserOutlined,title:e.createdBy,tooltip:(0,h.tZ)("div",null,(0,h.tZ)(m,{header:(0,c.t)("Created by"),text:e.createdBy}),(0,h.tZ)(m,{header:(0,c.t)("Owners"),text:e.owners}),(0,h.tZ)(m,{header:(0,c.t)("Created on"),text:e.createdOn}))};case x.ROWS:return{icon:u.Z.InsertRowBelowOutlined,title:e.title,tooltip:e.title};case x.SQL:return{icon:u.Z.ConsoleSqlOutlined,title:e.title,tooltip:e.title};case x.TABLE:return{icon:u.Z.Table,title:e.title,tooltip:e.title};case x.TAGS:return{icon:u.Z.TagsOutlined,title:e.values.join(", "),tooltip:(0,h.tZ)("div",null,(0,h.tZ)(m,{header:(0,c.t)("Tags"),text:e.values}))};default:throw Error(`Invalid type provided: ${t}`)}})(n),[g,v]=(0,i.useState)(!1),b=(0,i.useRef)(null),Z=l,{type:S,onClick:C}=n;(0,i.useEffect)((()=>{v(!!b.current&&b.current.scrollWidth>b.current.clientWidth)}),[t,v,n]);const w=(0,h.tZ)(f,{collapsed:r,last:a,onClick:C?()=>C(S):void 0},(0,h.tZ)(Z,{iconSize:"l",className:"metadata-icon"}),!r&&(0,h.tZ)("span",{ref:b,className:"metadata-text"},d));return g||r||p&&p!==d?(0,h.tZ)(s.u,{placement:o,title:(0,h.tZ)(y,null,p)},w):w};var x;!function(e){e.DASHBOARDS="dashboards",e.DESCRIPTION="description",e.LAST_MODIFIED="lastModified",e.OWNER="owner",e.ROWS="rows",e.SQL="sql",e.TABLE="table",e.TAGS="tags"}(x||(x={}));const S=e=>{let{items:t,tooltipPlacement:n="top"}=e;const[r,l]=(0,i.useState)(),[s,d]=(0,i.useState)(!1),c=a()(t,((e,t)=>e.type===t.type)).sort(((e,t)=>v[e.type]-v[t.type])),u=c.length;if(u<2)throw Error("The minimum number of items for the metadata bar is 2.");if(u>6)throw Error("The maximum number of items for the metadata bar is 6.");const p=(0,i.useCallback)((e=>{const t=110*u-g;l(e),d(Boolean(e&&e<t))}),[u]),{ref:m}=(0,o.NB)({onResize:p});return(0,h.tZ)(b,{ref:m,count:u},c.map(((e,t)=>(0,h.tZ)(Z,{barWidth:r,key:t,contentType:e,collapsed:s,last:t===u-1,tooltipPlacement:n}))))}},97634:(e,t,n)=>{n.d(t,{x:()=>te,Z:()=>ae});var r,a,i=n(11965),o=n(67294),l=n(60812),s=n(28216),d=n(75049),c=n(51995),u=n(93185),h=n(55867),p=n(70163),m=n(73192),g=n(83862),v=n(87253),b=n(54076),f=n(88694),y=n(17198),Z=n(78580),x=n.n(Z),S=n(98286),C=n(61358),w=n(29487),T=n(98978),k=n(87858),D=n(14114);!function(e){e.DASHBOARDS="dashboards",e.CHARTS="charts"}(r||(r={})),function(e){e.TEXT="TEXT",e.PNG="PNG",e.CSV="CSV"}(a||(a={}));var $=n(34858),I=n(74069),M=n(35932),_=n(87183),R=n(9433);const F=(0,c.iK)(I.Z)`
  .ant-modal-body {
    padding: 0;
  }
`,E=c.iK.div`
  padding: ${e=>{let{theme:t}=e;return`${3*t.gridUnit}px ${4*t.gridUnit}px ${2*t.gridUnit}px`}};
  label {
    font-size: ${e=>{let{theme:t}=e;return t.typography.sizes.s}}px;
    color: ${e=>{let{theme:t}=e;return t.colors.grayscale.light1}};
  }
`,O=c.iK.div`
  border-top: 1px solid ${e=>{let{theme:t}=e;return t.colors.grayscale.light2}};
  padding: ${e=>{let{theme:t}=e;return`${4*t.gridUnit}px ${4*t.gridUnit}px ${6*t.gridUnit}px`}};
  .ant-select {
    width: 100%;
  }
  .control-label {
    font-size: ${e=>{let{theme:t}=e;return t.typography.sizes.s}}px;
    color: ${e=>{let{theme:t}=e;return t.colors.grayscale.light1}};
  }
`,A=c.iK.span`
  span {
    margin-right: ${e=>{let{theme:t}=e;return 2*t.gridUnit}}px;
    vertical-align: middle;
  }
  .text {
    vertical-align: middle;
  }
`,U=c.iK.div`
  margin-bottom: ${e=>{let{theme:t}=e;return 7*t.gridUnit}}px;

  h4 {
    margin-bottom: ${e=>{let{theme:t}=e;return 3*t.gridUnit}}px;
  }
`,z=(0,c.iK)(R.CronPicker)`
  margin-bottom: ${e=>{let{theme:t}=e;return 3*t.gridUnit}}px;
  width: ${e=>{let{theme:t}=e;return 120*t.gridUnit}}px;
`,N=c.iK.p`
  color: ${e=>{let{theme:t}=e;return t.colors.error.base}};
`,P=i.iv`
  margin-bottom: 0;
`,L=(0,c.iK)(M.Z)`
  width: ${e=>{let{theme:t}=e;return 40*t.gridUnit}}px;
`,q=c.iK.div`
  margin: ${e=>{let{theme:t}=e;return 8*t.gridUnit}}px 0
    ${e=>{let{theme:t}=e;return 4*t.gridUnit}}px;
`,V=(0,c.iK)(_.Y)`
  display: block;
  line-height: ${e=>{let{theme:t}=e;return 8*t.gridUnit}}px;
`,j=(0,c.iK)(_.Y.Group)`
  margin-left: ${e=>{let{theme:t}=e;return.5*t.gridUnit}}px;
`,B=["pivot_table","pivot_table_v2","table","paired_ttest"],H={crontab:"0 12 * * 1"},K=(0,D.ZP)((function(e){var t;let{onHide:n,show:r=!1,dashboardId:l,chart:d,userId:c,userEmail:u,creationMethod:m,dashboardName:g,chartName:v}=e;const b=null==d||null==(t=d.sliceFormData)?void 0:t.viz_type,f=!!d,y=f&&b&&x()(B).call(B,b),Z=y?a.TEXT:a.PNG,D=g||v,I=(0,o.useMemo)((()=>({...H,name:D?(0,h.t)("Weekly Report for %s",D):(0,h.t)("Weekly Report")})),[D]),M=(0,o.useCallback)(((e,t)=>"reset"===t?I:{...e,...t}),[I]),[_,R]=(0,o.useReducer)(M,I),[K,W]=(0,o.useState)(),Q=(0,s.I0)(),G=(0,s.v9)((e=>{const t=l?te.DASHBOARDS:te.CHARTS;return(0,$._l)(e,t,l||(null==d?void 0:d.id))})),Y=G&&Object.keys(G).length;(0,o.useEffect)((()=>{R(Y?G:"reset")}),[Y,G]);const J=(0,i.tZ)(A,null,(0,i.tZ)(p.Z.Calendar,null),(0,i.tZ)("span",{className:"text"},Y?(0,h.t)("Edit email report"):(0,h.t)("Schedule a new email report"))),X=(0,i.tZ)(o.Fragment,null,(0,i.tZ)(L,{key:"back",onClick:n},(0,h.t)("Cancel")),(0,i.tZ)(L,{key:"submit",buttonStyle:"primary",onClick:async()=>{const e={type:"Report",active:!0,force_screenshot:!1,creation_method:m,dashboard:l,chart:null==d?void 0:d.id,owners:[c],recipients:[{recipient_config_json:{target:u},type:"Email"}],name:_.name,description:_.description,crontab:_.crontab,report_format:_.report_format||Z,timezone:_.timezone};R({isSubmitting:!0,error:void 0});try{Y?await Q((0,C.Me)(_.id,e)):await Q((0,C.cq)(e)),n()}catch(e){const{error:t}=await(0,S.O$)(e);R({error:t})}R({isSubmitting:!1})},disabled:!_.name,loading:_.isSubmitting},Y?(0,h.t)("Save"):(0,h.t)("Add"))),ee=(0,i.tZ)(o.Fragment,null,(0,i.tZ)(q,null,(0,i.tZ)("h4",null,(0,h.t)("Message content"))),(0,i.tZ)("div",{className:"inline-container"},(0,i.tZ)(j,{onChange:e=>{R({report_format:e.target.value})},value:_.report_format||Z},y&&(0,i.tZ)(V,{value:a.TEXT},(0,h.t)("Text embedded in email")),(0,i.tZ)(V,{value:a.PNG},(0,h.t)("Image (PNG) embedded in email")),(0,i.tZ)(V,{value:a.CSV},(0,h.t)("Formatted CSV attached in email")))));return(0,i.tZ)(F,{show:r,onHide:n,title:J,footer:X,width:"432",centered:!0},(0,i.tZ)(E,null,(0,i.tZ)(k.Z,{id:"name",name:"name",value:_.name||"",placeholder:I.name,required:!0,validationMethods:{onChange:e=>{let{target:t}=e;return R({name:t.value})}},label:(0,h.t)("Report Name")}),(0,i.tZ)(k.Z,{id:"description",name:"description",value:(null==_?void 0:_.description)||"",validationMethods:{onChange:e=>{let{target:t}=e;R({description:t.value})}},label:(0,h.t)("Description"),placeholder:(0,h.t)("Include a description that will be sent with your report"),css:P})),(0,i.tZ)(O,null,(0,i.tZ)(U,null,(0,i.tZ)("h4",{css:e=>(e=>i.iv`
  margin: ${3*e.gridUnit}px 0;
`)(e)},(0,h.t)("Schedule")),(0,i.tZ)("p",null,(0,h.t)("A screenshot of the dashboard will be sent to your email at"))),(0,i.tZ)(z,{clearButton:!1,value:_.crontab||"0 12 * * 1",setValue:e=>{R({crontab:e})},onError:W}),(0,i.tZ)(N,null,K),(0,i.tZ)("div",{className:"control-label",css:e=>(e=>i.iv`
  margin: ${3*e.gridUnit}px 0 ${2*e.gridUnit}px;
`)(e)},(0,h.t)("Timezone")),(0,i.tZ)(T.Z,{timezone:_.timezone,onTimezoneChange:e=>{R({timezone:e})}}),f&&ee),_.error&&(0,i.tZ)(w.Z,{type:"error",css:e=>(e=>i.iv`
  border: ${e.colors.error.base} 1px solid;
  padding: ${4*e.gridUnit}px;
  margin: ${4*e.gridUnit}px;
  margin-top: 0;
  color: ${e.colors.error.dark2};
  .ant-alert-message {
    font-size: ${e.typography.sizes.m}px;
    font-weight: bold;
  }
  .ant-alert-description {
    font-size: ${e.typography.sizes.m}px;
    line-height: ${4*e.gridUnit}px;
    .ant-alert-icon {
      margin-right: ${2.5*e.gridUnit}px;
      font-size: ${e.typography.sizes.l}px;
      position: relative;
      top: ${e.gridUnit/4}px;
    }
  }
`)(e),message:Y?(0,h.t)("Failed to update report"):(0,h.t)("Failed to create report"),description:_.error}))}));var W=n(96022);const Q=(0,d.I)(),G=e=>i.iv`
  color: ${e.colors.error.base};
`,Y=e=>i.iv`
  & .ant-menu-item {
    padding: 5px 12px;
    margin-top: 0px;
    margin-bottom: 4px;
    :hover {
      color: ${e.colors.grayscale.dark1};
    }
  }
  :hover {
    background-color: ${e.colors.secondary.light5};
  }
`,J=e=>i.iv`
  &:hover {
    color: ${e.colors.grayscale.dark1};
    background-color: ${e.colors.secondary.light5};
  }
`,X=c.iK.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  > *:first-child {
    margin-right: ${e=>{let{theme:t}=e;return t.gridUnit}}px;
  }
`,ee=Q.get("report-modal.dropdown.item.icon");var te;!function(e){e.CHARTS="charts",e.DASHBOARDS="dashboards"}(te||(te={}));var ne={name:"1e1ncky",styles:"border:none"},re={name:"833hqy",styles:"width:200px"};function ae(e){let{dashboardId:t,chart:n,useTextMenu:r=!1,setShowReportSubMenu:a,setIsDropdownVisible:d,isDropdownVisible:Z}=e;const x=(0,s.I0)(),S=(0,s.v9)((e=>{const r=t?te.DASHBOARDS:te.CHARTS;return(0,$._l)(e,r,t||(null==n?void 0:n.id))})),w=(null==S?void 0:S.active)||!1,T=(0,s.v9)((e=>e.user)),k=()=>!!(0,u.c)(u.T.ALERT_REPORTS)&&(!(null==T||!T.userId)&&Object.keys(T.roles||[]).map((e=>T.roles[e].filter((e=>"menu_access"===e[0]&&"Manage"===e[1])))).some((e=>e.length>0))),[D,I]=(0,o.useState)(null),M=(0,c.Fg)(),_=(0,l.D)(t),[R,F]=(0,o.useState)(!1),E=async(e,t)=>{null!=e&&e.id&&x((0,C.M)(e,t))},O=k()&&!!(t&&_!==t||null!=n&&n.id);(0,o.useEffect)((()=>{O&&x((0,C.Aw)({userId:T.userId,filterField:t?"dashboard_id":"chart_id",creationMethod:t?"dashboards":"charts",resourceId:t||(null==n?void 0:n.id)}))}),[]);const A=S&&a&&k();(0,o.useEffect)((()=>{A?a(!0):!S&&a&&a(!1)}),[S]);const U=()=>{d&&(d(!1),F(!0))};return(0,i.tZ)(o.Fragment,null,k()&&(0,i.tZ)(o.Fragment,null,(0,i.tZ)(K,{userId:T.userId,show:R,onHide:()=>F(!1),userEmail:T.email,dashboardId:t,chart:n,creationMethod:t?te.DASHBOARDS:te.CHARTS}),r?S?Z&&(0,i.tZ)(g.v,{selectable:!1,css:ne},(0,i.tZ)(g.v.Item,{css:J,onClick:()=>E(S,!w)},(0,i.tZ)(W.ZN,null,(0,i.tZ)(v.ZP,{checked:w,onChange:b.EI}),(0,h.t)("Email reports active"))),(0,i.tZ)(g.v.Item,{css:J,onClick:U},(0,h.t)("Edit email report")),(0,i.tZ)(g.v.Item,{css:J,onClick:()=>{d&&(d(!1),I(S))}},(0,h.t)("Delete email report"))):(0,i.tZ)(g.v,{selectable:!1,css:Y},(0,i.tZ)(g.v.Item,{onClick:U},ee?(0,i.tZ)(X,null,(0,i.tZ)("div",null,(0,h.t)("Set up an email report")),(0,i.tZ)(ee,null)):(0,h.t)("Set up an email report")),(0,i.tZ)(g.v.Divider,null)):S?(0,i.tZ)(o.Fragment,null,(0,i.tZ)(f.$i,{overlay:(0,i.tZ)(g.v,{selectable:!1,css:re},(0,i.tZ)(g.v.Item,null,(0,h.t)("Email reports active"),(0,i.tZ)(m.r,{checked:w,onClick:e=>E(S,e),size:"small",css:(0,i.iv)({marginLeft:2*M.gridUnit},"","")})),(0,i.tZ)(g.v.Item,{onClick:()=>F(!0)},(0,h.t)("Edit email report")),(0,i.tZ)(g.v.Item,{onClick:()=>I(S),css:G},(0,h.t)("Delete email report"))),trigger:["click"],getPopupContainer:e=>e.closest(".action-button")},(0,i.tZ)("span",{role:"button",className:"action-button action-schedule-report",tabIndex:0},(0,i.tZ)(p.Z.Calendar,null)))):(0,i.tZ)("span",{role:"button",title:(0,h.t)("Schedule email report"),tabIndex:0,className:"action-button action-schedule-report",onClick:()=>F(!0)},(0,i.tZ)(p.Z.Calendar,null)),D&&(0,i.tZ)(y.Z,{description:(0,h.t)("This action will permanently delete %s.",null==D?void 0:D.name),onConfirm:()=>{D&&(async e=>{await x((0,C.MZ)(e)),I(null)})(D)},onHide:()=>I(null),open:!0,title:(0,h.t)("Delete Report?")})))}},73192:(e,t,n)=>{n.d(t,{r:()=>l}),n(67294);var r=n(51995),a=n(40987),i=n(11965);const o=(0,r.iK)(a.Z)`
  .ant-switch-checked {
    background-color: ${e=>{let{theme:t}=e;return t.colors.primary.base}};
  }
`,l=e=>(0,i.tZ)(o,e)},98978:(e,t,n)=>{n.d(t,{Z:()=>x});var r=n(11965),a=n(67294),i=n(80008),o=n.n(i),l=n(55867),s=n(4715);const d="GMT Standard Time",c="400px",u={"-300-240":["Eastern Standard Time","Eastern Daylight Time"],"-360-300":["Central Standard Time","Central Daylight Time"],"-420-360":["Mountain Standard Time","Mountain Daylight Time"],"-420-420":["Mountain Standard Time - Phoenix","Mountain Standard Time - Phoenix"],"-480-420":["Pacific Standard Time","Pacific Daylight Time"],"-540-480":["Alaska Standard Time","Alaska Daylight Time"],"-600-600":["Hawaii Standard Time","Hawaii Daylight Time"],60120:["Central European Time","Central European Daylight Time"],"00":[d,d],"060":["GMT Standard Time - London","British Summer Time"]},h=o()(),p=o()([2021,1]),m=o()([2021,7]),g=e=>p.tz(e).utcOffset().toString()+m.tz(e).utcOffset().toString(),v=e=>{var t,n;const r=g(e);return(h.tz(e).isDST()?null==(t=u[r])?void 0:t[1]:null==(n=u[r])?void 0:n[0])||e},b=o().tz.countries().map((e=>o().tz.zonesForCountry(e,!0))).flat(),f=[];b.forEach((e=>{f.find((t=>g(t.name)===g(e.name)))||f.push(e)}));const y=f.map((e=>({label:`GMT ${o().tz(h,e.name).format("Z")} (${v(e.name)})`,value:e.name,offsets:g(e.name),timezoneName:e.name}))),Z=(e,t)=>o().tz(h,e.timezoneName).utcOffset()-o().tz(h,t.timezoneName).utcOffset();function x(e){let{onTimezoneChange:t,timezone:n,minWidth:i=c}=e;const d=(0,a.useMemo)((()=>(e=>{var t;return(null==(t=y.find((t=>t.offsets===g(e))))?void 0:t.value)||"Africa/Abidjan"})(n||o().tz.guess())),[n]);return(0,a.useEffect)((()=>{n!==d&&t(d)}),[d,t,n]),(0,r.tZ)(s.Ph,{ariaLabel:(0,l.t)("Timezone selector"),css:(0,r.iv)({minWidth:i},"",""),onChange:e=>t(e),value:d,options:y,sortComparator:Z})}y.sort(Z)},87915:(e,t,n)=>{n.d(t,{U:()=>r,g:()=>a});const r=(e,t)=>Object.values(e).filter((e=>e[t])).reduce(((e,n)=>({...e,[n.id]:t?n[t]:n})),{}),a=e=>{let{chartConfiguration:t,nativeFilters:n,dataMask:r,allSliceIds:a}=e;const i={};return Object.values(r).forEach((e=>{var r,o,l,s,d,c;let{id:u,extraFormData:h}=e;const p=null!=(r=null!=(o=null!=(l=null==n||null==(s=n[u])?void 0:s.chartsInScope)?l:null==t||null==(d=t[u])||null==(c=d.crossFilters)?void 0:c.chartsInScope)?o:a)?r:[];i[u]={scope:p,values:h}})),i}},91914:(e,t,n)=>{n.d(t,{Z:()=>u});var r=n(78580),a=n.n(r),i=n(1510),o=n(99543);function l(e){return Object.entries(e).map((e=>{let[t,n]=e;return{col:t,op:Array.isArray(n)?"IN":"==",val:n}})).filter((e=>null!==e.val))}var s=n(87915);const d={},c={};function u(e){let{chart:t,filters:n,nativeFilters:r,chartConfiguration:u,colorScheme:h,colorNamespace:p,sliceId:m,dataMask:g,extraControls:v,labelColors:b,sharedLabelColors:f,allSliceIds:y}=e;const Z=c[m];if(d[m]===n&&(0,o.JB)(null==Z?void 0:Z.color_scheme,h,{ignoreUndefined:!0})&&(0,o.JB)(null==Z?void 0:Z.color_namespace,p,{ignoreUndefined:!0})&&(0,o.JB)(null==Z?void 0:Z.label_colors,b,{ignoreUndefined:!0})&&(0,o.JB)(null==Z?void 0:Z.shared_label_colors,f,{ignoreUndefined:!0})&&Z&&(0,o.JB)(null==Z?void 0:Z.dataMask,g,{ignoreUndefined:!0})&&(0,o.JB)(null==Z?void 0:Z.extraControls,v,{ignoreUndefined:!0}))return Z;let x={};const S=(0,s.g)({chartConfiguration:u,dataMask:g,nativeFilters:r,allSliceIds:y}),C=Object.entries(S).filter((e=>{let[,{scope:n}]=e;return a()(n).call(n,t.id)})).map((e=>{let[t]=e;return t}));C.length&&(x={extra_form_data:(0,i.vk)(g,C)});const w={...t.form_data,label_colors:b,shared_label_colors:f,...h&&{color_scheme:h},extra_filters:l(n),...x,...v};return d[m]=n,c[m]={...w,dataMask:g,extraControls:v},w}},95345:(e,t,n)=>{n.d(t,{c9:()=>P,Tg:()=>O});var r,a=n(67294),i=n(51995),o=n(55867),l=n(70163),s=n(71262),d=n(91877),c=n(93185),u=n(61337);!function(e){e.Results="results",e.Samples="samples"}(r||(r={}));var h=n(11064),p=n(55786),m=n(38703),g=n(94301),v=n(52256),b=n(98286),f=n(76962),y=n(50909),Z=n(4788),x=n.n(Z),S=n(78580),C=n.n(S),w=n(88889),T=n(11965),k=n(54076),D=n(61587);const $=i.iK.div`
  ${e=>{let{theme:t}=e;return`\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    margin-bottom: ${2*t.gridUnit}px;\n\n    span {\n      flex-shrink: 0;\n    }\n  `}}
`,I=e=>{let{data:t,datasourceId:n,onInputChange:r,columnNames:i,columnTypes:o,isLoading:l}=e;const s=(0,D.W)(n),d=x()(i,o).filter((e=>{let[t,n]=e;return n===w.Z.TEMPORAL&&t&&!C()(s).call(s,t)})).map((e=>{let[t]=e;return t})),c=(0,a.useMemo)((()=>(0,k.cD)(t,d)),[t,d]);return(0,T.tZ)($,null,(0,T.tZ)(y.HS,{onChangeHandler:r}),(0,T.tZ)("div",{css:T.iv`
          display: flex;
          align-items: center;
        `},(0,T.tZ)(y.uy,{data:t,loading:l}),(0,T.tZ)(y.m,{data:c,columns:i})))},M=e=>{let{data:t,colnames:n,coltypes:r,datasourceId:i,dataSize:l=50,isVisible:s}=e;const[d,c]=(0,a.useState)(""),u=(0,y._q)(n,r,t,i,s),h=(0,y.C4)(d,t);return(0,T.tZ)(a.Fragment,null,(0,T.tZ)(I,{data:h,columnNames:n,columnTypes:r,datasourceId:i,onInputChange:e=>c(e),isLoading:!1}),(0,T.tZ)(f.Z,{columns:u,data:h,pageSize:l,noDataText:(0,o.t)("No results"),emptyWrapperType:f.u.Small,className:"table-condensed",isPaginationSticky:!0,showRowCount:!1,small:!0}))},_=i.iK.pre`
  margin-top: ${e=>{let{theme:t}=e;return 4*t.gridUnit+"px"}};
`,R=new WeakMap,F=e=>{var t;let{isRequest:n,queryFormData:r,queryForce:i,ownState:l,errorMessage:s,actions:d,isVisible:c,dataSize:u=50}=e;const f=(0,h.Z)().get((null==r?void 0:r.viz_type)||(null==r?void 0:r.vizType)),[y,Z]=(0,a.useState)([]),[x,S]=(0,a.useState)(!0),[C,w]=(0,a.useState)(""),k=null!=(t=null==f?void 0:f.queryObjectCount)?t:1;if((0,a.useEffect)((()=>{s||(n&&R.has(r)&&(Z((0,p.Z)(R.get(r))),w(""),i&&d&&d.setForceQuery(!1),S(!1)),n&&!R.has(r)&&(S(!0),(0,v.getChartDataRequest)({formData:r,force:i,resultFormat:"json",resultType:"results",ownState:l}).then((e=>{let{json:t}=e;Z((0,p.Z)(t.result)),w(""),R.set(r,t.result),i&&d&&d.setForceQuery(!1)})).catch((e=>{(0,b.O$)(e).then((e=>{let{error:t,message:n}=e;w(t||n||(0,o.t)("Sorry, an error occurred"))}))})).finally((()=>{S(!1)}))))}),[r,n]),(0,a.useEffect)((()=>{s&&S(!1)}),[s]),x)return Array(k).fill((0,T.tZ)(m.Z,null));if(s){const e=(0,o.t)("Run a query to display results");return Array(k).fill((0,T.tZ)(g.x3,{image:"document.svg",title:e}))}if(C){const e=(0,T.tZ)(a.Fragment,null,(0,T.tZ)(I,{data:[],columnNames:[],columnTypes:[],datasourceId:r.datasource,onInputChange:()=>{},isLoading:!1}),(0,T.tZ)(_,null,C));return Array(k).fill(e)}if(0===y.length){const e=(0,o.t)("No results were returned for this query");return Array(k).fill((0,T.tZ)(g.x3,{image:"document.svg",title:e}))}return y.slice(0,k).map(((e,t)=>(0,T.tZ)(M,{data:e.data,colnames:e.colnames,coltypes:e.coltypes,dataSize:u,datasourceId:r.datasource,key:t,isVisible:c})))},E=i.iK.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  .ant-tabs {
    height: 100%;
  }

  .ant-tabs-content {
    height: 100%;
  }

  .ant-tabs-tabpane {
    display: flex;
    flex-direction: column;
  }

  .table-condensed {
    overflow: auto;
  }
`,O=e=>{let{isRequest:t,queryFormData:n,queryForce:a,ownState:i,errorMessage:l,actions:d,isVisible:c,dataSize:u=50}=e;const h=F({errorMessage:l,queryFormData:n,queryForce:a,ownState:i,isRequest:t,actions:d,dataSize:u,isVisible:c});if(1===h.length)return(0,T.tZ)(E,null,h[0]);const p=h.map(((e,t)=>0===t?(0,T.tZ)(s.ZP.TabPane,{tab:(0,o.t)("Results"),key:r.Results},e):(0,T.tZ)(s.ZP.TabPane,{tab:(0,o.t)("Results %s",t+1),key:`${r.Results} ${t+1}`},e)));return(0,T.tZ)(E,null,(0,T.tZ)(s.ZP,{fullWidth:!1},p))},A=i.iK.pre`
  margin-top: ${e=>{let{theme:t}=e;return 4*t.gridUnit+"px"}};
`,U=new WeakSet,z=e=>{let{isRequest:t,datasource:n,queryForce:r,actions:i,dataSize:l=50,isVisible:s}=e;const[d,c]=(0,a.useState)(""),[u,h]=(0,a.useState)([]),[b,Z]=(0,a.useState)([]),[x,S]=(0,a.useState)([]),[C,w]=(0,a.useState)(!1),[k,D]=(0,a.useState)(""),$=(0,a.useMemo)((()=>`${n.id}__${n.type}`),[n]);(0,a.useEffect)((()=>{t&&r&&U.delete(n),t&&!U.has(n)&&(w(!0),(0,v.getDatasourceSamples)(n.type,n.id,r,{}).then((e=>{h((0,p.Z)(e.data)),Z((0,p.Z)(e.colnames)),S((0,p.Z)(e.coltypes)),D(""),U.add(n),r&&i&&i.setForceQuery(!1)})).catch((e=>{h([]),Z([]),S([]),D(`${e.name}: ${e.message}`)})).finally((()=>{w(!1)})))}),[n,t,r]);const M=(0,y._q)(b,x,u,$,s),_=(0,y.C4)(d,u);if(C)return(0,T.tZ)(m.Z,null);if(k)return(0,T.tZ)(a.Fragment,null,(0,T.tZ)(I,{data:_,columnNames:b,columnTypes:x,datasourceId:$,onInputChange:e=>c(e),isLoading:C}),(0,T.tZ)(A,null,k));if(0===u.length){const e=(0,o.t)("No samples were returned for this dataset");return(0,T.tZ)(g.x3,{image:"document.svg",title:e})}return(0,T.tZ)(a.Fragment,null,(0,T.tZ)(I,{data:_,columnNames:b,columnTypes:x,datasourceId:$,onInputChange:e=>c(e),isLoading:C}),(0,T.tZ)(f.Z,{columns:M,data:_,pageSize:l,noDataText:(0,o.t)("No results"),emptyWrapperType:f.u.Small,className:"table-condensed",isPaginationSticky:!0,showRowCount:!1,small:!0}))},N=i.iK.div`
  ${e=>{let{theme:t}=e;return`\n    position: relative;\n    background-color: ${t.colors.grayscale.light5};\n    z-index: 5;\n    overflow: hidden;\n\n    .ant-tabs {\n      height: 100%;\n    }\n\n    .ant-tabs-content-holder {\n      height: 100%;\n    }\n\n    .ant-tabs-content {\n      height: 100%;\n    }\n\n    .ant-tabs-tabpane {\n      display: flex;\n      flex-direction: column;\n      height: 100%;\n\n      .table-condensed {\n        height: 100%;\n        overflow: auto;\n        margin-bottom: ${4*t.gridUnit}px;\n\n        .table {\n          margin-bottom: ${2*t.gridUnit}px;\n        }\n      }\n\n      .pagination-container > ul[role='navigation'] {\n        margin-top: 0;\n      }\n    }\n  `}}
`,P=e=>{let{queryFormData:t,datasource:n,queryForce:h,onCollapseChange:p,chartStatus:m,ownState:g,errorMessage:v,actions:b}=e;const f=(0,i.Fg)(),[y,Z]=(0,a.useState)(r.Results),[x,S]=(0,a.useState)({results:!1,samples:!1}),[C,w]=(0,a.useState)(!(0,d.cr)(c.T.DATAPANEL_CLOSED_BY_DEFAULT)&&(0,u.rV)(u.dR.is_datapanel_open,!1));(0,a.useEffect)((()=>{(0,d.cr)(c.T.DATAPANEL_CLOSED_BY_DEFAULT)||(0,u.LS)(u.dR.is_datapanel_open,C)}),[C]),(0,a.useEffect)((()=>{C||S({results:!1,samples:!1}),C&&y.startsWith(r.Results)&&"rendered"===m&&S({results:!0,samples:!1}),C&&y===r.Samples&&S({results:!1,samples:!0})}),[C,y,m]);const k=(0,a.useCallback)((e=>{p(e),w(e)}),[p]),D=(0,a.useCallback)(((e,t)=>{C?e===y&&(t.preventDefault(),k(!1)):k(!0),Z(e)}),[y,k,C]),I=(0,a.useMemo)((()=>{const e=C?(0,T.tZ)(l.Z.CaretUp,{iconColor:f.colors.grayscale.base,"aria-label":(0,o.t)("Collapse data panel")}):(0,T.tZ)(l.Z.CaretDown,{iconColor:f.colors.grayscale.base,"aria-label":(0,o.t)("Expand data panel")});return(0,T.tZ)($,null,C?(0,T.tZ)("span",{role:"button",tabIndex:0,onClick:()=>k(!1)},e):(0,T.tZ)("span",{role:"button",tabIndex:0,onClick:()=>k(!0)},e))}),[k,C,f.colors.grayscale.base]),M=F({errorMessage:v,queryFormData:t,queryForce:h,ownState:g,isRequest:x.results,actions:b,isVisible:r.Results===y}).map(((e,t)=>0===t?(0,T.tZ)(s.ZP.TabPane,{tab:(0,o.t)("Results"),key:r.Results},e):t>0?(0,T.tZ)(s.ZP.TabPane,{tab:(0,o.t)("Results %s",t+1),key:`${r.Results} ${t+1}`},e):null));return(0,T.tZ)(N,null,(0,T.tZ)(s.ZP,{fullWidth:!1,tabBarExtraContent:I,activeKey:C?y:"",onTabClick:D},M,(0,T.tZ)(s.ZP.TabPane,{tab:(0,o.t)("Samples"),key:r.Samples},(0,T.tZ)(z,{datasource:n,queryForce:h,isRequest:x.samples,actions:b,isVisible:r.Samples===y}))))}},15423:(e,t,n)=>{n.d(t,{Z:()=>p});var r=n(67294),a=n(51995),i=n(55786),o=n(55867),l=n(38703),s=n(98286),d=n(52256),c=n(85626),u=n(11965);const h=a.iK.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`,p=e=>{const[t,n]=(0,r.useState)([]),[a,p]=(0,r.useState)(!1),[m,g]=(0,r.useState)(null);return(0,r.useEffect)((()=>{p(!0),(0,d.getChartDataRequest)({formData:e.latestQueryFormData,resultFormat:"json",resultType:"query"}).then((e=>{let{json:t}=e;n((0,i.Z)(t.result)),p(!1),g(null)})).catch((e=>{(0,s.O$)(e).then((t=>{let{error:n,message:r}=t;g(n||r||e.statusText||(0,o.t)("Sorry, An error occurred")),p(!1)}))}))}),[JSON.stringify(e.latestQueryFormData)]),a?(0,u.tZ)(l.Z,null):m?(0,u.tZ)("pre",null,m):(0,u.tZ)(h,null,t.map((e=>e.query?(0,u.tZ)(c.Z,{sql:e.query,language:e.language||void 0}):null)))}},28615:(e,t,n)=>{n.d(t,{S:()=>i});var r=n(67294),a=n(60812);function i(e,t){const n=(0,a.D)(e);(0,r.useEffect)((()=>{e!==n&&t(n,e)}),[e,n,t])}},6954:(e,t,n)=>{n.d(t,{z:()=>l});var r=n(67294),a=n(14670),i=n.n(a);const o=new(n(11133).g0)("tab_id_channel");function l(){const[e,t]=(0,r.useState)();return(0,r.useEffect)((()=>{if(!function(){try{return window.localStorage&&window.sessionStorage}catch(e){return!1}}())return void(e||t(i().generate()));const n=()=>{const e=window.localStorage.getItem("last_tab_id"),n=String(e?Number.parseInt(e,10)+1:1);window.sessionStorage.setItem("tab_id",n),window.localStorage.setItem("last_tab_id",n),t(n)},r=window.sessionStorage.getItem("tab_id");r?(o.postMessage({type:"REQUESTING_TAB_ID",tabId:r}),t(r)):n(),o.onmessage=t=>{if(t.tabId===e)if("REQUESTING_TAB_ID"===t.type){const e={type:"TAB_ID_DENIED",tabId:t.tabId};o.postMessage(e)}else"TAB_ID_DENIED"===t.type&&n()}}),[e]),e}},56727:(e,t,n)=>{n.d(t,{Z:()=>h});var r=n(78580),a=n.n(r),i=n(46926),o=n.n(i),l=n(21804),s=n.n(l),d=n(55867),c=n(51995),u=n(72570);function h(e,t,n){return void 0===n&&(n=!1),r=>{const i=n?document.querySelector(e):r.currentTarget.closest(e);return i?o().toJpeg(i,{quality:.95,bgcolor:c.K6.colors.grayscale.light4,filter:e=>{var t;return"string"!=typeof e.className||"mapboxgl-control-container"!==e.className&&!a()(t=e.className).call(t,"ant-dropdown")}}).then((e=>{const n=document.createElement("a");n.download=`${function(e,t){return void 0===t&&(t=new Date),`${s()(e)}-${t.toISOString().replace(/[: ]/g,"-")}`}(t)}.jpg`,n.href=e,n.click()})).catch((e=>{console.error("Creating image failed",e)})):(0,u.Dz)((0,d.t)("Image download failed, please refresh and try again."))}}},75701:(e,t,n)=>{n.d(t,{J:()=>o});var r=n(55867);const a=(0,r.t)("Create chart"),i=(0,r.t)("Update chart"),o=e=>(0,r.t)("Select values in highlighted field(s) in the control panel. Then run the query by clicking on the %s button.",`"${e?a:i}"`)},71894:(e,t,n)=>{n.d(t,{b:()=>r});const r=()=>{var e,t;return null==(e=window)||null==(t=e.navigator)?void 0:t.webdriver}}}]);
//# sourceMappingURL=7150435156216fd063e1.chunk.js.map