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
export default class ChooseProvince extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.state = {
      provinceData:[
        {name:'北京',citys: '东城 西城 海淀 朝阳 崇文 宣武 丰台 石景山 房山 门头沟 通州 顺义 昌平 怀柔 平谷 大兴 密云 延庆' },
        {name:'天津',citys: '和平 河西 南开 河北 河东 红桥 东丽 津南 西青 北辰 武清 宝坻 滨海新区 宁河 静海 蓟州' },
        {name:'上海',citys: '长宁 闵行 徐汇 浦东新区 杨浦 普陀 静安 卢湾 虹口 黄浦 松江 嘉定 宝山 青浦 金山 奉贤 崇明' },
        {name:'安徽',citys: '铜陵 芜湖 宣城 亳州 合肥 安庆 蚌埠 巢湖 池州 滁州 阜阳 淮北 淮南 黄山 六安 马鞍山 宿州' },
        {name:'云南',citys:'昆明 怒江 普洱 丽江 保山 楚雄 大理 德宏 迪庆 红河 临沧 曲靖 文山 西双版纳 玉溪 昭通'},
        {name:'内蒙古',citys:'包头 赤峰 鄂尔多斯 呼伦贝尔 通辽 乌海 乌兰察布市 锡林郭勒盟 兴安盟 呼和浩特 阿拉善盟 巴彦淖尔盟'},
        {name:'吉林',citys: '通化 延边 长春 吉林 白城 白山 辽源 四平 松原' },
        {name:'重庆',citys: '合川 江津 南川 永川 南岸 渝北 万盛 大渡口 两江新区 万州 北碚 沙坪坝 巴南 涪陵 江北 九龙坡 渝中 黔江开发 长寿 双桥 綦江 潼南 铜梁 大足 荣昌 璧山 垫江 武隆 丰都 城口 梁平 开县 巫溪 巫山 奉节 云阳 忠县 石柱 彭水 酉阳 秀山' },
        {name:'四川',citys: '成都 绵阳 阿坝 巴中 达州 德阳 甘孜 广安 广元 乐山 凉山 眉山 南充 内江 攀枝花 遂宁 雅安 宜宾 资阳 自贡 泸州' },
        {name:'宁夏',citys: '银川 固原 石嘴山 吴忠 中卫' },   
        {name:'山东',citys: '济南 青岛 滨州 德州 东营 菏泽 济宁 莱芜 聊城 临沂 日照 泰安 威海 潍坊 烟台 枣庄 淄博' },
        {name:'山西',citys: '晋城 晋中 临汾 吕梁 朔州 忻州 阳泉 运城 太原 长治 大同' },
        {name:'广东',citys: '阳江 云浮 湛江 肇庆 中山 珠海 广州 深圳 潮州 东莞 佛山 河源 惠州 江门 揭阳 茂名 梅州 清远 汕头 汕尾 韶关' },
        {name:'广西',citys: '南宁 桂林 百色 北海 崇左 防城港 贵港 河池 贺州 来宾 柳州 钦州 梧州 玉林' },
        {name:'新疆',citys: '乌鲁木齐 阿克苏 阿拉尔 巴音郭楞 博尔塔拉 昌吉 哈密 和田 喀什 克拉玛依 克孜勒苏 石河子 图木舒克 吐鲁番 五家渠 伊犁' },
        {name:'江苏',citys: '南京 苏州 无锡 常州 淮安 连云港 南通 宿迁 泰州 徐州 盐城 扬州 镇江' },
        {name:'江西',citys: '南昌 抚州 赣州 吉安 景德镇 九江 萍乡 上饶 新余 宜春 鹰潭' },
        {name:'河北',citys: '石家庄 保定 沧州 承德 邯郸 衡水 廊坊 秦皇岛 唐山 邢台 张家口' },
        {name:'河南',citys: '郑州 洛阳 开封 安阳 鹤壁 济源 焦作 南阳 平顶山 三门峡 商丘 新乡 信阳 许昌 周口 驻马店 漯河 濮阳' },
        {name:'浙江',citys: '宁波 绍兴 台州 温州 舟山 衢州 杭州 湖州 嘉兴 金华 丽水' },
        {name:'海南',citys: '屯昌县 万宁 文昌 五指山 儋州 海口 三亚 白沙 保亭 昌江 澄迈县 定安县 东方 乐东 临高县 陵水 琼海 琼中' },
        {name:'湖北',citys: '武汉 仙桃 鄂州 黄冈 黄石 荆门 荆州 潜江 神农架林区 十堰 随州 天门 咸宁 襄樊 孝感 宜昌 恩施' },
        {name:'湖南',citys: '长沙 张家界 常德 郴州 衡阳 怀化 娄底 邵阳 湘潭 湘西 益阳 永州 岳阳 株洲' },
        {name:'甘肃',citys: '兰州 白银 定西 甘南 嘉峪关 金昌 酒泉 临夏 陇南 平凉 庆阳 天水 武威 张掖' },
        {name:'福建',citys: '福州 龙岩 南平 宁德 莆田 泉州 三明 厦门 漳州' },
        {name:'西藏',citys: '昌都 林芝 那曲 日喀则 山南 拉萨 阿里' },
        {name:'贵州',citys: '贵阳 安顺 毕节 六盘水 黔东南 黔南 黔西南 铜仁 遵义' },
        {name:'辽宁',citys: '沈阳 大连 鞍山 本溪 朝阳 丹东 抚顺 阜新 葫芦岛 锦州 辽阳 盘锦 铁岭 营口' },
        {name:'陕西',citys: '西安 安康 宝鸡 汉中 商洛 铜川 渭南 咸阳 延安 榆林' },
        {name:'青海',citys: '西宁 果洛 海北 海东 海南 海西 黄南 玉树' },
        {name:'黑龙江',citys: '齐齐哈尔 双鸭山 绥化 伊春 哈尔滨 大庆 大兴安岭 鹤岗 黑河 鸡西 佳木斯 牡丹江 七台河' },
        {name:'香港',citys: '沙田区 东区 观塘区 黄大仙区 九龙城区 屯门区 葵青区 元朗区 深水埗区 西贡区 大埔区 湾仔区 油尖旺区 北区 南区 荃湾区 中西区 离岛区' },
        {name:'澳门',citys: '大堂区 氹仔 风顺堂区 花蒂玛堂区 路环岛 圣安多尼堂区 望德堂区' },
        {name:'台湾',citys: '台北市 高雄市 基隆市 台中市 台南市 新竹市 嘉义县 宜兰县 桃园市 苗栗县 彰化县 南投县 云林县 屏东县 台东县 花莲县 澎湖县' },
      ]
    }
  }
  

  

  componentWillMount() {
    
  }

  componentDidMount= async() => {

  }

  componentWillUnmount() {
    
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
              data={this.state.provinceData}
              renderItem={
                ({ item }) => {
                  return (
                    <TouchableOpacity onPress={()=> {this.props.navigation.navigate('ChooseCity',{province:item,key:this.props.navigation.state.key,areaConfirm:this.props.navigation.state.params.areaConfirm})}} style={[styles.btn]}>
                      <Text style={{color:'black',fontSize:15}}>{item.name}</Text>
                      <Image style={{marginRight:20,width:20,height:20}} resizeMode='stretch' source={arrow}></Image>
                    </TouchableOpacity>
                  )
                }
              }
              
              ItemSeparatorComponent={this._separator}
              keyExtractor={(item, index) => item.name} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
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