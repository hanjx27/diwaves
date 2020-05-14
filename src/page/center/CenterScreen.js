import React, { Component } from 'react';
import {DeviceEventEmitter,NativeModules,Modal,StatusBar,Image,Dimensions,SafeAreaView,TouchableOpacity,View,StyleSheet,Platform,Text, TouchableWithoutFeedback, Alert} from 'react-native';
const {width,height} =  Dimensions.get('window');
import {Colors} from '../../constants/iColors';

const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import {px, isIphoneX} from '../../utils/px';
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import { baseimgurl, baseurl } from '../../utils/Global';
import QRCode from 'react-native-qrcode-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ScrollView } from 'react-native-gesture-handler';
export default class CenterScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
     user:null,
     status:null,
     qrVisible:false,

     collect:0
    }
  }


  componentWillMount = async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
      await this.getPersonStatus(json.id);
    } else {
      this.setState({user:null})
    }


    this._navListener = this.props.navigation.addListener("didFocus", () => {
      this.loadUserData();
    });

    this.updateuserHandler = DeviceEventEmitter.addListener('updateuser', (data) => { 
     
      this.setState({
        user:data.user
      })
    });
    this.logoutHandler = DeviceEventEmitter.addListener('logout', (data) => {
      this.setState({user:null})
    });
  }

  loadUserData = async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') { //user 已登录
      if(!this.state.user) { // state里未登录状态
        const json = JSON.parse(user);
        this.setState({user:json});
        await this.getPersonStatus(json.id);
        await this.getUserExpire(json);
      } else {// state里已登录状态，不用重复setstate了
        await this.getPersonStatus(this.state.user.id);
        await this.getUserExpire(this.state.user);
      }
    }
  }

  getUserExpire = async(user) => {
    try {
      const result = await Request.post('getUserExpire',{
        userid:user.id
      });
      const expire = result.data;
      if(expire != user.expire_ttl) {
        user.expire_ttl = expire;
        this.setState({
          user:user
        })
        await AsyncStorage.setItem('user',JSON.stringify(user));
      }
    } catch (error) {
      console.log(error)
    }
  }
  getPersonStatus = async(id) => {

    try {
      const result = await Request.post('getUserStatus',{
        id:id
      });
      const status = result.data;
      this.setState({
        status:status
      })
    } catch (error) {
      console.log(error)
    }
  }

  componentDidMount = () => {
  }

  componentWillUnmount() {
    console.log('will unmount')
    this._navListener.remove();
    this.updateuserHandler.remove();
  }

  nologin = () => {
    Alert.alert('您尚未登录')
  }
  
  loginClick = async() => {
    //await this.getUserInfo(3);
    //DeviceEventEmitter.emit('login', this.state.user);
    this.props.navigation.navigate('login');
  }

  getUserInfo = async(id) => {
    try {
      const result = await Request.post('getUserInfo',{
        id:id
      });
      const user = result.data;
      this.setState({user:user})
      await AsyncStorage.setItem('user', JSON.stringify(user), function (error) {})
      this.getPersonStatus(user.id);
    } catch (error) {
      console.log(error)
    }
  }

  goMyfriends =()=>{
    this.props.navigation.navigate('MyFriendsScreen');
  }

  goMyfocus = ()=> {
    this.props.navigation.navigate('MyFocusScreen');
  }
  goMyfans = ()=> {
    this.props.navigation.navigate('MyFansScreen');
  }

  forbidReasonCheck = async() => {
    try {
      const result = await Request.post('getForbidReason',{
        userid:this.state.user.id
      });
      Alert.alert(
        '封禁原因',
        "您的账户因发布违规内容：" + result.data.title + " 被封禁",
        [
          {text: '确定', onPress: () => {}},
          {text: '申诉', onPress: async() => {
            const result2 = await Request.post('addAppeal',{
              userid:this.state.user.id,
              reportid:result.data.id
            });
            let data = '申诉已发起';
            if(result2.code == -1) {
              data = '您已发起申诉，请耐心等待';
            }
            const toastOpts = {
              data: data,
              textColor: '#ffffff',
              backgroundColor: Colors.TextColor,
              duration: 1000, //1.SHORT 2.LONG
              position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
            }
            WToast.show(toastOpts)
          }}
        ],
        { cancelable: true }
        )
      
    } catch (error) {
      console.log(error)
    }
  }


  formatSeconds(value) {
    var theTime = parseInt(value);// 需要转换的时间秒 
    var theTime1 = 0;// 分 
    var theTime2 = 0;// 小时 
    var theTime3 = 0;// 天
    if(theTime > 60) { 
     theTime1 = parseInt(theTime/60); 
     theTime = parseInt(theTime%60); 
     if(theTime1 > 60) {
      theTime2 = parseInt(theTime1/60); 
      theTime1 = parseInt(theTime1%60); 
      if(theTime2 > 24){
       //大于24小时
       theTime3 = parseInt(theTime2/24);
       theTime2 = parseInt(theTime2%24);
      }
     } 
    } 
    var result = '';
    if(theTime2 > 0) { 
     result = ""+parseInt(theTime2)+"小时"+result; 
    } 
    if(theTime3 > 0) { 
     result = ""+parseInt(theTime3)+"天"+result; 
    }
    return result; 
   }

  render() {
   
    
    let qrcode = require('../../images/center/qrcode.png')
    let setting = require('../../images/center/setting.png')
    let scan = require('../../images/center/scan.png')
    let male = require('../../images/center/male.png')
    let female = require('../../images/center/female.png')

    let recommend = require('../../images/center/recommend.png');
    let article = require('../../images/center/article.png');
    let comment = require('../../images/center/comment.png');
    let predict = require('../../images/center/predict.png');
    let caogao = require('../../images/center/caogao.png');
    let collect = require('../../images/center/collect.jpg');
    let arrow = require('../../images/center/arrow.png');
    let logo = require('../../images/comment.png');

    let login = require('../../images/login.png');

    let forbidtext = '';
    if(this.state.user) {
      if(this.state.user.expire_ttl == -1) {
        forbidtext = '! 您的账户已被永久封禁，点击查看原因';
      } else if(this.state.user.expire_ttl > 0) {
        forbidtext = '! 您的账户已被封禁，剩余' + this.formatSeconds(this.state.user.expire_ttl) + '，点击查看原因';
      }
    }
    
    
    
    return (
      
      <ScrollView style={{backgroundColor:'#f7f7f7',flex:1}}>
        
        {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
        {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

        {!this.state.user &&
          <View>
          <View style={{width:width,backgroundColor:'#2ba4da'}}>
            <View style={{marginTop:20,paddingRight:10,width:width,flexDirection:'row',justifyContent:'flex-end'}}>
                  <TouchableOpacity onPress={()=>{this.props.navigation.navigate('Scanner')}}>
                    <Image resizeMode='stretch' source={scan} style={{marginTop:3,width:18,height:18,marginRight:10}}></Image>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{this.props.navigation.navigate('Settings')}}>
                    <Image resizeMode='stretch' source={setting} style={{marginTop:2,width:20,height:20,marginRight:10}}></Image>
                  </TouchableOpacity>
            </View>
            
            <View style={{backgroundColor:'white',paddingTop:15,paddingHorizontal:20,marginTop:10,width:width,borderTopLeftRadius:14,borderTopRightRadius:14}}>
            
              <View style={{marginTop:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={{fontWeight:'bold',fontSize:15,color:'#222'}}>登录数字海，体验更多功能</Text>
                <TouchableOpacity onPress={this.loginClick} style={{backgroundColor:'#33cafc',width:80,borderRadius:5,height:30,borderWidth:1,borderColor:'#33cafc',alignItems:'center',justifyContent:'center'}}>
                  <Text style={{color:'white',fontSize:14}}>登录</Text>
                </TouchableOpacity>
              </View>
  
            <View style={{marginTop:20,paddingVertical:10,marginBottom:10,borderTopColor:'#eee',borderTopWidth:0.5}}>
              <View style={{flexDirection:'row',backgroundColor:"#81c6fb",borderRadius:10}}>
                <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                  <Text style={styles.whitetext}>今日获阅读</Text>
                  <Text style={styles.whitetext}><Text style={{fontSize:16}}>0</Text>金币</Text>
                </View>
                <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                  <Text style={styles.whitetext}>本周获阅读</Text>
                  <Text style={styles.whitetext}><Text style={{fontSize:16}}>0</Text>金币</Text>
                </View>
                <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                  <Text style={styles.whitetext}>本月获阅读</Text>
                  <Text style={styles.whitetext}><Text style={{fontSize:16}}>0</Text>金币</Text>
                </View>
              </View>
            </View>
            </View>
          </View>

          <View style={{marginTop:10,backgroundColor:'white',borderRadius:3,paddingLeft:20}}>
          <TouchableOpacity onPress={this.nologin} style={{alignItems:'center',flexDirection:'row'}}>
            <Image style={{width:22,height:22}} source={article}></Image>
            <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:15}}>帖子（0）</Text>
              <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.nologin}  style={{alignItems:'center',flexDirection:'row'}}>
            <Image style={{width:22,height:22}} source={comment}></Image>
            <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:15}}>评论（0）</Text>
              <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.nologin}  style={{alignItems:'center',flexDirection:'row'}}>
            <Image style={{width:22,height:22}} source={predict}></Image>
            <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:15}}>预测（0）</Text>
              <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.nologin} style={{alignItems:'center',flexDirection:'row'}}>
          <Image style={{width:22,height:22}} source={recommend}></Image>
          <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontSize:15}}>推荐（0）</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
          </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.nologin}  style={{alignItems:'center',flexDirection:'row'}}>
            <Image style={{width:22,height:22}} source={collect}></Image>
            <View style={{marginLeft:10,flex:1,height:44,borderBottomColor:'#eee',borderBottomWidth:0.5,flexDirection:'row',justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:15}}>收藏（0）</Text>
              <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.nologin}  style={{alignItems:'center',flexDirection:'row'}}>
            <Image style={{width:22,height:22}} source={caogao}></Image>
            <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:15}}>草稿（0）</Text>
              <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
            </View>
          </TouchableOpacity>
          </View>
          </View>
        }

        {this.state.user != null &&
        <View>
        <View style={{width:width,backgroundColor:'#2ba4da'}}>
          <View style={{marginTop:50,paddingRight:10,width:width,flexDirection:'row',justifyContent:'flex-end'}}>
                <TouchableOpacity onPress={() => (this.setState({ qrVisible: true }))}>
                  <Image resizeMode='stretch' source={qrcode} style={{width:24,height:24,marginRight:10}}></Image>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('Scanner')}}>
                  <Image resizeMode='stretch' source={scan} style={{marginTop:3,width:18,height:18,marginRight:10}}></Image>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('Settings')}}>
                  <Image resizeMode='stretch' source={setting} style={{marginTop:2,width:20,height:20,marginRight:10}}></Image>
                </TouchableOpacity>
          </View>
          
          <View style={{backgroundColor:'white',paddingTop:15,paddingHorizontal:20,marginTop:10,width:width,borderTopLeftRadius:14,borderTopRightRadius:14}}>
          <View style={{width:width - 40,flexDirection:'row',justifyContent:'flex-end',height:30}}>
          </View>
            <View style={{marginTop:10}}>
              <View style={{flexDirection:"row",alignItems:"center"}}>
              <Text style={{fontSize:18,fontWeight:'bold',color:'black'}}>{this.state.user.name}</Text>
              {this.state.user.level == 2 &&
              <View style={{flexDirection:'row',alignItems:'center',marginLeft:10,backgroundColor:'#e6f2fd',paddingHorizontal:7,paddingVertical:5,borderRadius:5}}>
                <MaterialIcons name='verified-user' size={11} color={'#1787fb'}/>
                  <Text style={{marginLeft:3,color:'#1787fb',fontSize:11}}>管理员</Text>
              </View>
              } 
              </View>
              {this.state.user.expire_ttl >= -1 &&
              <View style={{flexDirection:'row'}}>
                <TouchableOpacity onPress={this.forbidReasonCheck} style={{marginTop:10,paddingHorizontal:10,borderRadius:3,backgroundColor:'#fd676a',alignItems:'center',paddingVertical:5}}>
                  <Text style={{color:'white',fontSize:12,fontWeight:'bold'}}>{forbidtext}</Text>
                </TouchableOpacity>
              </View>
              }
            </View>
            <View style={{marginTop:10}}>
            <Text style={styles.greytext}>{'数字号：' + this.state.user.wxname}</Text>
            </View>  
            <View style={{marginTop:10,flexDirection:'row',alignItems:'center',height:30,justifyContent:'space-between'}}>
              <View style={{height:30,flexDirection:'row',alignItems:'center'}}>
                <Text style={styles.greytext}>{'位置 : ' + (!!this.state.user.province?(this.state.user.province + "  " + this.state.user.city):'暂无')}</Text>
              </View>
              {this.state.status &&
              <View style={{marginRight:10,height:30,marginLeft:20,flexDirection:'row',alignItems:'center'}}>
                <TouchableOpacity onPress={this.goMyfocus} style={{height:30,flexDirection:'row',alignItems:'center',}}><Text style={styles.greytext}>关注：</Text><Text style={styles.numtext}>{this.state.status.focuscount}</Text></TouchableOpacity>
                <Text style={{color:'#e1e1e1',fontSize:10}}>{'   |   '}</Text>
                <TouchableOpacity onPress={this.goMyfans} style={{height:30,flexDirection:'row',alignItems:'center',}}><Text style={styles.greytext}>粉丝：</Text><Text style={styles.numtext}>{this.state.status.fanscount}</Text></TouchableOpacity>
                <Text style={{color:'#e1e1e1',fontSize:10}}>{'   |   '}</Text>
                <TouchableOpacity onPress={this.goMyfriends} style={{height:30,flexDirection:'row',alignItems:'center'}}><Text style={styles.greytext}>朋友</Text></TouchableOpacity>
              </View>
              }
            </View>
            
  
          {this.state.status &&
          <View style={{marginTop:10,paddingBottom:0,paddingTop:15,borderTopColor:'#eee',borderTopWidth:0.5}}>
            <View style={{flexDirection:'row',backgroundColor:"#81c6fb",borderRadius:10}}>
              <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                <Text style={styles.whitetext}>今日获阅读</Text>
                <Text style={styles.whitetext}><Text style={{fontSize:16}}>{this.state.status.viewdaycount}</Text>次</Text>
              </View>
              <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                <Text style={styles.whitetext}>本周获阅读</Text>
                <Text style={styles.whitetext}><Text style={{fontSize:16}}>{this.state.status.viewweekcount}</Text>次</Text>
              </View>
              <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                <Text style={styles.whitetext}>本月获阅读</Text>
                <Text style={styles.whitetext}><Text style={{fontSize:16}}>{this.state.status.viewmonthcount}</Text>次</Text>
              </View>
            </View>
          </View>
          }

          {this.state.status != null &&
            <View style={{flexDirection:"row",alignItems:'center',paddingVertical:10}}>
              <View style={{paddingVertical:5,alignItems:"center",justifyContent:"center",flex:1,borderRightWidth:0.5,borderRightColor:"#eee"}}>
                <Text style={{color:'#999'}}>创作等级：<Text style={{color:Colors.TextColor}}>{this.state.status.create_level}</Text></Text>
              </View>
              <View style={{paddingVertical:5,alignItems:"center",justifyContent:"center",flex:1}}>
                <Text style={{color:'#999'}}>预测等级：<Text style={{color:Colors.TextColor}}>{this.state.status.predict_level}</Text></Text>
              </View>
            </View>
          }
          </View>
         
          {!!this.state.user.avatar &&
          <View style={{position:'absolute',overflow:'hidden',top:50,left:20,borderWidth:2,borderColor:'white',borderRadius:70,width:70,height:70}}>  
            <Image resizeMode='cover' source={{uri:baseimgurl + this.state.user.avatar}} style={{width:66,height:66}}></Image>
          </View>
          }
          {!this.state.user.avatar &&
          <View style={{alignItems:"center",justifyContent:'center',position:'absolute',overflow:'hidden',top:50,left:20,borderWidth:2,borderColor:'white',borderRadius:70,width:70,height:70,backgroundColor:"#eee"}}> 
            <AntDesign name='user' size={40} color={'#999'}/>
          </View>
          }
          {this.state.user.gender!='' &&
          <View style={{position:'absolute',top:95,left:62,borderWidth:2,borderColor:'white',borderRadius:26,width:26,height:26}}>
            <Image resizeMode='stretch' source={this.state.user.gender == '男' ? male:female} style={{borderRadius:11,width:22,height:22}}></Image>
          </View>
          }
        </View>


        {this.state.status &&
        <View style={{marginTop:10,backgroundColor:'white',borderRadius:3,paddingLeft:20}}>
        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('MyArticlesScreen',{user:this.state.user})}} style={{alignItems:'center',flexDirection:'row'}}>
          <Image style={{width:22,height:22}} source={article}></Image>
          <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontSize:15}}>帖子（{this.state.status.articlecount}）</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('MyCommentsScreen',{user:this.state.user,title:'我的评论'})}}  style={{alignItems:'center',flexDirection:'row'}}>
          <Image style={{width:22,height:22}} source={comment}></Image>
          <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontSize:15}}>评论（{this.state.status.commentcount}）</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('MyPredictsScreen',{user:this.state.user})}}  style={{alignItems:'center',flexDirection:'row'}}>
          <Image style={{width:22,height:22}} source={predict}></Image>
          <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontSize:15}}>预测（{this.state.status.predictcount}）</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('MyCommentsScreen',{user:this.state.user,title:'我的推荐'})}} style={{alignItems:'center',flexDirection:'row'}}>
          <Image style={{width:22,height:22}} source={recommend}></Image>
          <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontSize:15}}>推荐（{this.state.status.pushcount}）</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('MyCollectsScreen',{user:this.state.user})}} style={{alignItems:'center',flexDirection:'row'}}>
            <Image style={{width:22,height:22}} source={caogao}></Image>
            <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:15}}>收藏（{this.state.status.collectcount}）</Text>
              <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
            </View>
          </TouchableOpacity>

        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('MyDraftsScreen',{user:this.state.user})}} style={{alignItems:'center',flexDirection:'row'}}>
          <Image style={{width:22,height:22}} source={caogao}></Image>
          <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontSize:15}}>草稿（{this.state.status.draftcount}）</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
          </View>
        </TouchableOpacity>
        </View>
        }
        </View>
      }

      {this.state.user &&
      <Modal
      animationType={"none"}
      transparent={true}
      visible={this.state.qrVisible}
      >
      <TouchableWithoutFeedback onPress={() => (this.setState({ qrVisible: false }))}>
        <View style={{ flex: 1,backgroundColor: 'rgba(0,0,0,0.4)',alignItems:'center',justifyContent:'center' }}>
          <View style={{paddingVertical:15,paddingHorizontal:15,backgroundColor:'white'}}>
          <QRCode
            value={"IComment?userid=" + this.state.user.id} size={width / 2} logo={{uri:baseimgurl + this.state.user.avatar}} logoBorderRadius={5} logoSize={width / 7}
          />
          </View>
        </View>
      </TouchableWithoutFeedback>
      </Modal>
      }
      </ScrollView>
    );
  }
}

const topStyles = StyleSheet.create({
  androidTop: {
    width: px(750),
    height: STATUSBAR_HEIGHT+30,
    backgroundColor:'#2ba4da',
  },  
  topBox: {
    backgroundColor:'#2ba4da',
    width: px(750),
    height: isIphoneX ? 74 : 50
  },
})
const styles = StyleSheet.create({
  greytext:{
    fontSize:14,
    color:Colors.sTextColor
  },
  numtext:{
    color:Colors.TextColor,
    fontSize:16,
    fontWeight:'bold'
  },
  whitetext:{
    color:'white',marginBottom:10,fontSize:14,fontWeight:'bold'
  }
});