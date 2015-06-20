$(function(){
	var nextPageNo,currentPage=parseInt(GetQueryString('pageNo'));
	var globalStatus = 100;
	
	function GetQueryString(name){
		 var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		 var r = window.location.search.substr(1).match(reg);
		 if(r!=null) return unescape(r[2]); 
		 return null;
	}
	function showCurrentPageNO(pn){
		$('#current').text(pn);
	}
	showCurrentPageNO(currentPage+1);
	//设置页码状态
	(function(){
		if(currentPage==0){
			$('#prevpage').addClass('hide');
		}
	})();
	$('#prevpage').on('click',function(event){ //  上一页
		prevPageNo = currentPage = currentPage-1;
		if(currentPage<0){
			$(this).addClass('hide');
			return;
		}
		getData(prevPageNo,globalStatus,$('#j-beginTime').val(),$('#j-endTime').val());
		showCurrentPageNO(currentPage+1);
	});
	
	$('#nextpage').on('click',function(event){//  下一页
		nextPageNo = currentPage = currentPage+1;
		if(currentPage>=1){
			$('#prevpage').removeClass('hide');
		}
		getData(nextPageNo,globalStatus,$('#j-beginTime').val(),$('#j-endTime').val());
		showCurrentPageNO(currentPage+1);
	});
	
	var tablebody = $('table tbody');
	
	function getData(newPN,orderStatusflag,beginDate,endDate){
		var d={};
		d.pageNo = newPN*10;
		d.pageSize = 10;
		d.orderStatus = orderStatusflag;
		beginDate && (d.beginDate = beginDate);
		endDate && (d.endDate = endDate);
		$.ajax({
			type:'GET',
			url:'./orders.do',
			dataType:'json',
			data:d,
			success:function(datas){
				var resdata = datas.data;
				if(resdata.length){
					for(var i=0,htmlstr='';i<resdata.length;i++){
						var currentRec = resdata[i], petBeauty = '',paystatus='',payway='',servicetype='',dateObj=new Date(currentRec.orderDate),y=dateObj.getFullYear(),m=dateObj.getMonth()+1,d=dateObj.getDate(),ordertime=new Date(currentRec.gmtCreate),ordy=ordertime.getFullYear(),ordmonth=ordertime.getMonth()+1,ordd=ordertime.getDate(),ordh=ordertime.getHours(),ordminuts=ordertime.getMinutes(),ords=ordertime.getSeconds();
						petBeauty = currentRec.shopName;//美宠师name
						switch(currentRec.orderStatus){
							case 0:
								paystatus = '待付款';
								break;
							case 1:
								paystatus = '已支付';
								break;
							case 2:
								paystatus = '已取消';
								break;
							case 3:
								paystatus = '已超时';
								break;
							case 4:
								paystatus = '<a href="/order/refund.do?accessToken=m3w4&orderId='+currentRec.id+'" target="_blank">申请退款</a>';
								break;
							case 5:
								paystatus = '退款完成';
								break;
							default :
								paystatus = '未知';
						}
						switch(currentRec.payWay){
							case 1:
								payway = '支付宝';
								break;
							case 2:
								payway = '微信';
								break;
							case 3:
								payway = '银联';
								break;
							default :
								payway = '未知';
						}
						switch(currentRec.orderType){
							case 1:
								servicetype = '洗澡';
								break;
							case 2:
								servicetype = '美容';
								break;
							default :
								servicetype = '未知';
						}
						tctit = currentRec.comboName;//套餐name				
						htmlstr += '<tr data-id="'+currentRec.id+'"><td>'+(newPN*10+i+1)+'</td><td><span  class="j-mark'+(currentRec.confirm?" marked":'')+'"></span></td><td><span class="j-editInfo" title="修改信息"><img width="18" src="../static/img/edit.png"></span></td><td>'+ordy+'-'+ordmonth+'-'+ordd+' '+ordh+':'+ordminuts+':'+ords+'</td><td>'+tctit+'</td><td><span class="j-modifypb">'+petBeauty+'</span></td><td>'+currentRec.orderMobile+'</td><td>'+currentRec.orderNum+'</td><td><span class="j-modifytime">'+y+'-'+m+'-'+d+' '+currentRec.orderHour+'</span>点</td><td>'+currentRec.address+'</td><td>'+payway+'</td><td>'+currentRec.sourceName+'</td><td>'+currentRec.price+'</td><td>'+paystatus+'</td><td>'+currentRec.orderCount+'</td></tr>';//<td>'+servicetype+'</td><td>'+(currentRec.hasEvaluated?'已评价':'未评价')+'</td><td>'+(currentRec.finished?'已完成':'未完成')+'</td>
					}
					
					tablebody.html(htmlstr);
					
					$('#nextpage').text('下一页').removeAttr('disabled');
				}else{
					tablebody.html('<tr><td colspan="14">无记录!</td></tr>');
					$('#nextpage').text('最后一页了').attr('disabled',true);
				}
			},
			error:function(err){
				alert(err);
			}
		});					
	}
	getData(0,100,$('#j-beginTime').val(),$('#j-endTime').val());

	//根据起止时间筛选订单
	$('#j-beginTime').datetimepicker({
		format: 'yyyy-mm-dd',
		autoclose:true,
		minView:2,
		todayHighlight:true,
		language:'zh-CN'
	});
	
	$('#j-endTime').datetimepicker({
		format: 'yyyy-mm-dd',
		autoclose:true,
		minView:2,
		todayHighlight:true,
		language:'zh-CN'
	});
	//search filter
	var orderType=100;
	$('#orderStatus').on('change',function(event){
		orderType = $(this).val();
	});
	$('#confirmFilter').on('click',function(event){
		getData(0,orderType,$('#j-beginTime').val(),$('#j-endTime').val());
		globalStatus = orderType;
		currentPage =0;
		showCurrentPageNO(0);
	});

	//获取美宠师信息列表
	var allPB = [],pbMap={};   //global 存储美容师列表
	$.ajax({
		type:'GET',
		url:'./shops.do',
		dataType:'json',
		success:function(data){
			if(data.success){
				for(var i=0;i<data.data.length;i++){
					allPB.push({"id":data.data[i].id,"name":data.data[i].name});
					pbMap[data.data[i].id] = data.data[i].name;
				}
			}else{
				alert('无法获取美容师，请刷新重试');
			}
		},
		error:function(err){
			alert('无法获取美容师，请刷新重试');
		}
	});

	$('table tbody').delegate('.j-editInfo','click',function(event){
		var oPen = $(event.currentTarget),oTr = oPen.parents('tr'),orderid=oTr.attr('data-id'),
			opb=$('.j-modifypb',oTr),opbname=opb.text(),otime=$('.j-modifytime',oTr),oldtime=otime.text();
		oPen.replaceWith('<button class="j-saveModify">OK</button>');
		if(!allPB.length){
			alert('无法获取美容师，请刷新重试');
		}else{//单个美容师更新为美容师列表
			for(var i=0,pbstr='<select class="j-selectPB">';i<allPB.length;i++){
				pbstr += '<option'+(allPB[i].name==opbname?' selected="selected"':'')+' value="'+allPB[i].id+'-'+allPB[i].name+'">'+allPB[i].name+'</option>';
			}
			pbstr += '</select>';
			opb.html(pbstr);
		}

		//修改预约日期
		otime.html('<input type="text" value="'+oldtime+'" class="j-changeTime" size="10">');
		var d = new Date();
		$('.j-changeTime',oTr).datetimepicker({
			format: 'yyyy-mm-dd hh',
			minView:1,
			hoursDisabled:[0,1,2,3,4,5,6,7,8,9,20,21,22,23,24],
			startDate:d.getFullYear()+'-'+d.getMonth()+1+'-'+d.getDate(),
			autoclose: true,
			todayHighlight:true,
			todayBtn: true,
			language:'zh-CN'
		});

		$('.j-saveModify',oTr).on('click',function(event){
			var timeinfo=$('.j-changeTime',oTr).val().split(' '),pbinfo=$('.j-selectPB',oTr).val().split('-');
			var d={
				orderDate:timeinfo[0],
				orderHour:timeinfo[1],
				shopId:pbinfo[0]
			};
			$(this).replaceWith('<span class="j-editInfo" title="修改信息"><img width="18" src="../static/img/edit.png"></span>');
			$.ajax({
				type:'PUT',
				url:'./order/'+orderid+'.do',
				contentType:'application/json',
				data:JSON.stringify(d),
				success:function(res){
					if(res.success){
						opb.html(pbinfo[1]);
						otime.html($('.j-changeTime',oTr).val());
					}else{
						opb.html(opbname);
						otime.html(oldtime);
						alert(res.msg);
					}
				},
				error:function(err){
					opb.html(opbname);
					otime.html(oldtime);
					alert('修改失败，请刷新重试');
				}
			});
		});
	});

	//标记状态
	$('table tbody').delegate('.j-mark','click',function(event){
		var curTarget = $(event.currentTarget),orderid = curTarget.parents('tr').attr('data-id');
		if(!curTarget.hasClass('marked')){
			var isConfirmed = window.confirm('确认标记吗?');
			if(isConfirmed){
				$.ajax({
					type:'GET',
					url:'./confirm_order.do',
					dataType:'json',
					data:{
						orderId:orderid
					},
					success:function(data){
						if(data.success){
							curTarget.addClass('marked');
						}else{
							alert('标记失败，刷新重试!');
						}
					},
					error:function(err){
						alert('网络问题，标记失败，刷新重试!');
					}
				});
			}
		}
	});
});