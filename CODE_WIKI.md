# StarLesson在线教育平台 - Code Wiki

## 1. 项目简介

### 1.1 项目概述
StarLesson是一套基于Spring Cloud微服务架构和Spring AI大模型技术的在线教育平台，提供课程学习、AI智能问答、课程推荐、在线交易等核心功能。

### 1.2 技术栈

| 分类 | 技术 |
|------|------|
| 基础框架 | Spring Boot 3.3.5 |
| 微服务 | Spring Cloud 2023.0.3 |
| 云生态 | Spring Cloud Alibaba 2023.0.3.2 |
| AI大模型 | Spring AI 1.0.0 + Spring AI Alibaba 1.0.0.2 |
| 数据库 | MySQL 8.0 + MyBatis-Plus 3.5.9 |
| 缓存 | Redis + Redisson 3.13.6 |
| 搜索引擎 | Elasticsearch 7.12.1 |
| 消息队列 | RabbitMQ |
| 分布式事务 | Seata 1.5.1 |
| 任务调度 | XXL-Job 2.3.1 |
| 对象存储 | 阿里云OSS + 腾讯云COS/VOD |
| API文档 | Swagger 2.2.19 + Knife4j |
| Java版本 | JDK 17 |

### 1.3 项目版本
- **项目版本**: 1.0.0
- **Spring Boot**: 3.3.5
- **Java**: 17

---

## 2. 项目架构

### 2.1 模块结构

```
tjxt (父工程)
├── tj-common          # 公共模块 - 工具类、常量、通用DTO、域对象
├── tj-api             # API模块 - Feign客户端定义、远程调用DTO
├── tj-auth            # 认证模块
│   ├── tj-auth-common        # 认证公共组件
│   ├── tj-auth-service       # 认证服务
│   ├── tj-auth-resource-sdk  # 资源鉴权SDK
│   └── tj-auth-gateway-sdk   # 网关鉴权SDK
├── tj-gateway         # 网关服务 - 统一入口、路由、鉴权
├── tj-user            # 用户服务 - 用户管理
├── tj-message         # 消息服务
├── tj-media           # 媒体服务 - 视频/文件管理
├── tj-course          # 课程服务 - 课程管理
├── tj-search          # 搜索服务 - ES索引和搜索
├── tj-learning        # 学习服务 - 课程学习、学习记录
├── tj-trade           # 交易服务 - 订单管理
├── tj-pay             # 支付服务
├── tj-exam            # 考试服务 - 题库管理
├── tj-promotion       # 促销服务 - 优惠券管理
├── tj-data            # 数据服务 - 数据统计
├── tj-remark          # 评价服务 - 课程评价
└── tj-aigc            # AIGC服务 - AI智能问答、推荐、购买
```

### 2.2 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端层                                  │
│              (Web / App / 小程序 / 第三方系统)                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway (tj-gateway)                    │
│                  路由转发 / 负载均衡 / 鉴权 / 限流                 │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────┬───────────┬───────────┬───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │用户服务  │ │认证服务  │ │AIGC服务 │ │课程服务  │ │学习服务  │ │交易服务 │
   │tj-user  │ │tj-auth  │ │tj-aigc  │ │tj-course│ │tj-learning│ │tj-trade│
   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
        │           │           │           │           │           │
        └───────────┴───────────┴───────────┴───────────┴───────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌─────────────┐         ┌─────────────┐
            │   MySQL     │         │    Redis    │
            │  主从集群    │         │   集群      │
            └─────────────┘         └─────────────┘
                    │                       │
                    ▼                       ▼
            ┌─────────────┐         ┌─────────────┐
            │ Elasticsearch│         │ RabbitMQ    │
            │    7.12.1   │         │  消息队列   │
            └─────────────┘         └─────────────┘
```

### 2.3 服务依赖关系

```
Gateway
  └── tj-auth-gateway-sdk
        └── tj-auth (认证服务)

业务服务依赖链:
tj-api (Feign客户端)
  └── tj-common

tj-aigc (AI服务)
  ├── tj-api
  ├── tj-auth-resource-sdk
  └── Spring AI + DashScope

tj-user / tj-course / tj-learning / tj-trade 等业务服务
  ├── tj-api
  ├── tj-auth-resource-sdk
  └── 其他依赖...
```

---

## 3. 主要模块职责

### 3.1 tj-common (公共模块)

**职责**: 提供全项目共享的工具类、常量定义、通用域对象和响应封装。

**核心类**:

| 类名 | 路径 | 说明 |
|------|------|------|
| `R<T>` | `com.tianji.common.domain.R` | 通用响应封装 |
| `UserContext` | `com.tianji.common.utils.UserContext` | 用户上下文 ThreadLocal 工具 |
| `PageQuery` | `com.tianji.common.domain.query.PageQuery` | 分页查询基类 |
| `BaseDTO` | `com.tianji.common.domain.dto.BaseDTO` | DTO基础属性 |
| `BeanUtils` | `com.tianji.common.utils.BeanUtils` | Bean转换工具 |
| `AssertUtils` | `com.tianji.common.utils.AssertUtils` | 断言校验工具 |
| `CollUtils` | `com.tianji.common.utils.CollUtils` | 集合操作工具 |
| `JsonUtils` | `com.tianji.common.utils.JsonUtils` | JSON序列化工具 |
| `ErrorInfo` | `com.tianji.common.constants.ErrorInfo` | 错误信息常量 |
| `Constant` | `com.tianji.common.constants.Constant` | 通用常量 |

**关键方法**:

```java
// R 响应类
R.ok()                           // 成功响应
R.ok(data)                       // 带数据成功响应
R.error(msg)                    // 错误响应
R.error(code, msg)               // 指定错误码响应
boolean success()                // 判断是否成功

// UserContext 用户上下文
UserContext.setUser(userId)      // 设置当前用户
UserContext.getUser()            // 获取当前用户
UserContext.removeUser()          // 清除上下文

// PageQuery 分页查询
pageNo                           // 页码，默认1
pageSize                         // 每页大小，默认20
Page.toMpPage()                  // 转换为MyBatis-Plus分页对象
Page.toMpPageDefaultSortByCreateTimeDesc()  // 按创建时间降序分页
```

---

### 3.2 tj-api (API模块)

**职责**: 定义所有微服务间Feign调用接口，包含请求/响应DTO定义。

**核心Feign客户端**:

| 客户端 | 说明 |
|--------|------|
| `CourseClient` | 课程服务远程调用 |
| `TradeClient` | 交易服务远程调用 |
| `AuthClient` | 认证服务远程调用 |
| `UserClient` | 用户服务远程调用 |
| `SearchClient` | 搜索服务远程调用 |
| `ExamClient` | 考试服务远程调用 |
| `RemarkClient` | 评价服务远程调用 |
| `CartClient` | 购物车服务远程调用 |

**核心DTO**:

```java
// 课程相关 DTO
CourseBaseInfoDTO                // 课程基础信息
CourseFullInfoDTO                // 课程完整信息（含目录、教师）
CourseSearchDTO                  // 课程搜索信息
CourseSimpleInfoDTO              // 课程简单信息
SectionInfoDTO                  // 小节信息
MediaQuoteDTO                   // 媒资引用信息

// 交易相关 DTO
OrderConfirmVO                   // 订单确认信息
CoursePurchaseInfoDTO           // 课程购买信息

// 用户相关 DTO
UserDTO                          // 用户信息
LoginFormDTO                     // 登录表单
RoleDTO                          // 角色信息
```

---

### 3.3 tj-aigc (AIGC服务) - 核心模块

**职责**: AI智能对话服务，提供课程推荐、购买咨询、智能路由等功能，集成Spring AI和阿里云通义大模型。

**核心类**:

| 类名 | 说明 |
|------|------|
| `Agent` | AI智能体接口 |
| `AbstractAgent` | 智能体抽象基类 |
| `RouteAgent` | 路由智能体 - 意图识别 |
| `RecommendAgent` | 推荐智能体 - 课程推荐 |
| `BuyAgent` | 购买智能体 - 课程购买 |
| `CourseTools` | 课程工具 - 课程查询 |
| `OrderTools` | 订单工具 - 预下单 |
| `ChatController` | 聊天控制器 |
| `ChatService` | 聊天服务接口 |
| `SystemPromptConfig` | 系统提示词配置（热更新） |
| `SpringAIConfig` | Spring AI配置 |
| `AIProperties` | AI配置属性 |

**Agent 接口定义**:

```java
public interface Agent {
    // 流式处理
    Flux<ChatEventVO> processStream(String question, String sessionId);

    // 标准处理
    String process(String question, String sessionId);

    // 获取智能体类型
    AgentTypeEnum getAgentType();

    // 停止生成
    void stop(String sessionId);

    // 系统提示词
    default String systemMessage() { return ""; }

    // 工具列表
    default Object[] tools() { return EMPTY_OBJECTS; }

    // 工具上下文
    default Map<String, Object> toolContext(String sessionId, String requestId) { return Map.of(); }

    // Advisor列表 (RAG增强)
    default List<Advisor> advisors() { return List.of(); }
}
```

**AgentTypeEnum 智能体类型**:

```java
public enum AgentTypeEnum {
    ROUTE("ROUTE", "路由智能体"),           // 意图识别和路由
    RECOMMEND("RECOMMEND", "课程推荐智能体"), // 课程推荐
    CONSULT("CONSULT", "课程咨询智能体"),     // 课程咨询
    BUY("BUY", "课程购买智能体"),             // 购买引导
    KNOWLEDGE("KNOWLEDGE", "知识讲解智能体"); // 知识讲解
}
```

**ChatEventTypeEnum 聊天事件类型**:

```java
public enum ChatEventTypeEnum {
    DATA(1001, "数据事件"),   // 流式输出数据
    STOP(1002, "停止事件"),   // 输出停止标识
    PARAM(1003, "参数事件");  // 工具调用参数
}
```

**核心配置** (`application.yml`):

```yaml
tj:
  ai:
    prompt:
      system:
        chat:
          data-id: system-chat-message.txt
        route-agent:
          data-id: route-agent-system-message.txt
        recommend-agent:
          data-id: recommend-agent-system-message.txt
        buy-agent:
          data-id: buy-agent-system-message.txt
    memory:
      max: 100
      type: Redis  # Redis / MYSQL / MongoDB
    chat-type: ENHANCE  # ROUTE / ENHANCE / APP
    audio-type: DASHSCOPE  # OPENAI / DASHSCOPE
```

---

### 3.4 tj-auth (认证模块)

**职责**: 用户认证、授权、Token管理、菜单权限管理。

**子模块**:
- `tj-auth-common`: 公共组件
- `tj-auth-service`: 认证服务实现
- `tj-auth-resource-sdk`: 资源鉴权SDK
- `tj-auth-gateway-sdk`: 网关鉴权SDK

---

### 3.5 tj-gateway (网关服务)

**职责**: 统一网关路由、负载均衡、鉴权拦截、跨域处理。

---

### 3.6 tj-user (用户服务)

**职责**: 用户信息管理（学生、教师、员工）。

**核心实体**: `User`, `UserDetail`

**核心服务**:
- `IUserService` / `UserServiceImpl`
- `IStudentService` / `StudentServiceImpl`
- `ITeacherService` / `TeacherServiceImpl`
- `IStaffService` / `StaffServiceImpl`

---

### 3.7 tj-course (课程服务)

**职责**: 课程管理、课程分类、课程目录、课程内容管理。

**核心实体**: `Course`, `Category`, `Subject`, `CourseContent`, `CourseTeacher`

---

### 3.8 tj-learning (学习服务)

**职责**: 课程学习、学习记录、笔记管理、学习进度跟踪。

**核心实体**: `Note`, `NoteUser`, `LearningLesson`, `LearningRecord`

---

### 3.9 tj-trade (交易服务)

**职责**: 订单管理、订单详情、课程购买关联。

**核心功能**:
- 课程购买
- 订单查询
- 报名统计

---

### 3.10 tj-search (搜索服务)

**职责**: Elasticsearch索引管理、课程搜索。

**核心功能**:
- 课程索引
- 课程搜索
- MQ事件监听（课程变更同步索引）

---

### 3.11 tj-media (媒体服务)

**职责**: 媒资管理（视频、文件），支持阿里云OSS和腾讯云COS/VOD。

**核心功能**:
- 文件上传
- 视频播放
- 媒资引用计数

---

### 3.12 tj-exam (考试服务)

**职责**: 题库管理、题目类型、题目详情。

**核心实体**: `Question`, `QuestionDetail`, `QuestionBiz`

---

### 3.13 tj-promotion (促销服务)

**职责**: 优惠券管理、优惠券发放、兑换码。

**核心实体**: `Coupon`, `CouponScope`, `ExchangeCode`

**核心工具**:
- `AESUtil` - AES加密工具
- `CodeUtil` - 兑换码生成工具
- `RedisLock` - Redis分布式锁

---

### 3.14 tj-data (数据服务)

**职责**: 数据统计、数据看板。

**核心功能**:
- 今日数据
- 排行榜Top10
- 图表数据

---

### 3.15 tj-remark (评价服务)

**职责**: 课程评价、点赞管理。

**核心实体**: `LikedRecord`, `Remark`

---

## 4. 关键类与函数说明

### 4.1 AIGC模块核心类

#### AbstractAgent 抽象智能体

```java
@Slf4j
public abstract class AbstractAgent implements Agent {
    @Resource
    private ChatClient chatClient;
    @Resource
    private StringRedisTemplate stringRedisTemplate;
    @Resource
    private ChatMemory chatMemory;
    @Resource
    private ChatSessionService chatSessionService;

    // 流式处理核心逻辑
    @Override
    public Flux<ChatEventVO> processStream(String question, String sessionId) {
        var requestId = this.generateRequestId();
        var hashOps = this.stringRedisTemplate.boundHashOps(GENERATE_STATUS_KEY);
        var conversationId = ChatService.getConversationId(sessionId);

        return this.getChatClientRequest(question, sessionId, requestId)
                .stream()
                .chatResponse()
                .doFirst(() -> hashOps.put(sessionId, "true"))
                .doOnError(throwable -> hashOps.delete(sessionId))
                .doOnComplete(() -> hashOps.delete(sessionId))
                .takeWhile(response -> hashOps.get(sessionId) != null)
                .map(chatResponse -> {
                    var text = chatResponse.getResult().getOutput().getText();
                    return ChatEventVO.builder()
                            .eventData(text)
                            .eventType(ChatEventTypeEnum.DATA.getValue())
                            .build();
                })
                .concatWith(Flux.defer(() -> /* 工具调用参数和结束标识 */));
    }

    // 标准处理
    @Override
    public String process(String question, String sessionId) {
        return this.getChatClientRequest(question, sessionId, requestId)
                .call()
                .content();
    }

    // 停止生成
    @Override
    public void stop(String sessionId) {
        hashOps.delete(sessionId);
    }
}
```

#### RecommendAgent 课程推荐智能体

```java
@Component
@RequiredArgsConstructor
public class RecommendAgent extends AbstractAgent {
    private final SystemPromptConfig systemPromptConfig;
    private final VectorStore vectorStore;
    private final CourseTools courseTools;

    @Override
    public AgentTypeEnum getAgentType() {
        return AgentTypeEnum.RECOMMEND;
    }

    @Override
    public Object[] tools() {
        return new Object[]{this.courseTools};
    }

    // RAG增强 - 向量检索
    @Override
    public List<Advisor> advisors() {
        var qaAdvisor = QuestionAnswerAdvisor.builder(this.vectorStore)
                .searchRequest(SearchRequest.builder()
                        .similarityThreshold(0.6d)  // 相似度阈值
                        .topK(6)                     // 返回条数
                        .build())
                .build();
        return List.of(qaAdvisor);
    }
}
```

#### BuyAgent 购买智能体

```java
@Component
@RequiredArgsConstructor
public class BuyAgent extends AbstractAgent {
    private final SystemPromptConfig systemPromptConfig;
    private final OrderTools orderTools;

    @Override
    public Object[] tools() {
        return new Object[]{this.orderTools};
    }

    @Override
    public Map<String, Object> toolContext(String sessionId, String requestId) {
        var userId = UserContext.getUser();
        return Map.of(
                Constant.USER_ID, userId,
                Constant.REQUEST_ID, requestId);
    }
}
```

#### CourseTools 课程工具

```java
@Component
@RequiredArgsConstructor
public class CourseTools {
    private final CourseClient courseClient;

    @Tool(description = "根据课程ID查询课程详细信息")
    public CourseInfo queryCourseById(
            @ToolParam(description = "课程ID") Long courseId,
            ToolContext toolContext) {
        var courseInfo = courseClient.baseInfo(courseId, true);
        // 存储工具结果供后续使用
        var requestId = MapUtil.get(toolContext.getContext(), Constant.REQUEST_ID, String.class);
        ToolResultHolder.put(requestId, "CourseInfo_" + courseId, courseInfo);
        return CourseInfo.of(courseInfo);
    }
}
```

#### OrderTools 订单工具

```java
@Component
@RequiredArgsConstructor
public class OrderTools {
    private final TradeClient tradeClient;

    @Tool(description = "预下单接口")
    public PrePlaceOrder prePlaceOrder(
            @ToolParam(description = "课程ID列表") List<Number> courseIds,
            ToolContext toolContext) {
        var userId = MapUtil.getLong(toolContext.getContext(), Constant.USER_ID);
        UserContext.setUser(userId);  // 设置用户上下文
        var orderConfirmVO = this.tradeClient.prePlaceOrder(courseIds);
        return PrePlaceOrder.of(orderConfirmVO);
    }
}
```

#### ChatController 聊天控制器

```java
@Slf4j
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    // 流式聊天接口 (SSE)
    @NoWrapper
    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ChatEventVO> chat(@RequestBody ChatDTO chatDTO) {
        return this.chatService.chat(chatDTO.getQuestion(), chatDTO.getSessionId());
    }

    // 停止生成
    @PostMapping("/stop")
    public void stop(@RequestParam("sessionId") String sessionId) {
        this.chatService.stop(sessionId);
    }

    // 文本聊天
    @PostMapping("/text")
    public String chatText(@RequestBody String question) {
        return this.chatService.chatText(question);
    }
}
```

#### SystemPromptConfig 系统提示词配置（热更新）

```java
@Slf4j
@Getter
@Configuration
@RequiredArgsConstructor
public class SystemPromptConfig {
    private final NacosConfigManager nacosConfigManager;
    private final AIProperties aiProperties;

    private final AtomicReference<String> routeAgentSystemMessage = new AtomicReference<>();
    private final AtomicReference<String> recommendAgentSystemMessage = new AtomicReference<>();
    private final AtomicReference<String> buyAgentSystemMessage = new AtomicReference<>();

    @PostConstruct
    public void init() {
        loadConfig(aiProperties.getSystem().getRouteAgent(), routeAgentSystemMessage);
        // ... 加载其他配置
    }

    // 监听Nacos配置变更，实现热更新
    private void loadConfig(AIProperties.System.Chat chatConfig, AtomicReference<String> target) {
        var config = nacosConfigManager.getConfigService()
                .getConfig(dataId, group, timeoutMs);
        target.set(config);

        // 添加监听器实现热更新
        nacosConfigManager.getConfigService().addListener(dataId, group, new Listener() {
            @Override
            public void receiveConfigInfo(String info) {
                target.set(info);  // 配置更新
            }
        });
    }
}
```

### 4.2 通用工具类

#### UserContext 用户上下文

```java
public class UserContext {
    private static final ThreadLocal<Long> TL = new ThreadLocal<>();

    public static void setUser(Long userId) {
        TL.set(userId);
    }

    public static Long getUser() {
        return TL.get();
    }

    public static void removeUser() {
        TL.remove();
    }
}
```

#### BeanUtils Bean转换

```java
public class BeanUtils extends BeanUtil {
    // 带转换器的转换
    public static <R, T> T copyBean(R source, Class<T> clazz, Convert<R, T> convert);

    // 普通转换
    public static <R, T> T copyBean(R source, Class<T> clazz);

    // 列表转换
    public static <R, T> List<T> copyList(List<R> list, Class<T> clazz);

    // 带转换器的列表转换
    public static <R, T> List<T> copyList(List<R> list, Class<T> clazz, Convert<R, T> convert);
}
```

#### AssertUtils 断言校验

```java
public class AssertUtils {
    public static void isNotNull(Object obj, String ... message);
    public static void isNotBlank(String str, String ... message);
    public static void isTrue(Boolean boo, String... message);
    public static void isFalse(Boolean boo, String... message);
    public static void isNotEmpty(Iterable<?> coll, String ... message);
    public static void equals(Object obj1, Object obj2, String ... message);
}
```

#### PageQuery 分页查询

```java
@Data
@Accessors(chain = true)
public class PageQuery {
    private Integer pageNo = 1;       // 默认页码
    private Integer pageSize = 20;    // 默认每页大小
    private Boolean isAsc = true;    // 是否升序
    private String sortBy;            // 排序字段

    public int from() {
        return (pageNo - 1) * pageSize;
    }

    // 转换为MyBatis-Plus分页
    public <T> Page<T> toMpPage(OrderItem ... orderItems);
    public <T> Page<T> toMpPage(String defaultSortBy, boolean isAsc);
    public <T> Page<T> toMpPageDefaultSortByCreateTimeDesc();
}
```

---

## 5. 依赖关系

### 5.1 Maven模块依赖树

```
tjxt (parent)
├── tj-common
│   ├── Spring Boot Starter
│   ├── Hutool
│   ├── MyBatis-Plus
│   ├── Redisson
│   └── Swagger
│
├── tj-api
│   ├── tj-common
│   ├── Spring Cloud OpenFeign
│   └── Sentinel
│
├── tj-auth (pom)
│   ├── tj-auth-common
│   ├── tj-auth-service
│   ├── tj-auth-resource-sdk
│   └── tj-auth-gateway-sdk
│
├── tj-gateway
│   └── Spring Cloud Gateway
│
├── tj-aigc
│   ├── tj-api
│   ├── tj-auth-resource-sdk
│   ├── Spring AI + Spring AI Alibaba (DashScope)
│   ├── MyBatis-Plus
│   ├── Redis
│   └── MongoDB
│
├── tj-user / tj-course / tj-learning / tj-trade 等业务服务
│   ├── tj-api
│   ├── tj-auth-resource-sdk
│   ├── MyBatis-Plus
│   ├── Redis + Redisson
│   └── Spring Cloud Alibaba (Nacos, Sentinel)
│
├── tj-search
│   ├── tj-api
│   └── Elasticsearch Client
│
└── tj-media
    ├── 阿里云OSS SDK
    └── 腾讯云COS/VOD SDK
```

### 5.2 主要中间件依赖

| 中间件 | 组件 | 版本 |
|--------|------|------|
| MySQL | mysql-connector-java | 8.0.23 |
| Redis | spring-boot-starter-data-redis | - |
| Redis | Redisson | 3.13.6 |
| RabbitMQ | spring-boot-starter-amqp | - |
| Elasticsearch | elasticsearch-rest-high-level-client | 7.12.1 |
| Nacos | spring-cloud-starter-alibaba-nacos | - |
| Sentinel | spring-cloud-starter-alibaba-sentinel | - |
| XXL-Job | xxl-job-core | 2.3.1 |
| Seata | spring-cloud-starter-alibaba-seata | 1.5.1 |

### 5.3 第三方SDK依赖

| SDK | 用途 |
|-----|------|
| aliyun-java-sdk-core | 阿里云基础SDK |
| aliyun-java-sdk-kms | 阿里云密钥管理 |
| alipay-sdk-java | 支付宝支付 |
| aliyun-sdk-oss | 阿里云对象存储 |
| tencentcloud-sdk-java | 腾讯云SDK |
| cos_api | 腾讯云COS |
| vod_api | 腾讯云VOD |
| dashscope-sdk-java | 阿里云通义千问 |

---

## 6. 项目运行方式

### 6.1 环境要求

| 要求 | 版本 |
|------|------|
| JDK | 17+ |
| Maven | 3.6+ |
| MySQL | 8.0+ |
| Redis | 6.0+ |
| RabbitMQ | 3.x |
| Elasticsearch | 7.x |
| Nacos | 2.x |
| XXL-Job | 2.3+ |
| Seata | 1.5+ |

### 6.2 构建项目

```bash
# 根目录执行
cd tjxt-javaai02

# 编译所有模块
mvn clean compile

# 跳过测试编译
mvn clean compile -DskipTests

# 打包所有模块
mvn clean package -DskipTests
```

### 6.3 启动顺序

```
1. Nacos (注册中心 + 配置中心)
2. MySQL (数据库)
3. Redis (缓存)
4. RabbitMQ (消息队列)
5. Elasticsearch (搜索)
6. XXL-Job (任务调度)
7. Seata Server (分布式事务)
8. tj-gateway (网关)
9. tj-auth (认证服务)
10. 业务服务 (tj-user, tj-course, tj-learning, tj-trade 等)
11. tj-aigc (AIGC服务)
```

### 6.4 各服务端口

| 服务 | 端口 |
|------|------|
| tj-gateway | 8070 |
| tj-auth | 8081 |
| tj-user | 8082 |
| tj-course | 8083 |
| tj-learning | 8084 |
| tj-trade | 8085 |
| tj-pay | 8086 |
| tj-media | 8087 |
| tj-search | 8088 |
| tj-exam | 8089 |
| tj-promotion | 8091 |
| tj-message | 8092 |
| tj-data | 8093 |
| tj-remark | 8095 |
| tj-aigc | 8094 |

### 6.5 配置文件说明

各服务配置文件位于 `src/main/resources/`:

| 文件 | 说明 |
|------|------|
| `application.yml` | 主配置 |
| `application-local.yml` | 本地开发配置 |
| `application-dev.yml` | 开发环境配置 |
| `application-test.yml` | 测试环境配置 |

### 6.6 Nacos配置

项目使用Nacos作为配置中心，配置项包括：
- 数据库连接
- Redis连接
- RabbitMQ连接
- AI模型配置（System Prompt等）
- 阿里云/腾讯云配置

### 6.7 Docker部署

项目根目录包含 `Dockerfile` 和 `startup.sh` 启动脚本。

---

## 7. API文档

各服务集成 Knife4j + Swagger 文档：

- 地址格式: `http://{host}:{port}/doc.html`
- 示例: `http://localhost:8094/doc.html` (AIGC服务)

---

## 8. 数据库

### 8.1 主要数据库

| 服务 | 数据库名 |
|------|----------|
| tj-auth | tj_auth |
| tj-user | tj_user |
| tj-course | tj_course |
| tj-learning | tj_learning |
| tj-trade | tj_trade |
| tj-pay | tj_pay |
| tj-media | tj_media |
| tj-search | tj_search |
| tj-exam | tj_exam |
| tj-promotion | tj_promotion |
| tj-data | tj_data |
| tj-remark | tj_remark |
| tj-aigc | tj_aigc |

### 8.2 SQL脚本位置

- `tj-aigc/src/main/resources/sql/` - AIGC服务SQL脚本

---

## 9. 注意事项

### 9.1 用户上下文传递

微服务间通过Feign调用时，用户上下文通过 `UserContext` (ThreadLocal) 传递，需配合Filter或Interceptor实现。

### 9.2 AI对话记忆

AIGC服务支持多种对话记忆存储方式，通过配置 `tj.ai.memory.type` 选择：
- `Redis` (默认)
- `MYSQL`
- `MongoDB`

### 9.3 系统提示词热更新

AIGC服务的系统提示词存储在Nacos配置中心，配置变更后自动热更新，无需重启服务。

### 9.4 工具调用流程

1. 用户提问 → Agent处理
2. 判断是否需要调用工具（CourseTools/OrderTools）
3. 工具执行结果存储到 `ToolResultHolder`
4. 工具结果返回给AI模型继续生成
5. 最终结果返回给用户
