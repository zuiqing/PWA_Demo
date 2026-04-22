# Integration Process
1. Developers apply for api_key_id and api_key_secret from QV
2. Call QV Open Platform API Interface

![](image/img_1.svg)

# Document Overview
## API Interface Usage
### 1.1 HTTP Request
Set Authorization in http header

![](image/img_2.png)

Send request, receive response

![](image/img_3.png)

1.2 http request authorization address, in the form of: ip+port.

![](image/img_4.png)

### 2.1 RTSP Streaming
Set Authorization in http header

![](image/img_5.png)

Send request, receive response

![](image/img_6.png)

2.1 Use ffplay to pull rtsp protocol stream from authorization address.

![](image/img_7.png)

## Glossary
**<font style="color:rgba(0, 0, 0, 0.85);">Open Platform</font>**

<font style="color:rgb(51, 51, 51);">Encapsulating services into a series of computer-recognizable data interfaces and opening them for third-party use. The interfaces opened externally are called Open APIs, and the platform providing these Open APIs is referred to as an Open Platform.</font>



**<font style="color:rgb(51, 51, 51);">Developer</font>**

<font style="color:rgb(51, 51, 51);">Individuals or teams with independent development capabilities.</font>



**<font style="color:rgb(51, 51, 51);">Authorization Address</font>**

<font style="color:rgb(51, 51, 51);">It can be simply understood as the address authorized by the platform, which can be used for device playback, device configuration, device operation, and device recording.</font>

## FAQ
# Protocol Description
## HTTP
The Hypertext Transfer Protocol (HTTP) is a simple request-response protocol that typically runs over TCP. It specifies what messages clients may send to servers and what responses they receive. The headers of request and response messages are given in ASCII form; the message content has a MIME-like format. HTTP is an application layer protocol for distributed, collaborative, hypermedia information systems and is the foundation of data communication for the World Wide Web (WWW).

## RTSP
Real Time Streaming Protocol (RTSP) is an application layer protocol in the TCP/IP protocol suite, submitted as an IETF RFC standard by Columbia University, Netscape, and RealNetworks. This protocol defines how one-to-many applications effectively transmit multimedia data over IP networks. Architecturally, RTSP sits on top of RTP and RTCP and uses TCP or UDP for data transmission. Compared to HTTP, where requests are issued by the client and the server responds, RTSP allows both the client and server to issue requests, meaning RTSP can be bidirectional.

# API
## Authentication
### Get Authorization Address
Protocol: HTTP

method: POST

hostname: [https://api.qvcloud.net](https://api.qvcloud.net)

uri: /dev_exe_cmd

header:

| Key | Content Format | Value |
| --- | --- | --- |
| Authorization | ApiKey : | ApiKey bbbbbbbb:aaaa |


**Request:**

```json
{
    "header": {
        "flag": "tdkcloud",
        "version": "v1.1",
        "command": "proxy-dev-port",
        "client": {
            "id": "test",
            "type": "server",
            "oem": "A0000"
        }
    },
    "content": {
        "port": "80",
        "devid": "tdks98kgy2ux"
    }
}
```

| Parameter | Type | Description |
| --- | --- | --- |
| port | string | Device Target Port |
| devid | string | Device ID |


**Response:**

Success:

```json
{
    "code": 0,
    "timestamp": 1748249524,
    "path": "/dev_exe_cmd",
    "msg": "success",
    "data": {
        "remote_addr": "51.81.203.163:30855"
    },
    "errTip": ""
}
```

| Parameter | Type | Description |
| --- | --- | --- |
| code | int | Processing result 0: Success |
| remote_addr | string | Target Address |


Failed:

```json
{
    "code": 2,
    "msg": "Request parameter error",
    "data": null,
    "timestamp": 1644562987260,
    "errTip": null,
    "path": "/dev_exe_cmd"
}
```

```json
{
  "code": 3,
  "timestamp": 1748249508,
  "path": "/dev_exe_cmd",
  "msg": "failed",
  "errTip": "Retry limit reached"
}
```

```json
{
    "code": 4,
    "timestamp": 1748249508,
    "path": "/dev_exe_cmd",
    "msg": "failed",
    "errTip": "device offline"
}
```

```json
{
  "code": 5,
  "timestamp": 1748916274,
  "path": "/dev_exe_cmd",
  "msg": "failed",
  "errTip": "Allow requests to ports 80,554"
}
```

### Case: Monitoring with Device Local Account
#### Device local account username and password correct
rtsp://admin:admin@47.101.46.216:12070/mode=real&idc=1&ids=1

![](image/img_8.png)

![](image/img_9.png)

#### Device local account username correct, password incorrect
![](image/img_10.png)

### Case: Calling CGI Command with Device Local Account
#### Interface Function
#### Request Address
Address: [https://188.68.216.126:12060/tdkcgi](https://188.68.216.126:12060/tdkcgi)

#### Request Method
POST

#### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


#### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


#### Request Data
##### Device local account username and password correct
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.product.time</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Device local account username correct, password incorrect
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.product.time</command>

        <content>
        </content>

    </body>

</envelope>

```

#### Response Data
##### Success Response
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <time>
                <timezone>gmt+08:00</timezone>

                <datatime>2026-01-15t17:45:13z</datatime>

            </time>

        </content>

    </body>

</envelope>

```

##### Error Response
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>401</error>

        <content></content>

    </body>

</envelope>

```

#### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


#### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


## Playback Interface
### Device Monitoring
Protocol: RTSP

url：rtsp://username:passwd@ip:port/stream?mode=real&idc=1&ids=1

| Parameter | Type | Description |
| --- | --- | --- |
| username | string | Username |
| passwd | string | Password |
| ip:port | string | Mapped Address |
| mode=real | string | real: Real-time monitoring |
| idc=1 | int | Channel Number |
| ids=1 | int | Stream ID |


### Device Playback by Time
Protocol: RTSP

url：rtsp://username:passwd@ip:port/mode=file&type=rec&idc=1&ids=1&starttime=20250922T000000Z&endtime=20250922T000020Z

| Parameter | Type | Description |
| --- | --- | --- |
| username | string | Username |
| passwd | string | Password |
| ip:port | string | Mapped Address |
| mode=file | string | file: Recording playback |
| type=rec | string | rec: Recording playback |
| idc=1 | int | Channel Number |
| ids=1 | int | Stream ID |
| starttime | string | Start Time |
| endtime | string | End Time |


## Device Recording
### Remote Playback Search (Video/Image)
#### Get File Search Session
##### Interface Function
Obtain the search session for remote playback files, used for subsequently retrieving the specific file list.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Security authentication method, fixed as username |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command word, fixed as get.record.session |
| filetype | string | Y | File type (video/picture/all) |
| occurtype | string | Y | File Occurrence Type |
| stream | string | Y | Stream type (main/sub/all) |
| channel | string | Y | Channel ID, separated by commas for multiple channels |
| starttime | string | Y | Search start time |
| endtime | string | Y | Search end time |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password/>
    </header>

    <body>
        <command>get.record.session</command>

        <content>
            <record>
                <filetype>video</filetype>

                <occurtype>all</occurtype>

                <stream>all</stream>

                <channel>1,2,3,4,5,6,7,8</channel>

                <starttime>2018-05-09t00:00:00z</starttime>

                <endtime>2018-05-09t23:59:59z</endtime>

            </record>

        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <record>
                <id>1</id>

            </record>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success, 101 indicates recording file is being generated |
| id | int | Search session ID |


##### Return Codes
| Error Code | Description |
| --- | --- |
| 0 | Success |
| 101 | Recording file generation in progress |


#### Get Playback File List
##### Interface Function
Retrieve specific playback file list information based on the search session ID.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Security authentication method, fixed as username |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command word, fixed as get.record.message |
| id | int | Y | Search session ID |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password/>
    </header>

    <body>
        <command>get.record.message</command>

        <content>
            <record>
                <id>1</id>

            </record>

        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <record>
                <datalist>
                    <data>
                        <filetype>video</filetype>

                        <occurtype>event</occurtype>

                        <channel>1</channel>

                        <starttime>2018-05-09t13:00:00z</starttime>

                        <endtime>2018-05-09t14:00:00z</endtime>

                        <filename>00_2018-05-09-13-00-00_2018-05-09-14-00-00_01_06_44761104_683_00_01_52692
                        </filename>

                        <codetype>H.264</codetype>

                        <filesize>52692</filesize>

                        <describe>OSDAQMDAgUBDxL---8AAAAAAAAAAAAAAAAAQ0FNIDE=</describe>

                        <address>
                            <idf>16</idf>

                            <ids>1</ids>

                            <idc>1</idc>

                            <idb>683</idb>

                            <idp>6</idp>

                            <idd>1</idd>

                            <idx>1</idx>

                        </address>

                    </data>

                                               ...
                    <data></data>

                </datalist>

                <page>0</page>

            </record>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |
| datalist | array | File list data |
| data.filetype | string | File type (video/picture) |
| data.occurtype | string | File Occurrence Type |
| data.channel | int | Channel Number |
| data.starttime | string | File start time |
| data.endtime | string | File end time |
| data.filename | string | File Name |
| data.codetype | string | Encoding type |
| data.filesize | int | File size |
| data.describe | string | File description |
| data.address | object | File address information |
| page | int | Pagination information |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Remote Alarm Playback Search
##### Interface Function
Search for remote playback files based on alarm conditions, supporting precise search by alarm type and alarm ID.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Security authentication method, fixed as username |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command word, fixed as get.record.alarmrecord |
| channel | int | Y | Channel Number |
| filetype | string | Y | File type (video/picture/all) |
| occurtype | string | Y | File Occurrence Type |
| stream | string | Y | Stream type (main/sub/all) |
| timestamp | string | Y | Search timestamp |
| alarmtype | int | N | Alarm Type |
| alarmid | int | N | Alarm ID |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password/>
    </header>

    <body>
        <command>get.record.alarmrecord</command>

        <content>
            <record>
                <channel>1</channel>

                <filetype>video</filetype>

                <occurtype>all</occurtype>

                <stream>main</stream>

                <timestamp>2019-11-01t11:55:25z</timestamp>

                <alarmtype>2</alarmtype>

                <alarmid>123456</alarmid>

            </record>

        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <record>
                <datalist>
                    <data>
                        <filetype>video</filetype>

                        <occurtype>event</occurtype>

                        <channel>1</channel>

                        <starttime>2019-11-01t11:55:25z</starttime>

                        <endtime>2019-11-01t11:56:26z</endtime>

                        <filename>00_2019-11-01-11-55-25_2019-11-01-11-56-26_00_02_0041_00_01_02_4096</filename>

                        <codetype>H.264</codetype>

                        <filesize>4096</filesize>

                        <describe>OSDAQMDAgUBDxL---8AAAAAAAAAAAAAAAAAQ0FNIDE=</describe>

                        <address>
                            <idf>41</idf>

                            <ids>0</ids>

                            <idc>0</idc>

                            <idb>0</idb>

                            <idp>2</idp>

                            <idd>0</idd>

                            <idx>1</idx>

                        </address>

                    </data>

                </datalist>

                <page>0</page>

            </record>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |
| datalist | array | Alarm file list data |
| data.filetype | string | File type |
| data.occurtype | string | File Occurrence Type |
| data.channel | int | Channel Number |
| data.starttime | string | File start time |
| data.endtime | string | File end time |
| data.filename | string | File Name |
| data.codetype | string | Encoding type |
| data.filesize | int | File size |
| data.describe | string | File description |
| data.address | object | File address information |
| page | int | Pagination information |


##### Return Codes
| Error Code | Description |
| --- | --- |
| 0 | Success |
| -1 | Failed |


### Recording Schedule
#### Get Recording Schedule
##### Interface Function
Get device recording schedule configuration.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Username |
| password | string | Yes | Password |
| passwordencode | int | No | Password Encryption Mode |
| command | string | Yes | Command word, fixed as get.record.schedule |
| content | object | Yes | Content, empty |


##### Request Data
```json
{
  "header": {
    "security": "username",
    "username": "adminapp2",
    "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
    "passwordencode": 1
  },
  "body": {
    "command": "get.record.schedule",
    "content": {
    }
  }
}
```

##### Response Data
```json
{
  "body": {
    "error": 0,
    "content": {
      "schedule": [
        {
          "week": "sunday",
          "time": [
            {
              "section": "time1",
              "enabled": 1,
              "start": "00:00:00",
              "end": "23:59:59"
            }
          ]
        }
      ]
    }
  }
}
```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |
| schedule | array | Recording schedule array, containing time slot configurations for each week |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Set Recording Schedule
##### Interface Function
Set device recording schedule configuration.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Username |
| password | string | Yes | Password |
| passwordencode | int | No | Password Encryption Mode |
| command | string | Yes | Command word, fixed as set.record.schedule |
| content | object | Yes | Content |
| schedule | array | Yes | Recording schedule array |


##### Request Data
```json
{
  "header": {
    "security": "username",
    "username": "adminapp2",
    "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
    "passwordencode": 1
  },
  "body": {
    "command": "set.record.schedule",
    "content": {
      "schedule": [
        {
          "week": "sunday",
          "time": [
            {
              "section": "time1",
              "enabled": 1,
              "start": "00:00:00",
              "end": "23:59:59"
            }
          ]
        }
      ]
    }
  }
}
```

##### Response Data
```json
{
  "body": {
    "error": 0
  }
}
```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Get Recording Configuration
#### Get Recording Configuration
##### Interface Function
Get record config information.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.record.config</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <channel>
                <id>1</id>

                <recordconfig>
                    <recordstream>main</recordstream>

                    <prerecord>5</prerecord>

                    <redundancy>false</redundancy>

                    <packetlength>60</packetlength>

                    <recordcontrol>schedule</recordcontrol>

                    <schedule>
                        <sunday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </sunday>

                        <monday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </monday>

                        <tuesday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </tuesday>

                        <wednesday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </wednesday>

                        <thursday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </thursday>

                        <friday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </friday>

                        <saturday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type></type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </saturday>

                    </schedule>

                </recordconfig>

            </channel>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| channel | object | Channel |
| channel.id | int | Channel ID |
| channel.recordconfig | object | Recording Configuration |
| recordconfig.recordstream | string | Stream |
| recordconfig.prerecord | int | Pre-record time |
| recordconfig.redundancy | string | Redundancy Switch |
| recordconfig.packetlength | int | Packet Length |
| recordconfig.recordcontrol | string | Control Mode |
| recordconfig.schedule | object | Schedule |
| recordconfig.sunday~saturday | object | Week Information |
| sunday.time1~6 | object | Time Slot |
| time1.type | string | Record Type |
| time1.start | string | Start Time |
| time1.end | string | End Time |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Set Recording Configuration
##### Interface Function
Set recording configuration.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |
| channel | object | Y | Channel |
| channel.id | int | Y | Channel ID |
| channel.recordconfig | object | Y | Recording Configuration |
| recordconfig.recordstream | string | Y | Stream |
| recordconfig.prerecord | int | Y | Pre-record time |
| recordconfig.redundancy | string | Y | Redundancy switch |
| recordconfig.packetlength | int | Y | Packet length |
| recordconfig.recordcontrol | string | Y | Control mode |
| recordconfig.schedule | object | Y | Schedule |
| recordconfig.sunday~saturday | object | Y | Week Information |
| sunday.time1~6 | object | Y | Time slot |
| time1.type | string | Y | Recording mode |
| time1.start | string | Y | Start Time |
| time1.end | string | Y | End Time |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>set.record.config</command>

        <content>
            <channel>
                <id>1</id>

                <recordconfig>
                    <recordstream>main</recordstream>

                    <prerecord>5</prerecord>

                    <redundancy>false</redundancy>

                    <packetlength>60</packetlength>

                    <recordcontrol>schedule</recordcontrol>

                    <schedule>
                        <sunday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </sunday>

                        <monday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </monday>

                        <tuesday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </tuesday>

                        <wednesday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </wednesday>

                        <thursday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </thursday>

                        <friday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </friday>

                        <saturday>
                            <time1>
                                <type>md,alarm</type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time1>

                            <time2>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time2>

                            <time3>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time3>

                            <time4>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time4>

                            <time5>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time5>

                            <time6>
                                <type>
                                </type>

                                <start>00:00:00</start>

                                <end>23:59:59</end>

                            </time6>

                        </saturday>

                    </schedule>

                </recordconfig>

            </channel>

        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content></content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


## Device Alarm
### Alarm Details
#### Get Alarm Details
##### Interface Function
This command is used to get alarm details.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |
| alarmtype | int | N | Alarm type, values: 2-Motion Detection, 21-Crying Detection, 23-Humanoid Detection |
| channelid | int | N | Channel ID, values: |


##### Request Data
```json
{
    "header": {
        "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
        "passwordencode": 0,
        "security": "username",
        "username": "adminapp2"
    },
    "body": {
        "command": "get.alarm.detailInfo",
        "content": {
            "alarmtype": 2,
            "channelid": 1
        }
    }
}
```

##### Response Data
```json
{
    "body": {
        "error": 0,
        "content": {
            "alarmtype": 2,
            "config": {
                "channel": {
                    "id": 1,
                    "only_track": 0,
                    "enabled": 1,
                    "sensitivity": 3,
                    "max_sensitivity": 6,
                    "whistle_enabled": 0,
                    "alarmlight_enabled": 0,
                    "pet_tracking_enabled": -1,
                    "interval": {
                        "value": 300,
                        "range": [
                            60,
                            120,
                            180,
                            240,
                            300,
                            360,
                            420,
                            480,
                            540,
                            600,
                            660,
                            720,
                            780,
                            840,
                            900,
                            960,
                            1020,
                            1080,
                            1140,
                            1200,
                            1260,
                            1320,
                            1380,
                            1440,
                            1500,
                            1560,
                            1620,
                            1680,
                            1740,
                            1800
                        ]
                    },
                    "schedule_mode": "all-day",
                    "schedule": [
                        {
                            "week": "sunday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "monday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "tuesday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "wednesday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "thursday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "friday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "saturday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        }
                    ],
                    "region": {
                        "rownum": 18,
                        "colnum": 22,
                        "datalist": [
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            }
                        ]
                    },
                    "smart_filter": {
                        "peds": 1
                    }
                }
            }
        }
    }
}
```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| alarmtype | int | Alarm Type, values: 2-Motion Detection, 21-Crying Detection, 23-Human Detection |
| config | object | Configuration Info |
| channel | object | Channel Config |
| channel.id | int | Channel ID |
| channel.enabled | int | Whether to enable, values: 0-Disable, 1-Enable |
| channel.only_track |  |  |
| channel.sensitivity | int | Sensitivity |
| channel.max_sensitivity | int | Max sensitivity, values: -1 Default, 0 Not supported, Other: Current value |
| channel.whistle_enabled | int | Linkage sound, values: -1 Not supported |
| channel.alarmlight_enabled | int | Linkage Alarm Light, values: -1 Not Supported |
| channel.record_enabled | int | Linkage recording, values: -1 Not supported |
| channel.move_enabled | int | Motion tracking enabled, |
| channel.record_latch | int | Recording delay after alarm ends, values: -1: Not supported |
| channel.pet_tracking_enabled | int | Pet tracking status enabled |
| interval | object | Alarm Interval |
| interval.value | int | Interval Value |
| interval.range | list | Value Range |
| levellist |  |  |
| smart_filter | object | Smart Filter |
| smart_filter.peds | uint | Humanoid filtering |
| smart_filter.vehc | int | Vehicle Filter |
| smart_filter.pet | int | Pet Filter |
| smart_filter.bike | int | Bicycle filtering |
| schedule_mode | string | Schedule mode, values: all-day, daytime, night, custom |
| schedule | list | Time schedule, supports 7 days, 6 periods per day |
| schedule.week | string |  |
| schedule.time | list |  |
| time.section | string |  |
| time.enabled | int |  |
| time.start | string |  |
| time.end | string |  |
| region | object | Motion Detection Region |
| region.rownum | int |  |
| region.colnum | int |  |
| region.datalist | list |  |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Set Alarm Details
##### Interface Function
This command is used to set alarm details.

##### Request Address
http://${remote_addr}/tdkcgi

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |
| alarmtype | int | Y | Alarm Type, values: 2-Motion Detection, 21-Crying Detection Alarm, 23-Human Detection Alarm |
| config | object | Y | Configuration Info |
| channel | object | Y | Channel Config |
| channel.id | int | Y | Channel ID |
| channel.enabled | int | Y | Enabled status, values: 0-Disable, 1-Enable |
| channel.only_track |  |  |  |
| channel.sensitivity | int |  | Sensitivity |
| channel.max_sensitivity | int |  | Max sensitivity, values: -1 Use default, 0 Not supported, Other: Current value |
| channel.whistle_enabled | int |  | Linkage sound, values: -1 Not supported |
| channel.alarmlight_enabled | int |  | Linkage Alarm Light, values: -1 Not supported |
| channel.record_enabled | int |  | Linkage recording, values: -1 Not supported |
| channel.move_enabled | int |  | Motion Tracking Enabled, |
| channel.record_latch | int |  | Record latch after alarm ends, values: -1 Not supported |
| channel.pet_tracking_enabled | int |  | Whether pet tracking is enabled |
| interval | object |  | Alarm Interval |
| interval.value | int |  | Interval Value |
| interval.range | list |  | Value Range |
| levellist |  |  |  |
| smart_filter | object |  | Smart Filter |
| smart_filter.peds | uint |  | Humanoid Filtering |
| smart_filter.vehc | int |  | Vehicle Filter |
| smart_filter.pet | int |  | Pet Filtering |
| smart_filter.bike | int |  | Bike Filter |
| schedule_mode | string |  | Schedule Mode, values: all-day, daytime, night, custom |
| schedule | list |  | Time schedule, supports 7 days, 6 periods per day |
| schedule.week | string |  |  |
| schedule.time | list |  |  |
| time.section | string |  |  |
| time.enabled | int |  |  |
| time.start | string |  |  |
| time.end | string |  |  |
| region | object |  | Motion Detection Region |
| region.rownum | int |  |  |
| region.colnum | int |  |  |
| region.datalist | list |  |  |


##### Request Data
```json
{
    "header": {
        "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
        "passwordencode": 0,
        "security": "username",
        "username": "adminapp2"
    },
    "body": {
        "command": "set.alarm.detailInfo",
        "content": {
            "alarmtype": 2,
            "config": {
                "channel": {
                    "id": 1,
                    "only_track": 0,
                    "enabled": 1,
                    "sensitivity": 3,
                    "max_sensitivity": 6,
                    "whistle_enabled": 0,
                    "alarmlight_enabled": 0,
                    "pet_tracking_enabled": -1,
                    "interval": {
                        "value": 300,
                        "range": [
                            60,
                            120,
                            180,
                            240,
                            300,
                            360,
                            420,
                            480,
                            540,
                            600,
                            660,
                            720,
                            780,
                            840,
                            900,
                            960,
                            1020,
                            1080,
                            1140,
                            1200,
                            1260,
                            1320,
                            1380,
                            1440,
                            1500,
                            1560,
                            1620,
                            1680,
                            1740,
                            1800
                        ]
                    },
                    "schedule_mode": "all-day",
                    "schedule": [
                        {
                            "week": "sunday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "monday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "tuesday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "wednesday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "thursday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "friday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        },
                        {
                            "week": "saturday",
                            "time": [
                                {
                                    "section": "time1",
                                    "enabled": 1,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time2",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time3",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time4",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time5",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                },
                                {
                                    "section": "time6",
                                    "enabled": 0,
                                    "start": "00:00:00",
                                    "end": "23:59:59"
                                }
                            ]
                        }
                    ],
                    "region": {
                        "rownum": 18,
                        "colnum": 22,
                        "datalist": [
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            },
                            {
                                "data": "1111111111111111111111"
                            }
                        ]
                    },
                    "smart_filter": {
                        "peds": 1
                    }
                }
            }
        }
    }
}
```

##### Response Data
```json
{
  "body": {
    "error": 0,
    "content": {}
  }
}
```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


## Basic Functions
### Device Status
##### Interface Function
This command is used to get the current status of the device, and the response information includes all basic information such as system, network, and alarm.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
  <header>
    <security>username</security>

    <username>adminapp2</username>

    <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

  </header>

  <body>
    <command>get.device.status</command>

    <content></content>

  </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
  <body>
    <error>0</error>

    <content>
      <mirror>
        <value>up_down</value>

      </mirror>

      <vionoff>
        <value>video_off</value>

      </vionoff>

      <humandetection>
        <enabled>true</enabled>

        <whistle_enabled>false</whistle_enabled>

        <alarmlight_enabled>false</alarmlight_enabled>

      </humandetection>

      <humantrace>
        <enabled>false</enabled>

      </humantrace>

      <tfcard>
        <formatting>false</formatting>

        <datalist>
          <data>
            <exist>true</exist>

            <diskid>1</diskid>

            <status>normal</status>

            <total>7553</total>

            <free>2688</free>

          </data>

        </datalist>

        <totalsum>7553</totalsum>

        <freesum>2688</freesum>

      </tfcard>

      <wifiinfo>
        <mode>sta</mode>

        <ssid>server-192</ssid>

        <rssi>-38</rssi>

      </wifiinfo>

      <network>
        <idhcp>true</idhcp>

        <address>192.168.3.14</address>

        <submask>255.255.255.0</submask>

        <gateway>192.168.3.1</gateway>

        <dns>172.16.10.9</dns>

        <secondarydns>202.96.209.133</secondarydns>

        <httpport>80</httpport>

        <httpsport>443</httpsport>

      </network>

      <info>
        <mac>00:04:56:ab:ce:e2</mac>

        <version>V500.R005.F704.01.A0000.B017</version>

        <releasedate>2025-10-28t14:23:39z</releasedate>

        <model>IOT733263</model>

      </info>

      <time>
        <timezone>gmt+08:00</timezone>

        <datatime>2026-01-07t16:55:44z</datatime>

      </time>

      <channel>
        <id>1</id>

        <motiondetection>
          <enabled>true</enabled>

          <whistle_enabled>false</whistle_enabled>

          <alarmlight_enabled>false</alarmlight_enabled>

          <sensitivity>3</sensitivity>

          <range>1,6</range>

        </motiondetection>

        <recordconfig>
          <recordstream>main</recordstream>

          <prerecord>5</prerecord>

          <redundancy>false</redundancy>

          <packetlength>60</packetlength>

          <recordcontrol>schedule</recordcontrol>

          <schedule>
            <sunday>
              <time1>
                <type>md,alarm</type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time1>

              <time2>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time2>

              <time3>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time3>

              <time4>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time4>

              <time5>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time5>

              <time6>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time6>

            </sunday>

            <monday>
              <time1>
                <type>md,alarm</type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time1>

              <time2>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time2>

              <time3>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time3>

              <time4>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time4>

              <time5>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time5>

              <time6>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time6>

            </monday>

            <tuesday>
              <time1>
                <type>md,alarm</type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time1>

              <time2>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time2>

              <time3>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time3>

              <time4>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time4>

              <time5>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time5>

              <time6>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time6>

            </tuesday>

            <wednesday>
              <time1>
                <type>md,alarm</type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time1>

              <time2>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time2>

              <time3>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time3>

              <time4>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time4>

              <time5>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time5>

              <time6>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time6>

            </wednesday>

            <thursday>
              <time1>
                <type>md,alarm</type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time1>

              <time2>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time2>

              <time3>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time3>

              <time4>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time4>

              <time5>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time5>

              <time6>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time6>

            </thursday>

            <friday>
              <time1>
                <type>md,alarm</type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time1>

              <time2>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time2>

              <time3>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time3>

              <time4>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time4>

              <time5>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time5>

              <time6>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time6>

            </friday>

            <saturday>
              <time1>
                <type>md,alarm</type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time1>

              <time2>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time2>

              <time3>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time3>

              <time4>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time4>

              <time5>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time5>

              <time6>
                <type></type>

                <start>00:00:00</start>

                <end>23:59:59</end>

              </time6>

            </saturday>

          </schedule>

        </recordconfig>

      </channel>

      <upgradestatus>1</upgradestatus>

      <devability>ASDvf9DhGCAAAAgAEgACAAAAAAACAAAAAAAAAAAAAAA=</devability>

      <key>xMlpW9H64Dfy722Q62I0C7spBczJWlQ2</key>

      <tdc>YshWsiHlUouZzzSCTHXWj1J9YbhGeV2YauKSAmlH5VawqWRGo+FIuwILS3jMQDzn9as+7p39FKhPxOHMTYCq028KS8ZENmkTH5ihCaLEM0TbxeM3E3Jbk8iBQkZF5icrkgRDkEnraFdIA5tas2N8Hg==</tdc>

      <synctime>2026-01-13 09:54:46</synctime>

      <IRMode>
        <mode>auto</mode>

      </IRMode>

      <ledstatus>
        <value>led_on</value>

      </ledstatus>

      <devicestatus>
        <volume>true</volume>

        <humandete>true</humandete>

        <detetioninfo>true</detetioninfo>

        <smd_peds>true</smd_peds>

        <smd_vehc>false</smd_vehc>

        <calling>false</calling>

        <lockstatus>false</lockstatus>

        <babysitter>false</babysitter>

        <summertimeconfig>true</summertimeconfig>

        <hdr>true</hdr>

        <privacymode>false</privacymode>

        <iotcalling>false</iotcalling>

        <nightvision>false</nightvision>

        <audiocodec>true</audiocodec>

        <networkmode>
          <supportmode>0</supportmode>

          <currentmode>0</currentmode>

        </networkmode>

        <needAesPwd>false</needAesPwd>

        <pettracking>false</pettracking>

      </devicestatus>

    </content>

  </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| mirror | object | Image Flip |
| mirror.value | string | Image flip, values: close-No flip, up_down-Flip vertically |
| vionoff | object | Video Switch |
| vionoff.value | string | Video switch, values: video_on-Video On, video_off-Video Off |
| humandetection | object | Human Detection |
| humandetection.enabled | string | Human detection switch, values: true-On, false-Off |
| humandetection.whistle_enabled | string | Ring linkage, values: true-On, false-Off |
| humandetection.alarmlight_enabled | string | Light linkage, values: true-On, false-Off |
| humantrace | object | Human Tracking Switch |
| humantrace.enabled | string | Human tracking switch, values: true-On, false-Off |
| movedetection | object | Motion Tracking Switch |
| movedetection.enabled | string | Motion tracking switch, values: true-On, false-Off |
| crydetection | object | Crying Detection Switch |
| crydetection.enabled | string | Crying detection switch: true-On, false-Off |
| crydetection.sensitivity | int | Crying detection sensitivity |
| tfcard | object | TF Card Information |
| tfcard.formatting | string | Whether TF card is formatting, values: true-Yes, false-No |
| tfcark.datalist | list | TF Card List Information |
| datalist.data | object | TF Card Information |
| data.exist | string | Whether TF card exists, true-Exists, false-Not Exists |
| data.diskid | string | TF Card ID |
| data.status | string | Status, values: notformatted-Unformatted, normal-Normal, nodisk-No Disk |
| data.total | int | Total space, unit: MB |
| data.free | int | Free space, unit: MB |
| tfcark.totalsum | int | Total storage space, unit: MB |
| tfcark.freesum | int | Total free storage space, unit: MB |
| wifiinfo | object | WiFi Status Information |
| wifiinfo.mode | string | WiFi status, values: |
| wifiinfo.ssid | string | WiFi SSID |
| wifiinfo.rssi | int | Signal strength, unit: Signal Strength (dBm) |
| info | object | Device Information |
| info.mac | string | MAC Address |
| info.version | string | Device Version Name |
| info.releasedate | string | Device Version Release Date |
| info.model | string | Device Model |
| time | object | Device Time Information |
| time.timezone | string | Device Timezone |
| time.datatime | string | Device Current Time |
| channel | object | Channel Information |
| channel.id | int | Channel Number |
| channel.enabled | string | Motion detection switch, values: true-On, false-Off |
| channel.whistle_enabled | string | Motion detection ring linkage, values: true-On, false-Off |
| channel.alarmlight_enabled | string | Motion detection light linkage, values: true-On, false-Off |
| channel.sensitivity | uint | Current Sensitivity |
| channel.range | string | Sensitivity range, e.g., 1,6 |
| channel.motiondetection | object | Motion detection configuration under channel |
| motiondetection.enabled | string | Motion detection switch, values: true-On, false-Off |
| motiondetection.whistle_enabled | string | Motion detection ring linkage, values: true-On, false-Off |
| motiondetection.alarmlight_enabled | string | Motion detection light linkage, values: true-On, false-Off |
| motiondetection.sensitivity | int | Current sensitivity, values: |
| motiondetection.range | string | Sensitivity range, values: |
| channel.recordconfig | object |  |
| recordconfig.recordstream | string |  |
| recordconfig.prerecord | int |  |
| recordconfig.redundancy | string |  |
| recordconfig.packetlength | uint |  |
| recordconfig.recordcontrol | string |  |
| recordcontrol.schedule | object |  |
| schedule.sunday | object |  |
| sunday.time1 | object |  |
| time1.type | string |  |
| time1.start | string |  |
| time1.end | string |  |
| schedule.monday | object |  |
| schedule.tuesday | object |  |
| schedule.wednesday | object |  |
| schedule.thursday | object |  |
| schedule.friday | object |  |
| schedule.saturday | object |  |
| upgradestatus | int | Cloud upgrade status, values: 1-Querying, 2-Downloading, 3-Network Error, 4-New Version Available, 5-Latest Version, 6-Other Error, 7-Download Completed, 8-Download Failed |
| version | string | Device new version name |
| releasetime | string | Device new version release time |
| devability | string | Device Capability Set |
| key | string | Private protocol encryption/decryption key |
| tdc | string | All protocols dynamic password |
| synctime | string | Next update time for encryption/decryption key and dynamic password |
| IRMode | object | Device IR Light Status Information |
| IRMode.mode | string | Device IR light status, values: |
| ledstatus | object | Device LED Switch Information |
| ledstatus.value | string | Device LED switch, values: |
| fps | double | Device Frame Rate |
| fpsmode | int | Device frame rate mode, values: |
| network | object | Network Information |
| network.idhcp | string | Whether it is DHCP mode, values: true-Yes, false-No |
| network.address | string | Device IP Address |
| network.submask | string | Subnet Mask |
| network.gateway | string | Gateway |
| network.httpport | int | CGI HTTP Port |
| network.httspport | int | CGI HTTPS Port |
| network.dns | string |  |
| network.secondarydns | string |  |
| devicestatus | object | Device Status |
| devicestatus.volume | string | Whether device volume setting is supported, including call ring volume and call volume, values: true-Supported, false-Not Supported |
| devicestatus.humandete | string | Deprecated, unused |
| devicestatus.deletioninfo | string | Deprecated, unused |
| devicestatus.calling | string | Whether call alarm setting is supported, values: |
| devicestatus.lockstatus | string | Whether unlock time setting is supported, values: |
| devicestatus.smd_peds | string | Whether motion detection - human filtering is supported, values: |
| devicestatus.smd_vehc | string | Whether motion detection - vehicle filtering is supported, values: |
| devicestatus.babysitter | string | Whether babysitter function is supported, values: |
| devicestatus.thirdpartypush | string |  |
| devicestatus.summertimeconfig | string |  |
| devicestatus.enhanceptzrange | string | Whether enhanced PTZ range is supported, values: |
| devicestatus.hdr | string | Whether WDR/Digital WDR is supported, values: |
| devicestatus.tfcard | string | VDP device supports TF card status display and formatting, values: |
| devicestatus.ns_vionoff | string | Video switch not supported, values: true-Not Supported, false-Supported, missing means Not Supported |
| devicestatus.privacymode | string | Whether privacy mode is supported, values: true-Not Supported, false-Supported, missing means Not Supported |
| devicestatus.needAesPwd | string | Whether AES encryption password is required, values: true-Not Supported, false-Supported, missing means Not Supported |
| devicestatus.iotcalling | string | Whether IOT device supports calling, values: true-Not Supported, false-Supported, missing means Not Supported |
| devicestatus.nightvision | string |  |
| devicestatus.pettracking | string | Whether IOT supports pet tracking, values: true-Not Supported, false-Supported, missing means Not Supported |
| devicestatus.audiocodec | string | Whether to enable audio encoding, values: true-Enable, false-Disable |
| devicestatus.networkmode | object |  |
| networkmode.supportmode | int | Supported network connection types, 1:WiFi, 2:Wired |
| networkmode.currentmode | int | Current network connection type |
| onvifpwd | string | ONVIF password (VDP adds IOT) |
| securitybaseline | string | Security Version Number |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Sub-device Management
#### Get Sub-device Info (Old Protocol)
##### Interface Function
Get all sub-device information mounted under the device (Old Protocol).  
The command words for new and old protocols are the same. If the device supports the old protocol, it responds in 6.1.1 format; if it supports the new protocol, it responds in 6.1.2 format

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Device local username |
| password | string | Yes | Device local user password |
| command | string | Yes | Command word, fixed as get.device.attachInfo |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.device.attachInfo</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <channelinfo>
                <totalnum>25</totalnum>

                <camnum>4</camnum>

                <cctvnum>4</cctvnum>

                <ipgnum>16</ipgnum>

                <managenum>1</managenum>

                <ability>
                    <switchdirectly>1</switchdirectly>

                </ability>

                <channelList>
                    <channel>
                        <type>cam</type>

                        <num>1</num>

                        <name>name</name>

                        <monenable>1</monenable>

                        <talkenable>1</talkenable>

                        <lockinfo>
                            <lock>
                                <num>1</num>

                                <name>name</name>

                                <enable>1</enable>

                            </lock>

                        </lockinfo>

                    </channel>

                </channelList>

            </channelinfo>

            <elevatorinfo>
                <enable>1</enable>

                <elevatorlist>
                    <elevator>
                        <enable>1</enable>

                        <number>1</number>

                    </elevator>

                </elevatorlist>

            </elevatorinfo>

            <alarm>
                <enable>1</enable>

                <mode>1</mode>

                <arming-type>1</arming-type>

                <numbers>4</numbers>

            </alarm>

            <light>
                <enable>1</enable>

                <room>2</room>

                <light>4</light>

            </light>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | Number | Error code, 0 indicates success |
| channelinfo | object | Channel Information |
| elevatorinfo | object | Elevator Information |
| alarm | object | Alarm Information |
| light | object | Light Control Information |


##### Return Codes
| Error Code | Description |
| --- | --- |
| 0 | Success |


#### Get Sub-device Info (New Protocol)
##### Interface Function
Get all sub-device information mounted under the device (New Protocol).  
The command words for new and old protocols are the same. If the device supports the old protocol, it responds in 6.1.1 format; if it supports the new protocol, it responds in 6.1.2 format

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Device local username |
| password | string | Yes | Device local user password |
| command | string | Yes | Command word, fixed as get.device.attachInfo |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.device.attachInfo</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```json
{
    "body": {
        "content": {
            "profile": {
                "chns": {
                    "total": 4,
                    "ability": {
                        "switchdirectly": 1
                    },
                    "catalogs": [{
                        "type": "cam",
                        "total": 2
                    }, {
                        "type": "cctv",
                        "total": 2
                    }]
                },
                "subs": {
                    "total": 3,
                    "catalogs": [{
                        "type": "elevator",
                        "total": 0,
                        "enable": 0
                    }, {
                        "type": "lock",
                        "total": 3,
                        "enable": 1
                    }]
                }
            },
            "sub-devlist": [{
                "code": "CAM1",
                "type": "chn",
                "sub-type": "cam",
                "id": 1,
                "name": "zz",
                "enable": 1,
                "monenable": 1,
                "talkenable": 1,
                "children": [{
                    "code": "Door1"
                }]
            }]
        },
        "error": 0
    }
}
```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | Number | Error code, 0 indicates success |
| profile | object | Device capability set information |
| sub-devlist | array | Sub-device List |


##### Return Codes
| Error Code | Description |
| --- | --- |
| 0 | Success |


#### Modify Sub-device Name
##### Interface Function
Modify sub-device name.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Device local username |
| password | string | Yes | Device local user password |
| command | string | Yes | Command word, fixed as set.subdevice.name |
| subDevList | array | Yes | List of sub-devices to modify |
| subDevList.code | string | Yes | Sub-device unique code |
| subDevList.name | string | Yes | New sub-device name (max 60 bytes) |


##### Request Data
```json
{
    "header": {
        "security": "username",
        "username": "adminapp2",
        "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
        "passwordencode": 1
    },
    "body": {
        "command": "set.subdevice.name",
        "content": {
            "subDevList": [{
                "code": "code1",
                "name": "name1"
            }, {
                "code": "code2",
                "name": "name2"
            }]
        }
    }
}
```

##### Response Data
```json
{
    "body": {
        "error": 0,
        "content": {}
    }
}
```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | Number | Error code, 0 indicates success |


##### Return Codes
| Error Code | Description |
| --- | --- |
| 0 | Success |
| -103 | The set text encoding format is not supported |


### APMode
#### Set AP Mode
##### Interface Function
Set device Wi-Fi connection information to make the device enter the specified AP network.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| command | string | Yes | Command word, fixed as set.wifi.info |
| content | object | Yes | Command Content Object |
| info.ssid | string | Yes | Wi-Fi SSID (Base64 encoded) |
| info.psk | string | Yes | Wi-Fi Password (Base64 encoded) |


##### Request Data
```xml
<body>
  <command>set.wifi.info</command>

  <content>
    <info>
      <ssid>SmlhbmdKdW4=</ssid>

      <psk>dGRrMTIzNDU2</psk>

    </info>

  </content>

</body>

```

##### Response Data
```xml
<envelope>
  <body>
    <error>0</error>

    <content>
      <resetcode>
        <code>dsq097</code>

      </resetcode>

    </content>

  </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |
| resetcode.code | string | Device Reset Code |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| -1 | Execution Failed |


### Stream Encryption Key
#### Stream Encryption Key
##### Interface Function
Get stream encryption key.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.device.streamkey</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <key>9Zi9Rz2tZINo1NmuQNnStTFOo06l63mj</key>

            <tdc>PujqD+dQquUSiqngaIRyAzScCpsYI6dm2jkFXLgol738DwyncLXfmYfnMLqMfEEX1hEtWOhTSlAN8piqhMwomkbn3lDBTJuqM/BMn+1+7PiN+tZt0URd4DzTVbXAEp9wAaGQR1SbB+27yZXPe0e81w==</tdc>

            <synctime>2026-01-13 09:54:46</synctime>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| key | string | Stream Encryption Key |
| tdc | string | token |
| synctime | string | Next automatic key update time |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Device QR Code
#### Get Device QR Code Command
##### Interface Function
Get device QR code information.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.device.qrcode</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <qrcode>{"v":1,"u":"TTksg869uuua","c":"IKEJURAG","m":"IOT733263","a":"IOT733263uuua","d":"a10001"}</qrcode>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| qrcode | string | Device QR Code Information |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Device DST Configuration
#### Get DST Configuration
##### Interface Function
Get device DST configuration status and rules.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Username |
| password | string | Yes | Password |
| nc | string | Yes | Random Number |
| command | string | Yes | Command word, fixed as get.system.summertime |
| content | object | Yes | Content, empty |


##### Request Data
```xml
<envelope>
  <header>
    <security>username</security>

    <username>adminapp2</username>

    <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    <passwordencode>1</passwordencode>

  </header>

  <body>
    <command>get.system.summertime</command>

    <content>
      
    </content>

  </body>

</envelope>

```

##### Response Data
```xml
<body>
    <error>0</error>

    <content>
        <summertime>
            <value>on/off</value>

        </summertime>

    </content>

</body>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |
| summertime | object | DST Configuration |
| value | string | DST status, on: Enabled, off: Disabled |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Set DST Configuration
##### Interface Function
Set device DST configuration.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Username |
| password | string | Yes | Password |


##### Request Data
```xml
<body>
    <command>set.system.summertime</command>

    <content>
        <summertime>
            <value>on/off</value>

        </summertime>

    </content>

</body>

```

##### Response Data
```xml
  <body>
    <content></content>

    <error>0</error>

  </body>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Frame Rate Settings
#### Get Frame Rate Mode
##### Interface Function
Get FPS mode of the corresponding video channel.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Username |
| password | string | Yes | Password |
| passwordencode | int | No | Password Encryption Mode |
| command | string | Yes | Command word, fixed as get.fps.mode |
| content | object | No | Content, empty |


##### Request Data
```json
{
  "header": {
    "security": "username",
    "username": "adminapp2",
    "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
    "passwordencode": 1
  },
  "body": {
    "command": "get.fps.mode"
  }
}
```

##### Response Data
```json
{
  "body": {
    "error": 0,
    "content":{
      "mode": 0
    }
  }
}
```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |
| mode | int | FPS mode of the corresponding video channel. 0: High (20 fps), 1: Medium (10 fps), 2: Low (Audio frame unchanged, video frame only transmits the first I frame). Note: The frame rates corresponding to these modes may differ from the description, this is just an example. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Set Frame Rate Mode
##### Interface Function
Set FPS mode of the corresponding video channel.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Username |
| password | string | Yes | Password |
| passwordencode | int | No | Password Encryption Mode |
| command | string | Yes | Command word, fixed as set.fps.mode |
| content | object | Yes | Content |
| mode | int | Yes | FPS mode of the corresponding video channel. 0: High, 1: Medium, 2: Low |


##### Request Data
```json
{
  "header": {
    "security": "username",
    "username": "adminapp2",
    "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
    "passwordencode": 1
  },
  "body": {
    "command": "set.fps.mode",
    "content": {
      "mode":1
    }
  }
}
```

##### Response Data
```json
{
  "body": {
    "error": 0
  }
}
```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Timezone and Time
#### Get Timezone and Time Command
##### Interface Function
##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.product.time</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <time>
                <timezone>gmt+08:00</timezone>

                <datatime>2026-01-08t20:18:24z</datatime>

            </time>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| time | object | Timezone and Time Information |
| time.timezone | string | Device Timezone Information |
| time.datatime | string | Device Time Information |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Set Timezone and Time
##### Interface Function
Set device timezone and time.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |
| time | object | Y | Timezone and Time Information |
| time.timezone | string | N | Timezone Information |
| time.datetime | string | N | Time information |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>set.product.time</command>

        <content>
            <time>
                <timezone>gmt+08:00</timezone>

                <datetime>2026-01-09t08:52:23z</datetime>

            </time>

        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content></content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Production Configuration
#### Production Configuration Command
##### Interface Function
##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |
| model | string | Y | Device Model |
| mac | object | Y | MAC Address Information |
| mac.macnum | int |  | Number of MAC addresses |
| mac.mac1 | string | Y | MAC Address |
| umid | string | Y | Device Cloud ID |
| autid | string | Y | Device Verification Code |
| innerautid | string | Y | Device Internal Verification Code |
| setinfo |  |  |  |
| sensorparams | object | N | Sensor Parameters |
| sensorparams.dvp_pol_ctrl |  |  |  |
| sensorparams.io_driwer |  |  |  |
| sensorparams.pclk_dly |  |  |  |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>set.production.info</command>

        <content>
            <model>IOT10210</model>

            <mac>
                <macnum>1</macnum>

                <mac1>AA-BB-CC-DD-EE-FF</mac1>

            </mac>

            <umid>TTkscndb86qu</umid>

            <autid>HSFRMOBO</autid>

            <innerautid>sRO4OiW0</innerautid>

            <setinfo></setinfo>

            <sensorparams>
                <dvp_pol_ctrl>3</dvp_pol_ctrl>

                <io_driwer>2</io_driwer>

                <pclk_dly>0</pclk_dly>

            </sensorparams>

        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content></content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Device Network Mode
#### Set Device Network Mode Command
##### Interface Function
Set Device Network Mode command.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |
| mode | int | Y | Network Mode, values: 0-Network Mode, 1-Direct Connect Mode |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
  <header>
    <security>username</security>

    <username>adminapp2</username>

    <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

  </header>

  <body>
    <command>set.network.workmode</command>

    <content>
      <mode>0</mode>

    </content>

  </body>

</envelope>

```

##### Response Data
```xml
<envelope>
  <body>
    <content></content>

    <error>0</error>

  </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Get Device Network Mode Command
##### Interface Function
Get device network mode command.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
  <header>
    <security>username</security>

    <username>adminapp2</username>

    <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

  </header>

  <body>
    <command>get.network.workmode</command>

    <content>
    </content>

  </body>

</envelope>

```

##### Response Data
```xml

<envelope>
  <body>
    <content>
      <mode></mode>

    </content>

    <error>0</error>

  </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| mode | int | Network Mode, values: 0: Network Mode, 1: Direct Connection Mode |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Currently Enabled Network Interface
#### Get Currently Enabled Network Interface Command
##### Interface Function
Get currently enabled network interface command.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
  <header>
    <security>username</security>

    <username>adminapp2</username>

    <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

  </header>

  <body>
    <command>get.network.interface</command>

    <content>
    </content>

  </body>

</envelope>

```

##### Response Data
```xml
<envelope>
  <body>
    <content>
    <interface>eth0 wlan0 ...</interface>

    </content>

    <error>0</error>

  </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| interface | string |  |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Set Network Interface Switch Command
##### Interface Function
Set Network Interface Switch command.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |
| interface | string | Y | Network Interface Name |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
  <header>
    <security>username</security>

    <username>adminapp2</username>

    <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

  </header>

  <body>
    <command>set.network.interface</command>

    <content>
      <interface>eth0/wlan0</interface>

    </content>

  </body>

</envelope>

```

##### Response Data
```xml

<envelope>
  <body>
    <content>
    </content>

    <error>0</error>

  </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Get System Information
#### Query System Information
##### Interface Function
Get Device System Information.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| command | string | Yes | Fixed as get.system.info |


##### Request Data
```json
{
  "header": {
    "security": "username",
    "username": "adminapp2",
    "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e"
  },
  "body": {
    "command": "get.system.info"
  }
}
```

##### Response Data
```json
{
  "body": {
    "error": 0,
    "content": {
      "system": {
        "info": {
          "mac": "00:04:56:ab:ce:b2",
          "channelnum": 20,
          "analognum": 12,
          "digitalnum": 8,
          "audioport": "4:1",
          "alarmport": "16:4",
          "version": "V500.0005.R008.8353.C0000.B311.C.A",
          "releasedate": "2023-05-23T12:49:37Z",
          "model": "IPCxxxx",
          "cloudid": "TTksxxxxxxxx",
          "serialno": "1234567890000",
          "videostandard": {
            "value": "pal",
            "supported": "pal,ntsc"
          }
        }
      }
    }
  }
}
```

##### Response Fields
| Field | Type | Description |
| --- | --- | --- |
| mac |  | Physical Address |
| channelnum |  | Channel Count |
| analognum |  | Analog Channel |
| digitalnum |  | Digital Channel |
| audioport |  | Audio Port |
| alarmport |  | Alarm Port |
| version |  | Version Number |
| releasedate |  | Release Date |
| model |  | Device Model |
| cloudid |  | Cloud ID |
| serialno |  | Serial Number |
| videostandard.value |  | Video Standard |
| videostandard.supported |  | Supported Video Standards |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### System Information
#### Get Device System Information
##### Interface Function
Get Device System Information.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
  <header>
    <security>username</security>

    <username>adminapp2</username>

    <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

  </header>

  <body>
    <command>get.system.info</command>

    <content></content>

  </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
  <body>
    <error>0</error>

    <content>
      <system>
        <info>
          <mac>00:04:56:ab:ce:e2</mac>

          <channelnum>1</channelnum>

          <audioport>0:1</audioport>

          <alarmport>0:0</alarmport>

          <version>V500.R005.F704.01.A0000.B017</version>

          <releasedate>2025-10-28t14:23:39z</releasedate>

          <model>IOT733263</model>

          <cloudid>TTksg869uuua</cloudid>

          <serialno></serialno>

          <videostandard>
            <value>pal</value>

            <supported>pal,ntsc</supported>

          </videostandard>

        </info>

      </system>

    </content>

  </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| info.mac | string | MAC Address |
| info.channelnum | int | Channel Count, values: |
| audioport | string | Audio Input/Output Count, values: |
| alarmport | string | Alarm Input/Output Count, values: |
| version | string | Software Version |
| releasedate | string | Version Date |
| model | string | Model |
| cloudid | string | Device Cloud ID |
| serialno |  |  |
| videostandard | object | Video Standard |
| videostandard.value | string |  |
| videostandard.supported | string |  |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Device Information
#### Get Device Information Command
##### Interface Function
Get Device Information command.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.product.info</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <info>
                <mac>00:04:56:ab:ce:e2</mac>

                <version>V500.R005.F704.01.A0000.B017</version>

                <releasedate>2025-10-28t14:23:39z</releasedate>

                <model>IOT733263</model>

            </info>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| mac | string | Device MAC Address |
| version | string | Device Version Information |
| releasedate | string | Device Version Release Date |
| model | string | Device Model |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Get Device Capability Set Info
##### Interface Function
Get Device Capability Set information.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.product.ability</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Modify External Verification Code
#### Set Verification Code
##### Interface Function
Modify External Verification Code, supports plaintext, HASH256, or AES256+BASE64.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| command | string | Yes | Fixed as set.seurity.verifycode |
| content.old | string | Yes | Old verification code, plaintext or HASH256 |
| content.new | string | Yes | New verification code, plaintext or HASH256 |
| content.aespwd | string | No | Plaintext encrypted by AES256 then BASE64 encoded |
| content.acountid | string | Yes | Customer ID |
| content.bencode | Boolean | No | true indicates old/new are HASH256; false/omitted indicates plaintext |


##### Request Data
```json
{
  "header": {
    "security": "username",
    "username": "adminapp2",
    "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
    "passwordencode": 1
  },
  "body": {
    "command": "set.seurity.verifycode",
    "content": {
      "old": "xxxxxx",
      "new": "yyyyy",
      "aespwd": "BASE64_AES256_VALUE",
      "acountid": "zzz",
      "bencode": true
    }
  }
}
```

##### Response Data
```json
{
  "body": {
    "error": 0,
    "content": {
      "key": "77776666555544443333222211110000",
      "tdc": "AiJVoIFGlVolF96lFWp8JQfw8OwcZlF",
      "synctime": "2019-01-10 08:54:23"
    }
  }
}
```

##### Response Fields
| Parameter Name | Type | Description | Value |
| --- | --- | --- | --- |
| key | string | Stream Encryption Key | 7777...0000 |
| tdc | string | token | AiJVoIFG... |
| synctime | string | Next Automatic Update Time for Stream Encryption Key | 2019-01-10 08:54:23 |


##### Return Codes
| Error Code | Description |
| --- | --- |
| 0 | Success |
| -1 | Execution Failed |
| -24 | Old verification code incorrect |
| -34 | Customer ID Error |
| 401 | Authentication Error |


##### Description
+ Verification code length is 8-16 characters, supports only uppercase/lowercase letters and numbers.
+ Refer to "VSU Device Sensitive Information Encryption Scheme" for AES256 encryption key acquisition



### Cloud Upgrade Operation
#### Get Cloud Upgrade Status
##### Interface Function
Get cloud upgrade status information.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.system.upgradestatus</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <upgradestatus>5</upgradestatus>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| upgradestatus | int | Cloud Upgrade Status, values: 1-Querying, 2-Downloading, 3-Network Exception, 4-New Version Available, 5-Latest Version, 6-Other Error, 7-Download Complete, 8-Download Failed |
| version | string | New version number, missing if no new version |
| time | string | New version release date, missing if no new version |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Get Cloud Upgrade Version Command
##### Interface Function
Get Cloud Upgrade Version information.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.system.upgradeversion</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <version>V500.R005.F217.01.A0000.B099</version>

            <releasetime>20240715</releasetime>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| version | string | New Version Number |
| time | string | New Version Release Date |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Start Upgrade Command
##### Interface Function
Start Version Upgrade.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>set.system.upgrade</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content></content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Get Upgrade Progress Command
##### Interface Function
Get Upgrade Progress information.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.system.upgradeprocess</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <process>0</process>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| process | int | Progress description, values: -1-Download Failed, -2-Download Success, 0-100 Download Progress |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Device Restart
#### Device Restart
##### Interface Function
Restart the device.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>set.system.reboot</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content></content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Factory Reset
#### Factory Reset
##### Interface Function
Restore device configuration to factory settings.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>set.system.config.default.restorefactory</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content></content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Activate
#### Activate Command
##### Interface Function
##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>set.production.activated</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


## Device Custom Functions
### Image Flip
#### Get Image Flip Status
##### Interface Function
Get camera image flip status.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Username |
| password | string | Yes | Password |
| passwordencode | int | No | Password Encryption Mode |
| command | string | Yes | Command word, fixed as get.image.flip |
| content | object | Yes | Content, empty |


##### Request Data
```json
{
  "header": {
    "security": "username",
    "username": "adminapp2",
    "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
    "passwordencode": 1
  },
  "body": {
    "command": "get.image.flip",
    "content": {
    }
  }
}
```

##### Response Data
```json
{
  "body": {
    "error": 0,
    "content": {
      "mode": 1
    }
  }
}
```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |
| mode | int | Flip mode, 0: Off, 1: Flip |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Set Image Flip Status
##### Interface Function
Set camera image flip status.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Username |
| password | string | Yes | Password |
| passwordencode | int | No | Password Encryption Mode |
| command | string | Yes | Command word, fixed as set.image.flip |
| content | object | Yes | Content |
| mode | int | Yes | Flip mode, 0: Off, 1: Flip |


##### Request Data
```json
{
  "header": {
    "security": "username",
    "username": "adminapp2",
    "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
    "passwordencode": 1
  },
  "body": {
    "command": "set.image.flip",
    "content": {
      "mode": 1
    }
  }
}
```

##### Response Data
```json
{
  "body": {
    "error": 0
  }
}
```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Device Output Volume Adjustment
#### Get Device Output Volume
##### Interface Function
Get current device output volume configuration, including talk, prompt, and keypad volumes.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Device local username |
| password | string | Yes | Device local user password |
| passwordencode | int | No | Password encryption mode, 1 means enabled |
| command | string | Yes | Command word, fixed as get.audio.outvolume |
| content | object | Yes | Command Content Object, fixed as empty |


##### Request Data
```json
{
  "header": {
    "security": "username",
    "username": "adminapp2",
    "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
    "passwordencode": 1
  },
  "body": {
    "command": "get.audio.outvolume",
    "content": {}
  }
}
```

##### Response Data
```json
{
  "body": {
    "error": 0,
    "content": {
      "talk": {
        "max_level": 12,
        "min_level": 0,
        "level": 3
      },
      "prompt": {
        "max_level": 12,
        "min_level": 0,
        "level": 3
      },
      "keypad": {
        "max_level": 12,
        "min_level": 0,
        "level": 3
      }
    }
  }
}
```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Error code, 0 indicates success |
| talk.max_level | int | Talk Volume Max Level |
| talk.min_level | int | Talk Volume Min Level |
| talk.level | int | Current Talk Volume Level |
| prompt.max_level | int | Prompt Volume Max Level |
| prompt.min_level | int | Prompt Volume Min Level |
| prompt.level | int | Current Prompt Volume Level |
| keypad.max_level | int | Keypad Volume Max Level, device supported on demand |
| keypad.min_level | int | Keypad Volume Min Level |
| keypad.level | int | Current Keypad Volume Level |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


##### Description
+ talk and prompt fields are required; if the device does not need to display a volume, set max/min/level to 0.
+ keypad field is optional, devices supporting keypad volume must return this field.



#### Set Device Output Volume
##### Interface Function
Set device talk volume, prompt volume, and keypad volume.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/json |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Yes | Security authentication method, fixed as username |
| username | string | Yes | Device local username |
| password | string | Yes | Device local user password |
| passwordencode | int | No | Password encryption mode, 1 means enabled |
| command | string | Yes | Command word, fixed as set.audio.outvolume |
| content | object | Yes | Command Content Object |
| talk.level | int | Yes | Talk Volume Level |
| prompt.level | int | Yes | Prompt Volume Level |
| keypad.level | int | No | Keypad Volume Level, input for devices supporting keypad volume |


##### Request Data
```json
{
  "header": {
    "security": "username",
    "username": "adminapp2",
    "password": "a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e",
    "passwordencode": 1
  },
  "body": {
    "command": "set.audio.outvolume",
    "content": {
      "talk": {
        "level": 3
      },
      "prompt": {
        "level": 3
      },
      "keypad": {
        "level": 3
      }
    }
  }
}
```

##### Response Data
```json
{
  "body": {
    "error": 0,
    "content": {}
  }
}
```

##### Response Fields
##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


##### Description
+ talk and prompt fields are required when setting; if modifying only one, the other must also carry the current value.
+ keypad field is used only when the device supports keypad volume.



### Static IP
#### Get Static IP Configuration
##### Interface Function
Get Static IP Configuration.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.network.config</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <network>
                <idhcp>true</idhcp>

                <address>192.168.50.77</address>

                <submask>255.255.255.0</submask>

                <gateway>192.168.50.1</gateway>

                <dns>192.168.50.1</dns>

                <secondarydns>0.0.0.0</secondarydns>

                <httpport>80</httpport>

                <httpsport>443</httpsport>

            </network>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| network | object | Network Information |
| network.idhcp | string | Is Static IP, values: true-yes, false-no |
| network.address | string | Device IP Address |
| network.submask | string | Subnet Mask |
| network.gateway | string | Gateway |
| network.dns | string | DNS Address |
| network.secondarydns | string | Secondary DNS Address |
| network.httpport | int | HTTP Protocol Port |
| network.httpsport | int | HTTPS Protocol Port |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Set Static IP Configuration
##### Interface Function
Set Static IP Configuration.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |
| network | object | Y | Network Information |
| network.idhcp | string | Y | Is Static IP, values: true-yes, false-no |
| network.address | string | Y | Device IP Address |
| network.submask | string | Y | Subnet Mask |
| network.gateway | string | Y | Gateway |
| network.dns | string | Y | DNS Address |
| network.secondarydns | string | N | Secondary DNS Address |
| network.httpport | int | N | HTTP Protocol Port |
| network.httpsport | int | N | HTTPS Protocol Port |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>set.network.config</command>

        <content>
            <network>
                <idhcp>true</idhcp>

                <address>192.168.50.77</address>

                <submask>255.255.255.0</submask>

                <gateway>192.168.50.1</gateway>

                <dns>192.168.50.1</dns>

                <secondarydns>1.1.1.1</secondarydns>

                <httpport>80</httpport>

                <httpsport>443</httpsport>

            </network>

        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content></content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


### Preset Position
#### Get Preset Position
##### Interface Function
Get Preset List information.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>get.ptz.preset</command>

        <content>
        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <presetlist>
                <preset>
                    <presetid>1</presetid>

                    <presetname>andhcdf=</presetname>

                </preset>

            </presetlist>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| presetlist | list | Preset List |
| presetlist.preset | object | Preset Information |
| presetlist.presetid | int | Preset ID, max 32 presets |
| presetlist.presetname | string | Max length 46 bytes after base64 encoding |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Set Preset Position
##### Interface Function
Set Preset Position.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |
| presetname | string | Y | Max length 46 bytes after base64 encoding |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>set.ptz.preset</command>

        <content>
            <presetname>andhcdf=</presetname>

        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content>
            <presetid>1</presetid>

        </content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |
| presetid | int | Preset ID |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### Delete Preset
##### Interface Function
Delete existing preset position.

##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |
| presetlist | list | Y | Preset List |
| presetlist.preset | object | Y | Preset |
| preset.presetid | int | Y | Preset ID to delete, id 0 clears all |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>set.ptz.preset.clear</command>

        <content>
            <presetlist>
                <preset>
                    <presetid>1</presetid>

                </preset>

            </presetlist>

        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content></content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


#### PTZ Rotate to Preset
##### Interface Function
##### Request Address
[https://remote_addr/tdkcgi](https://remote_addr/tdkcgi)

##### Request Method
POST

##### Request Headers
| Key | Value |
| --- | --- |
| Content-Type | application/xml |


##### Request Parameters
| Parameter Name | Type | Required | Description |
| --- | --- | --- | --- |
| security | string | Y | Only username supported |
| username | string | Y | Device local username |
| password | string | Y | Device local user password |
| command | string | Y | Command |
| ptz | object | Y | Preset Information |
| presetId | int | Y | Preset ID |


##### Request Data
```xml
<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>

        <username>adminapp2</username>

        <password>a8847f250a9dd375e81fb391efefb7d5555a2be11e4d5394e3c31ab893c3ad4e</password>

    </header>

    <body>
        <command>ctrl.ptz.preset.goto</command>

        <content>
            <ptz>
                <presetId>1</presetId>

            </ptz>

        </content>

    </body>

</envelope>

```

##### Response Data
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envelope>
    <body>
        <error>0</error>

        <content></content>

    </body>

</envelope>

```

##### Response Fields
| Parameter Name | Type | Description |
| --- | --- | --- |
| error | int | Return code of the command request. 0 indicates success; other values are error codes. |


##### Return Codes
| Return Code | Description |
| --- | --- |
| 0 | Success |
| 401 | Authentication Error |
| -1 | Execution Failed |


