import React, { Component } from 'react';
import {Modal,TouchableWithoutFeedback,FlatList,NativeModules,StatusBar,Image,Dimensions,DeviceEventEmitter,TouchableOpacity,View,StyleSheet,Platform,Text, ListView} from 'react-native';
const {width,height} =  Dimensions.get('window');
import {Colors} from '../../constants/iColors';

const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import {px, isIphoneX} from '../../utils/px';

import Message from '../../components/Message';
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
export default class MessageScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };

  constructor(props) {
    super(props);
    this.flag = false;
    this.state = {
     user:null,
     messageList:[]
    }
  }

  componentWillMount = async() => {
    //AsyncStorage.removeItem('messageList_'+3);
  }

  getUserData = async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      if(!this.state.user) {
        this.setState({user:json})
      }
      const messageListstr = await AsyncStorage.getItem('messageList_' + json.id);
      
      if(messageListstr != null && messageListstr != '') {
        const messagelist = JSON.parse(messageListstr);
        this.setState({messageList:messagelist},()=> {
          this.getMessage(json);
        })
      } else {
        this.getMessage(json);
      }
    } else {
      this.setState({user:null,messageList:[]})
    }
  }

  getMessage = async(user) => { //获取别人发给我的消息
    if(this.flag) {
      return;
    }
    this.flag = true;
    try {
      const result = await Request.post('getMessage',{
        userid:user.id,
      });
      if(result.code == 1) {
        if(result.data.length >  0) {
          let messageList = this.state.messageList;
          for(let i = 0;i < result.data.length;i++) {
            if(result.data[i].type == 3) {//举报消息
              const message = result.data[i]
              ///messagelist update
              let j = 0;
              for(;j < messageList.length;j++) {
                if(messageList[j].touserid == 'report') {
                  let messagebody = messageList[j];
                  messagebody.userread = 0; // 未读
                  messagebody.messages.unshift(message)
                  if(j != 0) {
                    messageList.splice(j,1);
                    messageList.unshift(messagebody);
                   }
                  break;
                }
              }
              if(j == messageList.length) {
                let messagebody = {
                  userread :0,
                  type:3,
                  touserid:'report',
                  username:'举报处理',
                  messages:[message]
                }
                messageList.unshift(messagebody);
              }
            } else if(result.data[i].type == 4) { //添加好友消息
              const message = result.data[i]
              let j = 0;
              for(;j < messageList.length;j++) {
                if(messageList[j].touserid == 'addfriend') {
                  let messagebody = messageList[j];
                  messagebody.userread = 0; // 未读
                  if(j != 0) {
                    messageList.splice(j,1);
                    messageList.unshift(messagebody);
                   }
                  break;
                }
              }
              if(j == messageList.length) {
                let messagebody = {
                  userread :0,
                  type:4,
                  touserid:'addfriend',
                  username:'好友申请',
                  messages:[message]
                }
                messageList.unshift(messagebody);
              }
            } else if(result.data[i].type == 1) {//站内信
              const message = {
                id:result.data[i].id,
                touserid:user.id,
                content:result.data[i].content,
                createdatetime:result.data[i].createdatetime
              }
              ///messagelist update
              let j = 0;
              for(;j < messageList.length;j++) {
                if(messageList[j].touserid == result.data[i].userid) {
                  let messagebody = messageList[j];
                  messagebody.username = result.data[i].username;
                  messagebody.avatar = result.data[i].avatarUrl;
                  messagebody.userread = 0; // 未读
                  messagebody.messages.push(message)
                  if(j != 0) {
                    messageList.splice(j,1);
                    messageList.unshift(messagebody);
                   }
                  break;
                }
              }
              if(j == messageList.length) {
                let messagebody = {
                  userread :0,
                  type:1,
                  touserid:result.data[i].userid,
                  username:result.data[i].username,
                  avatar:result.data[i].avatarUrl,
                  messages:[message]
                }
                messageList.unshift(messagebody);
              }
              ///end update
            }
          }

          
          AsyncStorage.setItem('messageList_' + user.id, JSON.stringify(messageList), function (error) {})
          this.setState({
            messageList:messageList
          })
        }
      }
      
      this.flag = false;
    } catch (error) {
      console.log(error)
      this.flag = false;
    }
  }

  componentDidMount = () => {
    this._navListener = this.props.navigation.addListener("didFocus", () => {
        this.getUserData();
    });
  }

  componentWillUnmount() {
    this._navListener.remove();
  }

  goDetail = async(item,index) => {
    this.state.messageList[index].userread = 1;
    let that = this;
    if(item.type == 1) {
      that.props.navigation.navigate('MessageDetail',{message:item})
    } else if(item.type == 2) {

    } else if(item.type == 3) {
      that.props.navigation.navigate('ReportList')
    } else if(item.type == 4) {
      let messageList = this.state.messageList;
      messageList[index].userread = 1;
      await AsyncStorage.setItem('messageList_' + this.state.user.id, JSON.stringify(messageList));
      that.props.navigation.navigate('FriendRequestList')
    }
    
  }
  
  allread = async() => {
    let messageList = this.state.messageList;
    for(let i = 0;i < messageList.length;i++) {
      messageList[i].userread = 1;
    }
    this.setState({
      messageList:messageList
    })
    AsyncStorage.setItem('messageList_' + this.state.user.id, JSON.stringify(messageList), function (error) {})

  }

  loginClick = async() => {
    /*await this.getUserInfo(3);
    const messageListstr = await AsyncStorage.getItem('messageList_' + this.state.user.id);
    if(messageListstr != null && messageListstr != '') {
      const messagelist = JSON.parse(messageListstr);
      this.setState({messageList:messagelist},()=> {
        this.getMessage(this.state.user);
      })
    } else {
      this.getMessage(this.state.user);
    }

    DeviceEventEmitter.emit('login', this.state.user);*/
    this.props.navigation.navigate('login');
  }

  getUserInfo = async(id) => {
    try {
      const result = await Request.post('getUserInfo',{
        id:id
      });
      const user = result.data;
      this.setState({user:user})
      await AsyncStorage.setItem('user', JSON.stringify(user), function (error) {})
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    let arrow = require('../../images/center/arrow.png');
    let nologin = require('../../images/nologin.png');
    return (

      <View style={{flex: 1,flexDirection:'column',backgroundColor: '#f7f7f7'}}>
        
        
        {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
        {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

        <View style={{position:'relative',height:40,alignItems:'center',backgroundColor:'white',justifyContent:'center',borderBottomColor:'#eee',borderBottomWidth:0.5}}>
          <Text style={{fontSize:17,color:'black',fontWeight:'bold'}}>消息</Text>
          {!!this.state.user &&
          <TouchableOpacity onPress={this.allread} style={{position:'absolute',right:15}}><Text style={{color:Colors.TextColor}}>全部已读</Text></TouchableOpacity>
          }
        </View>

        {!this.state.user &&
          <View style={{paddingBottom:50,flex:1,justifyContent:'center',alignItems:'center'}}>
            <Image source={nologin} resizeMode="stretch" style={{width:200,height:200}}></Image>
            <Text style={{color:'#999'}}>登录后可查看"消息"页面</Text>
            <TouchableOpacity onPress={this.loginClick} style={{width:100,borderRadius:5,height:30,marginTop:30,borderWidth:1,borderColor:Colors.TextColor,borderWidth:1,alignItems:'center',justifyContent:'center'}}>
                  <Text style={{color:Colors.TextColor,fontSize:14}}>登录</Text>
            </TouchableOpacity>
          </View>
        }
        {this.state.user &&
        <FlatList
              style={{ marginTop: 0 }}
              data={this.state.messageList}
              renderItem={
                ({ item,index }) => { //增加了index 就失去了purecomponent的效果
                  return(
                    <Message message={item} onPress={()=>{this.goDetail(item,index)}}></Message>
                  )
                }
              }
              keyExtractor={(item, index) => index} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
              ItemSeparatorComponent={this._separator}
            />
        }

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
})
const styles = StyleSheet.create({
});