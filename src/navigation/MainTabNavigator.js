import React from 'react';
import {px} from '../utils/px';
import { Image,View,Text} from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';


//home
import HomeScreen from '../page/Home/HomeScreen';
import CreateAritcle from '../page/Home/CreateArticle';
import CreateVoiceArticle from '../page/Home/CreateVoiceArticle';
import CategoryArticles from '../page/Home/CategoryArticles';
import Search from '../page/Home/Search';

//center
import CenterScreen from '../page/center/CenterScreen';
import MyArticlesScreen from '../page/center/MyArticlesScreen';
import Scanner from '../page/center/Scanner';
import MyCommentsScreen from '../page/center/MyCommentsScreen';
import MyPredictsScreen from '../page/center/MyPredictsScreen';
import MyDraftsScreen from '../page/center/MyDraftsScreen';
import Settings from '../page/center/Settings';
import Edit from '../page/center/Edit';
import ChooseProvince from '../page/center/ChooseProvince';
import ChooseCity from '../page/center/ChooseCity';
import MyFocusScreen from '../page/center/MyFocusScreen';
import MyFansScreen from '../page/center/MyFansScreen';
import ChangePhone from '../page/center/ChangePhone';
//article
import ArticleScreen from '../page/article/ArticleScreen';
import PredictScreen from '../page/article/PredictScreen';
import CommentScreen from '../page/article/CommentScreen';
import PushScreen from '../page/article/PushScreen';
import RewardScreen from '../page/article/RewardScreen';
//message
import MessageScreen from '../page/message/MessageScreen';
import ReportList from '../page/message/ReportList';

//wallet
import WalletScreen from '../page/wallet/WalletScreen';
import ChargeScreen from '../page/wallet/ChargeScreen';
import TradeScreen from '../page/wallet/TradeScreen';
//person 
import PersonScreen from '../page/person/PersonScreen';
import MessageDetail from '../page/message/MessageDetail';

import {Colors} from '../constants/iColors';
import Icon from 'react-native-vector-icons/AntDesign'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'



import login from '../page/login';
import WebContainer from '../page/WebContainer';

const HomeStack = createStackNavigator({
  Home: HomeScreen
}, {
  headerMode: 'none'
})
const CenterStack = createStackNavigator({
  Center: CenterScreen
}, {
  headerMode: 'none'
})
const WalletStack = createStackNavigator({
  Wallet: WalletScreen
}, {
  headerMode: 'none'
})
const MessageStack = createStackNavigator({
  Message: MessageScreen
}, {
  headerMode: 'none'
})
const MainTabNavigator = createBottomTabNavigator(
  {
    '首页': HomeStack,
    '消息':MessageStack,
    '发帖':CreateAritcle,
    '钱包':WalletStack,
    '我的':CenterStack
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        switch(routeName) {
          case '首页':
            return focused ? <Icon name='home' size={24} color={Colors.TextColor}/> : <Icon name='home' size={24} color={'black'}/>;
          case '消息':
            return focused ? <Feather name='message-square' size={23} color={Colors.TextColor}/> : <Feather name='message-square' size={23} color={'black'}/>;
          case '发帖':
            return <MaterialIcons style={{marginTop:-2}} name='add-box' size={29} color={Colors.TextColor}/>
          case '钱包':
            return focused ? <Feather name='pocket' size={23} color={Colors.TextColor}/> : <Feather name='pocket' size={23} color={'black'}/>;
          case '我的':
            return focused ? <Feather name='user' size={25} color={Colors.TextColor}/> : <Feather name='user' size={25} color={'black'}/>;
        }
      },tabBarOnPress: (event) => {
        if(event.navigation.state.routeName == '发帖') {
          event.navigation.navigate('CreateAritcle')
        } else {
          event.defaultHandler();//调用组建内默认的实现方法
        }
      },
    }),
    tabBarOptions: {
      activeTintColor: Colors.TextColor,
      inactiveTintColor: '#000',
      style: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderTopColor: '#E9E9E9',
      }
    }
  }
)

MainTabNavigator.navigationOptions = {
  header: null
}

const MainStack = createStackNavigator(
  {
    MainTabNavigator: MainTabNavigator,
    CreateAritcle: CreateAritcle,
    ChargeScreen:ChargeScreen,
    CreateVoiceArticle:CreateVoiceArticle,
    ArticleScreen:ArticleScreen,
    CommentScreen:CommentScreen,
    PushScreen:PushScreen,
    RewardScreen:RewardScreen,
    PredictScreen:PredictScreen,
    CategoryArticles:CategoryArticles,
    PersonScreen:PersonScreen,
    TradeScreen:TradeScreen,
    MyArticlesScreen:MyArticlesScreen,
    MessageDetail:MessageDetail,
    ReportList:ReportList,
    Scanner:Scanner,
    MyCommentsScreen:MyCommentsScreen,
    MyPredictsScreen:MyPredictsScreen,
    MyDraftsScreen:MyDraftsScreen,
    MyFocusScreen:MyFocusScreen,
    MyFansScreen:MyFansScreen,
    Search:Search,
    Settings:Settings,
    Edit:Edit,
    ChooseProvince:ChooseProvince,
    ChooseCity:ChooseCity,
    ChangePhone:ChangePhone,

    login:login,
    WebContainer:WebContainer
  },{
    initialRouteName: 'MainTabNavigator',
    headerMode: 'none',
  }
)



export default MainStack;