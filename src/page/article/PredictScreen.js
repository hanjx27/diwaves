import React, { Component } from 'react';
import {TextInput,Image,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated, Alert} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
import { ScrollView, RotationGestureHandler } from 'react-native-gesture-handler';
import ComentinPredict from '../../components/ComentinPredict';
const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import {Colors} from '../../constants/iColors';
export default class PredictScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.addflag = false;

    this.predict = null; //this.props.navigation.getParam('predict') 这里没有直接用上一页面传过来的predict 和userpredict 是因为详情页要重新请求预测数据（保证最新），避免重复刷新页面
    this.userpredict = null;
    
    this.dir = props.navigation.getParam('dir');
    this.pickimage = false;
    this.colors = ['#fa3c41','#fd6259','#fba74e','#5bd176','#3cbe56']
    this.state = {

      lastday:'',
      lastdayprice:'',
      lastdayups:0,


      predict:null,
      userpredict:null,
      lefttotalseconds: 0,
      lefthour:0,
      leftminute:0,
      leftsecond:0,
      over:0,
      user:null,
      commentcontent:'',
      usersilvershow:false,
      predictsList:[],

      points:[1,0,0,0],
      choosesilverindex:0,
      silvers:[20,50,100,200],

      //预测界面相关
      predictContent:false, //预测界面显示
      selects:[0,1,0,0,0],
      choosepredicttext:'',
      choosepredictcolor:this.colors[1]
    }
    this.chooseoption = 2;

    this.getStock();
  }
  
  getStock = async() => {
    let url = "https://dataapi.joinquant.com/apis";
    let body = {
      "method": "get_current_token",
      "mob": "15150377790",
      "pwd": "691Eot$$",
    }
    const token = await Request.post2(url,JSON.stringify(body),'formdata');
    if(token) {
      let body2 = {
      "method": "get_price",
      "code": this.code,
      token:token,
      "count": 10,
      "unit": "1d",
      "end_date": "2030-03-21",
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
          /*if(lastdayprice.split('.').length  == 2 && lastdayprice.split('.')[1].length > 2) {
            lastdayprice = lastdayprice.substring(0,lastdayprice.length - 2);
          }*/
          this.setState({
            lastday:showdate + this.name,
            lastdayprice:lastdayprice
          })
          if(result.length > 1) {
            let secondlastdayresult = items[items.length - 2];
            let secondlastdayresultitems = secondlastdayresult.split(",");
            let lastdayups = ((lastdayresultitems[2] - secondlastdayresultitems[2]) / secondlastdayresultitems[2] * 100).toFixed(2)
            console.log(lastdayups)
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
      setTimeout(this.secondcount,992)
    }
    
  }

  componentCalulate = () => {
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

  loadUserPredictsList = async() => {
    try {
      const result = await Request.post('getPredicts',{
        predictid:this.props.navigation.getParam('predict').id
      });
      if(result.code == 1) {
        this.setState({
          predictsList:result.data
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  componentWillMount = async() => {
    this.loadUserPredictsList();
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
    }
    
    await this.loadPredict();

    if(this.predict.title.indexOf('上证指数') >= 0) {
      this.code = "000001.XSHG"
      this.name = '上证指数 '
    } else if(this.predict.title.indexOf('深证指数') >= 0) {
      this.code = "399001.XSHE"
      this.name = '深证指数 '
    } else if(this.predict.title.indexOf('创业板指') >= 0) {
      this.code = "399006.XSHE"
      this.name = '创业板指 '
    }

    let enddatetimes = this.predict.enddatetime.split(' ');
    let dates = enddatetimes[0].split('-');
    if(this.predict.title.indexOf('日线') >= 0) {
      this.endtext = '下一交易日' + enddatetimes[1].substring(0,5)
    }  else{
      this.endtext =  parseInt(dates[1]) + '月' + parseInt(dates[2]) +'日 '+ enddatetimes[1].substring(0,5)
    }

    let settleendtimes = this.predict.settleendtime.split(' ');
    dates = settleendtimes[0].split('-');
    if(this.predict.title.indexOf('日线') >= 0) {
      this.settletext = '预计下一交易日' + settleendtimes[1].substring(0,5) + "揭晓结果"
    }  else{
      this.settletext =  '预计' +  parseInt(dates[1]) + '月' + parseInt(dates[2]) +'日 '+ settleendtimes[1].substring(0,5) + "揭晓结果"
    }


    if(this.predict) {
      this.u737 = require('../../images/u737.png')
      this.predictTablewidth = width - 20
      this.predictTabHeight = (width-20)*304/725
      
      this.componentCalulate();

      let choosepredicttext = this.predict.option2.split('(')[0]
      this.setState({
        predict:this.predict,
        userpredict:this.userpredict,
        choosepredicttext:choosepredicttext
      })

      let nowtime = new Date().getTime();
      let end = this.getDatetime(this.predict.enddatetime);
      let endtime = end.getTime();
      let lefttotalseconds = endtime - nowtime;
      if(this.predict.result != 0 || this.predict.state == 2 || endtime - nowtime <= 0) {
      this.setState({
        over:1
      })
      } else {
      /*let hours = Math.floor(lefttotalseconds / (3600 * 1000));
      hours = hours > 9 ? hours :'0' + hours
      // 分
      const leave2 = lefttotalseconds % (3600 * 1000);
      let minutes = Math.floor(leave2 / (60 * 1000));
      minutes = minutes > 9 ? minutes :'0' + minutes
      // 秒
      const leave3 = leave2 % (60 * 1000);
      let seconds = Math.round(leave3 / 1000);
      seconds = seconds > 9 ? seconds :'0' + seconds
      this.setState({lefttotalseconds:lefttotalseconds,lefthour:hours,leftminute:minutes,leftsecond:seconds})*/
       //setTimeout(this.secondcount,990)
      }
     
    }
  }
  
  loadPredict = async() => {
    try {
      const result = await Request.post('loadPredict',{
        userid:!!this.state.user?this.state.user.id:'',
        dir:this.dir.id
      });
      if(result.code == 1) {
        this.predict = result.data.predict;
        this.userpredict = result.data.userpredict;
      }
    } catch (error) {
      console.log(error)
    }
  }

  componentDidMount= () => {
  }

  componentWillUnmount() {

    this.stockval && clearTimeout(this.stockval);

    if(this.props.navigation.state.params.refresh) {
      this.props.navigation.state.params.refresh(this.predict,this.userpredict);
    }
  }
  selectchange = (index) => {
    if(this.userpredict) {
      return;
    }
    this.chooseoption = index + 1;
    let selects = this.state.selects;
    for(let i= 0;i < selects.length;i++) {
      selects[i] = 0;
    }
    selects[index] = 1;
    let choosepredicttext = '';
    if(index == 0) {
      choosepredicttext = this.state.predict.option1
    } else if(index == 1) {
      choosepredicttext = this.state.predict.option2
    } else if(index == 2) {
      choosepredicttext = this.state.predict.option3
    } else if(index == 3) {
      choosepredicttext = this.state.predict.option4
    } else if(index == 4) {
      choosepredicttext = this.state.predict.option5
    }
    choosepredicttext = choosepredicttext.split('(')[0]
    this.setState({
      selects:selects,
      choosepredicttext:choosepredicttext,
      choosepredictcolor:this.colors[index]
    })
  }
  silverschange = (index) => {
    this.setState({
      choosesilverindex:index
    })
  }

  confirmPredict = async () => {
    if(this.addflag) {
      return;
    }
    if(!this.state.user) {
      Alert.alert('请先登录') //需要做统一处理
      return;
    }
    
    const predictsilver = this.state.silvers[this.state.choosesilverindex];
    /*if(predictsilver > this.state.user.silver) {
      Alert.alert('银币不足啦') //需要做统一处理
      return;
    }*/

    this.addflag = true;
    try {
      const result = await Request.post('addPredict',{
        predictid:this.state.predict.id,
        predicttitle:this.state.predict.title,
        userid:this.state.user.id,
        comment:this.state.commentcontent,
        option:this.chooseoption,
        silver:predictsilver
      });
      if(result.code == -2) {
        Alert.alert('银币不足啦') //需要做统一处理
        AsyncStorage.setItem('user', JSON.stringify(result.data), function (error) {})
        this.setState({
          user:result.data,
          usersilvershow:true
        })
        this.addflag = false;
        return;
      } if(result.code == -3) {
        Alert.alert('预测已经结束啦') //需要做统一处理
        this.setState({
          predict:result.data
        })
        this.addflag = false;
        return;

      } else if(result.code > 0) {
        let userpredict = {}
        userpredict.id = result.code;
        userpredict.userid = this.state.user.id;
        userpredict.predictid = this.state.predict.id;
        userpredict.option = this.chooseoption;
        userpredict.comment = this.state.commentcontent
        userpredict.silver = predictsilver;
        userpredict.silverwin = 0;
        userpredict.state = 1;
        userpredict.createdatetime = result.data
        userpredict.username = this.state.user.name
        userpredict.avatarUrl = this.state.user.avatar
        let predict = this.state.predict;
        if(this.chooseoption == 1) {
          predict.option1value += predictsilver
        } else if(this.chooseoption == 2) {
          predict.option2value += predictsilver
        } else if(this.chooseoption == 3) {
          predict.option3value += predictsilver
        } else if(this.chooseoption == 4) {
          predict.option4value += predictsilver
        } else if(this.chooseoption == 5) {
          predict.option5value += predictsilver
        }
        this.predict = predict;
        this.userpredict = userpredict;

        this.componentCalulate();
        let user = this.state.user;

        user.silver = user.silver - predictsilver;
        AsyncStorage.setItem('user', JSON.stringify(user), function (error) {}) //更新了金币/银币数量，有可能需要通知其他页面，需要注意！
        
        let predictsList = this.state.predictsList
        predictsList.unshift(userpredict)
        this.setState({
          predict:predict,
          userpredict:userpredict,
          predictsList:predictsList,
          user:user,
          predictContent:false
        })
        this.addflag = false;
      }
    } catch (error) {
      console.log(error)
      this.addflag = false;
    }

  }

  render() {
  
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title='数字海' isLeftTitle={false} />
      {this.state.predict &&
      <ScrollView style={{flex:1}}>
      <View style={{alignItems:"center",paddingHorizontal:15,paddingTop:15,paddingBottom:15,backgroundColor:'white',marginTop:7,borderBottomColor:'#e1e1e1',borderBottomWidth:0.5}}>
        
        {!!this.state.lastday &&
        <View style={{flexDirection:'row'}}>
          <Text style={{fontSize:13}}>{this.state.lastday}</Text>
          <Text style={[this.state.lastdayups > 0 ? {color:'red'}:{color:'green'},{fontWeight:'bold',fontSize:13}]}>{this.state.lastdayprice + ' ' + this.state.lastdayups + "%"}</Text>
        </View>
        }

        <Text ellipsizeMode='tail' style={{maxWidth:width - 20,marginTop:10,fontWeight:'bold',color:'black',fontSize:17,lineHeight:21}} numberOfLines={2}>{this.state.predict.title}</Text>
        {this.state.over == 0 && !this.state.userpredict &&  
        <View style={{marginTop:10,flexDirection:"row",alignItems:'center'}}><Text style={{color:'#d48d63',fontSize:13}}>{'您还未预测哦，截止' + this.endtext}</Text>
         
         {false &&
          <View>
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
        </View>
        }
        {this.state.over == 1 &&
          <View style={{marginTop:10,flexDirection:"row",alignItems:'center'}}><Text style={{color:'#d48d63',fontSize:13}}>今日预测已结束 </Text></View>
        }
        <View style={{position:'relative',width:this.predictTablewidth,height:this.predictTabHeight}}>
          <Image resizeMode='stretch' style={{display:'none',width:this.predictTablewidth,height:this.predictTabHeight}} source={this.u737}></Image>
          <View style={{position:'absolute',marginTop:10,backgroundColor:'rgba(255,255,255,0.5)',width:this.predictTablewidth,height:this.predictTabHeight}}>
            <View style={styles.tablewrap}>
              <View style={styles.tabletextwrap}><Text style={styles.font12}>{this.state.predict.option1}</Text></View>
              <View style={styles.tablecontentwrap}>
                <View style={[styles.progressbar,styles.font12,{width:this.op1rate*this.rate,backgroundColor:this.colors[0]}]}></View>
                <Text style={styles.progresstext}>{this.state.predict.option1value + '银币'}</Text>
              </View>
              <TouchableOpacity onPress={()=>{this.selectchange(0)}} style={this.state.selects[0] == 0?styles.unselectwrap:styles.selectwrap}>
                <View style={this.state.selects[0] == 0?styles.unselectinner:styles.selectinner}></View>
              </TouchableOpacity>
            </View>
            <View style={styles.tablewrap}>
            <View style={styles.tabletextwrap}><Text style={styles.font12}>{this.state.predict.option2}</Text></View>
              <View style={styles.tablecontentwrap}>
                <View style={[styles.progressbar,styles.font12,{width:this.op2rate*this.rate,backgroundColor:this.colors[1]}]}></View>
                <Text style={styles.progresstext}>{this.state.predict.option2value + '银币'}</Text>
              </View>
              <TouchableOpacity onPress={()=>{this.selectchange(1)}} style={this.state.selects[1] == 0?styles.unselectwrap:styles.selectwrap}>
                <View style={this.state.selects[1] == 0?styles.unselectinner:styles.selectinner}></View>
              </TouchableOpacity>
            </View>
            <View style={styles.tablewrap}>
            <View style={styles.tabletextwrap}><Text style={styles.font12}>{this.state.predict.option3}</Text></View>
              <View style={styles.tablecontentwrap}>
                <View style={[styles.progressbar,styles.font12,{width:this.op3rate*this.rate,backgroundColor:this.colors[2]}]}></View>
                <Text style={styles.progresstext}>{this.state.predict.option3value + '银币'}</Text>
              </View>
              <TouchableOpacity onPress={()=>{this.selectchange(2)}} style={this.state.selects[2] == 0?styles.unselectwrap:styles.selectwrap}>
                <View style={this.state.selects[2] == 0?styles.unselectinner:styles.selectinner}></View>
              </TouchableOpacity>
            </View>
            <View style={styles.tablewrap}>
            <View style={styles.tabletextwrap}><Text style={styles.font12}>{this.state.predict.option4}</Text></View>
              <View style={styles.tablecontentwrap}>
                <View style={[styles.progressbar,styles.font12,{width:this.op4rate*this.rate,backgroundColor:this.colors[3]}]}></View>
                <Text style={styles.progresstext}>{this.state.predict.option4value + '银币'}</Text>
              </View>
              <TouchableOpacity onPress={()=>{this.selectchange(3)}} style={this.state.selects[3] == 0?styles.unselectwrap:styles.selectwrap}>
                <View style={this.state.selects[3] == 0?styles.unselectinner:styles.selectinner}></View>
              </TouchableOpacity>
            </View>
            <View style={styles.tablewrap}>
            <View style={styles.tabletextwrap}><Text style={styles.font12}>{this.state.predict.option5}</Text></View>
              <View style={styles.tablecontentwrap}>
                <View style={[styles.progressbar,styles.font12,{width:this.op5rate*this.rate,backgroundColor:this.colors[4]}]}></View>
                <Text style={styles.progresstext}>{this.state.predict.option5value + '银币'}</Text>
              </View>
              <TouchableOpacity onPress={()=>{this.selectchange(4)}} style={this.state.selects[4] == 0?styles.unselectwrap:styles.selectwrap}>
                <View style={this.state.selects[4] == 0?styles.unselectinner:styles.selectinner}></View>
              </TouchableOpacity>
            </View>
          </View>
        </View>


        {!this.state.userpredict && this.state.over == 0 && //未预测、未结束 显示去预测
        <View style={{width:'100%',marginTop:5,paddingRight:10,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}>
          <Text style={{fontSize:12,color:Colors.sTextColor}}>当前奖池<Text style={{color:Colors.TextColor,fontSize:16}}>{this.total}</Text>银币</Text>
          <TouchableOpacity onPress={()=>{this.setState({predictContent:true})}} style={{marginLeft:10,borderRadius:5,backgroundColor:Colors.TextColor,paddingVertical:8,paddingHorizontal:20}}>
            <Text style={{color:'white',fontWeight:'bold'}}>预测</Text>
          </TouchableOpacity>
        </View>
        }
        {!this.state.userpredict && this.state.over == 1 && //未预测、已结束 什么都不显示
        <View></View>
        }
        {
          this.state.userpredict && //已预测
          <View style={{width:'100%',marginTop:5,paddingRight:10,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}>
          <Text style={{fontSize:12,color:Colors.sTextColor}}>
          您已预测<Text style={{color:Colors.TextColor,fontSize:15}}>{" " + this.userpredicttext}</Text>
            {this.userpredict.state == 1 && <Text>{'，' + this.settletext}</Text>}
            {this.state.userpredict.state == 2 && <Text>，猜中了结果！</Text>}
            {this.state.userpredict.state == 3 && <Text>，没有猜中结果</Text>}
            </Text>
          </View>
        }
      </View>

        <View style={{paddingHorizontal:15}}>
        

        <FlatList
              style={{ marginTop: 0 }}
              data={this.state.predictsList}
              renderItem={
                ({ item }) => {
                  return(
                    <ComentinPredict predict={this.props.navigation.getParam('predict')} userpredict={item}></ComentinPredict>
                  )
                }
              }
              keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
              ItemSeparatorComponent={this._separator}
            />
        </View>

      </ScrollView>
      }

      <TouchableWithoutFeedback onPress={()=> {this.setState({predictContent:false})}}>
        <View style={{display:this.state.predictContent?'flex':'none',position:this.state.predictContent?'absolute':'relative',backgroundColor:'rgba(0,0,0,0.4)',zIndex:999,width:width,height:height,justifyContent:'center',alignItems:"center"}}>
        
        <View
        style={{zIndex:100,
        backgroundColor:'white',width:width*0.7,position:'relative',borderRadius:7,overflow:"hidden",alignItems:"center"}}>
          <TouchableWithoutFeedback>
          
          <View style={{paddingTop:30,paddingBottom:15,alignItems:'center',justifyContent:"center",width:'100%',backgroundColor:Colors.TextColor}}>
            <Text style={{fontSize:16,color:'white',fontWeight:"bold"}}>预测今日将会 <Text style={{color:this.state.choosepredictcolor}}>{this.state.choosepredicttext}</Text></Text>
            {this.state.user && this.state.usersilvershow &&
            <Text style={{color:'white',fontSize:12,marginTop:5,fontWeight:"bold"}}>我的银币 : {this.state.user.silver}</Text>
            }
            <View style={{borderTopColor:'#eee',marginTop:10,paddingTop:10,borderTopWidth:0.5,width:'80%'}}>
              <Text style={{fontSize:11,color:'#eee',marginBottom:7}}>选择预测银币</Text>
              <View style={{flexDirection:'row',justifyContent:"space-between"}}>
                <TouchableOpacity onPress={()=> this.silverschange(0)} style={this.state.choosesilverindex == 0?styles.points_sel:styles.points_un}>
                  <Text style={this.state.choosesilverindex == 0?styles.pointstext_sel:styles.pointstext_un}>{this.state.silvers[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> this.silverschange(1)} style={this.state.choosesilverindex == 1?styles.points_sel:styles.points_un}>
                  <Text style={this.state.choosesilverindex == 1?styles.pointstext_sel:styles.pointstext_un}>{this.state.silvers[1]}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> this.silverschange(2)} style={this.state.choosesilverindex == 2?styles.points_sel:styles.points_un}>
                  <Text style={this.state.choosesilverindex == 2?styles.pointstext_sel:styles.pointstext_un}>{this.state.silvers[2]}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> this.silverschange(3)} style={this.state.choosesilverindex == 3?styles.points_sel:styles.points_un}>
                  <Text style={this.state.choosesilverindex == 3?styles.pointstext_sel:styles.pointstext_un}>{this.state.silvers[3]}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback>
          <View style={{paddingTop:20,width:'90%',alignItems:"center",flexDirection:"row",justifyContent:"center"}}>
          <View style={{flex:1,height:px(130),paddingHorizontal:px(20),paddingVertical:px(10),borderRadius:3,backgroundColor:"#f7f7f7",}}>
              <TextInput value={this.state.commentcontent} onChangeText = {(commentcontent) => this.setState({commentcontent})} placeholder="发表你的评论，最多50字" maxLength={50} multiline={true} underlineColorAndroid="transparent" ref={commentinput => this.commentinput = commentinput} 
              style={{flex:1,textAlignVertical: 'top'}}/>
              </View>
          </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback>
          <View style={{paddingVertical:15,alignItems:"center",flexDirection:"row",justifyContent:"center"}}>
            <TouchableOpacity onPress={this.confirmPredict} style={{height:37,alignItems:"center",justifyContent:"center",borderBottomColor:Colors.TextColor,borderBottomWidth:0.5}}>
              <Text style={{fontWeight:'bold',fontSize:16,color:Colors.TextColor}}>确定预测</Text>
            </TouchableOpacity>
          </View>
          </TouchableWithoutFeedback>
          
        </View>
        </View>
      </TouchableWithoutFeedback>
       

        {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}
      </View>
    );
  }
}

const topStyles = StyleSheet.create({
  androidTop: {
    width: px(750),
    height: STATUSBAR_HEIGHT,
  },  
  topBox: {
    backgroundColor:'white',
    width: px(750),
    height: isIphoneX ? 44 : 20
  },
  footerBox:{
    backgroundColor:'white',
    width: px(750),
    height: isIphoneX ? 34 : 0
  }
})


const styles = StyleSheet.create({
  tablewrap:{
   marginTop:10,
   flexDirection:'row'
  },
  tabletextwrap:{
    width:'37%',
    justifyContent:'flex-end',
    flexDirection:'row'
  },
  tablecontentwrap:{
   marginLeft:5,
   width:'50%'
  },
  unselectwrap:{
    marginLeft:5,
    borderWidth:1,
    borderColor:"#999",
    width:17,
    height:17,
    
  },
  selectwrap:{
    marginLeft:5,
    borderWidth:1,
    borderColor:Colors.TextColor,
    width:17,
    height:17,
    alignItems:'center',
    justifyContent:"center"
  },
  unselectinner:{

  },
  selectinner:{
    width:11,
    height:11,
    backgroundColor:Colors.TextColor
  },
  points_un:{
    borderWidth:0.5,
    borderColor:'#eee',
    borderRadius:2,
    width:width*0.12,
    height:28,
    alignItems:"center",
    justifyContent:'center'
  },
  points_sel:{
    borderRadius:2,
    backgroundColor:"white",
    width:width*0.12,
    height:28,
    alignItems:"center",
    justifyContent:'center'
  },
  pointstext_un:{
    fontSize:12,
    color:'#fff',
    fontWeight:"bold"
  },
  pointstext_sel:{
    fontSize:12,
    color:Colors.TextColor,
    fontWeight:'bold'
  },
  font12:{
    fontSize:13
  },
  progressbar:{
    height:17,
    borderRadius:14
   },
   progresstext:{
    marginLeft:5,
    position:'absolute',
    color:'black',
    fontSize:13
   }

 });