/**
* @author Mücahid Dayan <muecahid@dayan.one>
*/
import React from 'react';
import $ from 'jquery';
// import Propeller from 'Propeller';
import './styles/css/clock.css';
import './rotate.js';
import {initt} from './rotate.js';



const DEBUG = true;

class LO{
    static G(msg){
        return DEBUG?console.log(msg):false;
    }
}

const NULL_POSITION = {
    second : {
        deg: 0,
        val: 0
    },
    minute : {
        deg: 90,
        val: 0
    },
    hour : {
        deg: 270,
        val: 0
    }
};

export class Clock extends React.Component{
    
    constructor(props){
        super(props);
        this.interval = null;
        this.state = NULL_POSITION;
        this.stopped = false;
        this.started = false;
        this.destroy = this.destroy.bind(this);        
    }
    
    //LAYOUT
    
    labeling(val,indent=false){
        var min = (val)%60;
        return indent?(min)/5 === 0?12+"' "+min+'" ':(min)/5+"' "+min+'" ':min+'"';
    }
    structure(indent = true){        
        var bones = [];      
		for(var i=0;i<60;i++){
            var className = '',scale='',title;
            if(indent){
                if(i%5 === 0){
                    className = 'indent';
                    scale = "scale(2,2)";
                    title = this.labeling(i,true);
                }else{
                    title=this.labeling(i);
                }
            }
			bones.push(<div className={"dots "+className} key={i} data-deg={i*6} title={title} style={{transform:`rotateZ(${i*6}deg) translate(180px) ${scale}`,position:'absolute',zIndex:99}}></div>);
		}
		return (
            <div className="skeleton">
            <div className="bones">
            {bones}
            </div>
            {this.hands()}            
            </div>
        );
    }
    
    hands(){
        return (
            <div className="hands init">
            <div className="second-hand" style={{transform:`rotateZ(${this.state.second.deg}deg) scale(${this.props.SH.width+','+this.props.SH.height})`}}></div>
            <div className="minute-hand" style={{transform:`rotateZ(${this.state.minute.deg}deg) scale(${this.props.MH.width+','+this.props.MH.height})`}}></div>
            <div className="hour-hand" style={{transform:`rotateZ(${this.state.hour.deg}deg) scale(${this.props.HH.width+','+this.props.HH.height})`}}></div>
            {this.props.children?/[clock|hand]/i.test(this.props.children.type.name)?this.props.children:'':''}
            </div>            
        );
    }
    
    numbers(small=false){
        var nmbrs = small?[6,10,11,12,1,2,3,4,5,9,7,8]:[3,6,9,12];
        var nmbrs_layout = [];
        for (let n in nmbrs){
            nmbrs_layout.push(<div key={n} className="number" style={{transform: `rotateZ(${(360/nmbrs.length)*n}deg) translate(210px)`}}>{nmbrs[n]}</div>)
        }
        
        return (
            <div className="numbers">
            {nmbrs_layout}
            </div>
        );
    }
    //LAYOUT ENDS   
    
    
    
    componentWillMount(){
        
    }
    
    componentDidMount(){		
        this.init();
        initt();     
        
    }
    
    init(){        
        this.start();
    }
    
    destroy(){
        var self = this;
        window.clearInterval(self.timer);
    }
    
    start(){
        if(this.started){
            console.warn('Started already');
            return;
        }
        var self = this;
        this.started = true;  
        this.stopped = false;
        LO.G('Clock initialized and started');
        this.destroy();
        this.timer = window.setInterval(()=>this.setHands(new Date().getTime()+7200000),1000);          
    }
    
    stop(){
        this.destroy();    
        if(this.stopped){
            console.warn('Stopped already');
            return;
        }
        this.started = false;        
        this.stopped = true;        
        LO.G('stopped');
    }
    
    reset(){
        if(this.stopped){
            this.setState(NULL_POSITION);
        }else{
            console.warn('Stop the Clock first');
        }
    }
    
    setHands(miliseconds){
        var norm = this.normAt(this.props.normAt),
            clock = Time.getPositions(miliseconds,norm),
        sec_deg_norm = ((clock.second.pos));       
        this.setState({
            second:{
                deg: clock.second.deg,
                val: clock.second.val,
            },
            minute:{
                deg: clock.minute.deg + (~~(sec_deg_norm / 20)*2),
                val: clock.minute.val,
            },
            hour:{
                deg: clock.hour.deg + (~~(clock.minute.val/12) * 6),
                val: clock.hour.val,
            }
        });
    }

    normAt(val){
        var at = /:/.test(val)?val.split(':'):parseInt(val);
        var rt = Array.isArray(at)? (at[0]*3600) + (at[1]*60) : at*3600;
        return rt;
    }
    
    static stop_it(){
        //    this.stop();
    }
    
    render(){
        return (
            <div className="clock" style={{width:this.props.width,height:this.props.height}}>
            {this.structure()}
            </div>
        );
    }
}

Clock.defaultProps = {
    width:'400px',
    height:'400px',
    SH:{
        width:2,
        height:170
    },
    MH:{
        width:3,
        height:150
    },
    HH:{
        width:4,
        height:130
    }
}

class Time {
    constructor(){
        
    }
    
    static getPositions(miliseconds){           
		var clock = this.miliToUTC(miliseconds),
		second = ~~clock.msToSc,
        second_deg = Time.normalize(~~second*6),
        minute = clock.minute,
        minute_deg = minute * 6,
		hour = clock.hour,
		hour_deg = hour*30;
		
        return {
			second : {
				val : second,
                deg : second_deg,                        
                pos : ((second_deg+360)%360)/6,                        
			},
			minute : {
				val : minute,
                deg : minute_deg,                              
			},
			hour : {
				val : hour,
                deg : hour_deg,                
			}
		};
        
    }
    
    static miliToUTC (miliseconds){
        var minuteS = 1000*60,
        hourS = minuteS * 60,
        dayS = hourS * 24,
        monthS = dayS * 30;
        
        var month = ~~(miliseconds/ monthS),
        l = miliseconds-(month * monthS),
        day = ~~(l/dayS);
        l -= (day * dayS);
        var hour = ~~(l/hourS);
        l -= (hour * hourS);
        var minute = ~~(l/minuteS);
        l -= (minute * minuteS);
        var second = ~~(l/1000);
        //TEST FOR GITHUB
        return {
            month : month,
            day : day,
            hour : hour,
            minute: minute,
            second:second,
            msToSc: miliseconds/1000,
        };
    }    
    
    static normalize(angle,norm = 43200){
        //every 12 hours normalize
        return (angle+norm)%norm;
    }      
    
}

export class AlarmClock extends React.Component{
    componentDidMount(){	
        var alarm = $('.alarm-clock').setTheClock({indicator:$('#digital')});
        var timer = window.setInterval(()=>{
            var alarm_clock = localStorage.alarm_clock_hour;
            if(Time.getPositions(new Date().getTime()+7200000).minute.val >= alarm_clock){
                console.log("gooo gooo");   
                Clock.stop_it();            
            }
        },1000); 
    }
    render(){
        return(
            <div className="alarm-clock">
            
            </div>
        );
    }
}