import moment from 'moment';
moment.locale('zh-cn', {
  months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
  weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
  weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
  longDateFormat: {
      LT: 'HH:mm',
      LTS: 'HH:mm:ss',
      L: 'YYYY-MM-DD',
      LL: 'YYYY年MM月DD日',
      LLL: 'YYYY年MM月DD日Ah点mm分',
      LLLL: 'YY年MM月DD日',
      l: 'YYYY-M-D',
      ll: 'YYYY年M月D日',
      lll: 'YYYY年M月D日 HH:mm',
      llll: 'YYYY.MM.DD',
  },
  meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
})

const dateFormat = (time, format) => moment(time).format(format);
const dateDiff = (end, start, label) => {
  return moment(end).diff(moment(start), label);
}// console.log(end); }//return moment(end).diff(monent(start), label);};

export {
  dateFormat,
  dateDiff
}
