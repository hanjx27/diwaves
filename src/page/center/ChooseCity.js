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

import {Colors} from '../../constants/iColors';
export default class ChooseCity extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.state = {
      user:null,
      citys:props.navigation.getParam('province').citys.split(' ')
    }
  }

  componentWillMount() {
    
  }

  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
    }
  }

  componentWillUnmount() {
    
  }

  chooseCity = async (item) => {
    await this.editUser('province',this.props.navigation.getParam('province').name);
    await this.editUser('city',item);
    let user = this.state.user;
    user.province = this.props.navigation.getParam('province').name;
    user.city = item;
    if(!!this.props.navigation.state.params.areaConfirm) {
      this.props.navigation.state.params.areaConfirm(user);
    }
    this.props.navigation.goBack(this.props.navigation.state.params.key);
  }

  editUser =  async(column,value) => {
    try {
      const result = await Request.post('editUser',{
        column:column,
        value:value,
        userid:this.state.user.id
      });
      if(result.code == 1) {
          
      }
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    let arrow = require('../../images/center/arrow.png');
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
       
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title='选择地区' isLeftTitle={true} />
      <FlatList
              style={{}}
              data={this.state.citys}
              renderItem={
                ({ item }) => {
                  return (
                    <TouchableOpacity onPress={()=> {this.chooseCity(item)}} style={[styles.btn]}>
                      <Text style={{color:'black',fontSize:15}}>{item}</Text>
                      <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
                    </TouchableOpacity>
                  )
                }
              }
              
              ItemSeparatorComponent={this._separator}
              keyExtractor={(item, index) => item} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
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


const styles = StyleSheet.create({
  btn:{
    backgroundColor:'white',
    alignItems:"center",
    flexDirection:'row',
    paddingVertical:15,
    marginTop:0,
    paddingLeft:15,
    borderTopWidth:0.5,
    borderTopColor:'#f5f5f5',
    justifyContent:'space-between'
  }
})