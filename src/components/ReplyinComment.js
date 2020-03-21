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
        type:3,
        objid:this.props.reply.id,
        parentid:this.props.comment.id
      });

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
        type:3,
        objid:this.props.reply.id
      });

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

  render() {
    console.log('render reply')
    let up = require('../images/article/up1.png')
    let uped = require('../images/article/up2.png')
    return (
      <View style={{flexDirection:'row',paddingVertical:15,backgroundColor:'white',marginTop:5,borderBottomColor:'#f1f1f1',borderBottomWidth:0.5}}>
        <TouchableOpacity onPress={this.goPerson}>
          <Image style={{width:38,height:38,borderRadius:5,marginRight:10}} source={{uri:baseimgurl+this.props.reply.avatarUrl}}></Image>
        </TouchableOpacity>
        <View style={{flex:1,flexDirection:'column'}}>
        <View style={{display:'flex',flexDirection:'row',alignItems:"center"}}>
          <TouchableOpacity onPress={this.goPerson} style={{flex:1}}>
            <Text style={{fontSize:14,fontWeight:"bold",color:Colors.TextColor}}>{this.props.reply.username}</Text>
          </TouchableOpacity>

          {this.state.uped &&
          <TouchableOpacity onPress={()=>{this.delUp()}} style={{flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
            <MaterialCommunityIcons name='thumb-up' size={19} color={Colors.TextColor}/>
            <Text style={{fontSize:13,marginLeft:3,marginTop:2}}>{this.state.up }</Text>
          </TouchableOpacity>
          }
          {!this.state.uped &&
            <TouchableOpacity onPress={()=>{this.addUp()}} style={{flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
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
        <Text style={{marginTop:10,lineHeight:18}}>{this.props.reply.content}
        {this.props.reply.replyid > -1 &&
          <Text>
            <Text style={{}}> //</Text>
            <Text style={{color:Colors.TextColor}}>{"@" + this.props.reply.replyusername}</Text>
            <Text style={{}}>{"：" + this.props.reply.replycontent}</Text>
          </Text>
        }
        </Text>
        <View style={{flexDirection:'row',marginTop:10,display:'flex',justifyContent:'space-between'}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Datetime style={{fontSize:13,color:Colors.GreyColor}} datetime={this.props.reply.createdatetime}></Datetime>
            <TouchableOpacity onPress={() => {this.props.onReplyPress(this.props.reply)}}><Text style={{fontSize:13,color:'#222'}}>  回复</Text></TouchableOpacity>
          </View>
          {(this.props.comment.userid == this.props.user.id || this.props.reply.userid == this.props.user.id) &&
          <TouchableOpacity style={{paddingVertical:3,paddingHorizontal:3}} onPress={()=>this.deleteReply()}>
            <Text style={{fontSize:12,color:'#222'}}>删除</Text>
          </TouchableOpacity>
          }
        </View>
      </View>
      </View>
    )
  }
}

export default withNavigation(ReplyinComment);
