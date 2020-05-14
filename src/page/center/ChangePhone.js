import React, { Component } from 'react';
import {Image,StatusBar,TextInput,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated, Alert} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'

import {Colors} from '../../constants/iColors';
export default class ChangePhone extends React.Component {
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
       vercode:"",
       title:'',
       times:0,
    }
  }
  

  

  componentWillMount() {
    
  }

  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      let title = '';
      if(!json.phone) {
        title = '绑定手机号';
      } else {
        title = '更换手机号';
      }
      this.setState({user:json,title:title})
    }
  }

  componentWillUnmount() {
    this.timecount && clearTimeout(this.timecount);
  }

  changephone = async()=> {
    if(this.state.phone == this.state.user.phone) {
      Alert.alert('新旧手机号相同')
      return;
    }

    if(this.state.phone.length != 11 || this.state.vercode == '') {
      Alert.alert('请输入正确的手机号和验证码')
      return;
    }
    try {
      const result = await Request.post('editUser',{
        column:'phone',
        value:this.state.phone,
        userid:this.state.user.id,
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
      } else if(result.code == -2) {
        const toastOpts = {
          data: '此手机号已经绑定',
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
        let user = this.state.user;
        user.phone = this.state.phone;
        this.props.navigation.state.params.phoneConfirm(user);
        this.props.navigation.goBack();
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
    if(this.state.phone == this.state.user.phone) {
      Alert.alert('新旧手机号相同')
      return;
    }
    
    try {
      const result = await Request.post('sendVercode',{
        phone:this.state.phone
      });
      if(result.code == 1) {
          this.setState({
            times:60
          })
          this.timecount = setTimeout(this.timeCount,1000)
      } else if(result.code == -2) {
          const toastOpts = {
            data: '此手机号已经绑定',
            textColor: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            duration: 1000, //1.SHORT 2.LONG
            position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
          }
          WToast.show(toastOpts)
          return;
      }
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title={this.state.title} isLeftTitle={true} />
  
      <View style={{flex:1,paddingHorizontal:30,paddingTop:40}}>
      <TextInput value={this.state.phone} onChangeText = {(phone) => this.setState({phone})} 
              placeholder={'请输入新手机号'}
              maxLength={20} underlineColorAndroid="transparent" ref={phoneinput => this.phoneinput = phoneinput} 
              style={{fontSize:15,paddingLeft:10,backgroundColor:'#f5f5f5',textAlignVertical: 'top',borderRadius:2,height:50}}/>


     <View style={{marginTop:20,flexDirection:'row',alignItems:'center',backgroundColor:"#f5f5f5"}}>
     <TextInput value={this.state.vercode} onChangeText = {(vercode) => this.setState({vercode})} 
              placeholder={'输入验证码'}
              maxLength={10} underlineColorAndroid="transparent" ref={vercode => this.vercode = vercode} 
              style={{flex:1,fontSize:15,paddingLeft:10,backgroundColor:'#f5f5f5',textAlignVertical: 'top',borderRadius:2,height:50}}/>
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
      <TouchableOpacity onPress={this.changephone} style={{marginTop:40,borderRadius:30,height:48,alignItems:'center',justifyContent:"center",backgroundColor:Colors.TextColor}}><Text style={{color:'white',fontSize:15}}>确定</Text></TouchableOpacity>
    </View>   
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
