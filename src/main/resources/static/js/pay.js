$(function(){
    $.ajaxSetup({ cache: false });
    getOrderInfo();
})
function getOrderInfo(){
    var order_id = getUrlParameter('order_id');
    $.getJSON('./order/'+order_id+'.do',function(data){
        if( data.success ){
            var date = new Date(data.data.orderDate);
            data.data.orderDate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
            var html = Mustache.render($('#contentTemplate').html(),data.data)
            $('#section-content').html(html);
            $('#next-step').on('click',prePay);
        }else{
            alert(data.msg);
        }
    })
}
var payRequest;

function prePay(){
    var order_id = getUrlParameter('order_id');
    var parButton = $(this)
    parButton.attr('disabled',true);
    $.getJSON('./pay.do?order_id='+order_id,function(data){
        parButton.attr('disabled',false);
        if( data.success ){
            data.data.package=data.data.packages
            delete data.data.packages
            payRequest = data.data
            pay()
        }else{
            alert(data.msg)
        }
    });
}
function onBridgeReady(){
   WeixinJSBridge.invoke(
       'getBrandWCPayRequest', payRequest,
       function(res){
           if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                var mobile= $('#j-phone').text().trim();
                $.cookie("mobile",mobile);
                window.location.href = './orders.do'
           }
       }
   );
}
function pay(){
    if (typeof WeixinJSBridge == "undefined"){
       if( document.addEventListener ){
           document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
       }else if (document.attachEvent){
           document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
           document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
       }
    }else{
       onBridgeReady();
    }
}