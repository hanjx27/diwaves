import React from 'react';
import {px, isIphoneX} from '../utils/px';
import {
  DeviceEventEmitter,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
  Alert,
} from 'react-native';
import {Colors} from '../constants/iColors';
const {width,height} =  Dimensions.get('window');
import { Request } from "../utils/request";
import { withNavigation, withOrientation } from 'react-navigation';

Date.prototype.Format = function (fmt) {
  var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "h+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

class PredictArticle extends React.Component {
  constructor(props) {
    super(props);
    this.predict= this.props.predict;
    this.userpredict = this.props.userpredict;
    this.dir = this.props.dir;
    this.dirname = this.props.dirname;
    if(this.predict.dir == 21) {
      this.code = "000001.XSHG"
      this.name = '上证指数 '
    } else if(this.predict.dir == 24) {
      this.code = "399001.XSHE"
      this.name = '深证指数 '
    } else if(this.predict.dir == 28) {
      this.code = "399006.XSHE"
      this.name = '创业板指 '
    }

    let enddatetimes = this.predict.enddatetime.split(' ');
    let dates = enddatetimes[0].split('-');
    //if(this.predict.title.indexOf('日线') >= 0) {
    //this.endtext = '下一交易日' + enddatetimes[1].substring(0,5)
    //}  else{
    this.endtext =  parseInt(dates[1]) + '月' + parseInt(dates[2]) +'日 '+ enddatetimes[1].substring(0,5)
    //}

    let settleendtimes = this.predict.settleendtime.split(' ');
    dates = settleendtimes[0].split('-');
    //if(this.predict.title.indexOf('日线') >= 0) {
    //this.settletext = '预计下一交易日' + settleendtimes[1].substring(0,5) + "揭晓结果"
    //}  else{
    this.settletext =  '预计' +  parseInt(dates[1]) + '月' + parseInt(dates[2]) +'日 '+ settleendtimes[1].substring(0,5) + "揭晓结果"
    //}

    this.state = {
      lefttotalseconds: 0,
      lefthour:0,
      leftminute:0,
      leftsecond:0,
      over:this.predict.state == 2 ? 1:0,

      lastday:'',
      lastdayprice:'',
      lastdayups:0,
      userpredict:this.userpredict,
      predicttype:this.predict.type
    }


    this.u737 = require('../images/u737.png')
    this.predictTablewidth = width - 20
    this.predictTabHeight = (width-20)*304/725
    
    this.componentCaculate();

    this.getStock();

    
  }

  changetype = async(type) => {
    if(!type) {
      this.props.changetype(this.state.predicttype);
    } else {
      if(this.state.predicttype == type) {
        return;
      }
      this.props.changetype(type);
    }
    
  }


  getStock = async() => {
    let url = "https://dataapi.joinquant.com/apis";
    let body = {
      "method": "get_current_token",
      "mob": "15150377790",
      "pwd": "691Eot$$",
    }
    let unit = "1d";
    if(this.state.predicttype == "周线") {
      unit = "1w"
    } else if(this.state.predicttype == "月线") {
      unit = "1M"
    }
    const token = await Request.post2(url,JSON.stringify(body),'formdata');
    if(token) {
      let body2 = {
      "method": "get_price",
      "code": this.code,
      token:token,
      "count": 10,
      "unit": unit,
      "end_date": new Date().Format("yyyy-MM-dd"),
      }
      const result = await Request.post2(url,JSON.stringify(body2),'formdata');
      console.log(result)
      try {
        if(result.length > 0) {
          let items = result.split('\n');
          let lastdayresult = items[items.length - 1];
          let lastdayresultitems = lastdayresult.split(",");
          let datetexts = lastdayresultitems[0].split("-");
          let showdate = parseInt(datetexts[1]) + '月' + parseInt(datetexts[2]) +'日'
          let lastdayprice = lastdayresultitems[2]
          lastdayprice = Math.round(lastdayprice * 100) / 100;
          
          let date = new Date();
          let hours = date.getHours();
          hours = hours > 9 ? hours :'0' + hours
          let minutes = date.getMinutes();
          minutes = minutes > 9 ? minutes :'0' + minutes
          let lastday = '';
          if((date.getMonth() + 1) == datetexts[1] && date.getDate() == datetexts[2] && date.getHours() < 15) { //交易日是今天
            lastday = showdate + " " + hours + ":" + minutes + "  "
          } else {
            lastday = showdate + " 15:00  "
          }
          this.setState({
            lastday:lastday,
            lastdayprice:lastdayprice
          })
          if(result.length > 1) {
            let secondlastdayresult = items[items.length - 2];
            let secondlastdayresultitems = secondlastdayresult.split(",");
            let lastdayups = ((lastdayresultitems[2] - secondlastdayresultitems[2]) / secondlastdayresultitems[2] * 100).toFixed(2)
            this.setState({
              lastdayups:lastdayups
            })
          }
        }
      } catch(e) {
        console.log(e)
      }
    }

    this.stockval = setTimeout(this.getStock,60000)
  }

  componentCaculate = () => {
    this.total = this.predict.option1value + this.predict.option2value + this.predict.option3value + this.predict.option4value + this.predict.option5value
    this.op1rate = 0;
    this.op2rate = 0;
    this.op3rate = 0;
    this.op4rate = 0;
    this.op5rate = 0;
    this.rate = 0;
    if(this.total == 0) {
    } else {
      this.op1rate = Math.round(this.predict.option1value / this.total * 100)
      this.op2rate = Math.round(this.predict.option2value / this.total * 100)
      this.op3rate = Math.round(this.predict.option3value / this.total * 100)
      this.op4rate = Math.round(this.predict.option4value / this.total * 100)
      this.op5rate = Math.round(this.predict.option5value / this.total * 100)
      let max = this.op1rate;
      max = max < this.op2rate ? this.op2rate :max;
      max = max < this.op3rate ? this.op3rate :max;
      max = max < this.op4rate ? this.op4rate :max;
      max = max < this.op5rate ? this.op5rate :max;
      this.rate = max == 0 ? 0 :((width -20)*0.5) / max;
    }
    this.userpredicttext = "";
    if(this.userpredict != null) {
      if(this.userpredict.option == 1) {
        this.userpredicttext = this.predict.option1;
      } else if(this.userpredict.option == 2) {
        this.userpredicttext = this.predict.option2;
      } else if(this.userpredict.option == 3) {
        this.userpredicttext = this.predict.option3;
      } else if(this.userpredict.option == 4) {
        this.userpredicttext = this.predict.option4;
      } else if(this.userpredict.option == 5) {
        this.userpredicttext = this.predict.option5;
      }
    }
    this.userpredicttext = this.userpredicttext.split('(')[0]
  }

  refresh = () => {
    this.changetype();
  }


  componentDidMount() {
    
    let nowtime = new Date().getTime();
    let end = this.getDatetime(this.predict.enddatetime);
    let endtime = end.getTime();
    let lefttotalseconds = endtime - nowtime;
    if(this.predict.result != 0 || this.predict.state == 2 ||lefttotalseconds <= 0) {
      this.setState({
        over:1
      })
    } else {
    }
  }

  getDatetime = (st) => { 
    let a = st.split(" "); 
    let b = a[0].split("-");
    let c = a[1].split(":"); 
    let date = new Date(b[0], b[1] - 1, b[2], c[0], c[1], c[2]);
    return date; 
  }

  secondcount = () => {
    
    let lefttotalseconds = this.state.lefttotalseconds;
    lefttotalseconds = lefttotalseconds - 1000;

    if(this.predict.result != 0 || this.predict.state == 2 ||lefttotalseconds <= 0) {
      this.setState({over:1})
    } else {
      let hours = Math.floor(lefttotalseconds / (3600 * 1000));
      hours = hours > 9 ? hours :'0' + hours
      // 分
      const leave2 = lefttotalseconds % (3600 * 1000);
      let minutes = Math.floor(leave2 / (60 * 1000));
      minutes = minutes > 9 ? minutes :'0' + minutes
      // 秒
      const leave3 = leave2 % (60 * 1000);
      let seconds = Math.round(leave3 / 1000);
      seconds = seconds > 9 ? seconds :'0' + seconds

      this.setState({lefttotalseconds:lefttotalseconds,lefthour:hours,leftminute:minutes,leftsecond:seconds})
      setTimeout(this.secondcount,990)
    }
  }

  componentWillUnmount() {
    this.stockval && clearTimeout(this.stockval);
  }

  render() {
    this.userpredict = this.props.userpredict;
    this.state.userpredict = this.userpredict;
    this.predict= this.props.predict;
    return (
      <TouchableOpacity onPress={() => {this.props.navigation.navigate('PredictScreen',{refresh:this.refresh,predict:this.predict,userpredict:this.userpredict,dir:this.dir,dirname:this.dirname})}} 
      style={{alignItems:"center",paddingHorizontal:15,paddingTop:5,paddingBottom:15,backgroundColor:'white',marginTop:5,borderBottomColor:'#e1e1e1',borderBottomWidth:0.5}}>
        
        <Text ellipsizeMode='tail' style={{maxWidth:width - 20,fontWeight:'bold',color:'black',fontSize:17,lineHeight:21}} numberOfLines={2}>{this.predict.title}</Text>
        
        <View style={{flexDirection:"row",alignItems:'center',justifyContent:"center"}}>
        <TouchableOpacity style={{alignItems:'center',justifyContent:"center",width:55,height:35}} onPress={()=> {this.changetype('日线')}}>
          <Text style={[this.state.predicttype =='日线'?{color:Colors.TextColor}:{color:"black"},{fontSize:13}]}>日线</Text>
        </TouchableOpacity>
        <View>
          <Text style={{fontSize:10}}>/</Text>
        </View>
        <TouchableOpacity style={{alignItems:'center',justifyContent:"center",width:55,height:35}} onPress={()=> {this.changetype('周线')}}>
          <Text style={[this.state.predicttype =='周线'?{color:Colors.TextColor}:{color:"black"},{fontSize:13}]} >周线</Text>
        </TouchableOpacity>
        <View>
          <Text style={{fontSize:10}}>/</Text>
        </View>
        <TouchableOpacity style={{alignItems:'center',justifyContent:"center",width:55,height:35}} onPress={()=> {this.changetype('月线')}}>
          <Text style={[this.state.predicttype =='月线'?{color:Colors.TextColor}:{color:"black"},{fontSize:13}]} >月线</Text>
        </TouchableOpacity>
        </View>

        {this.predict && !this.state.userpredict && this.state.over == 0 &&
        <View style={{marginTop:0,flexDirection:"row",alignItems:'center'}}><Text style={{color:'#d48d63',fontSize:12}}>{'您还未预测哦，截止' + this.endtext}</Text></View>
        }
        
        {false && this.state.over == 0 &&
        <View style={{marginTop:0,flexDirection:"row",alignItems:'center'}}><Text style={{color:'#d48d63',fontSize:13}}>距结束还有 </Text>
          <View style={{width:20,alignItems:'center',paddingVertical:2,backgroundColor:"#fbe9d7"}}>
            <Text style={{color:'#d48d63',fontSize:13}}>{this.state.lefthour}</Text>
          </View>
          <Text style={{color:'#d48d63',fontSize:13}}> : </Text>
          <View style={{width:20,alignItems:'center',paddingVertical:2,backgroundColor:"#fbe9d7"}}>
            <Text style={{color:'#d48d63',fontSize:13}}>{this.state.leftminute}</Text>
          </View>
          <Text style={{color:'#d48d63',fontSize:13}}> : </Text>
          <View style={{width:20,alignItems:"center",paddingVertical:2,backgroundColor:"#fbe9d7"}}>
            <Text style={{color:'#d48d63',fontSize:13}}>{this.state.leftsecond}</Text>
          </View>
        </View>
        }
        {this.state.over == 1 &&
          <View style={{marginTop:0,flexDirection:"row",alignItems:'center'}}><Text style={{color:'#d48d63',fontSize:13}}>预测已结束 </Text></View>
        }

        <View style={{marginTop:10,position:'relative',width:this.predictTablewidth,height:this.predictTabHeight}}>
          <Image resizeMode='stretch' style={{display:'none',width:this.predictTablewidth,height:this.predictTabHeight}} source={this.u737}></Image>
          <View style={{position:'absolute',marginTop:0,backgroundColor:'rgba(255,255,255,0.5)',width:this.predictTablewidth,height:this.predictTabHeight}}>
            <View style={styles.tablewrap}>
              <View style={styles.tabletextwrap}><Text style={styles.font12}>{this.predict.option1}</Text></View>
              <View style={styles.tablecontentwrap}>
                <View style={[styles.progressbar,styles.font12,{width:this.op1rate*this.rate,backgroundColor:"#fa3c41"}]}></View>
                <Text style={styles.progresstext}>{this.predict.option1value + '银币'}</Text></View>
            </View>
            <View style={styles.tablewrap}>
            <View style={styles.tabletextwrap}><Text style={styles.font12}>{this.predict.option2}</Text></View>
              <View style={styles.tablecontentwrap}>
                <View style={[styles.progressbar,styles.font12,{width:this.op2rate*this.rate,backgroundColor:"#fd6259"}]}></View>
                <Text style={styles.progresstext}>{this.predict.option2value + '银币'}</Text></View>
            </View>
            <View style={styles.tablewrap}>
            <View style={styles.tabletextwrap}><Text style={styles.font12}>{this.predict.option3}</Text></View>
              <View style={styles.tablecontentwrap}>
                <View style={[styles.progressbar,styles.font12,{width:this.op3rate*this.rate,backgroundColor:"#fba74e"}]}></View>
                <Text style={styles.progresstext}>{this.predict.option3value + '银币'}</Text></View>
            </View>
            <View style={styles.tablewrap}>
            <View style={styles.tabletextwrap}><Text style={styles.font12}>{this.predict.option4}</Text></View>
              <View style={styles.tablecontentwrap}>
                <View style={[styles.progressbar,styles.font12,{width:this.op4rate*this.rate,backgroundColor:"#5bd176"}]}></View>
                <Text style={styles.progresstext}>{this.predict.option4value + '银币'}</Text></View>
            </View>
            <View style={styles.tablewrap}>
            <View style={styles.tabletextwrap}><Text style={styles.font12}>{this.predict.option5}</Text></View>
              <View style={styles.tablecontentwrap}>
                <View style={[styles.progressbar,styles.font12,{width:this.op5rate*this.rate,backgroundColor:"#3cbe56"}]}></View>
                <Text style={styles.progresstext}>{this.predict.option5value + '银币'}</Text></View>
            </View>
          </View>
        </View>


        {!this.userpredict && this.state.over == 0 && //未预测、未结束 显示去预测
        <View style={{width:'100%',marginTop:0,paddingRight:10,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}>
          <Text style={{fontSize:12,color:Colors.sTextColor}}>当前奖池<Text style={{color:Colors.TextColor,fontSize:16}}>{this.total}</Text>银币</Text>
          <TouchableOpacity onPress={() => {this.props.navigation.navigate('PredictScreen',{refresh:this.refresh,predict:this.predict,userpredict:this.userpredict,dir:this.dir,dirname:this.dirname})}} 
          style={{marginLeft:10,borderRadius:5,backgroundColor:Colors.TextColor,paddingVertical:8,paddingHorizontal:20}}>
            <Text style={{color:'white',fontWeight:'bold'}}>去预测</Text>
          </TouchableOpacity>
        </View>
        }
        {!this.userpredict && this.state.over == 1 && //未预测、已结束 什么都不显示
        <View></View>
        }
        {
          this.userpredict && //已预测
          <View style={{width:'100%',marginTop:0,paddingRight:10,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}>
          <Text style={{fontSize:12,color:Colors.sTextColor}}>
            您已预测<Text style={{color:Colors.TextColor,fontSize:15}}>{" " + this.userpredicttext}</Text>
            {this.userpredict.state == 1 && <Text>{'，' + this.settletext}</Text>}
            {this.userpredict.state == 2 && <Text>，猜中了结果！</Text>}
            {this.userpredict.state == 3 && <Text>，没有猜中结果</Text>}
            </Text>
          </View>
        }

        {!!this.state.lastday &&
        <View style={{flexDirection:'row',marginTop:10}}>
          <Text style={{fontSize:13}}>{'实时行情 ' + this.state.lastday}</Text>
          <Text style={[this.state.lastdayups > 0 ? {color:'red'}:{color:'green'},{fontWeight:'bold',fontSize:13}]}>{this.state.lastdayprice + ' ' + this.state.lastdayups + "%"}</Text>
        </View>
        }
      </TouchableOpacity>
    )
  }
}

export default withNavigation(PredictArticle);


const styles = StyleSheet.create({
   tablewrap:{
    marginBottom:10,
    flexDirection:'row'
   },
   tabletextwrap:{
     width:'40%',
     justifyContent:'flex-end',
     flexDirection:'row'
   },
   tablecontentwrap:{
    marginLeft:5,
    width:'60%'
   },
   font12:{
     fontSize:13
   },
   progressbar:{
    height:18,
    borderRadius:14
   },
   progresstext:{
    marginLeft:5,
    position:'absolute',
    color:'black',
    fontSize:13
   }

  });