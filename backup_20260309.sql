--
-- PostgreSQL database dump
--

\restrict tKKwi0uJzaYeR5nhQ2Itu2YyGphFbtQf3nvazQjDlX2zU5HSHvFZ4Ff11EWCF1s

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: ApiKeyStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ApiKeyStatus" AS ENUM (
    'active',
    'disabled',
    'expired'
);


--
-- Name: RechargeOrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RechargeOrderStatus" AS ENUM (
    'pending',
    'paid',
    'failed',
    'canceled'
);


--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'active',
    'canceled',
    'past_due',
    'unpaid'
);


--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionType" AS ENUM (
    'recharge',
    'usage',
    'refund',
    'adjustment'
);


--
-- Name: UsageStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UsageStatus" AS ENUM (
    'success',
    'error',
    'rate_limited'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    key_hash text NOT NULL,
    name text,
    status public."ApiKeyStatus" DEFAULT 'active'::public."ApiKeyStatus" NOT NULL,
    rate_limit_per_min integer DEFAULT 60 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_used_at timestamp(3) without time zone
);


--
-- Name: invite_code; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invite_code (
    id integer NOT NULL,
    code character varying(32) NOT NULL,
    user_id uuid NOT NULL,
    max_uses integer DEFAULT 1,
    used_count integer DEFAULT 0,
    expires_at text,
    created_at text
);


--
-- Name: TABLE invite_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.invite_code IS '邀请码表 - 存储用户生成的邀请码';


--
-- Name: invite_code_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invite_code_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invite_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invite_code_id_seq OWNED BY public.invite_code.id;


--
-- Name: invite_relation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invite_relation (
    id integer NOT NULL,
    inviter_id uuid NOT NULL,
    invitee_id uuid NOT NULL,
    invite_code character varying(32) NOT NULL,
    used_at text,
    recharge_reward_granted_at timestamp without time zone
);


--
-- Name: TABLE invite_relation; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.invite_relation IS '邀请关系表 - 记录邀请人和被邀请人的关系';


--
-- Name: COLUMN invite_relation.recharge_reward_granted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invite_relation.recharge_reward_granted_at IS '被邀请人首充奖励已发放时间（仅发放一次）';


--
-- Name: invite_relation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invite_relation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invite_relation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invite_relation_id_seq OWNED BY public.invite_relation.id;


--
-- Name: invite_reward_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invite_reward_record (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    rule_id integer NOT NULL,
    invite_count integer NOT NULL,
    reward_type character varying(20) NOT NULL,
    reward_value integer NOT NULL,
    reward_name text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    granted_at text,
    expires_at text,
    created_at text,
    CONSTRAINT chk_reward_record_status CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'granted'::character varying, 'expired'::character varying])::text[]))),
    CONSTRAINT chk_reward_record_type CHECK (((reward_type)::text = ANY ((ARRAY['points'::character varying, 'coupon'::character varying, 'vip_days'::character varying])::text[])))
);


--
-- Name: TABLE invite_reward_record; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.invite_reward_record IS '用户邀请奖励记录表 - 记录用户获得的邀请奖励';


--
-- Name: invite_reward_record_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invite_reward_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invite_reward_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invite_reward_record_id_seq OWNED BY public.invite_reward_record.id;


--
-- Name: invite_reward_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invite_reward_rule (
    id integer NOT NULL,
    invite_count integer NOT NULL,
    reward_type character varying(20) NOT NULL,
    reward_value integer NOT NULL,
    reward_name text NOT NULL,
    reward_description text,
    is_active boolean DEFAULT true,
    created_at text,
    updated_at text,
    CONSTRAINT chk_reward_type CHECK (((reward_type)::text = ANY ((ARRAY['points'::character varying, 'coupon'::character varying, 'vip_days'::character varying, 'balance'::character varying])::text[])))
);


--
-- Name: TABLE invite_reward_rule; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.invite_reward_rule IS '邀请奖励规则表 - 定义不同邀请人数对应的奖励';


--
-- Name: invite_reward_rule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invite_reward_rule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invite_reward_rule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invite_reward_rule_id_seq OWNED BY public.invite_reward_rule.id;


--
-- Name: model_pricing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_pricing (
    model_name text NOT NULL,
    input_price numeric(10,6) NOT NULL,
    output_price numeric(10,6) NOT NULL,
    provider text DEFAULT 'openai'::text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    provider_id integer,
    input_cost numeric(10,6),
    output_cost numeric(10,6),
    base_url text,
    max_tokens integer,
    description text,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id integer NOT NULL,
    provider_url text,
    tier text,
    is_virtual boolean DEFAULT false,
    capability jsonb,
    fallback_model text,
    fallback_provider text,
    fallback_provider_url text
);


--
-- Name: COLUMN model_pricing.provider_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.model_pricing.provider_id IS '所属供应商（可选）';


--
-- Name: COLUMN model_pricing.input_cost; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.model_pricing.input_cost IS '输入 token 成本价（每 1K tokens）';


--
-- Name: COLUMN model_pricing.output_cost; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.model_pricing.output_cost IS '输出 token 成本价（每 1K tokens）';


--
-- Name: COLUMN model_pricing.base_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.model_pricing.base_url IS '模型 base URL 覆盖（不填则用供应商默认）';


--
-- Name: COLUMN model_pricing.max_tokens; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.model_pricing.max_tokens IS '模型最大 token 数';


--
-- Name: COLUMN model_pricing.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.model_pricing.description IS '模型简介';


--
-- Name: COLUMN model_pricing.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.model_pricing.id IS '自增 id（便于引用，主键仍为 model_name）';


--
-- Name: model_pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.model_pricing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: model_pricing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.model_pricing_id_seq OWNED BY public.model_pricing.id;


--
-- Name: plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plans (
    id integer NOT NULL,
    name text NOT NULL,
    monthly_price numeric(10,2) NOT NULL,
    token_quota bigint NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plans_id_seq OWNED BY public.plans.id;


--
-- Name: providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.providers (
    id integer NOT NULL,
    code character varying(32) NOT NULL,
    name character varying(128),
    base_url text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE providers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.providers IS 'API 供应商表 - 基本信息与默认 base URL';


--
-- Name: COLUMN providers.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.providers.code IS '供应商代码（openai / anthropic / google / together / ollama）';


--
-- Name: COLUMN providers.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.providers.name IS '显示名称';


--
-- Name: COLUMN providers.base_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.providers.base_url IS '默认 base URL（模型可覆盖）';


--
-- Name: providers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.providers_id_seq OWNED BY public.providers.id;


--
-- Name: recharge_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recharge_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    biz_order_no character varying(255) NOT NULL,
    gateway_order_no character varying(255),
    amount numeric(12,4) NOT NULL,
    pay_provider character varying(20) NOT NULL,
    status public."RechargeOrderStatus" DEFAULT 'pending'::public."RechargeOrderStatus" NOT NULL,
    qrcode_url text,
    processed boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    paid_at timestamp without time zone,
    CONSTRAINT chk_pay_provider CHECK (((pay_provider)::text = ANY ((ARRAY['WECHAT'::character varying, 'ALIPAY'::character varying])::text[])))
);


--
-- Name: TABLE recharge_orders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.recharge_orders IS '充值订单表 - 记录用户充值订单信息';


--
-- Name: COLUMN recharge_orders.biz_order_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recharge_orders.biz_order_no IS '业务订单号（系统内部唯一）';


--
-- Name: COLUMN recharge_orders.gateway_order_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recharge_orders.gateway_order_no IS '网关订单号（支付网关返回）';


--
-- Name: COLUMN recharge_orders.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recharge_orders.amount IS '充值金额（元）';


--
-- Name: COLUMN recharge_orders.pay_provider; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recharge_orders.pay_provider IS '支付渠道（WECHAT/ALIPAY）';


--
-- Name: COLUMN recharge_orders.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recharge_orders.status IS '订单状态';


--
-- Name: COLUMN recharge_orders.qrcode_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recharge_orders.qrcode_url IS '支付二维码URL（NATIVE方式）';


--
-- Name: COLUMN recharge_orders.processed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recharge_orders.processed IS '是否已处理（幂等控制）';


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    plan_id integer NOT NULL,
    current_period_end timestamp(3) without time zone NOT NULL,
    status public."SubscriptionStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(12,4) NOT NULL,
    type public."TransactionType" NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: usage_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usage_logs (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    api_key_id uuid,
    model text NOT NULL,
    input_tokens integer NOT NULL,
    output_tokens integer NOT NULL,
    total_tokens integer NOT NULL,
    cost numeric(10,6) NOT NULL,
    latency_ms integer,
    status public."UsageStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    requested_model text,
    provider text,
    request_id text,
    saved_cost numeric(10,6) DEFAULT 0
);


--
-- Name: usage_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usage_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usage_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usage_logs_id_seq OWNED BY public.usage_logs.id;


--
-- Name: user_balances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_balances (
    user_id uuid NOT NULL,
    balance numeric(12,4) DEFAULT 0 NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_behavior_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_behavior_logs (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    function_name text NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone,
    duration_seconds double precision,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_behavior_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_behavior_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_behavior_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_behavior_logs_id_seq OWNED BY public.user_behavior_logs.id;


--
-- Name: user_login_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_login_logs (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    login_at timestamp without time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text
);


--
-- Name: user_login_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_login_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_login_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_login_logs_id_seq OWNED BY public.user_login_logs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    password text,
    role text DEFAULT 'user'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: invite_code id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_code ALTER COLUMN id SET DEFAULT nextval('public.invite_code_id_seq'::regclass);


--
-- Name: invite_relation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_relation ALTER COLUMN id SET DEFAULT nextval('public.invite_relation_id_seq'::regclass);


--
-- Name: invite_reward_record id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_reward_record ALTER COLUMN id SET DEFAULT nextval('public.invite_reward_record_id_seq'::regclass);


--
-- Name: invite_reward_rule id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_reward_rule ALTER COLUMN id SET DEFAULT nextval('public.invite_reward_rule_id_seq'::regclass);


--
-- Name: model_pricing id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_pricing ALTER COLUMN id SET DEFAULT nextval('public.model_pricing_id_seq'::regclass);


--
-- Name: plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans ALTER COLUMN id SET DEFAULT nextval('public.plans_id_seq'::regclass);


--
-- Name: providers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers ALTER COLUMN id SET DEFAULT nextval('public.providers_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: usage_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_logs ALTER COLUMN id SET DEFAULT nextval('public.usage_logs_id_seq'::regclass);


--
-- Name: user_behavior_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_behavior_logs ALTER COLUMN id SET DEFAULT nextval('public.user_behavior_logs_id_seq'::regclass);


--
-- Name: user_login_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_login_logs ALTER COLUMN id SET DEFAULT nextval('public.user_login_logs_id_seq'::regclass);


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_keys (id, user_id, key_hash, name, status, rate_limit_per_min, created_at, last_used_at) FROM stdin;
3db6b794-16c2-4d02-8354-8011972bbb21	a0000000-0000-4000-8000-000000000001	00ef91a2450a646fa8911c56a7c44153026f1d0bf572a46d9eaa5181dadd90e4	Gateway 测试 Key	active	60	2026-02-27 17:17:24.68	\N
83f41e39-1b47-4432-bab9-8adfaa7c1f52	c73f74d2-2028-4c54-882b-e2bea2b036a0	20c82062f0431aca7ed83fd4e0c04b1fd3b6dd88b3eb97e1a18c25fbde6ffe4d	\N	disabled	60	2026-02-28 08:16:23.427	\N
c5251902-ef20-4abe-bc9c-1282293461fe	c73f74d2-2028-4c54-882b-e2bea2b036a0	89fcf5d2361d1e277d9b3c9fcb24ba67c4960cc6dc32db6d5775838cb52446b1	\N	active	60	2026-02-28 08:20:08.655	\N
\.


--
-- Data for Name: invite_code; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invite_code (id, code, user_id, max_uses, used_count, expires_at, created_at) FROM stdin;
1	4FN3	c73f74d2-2028-4c54-882b-e2bea2b036a0	999999	1	\N	2026-02-28T03:28:14.949Z
2	9TH2	c73f74d2-2028-4c54-882b-e2bea2b036a0	999999	0	\N	2026-02-28T06:57:43.586Z
3	C2MT	c73f74d2-2028-4c54-882b-e2bea2b036a0	999999	2	\N	2026-02-28T07:11:37.857Z
\.


--
-- Data for Name: invite_relation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invite_relation (id, inviter_id, invitee_id, invite_code, used_at, recharge_reward_granted_at) FROM stdin;
1	c73f74d2-2028-4c54-882b-e2bea2b036a0	24af4aa7-947b-4559-836f-3ac1a7a91b71	4FN3	2026-02-28T04:00:03.990Z	\N
2	c73f74d2-2028-4c54-882b-e2bea2b036a0	676c4f17-d17f-418a-ac46-f456220b027f	C2MT	2026-02-28T07:17:05.505Z	\N
3	c73f74d2-2028-4c54-882b-e2bea2b036a0	0a4b414f-1874-43f8-8c9f-2b5e5225ef69	C2MT	2026-03-09T01:53:20.284Z	2026-03-09 01:58:41.479
\.


--
-- Data for Name: invite_reward_record; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invite_reward_record (id, user_id, rule_id, invite_count, reward_type, reward_value, reward_name, status, granted_at, expires_at, created_at) FROM stdin;
1	c73f74d2-2028-4c54-882b-e2bea2b036a0	6	1	points	100	邀请成功奖励100积分	granted	2026-02-28T04:00:03.990Z	\N	2026-02-28T04:00:03.990Z
2	c73f74d2-2028-4c54-882b-e2bea2b036a0	1	1	points	100	100积分	granted	2026-02-28T04:00:03.990Z	\N	2026-02-28T04:00:03.990Z
3	c73f74d2-2028-4c54-882b-e2bea2b036a0	6	1	points	100	邀请成功奖励100积分	granted	2026-02-28T07:17:05.505Z	\N	2026-02-28T07:17:05.505Z
4	c73f74d2-2028-4c54-882b-e2bea2b036a0	6	2	points	100	邀请成功奖励100积分	granted	2026-03-09T01:53:20.284Z	\N	2026-03-09T01:53:20.284Z
\.


--
-- Data for Name: invite_reward_rule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invite_reward_rule (id, invite_count, reward_type, reward_value, reward_name, reward_description, is_active, created_at, updated_at) FROM stdin;
1	1	points	100	100积分	邀请1人注册获得100积分	t	2026-02-28 03:24:40.070173+00	\N
2	5	points	500	500积分	邀请5人注册获得500积分	t	2026-02-28 03:24:40.070173+00	\N
3	10	points	1000	1000积分	邀请10人注册获得1000积分	t	2026-02-28 03:24:40.070173+00	\N
4	20	points	2000	2000积分	邀请20人注册获得2000积分	t	2026-02-28 03:24:40.070173+00	\N
5	50	points	5000	5000积分	邀请50人注册获得5000积分	t	2026-02-28 03:24:40.070173+00	\N
11	0	balance	20	被邀请人首充奖励	被邀请人首次充值时邀请人获得的余额奖励；reward_type=balance 时 reward_value 单位为元	t	2026-03-06 21:56:13.427981+00	2026-03-06 21:56:13.427981+00
6	-1	points	100	邀请成功奖励100积分	每成功邀请一位好友注册，立即获得 100 积分	t	2026-02-28T04:00:03.990Z	2026-03-09T01:53:20.284Z
\.


--
-- Data for Name: model_pricing; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.model_pricing (model_name, input_price, output_price, provider, enabled, created_at, provider_id, input_cost, output_cost, base_url, max_tokens, description, updated_at, id, provider_url, tier, is_virtual, capability, fallback_model, fallback_provider, fallback_provider_url) FROM stdin;
auto	0.000000	0.000000	openai	t	2026-03-09 03:42:54.704	\N	\N	\N	\N	\N	\N	2026-03-09 03:42:54.704	8	\N	balanced	t	\N	\N	\N	\N
eco	0.000000	0.000000	openai	t	2026-03-09 03:42:54.704	\N	\N	\N	\N	\N	\N	2026-03-09 03:42:54.704	9	\N	eco	t	\N	\N	\N	\N
premium	0.000000	0.000000	openai	t	2026-03-09 03:42:54.704	\N	\N	\N	\N	\N	\N	2026-03-09 03:42:54.704	10	\N	premium	t	\N	\N	\N	\N
gpt-4o-mini	0.000150	0.000600	openai	t	2026-03-09 03:42:54.704	\N	\N	\N	\N	\N	\N	2026-03-09 03:42:54.704	12	https://api.openai.com/v1	eco	f	{"max_context": 128000, "supports_json": true, "supports_tools": true, "supports_vision": true}	\N	\N	\N
gpt-4o	0.005000	0.015000	openai	t	2026-02-27 17:17:24.68	1	\N	\N	\N	\N	\N	2026-03-06 11:11:18.931	1	https://api.openai.com/v1	premium	f	{"max_context": 128000, "supports_json": true, "supports_tools": true, "supports_vision": true}	\N	\N	\N
qwen2.5:7b-instruct	1.100000	0.200000	ollama	t	2026-03-06 05:53:19.866	5	\N	\N	\N	\N	\N	2026-03-06 11:59:45.758	2	http://localhost:11434/v1	\N	f	\N	\N	\N	\N
qwen3.5:27b	1.500000	0.500000	ollama	t	2026-03-08 22:46:19.866	5	\N	\N	\N	\N	\N	2026-03-08 22:46:19.866	3	http://localhost:11434/v1	\N	f	\N	\N	\N	\N
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plans (id, name, monthly_price, token_quota, created_at) FROM stdin;
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.providers (id, code, name, base_url, created_at, updated_at) FROM stdin;
1	openai	OpenAI	https://api.openai.com/v1	2026-03-06 11:14:03.376	2026-03-06 11:14:03.376
2	anthropic	Anthropic	https://api.anthropic.com	2026-03-06 11:14:03.376	2026-03-06 11:14:03.376
3	google	Google	https://generativelanguage.googleapis.com/v1beta	2026-03-06 11:14:03.376	2026-03-06 11:14:03.376
4	together	Together AI	https://api.together.xyz/v1	2026-03-06 11:14:03.376	2026-03-06 11:14:03.376
5	ollama	Ollama	http://localhost:11434/v1	2026-03-06 11:14:03.376	2026-03-06 11:14:03.376
\.


--
-- Data for Name: recharge_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recharge_orders (id, user_id, biz_order_no, gateway_order_no, amount, pay_provider, status, qrcode_url, processed, created_at, updated_at, paid_at) FROM stdin;
c78e5ff8-c720-45c1-a99e-6875fed13e3f	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772514661681_CPNT1U	GW20260303131102623567	1.0000	WECHAT	pending	\N	f	2026-03-03 05:11:04.676	2026-03-03 05:11:04.676	\N
7017e495-90ab-423a-9dd4-a04f997241e5	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772516331185_P4X0JA	GW20260303133854289586	1.0000	WECHAT	pending	\N	f	2026-03-03 05:38:56.527	2026-03-03 05:38:56.527	\N
d7ad2f0e-8081-4f52-b7cb-315678a51aae	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772516351018_SEH77L	GW20260303133912214722	1.0000	WECHAT	pending	\N	f	2026-03-03 05:39:15.879	2026-03-03 05:39:15.879	\N
6faf252f-8b23-418d-b1eb-62802b9de0cf	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772516536640_MYQ87Y	GW20260303134217706351	1.0000	WECHAT	pending	weixin://wxpay/bizpayurl?pr=QRj9pHMz1	f	2026-03-03 05:42:22.554	2026-03-03 05:42:22.554	\N
2d3ce6ea-83db-4997-ad60-27f97116dc96	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772516578624_LX9G2Q	GW20260303134259473956	1.0000	WECHAT	pending	weixin://wxpay/bizpayurl?pr=XcY2Y6Yz1	f	2026-03-03 05:43:02.849	2026-03-03 05:43:02.849	\N
ec2566b9-b426-4ae0-951b-aa5751cfe91a	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772516863982_XLZ1EQ	GW20260303134744704506	1.0000	WECHAT	pending	weixin://wxpay/bizpayurl?pr=nF5fTqHz3	f	2026-03-03 05:47:48.942	2026-03-03 05:47:48.942	\N
2fca4745-9cca-451b-a221-460b75e16202	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772516904515_9KX7IO	GW20260303134825234112	1.0000	WECHAT	pending	weixin://wxpay/bizpayurl?pr=lJq4vcoz3	f	2026-03-03 05:48:28.952	2026-03-03 05:48:28.952	\N
911509b4-15f4-46b9-87b1-477fc5393c04	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772518557287_77PQN0	GW20260303141558662133	1.0000	WECHAT	pending	weixin://wxpay/bizpayurl?pr=VoFKUZJz1	f	2026-03-03 06:16:03.221	2026-03-03 06:16:03.221	\N
a28ea363-1d71-4e88-a7c9-ead5d9972784	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772519293615_Z44VI0	GW20260303142814410872	1.0000	WECHAT	pending	weixin://wxpay/bizpayurl?pr=oSLMt3Vz3	f	2026-03-03 06:28:19.372	2026-03-03 06:28:19.372	\N
94eca77a-3ded-44c6-9de4-9601cd987f0e	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772519612374_3NMUR9	GW20260303143333811079	1.0000	WECHAT	pending	weixin://wxpay/bizpayurl?pr=vw92NEkz1	f	2026-03-03 06:33:38.28	2026-03-03 06:33:38.28	\N
9712ca6d-8109-4eb5-be1e-b7a4b2ca0798	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772519776847_IYPH8Z	GW20260303143618329123	1.0000	WECHAT	pending	weixin://wxpay/bizpayurl?pr=Hd3JiyYz1	f	2026-03-03 06:36:23.04	2026-03-03 06:36:23.04	\N
dd8bf0ad-6717-4371-a2f1-3a9ab1d5cfa5	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772519900982_G5NCZY	GW20260303143821354090	1.0000	WECHAT	pending	weixin://wxpay/bizpayurl?pr=lBgrEcLz1	f	2026-03-03 06:38:26.392	2026-03-03 06:38:26.392	\N
7f0753e8-7ee2-4fdc-9b1f-6930bd80e631	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772520265813_221V1E	GW20260303144426666909	1.0000	WECHAT	paid	weixin://wxpay/bizpayurl?pr=SVyuOTqz1	t	2026-03-03 06:44:31.768	2026-03-03 06:54:37.487	2026-03-03 06:54:37.483
593544c8-8950-4dfd-8730-bcd9a1250abb	c73f74d2-2028-4c54-882b-e2bea2b036a0	RECHARGE_1772520919619_SAL8U4	GW20260303145520764933	1.0000	WECHAT	paid	weixin://wxpay/bizpayurl?pr=hcPKHkAz3	t	2026-03-03 06:55:24.122	2026-03-03 06:55:34.861	2026-03-03 06:55:34.86
c65472ef-9f74-40a8-91c6-509ff195570b	0a4b414f-1874-43f8-8c9f-2b5e5225ef69	RECHARGE_1773021507862_CP2PWZ	GW20260309095828556809	1.0000	WECHAT	paid	weixin://wxpay/bizpayurl?pr=PlaW9Exz1	t	2026-03-09 01:58:30.098	2026-03-09 01:58:41.12	2026-03-09 01:58:41.117
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, user_id, plan_id, current_period_end, status, created_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, user_id, amount, type, description, created_at) FROM stdin;
1	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=12	2026-02-27 17:22:08.832
2	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=11	2026-02-27 17:22:26.929
3	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=12	2026-02-27 17:26:59.849
4	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=12	2026-02-27 17:28:08.588
5	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=12	2026-02-27 17:28:17.257
6	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=12	2026-02-27 17:29:22.412
7	a0000000-0000-4000-8000-000000000001	-0.0085	usage	model=gpt-4o, tokens=574	2026-02-27 17:29:33.797
8	a0000000-0000-4000-8000-000000000001	-0.0068	usage	model=gpt-4o, tokens=459	2026-02-27 17:31:55.703
9	a0000000-0000-4000-8000-000000000001	-0.0073	usage	model=gpt-4o, tokens=494	2026-02-27 17:40:00.038
10	a0000000-0000-4000-8000-000000000001	-0.0086	usage	model=gpt-4o, tokens=580	2026-02-27 17:40:41.084
11	a0000000-0000-4000-8000-000000000001	-0.0090	usage	model=gpt-4o, tokens=605	2026-02-27 17:41:37.59
12	a0000000-0000-4000-8000-000000000001	-0.0077	usage	model=gpt-4o, tokens=518	2026-02-27 17:41:53.276
13	a0000000-0000-4000-8000-000000000001	-0.0085	usage	model=gpt-4o, tokens=576	2026-02-27 18:20:21.417
14	a0000000-0000-4000-8000-000000000001	-0.0080	usage	model=gpt-4o, tokens=542	2026-02-27 18:21:00.089
15	a0000000-0000-4000-8000-000000000001	-0.0098	usage	model=gpt-4o, tokens=660	2026-02-27 18:24:44.021
16	a0000000-0000-4000-8000-000000000001	-0.0085	usage	model=gpt-4o, tokens=571	2026-02-27 18:25:34.874
17	a0000000-0000-4000-8000-000000000001	-0.0072	usage	model=gpt-4o, tokens=484	2026-02-28 04:59:35.224
18	a0000000-0000-4000-8000-000000000001	-0.0083	usage	model=gpt-4o, tokens=557	2026-02-28 05:01:47.065
19	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=15	2026-02-28 08:12:38.668
20	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=15	2026-02-28 08:12:55.217
21	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=17	2026-02-28 08:26:06.299
22	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=16	2026-02-28 08:26:11.274
23	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=16	2026-02-28 08:27:42.081
24	a0000000-0000-4000-8000-000000000001	-0.0002	usage	model=gpt-4o, tokens=21	2026-02-28 08:27:57.624
25	a0000000-0000-4000-8000-000000000001	-0.0003	usage	model=gpt-4o, tokens=27	2026-02-28 08:33:13.806
26	a0000000-0000-4000-8000-000000000001	-0.0002	usage	model=gpt-4o, tokens=22	2026-02-28 08:33:16.723
27	a0000000-0000-4000-8000-000000000001	-0.0002	usage	model=gpt-4o, tokens=25	2026-02-28 08:33:19.496
28	a0000000-0000-4000-8000-000000000001	-0.0009	usage	model=gpt-4o, tokens=71	2026-02-28 08:33:27.673
29	a0000000-0000-4000-8000-000000000001	-0.0026	usage	model=gpt-4o, tokens=182	2026-02-28 08:33:39.608
30	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=17	2026-02-28 08:36:25.887
31	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=17	2026-02-28 08:36:27.044
32	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=17	2026-02-28 08:36:46.186
33	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=16	2026-02-28 08:38:07.691
34	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=17	2026-02-28 08:38:37.368
35	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=16	2026-02-28 08:39:41.14
36	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=17	2026-02-28 08:41:40.122
37	a0000000-0000-4000-8000-000000000001	-0.0001	usage	model=gpt-4o, tokens=16	2026-02-28 08:42:02.186
38	a0000000-0000-4000-8000-000000000001	-0.0005	usage	model=gpt-4o, tokens=43	2026-02-28 08:42:21.253
39	a0000000-0000-4000-8000-000000000001	-0.0006	usage	model=gpt-4o, tokens=48	2026-02-28 08:51:01.016
40	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0001	usage	model=gpt-4o, tokens=17	2026-02-28 09:36:28.141
41	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0003	usage	model=gpt-4o, tokens=28	2026-02-28 10:22:07.204
42	c73f74d2-2028-4c54-882b-e2bea2b036a0	1.0000	recharge	充值订单 RECHARGE_1772520265813_221V1E	2026-03-03 06:54:38.737
43	c73f74d2-2028-4c54-882b-e2bea2b036a0	1.0000	recharge	充值订单 RECHARGE_1772520919619_SAL8U4	2026-03-03 06:55:35.897
44	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=25	2026-03-05 04:28:33.31
45	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0281	usage	model=gpt-4o, tokens=5606	2026-03-05 05:41:30.088
46	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0284	usage	model=gpt-4o, tokens=5625	2026-03-05 05:44:28.743
47	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=20	2026-03-05 05:48:01.445
48	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0281	usage	model=gpt-4o, tokens=5607	2026-03-05 05:53:26.702
49	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0286	usage	model=gpt-4o, tokens=5639	2026-03-05 05:56:50.792
50	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0283	usage	model=gpt-4o, tokens=5616	2026-03-05 06:07:37.052
51	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0284	usage	model=gpt-4o, tokens=5623	2026-03-05 06:11:41.177
52	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0287	usage	model=gpt-4o, tokens=5642	2026-03-05 06:20:18.92
53	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0281	usage	model=gpt-4o, tokens=5601	2026-03-05 06:26:45.35
54	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0281	usage	model=gpt-4o, tokens=5601	2026-03-05 06:33:15.325
55	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0281	usage	model=gpt-4o, tokens=5601	2026-03-05 07:09:03.225
56	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0281	usage	model=gpt-4o, tokens=5601	2026-03-05 07:25:15.964
57	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1386	usage	model=gpt-4o, tokens=27676	2026-03-05 08:51:33.65
58	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1389	usage	model=gpt-4o, tokens=27744	2026-03-05 09:13:30.33
59	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1395	usage	model=gpt-4o, tokens=27845	2026-03-05 09:22:25.684
60	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0603	usage	model=gpt-4o, tokens=12006	2026-03-05 10:18:16.54
61	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1400	usage	model=gpt-4o, tokens=27946	2026-03-05 10:18:45.932
62	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1403	usage	model=gpt-4o, tokens=28025	2026-03-05 14:02:51.855
63	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1413	usage	model=gpt-4o, tokens=28221	2026-03-06 00:53:56.776
64	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1416	usage	model=gpt-4o, tokens=28284	2026-03-06 01:07:45.162
65	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1419	usage	model=gpt-4o, tokens=28369	2026-03-06 01:08:21.284
66	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1422	usage	model=gpt-4o, tokens=28431	2026-03-06 01:09:54.816
67	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1427	usage	model=gpt-4o, tokens=28529	2026-03-06 01:10:21.03
68	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1432	usage	model=gpt-4o, tokens=28621	2026-03-06 03:28:19.945
69	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1436	usage	model=gpt-4o, tokens=28710	2026-03-06 03:37:30.162
70	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1443	usage	model=gpt-4o, tokens=28819	2026-03-06 03:43:11.515
71	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0001	usage	model=gpt-4o, tokens=15	2026-03-06 03:46:23.32
72	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1471	usage	model=gpt-4o, tokens=29374	2026-03-06 04:15:58.11
73	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=17	2026-03-06 04:22:15.721
74	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1472	usage	model=gpt-4o, tokens=29381	2026-03-06 04:27:44.106
75	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1481	usage	model=gpt-4o, tokens=29540	2026-03-06 04:29:28.859
76	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1484	usage	model=gpt-4o, tokens=29661	2026-03-06 04:29:36.291
77	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1486	usage	model=gpt-4o, tokens=29670	2026-03-06 04:29:44.478
78	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1496	usage	model=gpt-4o, tokens=29895	2026-03-06 04:29:51.19
79	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1503	usage	model=gpt-4o, tokens=91150	2026-03-06 04:29:56.985
80	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1509	usage	model=gpt-4o, tokens=30141	2026-03-06 04:30:05.021
81	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1516	usage	model=gpt-4o, tokens=30274	2026-03-06 04:30:14.607
82	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1522	usage	model=gpt-4o, tokens=30403	2026-03-06 04:30:23.351
84	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1534	usage	model=gpt-4o, tokens=30656	2026-03-06 04:30:44.291
83	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1528	usage	model=gpt-4o, tokens=30531	2026-03-06 04:30:33.506
85	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=qwen2.5:7b-instruct, tokens=49	2026-03-06 05:55:10.882
86	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=qwen2.5:7b-instruct, tokens=51	2026-03-06 05:55:49.656
87	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0049	usage	model=qwen2.5:7b-instruct, tokens=40	2026-03-06 06:37:33.673
88	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0048	usage	model=qwen2.5:7b-instruct, tokens=41	2026-03-06 07:18:54.063
89	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0048	usage	model=qwen2.5:7b-instruct, tokens=41	2026-03-06 07:19:42.753
90	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=17	2026-03-07 15:43:54.219
91	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0352	usage	model=qwen2.5:7b-instruct, tokens=41	2026-03-08 15:09:38.648
92	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1000	usage	model=qwen3.5:27b, tokens=178	2026-03-08 15:11:16.086
93	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.3005	usage	model=qwen3.5:27b, tokens=579	2026-03-09 00:41:39.117
94	0a4b414f-1874-43f8-8c9f-2b5e5225ef69	1.0000	recharge	充值订单 RECHARGE_1773021507862_CP2PWZ	2026-03-09 01:58:41.318
95	c73f74d2-2028-4c54-882b-e2bea2b036a0	20.0000	adjustment	邀请奖励-被邀请人首充	2026-03-09 01:58:41.519
96	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0356	usage	model=qwen2.5:7b-instruct, tokens=43	2026-03-09 02:27:11.448
97	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=17	2026-03-09 02:30:14.818
98	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0010	usage	model=gpt-4o, tokens=75	2026-03-09 04:39:29.637
99	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0013	usage	model=gpt-4o, tokens=92	2026-03-09 04:48:34.16
100	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0010	usage	model=gpt-4o, tokens=74	2026-03-09 05:17:57.811
101	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=24	2026-03-09 05:18:06.708
102	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0009	usage	model=gpt-4o, tokens=68	2026-03-09 05:21:18.402
103	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=21	2026-03-09 05:21:26.478
104	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0009	usage	model=gpt-4o, tokens=70	2026-03-09 05:24:27.23
105	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=20	2026-03-09 05:24:34.022
106	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0008	usage	model=gpt-4o, tokens=59	2026-03-09 06:16:00.02
107	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=20	2026-03-09 06:16:19.795
108	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0010	usage	model=gpt-4o, tokens=73	2026-03-09 06:26:21.243
109	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=21	2026-03-09 06:26:41.693
110	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0005	usage	model=gpt-4o-mini, tokens=820	2026-03-09 06:27:02.131
111	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=20	2026-03-09 06:27:08.527
112	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0008	usage	model=gpt-4o, tokens=64	2026-03-09 06:31:33.702
113	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=23	2026-03-09 06:31:46.635
114	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0005	usage	model=gpt-4o-mini, tokens=796	2026-03-09 06:32:07.878
115	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=23	2026-03-09 06:32:19.059
116	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=22	2026-03-09 06:39:08.708
117	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0402	usage	model=qwen2.5:7b-instruct, tokens=48	2026-03-09 06:41:21.432
118	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=20	2026-03-09 06:42:51.876
119	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=20	2026-03-09 06:43:14.71
120	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=20	2026-03-09 06:43:42.66
121	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=20	2026-03-09 06:43:54.645
122	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=20	2026-03-09 06:44:11.967
123	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=22	2026-03-09 06:48:28.171
124	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0076	usage	model=gpt-4o, tokens=513	2026-03-09 06:49:16.161
125	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0408	usage	model=qwen2.5:7b-instruct, tokens=42	2026-03-09 06:50:38.526
126	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0001	usage	model=gpt-4o, tokens=18	2026-03-09 06:52:11.58
127	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0001	usage	model=gpt-4o, tokens=16	2026-03-09 06:52:33.185
128	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0001	usage	model=gpt-4o, tokens=17	2026-03-09 06:52:48.479
129	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0001	usage	model=gpt-4o, tokens=16	2026-03-09 06:56:50.485
130	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0001	usage	model=gpt-4o, tokens=16	2026-03-09 06:59:40.417
131	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0001	usage	model=gpt-4o, tokens=16	2026-03-09 07:02:40.704
132	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=35	2026-03-09 07:05:37.012
133	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=26	2026-03-09 07:06:02.606
134	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=25	2026-03-09 07:14:01.525
135	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=26	2026-03-09 07:15:18.001
136	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=26	2026-03-09 07:17:01.027
137	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=25	2026-03-09 07:17:12.15
138	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.2865	usage	model=qwen3.5:27b, tokens=551	2026-03-09 08:31:26.666
139	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0009	usage	model=gpt-4o, tokens=67	2026-03-09 08:45:26.03
140	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=21	2026-03-09 08:45:27.871
141	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=19	2026-03-09 08:45:32.334
142	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0012	usage	model=gpt-4o, tokens=88	2026-03-09 08:46:06.7
143	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=23	2026-03-09 08:46:08.278
144	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0002	usage	model=gpt-4o, tokens=21	2026-03-09 08:46:15.362
145	c73f74d2-2028-4c54-882b-e2bea2b036a0	0.0000	usage	model=gpt-4o-mini, tokens=20	2026-03-09 09:14:43.098
146	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0088	usage	model=gpt-4o, tokens=595	2026-03-09 09:15:34.13
147	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1969	usage	model=gpt-4o, tokens=39363	2026-03-09 09:37:45.481
148	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.1980	usage	model=gpt-4o, tokens=39507	2026-03-09 09:38:33.609
149	c73f74d2-2028-4c54-882b-e2bea2b036a0	-0.0059	usage	model=gpt-4o-mini, tokens=39605	2026-03-09 11:05:21.596
150	c73f74d2-2028-4c54-882b-e2bea2b036a0	-36.0640	usage	model=qwen2.5:7b-instruct, tokens=32864	2026-03-09 11:06:50.216
\.


--
-- Data for Name: usage_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usage_logs (id, user_id, api_key_id, model, input_tokens, output_tokens, total_tokens, cost, latency_ms, status, created_at, requested_model, provider, request_id, saved_cost) FROM stdin;
1	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	2	12	0.000080	2296	success	2026-02-27 17:22:08.832	\N	\N	\N	0.000000
2	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	1	11	0.000065	1308	success	2026-02-27 17:22:26.929	\N	\N	\N	0.000000
3	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	2	12	0.000080	1885	success	2026-02-27 17:26:59.849	\N	\N	\N	0.000000
4	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	2	12	0.000080	988	success	2026-02-27 17:28:08.588	\N	\N	\N	0.000000
5	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	2	12	0.000080	1028	success	2026-02-27 17:28:17.257	\N	\N	\N	0.000000
6	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	2	12	0.000080	577	success	2026-02-27 17:29:22.412	\N	\N	\N	0.000000
7	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	564	574	0.008510	9447	success	2026-02-27 17:29:33.797	\N	\N	\N	0.000000
8	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	449	459	0.006785	17959	success	2026-02-27 17:31:55.703	\N	\N	\N	0.000000
9	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	484	494	0.007310	14470	success	2026-02-27 17:40:00.038	\N	\N	\N	0.000000
10	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	570	580	0.008600	19249	success	2026-02-27 17:40:41.084	\N	\N	\N	0.000000
11	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	595	605	0.008975	13467	success	2026-02-27 17:41:37.59	\N	\N	\N	0.000000
12	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	508	518	0.007670	12998	success	2026-02-27 17:41:53.276	\N	\N	\N	0.000000
13	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	566	576	0.008540	20086	success	2026-02-27 18:20:21.417	\N	\N	\N	0.000000
14	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	532	542	0.008030	9694	success	2026-02-27 18:21:00.089	\N	\N	\N	0.000000
15	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	650	660	0.009800	11208	success	2026-02-27 18:24:44.021	\N	\N	\N	0.000000
16	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	561	571	0.008465	9227	success	2026-02-27 18:25:34.874	\N	\N	\N	0.000000
17	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	474	484	0.007160	13259	success	2026-02-28 04:59:35.224	\N	\N	\N	0.000000
18	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	10	547	557	0.008255	10566	success	2026-02-28 05:01:47.065	\N	\N	\N	0.000000
19	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	2	15	0.000095	3613	success	2026-02-28 08:12:38.668	\N	\N	\N	0.000000
20	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	2	15	0.000095	1629	success	2026-02-28 08:12:55.217	\N	\N	\N	0.000000
21	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	4	17	0.000125	2885	success	2026-02-28 08:26:06.299	\N	\N	\N	0.000000
22	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	3	16	0.000110	1427	success	2026-02-28 08:26:11.274	\N	\N	\N	0.000000
23	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	3	16	0.000110	1016	success	2026-02-28 08:27:42.081	\N	\N	\N	0.000000
24	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	8	21	0.000185	2107	success	2026-02-28 08:27:57.624	\N	\N	\N	0.000000
25	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	14	27	0.000275	2198	success	2026-02-28 08:33:13.806	\N	\N	\N	0.000000
26	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	9	22	0.000200	837	success	2026-02-28 08:33:16.723	\N	\N	\N	0.000000
27	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	12	25	0.000245	1513	success	2026-02-28 08:33:19.496	\N	\N	\N	0.000000
28	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	58	71	0.000935	1372	success	2026-02-28 08:33:27.673	\N	\N	\N	0.000000
29	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	169	182	0.002600	2425	success	2026-02-28 08:33:39.608	\N	\N	\N	0.000000
30	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	4	17	0.000125	2423	success	2026-02-28 08:36:25.887	\N	\N	\N	0.000000
31	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	4	17	0.000125	879	success	2026-02-28 08:36:27.044	\N	\N	\N	0.000000
32	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	4	17	0.000125	970	success	2026-02-28 08:36:46.186	\N	\N	\N	0.000000
33	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	3	16	0.000110	3273	success	2026-02-28 08:38:07.691	\N	\N	\N	0.000000
34	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	4	17	0.000125	593	success	2026-02-28 08:38:37.368	\N	\N	\N	0.000000
35	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	3	16	0.000110	805	success	2026-02-28 08:39:41.14	\N	\N	\N	0.000000
36	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	4	17	0.000125	2244	success	2026-02-28 08:41:40.122	\N	\N	\N	0.000000
37	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	3	16	0.000110	648	success	2026-02-28 08:42:02.186	\N	\N	\N	0.000000
38	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	30	43	0.000515	1054	success	2026-02-28 08:42:21.253	\N	\N	\N	0.000000
39	a0000000-0000-4000-8000-000000000001	3db6b794-16c2-4d02-8354-8011972bbb21	gpt-4o	13	35	48	0.000590	2350	success	2026-02-28 08:51:01.016	\N	\N	\N	0.000000
40	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	4	17	0.000125	2020	success	2026-02-28 09:36:28.141	\N	\N	\N	0.000000
41	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	16	12	28	0.000260	9400	success	2026-02-28 10:22:07.204	\N	\N	\N	0.000000
42	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	16	9	25	0.000215	6458	success	2026-03-05 04:28:33.31	\N	\N	\N	0.000000
43	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	5598	8	5606	0.028110	8251	success	2026-03-05 05:41:30.088	\N	\N	\N	0.000000
44	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	5598	27	5625	0.028395	4985	success	2026-03-05 05:44:28.743	\N	\N	\N	0.000000
45	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	14	6	20	0.000160	4686	success	2026-03-05 05:48:01.445	\N	\N	\N	0.000000
46	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	5598	9	5607	0.028125	4402	success	2026-03-05 05:53:26.702	\N	\N	\N	0.000000
47	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	5598	41	5639	0.028605	6097	success	2026-03-05 05:56:50.792	\N	\N	\N	0.000000
48	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	5596	20	5616	0.028280	8271	success	2026-03-05 06:07:37.052	\N	\N	\N	0.000000
49	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	5596	27	5623	0.028385	8510	success	2026-03-05 06:11:41.177	\N	\N	\N	0.000000
50	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	5596	46	5642	0.028670	6782	success	2026-03-05 06:20:18.92	\N	\N	\N	0.000000
51	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	5592	9	5601	0.028095	6823	success	2026-03-05 06:26:45.35	\N	\N	\N	0.000000
52	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	5592	9	5601	0.028095	3649	success	2026-03-05 06:33:15.325	\N	\N	\N	0.000000
53	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	5592	9	5601	0.028095	7308	success	2026-03-05 07:09:03.225	\N	\N	\N	0.000000
54	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	5592	9	5601	0.028095	3830	success	2026-03-05 07:25:15.964	\N	\N	\N	0.000000
55	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	27653	23	27676	0.138610	6296	success	2026-03-05 08:51:33.65	\N	\N	\N	0.000000
56	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	27723	21	27744	0.138930	6224	success	2026-03-05 09:13:30.33	\N	\N	\N	0.000000
57	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	27820	25	27845	0.139475	7637	success	2026-03-05 09:22:25.684	\N	\N	\N	0.000000
58	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	11975	31	12006	0.060340	4866	success	2026-03-05 10:18:16.54	\N	\N	\N	0.000000
59	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	27920	26	27946	0.139990	3557	success	2026-03-05 10:18:45.932	\N	\N	\N	0.000000
60	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	28012	13	28025	0.140255	9107	success	2026-03-05 14:02:51.855	\N	\N	\N	0.000000
61	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	28198	23	28221	0.141335	7890	success	2026-03-06 00:53:56.776	\N	openai	\N	0.000000
62	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	28264	20	28284	0.141620	6603	success	2026-03-06 01:07:45.162	\N	openai	\N	0.000000
63	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	28360	9	28369	0.141935	3625	success	2026-03-06 01:08:21.284	\N	openai	\N	0.000000
64	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	28426	5	28431	0.142205	2873	success	2026-03-06 01:09:54.816	\N	openai	\N	0.000000
65	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	28521	8	28529	0.142725	3013	success	2026-03-06 01:10:21.03	\N	openai	\N	0.000000
66	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	28612	9	28621	0.143195	6833	success	2026-03-06 03:28:19.945	\N	openai	\N	0.000000
67	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	28701	9	28710	0.143640	5402	success	2026-03-06 03:37:30.162	\N	openai	\N	0.000000
68	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	28799	20	28819	0.144295	11340	success	2026-03-06 03:43:11.515	\N	openai	\N	0.000000
69	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	12	3	15	0.000105	5249	success	2026-03-06 03:46:23.32	\N	openai	\N	0.000000
70	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	29350	24	29374	0.147110	10868	success	2026-03-06 04:15:58.11	\N	openai	\N	0.000000
71	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	8	9	17	0.000175	4916	success	2026-03-06 04:22:15.721	\N	openai	\N	0.000000
72	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	29355	26	29381	0.147165	3711	success	2026-03-06 04:27:44.106	\N	openai	\N	0.000000
73	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	29496	44	29540	0.148140	3901	success	2026-03-06 04:29:28.859	\N	openai	\N	0.000000
74	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	29656	5	29661	0.148355	5363	success	2026-03-06 04:29:36.291	\N	openai	\N	0.000000
75	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	29650	20	29670	0.148550	6495	success	2026-03-06 04:29:44.478	\N	openai	\N	0.000000
76	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	29881	14	29895	0.149615	5232	success	2026-03-06 04:29:51.19	\N	openai	\N	0.000000
77	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	29989	21	91150	0.150260	2879	success	2026-03-06 04:29:56.985	\N	openai	\N	0.000000
78	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	30120	21	30141	0.150915	3882	success	2026-03-06 04:30:05.021	\N	openai	\N	0.000000
79	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	30251	23	30274	0.151600	2889	success	2026-03-06 04:30:14.607	\N	openai	\N	0.000000
80	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	30384	19	30403	0.152205	2234	success	2026-03-06 04:30:23.351	\N	openai	\N	0.000000
81	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	30513	18	30531	0.152835	2546	success	2026-03-06 04:30:33.506	\N	openai	\N	0.000000
82	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	30641	15	30656	0.153430	3186	success	2026-03-06 04:30:44.291	\N	openai	\N	0.000000
83	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen2.5:7b-instruct	31	18	49	0.000000	25887	success	2026-03-06 05:55:10.882	\N	ollama	\N	0.000000
84	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen2.5:7b-instruct	31	20	51	0.000000	6954	success	2026-03-06 05:55:49.656	\N	ollama	\N	0.000000
85	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen2.5:7b-instruct	31	9	40	0.004900	8435	success	2026-03-06 06:37:33.673	\N	ollama	\N	0.000000
86	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen2.5:7b-instruct	34	7	41	0.004800	22067	success	2026-03-06 07:18:54.063	\N	ollama	\N	0.000000
87	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen2.5:7b-instruct	34	7	41	0.004800	4604	success	2026-03-06 07:19:42.753	\N	ollama	\N	0.000000
88	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	8	9	17	0.000175	2487	success	2026-03-07 15:43:54.219	\N	openai	\N	0.000000
89	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen2.5:7b-instruct	30	11	41	0.035200	2675	success	2026-03-08 15:09:38.648	\N	ollama	\N	0.000000
90	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen3.5:27b	11	167	178	0.100000	21368	success	2026-03-08 15:11:16.086	\N	ollama	\N	0.000000
91	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen3.5:27b	11	568	579	0.300500	33618	success	2026-03-09 00:41:39.117	\N	ollama	\N	0.000000
92	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen2.5:7b-instruct	30	13	43	0.035600	19965	success	2026-03-09 02:27:11.448	\N	ollama	\N	0.000000
93	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	8	9	17	0.000175	2430	success	2026-03-09 02:30:14.818	\N	openai	\N	0.000000
94	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	62	75	0.000995	5508	success	2026-03-09 04:39:29.637	\N	openai	\N	0.000000
95	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	79	92	0.001250	3891	success	2026-03-09 04:48:34.16	\N	openai	\N	0.000000
96	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	61	74	0.000980	4888	success	2026-03-09 05:17:57.811	\N	openai	\N	0.000000
97	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	16	8	24	0.000007	2779	success	2026-03-09 05:18:06.708	gpt-4o	openai	\N	0.000000
98	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	55	68	0.000890	5174	success	2026-03-09 05:21:18.402	\N	openai	\N	0.000000
99	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	16	5	21	0.000005	2299	success	2026-03-09 05:21:26.478	gpt-4o	openai	\N	0.000000
100	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	57	70	0.000920	5172	success	2026-03-09 05:24:27.23	\N	openai	\N	0.000000
101	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	16	4	20	0.000005	2271	success	2026-03-09 05:24:34.022	gpt-4o	openai	\N	0.000000
102	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	46	59	0.000755	14922	success	2026-03-09 06:16:00.02	\N	openai	\N	0.000000
103	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	16	4	20	0.000005	7083	success	2026-03-09 06:16:19.795	gpt-4o	openai	\N	0.000000
104	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	60	73	0.000965	18400	success	2026-03-09 06:26:21.243	\N	openai	\N	0.000000
105	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	14	7	21	0.000006	20064	success	2026-03-09 06:26:41.693	eco	openai	\N	0.000000
106	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	26	794	820	0.000480	20069	success	2026-03-09 06:27:02.131	auto	openai	\N	0.000000
107	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	16	4	20	0.000005	5522	success	2026-03-09 06:27:08.527	gpt-4o	openai	\N	0.000000
108	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	51	64	0.000830	14096	success	2026-03-09 06:31:33.702	\N	openai	\N	0.000000
109	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	14	9	23	0.000008	12174	success	2026-03-09 06:31:46.635	eco	openai	\N	0.000000
110	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	26	770	796	0.000466	20319	success	2026-03-09 06:32:07.878	auto	openai	\N	0.000000
111	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	16	7	23	0.000007	10103	success	2026-03-09 06:32:19.059	gpt-4o	openai	\N	0.000000
112	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	13	9	22	0.000007	27277	success	2026-03-09 06:39:08.708	eco	openai	\N	0.000000
113	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen2.5:7b-instruct	34	14	48	0.040200	36516	success	2026-03-09 06:41:21.432	balanced	ollama	\N	0.000000
114	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	7	20	0.000170	12393	success	2026-03-09 06:42:51.876	premium	openai	\N	0.000000
115	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	7	20	0.000170	4763	success	2026-03-09 06:43:14.71	premium	openai	\N	0.000000
116	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	7	20	0.000170	4043	success	2026-03-09 06:43:42.66	premium	openai	\N	0.000000
117	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	7	20	0.000170	7412	success	2026-03-09 06:43:54.645	premium	openai	\N	0.000000
118	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	7	20	0.000170	4039	success	2026-03-09 06:44:11.967	premium	openai	\N	0.000000
119	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	9	22	0.000200	8273	success	2026-03-09 06:48:28.171	premium	openai	\N	0.000000
120	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	10	503	513	0.007595	11607	success	2026-03-09 06:49:16.161	premium	openai	\N	0.000000
121	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen2.5:7b-instruct	36	6	42	0.040800	13375	success	2026-03-09 06:50:38.526	\N	ollama	\N	0.000000
122	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	5	18	0.000140	8459	success	2026-03-09 06:52:11.58	\N	openai	\N	0.000000
123	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	3	16	0.000110	17586	success	2026-03-09 06:52:33.185	\N	openai	\N	0.000000
124	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	4	17	0.000125	4308	success	2026-03-09 06:52:48.479	\N	openai	\N	0.000000
125	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	3	16	0.000110	13142	success	2026-03-09 06:56:50.485	\N	openai	\N	0.000000
126	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	3	16	0.000110	7426	success	2026-03-09 06:59:40.417	\N	openai	\N	0.000000
127	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	3	16	0.000110	9553	success	2026-03-09 07:02:40.704	\N	openai	\N	0.000000
128	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	13	22	35	0.000015	11952	success	2026-03-09 07:05:37.012	eco	openai	\N	0.000000
129	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	13	13	26	0.000010	5316	success	2026-03-09 07:06:02.606	eco	openai	\N	0.000000
130	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	13	12	25	0.000009	2558	success	2026-03-09 07:14:01.525	eco	openai	\N	0.000000
131	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	13	13	26	0.000010	1682	success	2026-03-09 07:15:18.001	eco	openai	\N	0.000000
132	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	13	13	26	0.000010	2461	success	2026-03-09 07:17:01.027	eco	openai	\N	0.000000
133	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	13	12	25	0.000009	2254	success	2026-03-09 07:17:12.15	eco	openai	\N	0.000000
134	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen3.5:27b	11	540	551	0.286500	33033	success	2026-03-09 08:31:26.666	\N	ollama	\N	0.000000
135	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	54	67	0.000875	2343	success	2026-03-09 08:45:26.03	\N	openai	\N	0.000000
136	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	14	7	21	0.000006	1783	success	2026-03-09 08:45:27.871	eco	openai	\N	0.000000
137	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	16	3	19	0.000004	2361	success	2026-03-09 08:45:32.334	gpt-4o	openai	\N	0.000000
138	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	13	75	88	0.001190	1530	success	2026-03-09 08:46:06.7	\N	openai	\N	0.000000
139	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	14	9	23	0.000008	1527	success	2026-03-09 08:46:08.278	eco	openai	\N	0.000000
140	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	16	5	21	0.000155	4982	success	2026-03-09 08:46:15.362	\N	openai	\N	0.000000
141	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	13	7	20	0.000006	2034	success	2026-03-09 09:14:43.098	eco	openai	\N	0.000000
142	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	10	585	595	0.008825	16545	success	2026-03-09 09:15:34.13	premium	openai	\N	0.000000
143	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	39351	12	39363	0.196935	5635	success	2026-03-09 09:37:45.481	\N	openai	\N	0.000000
144	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o	39460	47	39507	0.198005	2426	success	2026-03-09 09:38:33.609	\N	openai	\N	0.000000
145	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	gpt-4o-mini	39596	9	39605	0.005945	7634	success	2026-03-09 11:05:21.596	auto	openai	\N	0.000000
146	c73f74d2-2028-4c54-882b-e2bea2b036a0	c5251902-ef20-4abe-bc9c-1282293461fe	qwen2.5:7b-instruct	32768	96	32864	36.064000	16351	success	2026-03-09 11:06:50.216	auto	ollama	\N	0.000000
\.


--
-- Data for Name: user_balances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_balances (user_id, balance, updated_at) FROM stdin;
a0000000-0000-4000-8000-000000000001	9.8944	2026-02-28 08:51:01.016
0a4b414f-1874-43f8-8c9f-2b5e5225ef69	1.0000	2026-03-09 01:58:41.277
c73f74d2-2028-4c54-882b-e2bea2b036a0	980.6418	2026-03-09 11:06:50.216
\.


--
-- Data for Name: user_behavior_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_behavior_logs (id, user_id, email, function_name, start_time, end_time, duration_seconds, created_at) FROM stdin;
\.


--
-- Data for Name: user_login_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_login_logs (id, user_id, email, login_at, ip_address, user_agent) FROM stdin;
1	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-02-28 03:10:34.252	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
2	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-02-28 03:44:41.301	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
3	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-02-28 04:01:01.572	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
4	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-02-28 06:38:30.503	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
5	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-02-28 06:42:46.603	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
6	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-02-28 06:56:29.401	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
7	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-02-28 07:01:38.297	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
8	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-02-28 07:17:29.462	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
9	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-02-28 08:14:20.407	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
10	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-02-28 09:45:13.034	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
11	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-01 03:21:53.357	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
12	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-01 03:42:33.848	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
13	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-02 00:42:31.583	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
14	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-02 10:54:33.656	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
15	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-02 12:24:42.048	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
16	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-03 00:46:14.985	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
17	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-03 05:01:44.067	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
18	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-03 06:28:05.576	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
19	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-05 03:13:44.249	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
20	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-06 00:46:12.485	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
21	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-06 07:12:40.429	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
22	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-06 07:12:51.713	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
23	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-06 08:39:12.947	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
24	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-06 08:52:25.79	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
25	d4fce005-c487-4584-8cec-d8b1a7e27574	admin@admin.local	2026-03-06 11:31:50.384	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
26	d4fce005-c487-4584-8cec-d8b1a7e27574	admin@admin.local	2026-03-06 22:01:06.108	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
27	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-07 14:11:55.564	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
28	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-07 15:25:01.145	183.241.38.97	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
29	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-07 15:45:09.087	183.241.38.97	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
30	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-08 14:43:06.733	183.241.38.97	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
31	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-08 14:43:21.145	183.241.38.97	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
32	4a742823-4b78-428c-bf10-a33dff50c07c	1@qq.com	2026-03-09 00:39:49.013	183.241.38.97	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
33	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-09 00:40:02.321	183.241.38.97	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
34	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-09 01:16:30.238	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
35	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-09 01:53:33.587	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
36	0a4b414f-1874-43f8-8c9f-2b5e5225ef69	4@qq.com	2026-03-09 01:54:11.755	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
37	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-09 01:58:57.374	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
38	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-09 04:00:46.93	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
39	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-09 07:43:38.249	183.241.38.97	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
40	c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	2026-03-09 11:05:38.249	44.245.168.192	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, role, created_at, updated_at) FROM stdin;
a0000000-0000-4000-8000-000000000001	test@gateway.local	\N	user	2026-02-27 17:17:24.68	2026-02-27 17:17:24.68
24af4aa7-947b-4559-836f-3ac1a7a91b71	2@qq.com	$2a$10$Tqjt0N7k.F8oMutY4Et5h.d57d36a7Bfz0iPXSSt1g3CRe/LrNkjG	user	2026-02-28 04:00:03.109	2026-02-28 04:00:03.109
676c4f17-d17f-418a-ac46-f456220b027f	3@qq.com	$2a$10$EPU03p7vFOpKR07vzLsSy.AQTXzE4RiboQI9rv.M64Gs/QIMZtLM2	user	2026-02-28 07:17:04.236	2026-02-28 07:17:04.236
d4fce005-c487-4584-8cec-d8b1a7e27574	admin@admin.local	$2a$10$xxaBWJBKe9FhZC4j7M9sy.LugbkzDnMchqrOK1aNa6U1ZIYY3ZmcW	superadmin	2026-03-06 11:31:10.547	2026-03-06 22:01:05.915
4a742823-4b78-428c-bf10-a33dff50c07c	1@qq.com	$2a$10$hSf0NQjcVFhd0C9ai6xMguHIfZllWm3ueD.mfgzMI26EihnKB0ye2	user	2026-02-28 03:44:21.752	2026-03-09 00:39:49.011
0a4b414f-1874-43f8-8c9f-2b5e5225ef69	4@qq.com	$2a$10$biWeJJmyTerbFJ03OD4.BOoDeoUuJ3C2NXqSC3m0gXM9GdQ4xr74e	user	2026-03-09 01:53:20.198	2026-03-09 01:54:11.714
c73f74d2-2028-4c54-882b-e2bea2b036a0	675025854@qq.com	$2a$10$eKgl6b0TkAhVah74jMyhc.08L16dQONDQTxkdlWDBLzVWiTjK63PC	user	2026-02-28 03:09:11.948	2026-03-09 11:05:38.241
\.


--
-- Name: invite_code_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invite_code_id_seq', 3, true);


--
-- Name: invite_relation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invite_relation_id_seq', 3, true);


--
-- Name: invite_reward_record_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invite_reward_record_id_seq', 4, true);


--
-- Name: invite_reward_rule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invite_reward_rule_id_seq', 12, true);


--
-- Name: model_pricing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.model_pricing_id_seq', 13, true);


--
-- Name: plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.plans_id_seq', 1, false);


--
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.providers_id_seq', 5, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transactions_id_seq', 150, true);


--
-- Name: usage_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usage_logs_id_seq', 146, true);


--
-- Name: user_behavior_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_behavior_logs_id_seq', 1, false);


--
-- Name: user_login_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_login_logs_id_seq', 40, true);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: invite_code invite_code_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_code
    ADD CONSTRAINT invite_code_code_key UNIQUE (code);


--
-- Name: invite_code invite_code_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_code
    ADD CONSTRAINT invite_code_pkey PRIMARY KEY (id);


--
-- Name: invite_relation invite_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_relation
    ADD CONSTRAINT invite_relation_pkey PRIMARY KEY (id);


--
-- Name: invite_reward_record invite_reward_record_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_reward_record
    ADD CONSTRAINT invite_reward_record_pkey PRIMARY KEY (id);


--
-- Name: invite_reward_rule invite_reward_rule_invite_count_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_reward_rule
    ADD CONSTRAINT invite_reward_rule_invite_count_key UNIQUE (invite_count);


--
-- Name: invite_reward_rule invite_reward_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_reward_rule
    ADD CONSTRAINT invite_reward_rule_pkey PRIMARY KEY (id);


--
-- Name: model_pricing model_pricing_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_pricing
    ADD CONSTRAINT model_pricing_id_key UNIQUE (id);


--
-- Name: model_pricing model_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_pricing
    ADD CONSTRAINT model_pricing_pkey PRIMARY KEY (model_name);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: providers providers_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_code_key UNIQUE (code);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- Name: recharge_orders recharge_orders_biz_order_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recharge_orders
    ADD CONSTRAINT recharge_orders_biz_order_no_key UNIQUE (biz_order_no);


--
-- Name: recharge_orders recharge_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recharge_orders
    ADD CONSTRAINT recharge_orders_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: usage_logs usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_logs
    ADD CONSTRAINT usage_logs_pkey PRIMARY KEY (id);


--
-- Name: user_balances user_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_balances
    ADD CONSTRAINT user_balances_pkey PRIMARY KEY (user_id);


--
-- Name: user_behavior_logs user_behavior_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_behavior_logs
    ADD CONSTRAINT user_behavior_logs_pkey PRIMARY KEY (id);


--
-- Name: user_login_logs user_login_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_login_logs
    ADD CONSTRAINT user_login_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_api_keys_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_keys_user ON public.api_keys USING btree (user_id);


--
-- Name: idx_invite_code_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_code_code ON public.invite_code USING btree (code);


--
-- Name: idx_invite_code_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_code_user_id ON public.invite_code USING btree (user_id);


--
-- Name: idx_invite_relation_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_relation_code ON public.invite_relation USING btree (invite_code);


--
-- Name: idx_invite_relation_invitee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_relation_invitee_id ON public.invite_relation USING btree (invitee_id);


--
-- Name: idx_invite_relation_inviter_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_relation_inviter_id ON public.invite_relation USING btree (inviter_id);


--
-- Name: idx_invite_reward_record_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_reward_record_created_at ON public.invite_reward_record USING btree (created_at);


--
-- Name: idx_invite_reward_record_rule_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_reward_record_rule_id ON public.invite_reward_record USING btree (rule_id);


--
-- Name: idx_invite_reward_record_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_reward_record_status ON public.invite_reward_record USING btree (status);


--
-- Name: idx_invite_reward_record_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_reward_record_user_id ON public.invite_reward_record USING btree (user_id);


--
-- Name: idx_invite_reward_rule_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_reward_rule_active ON public.invite_reward_rule USING btree (is_active);


--
-- Name: idx_invite_reward_rule_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_reward_rule_count ON public.invite_reward_rule USING btree (invite_count);


--
-- Name: idx_model_pricing_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_model_pricing_provider_id ON public.model_pricing USING btree (provider_id);


--
-- Name: idx_providers_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_providers_code ON public.providers USING btree (code);


--
-- Name: idx_recharge_orders_biz_order_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recharge_orders_biz_order_no ON public.recharge_orders USING btree (biz_order_no);


--
-- Name: idx_recharge_orders_gateway_order_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recharge_orders_gateway_order_no ON public.recharge_orders USING btree (gateway_order_no);


--
-- Name: idx_recharge_orders_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recharge_orders_user_created ON public.recharge_orders USING btree (user_id, created_at);


--
-- Name: idx_tx_user_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tx_user_time ON public.transactions USING btree (user_id, created_at);


--
-- Name: idx_usage_model; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usage_model ON public.usage_logs USING btree (model);


--
-- Name: idx_usage_user_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usage_user_time ON public.usage_logs USING btree (user_id, created_at);


--
-- Name: idx_user_behavior_logs_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_behavior_logs_email ON public.user_behavior_logs USING btree (email);


--
-- Name: idx_user_behavior_logs_function_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_behavior_logs_function_name ON public.user_behavior_logs USING btree (function_name);


--
-- Name: idx_user_behavior_logs_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_behavior_logs_start_time ON public.user_behavior_logs USING btree (start_time);


--
-- Name: idx_user_behavior_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_behavior_logs_user_id ON public.user_behavior_logs USING btree (user_id);


--
-- Name: idx_user_login_logs_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_login_logs_email ON public.user_login_logs USING btree (email);


--
-- Name: idx_user_login_logs_login_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_login_logs_login_at ON public.user_login_logs USING btree (login_at);


--
-- Name: idx_user_login_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_login_logs_user_id ON public.user_login_logs USING btree (user_id);


--
-- Name: subscriptions_user_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscriptions_user_id_status_idx ON public.subscriptions USING btree (user_id, status);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: api_keys api_keys_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invite_code fk_invite_code_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_code
    ADD CONSTRAINT fk_invite_code_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: invite_relation fk_invite_relation_invitee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_relation
    ADD CONSTRAINT fk_invite_relation_invitee FOREIGN KEY (invitee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: invite_relation fk_invite_relation_inviter; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_relation
    ADD CONSTRAINT fk_invite_relation_inviter FOREIGN KEY (inviter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recharge_orders fk_recharge_order_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recharge_orders
    ADD CONSTRAINT fk_recharge_order_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: invite_reward_record fk_reward_record_rule; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_reward_record
    ADD CONSTRAINT fk_reward_record_rule FOREIGN KEY (rule_id) REFERENCES public.invite_reward_rule(id) ON DELETE RESTRICT;


--
-- Name: invite_reward_record fk_reward_record_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_reward_record
    ADD CONSTRAINT fk_reward_record_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_behavior_logs fk_user_behavior_logs_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_behavior_logs
    ADD CONSTRAINT fk_user_behavior_logs_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_login_logs fk_user_login_logs_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_login_logs
    ADD CONSTRAINT fk_user_login_logs_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: model_pricing model_pricing_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_pricing
    ADD CONSTRAINT model_pricing_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE SET NULL;


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usage_logs usage_logs_api_key_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_logs
    ADD CONSTRAINT usage_logs_api_key_id_fkey FOREIGN KEY (api_key_id) REFERENCES public.api_keys(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: usage_logs usage_logs_model_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_logs
    ADD CONSTRAINT usage_logs_model_fkey FOREIGN KEY (model) REFERENCES public.model_pricing(model_name) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usage_logs usage_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_logs
    ADD CONSTRAINT usage_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_balances user_balances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_balances
    ADD CONSTRAINT user_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict tKKwi0uJzaYeR5nhQ2Itu2YyGphFbtQf3nvazQjDlX2zU5HSHvFZ4Ff11EWCF1s

