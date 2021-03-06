import React from 'react';
import {px, isIphoneX} from '../utils/px';
import {
  DeviceEventEmitter,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
  Alert
} from 'react-native';
import { baseimgurl } from '../utils/Global';
import { Request } from "../utils/request";
import Datetime from '../components/Datetime';
import {Colors} from '../constants/iColors';
const {width,height} =  Dimensions.get('window');

import { withNavigation } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
class ReplyinComment extends React.PureComponent {
  constructor(props) {
    super(props);
    this.myUpedreplys = this.props.myUpedreplys
    this.state= {
      up:this.props.reply.up,
      uped:this.myUpedreplys[this.props.reply.id] == 1?true:false
    }
  }
  static defaultProps = {
    
  }
  
  componentDidMount() {
    
  }
  componentWillUnmount() {
    
  } 

  addUp = async() => {
    if(this.props.user == null) {
      Alert.alert('请先登录') //需要做统一处理
      return;
    }

    try {
      const result = await Request.post('addUp',{
        userid:this.props.user.id,
        username:this.props.user.name,
        type:3,
        objid:this.props.reply.id,
        parentid:this.props.comment.id,
        commentcontent:this.props.reply.replycontent,
        commentuserid:this.props.reply.userid
      });
      if(result.code == -2) {
        Alert.alert('您已被封禁')
        return;
      }
      this.myUpedreplys[this.props.reply.id] = 1
      AsyncStorage.setItem('myUpedreplys_' + this.props.user.id, JSON.stringify(this.myUpedreplys), function (error) {})

      this.setState({
        up:this.state.up + 1,
        uped:true
      })
    } catch (error) {
      
    }
  }

  delUp = async() => {
    try {
      const result = await Request.post('delUp',{
        userid:this.props.user.id,
        username:this.props.user.name,
        type:3,
        objid:this.props.reply.id,
        commentcontent:this.props.reply.replycontent,
        commentuserid:this.props.reply.userid
      });
      if(result.code == -2) {
        Alert.alert('您已被封禁')
        return;
      }
      this.myUpedreplys[this.props.reply.id] = -1
      AsyncStorage.setItem('myUpedreplys_' + this.props.user.id, JSON.stringify(this.myUpedreplys), function (error) {})

      this.setState({
        up:this.state.up - 1,
        uped:false
      })
    } catch (error) {
      
    }
  }

  deleteReplyConfirm = async() => {
    this.props.onDelReply(this.props.reply.id);
    try {
      const result = await Request.post('deleteReply',{
        replyid:this.props.reply.id,
        commentid:this.props.comment.id
      });
    } catch (error) {
      
    }
  }

  deleteReply = async() => {
    Alert.alert(
      '确认删除此回复？',
      '',
      [
        {text: '确定', onPress: () => {this.deleteReplyConfirm()}},
        {text: '取消', onPress: () => {}}
      ],
      { cancelable: true }
      )
  }
 
  goPerson = () => {
    if(this.props.reply.userid == 1 || this.props.reply.username == 'admin') {
      return;
    }
    this.props.navigation.navigate('PersonScreen',{personid:this.props.reply.userid})
  }

  report = () => {
    !!this.props.report && this.props.report(this.props.reply.id,this.props.reply.content,this.props.reply.userid)
  }

  render() {
    let more = require('../images/more.png');
    console.log('render reply')
    let up = require('../images/article/up1.png')
    let uped = require('../images/article/up2.png')
    return (
      <View style={{flexDirection:'row',paddingVertical:5,backgroundColor:'white',marginTop:5}}>
        <TouchableOpacity onPress={this.goPerson}>
          <Image style={{width:38,height:38,borderRadius:19,marginRight:10}} source={{uri:baseimgurl+this.props.reply.avatarUrl}}></Image>
        </TouchableOpacity>
        <View style={{flex:1,flexDirection:'column'}}>
        <View style={{display:'flex',flexDirection:'row',alignItems:"center"}}>
          <Text style={{flex:1,fontSize:14,color:Colors.TextColor}}>{this.props.reply.username}</Text>
          {this.state.uped &&
          <TouchableOpacity onPress={()=>{this.delUp()}} style={{width:50,height:40,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
            <MaterialCommunityIcons name='thumb-up' size={19} color={Colors.TextColor}/>
            <Text style={{fontSize:13,marginLeft:3,marginTop:2}}>{this.state.up }</Text>
          </TouchableOpacity>
          }
          {!this.state.uped &&
            <TouchableOpacity onPress={()=>{this.addUp()}} style={{width:50,height:40,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
            <MaterialCommunityIcons name='thumb-up-outline' size={19} color={'black'}/>
            {this.state.up == 0 &&
            <Text style={{fontSize:13,marginLeft:3,marginTop:2}}>赞</Text>
            }
            {this.state.up > 0 &&
            <Text style={{fontSize:13,marginLeft:3,marginTop:2}}>{this.state.up }</Text>
            }
            </TouchableOpacity>
          }

        </View>
        <Text style={{marginTop:10,lineHeight:18,color:'black'}}>{this.props.reply.content}
        {this.props.reply.replyid > -1 &&
          <Text>
            <Text style={{}}> //</Text>
            <Text style={{color:Colors.TextColor}}>{"@" + this.props.reply.replyusername}</Text>
            <Text style={{}}>{"：" + this.props.reply.replycontent}</Text>
          </Text>
        }
        </Text>
        <View style={{height:40,flexDirection:'row',marginTop:0,alignItems:'center',justifyContent:'space-between'}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Datetime style={{fontSize:13,color:Colors.GreyColor}} datetime={this.props.reply.createdatetime}></Datetime>
            <TouchableOpacity onPress={() => {this.props.onReplyPress(this.props.reply)}}><Text style={{fontSize:13,color:'#222'}}>  回复</Text></TouchableOpacity>
          </View>
          {!!this.props.user && (this.props.article.userid == this.props.user.id || this.props.comment.userid == this.props.user.id || this.props.reply.userid == this.props.user.id) &&
          <TouchableOpacity style={{paddingVertical:3,paddingHorizontal:3}} onPress={()=>this.deleteReply()}>
            <Text style={{fontSize:12,color:'#222'}}>删除</Text>
          </TouchableOpacity>
          }
          {(this.props.user == null || (this.props.article.userid != this.props.user.id && this.props.comment.userid != this.props.user.id && this.props.reply.userid != this.props.user.id)) && this.props.report &&
          <TouchableOpacity onPress={this.report} style={{width:40,height:40,alignItems:'flex-end',justifyContent:'center'}}>
          <View style={{alignItems:'center',justifyContent:'center',width:20,paddingVertical:px(3),borderRadius:3,backgroundColor:'#f3f3f3'}}>
         <AntDesign name='close' size={9} color={'#888'}/>
         </View>
        </TouchableOpacity>
          }
        </View>
      </View>
      </View>
    )
  }
}

export default withNavigation(ReplyinComment);
