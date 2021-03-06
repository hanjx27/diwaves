import React, { Component } from 'react';
import {Image,FlatList,ActivityIndicator,NativeModules,PanResponder,TextInput,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated, Alert} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import MessageItem from '../../components/MessageItem';
import Feather from 'react-native-vector-icons/Feather';
import {Colors} from '../../constants/iColors'; 
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

export default class MessageDetail extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.person = props.navigation.getParam('person');
    this.message = props.navigation.getParam('message');
    if(this.person == null && this.message != null) {
      this.person = {
        id:this.message.touserid,
        name:this.message.username,
        avatar:this.message.avatar
      }
    }
    
    this.messageList = []
    this.state = {
      keyboardHeight:new Animated.Value(0),
       user:null,
       content:'',
       messages:[],

       uploading:false,
       uploadingText:'图片上传中'
    }
  }
  

  imageClick = async()=>{
    if(this.state.user == null) {
      Alert.alert('您尚未登录')
      return;
    }

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
          let content = "$pic$_#_path=" + result.path;
          await this.send(content)
        }
        
      }
  });
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

  send = async(content) => {
  
    if(this.state.user == null) {
      Alert.alert('您尚未登录')
      return;
    }
    try {
      const result = await Request.post('addMessage',{
        userid:this.state.user.id,
        touserid:this.person.id,
        content:content
      });
      if(result.code == -2) {
        Alert.alert('您已被封禁')
        return;
      }
      if(result.code == -3) {
        Alert.alert('您与' + this.person.name + "还不是朋友，不能发送私信")
        return;
      }
      if(result.code != -1) {
        let message = {
          id:result.data.id,
          createdatetime:result.data.createdatetime,
          content:content,
          touserid:this.person.id
        }
         let messages = this.state.messages;
         messages.push(message);
         this.setState({messages:messages},()=> {
          setTimeout(()=> {
             this.flatlist.scrollToEnd();
           },300)
         })
         let i = 0;
         for(;i < this.messageList.length;i++) {
           if(this.messageList[i].touserid == this.person.id) {
             let messagebody = this.messageList[i];
             messagebody.userread = 1;
             messagebody.messages = messages
             if(i != 0) {
              this.messageList.splice(i,1);
              this.messageList.unshift(messagebody);
             }
             break;
           }
         }
         if(i == this.messageList.length) {
           let messagebody = {
             userread :1,
             type:1,
             touserid:this.person.id,
             username:this.person.name,
             avatar:this.person.avatar,
             messages:[message]
           }
           this.messageList.unshift(messagebody);
         }
         AsyncStorage.setItem('messageList_' + this.state.user.id, JSON.stringify(this.messageList))

      }
    } catch (error) {
      console.log(error)
    }
    this.setState({
      content:''
    })
    this.input.blur()
  }

  componentWillMount() {
    this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow);
    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);
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
  
  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
      const messageListstr = await AsyncStorage.getItem('messageList_' + json.id);
      if(messageListstr != null && messageListstr != '') {
        const messagelist = JSON.parse(messageListstr);
        this.messageList = messagelist;
        for(let i = 0;i < this.messageList.length;i++) {
          if(this.messageList[i].touserid == this.person.id) {
            let messages = this.messageList[i].messages
            this.setState({
              messages:messages
            },() => {
              if(messages.length > 0) {
                setTimeout(()=> {
                 // this.flatlist.scrollToEnd();
                },1000)
              }
              
            })
            if(this.messageList[i].userread == 0) {
              this.messageList[i].userread = 1;
              await AsyncStorage.setItem('messageList_' + json.id, JSON.stringify(this.messageList));
            }
            break;
          }
        }
      }
    }
  }

  componentWillUnmount = async() => {
    //await AsyncStorage.setItem('messageList_' + this.state.user.id, JSON.stringify(this.messageList));

    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
  }

  
  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: '#f7f7f7'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title={this.person.name} isLeftTitle={false}/>

      {this.state.user &&
      <FlatList
      ref={flatlist => this.flatlist = flatlist}
              style={{ flex:1,marginTop: 0 }}
              data={this.state.messages}
              renderItem={
                ({ item }) => {
                  return(
                    <MessageItem user={this.state.user} person={this.person} message={item}></MessageItem>
                  )
                }
              }
              keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
              ItemSeparatorComponent={this._separator}
            />
      }

      <Animated.View
        style={{zIndex:100,display:'flex',marginBottom:this.state.keyboardHeight,flexDirection:'column',
        backgroundColor:'white',borderTopColor:'#eee',borderTopWidth:0.5,paddingVertical:12,paddingHorizontal:15}}>
            <View style={{flexDirection:"row",width:'100%',alignItems:"center"}}>
              <View style={{flex:1,height:px(96),paddingHorizontal:px(20),paddingVertical:px(10),borderRadius:3,backgroundColor:"#f7f7f7",borderColor:'#eee',borderWidth:0.5}}>
              <TextInput value={this.state.content} onChangeText = {(content) => this.setState({content})} placeholder="" maxLength={50} multiline={true} underlineColorAndroid="transparent" ref={input => this.input = input} 
              style={{flex:1,textAlignVertical: 'top'}}/>
              </View>
              <TouchableOpacity onPress={()=> {this.imageClick()}} style={[styles.format_btn]}>
                <Feather name='image' size={22} color={'black'}/>
              </TouchableOpacity>
              {(this.state.content == '') &&
              <View style={{width:px(70),alignItems:'center'}}>
                <Text style={{color:Colors.GreyColor,fontSize:px(32),fontWeight:'bold'}}>发送</Text>
              </View>
              } 
              {(this.state.content != '') && 
              <TouchableOpacity onPress={()=>{this.send(this.state.content)}} style={{width:px(70),alignItems:'center'}}>
                <Text style={{color:Colors.TextColor,fontSize:px(32),fontWeight:'bold'}}>发送</Text>
              </TouchableOpacity>
              } 
            </View>
        </Animated.View>

      {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}


      <View style={{display:this.state.uploading?'flex':'none',position:this.state.uploading?'absolute':'relative',zIndex:9999,width:width,height:height,alignItems:'center',justifyContent:"center"}}>
          <View style={{width:px(200),height:px(200),borderRadius:5,backgroundColor:"rgba(0,0,0,0.8)",alignItems:'center',justifyContent:"center"}}>
            <ActivityIndicator  color='white'/>
            <Text style={{marginTop:5,color:'white',fontSize:11}}>{this.state.uploadingText}</Text>
          </View>
      </View>

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
  format_btn:{
      width:45,
      height:45,
      justifyContent:'center',
      alignItems:'center'
  }
})