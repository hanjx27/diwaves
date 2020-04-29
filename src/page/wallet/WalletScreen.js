import React, { Component } from 'react';
import {NativeModules,StatusBar,Image,Dimensions,DeviceEventEmitter,TouchableOpacity,View,StyleSheet,Platform,Text, ListView} from 'react-native';
const {width,height} =  Dimensions.get('window');
import {Colors} from '../../constants/iColors';

const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import {px, isIphoneX} from '../../utils/px';


export default class WalletScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      user:null,
      status:null,
    }
  }

  

  componentWillMount = async() => {
    this._navListener = this.props.navigation.addListener("didFocus", async() => {

      const user = await AsyncStorage.getItem('user');
      if(user != null && user != '') {
        const json = JSON.parse(user);
        this.getUserMoney(json);
      } else {
        this.setState({user:null})
      }
    });
    
  }

  getUserMoney = async(user) => {
    try {
      const result = await Request.post('getUserMoney',{
        id:user.id
      });
      const data = result.data;
      user.silver = data.silver;
      user.gold = data.gold;
      this.setState({user:user,status:data})
      AsyncStorage.setItem('user', JSON.stringify(user), function (error) {})
    } catch (error) {
      
    }
  }

  componentDidMount = async() => {
    
  }

  componentWillUnmount() {
    this._navListener.remove();
  }

  goTradelog = () => {
    this.props.navigation.navigate('TradeScreen');
  }
  
  loginClick = async() => {
    /*let user = await this.getUserInfo(2);
    await this.getUserMoney(user);
    DeviceEventEmitter.emit('login', this.state.user);*/
    this.props.navigation.navigate('login')
  }

  getUserInfo = async(id) => {
    try {
      const result = await Request.post('getUserInfo',{
        id:id
      });
      const user = result.data;
      return user;
      //this.setState({user:user})
      //await AsyncStorage.setItem('user', JSON.stringify(user), function (error) {})
    } catch (error) {
      console.log(error)
    }
  }
  
  render() {
    let gold = require('../../images/wallet/gold.png');
    let silver = require('../../images/wallet/silver.png');
    let arrow = require('../../images/center/arrow.png');
    let nologin = require('../../images/nologin.png');
    return (

      <View style={{flex: 1,flexDirection:'column',backgroundColor: '#f7f7f7'}}>
        
        {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
        {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

        
        <View style={{height:40,alignItems:'center',backgroundColor:'white',justifyContent:'center',borderBottomColor:'#eee',borderBottomWidth:0.5}}>
          <Text style={{fontSize:17,color:'black',fontWeight:'bold'}}>钱包</Text></View>
          {!this.state.user &&
          <View style={{paddingBottom:50,flex:1,justifyContent:'center',alignItems:'center'}}>
            <Image source={nologin} resizeMode="stretch" style={{width:200,height:200}}></Image>
            <Text style={{color:'#999'}}>登录后可查看"钱包"页面</Text>
            <TouchableOpacity onPress={this.loginClick} style={{width:100,borderRadius:5,height:30,marginTop:30,borderWidth:1,borderColor:Colors.TextColor,borderWidth:1,alignItems:'center',justifyContent:'center'}}>
                  <Text style={{color:Colors.TextColor,fontSize:14}}>登录</Text>
            </TouchableOpacity>
          </View>
          }
        
        {!!this.state.user &&
          <View style={{flex:1,backgroundColor:'#f7f7f7'}}>
          <View style={{marginTop:10,backgroundColor:'white',borderRadius:3,paddingLeft:20}}>
          <View style={{alignItems:'center',flexDirection:'row'}}>
            <Image style={{width:20,height:20}} source={gold}></Image>
            <View style={{marginLeft:10,flex:1,height:50,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:15}}>金币   {this.state.user.gold}</Text>
                <TouchableOpacity onPress={() => {this.props.navigation.navigate('ChargeScreen')}} style={{marginRight:20,paddingVertical:5,paddingHorizontal:10,borderRadius:3,borderColor:Colors.TextColor,borderWidth:1}}><Text style={{color:Colors.TextColor,fontSize:14}}>充值</Text></TouchableOpacity>
            </View>
          </View>
          <View style={{alignItems:'center',flexDirection:'row'}}>
            <Image style={{width:20,height:20}} source={silver}></Image>
            <View style={{marginLeft:10,flex:1,height:50,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
                <Text style={{fontSize:15}}>银币   {this.state.user.silver}</Text>
            </View>
          </View>
          {this.state.status &&
          <View style={{marginRight:20,marginTop:0,paddingBottom:7,paddingTop:15,marginBottom:7}}>
            <View style={{flexDirection:'row',backgroundColor:"#81c6fb",borderRadius:10}}>
              <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                <Text style={styles.whitetext}>今日获得</Text>
                <Text style={styles.whitetext}><Text style={{fontSize:16}}>{this.state.status.rewarddaycount}</Text>银币</Text>
              </View>
              <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                <Text style={styles.whitetext}>本周获得</Text>
                <Text style={styles.whitetext}><Text style={{fontSize:16}}>{this.state.status.rewardweekcount}</Text>银币</Text>
              </View>
              <View style={{flex:1,paddingTop:10,alignItems:'center'}}>
                <Text style={styles.whitetext}>本月获得</Text>
                <Text style={styles.whitetext}><Text style={{fontSize:16}}>{this.state.status.rewardmonthcount}</Text>银币</Text>
              </View>
            </View>
          </View>
           }
          </View>

        <TouchableOpacity onPress={this.goTradelog} style={{paddingLeft:20,marginTop:10,backgroundColor:'white',height:40,flexDirection:'row',borderBottomColor:'#eee',borderBottomWidth:0.5,justifyContent:"space-between",alignItems:"center"}}>
            <Text style={{fontSize:15}}>交易记录</Text>
            <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
        </TouchableOpacity>
        </View>
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
  greytext:{
    fontSize:13,
    color:Colors.sTextColor
  },
  numtext:{
    color:Colors.TextColor,
    fontSize:15,
    fontWeight:'bold'
  },
  whitetext:{
    color:'white',marginBottom:10,fontSize:14,fontWeight:'bold'
  }
});