## 概述
本文档描述云 API 提供的认证与设备管理相关接口。

**基础路径：**

+ 认证接口：`/cloudweb/openapi/v1/user`
+ 设备接口：`/cloudweb/openapi/v1/device`

**请求方式：** 全部为 `POST`，Content-Type 为 `application/json`。

---

## 公共响应结构
所有接口返回统一的 JSON 格式：

```json
{
  "result": 0,
  "url": "/cloudweb/openapi/v1/user/token",
  "message": "Success",
  "data": {},
  "id": "0"
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| result | number | 响应码，`0` 表示成功，非 `0` 为错误码 |
| url | string | 请求的接口路径 |
| message | string | 响应描述信息 |
| data | object/null | 业务数据，具体结构见各接口说明 |
| id | string | 请求中携带的标识 ID，原样返回；未传则为 `"0"` |


---

## 公共错误码
### 基础错误码
| 错误码 | 含义 |
| --- | --- |
| -1 | 服务错误 |
| 0 | 成功 |
| 2 | 参数错误 |
| 5 | 用户未登录 |
| 6 | 远程服务未找到 |
| 7 | 远程服务错误 |


### 业务错误码
| 错误码 | 含义 |
| --- | --- |
| 600104 | 设备已被其他账号绑定 |
| 600105 | 设备从未注册到服务器 |
| 600107 | 设备验证码错误 |
| 600108 | 设备不存在 |
| 600109 | 账号 OEM 与设备不匹配 |
| 600111 | 设备已锁定，请稍后再试 |
| 1000001 | 签名过期或者AppId错误 |
| 1000002 | Token无效或过期 |


---

## 一、认证接口
### 1.1 获取访问令牌
通过应用签名换取访问令牌（Access Token），该令牌用于后续设备管理接口的认证。

**接口地址：** `POST /cloudweb/openapi/v1/user/token`

**认证要求：** 无需认证（本接口用于获取 Token）。

**请求参数：**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| sign | string | 是 | - | 应用签名，用于身份验证 |
| appId | string | 是 | - | 应用标识 ID |
| time | number | 是 | - | 请求时间戳（毫秒） |
| nonce | string | 是 | - | 随机字符串，防重放攻击 |
| id | string | 是 | - | 请求标识，响应中原样返回 |


**响应 data 结构：**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| accessToken | string | 访问令牌，后续接口需在请求体中携带此字段 |
| expireTime | number | 令牌过期时间（秒） |


**请求示例：**

```json
{
    "appId": "R001Gh4qy0qSwxY9JfbNGYhwCp5g",
    "sign": "0a3b38b43c23b77f22e4f14b8f8e62d5f164b2bd62fb88626a6b5a4d923d5817",
    "time": 1777516761,
    "nonce": "20nryewobnf",
    "id": "req-001"
}
```

**成功响应示例：**

```json
{
  "result": 0,
  "url": "/token",
  "message": "Success",
  "data": {
    "accessToken": "At_a1b2c3d4e5f6...",
    "expireTime": 7200
  },
  "id": "req-001"
}
```

**错误响应示例（参数缺失）：**

```json
{
  "result": 2,
  "url": "/token",
  "message": "Param error",
  "data": null,
  "id": "0"
}
```

**错误响应示例（签名验证失败）：**

```json
{
  "result": 1000001,
  "url": "/token",
  "message": "xxxx",
  "data": null,
  "id": "req-001"
}
```



**sign字段计算方式**

```javascript
(function () {
    var timestamp = getTime();
    var nonce = Math.random().toString(36).substr(2);
    var appSecret = "TvYxLf5teKC9gIgV1thzVHDGKPzCMpyp";
    var sign = calcSignSha256(timestamp, nonce, appSecret);
})();

function calcSignSha256(timestamp, nonce, appSecret) {
  
    var str = "time:" + timestamp + ",nonce:" + nonce + ",appSecret:" + appSecret;
    var sign = CryptoJS.SHA256(str).toString();
    return sign;
}
```

---

## 二、设备管理接口
设备管理接口均需要在请求体中携带 `token` 和 `appId` 进行认证。认证失败将返回错误码`1000002`。

**公共必填字段（所有设备接口）：**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| token | string | 是 | 通过 `/user/token` 接口获取的访问令牌 |
| appId | string | 是 | 应用标识 ID，需与获取 Token 时使用的 appId 一致 |


> 以下各接口的请求参数表中不再重复列出 `token` 和 `appId`。
>

---

### 2.1 获取设备列表
**接口地址：** `POST /cloudweb/openapi/v1/device/list`

**请求参数（除公共字段外）：**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| pageStart | number | 否 | `0` | 分页起始偏移量 |
| pageSize | number | 否 | `20` | 每页记录数 |
| list | array<string> | 否 | - | 设备 ID 过滤列表，最多 100 个，仅接受字符串元素 |
| id | string | 否 | `"0"` | 请求标识，响应中原样返回 |


**响应 data 结构：**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| pageSize | number | 每页记录数 |
| pageIndex | number | 当前页索引 |
| total | number | 设备总数 |
| count | number | 当前页实际返回的记录数 |
| deviceInfoList | array | 设备信息列表 |


**deviceInfoList 子字段：**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| deviceId | string | 设备唯一标识 (DUID) |
| deviceName | string | 设备名称 |
| deviceTypeName | string | 设备类型名称 |
| deviceModel | string | 设备型号 |


**请求示例：**

```json
{
  "token": "At_a1b2c3d4e5f6...",
  "appId": "xxxxxxxxxxxxxxxxxxxxxxx",
  "pageStart": 0,
  "pageSize": 10,
  "list": ["DEVICE001", "DEVICE002"],
  "id": "req-002"
}
```

**成功响应示例：**

```json
{
  "result": 0,
  "url": "/list",
  "message": "Success",
  "data": {
    "pageSize": 10,
    "pageIndex": 0,
    "total": 2,
    "count": 2,
    "deviceInfoList": [
      {
        "deviceId": "DEVICE001",
        "deviceName": "客厅摄像头1",
        "deviceTypeName": "IOT",
        "deviceModel": "IOT2112P8"
      },
      {
        "deviceId": "DEVICE002",
        "deviceName": "门口摄像头2",
        "deviceTypeName": "IOT",
        "deviceModel": "IOT2112P8"
      }
    ]
  },
  "id": "req-002"
}
```

---

### 2.2 添加设备（绑定设备）
将设备绑定到当前账号。接口内部会先校验设备注册状态和绑定状态，校验通过后再执行绑定。

**接口地址：** `POST /cloudweb/openapi/v1/device/add`

**请求参数（除公共字段外）：**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| deviceId | string | 是 | - | 设备唯一标识 (DUID) |
| deviceName | string | 是 | - | 设备名称 |
| authCode | string | 是 | - | 设备验证码 |
| id | string | 否 | `"0"` | 请求标识，响应中原样返回 |


**绑定流程：**

1. 校验设备是否已注册到服务器（未注册返回 `600105`）
2. 校验设备是否已被其他账号绑定（已绑定返回 `600104`）
3. 校验通过后，使用 `authCode` 执行绑定操作

**响应 data：** 正常成功为 `null`。若设备或账号被锁定，返回以下结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| lockTime | number | 设备锁定剩余时间（秒），错误码 `600111` 时返回 |
| lockAfterTimes | number | 剩余可尝试次数，错误码 `600107` 时返回 |


**请求示例：**

```json
{
  "token": "At_a1b2c3d4e5f6...",
  "appId": "xxxxxxxxxxxxxxxxxxxxxxx",
  "deviceId": "DEVICE001",
  "deviceName": "客厅摄像头",
  "authCode": "123456",
  "id": "req-003"
}
```

**成功响应示例：**

```json
{
  "result": 0,
  "url": "/add",
  "message": "Success",
  "data": null,
  "id": "req-003"
}
```

**设备锁定响应示例：**

```json
{
  "result": 600111,
  "url": "/add",
  "message": "Device has locked, wait for a moment again",
  "data": {
    "lockTime": 300
  },
  "id": "req-003"
}
```

**可能的错误码：**

| 错误码 | 含义 |
| --- | --- |
| 600105 | 设备从未注册到服务器 |
| 600104 | 设备已被其他账号绑定 |
| 600107 | 设备验证码错误（附带剩余尝试次数） |
| 600108 | 设备不存在 |
| 600109 | 账号 OEM 与设备不匹配 |
| 600110 | 账号已锁定，请稍后再试 |
| 600111 | 设备已锁定，请稍后再试（附带锁定时间） |


---

### 2.3 删除设备
从当前账号下解绑并删除设备。

**接口地址：** `POST /cloudweb/openapi/v1/device/delete`

**请求参数（除公共字段外）：**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| deviceId | string | 是 | - | 待删除的设备唯一标识 (DUID) |
| id | string | 否 | `"0"` | 请求标识，响应中原样返回 |


**响应 data：** `null`

**请求示例：**

```json
{
  "token": "At_a1b2c3d4e5f6...",
  "appId": "xxxxxxxxxxxxxxxxxxxxxxx",
  "deviceId": "DEVICE001",
  "id": "req-004"
}
```

**成功响应示例：**

```json
{
  "result": 0,
  "url": "/delete",
  "message": "Success",
  "data": null,
  "id": "req-004"
}
```

---

### 2.4 托管删除设备
在托管模式下删除设备。接口逻辑与删除设备相同，调用相同的后端服务。

**接口地址：** `POST /cloudweb/openapi/v1/device/managed/delete`

**请求参数（除公共字段外）：**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| deviceId | string | 是 | - | 待删除的设备唯一标识 (DUID) |
| id | string | 否 | `"0"` | 请求标识，响应中原样返回 |


**响应 data：** `null`

**请求示例：**

```json
{
  "token": "At_a1b2c3d4e5f6...",
  "appId": "xxxxxxxxxxxxxxxxxxxxxxx",
  "deviceId": "DEVICE001",
  "id": "req-005"
}
```

**成功响应示例：**

```json
{
  "result": 0,
  "url": "/managed/delete",
  "message": "Success",
  "data": null,
  "id": "req-005"
}
```

---

## 附录：接口总览
| 序号 | 接口 | 路径 | 认证 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | 获取访问令牌 | `POST /cloudweb/openapi/v1/user/token` | 无需 | 通过应用签名换取访问令牌 |
| 2 | 获取设备列表 | `POST /cloudweb/openapi/v1/device/list` | token + appId | 分页获取设备列表，支持按设备 ID 过滤 |
| 3 | 添加设备 | `POST /cloudweb/openapi/v1/device/add` | token + appId | 绑定设备到当前账号 |
| 4 | 删除设备 | `POST /cloudweb/openapi/v1/device/delete` | token + appId | 从当前账号删除设备 |
| 5 | 托管删除设备 | `POST /cloudweb/openapi/v1/device/managed/delete` | token + appId | 托管模式下删除设备 |


## 附录：典型调用流程
```plain
1. 客户端                          2. 服务端
   │                                  │
   ├── POST /user/token ─────────────►│  获取 accessToken
   │◄──── { accessToken, expireTime } │
   │                                  │
   ├── POST /device/list ────────────►│  查询设备列表
   │◄──── { deviceInfoList, ... }     │
   │                                  │
   ├── POST /device/add ─────────────►│  绑定设备
   │◄──── { result: 0 }              │
   │                                  │
   ├── POST /device/delete ──────────►│  删除设备
   │◄──── { result: 0 }              │
```

