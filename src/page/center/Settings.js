import React, { Component } from 'react';
import {Alert,DeviceEventEmitter,Image,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'
import {Colors} from '../../constants/iColors'
import { baseurl } from '../../utils/Global';
const versionnow = "1.0.0";

export default class Settings extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.state = {
       user:null
    }
  }
  

  

  componentWillMount() {
    
  }

  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
    }
  }

  componentWillUnmount() {
  }

  logout = async() => {
    Alert.alert('退出确认', '确认要退出当前账号吗？',
        [
            {
                text: "是", onPress: async() => {
                  await AsyncStorage.removeItem('user');
                  this.setState({
                    user:null
                  })
                  DeviceEventEmitter.emit('logout', null);
                  this.props.navigation.goBack();
                }
            },
            {text: "否"}
        ])
  }

  checkversion = async()=> {
    try {
      const result = await Request.post('version',{
    });
      const version = result.data;
      if(!!version) {
        if(version.version != versionnow) {
          Alert.alert('版本更新', '已有新版本，是否更新？',
        [
            {
                text: "是", onPress: async() => {
                }
            },
            {text: "否"}
        ])
        } else {
          const toastOpts = {
            data: '您的应用为最新版本',
            textColor: '#ffffff',
            backgroundColor: Colors.TextColor,
            duration: 700, //1.SHORT 2.LONG
            position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
          }
          WToast.show(toastOpts)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  
  render() {
    let arrow = require('../../images/center/arrow.png');

    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: '#f5f5f5'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title='设置' isLeftTitle={true} />

      <View style={{marginTop:10,flex:1}}>
      {this.state.user != null &&
      <TouchableOpacity onPress={()=> {this.props.navigation.navigate('Edit')}} style={[styles.btn]}>
        <Text style={{color:'black',fontSize:15}}>编辑资料</Text>
        <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
      </TouchableOpacity>
      }
      <TouchableOpacity onPress={()=> {this.props.navigation.navigate('WebContainer',{title:'用户协议',url:baseurl + 'protocol.html'})}} style={[styles.btn]}>
        <Text style={{color:'black',fontSize:15}}>用户协议</Text>
        <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=> {this.props.navigation.navigate('WebContainer',{title:'隐私政策',url:baseurl + 'privacy.html'})}} style={[styles.btn]}>
        <Text style={{color:'black',fontSize:15}}>隐私政策</Text>
        <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=> {this.props.navigation.navigate('WebContainer',{title:'关于数字海',url:baseurl + 'about.html'})}} style={[styles.btn]}>
        <Text style={{color:'black',fontSize:15}}>关于数字海</Text>
        <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=> {this.props.navigation.navigate('WebContainer',{title:'联系我们',url:baseurl + 'contact.html'})}} style={[styles.btn]}>
        <Text style={{color:'black',fontSize:15}}>联系我们</Text>
        <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
      </TouchableOpacity>
      <TouchableOpacity onPress={this.checkversion} style={[styles.btn,{display:"none"}]}>
        <Text style={{color:'black',fontSize:15}}>检查版本</Text>
      </TouchableOpacity>
      {this.state.user != null &&
      <TouchableOpacity onPress={this.logout} style={styles.exit}>
        <Text style={{color:'red',fontSize:15}}>退出登录</Text>
      </TouchableOpacity>
      }
      </View>

      <View style={{marginBottom:40,alignItems:'center',justifyContent:"center"}}>
        <Text style={{color:'#999',fontSize:13}}>COPYRIGHT©2019</Text>
        <Text style={{color:'#999',fontSize:13,marginTop:3}}>苏州数字海科技有限公司</Text>
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
    backgroundColor:'#f5f5f5',
    width: px(750),
    height: isIphoneX ? 44 : 20
  },
  footerBox:{
    backgroundColor:'#f5f5f5',
    width: px(750),
    height: isIphoneX ? 34 : 0
  }
})

const styles = StyleSheet.create({
  btn:{
    backgroundColor:'white',
    alignItems:"center",
    flexDirection:'row',
    paddingVertical:15,
    marginTop:0,
    paddingLeft:15,
    borderTopWidth:0.5,
    borderTopColor:'#f5f5f5',
    justifyContent:'space-between'
  },
  exit:{
    backgroundColor:'white',
    alignItems:"center",
    justifyContent:'center',
    paddingVertical:15,
    marginTop:30,
  }
})
