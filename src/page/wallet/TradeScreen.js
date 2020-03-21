import React, { Component } from 'react';
import {Image,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import Tradelog from '../../components/Tradelog';
export default class TradeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.state = {
       user:null,
       tradeList:[]
    }
  }
  

  

  componentWillMount() {
    
  }

  componentDidMount= async() => {
    const userstr = await AsyncStorage.getItem('user');
    if(userstr != null && userstr != '') {
      const user = JSON.parse(userstr);
      this.setState({user:user})

      const tradeListstr = await AsyncStorage.getItem('tradeList_' + user.id);
      if(tradeListstr != null && tradeListstr != '') {
        const json = JSON.parse(tradeListstr);
        this.setState({tradeList:json})
     }
     this.getTrade(user);
    }
  }

  getTrade = async(user) => {
    if(this.flag) {
      return;
    }
    this.flag = true;
    try {
      const result = await Request.post('getTradelog',{
        userid:user.id,
      });
      if(result.code == 1) {
        if(result.data.length >  0) {
          let tradeList = this.state.tradeList;
          tradeList = result.data.concat(tradeList);
          AsyncStorage.setItem('tradeList_' + user.id, JSON.stringify(tradeList), function (error) {})
          this.setState({
            tradeList:tradeList
          })
        }
      }
      
      this.flag = false;
    } catch (error) {
      console.log(error)
      this.flag = false;
    }
  }

  componentWillUnmount() {
    
  }

  
  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title='交易记录' isLeftTitle={true}/>
      <FlatList
              style={{ marginTop: 0 }}
              data={this.state.tradeList}
              renderItem={
                ({ item }) => {
                  return(
                    <Tradelog tradelog={item}></Tradelog>
                  )
                }
              }
              keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
              ItemSeparatorComponent={this._separator}
            />

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
