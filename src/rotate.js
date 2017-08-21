/*goo*/
import $ from 'jquery';

export function initt(){
    $('.skeleton .dots').on('click',(e)=>{
        
        
 console.log($(e.target).data('deg'));
        var deg = $(e.target).data('deg');
        $('.alarm-clock').css({
            transform: `rotate(${deg}deg)`
        });
        localStorage.setItem('alarm_clock_hour',deg/6);
    });


    $('.skeleton').on('mousedown',(e)=>{
        var px = e.pageX,
        el = $('.skeleton'),
        py = e.pageY,
        ol = el.offset().left+el.width()/2,
        ot = el.offset().top+el.height()/2,
        deg = (Math.abs(normalize(toDEG(Math.atan2(px-ol,py-ot)))-180))%360;
        $('.alarm-clock').css({
            transform: `rotate(${deg}deg)`
        });
        localStorage.setItem('alarm_clock_hour',deg/6);
        console.log('page x: '+ px);
        console.log('page y: '+ py);
        console.log("this.offset.left ", ol);
        console.log("this.offset.top ", ot);
        console.log("Math.atan2(px-ol,py-ot); ", Math.atan2(px-ol,py-ot));
        console.log("toDEG(Math.atan2(px-ol,py-ot)); ",deg);
        
    });
    
    var normalize = function(val){        
        var norm = val%6;
        var ret = norm === 0?val: val-norm;
        return ret;       
    }

    var tt = function(val){
        var rr = val%90;

    }
    
    
    var toDEG = function(val){
        return ~~(val * (360 / (2 * Math.PI)));
    }
}

$.fn.setTheClock = function(options){
    var defaults = {
        origin:"top"
    }
    var settings = $.extend(defaults,options);
    var dragging = false,
    skeleton = $('.skeleton'),
    self = this,
    $elf = $(this),
    target_wp,
    o_x, o_y, h_x, h_y, last_angle;
    
    var saved_alarm_hour = localStorage.alarm_clock_hour;
    settings.indicator.text(saved_alarm_hour);
    
    this.mousedown(function (e) {
        h_x = e.pageX;
        h_y = e.pageY; // clicked point
        e.preventDefault();
        e.stopPropagation();
        dragging = true;
        target_wp = $elf;
        if (!target_wp.data("origin")) target_wp.data("origin", {
            left: target_wp.offset().left,
            top: target_wp.offset().top
        });
        o_x = target_wp.data("origin").left;
        o_y = target_wp.data("origin").top; // origin point
        
        last_angle = target_wp.data("last_angle") || 0;
    })
    
    skeleton.mousemove(function (e) {
        
        if (dragging) {
            var s_x = e.pageX,
            s_y = e.pageY; // start rotate point
            if (s_x !== o_x && s_y !== o_y) { //start rotate
                var s_rad = Math.atan2(s_y - o_y, s_x - o_x); // current to origin
                s_rad -= Math.atan2(h_y - o_y, h_x - o_x); // handle to origin
                s_rad += last_angle; // relative to the last one
                var degree = ~~(s_rad * (360 / (2 * Math.PI)));
                console.log(degree);
                degree = self.normalize(degree);
                localStorage.setItem('alarm_clock_hour',(60+degree/6)%60);
                settings.indicator.text((60+degree/6)%60);           
                self.rotate(degree);
                // this.releasePointerCapture(degree);
            }
        }
    }) // end mousemove
    
    this.rotate = function(degree){
        this.css('-moz-transform', 'rotate(' + degree + 'deg)');
        this.css('-moz-transform-origin', settings.origin);
        this.css('-webkit-transform', 'rotate(' + degree + 'deg)');
        this.css('-webkit-transform-origin', settings.origin);
        this.css('-o-transform', 'rotate(' + degree + 'deg)');
        this.css('-o-transform-origin', settings.origin);
        this.css('-ms-transform', 'rotate(' + degree + 'deg)');
        this.css('-ms-transform-origin', settings.origin);
    }
    
    this.rotate(saved_alarm_hour*6);
    
    self.normalize = function(val){        
        var norm = val%6;
        var ret = norm === 0?val: val-norm;
        return ret;
        
    }
    
    skeleton.mouseup(function (e) {         
        dragging = false
        var s_x = e.pageX,
        s_y = e.pageY;
        
        // Saves the last angle for future iterations
        var s_rad = Math.atan2(s_y - o_y, s_x - o_x); // current to origin
        s_rad -= Math.atan2(h_y - o_y, h_x - o_x); // handle to origin
        s_rad += last_angle;
        $elf.data("last_angle", s_rad);
        
    });
    
    this.getAngle = function(){
        return $elf.data("last_angle");
    }
    
    return this;
}

