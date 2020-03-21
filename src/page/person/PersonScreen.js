import React, { Component } from 'react';
import {Alert,Image,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
const { StatusBarManager } = NativeModules;

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

import Icon from 'react-native-vector-icons/Ionicons'

import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import { baseimgurl, baseurl } from '../../utils/Global';
import {Colors} from '../../constants/iColors';
import FocusBtn from '../../components/FocusBtn';
export default class PersonScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.center = this.props.navigation.getParam('center',false);
    this.personid = props.navigation.getParam('personid');
    this.state = {
      user:null,
      person:null,
      personname:'',
      status:null
    }
  }
  

  

  componentWillMount = async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
    }
    
  }

  getPersonInfo = async(id) => {
    try {
      const result = await Request.post('getUserInfo',{
        id:id
      });
      const person = result.data;
      this.setState({
        person:person,
        personname:person.name
      })
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

  componentDidMount= async() => {
    
    this.getPersonInfo(this.personid)
    this.getPersonStatus(this.personid)
  }

  componentWillUnmount() {
    
  }

  
  focusChange = (flag) => {
    if(flag) { //新增
      let status = this.state.status;
      status.fanscount = status.fanscount + 1;
      this.setState({
        status:status
      })
    } else { //减少
      let status = this.state.status;
      status.fanscount = status.fanscount - 1;
      this.setState({
        status:status
      })
    }
  }

  sendMsg =() => {
    if(!this.state.user) {
      Alert.alert('您尚未登录')
      return;
    } else {
      this.props.navigation.navigate('MessageDetail',{person:this.state.person})
    }
  
  }
  goback = () => {
     if(this.center) {
       this.props.navigation.navigate('Center');
      } else {
        this.props.navigation.goBack()
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
    let predict = require('../../images/center/predict.png');
    let caogao = require('../../images/center/caogao.png');
    let arrow = require('../../images/center/arrow.png');

    const leftBtn =
      <TouchableOpacity onPress={this.goback} style={[styles.btns, {flexDirection:'row',justifyContent:'flex-start', alignItems:'center'}]}>
      <Icon
        name='ios-arrow-back'
        size={24}
        color='#000'
      />
    </TouchableOpacity>

    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
      
        
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header leftBtn={leftBtn} title={this.state.personname}/>
        
        <View style={{width:width,backgroundColor:'#2ba4da'}}>
          <View style={{marginTop:20,height:24,paddingRight:10,width:width,flexDirection:'row',justifyContent:'flex-end'}}>
             
          </View>
          
          <View style={{backgroundColor:'white',paddingTop:15,paddingHorizontal:20,marginTop:10,width:width,borderTopLeftRadius:14,borderTopRightRadius:14}}>
          
          <View style={{width:width - 40,flexDirection:'row',justifyContent:'flex-end',height:28}}>
          {(this.state.user == null || this.personid != this.state.user.id) &&
            <TouchableOpacity onPress={this.sendMsg} style={{borderRadius:5,paddingVertical:7,width:70,alignItems:'center',borderColor:'#e1e1e1',borderWidth:0.5,marginRight:10}}>
              <Text style={{color:'#333'}}>私信</Text>
            </TouchableOpacity>
          }

          {(this.state.user == null || this.personid != this.state.user.id) &&
            <FocusBtn focusChange={this.focusChange} focususerid={this.personid}></FocusBtn>
          }
          </View>
          
            {this.state.status &&
            <View style={{marginTop:10,flexDirection:'row',}}>
              <View style={{flex:1}}><Text style={styles.greytext}>发帖：<Text style={styles.numtext}>{this.state.status.articlecount}</Text></Text></View>
              <View style={{flex:1}}><Text style={styles.greytext}>评论：<Text style={styles.numtext}>{this.state.status.commentcount}</Text></Text></View>
              <View style={{flex:1}}><Text style={styles.greytext}>关注：<Text style={styles.numtext}>{this.state.status.focuscount}</Text></Text></View>
              <View style={{flex:1}}><Text style={styles.greytext}>粉丝：<Text style={styles.numtext}>{this.state.status.fanscount}</Text></Text></View>
            </View>
            }
          </View>

          { this.state.person && this.state.person.avatar &&
          <View style={{position:'absolute',overflow:'hidden',top:10,left:20,borderWidth:2,borderColor:'white',borderRadius:84,width:84,height:84}}>
              <Image resizeMode='stretch' source={{uri:baseimgurl + this.state.person.avatar}} style={{width:80,height:80}}></Image>
          </View>
          }
          { this.state.person && this.state.person.avatar &&
          <View style={{position:'absolute',top:65,left:73,borderWidth:2,borderColor:'white',borderRadius:30,width:30,height:30}}>
            <Image resizeMode='stretch' source={this.state.person.gender == '男' ? female:male} style={{borderRadius:13,width:26,height:26}}></Image>
          </View>
          }
        </View>
       
        {this.state.status && this.state.person &&
        <View style={{marginTop:10,backgroundColor:'white',borderRadius:3,paddingLeft:20}}>
        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('MyArticlesScreen',{user:this.state.person})}} style={{alignItems:'center',flexDirection:'row'}}>
          <Image style={{width:22,height:22}} source={article}></Image>
          <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontSize:15}}>帖子（{this.state.status.articlecount}）</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('MyCommentsScreen',{user:this.state.person})}} style={{alignItems:'center',flexDirection:'row'}}>
          <Image style={{width:22,height:22}} source={predict}></Image>
          <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontSize:15}}>评论（{this.state.status.commentcount}）</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
          </View>
        </TouchableOpacity>
        
        </View>
        }
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
  },
  btns: {
    minWidth: 44, 
    height: 44, 
    alignItems:'flex-start',
    justifyContent: 'center'
  }
});