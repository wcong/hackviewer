$(function(){
    $.ajaxSetup({ cache: false });
    var wx_id = getUrlParameter('wx_id');
    $.cookie('wx_id',wx_id);
    getCombos();
    $('#nextstep').bind('click',toOrder);
})
function getCombos(){
    $.getJSON('../../combo.do',function(data){
        for(var i=0;i<data.data.length;i++ ){
            service_line = data.data[i].service.split("\n")
            left_parts = new Array();
            right_parts = new Array();
            for( var j=0;j< service_line.length;j++ ){
                service_array = service_line[j].split(/\s+/)
                left_part = new Object();
                left_part_array = service_array[0].trim().split(',')
                left_part.index = left_part_array[0]
                left_part.name = left_part_array[1]
                left_parts.push(left_part)
                if( service_array.length >1 ){
                    right_part = new Object();
                    right_part_array = service_array[1].trim().split(',')
                    right_part.index = right_part_array[0]
                    right_part.name = right_part_array[1]
                    right_parts.push(right_part)
                }
            }
            data.data[i].left_parts = left_parts
            data.data[i].right_parts = right_parts
        }
        data.combo_list = data.data
        var html = Mustache.render($('#contentTemplate').html(),data)
        $('#fwitems').html(html);
        $('.taocan').on('click',function(event){
            $(this).next().toggleClass('hide');
            $('.arrow',$(this)).toggleClass('toparrow');
        });
        $('.checkboxselect').on('click',function(event){
            $('.checkboxselect',fwitems).removeClass('checkedbox');
            $(this).toggleClass('checkedbox');
            $('.j-visitpart',$(this).parent()).removeClass('hide');
        });
    })
}
function toOrder(){
    var combo_id=$('.checkedbox').attr('combo_id');
    if( !(combo_id>0) ){
        alert('请选择套餐');
        return;
    }
    window.location.href = './order.do?combo_id='+ combo_id
}