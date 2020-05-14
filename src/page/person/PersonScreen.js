import React, { Component } from 'react';
import {TextInput,Alert,Image,Modal,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
const { StatusBarManager } = NativeModules;

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

import Icon from 'react-native-vector-icons/Ionicons'
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import { baseimgurl, baseurl } from '../../utils/Global';
import {Colors} from '../../constants/iColors';
import FocusBtn from '../../components/FocusBtn';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
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
      status:null,
      friendList:[],
      isfriend:0, // 0  页面刚进来，不显示加好友和私信按钮 1代表是好友，显示私信按钮   -1 不是好友 显示加好友和私信按钮

      addfriendVisible:false,
      addfriendcontent:''
    }
  }
  

  

  componentWillMount = async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
      this.checkIsFriend(json.id,this.personid)
      /*const friendList = await AsyncStorage.getItem('friendList_' + json.id);
      if(friendList != null && friendList != '') {
      const friendlistjson = JSON.parse(friendList);
      this.setState({friendList:friendlistjson})
      for(let i = 0;i < friendlistjson.length;i++) {
        if(friendlistjson[i] == this.personid) {
          this.setState({isfriend:true})
        }
      }*/
    }
  }

  checkIsFriend = async(userid,frienduserid)=> {
    try {
      const result = await Request.post('checkIsFriend',{
        userid:userid,
        frienduserid:frienduserid
      });
      if(result.code == 1) {
        this.setState({
          isfriend:1
        })
      } else if(result.code == 0) {
        this.setState({
          isfriend:-1
        })
      }
    } catch (error) {
      console.log(error)
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
    //this.getPersonStatus(this.personid)
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
    } else if(this.state.isfriend == -1) {
      Alert.alert('您还不是好友,不能发送私信');
      return;
    } else if(this.state.isfriend == 1){
      this.props.navigation.navigate('MessageDetail',{person:this.state.person})
    }
  
  }

  addFriend = ()=> {
    if(!this.state.user) {
      Alert.alert('您尚未登录')
      return;
    } else {
      this.setState({
        addfriendVisible:true
      })
    }
  }

  delFriend = ()=> {
    if(!this.state.user) {
      Alert.alert('您尚未登录')
      return;
    } else {
      Alert.alert('删除好友', '确认要删除此好友吗？',
        [
            {
                text: "是", onPress: async() => {
                  try {
                    await Request.post('delfriend',{
                      userid1:this.state.user.id,
                      userid2:this.personid
                    });
                    this.setState({
                      isfriend:-1
                    })
                  } catch (error) {
                    console.log(error)
                  }
                }
            },
            {text: "否"}
        ])
    }
  }

  goback = () => {
     if(this.center) {
       this.props.navigation.navigate('Center');
      } else {
        this.props.navigation.goBack()
     }
  }

  addfriendRequest = async() => {
    this.addfriendinput.blur();
    try {
      await Request.post('addfriendRequest',{
        userid:this.state.user.id,
        requestuserid:this.state.person.id,
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
      <Entypo
        name='chevron-thin-left'
        size={23}
        color={'black'}
      />
    </TouchableOpacity>

    let forbidtext = '';
    if(this.state.person) {
      if(this.state.person.expire_ttl == -1) {
        forbidtext = '! 由于发布违规内容，该用户已被永久封禁';
      } else if(this.state.person.expire_ttl > 0) {
        forbidtext = '! 由于发布违规内容，该用户已被封禁';
      }
    } 
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
      
        
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header leftBtn={leftBtn} title={this.state.personname}/>
        
        <View style={{width:width,backgroundColor:'#2ba4da'}}>
          <View style={{marginTop:20,height:24,paddingRight:10,width:width,flexDirection:'row',justifyContent:'flex-end'}}>
             
          </View>
          
          <View style={{backgroundColor:'white',paddingTop:15,paddingHorizontal:20,marginTop:10,width:width,borderTopLeftRadius:14,borderTopRightRadius:14}}>
          
          <View style={{width:width - 40,height:30,flexDirection:'row',justifyContent:'flex-end'}}>
          {(this.state.user == null || (this.state.isfriend == -1 && this.state.user.id != this.personid)) &&
            <TouchableOpacity onPress={this.addFriend} style={{height:30,borderRadius:5,paddingVertical:5,width:70,alignItems:'center',justifyContent:"center",borderColor:'#e1e1e1',borderWidth:0.5,marginRight:10}}>
              <Text style={{color:'#333'}}>加好友</Text>
            </TouchableOpacity>
          }
          {(this.state.user != null && this.state.isfriend == 1) &&
            <TouchableOpacity onPress={this.delFriend} style={{height:30,borderRadius:5,paddingVertical:5,width:70,alignItems:'center',justifyContent:"center",borderColor:'#e1e1e1',borderWidth:0.5,marginRight:10}}>
              <Text style={{color:'#333',fontSize:13}}>删除好友</Text>
            </TouchableOpacity>
          }
          
          {(this.state.user == null || this.personid != this.state.user.id) &&
            <TouchableOpacity onPress={this.sendMsg} style={{borderRadius:5,height:30,paddingVertical:5,width:70,alignItems:'center',justifyContent:"center",borderColor:'#e1e1e1',borderWidth:0.5,marginRight:10}}>
              <Text style={{color:'#333'}}>私信</Text>
            </TouchableOpacity>
          }

          {(this.state.user == null || this.personid != this.state.user.id) &&
            <FocusBtn /*focusChange={this.focusChange}*/ focususerid={this.personid}></FocusBtn>
          }
          </View>
          
          </View>

          {this.state.person && !!this.state.person.avatar &&
          <View style={{position:'absolute',overflow:'hidden',top:24,left:20,borderWidth:2,borderColor:'white',borderRadius:70,width:70,height:70}}>  
            <Image resizeMode='cover' source={{uri:baseimgurl + this.state.person.avatar}} style={{width:66,height:66}}></Image>
          </View> 
          }
          {this.state.person && !this.state.person.avatar &&
          <View style={{alignItems:"center",justifyContent:'center',position:'absolute',overflow:'hidden',top:24,left:20,borderWidth:2,borderColor:'white',borderRadius:70,width:70,height:70,backgroundColor:"#eee"}}> 
            <AntDesign name='user' size={40} color={'#999'}/>
          </View>
          }
          {this.state.person && this.state.person.gender!='' &&
          <View style={{position:'absolute',top:70,left:62,borderWidth:2,borderColor:'white',borderRadius:26,width:26,height:26}}>
            <Image resizeMode='stretch' source={this.state.person.gender == '男' ? male:female} style={{borderRadius:11,width:22,height:22}}></Image>
          </View>
          }

        </View>
          
        {this.state.person && 
        <View style={{marginLeft:20,marginTop:10}}>
            <Text style={styles.greytext}>{'数字号：' + this.state.person.wxname}</Text>
        </View>
        }

        {this.state.person && 
        <View style={{paddingHorizontal:20,marginTop:10,flexDirection:'row',alignItems:'center',height:30,justifyContent:'space-between'}}>
              <View style={{height:30,flexDirection:'row',alignItems:'center',}}>
                <Text style={styles.greytext}>{'位置 : ' + (!!this.state.person.province?(this.state.person.province + "  " + this.state.person.city):'暂无')}</Text>
              </View>
        </View>
        }
        {this.state.person && this.state.person.expire_ttl >= -1 &&
              <View style={{paddingLeft:20,flexDirection:'row'}}>
                <TouchableOpacity style={{marginTop:10,paddingHorizontal:10,borderRadius:3,backgroundColor:'#fd676a',alignItems:'center',paddingVertical:5}}>
                  <Text style={{color:'white',fontSize:11,fontWeight:'bold'}}>{forbidtext}</Text>
                </TouchableOpacity>
              </View>
        }

        
        <View style={{marginTop:10,backgroundColor:'white',borderRadius:3,paddingLeft:20}}>
        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('PersonArticlesScreen',{user:this.state.person,isfriend:this.state.isfriend})}} style={{alignItems:'center',flexDirection:'row'}}>
          <Image style={{width:22,height:22}} source={article}></Image>
          <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontSize:15}}>帖子</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('PersonCommentsScreen',{user:this.state.person})}} style={{alignItems:'center',flexDirection:'row'}}>
          <Image style={{width:22,height:22}} source={predict}></Image>
          <View style={{marginLeft:10,flex:1,height:44,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
              <Text style={{fontSize:15}}>评论</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
          </View>
        </TouchableOpacity>
        
        </View>
  
      {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}


      <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.addfriendVisible}
          onRequestClose={()=>{this.setState({addfriendVisible:false})}}
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
