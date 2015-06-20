$(function(){
    $.ajaxSetup({ cache: false });
    getCombos();
    $('#next-step').on('click',addOrder);
})
function getCombos(){
    var combo_id = getUrlParameter('combo_id');
    $.getJSON('./combo/'+combo_id+'.do',function(data){
        if( data.success ){
            data.data.duration = (data.data.duration/60).toFixed(1)
            var dateDate = initDateData();
            if(data.data.isFirstOrder){
               data.data.firstOrderDesc="首单优惠10元";
               data.data.displayPrice=(data.data.price -10).toFixed(1);
            }else{
               data.data.displayPrice=data.data.price;
            }
            var html = Mustache.render($('#contentTemplate').html(),data.data)
            $('#section-content').html(html);
            //set region
            $.get('/region.do?pId=383',function(data){
                if(data.success){
                    for(var i=0,regionstr = '<option value="0">--选择区域--</option>';i<data.data.length;i++){
                        regionstr += '<option value="'+data.data[i]['id']+'">'+data.data[i]['name']+'</option>';
                     }
                     $('#region').html(regionstr);
                     //set street
                     $('#region').on('change',function(event){
                        var regionId = $(this).val();
                        console.log(regionId);
                        $.get('/region.do?pId='+regionId,function(result){
                            if(result.success){
                                 for(var i=0,streetstr = '<select class="form-control" id="street"><option value="0">--选择街道--</option>';i<result.data.length;i++){
                                    streetstr += '<option value="'+result.data[i]['id']+'">'+result.data[i]['name']+'</option>';
                                 }
                                streetstr += '</select>';
                                $('.j-street').html(streetstr);
                            }else{
                                $('#street').parent().html('<b class="text-danger">请选择区域</b>');
                            }
                        });
                     });
                }else{
                    $('#region').parent().html('<b class="text-danger">无法获取区域，请刷新重试</b>');
                }
            });

            $('#j-minus').on('click',minusOrderNum);
            $('#j-add').on('click',addOrderNum);
            $('#order-date').datetimepicker({
                format: 'yyyy-mm-dd hh',
                startDate: dateDate.minDate+' '+ dateDate.minHour,
                endDate:dateDate.maxDate+' 19',
                hoursDisabled:[0,1,2,3,4,5,6,7,8,9,20,21,22,23,24],
                autoclose:true,
                minView:1,
                language:'zh-CN',
                pickerPosition:'top-right',
                initialDate:dateDate.minDate+' '+ dateDate.minHour,
            });
        }else{
            alert(data.msg)
        }
    });
}

function formatDateString(date){
    var year= date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    if( month <10 ){
        month='0'+month
    }
    if( day <10 ){
        day = '0' + day
    }
    return year+'-'+month+'-'+day;
}

function changeMinHour(){
    var chooseDate = $(this).val();
    var minHour = 10
    if( chooseDate <= $(this).attr('min') ){
        minHour=parseInt($('#order-hour').attr('first-min'))
    }
    var hourArray = new Array();
    for( var i=minHour;i<=19;i++ ){
        var hourObject = new Object();
        hourObject.value = i;
        hourObject.name=i+'点';
        hourArray.push(hourObject)
    }
    $('#order-hour').html(Mustache.render($('#hourSelectTemplate').html(),{"hourArray":hourArray}));
}

function initDateData(){
    var dateDate = new Object();
    var date = new Date();
    var fromDate;
    var minHour;
    var endDate;
    if( date.getHours()>=21 ){
        fromDate = new Date(date.getTime()+24*60*60*1000*2);
        endDate = new Date(fromDate.getTime()+24*60*60*1000*9);
        minHour = 10;
    }else{
        fromDate = new Date(date.getTime()+24*60*60*1000);
        endDate = new Date(fromDate.getTime()+24*60*60*1000*10);
        minHour = 10;
    }
    var minDate = formatDateString(fromDate)
    var maxDate = formatDateString(endDate);
    dateDate.minDate = minDate
    dateDate.maxDate = maxDate
    dateDate.minHour = minHour
    return dateDate
}

function minusOrderNum(){
    var num = $('#pet-num');
    var petAmount = num.val();
    if(petAmount <=1 ){
        $(this).attr('disabled','disabled');
    }else{
        num.val(parseInt(petAmount)-1);
    }
    countFee(num.val());
}
function addOrderNum(){
    var num = $('#pet-num');
    num.val(parseInt(num.val())+1);
    $('#j-minus').attr('disabled') && $('#j-minus').removeAttr('disabled');
    countFee(num.val());
}

function countFee(num){
    var price_tag = $('#price_sec');
    var isFirstOrder = price_tag.attr('is_first_order')
    var price = parseFloat(price_tag.attr('price'));
    var now_price = price*num;
    if( isFirstOrder ){
        now_price-=10;
    }
    var duration = $('#serviceTime').attr('duration');
	$('#serviceTime').text((duration*num).toFixed(1));
    $('#price_sec').text(now_price.toFixed(1));
}

function addOrder(){
    var data = new Object();
    data.comboId=$('#combo_info').attr('combo_id');
    data.price=parseInt(parseFloat($('#price_sec').text().trim())*100)/100;
    data.orderNum = $('#pet-num').val().trim();
    var dateArray = $('#order-date-value').val().split(/\s+/);
    if( dateArray.length <2 ){
        alert('请选择时间');
        return;
    }
    //check region & street is selected or not
    var regionVal = parseInt($('#region').val()),streetVal = parseInt($('#street').val());
    if(!regionVal){
        alert('请选择所在区');
        return;
    }
    if(!streetVal){
        alert('请选择所在街道');
        return;
    }
    data.orderDate = dateArray[0].trim();
    data.orderHour = dateArray[1].trim();
    data.address= $('#address').val().trim();
    data.district = regionVal;
    data.street = streetVal;
    if( data.address.length==0 ){
        alert('请输入地址');
        return;
    }
    data.mobile = $('#mobile').val().trim();
    if( data.mobile.length!= 11 ){
        alert('请输入正确手机号');
        return
    }
    if( $('#allow_bathtub').attr('checked')=='checked' ){
        data.allowBathtub = true;
    }else{
        data.allowBathtub = false;
    }
    var nextButton =$(this)
    nextButton.attr('disabled',true)
    $.ajax({
      type: "POST",
      url: "./order.do",
      contentType : 'application/json',
      data: JSON.stringify(data),
      success:function(data){
        nextButton.attr('disabled',false)
        if(data.success){
            window.location.href = './pay.do?order_id='+ data.data
         }else{
            alert(data.msg);
         }
      },
      error:function(data){
         nextButton.attr('disabled',false)
         alert('网络错误')
      }
    });
}
/*
function geo(){
	if (navigator.geolocation){
	    navigator.geolocation.getCurrentPosition(function(position){
		    var lat = position.coords.latitude, lng = position.coords.longitude,
		    url = 'http://api.map.baidu.com/geocoder/v2/?ak=0i4bKhYeBXGOCFVV8WmUnToE&callback=renderReverse&output=json&pois=0&location='+lat+','+lng;
		    var script = document.createElement('script');
		    script.src=url;
		    document.getElementsByTagName('head')[0].appendChild(script);
		},function(){
			alert('无法获取您的地理位置，请检查是否开启并允许GPS定位功能');
		},{enableHighAccuracy: true});
	}else{
		alert("设备不支持或没有开启GPS定位功能.");
	}
}
function renderReverse(position){
    var address = position.result.formatted_address;
    $('#address').val(address);
}
*/