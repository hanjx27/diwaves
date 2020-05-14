import React, { Component } from 'react';
import {FlatList,StatusBar,NativeModules,PanResponder,ActivityIndicator,View,StyleSheet,Platform,Dimensions} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import Article from '../../components/Article';
export default class MyArticlesScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);
    this.end = false;
    this.pagecount = 15;
    this.endid = 0;
    this.user = props.navigation.getParam('user');
    this.state = {
      articlesList:[],
      isLoading:true
    }

    this.flaglistloading = false;
  }
  

  

  componentWillMount() {  
  }

  componentDidMount= async() => {
    

    this.getUserArticles();
  }

  getUserArticles = async() => {
    try {
      const result = await Request.post('getMyArticles',{
        pagecount:this.pagecount,
        endid:this.endid,
        userid:this.user.id
      });
      if(result.code == 1) {
          let articles = this.state.articlesList
          for(let i = 0;i < result.data.length;i++) {
              let article = result.data[i]
              article.username = this.user.name;
              article.avatarUrl = this.user.avatar;
              article.level = this.user.level;
              articles.push(article)
          }
          this.setState({
            articlesList:articles,
            isLoading:false
          })
          if(result.data.length < this.pagecount) {
              this.end = true;
              this.updateRedisCount(articles.length);
          } else {
            this.endid = result.data[result.data.length - 1].id
          }
      }
    } catch (error) {
      console.log(error)
    }
  }

  updateRedisCount = async(count)=> {
    try {
      await Request.post('updateRedisCount',{
        userid:this.user.id,
        rediskey:'articlecount',
        count:count
      });
    } catch (error) {
      console.log(error)
    }
  }

  _onEndReached =() => {
    if(this.flaglistloading) {
      return;
    }
    if(this.end) {
      return;
    }
    this.flaglistloading = true;
    this.getUserArticles();
    this.flaglistloading = false;
  }

  componentWillUnmount() {
  }

  
  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
      
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title={'我的帖子'} isLeftTitle={false} />
      {
          this.state.isLoading && (
            <View style={{ flex: 1, padding: 50 }}>
              <ActivityIndicator />
            </View>
          )
        }
      <FlatList
              style={{ marginTop: 0 }}
              data={this.state.articlesList}
              onEndReachedThreshold={1}
              onEndReached={this._onEndReached}
              renderItem={
                ({ item }) => {
                  return (<Article article={item}></Article>)
                }
              }
              
              ItemSeparatorComponent={this._separator}
              keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
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
