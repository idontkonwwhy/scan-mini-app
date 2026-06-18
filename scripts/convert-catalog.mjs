import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const oldData = JSON.parse(
  readFileSync(join(__dirname, '..', '_catalog_backup.json'), 'utf-8')
)

// Manual mapping: product name -> actual image filename
// Built by matching pinyin filenames to Chinese product names
const imageMap = {
  // Category 1: 锁扣与板托
  '新款三合一锁扣配盖': 'xinkuansanheyisuokoupeigai.jpg',
  '12x12.5三合一锁扣': '12x12.5sanheyisuokou.png',
  '新款简易三合一板托': 'xinkuanjianyisanheyibantuo.png',
  '12厘新款二合一板托': '12lixinkuanerheyibantuo.jpg',
  '半圆板托（12厘/15厘/18厘）': 'bantuoluosi.jpg',
  '方板托（12厘/15厘/18厘）': 'XSFfanghuakelibantuo.png',
  '12厘长方盖': '12lichangfanggai.jpg',
  'XSF防滑颗粒板托': 'XSFfanghuakelibantuo.png', // same image reused
  '兴盛发三合一轮': 'xingshengfasanheyilun.jpg',
  'XSF快装杆': 'XSFkuaizhuanggan.jpg',
  'XSF纤维板钉': 'XSFxianweibanding.jpg',
  '连接杆展示': 'lianjieganzhanshi.png',
  '预埋件展示': 'yumaijianzhanshi.jpg',
  '三合一暗藏层板托': 'sanheyiancangcengbantuo.jpg',
  '板托螺丝': 'bantuoluosi.jpg',
  '隔板托': 'gebantuo.jpg',
  '合金吸盘板托': 'hejinxipanbantuo.jpg',
  '直杆二合一板托': 'zhiganerheyibantuo.jpg',
  'XSF玻璃扣': 'XSFbolikou.png',
  '三合一盖': 'sanheyigai.jpg',
  '十字三合一装饰盖': 'shizisanheyizhuangshigai.jpg',
  '十字自攻螺丝盖': 'shizizigongluosigai.jpg',
  '家具透明软胶塞': 'jiajutoumingruanjiaosai.jpg',
  '连体螺丝自攻盖': 'liantiluosizigonggai.jpg',

  // Category 2: 胶链与合页
  'XSF胶链': 'XSFjiaolian.jpg',
  'XSF胶链灯': 'XSFjiaoliandeng.jpg',
  'XSF合页': 'XSFheye.jpg',
  'XSF合页孔塞': 'XSFheyekongsai.jpg',
  'XSF隐藏胶链': 'XSFyincangjiaolian.jpg',
  'XSF十字胶': 'XSFshizijiao.jpg',

  // Category 3: 滑轨与导轨
  'XSF二折隐藏反弹滑轨': 'XSF二折隐藏反弹滑轨.png',
  'XSF二折隐藏缓冲滑轨': 'XSF二折隐藏缓冲滑轨.png',
  'XSF板托销': 'XSFbantuoxiao.jpg',
  '塑料电脑键盘托': 'suliaodiannaojianpantuo.jpg',
  '电脑键盘托架': 'diannaojianpantuojia.jpg',

  // Category 4: 吊码与支架
  'XSF吊码 (8101214寸)': 'XSFdiaoma (8101214cun).jpg',
  'XSF隐藏吊码': 'XSFyincangdiaoma.jpg',
  'XSF蛇形管': 'XSFshexingguan.png',
  '角码系列': 'jiaomaxilie.jpg',
  '床角撑': 'chuangjiaocheng.jpg',
  '加厚二合一法兰座': 'jiahouerheyifalanzuo.jpg',

  // Category 5: 拉手与衣柜五金
  'XSF挂衣杆': 'XSFguayigan.jpg',
  'XSF衣托': 'XSFyituo.jpg',
  'XSF铁衣架': 'XSFtieyijia.jpg',
  'XSF铁鞋架': 'XSFtiexiejia.jpg',
  'XSF伸宿衣架': 'XSFshensuyijia.jpg',
  '不锈钢蘑菇拉手': 'buxiugangmogulashou.jpg',
  '现代简约太空铝拉手': 'xiandaijianyuetaikonglvlashou.png',
  '合金衣钩': 'hejinyigou.jpg',
  '衣柜加厚挂衣杆': 'yiguijiahouguayigan.jpg',
  'XSF酒杯架': 'XSFjiubeijia.jpg',

  // Category 6: 柜脚与脚垫
  'XSF威斯朗脚轮': 'XSFweisilangjiaolun.png',
  'XSF伸缩脚': 'XSFshensuojiao.jpg',
  'XSF柜脚': 'XSFguijiao.jpg',
  '家具防滑增高脚垫': 'jiajufanghuazenggaojiaodian.jpg',
  '家具水晶防尘角粒': 'jiajushuijingfangchenjiaoli.jpg',
  '不锈钢家具柜脚': 'buxiugangjiajuguijiao.jpg',
  '家具地脚钉': 'jiajudijiaoding.jpg',
  'XSF透明橡胶家具脚垫': 'XSFtoumingxiangjiaojiajujiaodian.jpg',

  // Category 7: 功能五金配件
  'XSF插销': 'XSFchaxiao.jpg',
  'XSF赌头': 'XSFdutou.jpg',
  'XSF反弹器': 'XSFfantanqi.png',
  'XSF防水垫': 'XSFfangshuidian.png',
  'XSF防撞角': 'XSFfangzhuangjiao.jpg',
  'XSF活性炭透气风': 'XSFhuoxingtantouqifeng.jpg',
  'XSF趟门轮': 'XSFtangmenlun.png',
  'XSF家具锁': 'XSFjiajusuo.png',
  'XSF透气网': 'XSFtouqiwang.jpg',
  'XSF毛边': 'XSFmaobian.jpg',
  'XSF螺母': 'XSFluomu.png',
  'XSF拉直器': 'XSFlazhiqi.jpg',
  'XSF拉直器（重复）': 'XSFlazhiqi（chongfu）.jpg',
  '塑料穿线盒': 'suliaochuanxianhe.png',
  '加厚塑料线盒': 'jiahousuliaoxianhe.jpg',
  '电脑桌合金穿线盒': 'diannaozhuohejinchuanxianhe.jpg',
  '家具孔塞系列': 'jiajukongsaixilie.jpg',
  'U型封边下水口': 'Uxingfengbianxiashuikou.jpg',
  'XSF毛条': 'XSFmaotiao.jpg',
}

const categories = oldData.categories.map((c, i) => ({
  id: `c${i + 1}`,
  name: c.name,
  order: i + 1,
}))

let pIndex = 0
const products = []
const unmapped = []

for (const cat of oldData.categories) {
  for (const item of cat.items) {
    pIndex++
    const filename = imageMap[item.name]
    if (!filename) {
      unmapped.push(item.name)
    }
    const catId = categories.find(c => c.name === cat.name)
    products.push({
      id: `p${pIndex}`,
      categoryId: catId ? catId.id : 'c1',
      name: item.name,
      image: filename ? `/images/${filename}` : '/images/placeholder.jpg',
      desc: item.description || '',
      variants: [
        {
          id: `v${pIndex}`,
          label: item.name,
          spec: '',
        },
      ],
    })
  }
}

writeFileSync(
  join(__dirname, '..', 'src', 'data', 'categories.json'),
  JSON.stringify(categories, null, 2),
  'utf-8'
)
writeFileSync(
  join(__dirname, '..', 'src', 'data', 'products.json'),
  JSON.stringify(products, null, 2),
  'utf-8'
)
console.log(`Converted: ${categories.length} categories, ${products.length} products`)
if (unmapped.length > 0) {
  console.log(`WARNING: ${unmapped.length} products unmapped:`)
  unmapped.forEach(n => console.log(`  - ${n}`))
} else {
  console.log('All products mapped to images successfully.')
}
