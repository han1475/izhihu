allLinks=function(name,listSel,listName){
	this.name=name;
	this.listSel=listSel;
	this.listName=listName;
	this.dlgID='izh-dlg-'+name;
    this.$dlg=null;
    //初始化弹出框
    this.initDialog = function(){
      this.$dlg=$('#'+this.dlgID);
	  var retVal=0<this.$dlg.length;
      if(!retVal){
        var dom = [
          '<div id="'+this.dlgID+'" class="modal-dialog" tabindex="0" style="display: none;width:500px">',
            '<div class="modal-dialog-title modal-dialog-title-draggable">',
              '<span class="modal-dialog-title-text">'+this.listName+'链接清单</span>',
              '<span class="modal-dialog-title-text izhihu-collection-info"></span>',
              '<span class="modal-dialog-title-close"></span>',
            '</div>',
            '<div class="modal-dialog-content">',
              '<div>',
                '<div class="zg-section">',
                  '<div class="izhihu-collection-links" tabIndex="-1" class="zg-form-text-input" style="height:300px;overflow-y:scroll;outline:none;">',
                    //'<textarea style="width: 100%; height: 132px;" id="izhihu-collection-links" class="zu-seamless-input-origin-element"></textarea>',
                  '</div>',
                '</div>',
                '<div class="zm-command">',
                  '<div class="zg-left">',
                  '<a class="zg-btn-blue reload" href="javascript:;">重新获取</a>',
                  '</div>',
                  //'<a class="zm-command-cancel" name="cancel" href="javascript:;">取消</a>',
                  '<a class="zg-btn-blue copy" href="javascript:;">复制到剪贴板</a>',
                  '<a class="zg-btn-blue selAll" href="javascript:;">选择全部</a>',
                '</div>',
              '</div>',
            '</div>',
          '</div>'
        ].join('');
        
        this.$dlg = $(dom).appendTo(document.body);
		if(this.$dlg.length)
			retVal=true;

        $('.modal-dialog-title-close',this.$dlg).click(function(){
          $('.modal-dialog-bg').hide();
          $(this).parentsUntil('.modal-dialog').parent().hide();
        });

        //拖动
        this.$dlg.drags({handler:'.modal-dialog-title-draggable'});

        $('.copy',this.$dlg).click(function(){
        	var s = new Array();
        	$('.izhihu-collection-links a',$(this).parentsUntil('.modal-dialog-content').parent()).each(function(i,e){
        		s.push(e.getAttribute('href'));
        	});
        	//copyToClipboard(txt);
        	GM_setClipboard('test','html');//s.join('<br/>')
        	alert('已复制 :)');
        }).hide();
        
        $('.selAll',this.$dlg).click(function(){
            var $e=$(this).parentsUntil('.modal-dialog-content').parent().find('.izhihu-collection-links');
            if($e.length)
                selectText($e.get(0));
        });
        
        $('.reload',this.$dlg).click(function(){
            result = [];
            $('.izhihu-collection-links',$(this).parentsUntil('.modal-dialog-content').parent()).empty();
            handler([$('.zm-item',this.listSel).size(), $(this.listSel).html(), $('#zh-load-more').attr('data-next')]
					,$(this).parentsUntil('.modal-dialog').parent());
        });
      }
	  return retVal;
    };
};

//分析内容
var processNode = function(content,$dlg){
  $(content).filter('.zm-item').each(function(index, item){
	var dom = $(item);
	var obj = {
	  title: dom.find('.zm-item-title a').text(),
	  questionUrl: dom.find('.zm-item-title a').attr('href'),
	  answerUrl: url.data.attr['base']+dom.find('.answer-date-link-wrap a').attr('href'),
	  answerAuthor: dom.find('.zm-item-answer-author-wrap a[href^="/people"]').text().trim(),
	  summary: dom.find('.zm-item-answer-summary').children().remove().end().text(),
	  content: dom.find('.zm-editable-content').html()
	};
	result.push(obj);
	var str = utils.formatStr('<li style="list-style-type:none"><a href="{answerUrl}" title="* 《{title}》&#13;* {answerAuthor}：&#13;* {summary}">{answerUrl}</a></li>', obj);
	$('.izhihu-collection-links',$dlg).append(str);
	$('.izhihu-collection-info',$dlg).html('（努力加载中...已得到记录 ' + result.length + ' 条）');
  });
};
    
//处理函数
var offset = 0;
var handler = function(msg,$dlg){
	var c=Number(msg[0])
	  , content=''
	  , start='-1';
	if(0){
//	if(isNaN(c)){
//		c=msg.length;
//		content=msg;
	}else{
		content=msg[1];
		start=String(msg[2]);
	}
  offset += c;

  processNode(content,$dlg);
  
  if(start !== '-1'){
	//eval('var param='+$('#zh-profile-answer-list').children().first().attr('data-init'));
	//$.extend(param.params,{offset:offset});
	var s=window.location;//url.data.attr.base+'/node/'+param.nodename;//
	$.post(s, $.param({
        offset: offset
      , start: start/*
      ,	method:'next'
	  , params:JSON.stringify(param.params)*/
    }),function(r){
	  handler(r.msg,$dlg);
	});
  }else{
	offset = 0;
	$('.izhihu-collection-info',$dlg).html('（加载完成，共得到记录 ' + result.length + ' 条）');
	$('#zh-global-spinner').hide();
	$('.selAll',$dlg).click();
  }
};

var w=unsafeWindow;
// 复制到剪贴板（未实现）
var copyToClipboard = function(txt){
	if(w.clipboardData){
		w.clipboardData.clearData();
		w.clipboardData.setData("Text", txt);
	}else if(navigator.userAgent.indexOf("Opera") != -1){
		w.location = txt;
	}else if(w.netscape){
		try{
			w.netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		}catch(e){
			alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
		}
		var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
		if (!clip)
			return;
		var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
		if (!trans)
			return;
		trans.addDataFlavor('text/unicode');
		var str = new Object();
		var len = new Object();
		var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		var copytext = txt;
		str.data = copytext;
		trans.setTransferData("text/unicode", str, copytext.length * 2);
		var clipid = Components.interfaces.nsIClipboard;
		if(!clip)
			return false;
		clip.setData(trans,null,clipid.kGlobalClipboard);
		alert("复制成功！");
	}
};

// 选中元素内文本
var selectText = function(element) {
	if(!element)return;
	var doc = document
		, range, selection
	;    
	if (doc.body.createTextRange) { //ms
		range = doc.body.createTextRange();
		range.moveToElementText(element);
		range.select();
	} else if (window.getSelection) { //all others
		selection = window.getSelection();        
		range = doc.createRange();
		range.selectNodeContents(element);
		selection.removeAllRanges();
		selection.addRange(range);
	}
};