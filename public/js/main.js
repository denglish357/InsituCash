$(function() {
    if ($('textarea#ta').length) {
        CKEDITOR.replace('ta');
    }

    $('a.confirmDeletion').on('click', function(e) {
        if (!confirm('¿estas seguro?')) {
            return false
        }
    });

    if ($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox();
    }
    $('.vecat').on('click' , function(){
      
      
 $('.cats').css('display', 'block');
      $('.cats').toggleClass('animated slideInLeft');
      $('.overlay').css('display', 'block');
    });
    
    
$(".toggle-password").click(function() {

  $(this).toggleClass("fi-xwluxl-eye-wide");
  var input = $($(this).attr("toggle"));
  if (input.attr("type") == "password") {
    input.attr("type", "text");
  } else {
    input.attr("type", "password");
  }
});

$(document).mouseup(function (e) { 

            if ($(e.target).closest(".cats").length 

                        === 0) { 

                $(".cats").hide(1000);
                $('.overlay').css('display', 'none');
            } 

        }); 
        
        
        
  $('.navbar-toggler').on('click', function(){
        $('.collapse').toggleClass('dropped');
      })
})