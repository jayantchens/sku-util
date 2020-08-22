# sku-util
[![NPM](https://nodei.co/npm/sku-util.png)](https://www.npmjs.com/package/sku-util)
### 电商sku组合选择工具
支持目前主流三大MVVM框架（React、Vue、Angular）按照该工具的编码规范可以快速让你的项目呈现sku组合选择模块，大大减少开发成本。

### Effect Picture

![](https://user-images.githubusercontent.com/19582213/90952623-c1276300-e497-11ea-9d60-c7a38fc259e8.gif)

### Feature
1. 支持规格属性不可选置灰
2. 支持获取规格价格区间
3. 支持获取规格库存
4. 样式逻辑分离，可自定义样式结合该模块

### Install
```
npm install sku-util
yarn add sku-util
```

### Usage
```js
import SkuUtil from 'sku-util'
```
#### Step1
约定好传入SkuUtil的sku数据结构（***字段名必须一样***），一个object，两个key的数据分别代表可选的sku列表和该商品所有的规格列表<br>
```js
{
  "skuList": {
    "101;201;302": {
      "price": 200,
      "stock": 10
    },
    "101;201;303": {
      "price": 150,
      "stock": 6
    },
    "102;201;302": {
      "price": 101,
      "stock": 10
    }
  },
  "skuSpec": [
    {
      "id": 262,
      "goodsId": 13,
      "specName": "尺寸",
      "specAttrList": [
        { id: 101, specId: 262, name: '4.7寸' },
        { id: 102, specId: 262, name: '5.5寸' },
        { id: 103, specId: 262, name: '6.0寸' },
      ]
    },
    {
      "id": 263,
      "goodsId": 13,
      "specName": "内存",
      "specAttrList": [
        { id: 201, specId: 263, name: '16G' },
        { id: 202, specId: 263, name: '32G' },
        { id: 203, specId: 263, name: '64G' },
      ]
    },
    {
      "id": 264,
      "goodsId": 13,
      "specName": "颜色",
      "specAttrList": [
        { id: 301, specId: 264, name: '黑色' },
        { id: 302, specId: 264, name: '红色' },
        { id: 303, specId: 264, name: '黄色' },
      ]
    }
  ]
}
```

#### Step2
组件<font style="color:#dd2222">渲染前</font>初始化该类，确保只初始化一次，初始化渲染规格dom节点列表数组和已选中的规格属性数组
```js
// 如果在react hook组件中：
const [ specList ] = useState(data.skuSpec);
const [ specListData, setSpecListData] = useState([]);
useMemo(() =>  SkuUtil.initSku(data.skuList), []);
// 如果在react class component中
constructor() {
  SkuUtil.initSku(data.skuList)
  this.state = {
    specList: data.skuSpec,
    specListData: []
  }
}
```

#### Step3
render函数中循环遍历规格的时候，通过每个规格属性传入SkuUtil内置的方法即可（<font style="color:#dd2222">请参照如下的Example</font>）

### Complete Example
```js
import React, { useState, useMemo } from 'react';
import SkuUtil from 'sku-util';
import { data } from './mockData';
import './sku.css';

function Sku () {
  const [ specList ] = useState(mockData.skuSpec);
  const [ specListData, setSpecListData] = useState([]); // 选中的规格属性数据对象
  useMemo(() =>  SkuUtil.initSku(mockData.skuList), []);

  function handleSpecAttr(item, index, disabled) {
    const list = SkuUtil.getActionSpecList(specListData, item, index, disabled);
    list && setSpecListData(list)
  }

  function checkOut() {
    const validSpecLen = specListData.filter(item => item).length;
    const specListLen = specList.length;
    if (validSpecLen < specListLen) {
      alert('请您检查是否有规格未选择')
    } else {
      alert('提交成功，请查看控制台数据')
      console.log(specListData)
    }
  }

  function transPrice() {
    const price = SkuUtil.getPrice(specListData)
    if (!price) return null;
    if (price.maxPrice === price.minPrice) {
      return `${price.maxPrice}元`;
    }
    return `${price.minPrice} ~ ${price.maxPrice}元`
  }

  function transSpec() {
    return specListData.filter(item => item).map(item => item.name).join(';')
  }

  const selectSpec = transSpec();
  const price = transPrice();
  const stock = SkuUtil.getStock(specListData);

  return (
    <div className="skuWrapper">
      {specList.map((item,index) => (
        <div className="specBox" key={item.id}>
          <div className="specName">{item.specName}</div>
          <ul>
            {item.specAttrList.map(attrItem => {
              const disabled = SkuUtil.checkSpecAttrDisabled(specListData, attrItem.id, index)
              const active = SkuUtil.checkSpecAttrActive(specListData, attrItem.id)
              return (
                <li 
                  key={attrItem.id} 
                  onClick={() => !disabled && handleSpecAttr(attrItem, index)}
                  className={
                    [
                      disabled ? 'disabled' : '',
                      active ? 'active' : ''
                    ].join('')
                }>{attrItem.name}</li>
              )
            })}
          </ul>
        </div>
      ))}
      <div className="selectedSpec" style={{marginTop: '20px'}}>选择的规格: {selectSpec || '---'}</div>
      <div className="price">价格: {price ? price : '---'}</div>
      <div className="stock">库存: {stock || stock === 0 ? stock : '---'}</div>
      <div className="checkOut" onClick={checkOut}>立即购买</div>
    </div>
  )
}

export default Sku;
```

### Api
##### SkuUtil.initSku(fetchData) #####
- 描述：初始化sku可选数据集合，会返回如下类似结构
- 参数： {Object} fetchData&nbsp; 后端获取的sku数据结构
```js
  {
    101:{ 
      price:[150, 200], stock: 16
    },
    101:201:{ 
      price:[200], stock: 10
    },
    101:201:302:{
      price:[200], stock: 20
    }
  }
```
##### SkuUtil.getActionSpecList(specListData, item, index) #####
- 描述：处理规格属性点击的操作
- 参数：
  - {Array} specListData&nbsp; 已选中的规格列表
  - {Object} item&nbsp; 该规格属性数据对象
  - {Number} index&nbsp; 该规格属性所属规格类别的index位置
- 返回：
  - {Array} &nbsp; 点击操作后的规格数据列表

##### SkuUtil.checkSpecAttrDisabled(specListData, id, index) #####
- 描述：处理规格属性是否置灰
- 参数：
  - {Array} specListData&nbsp; 已选中的规格列表
  - {Number|String} id&nbsp; 该规格属性id
  - {Number} index&nbsp; 该规格属性所属规格类别的index位置
- 返回：
  - {Boolean} &nbsp; 是否置灰

##### SkuUtil.checkSpecAttrActive(specListData, id) #####
- 描述：处理规格属性是否选中状态
- 参数：
  - {Array} specListData&nbsp; 已选中的规格列表
  - {Number|String} id&nbsp; 该规格属性id
- 返回：
  - {Boolean} &nbsp; 是否选中

##### SkuUtil.getPrice(specListData) #####
- 描述：获取已选中规格价格区间
- 参数：
  - {Array} specListData&nbsp; 已选中的规格列表
- 返回：
  - {minPrice: [Number], maxPrice: [Number]} &nbsp; 价格对象

##### SkuUtil.getStock(specListData) #####
- 描述：获取已选中规格库存
- 参数：
  - {Array} specListData&nbsp; 已选中的规格列表
- 返回：
  - {Number} &nbsp; 库存数量
