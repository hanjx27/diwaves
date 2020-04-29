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
import PersonSearch from '../../components/PersonSearch';
import {Colors} from '../../constants/iColors';
export default class MyFocusScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);
    this.focuslist = []
    this.state = {
       user:null,
       personList:[]
    }
  }
  

  

  componentWillMount() {
    
  }

  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})

      this.getFansUserInfo(json.id);

      let focuslist = await AsyncStorage.getItem('focuslist_' + json.id);
      if(focuslist != null) {
        const json = JSON.parse(focuslist);
        this.focuslist = json;
      }
    }
    
  }

  getFansUserInfo = async(userid) => {
    try {
      const result = await Request.post('getFansUserInfo',{
        userid:userid
      });
      this.setState({
        personList:result.data
      })
    } catch (error) {
      console.log(error)
    }
  }
  componentWillUnmount() {
    
  }

  
  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title='我的粉丝'/>
      <View style={{flex:1}}>
             <FlatList
              style={{ marginTop: 0,flex:1}}
              data={this.state.personList}
              renderItem={
                ({ item }) => {
                  return (<PersonSearch user={this.state.user} focuslist={this.focuslist} person={item}></PersonSearch>)
                }
              }
              
              ItemSeparatorComponent={this._separator}
              keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
              
            />
      </View>

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
