/**
 * @project: <jquery.tootletips>
 * @file: <tootletips.js> - 
 * @author: <https://twitter.com/isocroft>
 * @created: <11/05/2015>
 * @desc: simple library for making tooltips
 * @version: 0.1
 * @license: MIT 
 * @copyright: (c) 2015. All rights reserved
 */
 
/*! 
 * Inspired by --> (http://css-trick.com/bubbles-point-tooltips-with-css3-jquery)
 */

 // This library require jquery easing library to work well on browsers that don't support CSS3 transitions

(function( $ , d ){

    
	 $.fn.tootletip = function(options){
	      
		  var  // default options
		       defaults = {
			       bottomGuage:9,
				   resetPosition:false,
				   showTip:false,
				   eventsTriggerIn:"",
				   eventsTriggerOut:"",
				   preferedPosition:"bottom",
				   attributes:["title"],
				   delay:0,
				   tipEvents:{
				      onFinishIn:function(){},
				      onFinishOut:function(){}
				   }	 
			   },
			   // get the current window
			   $win = $(window),
			   // helper vars
			   mouseLeaveKey = "mouseleave",
			   mouseEnterKey = "mouseenter",
			   outerHeight = null,
			   outerWidth = null,
		       // the tooltip element 
		       $tooltip,
		       // last element child of the root 
		       $body = $('body'),
			   // factor this in... just in case the <body>s' basic top rect basis has been messed with !?
			   $top = (/*@cc_on!@*/false && $body[0].runtimeStyle && parseInt(($body[0].runtimeStyle.getAttribute("marginTop")))  || (!window.opera && parseInt($body.css("marginTop"))) || 0),  /* stop IE again, 4rm brewing up a storm */
			   $el,
			   // get the real dimension of an element
			   effectiveDimesion = function($obj, part){
			     var dim, clone = $obj.clone(), methodName = "outer"+part.replace(/^./, part[0].toUpperCase());
				 clone.css("visibility","hidden");
				 $body.append(clone);
				 dim = clone[methodName]();
				 clone.remove();
				 return dim;
			   },
			   // allowance for tip arrow (depends on 'showTip' option being true)
			   paddingValue = 0,
			   _spc = " ",
			   // check UAs' support for CSS3 transitions - can also use Modernizr testing (if available)
	           $TransitionsFeature = (function(){
						        var s = d['createElement']('p').style,
								supports = 'transition' in s ||
								           'WebkitTransition' in s ||
										   'MozTransition' in s ||
										   'msTransition' in s ||
										   'OTransition' in s ;
										   
						return {
						     isSupported:supports
					    };	   
			  }()),
			  $animate = function(elem, cssProps, inside, finish){
			    
			       elem && elem.stop(true, true).animate(cssProps, {
							   queue:false,
							   duration:200,
							   specialEasing:{
							      "opacity":(inside? "easeInQuad" : "easeOutQuad"),
								  "margin":(inside? "easeInBounce" : "easeOutBounce")
							   },
							   step:function(now, fx){
							      //animating the z-index property for more UI effect!! 
								  $(this).css({zIndex:fx.pos * 5000});
							   },
							   complete:function(){
							       finish(elem);
							   }
				  });
			 },
			 tipClasses = {
			    left:"arrow-e-tip",
				top:"arrow-s-tip",
				bottom:"arrow-n-tip",
				right:"arrow-w-tip"
			 },
			 getPreferedPosition = function(elem, positions){
			      var pref = (typeof positions === "string")? positions : null;
				  if(!$.isPlainObject(positions)){
				      return pref;
				  }
			      $.each(positions, function(key, val){
				       if(!pref && elem.is(key)){
					       pref = val; 
					   }
				  });
				  return pref;
			 },
			 
			 getPositionCoords = function(el, tp, pos){
			        
                    var tpos = getPreferedPosition(el, pos);
					if(options.showTip){
					    paddingValue = 12;
					}
				    var elPosition = el.offset(), 
					elDimension = {
					   width:el.outerWidth(),
					   height:el.outerHeight()
					}, 
					tlDimension = {
					   width:effectiveDimesion(tp, "width"),
					   height:effectiveDimesion(tp, "height")
					},
				    offsetPositions = {
				         bottom:{
					         top: (elPosition.top + elDimension.height + paddingValue) - $top,
						     left: elPosition.left + (elDimension.width / 2) - ((tlDimension.width / 2) + options.bottomGuage)
				         },
					     left: {
				             top:(elPosition.top - $top - 5) + (elDimension.height / 2) - (tlDimension.height / 2),  
				             left:elPosition.left - tlDimension.width - paddingValue
				         },
					     top: {
					         top: (elPosition.top - elDimension.height - paddingValue - 5) + $top,
							 left: elPosition.left + (elDimension.width / 2) - ((tlDimension.width / 2) + options.bottomGuage)
					     },
						 right: {
						     top: (elPosition.top - $top - 5) + (elDimension.height / 2) - (tlDimension.height / 2),
							 left: elPosition.left + elDimension.width + paddingValue
						 }
					};
 
                    if(options.showTip && !tp.contents(tipClasses[tpos]).length){
					      tp.find("i").eq(0).attr("class", "arrow-tip").addClass(tipClasses[tpos]);
				    }
					
                    return offsetPositions[tpos];					
			    },
				
				getOptimalPosition = function(el, tp){	
				
                            outerHeight = $win.outerHeight();
			                outerWidth = $win.outerWidth();
		       				
					    var optimalPosition = getPreferedPosition(el, options.preferedPosition), 
						    elPosition = el.offset(), 
					        elDimension = {
					           width:el.outerWidth(),
					           height:el.outerHeight()
					        }, 
					        tlDimension = {
					           width:effectiveDimesion(tp, "width"),
					           height:effectiveDimesion(tp, "height")
					        },
						    positionsToCheck = {
						         left:((outerWidth - (elPosition.left - tlDimension.width - paddingValue)) <= outerWidth && $win.scrollLeft() <= (elPosition.left - tlDimension.width - paddingValue)),
						         top:((outerHeight - ((elPosition.top - elDimension.height - paddingValue - 5) + $top) <= outerHeight && $win.scrollTop() <= ((elPosition.top - elDimension.height - paddingValue - 5) + $top))),
								 right:((elPosition.left + elDimension.width + paddingValue + tlDimension.width) <= outerWidth || $win.scrollLeft() <= (elPosition.left + elDimension.width + paddingValue + tlDimension.width)),
								 bottom:((((elPosition.top + elDimension.height + paddingValue) - $top) + tlDimension.height) <= outerHeight || $win.scrollTop() <= (((elPosition.top + elDimension.height + paddingValue) - $top) + tlDimension.height))
						    };
			               
						   if(typeof optimalPosition == "string"){
						       if(positionsToCheck[optimalPosition] === true){
						              return optimalPosition; 
							   }else{
							         optimalPosition = null;
							   }		  
						   }
						   
						   $.each(positionsToCheck, function(key, val, obj){
						         if(!optimalPosition && !!val){
								     optimalPosition = key;
								 }
						   });
						   
						   return optimalPosition;
			   };
			   
		       options = $.extend(defaults, options, true);
			   
			   if((/^([\s]*)$/).test(options.eventsTriggerIn)){ 
			       if($.inArray(mouseEnterKey, options.eventsTriggerIn.split(_spc)) < 0){
			             options.eventsTriggerIn += String(_spc+mouseEnterKey);
			       }
			   }
			   
			   if((/^([\s]*)$/).test(options.eventsTriggerOut)){
			       if($.inArray(mouseLeaveKey, options.eventsTriggerOut.split(_spc)) < 0){
			             options.eventsTriggerOut += String(_spc+mouseLeaveKey);
			       }
			   }
			   
		  return this.each(function(idx, el){
		  
		        var $el = $(el).attr("data-tooltip-target", idx),
			   
			   // determine useable attribute (works with the 'attributes' option)
			       $attrib = $.grep(options.attributes, function(v){ return (!!$el.attr(v)); })[0] || "";
				// Make DIV and append to page   
			       $tooltip = $('<div class="tooltip tip-hidden" data-tooltip="' + idx + '">' + $el.attr($attrib) + '<i class="arrow-tip"></i></div>').appendTo("body");
			   
			   // Position right away, so first apperance is smooth
			    $tooltip.css(			
				       getPositionCoords($el, $tooltip, options.preferedPosition)
				);
			
            	
				$el
				// Get rid of native pop-up
				.removeAttr($attrib)
				// Mouseenter
				.on(options.eventsTriggerIn, function(e){
				    
				    var tm,
					    $pos,
					    $el = $(this);
					    $tooltip = $('div[data-tooltip=' + $el.data('tooltip-target') + ']');
						
						if($tooltip.is(".tip-shown")){
						      return false;
						}
						
						
					   //listen for CSS3 transition events (cross-browser)
                       $tooltip.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(ev){
					        $(ev.target).removeClass("tip-hidden").addClass("tip-shown");
					        options.tipEvents.onFinishIn($(ev.target), $el);
							$(ev.target).off(ev);
					   });					   
					
					   // reposition tooltip, in case of page offset movements e.g window resizes, scrolling, element animations e.t.c
					   if(options.resetPosition){
					       $pos = getOptimalPosition($el, $tooltip);
					   }else{
					       $pos = getPreferedPosition($el, options.preferedPosition);
					   }   
			  
                      $tooltip.css(			
				          getPositionCoords($el, $tooltip, $pos) 
				      );
			
					
					// Adding class handling CSS3 transitions for supporting UAs' 
					// else use $animate function as fallback in non-supporting UAs'
			        tm = setTimeout(function(){
						if($TransitionsFeature.isSupported){
						      $tooltip.addClass("tooltip-active");
						}else{
						      $animate(
							  $tooltip,
							  {
							   opacity:1,
							   margin:'5px'
							  }, 
							  true, 
							  function(){
							     $tooltip.removeClass("tip-hidden").addClass("tip-shown");
							     options.tipEvents.onFinishIn($tooltip, $el);
							  });
						}
						clearTimeout(tm);
					 }, 100);   
				})
				  // Mouseleave
				.on(options.eventsTriggerOut, function(e){
				
				    var tm,
				        $el = $(this),
					    $tooltip = $('div[data-tooltip=' + $el.data('tooltip-target') + ']');
						
						if($tooltip.is(".tip-hidden")){
						      return false;
						}
						
						//listen for CSS3 transition events (cross-browser)
                       $tooltip.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(ev){
					        $(ev.target).removeClass("tip-shown").addClass("tip-hidden");
					        options.tipEvents.onFinishOut($(ev.target), $el);
							$(ev.target).off(ev);
					   });
					
					     // Temporary class for same-direction fadeout
					    if($TransitionsFeature.isSupported){
					          $tooltip.addClass("tooltip-out");
					    }else{
					        $animate(
						       $tooltip,
                               {
							     opacity:0,
							     marginTop:'-20px'
					           },
                               false,
                               function(){
							       $(ev.target).removeClass("tip-shown").addClass("tip-hidden");
							       options.tipEvents.onFinishOut($tooltip, $el);
							   });
					    }
					
				        // Remove all classes
			            tm = setTimeout(function(){
					           if($TransitionsFeature.isSupported){
					                  $tooltip.removeClass("tooltip-active").removeClass("tooltip-out");
					           }else{
					                 // more code here
					           }		 
					           clearTimeout(tm);
					      }, 300);
				});
		  });
	 }
	 
}(jQuery, this.document));
