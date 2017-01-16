# WebSocket介绍


&emsp;&emsp;在过去的一年多时间里，本人参与了公司web ochat项目的开发和持续维护、升级、外接服务等。该项目是一个基于WebSocket的即时通信服务的网页端服务。服务包含了即时聊天、好友、群等各种功能，支持文字、表情、图片、分享、定位、文件、语音等各种消息类型，并包含断线重连、消息补偿等机制。下面跟大家分享一下本人对于WebSocket知识的一些梳理。  

![WebSocket](https://img1.qunarzz.com/m_appPromotion/wap/1701/4f/4ee2c39fedfd5c02.jpg)

### 一、 什么是WebSocket？

&emsp;&emsp;大家都知道，HTML5中新来了个叫`WebSocket`的会员。WebSocket是什么大家也应该多多少少有所了解，它能实现客户端浏览器与服务器的双向通讯。说到双向通讯，可能有人首先会想到即时通讯，没错WebSocket可以用于网页即时通讯。当然还有很多其他的应用场景。  

&emsp;&emsp;**WebSocket有什么优势？**以往我们在网页上做即时通讯通常来说是这样的：浏览器网页隔几秒就打个电话（发个http请求）给服务器问下有没有新消息，服务器回应没有消息或者把新信息告诉网页；拿到新消息的网页通过js操作显示消息给使用者看。当然也有这样的场景：浏览器网页隔几秒就发个微信消息（发个http请求）给服务器问下有没有新消息，没有时服务器就不回复微信，有的话服务器就把消息回复给网页。这样子看起来十分美好，功能也实现了，但其实有一些问题没有很好地处理，比如：由于http通信是无状态的，网页第一次请求某人的新消息，需要带上所有的请求头及请求参数，隔几秒后的下一次请求依然还要带上完整的请求头和相同的参数，这很浪费资源，而且对服务器处理速度也有要求。那么，最好就是不用网页去询问，当有新消息时服务器直接把新消息推送给网页来显示。WebSocket正是为这种需求而生，它的基本通信原理简单来说就是：浏览器与服务器打开一条tcp通道并维持通道持续畅通，然后服务器和浏览器就可以自由的随时的发消息给对方。  

### 二、 WebSocket打开阶段握手

&emsp;&emsp;从实质上来说，WebSocket应该是一种协议，与HTML版本无关，为什么跟HTML5牵扯在一起？WebSocket协议是在HTML5中提出的协议规范，并且HTML5制定了一套使用WebSocket的Javascript API。和http协议一样，WebSocket协议也是基于传输层协议TCP的应用层协议。  

&emsp;&emsp;WebSocket在建立tcp连接的握手阶段，需要借助于http（https）协议，这一握手过程如图1所示。

![图1. WebSocket握手过程]( https://img1.qunarzz.com/m_appPromotion/wap/1701/56/f70f65b76ed37e02.png)  
<center>图1. WebSocket握手过程</center>  

&emsp;&emsp;按照步骤来看，首先第一步是发送一个http（https）请求，请求服务器升级到WebSocket通信协议。在这一步的请求头中会包含这些信息：
```
Connection: Upgrade  
Upgrade: websocket  
Sec-WebSocket-Key: XXXXXXXXXXXXXXXXXXXXXX==  
Sec-WebSocket-Protocol: xxxx  
Sec-WebSocket-Version: 13  
```  
&emsp;&emsp;在服务器的理解下，这个请求的作用就是告诉服务器这个请求是请求升级连接协议到WebSocket协议，并且附上验证key、服务协议名（区分多个ws应用）、WebSocket版本。之后，如果服务器接受了这个请求，就会返回一个状态码为101的http response，并在header中包含这些信息：
```
Upgrade: websocket  
Connection: Upgrade  
Sec-Websocket-Accept: YYYYYYYYYYYYYYYYYYYYYYY=  
Sec-Websocket-Protocol: xxxx  
```
&emsp;&emsp;状态码101表示协议切换（Switching Protocols），告诉浏览器协议已经切换到WebSocket并建立了连接。到这里客户端与服务器就已经建立起WebSocket连接，可以使用ws（wss）协议头发消息来进行双向通讯了。  

### 三、 WebSocket客户端API  

&emsp;&emsp;利用HTML5的WebSocket API，在前端发送和处理WebSocket消息相对来说是比较简单的。

|            | 类型         | 说明 |
|------------|:-------------:|-----|
| url        | string        | 服务器地址 |
| protocol   | string        | 服务器选择的应用协议名 |
| readyState | number        | 表示连接状态，取值0-3之间 |  
| binaryType | string        | 取值'blob'或'arraybuffer', 用来区分传输的二进制数据使用DOMBlob对象还是ArrayBuffer对象。 |
| onopen     | EventListener | 连接打开的事件监听器 |
| onerror    | EventListener | 发生错误的事件监听器 |
| onmessage  | EventListener | 有消息到达的事件监听器 |
| onclose    | EventListener | 连接关闭的事件监听器 |
| send       | Function      | 发送消息的方法 |
| close      | Function      | 关闭连接的方法 |

##### 1. 建立WebSocket连接

&emsp;&emsp;在使用websocket的时候，我们**首先新建一个WebSocket实例**：

``` javascript
var ws = new WebSocket('ws://localhost:9001/', 'app');
```

这时就会和设置的服务器建立WebSocket连接，注意协议头使用`ws://`或`wss://`。此时`ws.readyState`属性将被设置为0，表示CONNECTING连接中。第二个参数用于设置一个自定义协议名，也可以是一个数组来传递多个，当连接建立成功后，服务器将会返回它选择的协议名，从 `ws.protocol`属性中可以看到。同时，ws.readyState将变为1，表示OPEN，连接已建立并可以进行通信。   

##### 2. 监听连接打开事件及发送消息

&emsp;&emsp;WebSocket是事件驱动型的，通过`onopen`, `onmessage`, `onclose`, `onerror`等事件来注册连接建立、收到消息、连接关闭、连接错误时的回调方法。**监听连接打开的事件，之后就可以发消息给服务器**：

``` javascript  
ws.onopen = function(e) {
	ws.send('Hello WebSocket!');
};
```

其中`ws.send`是WebSocket用于发送消息的方法，由于需要等连接建立之后才能发送消息，所以写在`onopen`的回调函数中。

##### 3. 处理收到的消息

&emsp;&emsp;连接打开后，除了发送消息，还要**通过`onmessage`接受服务器发过来的消息加以处理**，消息体在事件参数messageEvent的data属性中：

``` javascript
ws.onmessage = function(messageEvent) {
	var message = JSON.parse(messageEvent.data);
	switch(message.type) {
		case 'update':
			console.log('Update context: ' + message.content);
			break;
		case 'add':
			console.log('Add content: ' + message.content);
			break;
		default:
	}
};
```

通过JSON.parse方法，把接受到的`messageEvent.data`数据重新转换为js对象，并对数据结构进行分析从而做出反应，通常都会这么做。当然除了text和json（需要序列化），也可以传递二进制数据`Blob`和`ArrayBuffer`，可通过`ws.binaryType`来区分两种类型。

##### 4. 关闭WebSocket连接

&emsp;&emsp;当使用完WebSocket之后，可以通过`ws.close`方法关闭连接，此时ws.readyState变为2，表示CLOSING关闭过程中，关闭成功后，触发ws.onclose事件，ws.readyState变为3，表示CLOSED已断开。

> WebSocket API 文档：[https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)

### 四、 WebSocket服务端实现

&emsp;&emsp;要实现WebSocket服务器端服务，简单来说主要分为这几个步骤：（1）接受和处理握手阶段请求；（2）理解和解析websocket数据帧；（3）分发数据和维持心跳。基本处理流程如图2所示。

![图2. WebSocket服务端基本流程](https://img1.qunarzz.com/m_appPromotion/wap/1701/f0/b86982809a7002.png)  
<center>图2. WebSocket服务端基本流程</center>

##### 1. 处理握手请求

&emsp;&emsp; 客户端浏览器执行`new WebSocket(ws://****/)`时，首先会发起打开阶段握手请求，这个请求是http的，请求头等信息如图3所示。  

![图3. WebSocket握手请求](https://img1.qunarzz.com/m_appPromotion/wap/1701/1d/b8873d3d28f8e02.png)  
<center>图3. WebSocket握手请求</center>

在Request Headers中可以看到上文介绍过的几个字段。服务器接收到这个请求之后，首先要将这些字段解析出来，当理解到`Connection: Upgrade`以及`Upgrade: websocket`时，要意识到这是个WebSocket握手请求，需要升级到WebSocket协议，并提取与之相关的几个字段信息，即以`Sec-WebSocket-`开头的字段。其中，有个很重要的验证身份的key即`Sec-WebSocket-Key`（以下简写为key），需要根据这个值计算出另一串字符通过Response Headers中的`Sec-WebSocket-Accept`（以下简写为accept-key）字段返回给客户端，告诉它验证通过。  

&emsp;&emsp;计算accept-key的算法并不困难，大多数语言都已经提供相关的算法接口: 首先将key与协议规定的固定字符串`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`相连得到新的字符串，然后对其使用`SHA1`安全散列算法计算出结果，再进行`base64`编码，就可以得到accept-key。将accept-key和其他头信息以101状态码回应客户端之后，即可完成握手，开始进行数据传输了。在nodejs中内置了`crypto`模块，提供了各种加密算法，包括SHA1，可以直接使用。

##### 2. 解析数据帧

&emsp;&emsp;第二个基本要点是理解WebSocket协议的数据帧格式。图4和图5分别为rfc6455提供的数据帧格式结构图和《深入浅出node.js》（朴灵）一书中提供的数据帧格式图。其中第一幅图标示了每一位的结构，第二幅图则是按照字节分组，大家各自挑顺眼的看。

![图4. RFC6455的WebSocket数据帧格式图](https://img1.qunarzz.com/m_appPromotion/wap/1701/6b/eb07582ca1cfc802.png)  
<center>图4. RFC6455的WebSocket数据帧格式图</center>

![图5. WebSocket数据帧格式（《深入浅出node.js》）](https://img1.qunarzz.com/m_appPromotion/wap/1701/10/3738f9232faf7102.png)  
<center>图5. WebSocket数据帧格式（《深入浅出node.js》）</center>

&emsp;&emsp;数据帧中的每一位的具体含义可以查找相应资料阅读了解详情，这里简单提一下重要的部分。  
&emsp;&emsp;标识为`FIN`的第一位，标识这一帧是否为消息的最后片段。然后是标识为`opcode`的第5-8共四位，所以取值为十进制的0-15，用于标识数据类型，比如1代表文本，2代表二进制，8代表连接关闭，9和10分别代表`ping`和`pong`的心跳帧。  
&emsp;&emsp;接着有一个标识为`masked`的位，用于表示是否进行掩码处理，客户端发送给服务器的数据应该标记为1，服务端发送给客户端应为0。服务器解掩码时需要用到标识为`masking key`的4个字节的数据，即将数据的每一字节与masking key的4字节轮流进行异或运算，但若masked为0时则没有这一段数据。  
&emsp;&emsp;在masked位后有7位的标识为`payload length`的数据，用来表示数据的长度，但7位最大可表示的10进制数为127，所以为了能表示更长的数据，同时又尽量节省数据帧空间，这里做了一个不同长度的分别处理：A. 当数据长度小于等于125时，这7位即可表示数据长度；B. 当这7位的值为126时，用7位后面的2个字节即16位来表示数据长度，此时最长可表示65535；C. 如果数据长度比65535还要更大，那么这7位的值为127，表示将7位之后的8个字节即64位全部用来表示数据长度，此时可以表示的最大长度为2的64次方-1，完全够用了。最后payload data不用说就是数据体本身了。

##### 3. 分发数据和维持心跳

&emsp;&emsp;最后一个要点，就是向客户端分发消息和维持WebSocket心跳。为了准确推送消息给一定的客户端，服务端需要维护一份客户端接入字典，以此为依据向不同的客户端推送不同的消息或是广播消息。另外，服务端长时间不与客户端通信时，WebSocket连接将会被关闭，所以需要每隔一段时间发送一次心跳检测，看连接是否健在，若已断开，则需要客户端做出提示用户、退出应用或重连甚至重连后的消息补偿等反应。这一步十分简单，只需要设置一个timer向接入的客户端每隔个几十秒问候一句，或做一个回应即可，可以使用提供的ping、pong数据帧，也可为了数据格式统一使用其他类的数据帧。

##### 4. 使用node.js的ws模块的简易实现示例

&emsp;&emsp;了解了以上这三点，就可以用任何服务端语言编写WebSocket服务了。当然若用于生产环境，还需要注意数据安全等问题。不过，现在各类语言基本都已经有成熟的WebSocket服务模块或插件或类库可以使用，比如用node.js编写的`socket.io`，自己写只是用于加深理解。下面简单介绍一下用node.js中的`ws`模块来构造WebSocket基本服务。  

**为什么不用socket.io做示例？**  

&emsp;&emsp;`socket.io`除了提供WebSocket服务端封装外，同时也封装了浏览器客户端的WebSocket接口。它能够在不支持WebSocket的浏览器中使用其他技术来兼容，如`xhr-polling`等，并且给使用者暴露了统一的一套api. 所以如果服务端用socket.io的话，浏览器也必须搭配使用socket.io，于是没法用HTML5原生的WebSocket API来编写示例代码。为了容易理解，浏览器端js代码还是用原生api来展现，于是服务端也不选用socket.io来示例了。这里选用了比较单纯的ws模块，仅封装服务端接口。值得一提的是，socket.io十分强大，兼容性好，实际生产中值得信赖。

![图6. 服务端代码：nodejs+koa+ws](https://img1.qunarzz.com/m_appPromotion/wap/1701/7f/a9c900e40e7bf902.png)  
<center>图6. 服务端代码：nodejs+koa+ws</center>

&emsp;&emsp;服务使用koa框架，在3000接口同时提供http服务和WebSocket服务。与WebSocket相关的主要代码如图中19-24行，ws模块将会获取到connection为upgrade的握手请求，打开WebSocket连接并让WebSocket消息进入ws的处理流程，其他请求则继续走koa处理流程。其中使用了一个从当前目录引入的ws.js，该模块用来处理WebSocket消息流程，代码如下。

![图7. ws.js](https://img1.qunarzz.com/m_appPromotion/wap/1701/cd/091d2ffac9b5c002.png)  
<center>图7. ws.js</center>

&emsp;&emsp;ws模块提供了`clients`这一API用于客户端管理，而代码中的`broadcast`方法是自己实现的一个消息广播的方法，在这个方法里把接受到的消息参数遍历发给每一个client实体，适用于多人即时聊天、全体推送等。代码中的第二段每隔一段时间向客户端发送当前系统时间，用于维持心跳。第三段则监听onmessage，用于接受客户端发来的消息，并广播给所有客户端。

![图8. 前端页面代码](https://img1.qunarzz.com/m_appPromotion/wap/1701/8b/30f20158c6c78c02.png)  
<center>图8. 前端页面代码</center>

&emsp;&emsp;收到WebSocket消息后，根据其type字段为time还是chat来区别收到的是维持心跳的系统时间还是聊天内容，如果是时间则更新页面上的时间显示，如果是聊天内容则将聊天信息格式化添加到页面上。具体html不贴了，大家就凭空想象一下吧。附一个效果图。

![图9. 简易聊天室demo效果图](https://img1.qunarzz.com/m_appPromotion/wap/1701/21/599c08cb619ce002.png)  
<center>图9. 简易聊天室demo效果图</center>

### 五、 WebSocket其他相关信息

##### 1. 浏览器支持情况

![图10. WebSocket浏览器端支持情况（来自caniuse.com）](https://img1.qunarzz.com/m_appPromotion/wap/1701/78/a9441447b43ca002.png)  
<center>图10. WebSocket浏览器端支持情况（来自caniuse.com）</center>

&emsp;&emsp;目前的主流浏览器基本都已经很好的支持了WebSocket，IE从10开始、安卓web-browser从4.4开始也都支持了WebSocket。不过考虑到国内还有不少用户在使用ie8，如果要兼容这部分用户，可以考虑使用`Socket.IO`库，该库在不支持WebSocket的浏览器中会使用xhr-polling或jsonp-polling等来进行消息收发。Socket.IO还可以在服务端使用，例如可以在nodejs实现的服务端中使用socket.io来搭建WebSocket服务器，并且可以很好的与express框架结合使用。

##### 2. WebSocket与SPDY、HTTP2的关系

![图11. WebSocket、SPDY、HTTP2功能对比](https://img1.qunarzz.com/m_appPromotion/wap/1701/6d/627ad572997c0502.png)  
<center>图11. WebSocket、SPDY、HTTP2功能对比</center>

&emsp;&emsp;WebSocket提供了浏览器与服务器的全双工通信，它与SPDY、HTTP/2关注的侧重点以及解决的问题都是有所不同的，也就是说他们并不是对立的竞争者。  
&emsp;&emsp;我们知道http/1.0协议是单通道无状态模式，一次请求单独创建一个socket短连接来传输数据，传输完即断开，而一个页面很可能会请求很多个css文件、js文件、图片文件等，因此会发出很多http请求，建立很多次连接，由于无状态每次都要带上完整的请求头以及重复的cookie，因此造成了http/1.0的性能瓶颈。我们通常上把许多小图片合并成一张雪碧图目的就是为了减少http请求的次数从而加快页面加载速度。  
&emsp;&emsp;为了解决http/1.0的问题，Google提出了SPDY协议。SPDY实现了多路复用、http头压缩，并兼容https（必须依赖TLS），也实现了服务器推功能。多路复用是指在建立的一个tcp连接上可以并发多个http请求，相比原来的每个http请求都需要建立和关闭一个tcp连接，类似于原来是单车道现在变成了多车道，一次能开好几辆货车过去，自然加快了货物传输速度。Http头压缩功能是指http请求时对请求头进行压缩，将头信息在客户端和服务端各保存一份map，相同的仅传输一个识别key值，有新增或修改的头信息再加上，去掉了不必要的头信息，减少了带宽占用，在请求密集时效果较明显。而服务器推技术则可以客户端请求之前就把需要的资源推送过来，例如根据浏览器请求的html地址，推测浏览器可能要继续请求这个html中用到的js、css、图片文件，那么就把这些资源随着这次tcp连接多派几辆车跟html文件一起送过去，省的浏览器再来拉资源。所以与WebSocket相比，SPDY的服务器推技术的侧重点是不同的，后者着重于给页面提速，而WebSocket则更注重为页面提供一种与服务器间的全双工通讯。  
&emsp;&emsp;SPDY提出后，微软借鉴了SPDY和WebSocket协议，提出了一种新的协议：HTTP Speed+Mobility，妄图揉合两种协议，来提高作为http/2标准候选人的竞争力（误）。HTTP SM 对两种协议进行取舍，例如抛弃了SPDY的ServerPush、不强制依赖TLS，采用了WebSocket的数据帧格式等，不详述。  
&emsp;&emsp;谷歌微软这么争下去也不是个办法，于是HTTP/2协议诞生了，其设计主要基于SPDY并有一些发展。比如HTTP/2不强制依赖TLS，传输报文使用二进制，采用了SPDY的数据帧格式，支持带优先级的单TCP连接多路复用传输，改善了请求头压缩的算法使得安全性得到提高。HTTP/2提供服务器推送功能，能将所需要的资源（css、js、图片等文件）与html整合起来放在一个响应中一次推送到浏览器。目前已有一些网站基于HTTP/2来实现，访问速度的确大大提高。

### 总结

&emsp;&emsp;同样的基于事件响应的编程模式加上Node擅长的高并发，WebSocket与nodejs之间的配合堪称完美，朴灵大神大概是这么说的。诸如即时聊天、消息推送、及时互动游戏、协同工作、实时股价、实况报道、直播、在线教育、等等等等之类，WebSocket有十分广泛的应用场景，不管是前端还是后端，都是时候来试试水了。说不定哪一天，就因为你会这个技术，走上人生巅峰，让别人高攀不起了呢！
