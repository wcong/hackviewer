$(function(){
    $.ajaxSetup({ cache: false });
    var wx_id = getUrlParameter('wx_id');
    $.cookie('wx_id',wx_id);
    getOrders();
})
function getOrders(){
    var mobile = $.cookie('mobile');
    $.getJSON('./orders.do',function(data){
        data.orders = data.data
        if( data.orders.length>0 ){
            for( var i=0;i<data.orders.length;i++ ){
                var date =  new Date(data.orders[i].orderDate);
                data.orders[i].orderDate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
                data.orders[i].shopName = data.orders[i].shopName?data.orders[i].shopName:'分配中...';
            }
            var html = Mustache.render($('#contentTemplate').html(),data)
            $('#container').html(html);
        }else{
            $('#container').html("您还没有订单").css('text-align','center');
        }
    })
}