$('.chevron').click(function(){
    if($(this).children().hasClass('fa-chevron-down'))
    {
        $(this).parent().children('.desc').removeClass('hide')
        $(this).children('.fa-chevron-down').addClass('fa-chevron-up');
        $(this).children('.fa-chevron-down').removeClass('fa-chevron-down');
    
    }
    else{
        $(this).parent().children('.desc').addClass('hide')
        $(this).children('.fa-chevron-up').addClass('fa-chevron-down');
        $(this).children('.fa-chevron-up').removeClass('fa-chevron-up');
  
    }
})