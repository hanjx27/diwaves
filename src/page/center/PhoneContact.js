import React, { Component } from 'react';
import {Image,PermissionsAndroid,Modal,StatusBar,TextInput,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated, Alert} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
import { baseimgurl, baseurl } from '../../utils/Global';
import { ScrollView } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'
import Contacts from 'react-native-contacts';
import {Colors} from '../../constants/iColors';
export default class PhoneContact extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);
    this.friendsList = props.navigation.getParam('friendsList');
    this.user = null;
    this.addcontact = null;
    this.phone_name = {}
    this.state = {
       phoneusers:[],
       addfriendVisible:false,
       addfriendcontent:''
    }
  }
  

  

  componentWillMount() {

    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        'title': '通讯录',
        'message': 'app需要获取您的通讯录权限',
        'buttonPositive': '确认'
      }
    ).then(() => {
      Contacts.getAllWithoutPhotos((err, contacts) => {
        
        if (err === 'denied'){
          // error
          Alert.alert('获取通讯录失败');
        } else {
          let phones = [];
          let phone_name = {};
          for(let i = 0;i < contacts.length;i++) {
            let name = '';
            if(contacts[i].familyName != null && contacts[i].familyName != contacts[i].givenName) {
              name = contacts[i].familyName + contacts[i].givenName
            } else {
              name = contacts[i].givenName
            }
            console.log(name)
            for(let j = 0;j < contacts[i].phoneNumbers.length;j++) {
              const phone = contacts[i].phoneNumbers[j].number.replace(/-/g,'').replace(/ /g,'').replace(/ /g,'');
              phones.push(phone);
              phone_name[phone] = name;
            }
          }
          this.phone_name = phone_name;
          const newphones = [...new Set(phones)];
          if(newphones.length > 0) {
            this.getUsersByContacts(newphones);
          }
        }
      })
    })
  }

  getUsersByContacts = async(phones) => {
    try {
      const result = await Request.post('getUsersByContacts',{
        contacts:JSON.stringify(phones).replace('[','').replace(']','')
      });
      this.setState({
        phoneusers:result.data
      })
    } catch (error) {
    }
  }

  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.user = json;
    }
  }

  componentWillUnmount() {
    
  }


  addfriend =(item)=> {
    if(!this.user) {
      Alert.alert('您尚未登录')
      return;
    } else {
      this.addcontact = item;
      this.setState({
        addfriendVisible:true
      })
    }
  }

  addfriendRequest = async() => {
    this.addfriendinput.blur();
    try {
      await Request.post('addfriendRequest',{
        userid:this.user.id,
        requestuserid:this.addcontact.id,
        content:this.state.addfriendcontent
      });
      this.setState({
        addfriendVisible:false,
        addfriendcontent:''
      },()=>{
        const toastOpts = {
          data: '请求已发送',
          textColor: '#ffffff',
          backgroundColor: Colors.TextColor,
          duration: 1000, //1.SHORT 2.LONG
          position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
        }
        WToast.show(toastOpts)
      })
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}
      <Header title='手机联系人'/>

      <ScrollView>

      <View style={{flex:1}}>
      {this.state.phoneusers.map(item => {
            if(item.id == this.user.id) {
             return (<View></View>)
            } else {
              let isfriend = false;
              for(let i = 0;i < this.friendsList.length;i++) {
                if(this.friendsList[i].id == item.id) {
                  isfriend = true;
                }
              }
              return (
                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('PersonScreen',{personid:item.id})}} style={{alignItems:'center',flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,paddingHorizontal:15,paddingVertical:10,backgroundColor:'white'}}>
                <Image style={{width:40,height:40,borderRadius:20}} source={{uri:baseimgurl+item.avatar}}></Image>
                <View style={{marginLeft:15,flex:1,flexDirection:"column"}}>
                  <Text style={{color:'#000',fontSize:16}}>{this.phone_name[item.phone]}</Text>
                  <Text style={{color:'#666',fontSize:13,marginTop:5}}>{'昵称：' + item.name}</Text>
                </View>
                {isfriend &&
                  <Text style={{marginLeft:10,color:"#999",fontSize:14,fontWeight:'bold'}}>已添加</Text>
                }
                {!isfriend &&
                <TouchableOpacity onPress={()=>{this.addfriend(item)}} style={{marginLeft:5,justifyContent:"center",alignItems:"center",height:30,paddingHorizontal:15,backgroundColor:"#1fb922",borderRadius:5}}>
                <Text style={{color:"white",fontSize:14,fontWeight:'bold'}}>加好友</Text>
                </TouchableOpacity>
                }
              </TouchableOpacity>
              )
            }
            
      })}
      </View>
      {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}
      </ScrollView>


      <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.addfriendVisible}
        >
       <TouchableWithoutFeedback onPress={() => {this.setState({addfriendVisible:false})}}>
          <View style={[this.props.style,{top:0,left:0,backgroundColor:'rgba(0,0,0,0.4)',zIndex:9999,width:width,height:height,alignItems:'center',justifyContent:"center"}]}>
            <View style={{width:width - 80,borderRadius:5,backgroundColor:"white",flexDirection:"column"}}>
            <TouchableWithoutFeedback onPress={()=>{this.addfriendinput.blur()}}>
            <View style={{paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
              <Text style={{marginLeft:5,color:'black',fontSize:15,fontWeight:'bold',textAlign:'center'}}>申请添加好友</Text>
            </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={()=>{this.addfriendinput.blur()}}>
            <View style={{paddingTop:20,width:'100%',paddingHorizontal:"5%",alignItems:"center",flexDirection:"row",justifyContent:"center"}}>
              <View style={{flex:1,height:px(130),paddingHorizontal:px(20),paddingVertical:px(10),borderRadius:5,backgroundColor:"#f7f7f7",}}>
                <TextInput value={this.state.addfriendcontent} onChangeText = {(addfriendcontent) => this.setState({addfriendcontent})} placeholder="" maxLength={50} multiline={true} underlineColorAndroid="transparent" ref={addfriendinput => this.addfriendinput = addfriendinput} 
                style={{flex:1,textAlignVertical: 'top'}}/>
              </View>
          </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={()=>{this.addfriendinput.blur()}}>
          <View style={{width:'100%',paddingHorizontal:"5%",paddingVertical:20}}>
          <TouchableOpacity onPress={this.addfriendRequest} style={{backgroundColor:"#1fb922",borderRadius:5,width:'100%',paddingVertical:12,alignItems:"center",justifyContent:"center"}}>
                <Text style={{color:'white',fontSize:14,fontWeight:"bold"}}>发送请求</Text>
          </TouchableOpacity>
          </View>
          </TouchableWithoutFeedback>

            </View>
          </View>
        </TouchableWithoutFeedback>
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
