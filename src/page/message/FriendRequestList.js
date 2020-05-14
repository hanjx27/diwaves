import React, { Component } from 'react';
import {Alert,Modal,Image,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView, TextInput } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import { baseimgurl } from '../../utils/Global';
import {Colors} from '../../constants/iColors';
export default class FriendRequestList extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.state = {
       user:null,
       requests:[],

       handleitem:null,
       handleVisible:false
    }
  }

  componentWillMount() {
  }


  getRequests = async(userid)=> {
    try {
      const result = await Request.post('getFriendRequests',{
        userid:userid
      });
      if(result.code == 1) {
        this.setState({
          requests:result.data
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
      this.getRequests(json.id);
    }
  }

  componentWillUnmount() {
    
  }

  handle = async(item) => {
    this.setState({
      handleitem:item,
      handleVisible:true
    })
  }

  deny = async() => {
    try {
      await Request.post('denyFriendRequest',{
        id:this.state.handleitem.id
      });
      let requests = this.state.requests;
      for(let i = 0;i < requests.length;i++) {
        if(requests[i].id == this.state.handleitem.id) {
          requests[i].state = 1;
          break;
        }
      }
      this.setState({
        requests:requests,
        handleVisible:false,
        handleitem:null
      })
    } catch (error) {
      console.log(error)
    }
  }

  accept = async() => {
    try {
      await Request.post('acceptFriendRequest',{
        id:this.state.handleitem.id,
        userid1:this.state.user.id,
        userid2:this.state.handleitem.userid
      });
      let requests = this.state.requests;
      for(let i = 0;i < requests.length;i++) {
        if(requests[i].id == this.state.handleitem.id) {
          requests[i].state = 2;
          break;
        }
      }
      this.setState({
        requests:requests,
        handleVisible:false,
        handleitem:null
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

      <Header title='好友申请' />
      <FlatList
              style={{ marginTop: 0 }}
              data={this.state.requests}
              renderItem={
                ({ item,index }) => { //增加了index 就失去了purecomponent的效果
                  return(
                    <View style={{alignItems:'center',flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,paddingHorizontal:15,paddingVertical:15,backgroundColor:'white'}}>
                      <TouchableOpacity onPress={()=>{this.props.navigation.navigate('PersonScreen',{personid:item.userid})}}>
                        <Image style={{width:40,height:40,borderRadius:5}} source={{uri:baseimgurl+item.requestavatar}}></Image>
                      </TouchableOpacity>
                      <View style={{marginLeft:15,flex:1,flexDirection:"column"}}>
                        <Text style={{color:'#333',fontSize:15}}>{item.requestusername}</Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{marginTop:7,color:'#666',fontSize:13}}>{item.content}</Text>
                      </View>
                      
                      {item.state == 0 && 
                      <TouchableOpacity onPress={()=>{this.handle(item)}} style={{marginLeft:5,justifyContent:"center",alignItems:"center",height:30,paddingHorizontal:15,backgroundColor:"#1fb922",borderRadius:5}}>
                      <Text style={{color:"white",fontSize:14,fontWeight:'bold'}}>去处理</Text>
                      </TouchableOpacity>
                      }
                      {item.state == 1 && 
                      <Text style={{marginLeft:10,color:"#999",fontSize:14,fontWeight:'bold'}}>已拒绝</Text>
                      }
                      {item.state == 2 && 
                      <Text style={{marginLeft:10,color:"#999",fontSize:14,fontWeight:'bold'}}>已添加</Text>
                      }
                    </View>
                  )
                }
              }
              keyExtractor={(item, index) => index} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
              ItemSeparatorComponent={this._separator}
      />

      {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}

      <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.handleVisible}
          onRequestClose={()=>{this.setState({handleVisible:false})}}
        >
       <TouchableWithoutFeedback onPress={() => {this.setState({handleVisible:false})}}>
          <View style={[this.props.style,{top:0,left:0,backgroundColor:'rgba(0,0,0,0.4)',zIndex:9999,width:width,height:height,alignItems:'center',justifyContent:"center"}]}>
            <View style={{width:width - 80,borderRadius:5,backgroundColor:"white",flexDirection:"column"}}>
            <TouchableWithoutFeedback onPress={()=>{this.addfriendinput.blur()}}>
            <View style={{paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
              <Text style={{marginLeft:5,color:'black',fontSize:15,fontWeight:'bold',textAlign:'center'}}>添加好友验证</Text>
            </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback>
              {this.state.handleitem &&
                <View style={{paddingHorizontal:"5%",paddingTop:15}}>
                  <Text style={{fontWeight:"bold",fontSize:15,color:"black"}}>{this.state.handleitem.requestusername}
                    <Text style={{color:'#999'}}>  发来的验证消息：</Text>
                  </Text>
                  <Text style={{marginTop:15,color:'#666',fontSize:14,lineHeight:20}}>{this.state.handleitem.content}</Text>
                </View>
              }
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback>
            <View style={{width:'100%',flexDirection:"row",paddingHorizontal:"5%",paddingVertical:20}}>

            <TouchableOpacity onPress={this.deny} style={{backgroundColor:"#eee",borderRadius:5,flex:1,paddingVertical:12,alignItems:"center",justifyContent:"center"}}>
                  <Text style={{color:'black',fontSize:14,fontWeight:'bold'}}>拒绝</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.accept} style={{marginLeft:10,backgroundColor:"#1fb922",borderRadius:5,flex:1,paddingVertical:12,alignItems:"center",justifyContent:"center"}}>
                  <Text style={{color:'white',fontSize:14,fontWeight:'bold'}}>接受</Text>
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

const styles = StyleSheet.create({
  reportTab:{
    backgroundColor:"white",
    borderRadius:5,
    marginTop:15,
    paddingBottom:15,
    paddingTop:5
  },
  reportview:{
    marginTop:10,
    flexDirection:'row',
    alignItems:"center",
    paddingHorizontal:15
  },
  reportitle:{
    width:80,
    color:'#666',
    fontSize:13,
    marginRight:20
  },
  reportcontent:{
    flex:1,
    color:'black',
    fontSize:14
  }
})

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
