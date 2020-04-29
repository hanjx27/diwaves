import React, { Component } from 'react';
import {DeviceEventEmitter,Alert,Image,TextInput,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../components/Header';
import {px,isIphoneX} from '../utils/px';
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ScrollView } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import { baseurl } from '../utils/Global';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Colors} from '../constants/iColors';
export default class login extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.state = {
       user:null,
       phone:'',
       vercode:'',
       times:0
    }
  }
  

  

  componentWillMount() {
    
  }

  componentDidMount= async() => {
  }

  componentWillUnmount() {
    this.timecount && clearTimeout(this.timecount);
  }
  
  phoneLogin = async()=> {

    if(this.state.phone.length != 11 || this.state.vercode == '') {
      Alert.alert('请输入正确的手机号和验证码')
      return;
    }
    try {
      const result = await Request.post('phoneLogin',{
        phone:this.state.phone,
        vercode:this.state.vercode
      });
      if(result.code == -9) {
        const toastOpts = {
          data: '验证码错误',
          textColor: '#ffffff',
          backgroundColor: 'rgba(0,0,0,0.7)',
          duration: 1000, //1.SHORT 2.LONG
          position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
        }
        WToast.show(toastOpts)
        return;
      } else if(result.code == -1) {
        const toastOpts = {
          data: 'error',
          textColor: '#ffffff',
          backgroundColor: 'rgba(0,0,0,0.7)',
          duration: 1000, //1.SHORT 2.LONG
          position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
        }
        WToast.show(toastOpts)
        return;
      } else if(result.code == 1) {
        /*let user = this.state.user;
        user.phone = this.state.phone;
        this.props.navigation.state.params.phoneConfirm(user);*/
        if(!!result.data) {
          await AsyncStorage.setItem('user', JSON.stringify(result.data), function (error) {})
          DeviceEventEmitter.emit('login', result.data);
          this.props.navigation.goBack();
        } else {
          const toastOpts = {
            data: 'error',
            textColor: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            duration: 1000, //1.SHORT 2.LONG
            position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
          }
          WToast.show(toastOpts)
          return;
        }
        
      }
    } catch (error) {
      console.log(error)
    }
  }


  timeCount = ()=> {
    let times = this.state.times - 1;
    this.setState({
      times:times
    })
    if(times > 0) {
      setTimeout(this.timeCount,1000)
    }
  }

  sendVercode= async()=> {
    try {
      const result = await Request.post('sendVercode',{
        phone:this.state.phone
      });
      if(result.code == 1) {
          this.setState({
            times:60
          })
          this.timecount = setTimeout(this.timeCount,1000)
      }
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <ScrollView style={{width:width,height:height,flexDirection:'column',backgroundColor: 'white',display:'flex'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}
      <TouchableOpacity style={{marginLeft:15,marginTop:15}} onPress={()=> {this.props.navigation.goBack()}}>
        <AntDesign name='close' size={25} color={'black'}/>
      </TouchableOpacity>

      <View style={{paddingLeft:30,justifyContent:"center",marginTop:20}}>
        <Text style={{color:'black',fontSize:22,fontWeight:'bold'}}>欢迎使用</Text>
        <Text style={{fontSize:13,marginTop:15,color:'#999'}}>未注册过的手机号将自动创建账号</Text>
      </View>

      <View style={{flex:1,paddingHorizontal:30,paddingTop:60}}>
      <TextInput value={this.state.phone} onChangeText = {(phone) => this.setState({phone})} 
              placeholder={'请输入新手机号'}
              maxLength={20} underlineColorAndroid="transparent" ref={phoneinput => this.phoneinput = phoneinput} 
              style={{fontSize:15,paddingLeft:10,backgroundColor:'#f5f5f5',textAlignVertical: 'top',borderRadius:2,height:46}}/>


     <View style={{marginTop:20,flexDirection:'row',alignItems:'center',backgroundColor:"#f5f5f5"}}>
     <TextInput value={this.state.vercode} onChangeText = {(vercode) => this.setState({vercode})} 
              placeholder={'输入验证码'}
              maxLength={10} underlineColorAndroid="transparent" ref={vercode => this.vercode = vercode} 
              style={{flex:1,fontSize:15,paddingLeft:10,backgroundColor:'#f5f5f5',textAlignVertical: 'top',borderRadius:2,height:46}}/>
      {this.state.phone.length != 11 &&
      <View style={{paddingHorizontal:15,borderLeftColor:'#e1e1e1',borderLeftWidth:1,height:25,justifyContent:'center',alignItems:'center'}}>
        <Text style={{fontSize:15,color:'#ccc'}}>获取验证码</Text>
      </View>
      }
      {
        this.state.times > 0 &&
        <View style={{paddingHorizontal:15,borderLeftColor:'#e1e1e1',borderLeftWidth:1,height:25,justifyContent:'center',alignItems:'center'}}>
        <Text style={{fontSize:15,color:'#ccc'}}>{this.state.times + 's后重新获取'}</Text>
      </View>
      }
      {this.state.times == 0 && this.state.phone.length == 11 &&
      <TouchableOpacity onPress={this.sendVercode} style={{paddingHorizontal:15,borderLeftColor:'#e1e1e1',borderLeftWidth:1,height:25,justifyContent:'center',alignItems:'center'}}>
        <Text style={{fontSize:15,color:Colors.TextColor}}>获取验证码</Text>
      </TouchableOpacity>
      }
      </View>
      <TouchableOpacity onPress={this.phoneLogin} style={{marginTop:40,borderRadius:30,height:46,alignItems:'center',justifyContent:"center",backgroundColor:Colors.TextColor}}><Text style={{color:'white',fontSize:16}}>登录</Text></TouchableOpacity>
    </View>  


      <View style={{marginTop:50,height:150,paddingHorizontal:30}}>
        <View style={{alignItems:"center",flexDirection:"row"}}>
          <View style={{backgroundColor:"#e1e1e1",height:0.5,flex:1}}></View>
            <FontAwesome name='weixin' size={30} color={'#1fb922'} style={{marginHorizontal:15}}/>
          <View style={{backgroundColor:"#e1e1e1",height:0.5,flex:1}}></View>
        </View>
        <View style={{marginTop:30,flexDirection:'row',alignItems:'center',justifyContent:"center"}}>
          <Text style={{color:'#777',fontSize:12}}>登录表示同意</Text>
          <TouchableOpacity onPress={()=> {this.props.navigation.navigate('WebContainer',{title:'用户协议',url:baseurl + 'protocol.html'})}}><Text style={{color:'#777',fontSize:12,textDecorationLine:'underline'}}>《数字海用户协议》</Text></TouchableOpacity>
        </View>
      </View>

      {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}
      </ScrollView>
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
