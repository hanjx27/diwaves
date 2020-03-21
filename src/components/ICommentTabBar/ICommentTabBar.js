const React = require('react');
const { ViewPropTypes } = ReactNative = require('react-native');
const PropTypes = require('prop-types');
const createReactClass = require('create-react-class');
const {
  View,
  Animated,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
  Dimensions,
} = ReactNative;
const Button = require('./Button');

const WINDOW_WIDTH = Dimensions.get('window').width;

const ICommentTabBar = createReactClass({
  propTypes: {
    goToPage: PropTypes.func,
    activeTab: PropTypes.number,
    tabs: PropTypes.array,
    backgroundColor: PropTypes.string,
    activeTextColor: PropTypes.string,
    inactiveTextColor: PropTypes.string,
    scrollOffset: PropTypes.number,
    style: ViewPropTypes.style,
    tabStyle: ViewPropTypes.style,
    tabsContainerStyle: ViewPropTypes.style,
    textStyle: Text.propTypes.style,
    renderTab: PropTypes.func,
    underlineStyle: ViewPropTypes.style,
    onScroll: PropTypes.func,
  },

  getDefaultProps() {
    return {
      scrollOffset: 52,
      activeTextColor: 'black',
      inactiveTextColor: 'black',
      backgroundColor: null,
      style: {},
      tabStyle: {},
      tabsContainerStyle: {},
      underlineStyle: {},
    };
  },

  getInitialState() {
    this._tabsMeasurements = [];
    return {
      _leftTabUnderline: new Animated.Value(0),
      _widthTabUnderline: new Animated.Value(0),
      _containerWidth: null,
    };
  },

  componentDidMount() {
    this.props.scrollValue.addListener(this.updateView);
  },

  updateView(offset) {
    const position = Math.floor(offset.value);
    const pageOffset = offset.value % 1;
    const tabCount = this.props.tabs.length;
    const lastTabPosition = tabCount - 1;

    if (tabCount === 0 || offset.value < 0 || offset.value > lastTabPosition) {
      return;
    }

    if (this.necessarilyMeasurementsCompleted(position, position === lastTabPosition)) {
      //this.updateTabPanel(position, pageOffset);
      this.updateTabUnderline(position, pageOffset, tabCount);
    }
  },

  necessarilyMeasurementsCompleted(position, isLastTab) {
    return this._tabsMeasurements[position] &&
      (isLastTab || this._tabsMeasurements[position + 1]) &&
      this._tabContainerMeasurements &&
      this._containerMeasurements;
  },

  /*updateTabPanel(position, pageOffset) {
    const containerWidth = this._containerMeasurements.width;
    const tabWidth = this._tabsMeasurements[position].width;
    const nextTabMeasurements = this._tabsMeasurements[position + 1];
    const nextTabWidth = nextTabMeasurements && nextTabMeasurements.width || 0;
    const tabOffset = this._tabsMeasurements[position].left;
    const absolutePageOffset = pageOffset * tabWidth;
    let newScrollX = tabOffset + absolutePageOffset;

    // center tab and smooth tab change (for when tabWidth changes a lot between two tabs)
    newScrollX -= (containerWidth - (1 - pageOffset) * tabWidth - pageOffset * nextTabWidth) / 2;
    newScrollX = newScrollX >= 0 ? newScrollX : 0;

    if (Platform.OS === 'android') {
      this._scrollView.scrollTo({x: newScrollX, y: 0, animated: false, });
    } else {
      const rightBoundScroll = this._tabContainerMeasurements.width - (this._containerMeasurements.width);
      newScrollX = newScrollX > rightBoundScroll ? rightBoundScroll : newScrollX;
      this._scrollView.scrollTo({x: newScrollX, y: 0, animated: false, });
    }

  },*/

  updateTabUnderline(position, pageOffset, tabCount) {
    let decreaseWidth = 34;
    const lineLeft = this._tabsMeasurements[position].left;
    const lineRight = this._tabsMeasurements[position].right;

    if (position < tabCount - 1) {
      const nextTabLeft = this._tabsMeasurements[position + 1].left;
      const nextTabRight = this._tabsMeasurements[position + 1].right;

      const newLineLeft = (pageOffset * nextTabLeft + (1 - pageOffset) * lineLeft);
      const newLineRight = (pageOffset * nextTabRight + (1 - pageOffset) * lineRight);

      this.state._leftTabUnderline.setValue(newLineLeft + decreaseWidth/2);
      this.state._widthTabUnderline.setValue(newLineRight - newLineLeft - decreaseWidth);
    } else {
      this.state._leftTabUnderline.setValue(lineLeft + decreaseWidth/2);
      this.state._widthTabUnderline.setValue(lineRight - lineLeft - decreaseWidth);
    }
  },

  renderTab(name, page, isTabActive, onPressHandler, onLayoutHandler) {
    const { activeTextColor, inactiveTextColor, textStyle, } = this.props;
    const textColor = isTabActive ? activeTextColor : '#999';
    const fontWeight = isTabActive ? 'bold' : 'bold';
    const fontSize = isTabActive ? 20 : 17;
    const tabUnderlineStyle = {
      position: 'absolute',
      height: 3,
      backgroundColor: 'red',
      bottom: 0,
    };
    const dynamicTabUnderline = {
      width: 20,
    };
    return <Button
      key={`${name}_${page}`}
      accessible={true}
      accessibilityLabel={name}
      accessibilityTraits='button'
      onPress={() => onPressHandler(page)}
      onLayout={onLayoutHandler}
    >
      <View style={[styles.tab, this.props.tabStyle,{alignItems:'center',justifyContent:"center"} ]}>
        <Text style={[{color: textColor, fontWeight,fontSize:fontSize }, textStyle, ]}>
          {name}
        </Text>
        {isTabActive?<View style={[tabUnderlineStyle, dynamicTabUnderline, this.props.underlineStyle, ]} />:<View></View>}
      </View>
    </Button>;
  },

  measureTab(page, event) {
    const { x, width, height, } = event.nativeEvent.layout;
    this._tabsMeasurements[page] = {left: x, right: x + width, width, height, };
    this.updateView({value: this.props.scrollValue.__getValue(), });
  },

  render() {
    const tabUnderlineStyle = {
      position: 'absolute',
      height: 3,
      backgroundColor: 'red',
      bottom: 0,
    };
//<Animated.View style={[tabUnderlineStyle, dynamicTabUnderline, this.props.underlineStyle, ]} />
    const dynamicTabUnderline = {
      left: this.state._leftTabUnderline,
      width: this.state._widthTabUnderline,
    };
    return <View
      style={[styles.container, {backgroundColor: this.props.backgroundColor, }, this.props.style, ]}
      onLayout={this.onContainerLayout}
    >
      
        <View
          style={[styles.tabs, {width: WINDOW_WIDTH, }, this.props.tabsContainerStyle, ]}
          ref={'tabContainer'}
          onLayout={this.onTabContainerLayout}
        >
          <View style={{flexDirection:"row"}}>
          {this.props.tabs.map((name, page) => {
            if(name == '推荐' || name == '关注' || name == '榜单') {
              const isTabActive = this.props.activeTab === page;
              const renderTab = this.props.renderTab || this.renderTab;
              return renderTab(name, page, isTabActive, this.props.goToPage, this.measureTab.bind(this, page));
            }
           
          })}
        </View>
        
        <View style={{flexDirection:"row"}}>
          {this.props.tabs.map((name, page) => {
            if(name == '推荐' || name == '关注' || name == '榜单') {
              return;
            }
            const isTabActive = this.props.activeTab === page;
            const renderTab = this.props.renderTab || this.renderTab;
            return renderTab(name, page, isTabActive, this.props.goToPage, this.measureTab.bind(this, page));
          })}
        </View>
        </View>
    </View>;
  },

  componentDidUpdate(prevProps) {
    // If the tabs change, force the width of the tabs container to be recalculated
    if (JSON.stringify(prevProps.tabs) !== JSON.stringify(this.props.tabs) && this.state._containerWidth) {
      this.setState({ _containerWidth: null, });
    }
  },

  onTabContainerLayout(e) {
    this._tabContainerMeasurements = e.nativeEvent.layout;
    let width = this._tabContainerMeasurements.width;
    /*(if (width < WINDOW_WIDTH) {
      width = WINDOW_WIDTH;
    }*/
    this.setState({ _containerWidth: WINDOW_WIDTH, });
    this.updateView({value: this.props.scrollValue.__getValue(), });
  },

  onContainerLayout(e) {
    this._containerMeasurements = e.nativeEvent.layout;
    this.updateView({value: this.props.scrollValue.__getValue(), });
  },
});

module.exports = ICommentTabBar;

const styles = StyleSheet.create({
  tab: {
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    //paddingHorizontal:15
    width:60
  },
  container: {
    height: 92,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
    paddingLeft:5,
  },
  tabs: {
    flexDirection: 'column',
  },
});
