import React, { Component } from 'react';
import {NativeModules,StatusBar,Image,Dimensions,Alert,TouchableNativeFeedback,TouchableOpacity,View,StyleSheet,Platform,Text, ScrollView} from 'react-native';
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

export default class RewardScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };

  constructor(props) {
    
    super(props);
    this.flag = false;

    this.article = props.navigation.getParam('article');
    this.comment = props.navigation.getParam('comment');
    this.type = props.navigation.getParam('type'); // 1 article  2:comment 是否对评论打赏要跟需求方确认

    this.state = {
      coinshow:false,
      rewarduserid:this.type == 1?this.article.userid:this.comment.userid,
      rewardusername:this.type == 1?this.article.username:this.comment.username,
      rewardavatar:this.type == 1?this.article.avatarUrl:this.comment.avatarUrl,
      user:{gold:0},
      chooses:[{
        title:'1金币',
        value:1,
        selected:true
      },{
        title:'5金币',
        value:5,
        selected:false
      },{
        title:'10金币',
        value:10,
        selected:false
      },{
        title:'20金币',
        value:20,
        selected:false
      },{
        title:'50金币',
        value:50,
        selected:false
      },{
        title:'100金币',
        value:100,
        selected:false
      }]
    }
  }

  

  componentWillMount() {
    
  }

  choose = (value) => {
    let chooses = this.state.chooses;
    for(let i = 0; i < chooses.length;i++) {
      chooses[i].selected = false;
      if(chooses[i].value == value) {
        chooses[i].selected = true;
      }
    }
    this.setState({
      chooses:chooses
    })
  }

  componentDidMount = async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
    }
  }

  componentWillUnmount() {
    
  }

  reward = async() => {
    if(this.flag) {
      return;
    }
    let value = 0;
    for(let i = 0; i < this.state.chooses.length;i++) {
      if(this.state.chooses[i].selected == true) {
        value = this.state.chooses[i].value
        break;
      }
    }
    
      this.flag = true;
      try {
        const result = await Request.post('addReward',{
          username:this.state.user.name,
          userid:this.state.user.id,
          touserid:this.state.rewarduserid,
          type:this.type,
          articleid:this.article.id, 
          articletitle:this.article.title,

          commentid:this.type==1?-1:this.comment.id,
          commentcontent:this.type==1?"":this.comment.content,

          gold:value
        });
        if(result.code == -2) {
          AsyncStorage.setItem('user', JSON.stringify(result.data), function (error) {})
          this.setState({
            user:result.data,
            coinshow:true
          })
          this.flag = false;

          Alert.alert(
            '金币不足，去充值',
            '',
            [
              {text: '确定', onPress: () => {}},
              {text: '取消', onPress: () => {}}
            ],
            { cancelable: true }
          )
          return;
        } else if(result.code == 1) {
          this.state.user.gold = this.state.user.gold - value;
          AsyncStorage.setItem('user', JSON.stringify(this.state.user), function (error) {}) //更新了金币数量，有可能需要通知其他页面，需要注意！
          let rewardobj = {
            article:this.article,
            comment:this.comment,
            type:this.type,
            gold:value
          }
          let rewardlist = null;
          let rewardliststr = await AsyncStorage.getItem('rewardlist_' + this.state.user.id);
          if(rewardliststr) {
            rewardlist = JSON.parse(rewardliststr)
          } else {
            rewardlist = [];
          }
          rewardlist.push(rewardobj)
          AsyncStorage.setItem('rewardlist_' + this.state.user.id, JSON.stringify(rewardlist), function (error) {})
          Alert.alert(
            '打赏成功',
            '感谢您的支持！',
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
  
  render() {
   
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}
      <Header title='赞赏作者' isLeftTitle={true}/>
      <ScrollView style={{backgroundColor:'white',paddingHorizontal:15,marginTop:10,flex:1}}>
        <View style={{flexDirection:'column',alignItems:"center",marginTop:30,paddingBottom:20}}>
          <Image style={{width:38,height:38,borderRadius:5}} source={{uri:baseimgurl + this.state.rewardavatar}}></Image>
          <Text style={{fontSize:14,fontWeight:"bold",color:Colors.TextColor,marginTop:20}}>{this.state.rewardusername}</Text>
        </View>

        <View style={{flexDirection:"row",flexWrap:'wrap',justifyContent:'space-evenly'}}>
            {this.state.chooses.map(item => {
              return (
                <MoneyBtn key={item.value} selected={item.selected} onPressed={() => this.choose(item.value)} title={item.title}></MoneyBtn>
              )
            })}
        </View>
        
        {this.state.coinshow &&
        <View style={{marginTop:20,flexDirection:"row",alignItems:"center",alignItems:'center',justifyContent:"center"}}>
          <Text style={{fontSize:13}}>您还有</Text>
          <Text style={{marginLeft:5,color:'#D9001B',fontSize:13}}>{this.state.user.gold + '金币'}</Text>
        </View>
        }

        <TouchableOpacity onPress={()=>this.reward()} style={{width:width-40,marginTop:10,marginLeft:5,borderRadius:3,backgroundColor:'#017bd1',paddingVertical:12,alignItems:'center'}}>
              <Text style={{color:'white',fontWeight:'bold'}}>赞赏</Text>
        </TouchableOpacity>

        <View style={{marginTop:30,marginBottom:30,color:Colors.sTextColor}}>
            <Text style={{color:Colors.sTextColor}}>温馨提示：</Text>
            
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
