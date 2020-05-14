import React, { Component } from 'react';
import {ActivityIndicator,Modal,DeviceEventEmitter,Alert,Image,TextInput,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated} from 'react-native';
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
import { baseurl, baseimgurl } from '../utils/Global';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Colors} from '../constants/iColors';
import ImagePicker from 'react-native-image-picker';
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
       times:0,
       settingVisible:false,
       avatar:'user.png',
       name:'',
       uploading:false
    }
  }
  

  

  componentWillMount() {
    
  }

  componentDidMount= async() => {
  }

  componentWillUnmount() {
    !!this.timecount && clearTimeout(this.timecount);
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
          !!this.timecount && clearTimeout(this.timecount);
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
      } else if(result.code == 2) { // new user
        this.setState({
          settingVisible:true
        })
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

  avatarChange =() => {
    const photoOptions = {
      title:'请选择',
      quality: 0.8,
      cancelButtonTitle:'取消',
      takePhotoButtonTitle:'拍照',
      chooseFromLibraryButtonTitle:'选择相册',
      allowsEditing: true,
      noData: false,
      storageOptions: {
          skipBackup: true,
          path: 'images'
      }
    };
    let that = this;
    ImagePicker.showImagePicker(photoOptions, async (response) => {
      this.pickimage = true;
      if (response.didCancel) {
      }
      else if (response.error) {
         
      }
      else if (response.customButton) {
      }
      else {
        this.setState({
          uploading:true
        },async () => {
          const result = await that.uploadImage(response.uri);
          if(result != null&& result.path) {
            this.setState({
              avatar:result.path,
              uploading:false
            })
          } else {
            Alert.alert('error')
          }
        })
        
      }
    })
  }

  uploadImage = async(uri) => {
    let result;
    let formData = new FormData();
    let file = {uri: "file://" + uri, type: 'multipart/form-data', name: uri};
    formData.append("multipartFiles",file);
    try {
      result = await Request.post3('uploadImage',formData,'formdata');
    } catch (error) {
      console.log(error)
    }
    return result;
  }

  confirm = async () => {
    if(this.state.name == '') {
      Alert.alert('请您输入名字')
      return;
    }
    try {
      const result = await Request.post('phoneRegister',{
        phone:this.state.phone,
        name:this.state.name,
        avatar:this.state.avatar
      });
      if(result.code == 1) {
         if(result.data == null) {
           Alert.alert('名字重复，请重新输入')
           return;
         } else {
           this.setState({settingVisible:false}, async () => {
            await AsyncStorage.setItem('user', JSON.stringify(result.data), function (error) {})
            DeviceEventEmitter.emit('login', result.data);
            !!this.timecount && clearTimeout(this.timecount);
            this.props.navigation.goBack();
           })
          
         }
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

        <Modal
          animationType={"slide"}
          transparent={true}
          visible={this.state.settingVisible}
        >
          <View style={[{top:0,left:0,width:width,height:height,backgroundColor:'rgba(0,0,0,0.4)',zIndex:9999,flexDirection:'column',alignItems:"center",justifyContent:"flex-end"}]}>
            <View style={{width:width,height:600,borderRadius:5,backgroundColor:"white",borderTopRightRadius:20,borderTopLeftRadius:20,alignItems:"center"}}>
              <View style={{marginTop:30,alignItems:"center",justifyContent:"center"}}><Text style={{color:"black",fontSize:16}}>给您的账号设置头像和名字吧</Text></View>
              <TouchableWithoutFeedback onPress={this.avatarChange}>
                <View style={{position:'relative',overflow:'hidden',marginTop:30,borderRadius:100,width:100,height:100}}>  
                  <Image resizeMode='cover' source={{uri:baseimgurl + this.state.avatar}} style={{width:100,height:100}}></Image>
                  <FontAwesome name='camera' size={46} color={'white'} style={{top:27,left:26,position:'absolute'}}/>
                </View>
              </TouchableWithoutFeedback>
              
              <View style={{marginTop:10,display:this.state.uploading ? 'flex' : 'none'}} >
                <ActivityIndicator color='black'/>
              </View>
              

              <TextInput value={this.state.name} onChangeText = {(name) => this.setState({name})} 
              placeholder={'输入名字'}
              autoFocus={true}
              maxLength={15} underlineColorAndroid="transparent"
              style={{marginTop:30,width:width - 60,fontSize:15,paddingLeft:10,borderWidth:1,borderColor:"#aaa",textAlignVertical: 'top',borderRadius:3,height:42}}/>


              <TouchableOpacity onPress={this.confirm} style={{width:width - 60,marginTop:30,borderRadius:5,height:42,alignItems:'center',justifyContent:"center",backgroundColor:Colors.TextColor}}><Text style={{color:'white',fontSize:16}}>确定</Text></TouchableOpacity>
    
            </View>
          </View>
        </Modal>
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
