import React, { Component } from 'react';
import {ActivityIndicator,Alert,Picker,Modal,DeviceEventEmitter,Image,TextInput,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,Dimensions,TouchableOpacity,TouchableWithoutFeedback,Animated} from 'react-native';
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
import { baseimgurl } from '../../utils/Global';
import ImagePicker from 'react-native-image-picker';
import DatePicker from 'react-native-datepicker';
export default class Settings extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.state = {
       keyboardHeight:new Animated.Value(0),
       user:null,
       nameinput:"",
       namefocus:false,
       genderVisible:false,
       gender:'男',

       uploading:false,
       uploadingText:'头像上传中'
    }
  }
  

  _keyboardWillShow = (e) => {
    
    Animated.parallel([
        Animated.timing(this.state.keyboardHeight , {
          duration: e.duration,
          toValue: isIphoneX ? e.endCoordinates.height -34 : e.endCoordinates.height 
        })
      ]).start();
  }
  _keyboardWillHide = (e) => {

    Animated.parallel([
        Animated.timing(this.state.keyboardHeight , {
          duration: e.duration,
          toValue: 0
        })
      ]).start();
  }

  componentWillMount() {
    this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow);
    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);
  }

  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json,birthday:json.birthday})
    }
  }

  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();

    AsyncStorage.setItem("user",JSON.stringify(this.state.user));
    DeviceEventEmitter.emit('updateuser', { user: this.state.user});
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
        })
        const result = await that.uploadImage(response.uri);
        this.setState({
          uploading:false
        })
        if(result != null&& result.path) {
          let user = this.state.user;
          user.avatar = result.path;
          this.setState({
            user:user
          })
          //AsyncStorage.setItem("user",JSON.stringify(user));
          this.editUser('avatarUrl',result.path)

        } else {
          Alert.alert('error')
        }
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

  editUser = async(column,value) => {
    try {
      const result = await Request.post('editUser',{
        column:column,
        value:value,
        userid:this.state.user.id
      });
      return result.code;
    } catch (error) {
      console.log(error)
    }
  }
  
  nameChange = () => {
    this.setState({namefocus:true,nameinput:this.state.user.name},()=> {this.nameinput.focus()})
  }

  _onConfirmName = async () => {
    let result = await this.editUser('name',this.state.nameinput)
    if(result == -2) {
      const toastOpts = {
        data: '该名称已存在',
        textColor: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.7)',
        duration: 1000, //1.SHORT 2.LONG
        position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
      }
      WToast.show(toastOpts)
      return;
    }
    let user = this.state.user;
    user.name = this.state.nameinput;
    this.nameinput.blur()
    this.setState({
      user:user,
      namefocus:false
    })
    
  }
  genderChange = () => {
    this.setState({genderVisible:true})
  }
  birthdayChange = () => {
    this.datapicker.onPressDate();
  }

  areaChange = () => {
    this.props.navigation.navigate('ChooseProvince',{areaConfirm:this.areaConfirm});
  }

  phoneChange = ()=> {
    this.props.navigation.navigate('ChangePhone',{phoneConfirm:this.phoneConfirm})
  }

  phoneConfirm = (user) => {
    this.setState({
      user:user
    })
    const toastOpts = {
      data: '手机号修改成功',
      textColor: 'white',
      backgroundColor: Colors.TextColor,
      duration: 1000, //1.SHORT 2.LONG
      position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
    }
    WToast.show(toastOpts)
    return;
   
  }

  areaConfirm = (user) => {
    this.setState({
      user:user
    })
    const toastOpts = {
      data: '地区修改成功',
      textColor: 'white',
      backgroundColor: Colors.TextColor,
      duration: 1000, //1.SHORT 2.LONG
      position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
    }
    WToast.show(toastOpts)
    return;
  }

  _onConfirmGender = async() => {
    let user = this.state.user;
    user.gender = this.state.gender;
    this.nameinput.blur()
    this.setState({
      user:user,
      genderVisible:false
    })
    this.editUser('gender',this.state.gender)
  }

  _onConfirmBirthday = async(datetime) => {
    let user = this.state.user;
    user.birthday = datetime;
    this.setState({
      user:user
    })
    this.editUser('birthday',datetime)
  }
  
  render() {
    let arrow = require('../../images/center/arrow.png');

    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: '#f5f5f5'}}>
       
       <View style={{display:this.state.uploading?'flex':'none',position:this.state.uploading?'absolute':'relative',zIndex:9999,width:width,height:height,alignItems:'center',justifyContent:"center"}}>
          <View style={{width:px(200),height:px(200),borderRadius:5,backgroundColor:"rgba(0,0,0,0.8)",alignItems:'center',justifyContent:"center"}}>
            <ActivityIndicator  color='white'/>
            <Text style={{marginTop:5,color:'white',fontSize:11}}>{this.state.uploadingText}</Text>
          </View>
      </View>

      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title='编辑资料' isLeftTitle={true} />
      {this.state.user != null &&
      <View style={{marginTop:10,flex:1}}>
      
      <TouchableOpacity onPress={this.avatarChange} style={[styles.btn,{paddingVertical:7}]}>
        <Text style={{color:'black',fontSize:15}}>头像</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
        <Image style={{marginRight:5,width:46,height:46,borderRadius:23}} resizeMode='cover' source={{uri:baseimgurl + this.state.user.avatar}}></Image>
        <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={this.nameChange} style={[styles.btn]}>
        <Text style={{color:'black',fontSize:15}}>用户名</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Text style={{marginRight:5}}>{this.state.user.name}</Text>
        <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
        </View>
      </TouchableOpacity>
      <View style={[styles.btn]}>
        <Text style={{color:'black',fontSize:15}}>数字号</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Text style={{marginRight:25}}>{this.state.user.wxname}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={this.genderChange} style={[styles.btn]}>
        <Text style={{color:'black',fontSize:15}}>性别</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Text style={{marginRight:5}}>{this.state.user.gender}</Text>
        <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={this.birthdayChange} style={[styles.btn]}>
        <Text style={{color:'black',fontSize:15}}>生日</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Text style={{marginRight:5}}>{!!this.state.user.birthday?this.state.user.birthday:"待完善"}</Text>
        <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
        </View>
      </TouchableOpacity>
      <DatePicker
              ref={datapicker => this.datapicker = datapicker}
              style={{width: 0,height:0}}
              date={this.state.user.birthday}
              mode="date"
              format="YYYY-MM-DD"
              confirmBtnText="确定"
              cancelBtnText="取消"
              showIcon={false}
              onDateChange={(datetime) => {this._onConfirmBirthday(datetime)}}
              customStyles={{
                btnTextConfirm:{
                  color:Colors.TextColor
                }
                }}
      />
      <TouchableOpacity onPress={this.areaChange} style={[styles.btn]}>
        <Text style={{color:'black',fontSize:15}}>地区</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Text style={{marginRight:5}}>{this.state.user.province + ' ' + this.state.user.city}</Text>
        <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={this.phoneChange} style={[styles.btn]}>
        <Text style={{color:'black',fontSize:15}}>手机号</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Text style={{marginRight:5}}>{this.state.user.phone}</Text>
        <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
        </View>
      </TouchableOpacity>
      </View>
      }

      


      <TouchableWithoutFeedback onPress={()=> {this.nameinput.blur(),this.setState({namefocus:false})}}>
        <View style={{display:this.state.namefocus?'flex':'none',position:this.state.namefocus?'absolute':'relative',backgroundColor:'rgba(0,0,0,0)',zIndex:99,width:width,height:height}}>
        </View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={{zIndex:100,display:this.state.namefocus?'flex':'none',marginBottom:this.state.keyboardHeight,flexDirection:'column',
        backgroundColor:'white',borderTopColor:'#eee',borderTopWidth:0.5,paddingVertical:12,paddingHorizontal:15}}>
            <View style={{flexDirection:"row",width:'100%',alignItems:"center"}}>
              <View style={{flex:1,height:px(140),paddingHorizontal:px(20),paddingVertical:px(10),borderRadius:3,backgroundColor:"#f7f7f7",borderColor:'#eee',borderWidth:0.5}}>
              <TextInput value={this.state.nameinput} onChangeText = {(nameinput) => this.setState({nameinput})} 
              placeholder={''} 
              maxLength={15} multiline={true} underlineColorAndroid="transparent" ref={nameinput => this.nameinput = nameinput}
              style={{flex:1,textAlignVertical: 'top'}}/>
              </View>

              {this.state.nameinput == '' && 
              <View style={{marginLeft:10,width:px(70),alignItems:'center'}}>
                <Text style={{color:Colors.GreyColor,fontSize:px(32),fontWeight:'bold'}}>确定</Text>
              </View>
              }
               {this.state.nameinput != '' && 
              <TouchableOpacity onPress={()=>this._onConfirmName()} style={{marginLeft:10,width:px(70),alignItems:'center'}}>
                <Text style={{color:'#1187fb',fontSize:px(32),fontWeight:'bold'}}>确定</Text>
              </TouchableOpacity>
              }
            </View>
        </Animated.View>
      {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}

      <Modal
        animationType={"slide"}
        transparent={true}
        visible={this.state.genderVisible}
        >
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent:'flex-end'}}>
          <View style={{backgroundColor:'#fff'}}>
            <View style={{flexDirection:'row',paddingHorizontal:px(30), justifyContent:'space-between', alignItems:'center', height: px(90)}}>
              <TouchableOpacity onPress={()=> {this.setState({genderVisible:false})}}>
                <Text style={{fontSize: 16, color: '#666'}}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this._onConfirmGender}>
                <Text style={{fontSize: 16, color: Colors.TextColor, fontWeight:'bold'}}>确认</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={this.state.gender}
              onValueChange={(value,itemIndex) => (this.setState({gender:value}))}
            > 
              <Picker.Item key={'男'} label={'男'} value={'男'} />
              <Picker.Item key={'女'} label={'女'} value={'女'} />
            </Picker>
          </View>
        </View>
        {
          isIphoneX && <View style={{height: 34}}></View>
        }
      </Modal>
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
