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
     qrVisible:false
    }
  }


  componentWillMount = async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
      this.getPersonStatus(json.id);
    } else {
      this.setState({user:null})
    }

    this.logoutHandler = DeviceEventEmitter.addListener('logout', (data) => {
      this.setState({user:null})
    });
  }

  loadUserData = async() => {
    if(this.state.user != null) {
      this.getPersonStatus(this.state.user.id);
    }
    /*const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
      this.getPersonStatus(json.id);
    } else {
      this.setState({user:null})
    }*/
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
  
    this._navListener = this.props.navigation.addListener("didFocus", () => {
        
            //StatusBar.setBarStyle("dark-content"); //状态栏文字颜色
            //StatusBar.setBackgroundColor("#2ba4da"); //状态栏背景色
      this.loadUserData();
    });
  }

  componentWillUnmount() {
    this._navListener.remove();
  }

  nologin = () => {
    Alert.alert('您尚未登录')
  }
  
  wxLoginClick = async() => {
    await this.getUserInfo(2);
    DeviceEventEmitter.emit('login', null);
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
    let arrow = require('../../images/center/arrow.png');
    let logo = require('../../images/comment.png');

    let login = require('../../images/login.png');

    
    return (
      
      <View style={{backgroundColor:'#f7f7f7',flex:1}}>
        
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
                <Text style={{fontWeight:'bold',fontSize:15,color:'#222'}}>登录爱评论，体验更多功能</Text>
                <TouchableOpacity onPress={this.wxLoginClick} style={{backgroundColor:'#33cafc',width:90,borderRadius:5,height:28,borderWidth:1,borderColor:'#33cafc',alignItems:'center',justifyContent:'center'}}>
                  <Text style={{color:'white',fontSize:14}}>微信登录</Text>
                </TouchableOpacity>
              </View>
              
              <View style={{marginTop:20,flexDirection:'row',}}>
                <View style={{flex:1}}><Text style={styles.greytext}>发帖：<Text style={styles.numtext}>0</Text></Text></View>
                <View style={{flex:1}}><Text style={styles.greytext}>评论：<Text style={styles.numtext}>0</Text></Text></View>
                <View style={{flex:1}}><Text style={styles.greytext}>关注：<Text style={styles.numtext}>0</Text></Text></View>
                <View style={{flex:1}}><Text style={styles.greytext}>粉丝：<Text style={styles.numtext}>0</Text></Text></View>
              </View>
  
            <View style={{marginTop:20,paddingVertical:10,marginBottom:10,borderTopColor:'#eee',borderTopWidth:0.5}}>
              <View style={{flexDirection:'row',backgroundColor:"#81c6fb",borderRadius:10}}>
                <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                  <Text style={styles.whitetext}>今日获赞</Text>
                  <Text style={styles.whitetext}><Text style={{fontSize:16}}>0</Text>金币</Text>
                </View>
                <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                  <Text style={styles.whitetext}>本周获赞</Text>
                  <Text style={styles.whitetext}><Text style={{fontSize:16}}>0</Text>金币</Text>
                </View>
                <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                  <Text style={styles.whitetext}>本月获赞</Text>
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
            <View style={{marginTop:10,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end'}}>
              <Text style={{fontSize:18,fontWeight:'bold',color:'black'}}>{this.state.user.name}</Text>
               <Text style={[styles.greytext,{display:'none'}]}>上次登录：1小时前</Text>
            </View>
            <View style={{marginTop:10}}><Text style={styles.greytext}>{this.state.user.country + "  " + this.state.user.city}</Text></View>
            
            {this.state.status &&
            <View style={{marginTop:10,flexDirection:'row',}}>
              <View style={{flex:1}}><Text style={styles.greytext}>发帖：<Text style={styles.numtext}>{this.state.status.articlecount}</Text></Text></View>
              <View style={{flex:1}}><Text style={styles.greytext}>评论：<Text style={styles.numtext}>{this.state.status.commentcount}</Text></Text></View>
              <View style={{flex:1}}><Text style={styles.greytext}>关注：<Text style={styles.numtext}>{this.state.status.focuscount}</Text></Text></View>
              <View style={{flex:1}}><Text style={styles.greytext}>粉丝：<Text style={styles.numtext}>{this.state.status.fanscount}</Text></Text></View>
            </View>
            }
          {this.state.status &&
          <View style={{marginTop:20,paddingVertical:10,marginBottom:10,borderTopColor:'#eee',borderTopWidth:0.5}}>
            <View style={{flexDirection:'row',backgroundColor:"#81c6fb",borderRadius:10}}>
              <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                <Text style={styles.whitetext}>今日获赞</Text>
                <Text style={styles.whitetext}><Text style={{fontSize:16}}>{this.state.status.rewarddaycount}</Text>金币</Text>
              </View>
              <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                <Text style={styles.whitetext}>本周获赞</Text>
                <Text style={styles.whitetext}><Text style={{fontSize:16}}>{this.state.status.rewardweekcount}</Text>金币</Text>
              </View>
              <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                <Text style={styles.whitetext}>本月获赞</Text>
                <Text style={styles.whitetext}><Text style={{fontSize:16}}>{this.state.status.rewardmonthcount}</Text>金币</Text>
              </View>
            </View>
          </View>
           }
           
          </View>
         

          <View style={{position:'absolute',overflow:'hidden',top:40,left:20,borderWidth:2,borderColor:'white',borderRadius:84,width:84,height:84}}>
            <Image resizeMode='stretch' source={{uri:baseimgurl + this.state.user.avatar}} style={{width:80,height:80}}></Image>
          </View>
          <View style={{position:'absolute',top:95,left:73,borderWidth:2,borderColor:'white',borderRadius:30,width:30,height:30}}>
            <Image resizeMode='stretch' source={this.state.user.gender == '男' ? male:female} style={{borderRadius:13,width:26,height:26}}></Image>
          </View>
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
        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('MyCommentsScreen',{user:this.state.user})}}  style={{alignItems:'center',flexDirection:'row'}}>
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
        {false && <View style={{alignItems:'center',flexDirection:'row'}}>
          <Image style={{width:22,height:22}} source={recommend}></Image>
          <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontSize:15}}>推荐（{this.state.status.pushcount}）</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
          </View>
        </View>}
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
      </View>
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
    fontSize:13,
    color:Colors.sTextColor
  },
  numtext:{
    color:Colors.TextColor,
    fontSize:17
  },
  whitetext:{
    color:'white',marginBottom:10,fontSize:14,fontWeight:'bold'
  }
});