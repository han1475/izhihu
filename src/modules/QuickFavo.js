/**
 * @class QuickFavo
 */
function QuickFavo(iZhihu) {
    if ( typeof iZhihu === 'undefined' || !iZhihu || !iZhihu.config['QuickFavo']) {
        return null;
    }
    iZhihu.QuickFavo = this;
    
    this.DefaultCount = 4;
    this.PinnedList = iZhihu.config['QuickFavoPinned'];
    this.css = 
        ['.izh-Pin4QuickFavo{padding:0 5px;float:right;display:block;margin-top:4px;margin-right:2em;line-height:1.25;}'
        ,'.izh-Pin4QuickFavo .zm-item-top-btn{visibility:visible;margin:0 4px;float:right;}'
        ,'div.izh_fav{position:absolute;z-index:9999;display:none;border:1px solid #999999;background-color:#fff;border-radius:5px 5px 0 0;margin-left:-1px;}'
        ,'div.izh_fav .title{padding:0 5px;background-color:#0874c4;color:#fff;font-weight:bold;font-size:15px;text-align:center;border-radius:3px 3px 0 0;}'
        ,'div.izh_fav a.fav{display:block;clear:both;float;left;padding:0 36px 0 24px;line-height:2;}'
        ,'div.izh_fav a.fav i.z-icon-collect{visibility:hidden;background-position:-56px -36px;position:absolute;left:10px;margin-top:0.5em;}'
        ,'div.izh_fav a.fav.selected i.z-icon-collect{visibility:visible;}'
        ,'div.izh_fav a.fav:hover{text-decoration:none}'
        ,'div.izh_fav a.fav span{float:right;display:block;margin-right:-32px}'
        ,'.meta-item.on{position:relative;z-index:10000;background-color:#fff;border:1px solid #999999;border-top-color:#fff;margin:-1px -8px -1px -1px;padding:0 7px;border-radius:2px 2px 3px 3px;}'
        ,''].join('\n');
    this.addQuickFavo = function($v,$ai){
        if($v.length){
            var $a=$ai
              , $m=$v.closest('.zm-item-meta');
            if(pageIs.Answers||pageIs.Collection||pageIs.Roundtable){
                $a=$ai.find('.zm-item-answer');
            }else if(pageIs.Debuts){
                $a=$ai.find('.entry-body');
            }
            if($m.parent().children('.izh_fav').length<=0){
                $('<div class="izh_fav">loading...</div>').bind('mouseover',function(){
                    $(this).show().parent().find('.meta-item[name=favo]').addClass('on');
                }).bind('mouseout',function(){
                    $(this).hide().parent().find('.meta-item[name=favo]').removeClass('on');
                }).appendTo($m.parent());
            }
            $v.bind('mouseenter',function(){
                var $m=$(this).addClass('on').closest('.zm-item-meta')
                  , $ai=iZhihu.getItem($m)
                  , $a=pageIs.Answers||pageIs.Collection||pageIs.Roundtable?$m.closest('.zm-item-answer')
                        :pageIs.Debuts?$m.prev('.entry-body')
                        :$ai
                  , aid=$a.attr('data-aid')
                  , $op=$(this).offsetParent()
                  , bottom1=parseInt($op.css('margin-bottom'))
                  , bottom2=parseInt($a.css('padding-bottom'))+pageIs.Debuts?10:0
                ;
                $ai.find('.izh_fav').css({
                    'bottom':(isNaN(bottom1)?0:bottom1)+(isNaN(bottom2)?0:bottom2)+$op.height()-$(this).position().top
                  , 'left':$(this).position().left
                }).html('loading...').show();
                $.getJSON('http://www.zhihu.com/collections/json',$.param({answer_id:aid}),function(result,status,xhr){
                    var aid=this.url.substr(this.url.indexOf('answer_id=')+10)
                      , sel=pageIs.Question?'.zm-item-answer'
                           :pageIs.Home?'.feed-item'
                           :pageIs.Answer?'.zm-item-answer'
                           :pageIs.Answers||pageIs.Collection||pageIs.Roundtable?'.zm-item-answer'
                           :pageIs.Debuts?'.entry-body'
                           :''
                      , $a=''==sel?null:$(sel+'[data-aid='+aid+']')
                      , $ai=''==sel?null:iZhihu.getItem($a)
                      , $v=''==sel?null:$ai.find('.izh_fav').html([
                            '<div class="title"title="以下为最近选择的收藏夹">快速收藏</div>'
                          //, '<div class="pinned"></div><div class="normal"></div>'
                        ].join(''))
                    ;
                    if(''==sel)return;
                    var favAll=result.msg[0]
                      , favSel=result.msg[1]
                      , num=iZhihu.QuickFavo.DefaultCount
                      , fav=new Array()
                      , favNormal=new Array()
                    ;
                    $.each(favAll,function(i,e){
                        var fID=e[0]
                          , pinned=iZhihu.QuickFavo.PinnedList[fID]
                        ;
                        if(pinned){
                          fav.push(e);
                        }else{
                          favNormal.push(e);
                        }
                    });
                    num -= fav.length;
                    if(num > 0){
                        fav=fav.concat(favNormal.slice(0,num));
                    }
                    favNormal.length=0;
                    while(fav.length){
                        var e=fav.shift()
                          , fID=e[0]
                          , fName=e[1]
                        ;
                        favNormal[fID]=fName;
                        var $f=$('<a/>',{
                                'class':'fav'
                              , href:'javascript:;'
                              , aid:aid
                              , fid:fID
                              , html:fName
                            }).click(function(){
                                var u='http://www.zhihu.com/collection/';
                                u+=$(this).hasClass('selected')?'remove':'add';
                                $.post(u,$.param({answer_id:$(this).attr('aid'),favlist_id:$(this).attr('fid')}),function(result){
                                    var act=this.url.substring(this.url.lastIndexOf('/')+1)
                                      , fid=utils.getParamInQuery(this.data,'favlist_id')
                                      , aid=utils.getParamInQuery(this.data,'answer_id')
                                      , sel=pageIs.Question?'.zm-item-answer'
                                           :pageIs.Home?'.feed-item'
                                           :pageIs.Answer?'.zm-item-answer'
                                           :pageIs.Answers||pageIs.Collection||pageIs.Roundtable?'.zm-item-answer'
                                           :pageIs.Debuts?'.entry-body'
                                           :''
                                      , $a=''==sel?null:$(sel+'[data-aid='+aid+']')
                                      , $ai=''==sel?null:iZhihu.getItem($a)
                                      , $vi=''==sel?null:$ai.find('.izh_fav a[fid='+fid+']')
                                      , inc=0;
                                    if(''==sel)return;
                                    if(act=='remove'&&result.msg=='OK'){
                                        $vi.removeClass('selected');
                                        inc=-1;
                                    }else if(act=='add'&&result.msg.length){
                                        $vi.addClass('selected');
                                        inc=1;
                                    }
                                    if(inc!=0){
                                        $vi.children('span').html(parseInt($vi.children('span').html())+inc);
                                    }
                                });
                            }).prepend($('<i/>',{'class':'z-icon-collect'}))
                              .append($('<span/>',{html:e[3]}));
                        $f.appendTo($v/*.children(pinned?'.pinned':'.normal')*/);
                    };
                    $.each(favSel,function(i,e){
                        if(favNormal[e])
                            $v.find('a.fav[fid='+e+']').addClass('selected');
                    });
                });
            });
            $v.bind('mouseleave',function(){
                var $a=iZhihu.getItem($(this).removeClass('on'));
                $a.find('.izh_fav').hide();
            });
        }
    };

    iZhihu.$body.bind('DOMNodeInserted',function(event){
		var $e=$(event.target);
		if($e.is('.modal-dialog')){
			$e.bind('DOMNodeInserted',function(event){
				var $e=$(event.target)
                  , $favList=$e.find('.zm-favo-list-content')
                ;
				if($favList.length){
					var $favItems=$favList.children('.zm-favo-list-item-link[data-lid]')
                      , funcPin=function(e){
                            var pinned=e.checked
                              , $e=$(e)
                              , $f=$e.closest('.zm-favo-list-item-link')
                            ;if(!$f.length)return;
                            var lid=$e.attr('lid')
                              , $checks=$e.closest('.zm-favo-list-content').find('.izh-Pin4QuickFavo .t_jchkbox')
                              , time=50
                              , cssStart={position:'relative','background-color':'#0874C4','z-index':'100'}
                              , cssEnd={position:'','background-color':'','z-index':''}
                              , funcRollUp=function(){
                                    var $b=$e.closest('.zm-favo-list-item-link')
                                      , $a=$b.prev()
                                    ;
                                    if(!$a.length||($a.hasClass('pinned')&&parseInt($a.attr('data-lid'))<parseInt($b.attr('data-lid')))){
                                        return;
                                    }
                                    $b.animate({bottom:$a.outerHeight()},{
                                        duration:time
                                      , step:function(now){$b.css(cssStart);}
                                      , complete:function(){
                                            $b.css($.extend({bottom:0},cssEnd));
                                            $b.insertBefore($a);
                                            funcRollUp();
                                        }
                                    });
                                }
                              , funcRollDown=function(){
                                    var $a=$e.closest('.zm-favo-list-item-link')
                                      , $b=$a.next()
                                    ;
                                    if(!$b.length||(!$b.hasClass('pinned')&&parseInt($b.attr('index'))>parseInt($a.attr('index')))){
                                        return;
                                    }
                                    $a.animate({top:$b.outerHeight()},{
                                        duration:time
                                      , step:function(now){$a.css(cssStart);}
                                      , complete:function(){
                                            $a.css($.extend({top:0},cssEnd));
                                            $a.insertAfter($b);
                                            funcRollDown();
                                        }
                                    });
                                }
                            ;
                            if(pinned){
                                $f.addClass('pinned');
                                funcRollUp();
                            }else{
                                $f.removeClass('pinned');
                                funcRollDown();
                            }
                            iZhihu.QuickFavo.PinnedList[lid]=pinned;
                            utils.setCfg('QuickFavoPinned',iZhihu.QuickFavo.PinnedList);
                        }
                    ;
					$favItems.each(function(i,e){
						var lid=e.getAttribute('data-lid')
                          , $pin=$('<a/>',{
                                href:'javascript:void(0);'
                              , 'class':'izh-Pin4QuickFavo'
                              , 'lid':lid
                              , 'data-tip':'s$b$保持在「快速收藏」菜单顶部显示'
                            }).append($('<span/>',{html:'置顶'}).add('<i/>',{'class':'zm-item-top-btn'}))
                              .appendTo($('.zg-gray',e)).attr('index',i)
                        ;
                        e.setAttribute('index',i);
                        $pin.bind('click',function(event){
                            this.checked=!this.checked;
                            funcPin(this);
                            if(this.checked){
                                $(this).children('span').html('取消置顶');
                                $(this).children('i').addClass('zm-item-top-btn-cancel');
                            }else{
                                $(this).children('span').html('置顶');
                                $(this).children('i').removeClass('zm-item-top-btn-cancel');
                            }
                            if(event.preventDefault)
                                event.preventDefault();
                            else if(event.stopPropagation)
                                event.stopPropagation();
                            else
                                event.cancelBubble=true;
                            return false;
                        })[0].checked=false;
                        if(iZhihu.QuickFavo.PinnedList[lid]){
                            $pin.click();
                        }
					});
				}
			});
		}
	});

    return this;
}
