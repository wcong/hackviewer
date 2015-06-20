$(function(){
    $.ajaxSetup({ cache: false });
    $('#start').on('click',start);
})

function bindAction(id){
    var boxDiv = $('#'+id);
    boxDiv.find('.next-class').on('click',nextClass);
}

function start(){
    var className = $('#class-name').val()
    $.getJSON('./class?className='+className,function(data){
        if( data.success ){
            var template=$('#class-template').html();
            var html = Mustache.render(template,data.data);
            $('#class-well').html(html);
            bindAction(data.data.id)
        }else{
            alert(data.msg)
        }
    });
    return false;
}

function nextClass(){
    var className = $(this).attr('title');
    var offset = $(this).parent().parent().offset();
    var left= offset.left + $(this).parent().parent().width();
    var top = $(this).offset().top;
    $.getJSON('./class?className='+className,function(data){
        if( data.success ){
            var template=$('#class-template').html();
            $('#'+data.data.id).remove();
            var html = Mustache.render(template,data.data);
            $('#class-well').append(html);
            bindAction(data.data.id);
            $('#'+data.data.id).css({'top':top,'left':left});
        }else{
            alert(data.msg)
        }
    });
}

function nextClassParent(){
}