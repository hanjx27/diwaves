import React, { Component } from 'react';
import {Alert,NativeModules,StatusBar,Image,Dimensions,TouchableNativeFeedback,TouchableOpacity,View,StyleSheet,Platform,Text, ScrollView} from 'react-native';
const {width,height} =  Dimensions.get('window');
import {Colors} from '../../constants/iColors';
import Header from '../../components/Header';
const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import {px, isIphoneX} from '../../utils/px';
import MoneyBtn from '../../components/MoneyBtn';

import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import { baseimgurl } from '../../utils/Global';
import ThumbArticle from '../../components/ThumbArticle';
import { TextInput } from 'react-native-gesture-handler';
export default class PushScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };

  constructor(props) {
    super(props);
    this.flag = false;
    this.article = props.navigation.getParam('article');
    this.pushuserid = props.navigation.getParam('pushuserid');
    if(!this.pushuserid) {
      this.pushuserid = -1;
    }
    this.type = 1;
    this.coincount = 10;
    this.peoplecount = 10;
    this.state = {
      user:null,
      pushcontent:'',
      coinshow:false,
      chooses:[{
        title:'10人',
        value:10,
        selected:true
      },{
        title:'20人',
        value:20,
        selected:false
      },{
        title:'50人',
        value:50,
        selected:false
      },{
        title:'100人',
        value:100,
        selected:false
      },{
        title:'200人',
        value:200,
        selected:false
      },{
        title:'500人',
        value:500,
        selected:false
      }],
      choosesgold:[{
        title:'10人',
        value:1,
        selected:false
      },{
        title:'20人',
        value:2,
        selected:false
      },{
        title:'50人',
        value:5,
        selected:false
      },{
        title:'100人',
        value:10,
        selected:false
      },{
        title:'200人',
        value:20,
        selected:false
      },{
        title:'500人',
        value:50,
        selected:false
      }],

      tofans:0
    }
  }

  componentWillMount = async() => {
    const user = await AsyncStorage.getItem('user');
    this.setState({
      user:JSON.parse(user)
    })

  }

  choose = (value) => {
    let chooses = this.state.chooses;
    let choosegold = this.state.choosesgold;
    for(let i = 0; i < chooses.length;i++) {
      chooses[i].selected = false;
      choosegold[i].selected =false;
      if(chooses[i].value == value) {
        chooses[i].selected = true;
        this.type = 1;
        this.coincount = value;
        this.peoplecount = value;
      }
    }
    this.setState({
      chooses:chooses,
      choosegold:choosegold
    })
  }
  choosegold = (value) => {
    let chooses = this.state.chooses;
    let choosesgold = this.state.choosesgold;
    for(let i = 0; i < choosesgold.length;i++) {
      choosesgold[i].selected = false;
      chooses[i].selected = false;
      if(choosesgold[i].value == value) {
        choosesgold[i].selected = true;
        this.type = 2;
        this.coincount = value;
        this.peoplecount = value * 10;
      }
    }
    this.setState({
      chooses:chooses,
      choosesgold:choosesgold,
    })
  }

  componentDidMount = () => {
    
  }

  componentWillUnmount() {
    
  }

  push = async() => {
    if(this.flag) {
      return;
    }
    if(!this.state.user) {
      Alert.alert('您尚未登录')
      return;
    }
      this.flag = true;
      try {
        const result = await Request.post('addPush',{
          userid:this.state.user.id,
          type:this.type,
          articleid:this.article.id,
          coincount:this.coincount,
          peoplecount:this.peoplecount,
          articletitle:this.article.title,
          pushuserid:this.pushuserid,
          articleuserid:this.article.userid,
          username:this.state.user.name,
          content:this.state.pushcontent
        });
        if(result.code == -4) {
          Alert.alert('您已被封禁')
          return;
        } else if(result.code == -3) {
          Alert.alert('请勿发表包含辱骂、色情、暴恐、涉政等违法信息')
          return;
        } else if(result.code == -2) {
          AsyncStorage.setItem('user', JSON.stringify(result.data), function (error) {})
          this.setState({
            user:result.data,
            coinshow:true
          })
          if(this.type == 1) {
            Alert.alert(
              '银币不足，建议您使用金币推送',
              '',
              [
                {text: '确定', onPress: () => {}},
              ],
              { cancelable: true }
              )
          } else if(this.type == 2) {
            Alert.alert(
              '金币不足，去充值',
              '',
              [
                {text: '确定', onPress: () => {}},
                {text: '取消', onPress: () => {}},
              ],
              { cancelable: true }
              )
          }
          this.flag = false;
          return;
        } else if(result.code > 0) {
          if(this.type == 1) {
            this.state.user.silver = this.state.user.silver - this.coincount;
          } else if(this.type == 2) {
            this.state.user.gold = this.state.user.gold - this.coincount;
          }
          AsyncStorage.setItem('user', JSON.stringify(this.state.user), function (error) {}) //更新了金币/银币数量，有可能需要通知其他页面，需要注意！
          let pushobj = {
            article:this.article,
            type:this.type,
            coincount:this.coincount,
            peoplecount:this.peoplecount
          }
          let pushlist = null;
          let pushliststr = await AsyncStorage.getItem('pushlist_' + this.state.user.id);
          if(pushliststr) {
            pushlist = JSON.parse(pushliststr)
          } else {
            pushlist = [];
          }
          pushlist.push(pushobj)
          AsyncStorage.setItem('pushlist_' + this.state.user.id, JSON.stringify(pushlist), function (error) {})
          Alert.alert(
            '推送成功',
            '',
            [
              {text: '确定', onPress: () => {this.props.navigation.goBack();}}
            ],
            { cancelable: true }
          )
        }
        this.flag = false;
      } catch (error) {
        console.log(error)
        this.flag = false;
      }
  }
  

  toFansClick = () => {
    this.setState({
      tofans:this.state.tofans == 0?1:0
    })
  }
  
  render() {
   
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}
      <Header title='推帖子' isLeftTitle={true}/>
      <ScrollView style={{backgroundColor:'white',paddingHorizontal:15,flex:1}}>
      
      <View style={{height:px(140),marginTop:20,marginLeft:5,width:width-40,paddingVertical:px(10),backgroundColor:"white"}}>
          <TextInput value={this.state.pushcontent} onChangeText = {(pushcontent) => this.setState({pushcontent})} placeholder="这一刻的想法..." maxLength={50} multiline={true} underlineColorAndroid="transparent" ref={contentinput => this.contentinput = contentinput} 
          style={{flex:1,textAlignVertical: 'top',fontSize:15}}/>
      </View>

      <View style={{flexDirection:'column',alignItems:"center",marginTop:5,paddingBottom:20}}>
        <ThumbArticle style={{width:width - 40}} article={this.article}></ThumbArticle>
      </View>

        {this.state.user != null && this.state.coinshow && 
        <View style={{flexDirection:"row",alignItems:"center",height:30,borderBottomWidth:0.5,borderColor:'#eee'}}>
          <Text style={{fontSize:15}}>您还有</Text>
        <Text style={{marginLeft:10,color:'#D9001B',fontSize:16}}>{this.state.user.silver}银币，</Text>
          <Text style={{fontSize:15}}>您还有</Text>
          <Text style={{marginLeft:10,color:'#D9001B',fontSize:16}}>{this.state.user.gold}金币</Text>
        </View>
        }
        <View style={{flexDirection:"row",alignItems:"center",height:40}}>
          <Text style={{fontSize:15}}>使用银币推送</Text>
          <Text style={{marginLeft:20,color:Colors.sTextColor}}>1银币推1人</Text>
        </View>

        <View style={{flexDirection:"row",flexWrap:'wrap',justifyContent:'space-evenly'}}>
            {this.state.chooses.map(item => {
              return (
                <MoneyBtn key={item.value} selected={item.selected} onPressed={() => this.choose(item.value)} title={item.title}></MoneyBtn>
              )
            })}
        </View>

        <View style={{flexDirection:"row",alignItems:"center",height:40}}>
          <Text style={{fontSize:15}}>使用金币推送</Text>
          <Text style={{marginLeft:20,color:Colors.sTextColor}}>1金币推10人</Text>
        </View>

        <View style={{flexDirection:"row",flexWrap:'wrap',justifyContent:'space-evenly'}}>
            {this.state.choosesgold.map(item => {
              return (
                <MoneyBtn key={item.value} selected={item.selected} onPressed={() => this.choosegold(item.value)} title={item.title}></MoneyBtn>
              )
            })}
        </View>

        <TouchableOpacity onPress={this.toFansClick} style={{justifyContent:"flex-end",marginRight:10,marginTop:20,flexDirection:'row',alignItems:"center"}}>
          <View style={this.state.tofans == 0 ?styles.unselectwrap:styles.selectwrap}>
            <View style={this.state.tofans == 0 ?styles.unselectinner:styles.selectinner}></View>
          </View>
          <Text style={{marginLeft:10,fontSize:14,color:'#666'}}>分享给粉丝</Text>
        </TouchableOpacity>
        

        <TouchableOpacity onPress={this.push} style={{width:width-40,marginTop:30,marginLeft:5,borderRadius:3,backgroundColor:'#017bd1',paddingVertical:12,alignItems:'center'}}>
              <Text style={{color:'white',fontWeight:'bold'}}>推送</Text>
        </TouchableOpacity>

        <View style={{marginTop:30,color:Colors.sTextColor,marginBottom:50}}>
            <Text style={{color:Colors.sTextColor}}>温馨提示：</Text>
            <Text style={{marginTop:10,color:Colors.sTextColor,lineHeight:20}}>1、1银币推1人，1金币推10人</Text>
        </View>
      </ScrollView>
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
  unselectwrap:{
    marginLeft:5,
    borderWidth:1,
    borderColor:"#999",
    width:17,
    height:17,
    
  },
  selectwrap:{
    marginLeft:5,
    borderWidth:1,
    borderColor:Colors.TextColor,
    width:17,
    height:17,
    alignItems:'center',
    justifyContent:"center"
  },
  unselectinner:{

  },
  selectinner:{
    width:11,
    height:11,
    backgroundColor:Colors.TextColor
  },
})
