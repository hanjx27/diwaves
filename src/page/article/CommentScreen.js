import React, { Component } from 'react';
import {Alert,TextInput,Image,FlatList,StatusBar,NativeModules,View,StyleSheet,Platform,Text,Keyboard,Dimensions,TouchableOpacity,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
import {Colors} from '../../constants/iColors';
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import AutoSizeImage from '../../components/AutoSizeImage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView } from 'react-native-gesture-handler';
import Datetime from '../../components/Datetime';
const { StatusBarManager } = NativeModules;
import ReplyinComment from '../../components/ReplyinComment';
import FocusBtn from '../../components/FocusBtn';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import { baseimgurl } from '../../utils/Global';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default class CommentScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);
    this.article = props.navigation.getParam('article');
    this.comment = props.navigation.getParam('comment');

    this.myUpedreplys = {};
    this.state = {
      keyboardHeight:new Animated.Value(0),
      replyTo:null,
      replyList:[],
      user:null,
      commentuped:props.navigation.getParam('commentuped'),
      replycontent:''
    }
  }
  

  

  componentWillMount() {
    this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow);
    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);
  }

  componentDidMount = async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json},()=> {
        this.getUped();
      })
    }  else {
    }
    
  }

  getUped = async() => {
    const myUpedreplysstr = await AsyncStorage.getItem('myUpedreplys_' + this.state.user.id);
    if(myUpedreplysstr != null) {
      this.myUpedreplys = JSON.parse(myUpedreplysstr);
      this.getReplys();
    }
  }

  getReplys = async()=>{
    try {
      const result = await Request.post('replys',{
        commentid:this.comment.id
      });
      
      if(result.code == 1) {
         this.setState({
          replyList:result.data
         })
      }
    } catch (error) {
      
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
  
  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();

      if(this.props.navigation.state.params.updateReplyCountAndUp) {
        this.props.navigation.state.params.updateReplyCountAndUp(this.state.replyList.length,this.state.commentuped);
      }
  }

  addcommentUp = async(type,objid) => {
    if(this.state.user == null) {
      Alert.alert('请先登录') //需要做统一处理
      return;
    }

    try {
      const result = await Request.post('addUp',{
        userid:this.state.user.id,
        type:type,
        objid:objid,
        parentid:this.article.id
      });
      this.setState({
        commentuped:true
      })
    } catch (error) {
      
    }
  }

  delcommentUp = async(type,objid) => {
    if(this.state.user == null) {
      Alert.alert('请先登录') //需要做统一处理
      return;
    }

    try {
      const result = await Request.post('delUp',{
        userid:this.state.user.id,
        type:type,
        objid:objid
      });
      this.setState({
        commentuped:false
      })
    } catch (error) {
      
    }

  }

  addReply= async() => {
    if(this.state.user == null) {
      Alert.alert('请先登录')
      return;
    }
    try {
      const result = await Request.post('addReply',{
        userid:this.state.user.id,
        content:this.state.replycontent, 
        commentid:this.comment.id, 
        replyid:this.state.replyTo == null ? -1 : this.state.replyTo.id,
        replytouserid:this.state.replyTo == null ? -1 : this.state.replyTo.userid,
        replyusername:this.state.replyTo == null ? '' : this.state.replyTo.username,
        replycontent:this.state.replyTo == null ? '' : this.state.replyTo.content,
      });
      if(result.code != -1) {
        let replyList = this.state.replyList
        let reply = result.data

        reply.content = this.state.replycontent;
        reply.userid = this.state.user.id;
        reply.up = 0;
        reply.commentid = this.comment.id;
        reply.username = this.state.user.name
        reply.avatarUrl = this.state.user.avatar
        reply.replyid = this.state.replyTo == null ? -1 : this.state.replyTo.id
        reply.replytouserid = this.state.replyTo == null ? -1 : this.state.replyTo.userid
        reply.replyusername = this.state.replyTo == null ? '' : this.state.replyTo.username
        reply.replycontent = this.state.replyTo == null ? '' : this.state.replyTo.content
        replyList.unshift(reply)

        this.replyinput.blur()
        this.setState({
          replycontent:'',
          replyList:replyList,
          writefocus:false
        })
      }
    } catch (error) {
      
    }
  }
  replyPress = async(replyTo) => {
    //console.log(replyTo)
    this.setState({replyTo:replyTo,writefocus:true},()=> {this.replyinput.focus()})
  }

  onDelReply = (replyid) => {
    let replyList = this.state.replyList;
    for(let i = 0;i < replyList.length;i++) {
      if(replyList[i].id == replyid) {
        replyList.splice(i,1);
        break;
      }
    }
    this.setState({
      replyList:replyList
    })
  }

  goPerson = () => {
    if(this.comment.userid == 1|| this.comment.username == 'admin') {
      return;
    }
    this.props.navigation.navigate('PersonScreen',{personid:this.comment.userid})
  }
  render() {
    let up = require('../../images/article/up1.png')
    let uped = require('../../images/article/up2.png')

    let write = require('../../images/article/write.png')
    let zhuanfa = require('../../images/article/u1462.png')
    let reward = require('../../images/article/u1463.png')
    let add = require('../../images/article/add.png')
    let deletepng = require('../../images/article/delete.png')
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title={this.state.replyList.length + '条回复'} isLeftTitle={false} />
      <ScrollView style={{flex:1}}>
        <View>
        <View style={{paddingHorizontal:15,flexDirection:'row',backgroundColor:'white',marginTop:10,borderBottomColor:'#f1f1f1',borderBottomWidth:0.5}}>
        <TouchableOpacity onPress={this.goPerson} >
          <Image style={{width:38,height:38,borderRadius:5,marginRight:10}} source={{uri:(baseimgurl + this.comment.avatarUrl)}}></Image>
        </TouchableOpacity>
        <View style={{flex:1,flexDirection:'column',marginBottom:15}}>
        <TouchableOpacity onPress={this.goPerson} style={{display:'flex',flexDirection:'row',alignItems:"center"}}>
          <View style={{flex:1}}>
            <Text style={{fontSize:14,fontWeight:"bold",color:Colors.TextColor}}>{this.comment.username}</Text>
          </View>
          {(this.state.user == null || this.state.user.id != this.comment.userid) &&
              <FocusBtn focususerid={this.article.userid}></FocusBtn>
          }
        </TouchableOpacity>
        <Text style={{marginTop:10,lineHeight:18,color:'black'}}>{this.comment.content}</Text>
        {this.comment.pic != null && this.comment.pic != '' &&
        <AutoSizeImage style={{marginTop:10}} maxWidth={width*0.5} source={{uri:baseimgurl + this.comment.pic}}></AutoSizeImage>
        }
        <View style={{flexDirection:'row',marginTop:10,alignItems:"center",justifyContent:'space-between'}}>
        <Datetime style={{fontSize:12,color:Colors.GreyColor}} datetime={this.comment.createdatetime}></Datetime>
        </View>
        </View>
        </View>

        <View style={{paddingHorizontal:15,marginTop:15}}>
          <Text>全部回复</Text>
          <FlatList
              style={{ marginTop: 0 }}
              data={this.state.replyList}
              renderItem={
                ({ item }) => {
                  return(
                    <ReplyinComment onDelReply={this.onDelReply} reply={item} myUpedreplys={this.myUpedreplys} user={this.state.user} comment={this.comment} article={this.article} onReplyPress={this.replyPress}></ReplyinComment>
                  )
                }
              }
              keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
              ItemSeparatorComponent={this._separator}
            />
        </View>
        </View>
      </ScrollView>

      
      <View style={{display:this.state.writefocus?'none':'flex',width:width,height:px(96),flexDirection:'row',borderTopColor:"#eee",borderTopWidth:0.5,alignItems:'center',paddingHorizontal:15,justifyContent:'space-between'}}>
        <TouchableWithoutFeedback onPress={()=>{this.setState({writefocus:true},()=> {this.replyinput.focus()})}}>
        <View style={{paddingLeft:30,flex:1,height:px(72),backgroundColor:'#f7f7f7',borderRadius:5,marginRight:20,borderColor:'#eee',borderWidth:0.5,justifyContent:"center"}}>
          <Text style={{color:'#222',fontWeight:'normal'}}>写回复...</Text>
        </View>
        </TouchableWithoutFeedback>
      <View style={{flexDirection:'row',paddingRight:10,alignItems:'center'}}>
        {!this.state.commentuped &&
        <TouchableOpacity onPress={()=>this.addcommentUp(2,this.comment.id)} style={{alignItems:'center'}}>
          <MaterialCommunityIcons name='thumb-up-outline' size={26} color={'black'}/>
        </TouchableOpacity>
        }
        {this.state.commentuped &&
        <TouchableOpacity onPress={()=>this.delcommentUp(2,this.comment.id)} style={{alignItems:'center'}}>
           <MaterialCommunityIcons name='thumb-up' size={26} color={Colors.TextColor}/>
        </TouchableOpacity>
        }
      </View>
      
      <Image source={write} resizeMode='stretch' style={{top:11,left:20,position:'absolute',width:22,height:22}}></Image>
      </View>
  
        <TouchableWithoutFeedback onPress={()=> {this.replyinput.blur(),this.setState({writefocus:false,replyTo:null})}}>
        <View style={{display:this.state.writefocus?'flex':'none',position:this.state.writefocus?'absolute':'relative',backgroundColor:'rgba(0,0,0,0)',zIndex:99,width:width,height:height}}>
        </View>
        </TouchableWithoutFeedback>
        <Animated.View
        style={{zIndex:100,display:this.state.writefocus?'flex':'none',marginBottom:this.state.keyboardHeight,flexDirection:'column',
        backgroundColor:'white',borderTopColor:'#eee',borderTopWidth:0.5,paddingVertical:12,paddingHorizontal:15}}>
            <View style={{flexDirection:"row",width:'100%',alignItems:"center"}}>
              <View style={{flex:1,height:px(140),paddingHorizontal:px(20),paddingVertical:px(10),borderRadius:3,backgroundColor:"#f7f7f7",borderColor:'#eee',borderWidth:0.5}}>
              <TextInput value={this.state.replycontent} onChangeText = {(replycontent) => this.setState({replycontent})} 
              placeholder={"回复 " + (this.state.replyTo?this.state.replyTo.username:this.comment.username) + ":"} 
              maxLength={50} multiline={true} underlineColorAndroid="transparent" ref={replyinput => this.replyinput = replyinput} 
              style={{flex:1,textAlignVertical: 'top'}}/>
              </View>

              {this.state.replycontent == '' && 
              <View style={{marginLeft:10,width:px(70),alignItems:'center'}}>
                <Text style={{color:Colors.TextColor,fontSize:px(32),fontWeight:'bold'}}>发布</Text>
              </View>
              }
               {this.state.replycontent != '' && 
              <TouchableOpacity onPress={()=>this.addReply()} style={{marginLeft:10,width:px(70),alignItems:'center'}}>
                <Text style={{color:'#1187fb',fontSize:px(32),fontWeight:'bold'}}>发布</Text>
              </TouchableOpacity>
              }
            </View>
            
        </Animated.View>
        
      
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
