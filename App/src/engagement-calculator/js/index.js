$(document).ready(function () {
$('.form').find('input, textarea').on('keyup blur focus', function (e) {
  
  var $this = $(this),
      label = $this.prev('label');

	  if (e.type === 'keyup') {
			if ($this.val() === '') {
          label.removeClass('active highlight');
        } else {
          label.addClass('active highlight');
        }
    } else if (e.type === 'blur') {
    	if( $this.val() === '' ) {
    		label.removeClass('active highlight'); 
			} else {
		    label.removeClass('highlight');   
			}   
    } else if (e.type === 'focus') {
      
      if( $this.val() === '' ) {
    		label.removeClass('highlight'); 
			} 
      else if( $this.val() !== '' ) {
		    label.addClass('highlight');
			}
    }

});




$('.tab a').on('click', function (e) {
  
  e.preventDefault();
  
  $(this).parent().addClass('active');
  $(this).parent().siblings().removeClass('active');
  
  target = $(this).attr('href');

  $('.tab-content > div').not(target).hide();
  
  $(target).fadeIn(600);
  
});
$('#iidd').click();
 var hash = $.trim( window.location.hash );

    if (hash) $('.tab-group a[href$="'+hash+'"]').trigger('click');

$('#fbbtn').on('click', function (e) {
  
  e.preventDefault();
  var fblike = parseInt($('#fblike').val());
  var fbclik = parseInt($('#fbclik').val());
  var fbcmt = parseInt($('#fbcmt').val());
  var fbshare = parseInt($('#fbshare').val());
  var fblikeT = parseInt($('#fblikeT').val());
  var fbposts = parseInt($('#fbposts').val());
  var res=(fblike*1+fbclik*3+fbcmt*5+fbshare*9)/fblikeT*100*(Math.pow(fbposts, 0.6));
   $('#fbout').val(""+res);
  
});

$('#inbtn').on('click', function (e) {
  
  e.preventDefault();
  var ineng = parseInt($('#ineng').val());
  var intotal = parseInt($('#intotal').val());
  var res=ineng*(Math.pow(intotal, 0.8));
   $('#inout').val(""+res);
  
});

$('#twbtn').on('click', function (e) {
  
  e.preventDefault();
  var twlike = parseInt($('#twlike').val());
  var twretw = parseInt($('#twretw').val());
  var twrply = parseInt($('#twrply').val());
  var twmen = parseInt($('#twmen').val());
  var twimp = parseInt($('#twimp').val());
  var twtw = parseInt($('#twtw').val());
  var res=(Math.pow(twtw, 0.9))*(twlike+twretw*6+twrply*4+twmen*6)/twimp*100;
   $('#twout').val(""+res);
  
});


$('#instbtn').on('click', function (e) {
  
  e.preventDefault();
  var instlike = parseInt($('#instlike').val());
  var instcmt = parseInt($('#instcmt').val());
  var instfoll = parseInt($('#instfoll').val());
  var instposts = parseInt($('#instposts').val());
  var res=(instlike*1+instcmt*5)/instfoll*100*(Math.pow(instposts, 0.55));
   $('#instout').val(""+res);
  
});


$('#pinbtn').on('click', function (e) {
  
  e.preventDefault();
  var pins = parseInt($('#pins').val());
  var repins = parseInt($('#repins').val());
  var pinfoll = parseInt($('#pinfoll').val());
  var pinposts = parseInt($('#pinposts').val());
  var res=((repins/pins)*1000)/pinfoll*(Math.pow(pinposts, 0.7));
   $('#pinout').val(""+res);
  
});

$('#gbtn').on('click', function (e) {
  
  e.preventDefault();
  var g1 = parseInt($('#g1').val());
  var gcmnts = parseInt($('#gcmnts').val());
  var greshare = parseInt($('#greshare').val());
  var gfoll = parseInt($('#gfoll').val());
  var gposts = parseInt($('#gposts').val());
  var res=(g1+gcmnts*2+greshare*5)/gfoll*100*(Math.pow(gposts, 0.5));
   $('#gout').val(""+res);
  
});

$('#utubtn').on('click', function (e) {
  
  e.preventDefault();
  var utulike = parseInt($('#utulike').val());
  var utuclik = parseInt($('#utuclik').val());
  var utucmt = parseInt($('#utucmt').val());
  var utushare = parseInt($('#utushare').val());
  var utufvrt = parseInt($('#utufvrt').val());
  var utunew = parseInt($('#utunew').val());
  var ututot = parseInt($('#ututot').val());
  var utudlike = parseInt($('#utudlike').val());
  var res=(utulike+utudlike+utucmt*7+utuclik*3+utufvrt*6+utushare*10+utunew*12)/(Math.pow(ututot, 0.9))*100;
   $('#utuout').val(""+res);
  
});

});