"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Step-2 核心技术专题：万亿参数 MoE 的从头训练与系统协同优化</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">返回 14.7-StepFun 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="1-mxdwyfbbj">1. 模型定位与发布背景</h2>
<table>
<thead>
<tr>
<th>维度</th>
<th>规格</th>
</tr>
</thead>
<tbody><tr>
<td><strong>预览版发布</strong></td>
<td>2024 年 3 月 23 日，2024 全球开发者先锋大会(上海)</td>
</tr>
<tr>
<td><strong>正式版发布</strong></td>
<td>2024 年 7 月 4 日，世界人工智能大会(WAIC)</td>
</tr>
<tr>
<td><strong>发布机构</strong></td>
<td>阶跃星辰(StepFun)，创始人姜大昕(前微软全球副总裁)</td>
</tr>
<tr>
<td><strong>总参数量</strong></td>
<td>万亿级(1T+)</td>
</tr>
<tr>
<td><strong>架构</strong></td>
<td>MoE(Mixture of Experts，混合专家)</td>
</tr>
<tr>
<td><strong>训练方式</strong></td>
<td><strong>完全自主研发，从头训练</strong>(非 upcycle 复用)</td>
</tr>
</tbody></table>
<p>Step-2 是中国大陆首批公开的<strong>万亿参数级别</strong>语言大模型之一。在 2024 年初的「六大大模型独角兽」格局中(月之暗面、智谱、MiniMax、百川、零一万物、阶跃星辰)，阶跃星辰是其中唯一在首次亮相即宣布万亿参数模型的玩家。这不仅是一次参数规模的宣示，更是一套「系统-算法-数据」三方协同的工程能力展示。</p>
<hr>
<h2 id="2-hxjgjc-ctxl-vs-upcycle">2. 核心架构决策：从头训练 vs Upcycle</h2>
<h3 id="2-1-moe-xldlzfs">2.1 MoE 训练的两种范式</h3>
<p>当前 MoE 模型的训练方式主要有两种：</p>
<table>
<thead>
<tr>
<th>方式</th>
<th>原理</th>
<th>优势</th>
<th>劣势</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Upcycle(向上复用)</strong></td>
<td>将已训练好的 Dense 模型的 FFN 权重复制多份，每份作为一个 Expert</td>
<td>训练效率高，算力需求小几个量级</td>
<td>专家同质化严重，模型上限低</td>
</tr>
<tr>
<td><strong>从头训练(From Scratch)</strong></td>
<td>从零初始化 MoE 架构，所有专家独立学习</td>
<td>专家异质化充分，模型上限高</td>
<td>训练难度极高，对系统和算法要求苛刻</td>
</tr>
</tbody></table>
<h3 id="2-2-jyxcdxz-ctxl">2.2 阶跃星辰的选择：从头训练</h3>
<p>阶跃星辰在千亿模型(Step-1)训练完成后，直接启动了万亿模型的训练。团队认为：<strong>「想把模型参数扩大到万亿的话，MoE 几乎是一个必选项。」</strong></p>
<p>Step-2 的核心 MoE 创新包括：</p>
<ul>
<li><strong>部分专家共享参数</strong>：并非所有专家完全独立，而是通过共享底层表示降低冗余，同时保留顶层专家的 specialization。</li>
<li><strong>异构化专家设计</strong>：不同专家承担不同类型的计算负载(如部分专家专攻长程依赖，部分专攻局部模式)，避免「所有专家做同一件事」的同质化陷阱。</li>
<li><strong>激活参数超过大部分 Dense 模型</strong>：虽然总参数量达到万亿级，但每次前向传播激活的参数经过精心设计，其实际计算量超过了当时市面上大部分 Dense 架构模型。</li>
</ul>
<blockquote>
<p><strong>工程权衡</strong>：从头训练的代价是训练稳定性极难控制。万亿参数 MoE 的专家路由(gating network)在训练初期极易出现「专家崩溃」(expert collapse)——少数专家垄断所有输入，大部分专家闲置。阶跃星辰通过系统层面的负载均衡和算法层面的辅助损失函数，解决了这一问题。</p>
</blockquote>
<hr>
<h2 id="3-xttp-wycsd-jj-tz">3. 系统突破：万亿参数的「基建」挑战</h2>
<p>训练万亿参数模型对<strong>算力、系统、数据、算法</strong>四个维度都提出了极高要求。阶跃星辰在系统层面的突破尤为关键：</p>
<h3 id="3-1-6d-bhcl">3.1 6D 并行策略</h3>
<table>
<thead>
<tr>
<th>并行维度</th>
<th>作用</th>
<th>万亿参数下的必要性</th>
</tr>
</thead>
<tbody><tr>
<td><strong>数据并行(DP)</strong></td>
<td>将 batch 分到不同设备</td>
<td>基础，所有大规模训练必备</td>
</tr>
<tr>
<td><strong>张量并行(TP)</strong></td>
<td>将单层参数切分到多卡</td>
<td>单卡无法容纳一层参数</td>
</tr>
<tr>
<td><strong>流水线并行(PP)</strong></td>
<td>将不同层分到不同设备</td>
<td>减少气泡，提高吞吐量</td>
</tr>
<tr>
<td><strong>序列并行(SP)</strong></td>
<td>将长序列切分到多卡</td>
<td>支持长上下文训练</td>
</tr>
<tr>
<td><strong>专家并行(EP)</strong></td>
<td>将不同专家分到不同设备</td>
<td><strong>MoE 特有</strong>，核心维度</td>
</tr>
<tr>
<td><strong>ZeRO 优化器状态分片</strong></td>
<td>分散优化器状态存储</td>
<td>降低单卡显存压力</td>
</tr>
</tbody></table>
<p><strong>6D 并行</strong>意味着阶跃星辰同时组合了上述六种并行策略。这不是简单的叠加——每一种并行都会引入通信开销，组合后的通信模式极为复杂。团队此前在微软期间实践过<strong>单集群万卡以上</strong>的系统建设与管理，这一经验直接转化为 Step-2 的训练基础设施。</p>
<h3 id="3-2-jzxcglyzdhyw">3.2 极致显存管理与自动化运维</h3>
<ul>
<li><strong>显存管理</strong>：万亿参数模型的优化器状态(Adam 的一阶/二阶动量)本身就需要 TB 级显存。阶跃星辰通过梯度检查点(gradient checkpointing)、激活重计算、以及可能的 CPU offloading 技术，将显存峰值控制在可管理范围。</li>
<li><strong>自动化运维</strong>：万卡集群的故障率是惊人的——平均每天可能有数张 GPU 故障。完全自动化运维系统能够在秒级检测到故障卡、迁移其负载、并继续训练，避免人工介入导致的小时级中断。</li>
</ul>
<h3 id="3-3-mfu-yxslscs">3.3 MFU：有效算力输出率</h3>
<p>阶跃星辰透露，其训练千亿模型的<strong>有效算力输出率(MFU, Model FLOPs Utilization)达到 57%</strong>。MFU 是衡量大规模训练效率的核心指标：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>MFU</mtext><mo>=</mo><mfrac><mtext>实际完成的模型 FLOPs</mtext><mrow><mtext>GPU 理论峰值 FLOPs</mtext><mo>×</mo><mtext>时间</mtext></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\text{MFU} = \\frac{\\text{实际完成的模型 FLOPs}}{\\text{GPU 理论峰值 FLOPs} \\times \\text{时间}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">MFU</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1297em;vertical-align:-0.7693em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">GPU </span><span class="mord cjk_fallback">理论峰值</span><span class="mord"> FLOPs</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord cjk_fallback">时间</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord cjk_fallback">实际完成的模型</span><span class="mord"> FLOPs</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7693em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><table>
<thead>
<tr>
<th>对比对象</th>
<th>MFU</th>
<th>来源</th>
</tr>
</thead>
<tbody><tr>
<td>Step-1(千亿级)</td>
<td><strong>57%</strong></td>
<td>阶跃星辰公开数据</td>
</tr>
<tr>
<td>GPT-3(175B)</td>
<td>~21%</td>
<td>公开估算</td>
</tr>
<tr>
<td>LLaMA-2(70B)</td>
<td>~40%</td>
<td>Meta 技术报告</td>
</tr>
<tr>
<td>行业顶尖水平</td>
<td>50-60%</td>
<td>2024 年业界最佳实践</td>
</tr>
</tbody></table>
<p>57% 的 MFU 意味着阶跃星辰的系统工程能力已处于行业第一梯队。对于万亿参数的 Step-2，虽然 MFU 具体数字未公开，但基础设施的复用保证了其训练效率不会大幅衰减。</p>
<hr>
<h2 id="4-sjgc-byjyd-zstplsx">4. 数据工程：必应基因的「知识图谱流水线」</h2>
<h3 id="4-1-tdbj">4.1 团队背景</h3>
<p>阶跃星辰数据团队的核心骨干来自<strong>微软必应(Bing)搜索引擎</strong>，曾支持全球 100 多种语言、为 200 多个国家和地区提供服务。这一背景赋予了团队独特的数据能力：</p>
<ul>
<li><strong>全球互联网语料分布的深刻理解</strong>：知道高质量中文、英文、小语种语料在互联网上的分布规律。</li>
<li><strong>大规模数据清洗经验</strong>：搜索引擎每天处理数十亿网页，其数据去重、质量评分、垃圾过滤的 pipeline 可直接迁移到大模型预训练。</li>
<li><strong>知识图谱构建能力</strong>：搜索引擎的知识图谱技术(实体识别、关系抽取、结构化表示)为大模型提供了高质量的结构化监督信号。</li>
</ul>
<h3 id="4-2-zstplsx">4.2 知识图谱流水线</h3>
<p>阶跃星辰建立了**「数据处理 + 知识图谱」双流水线**：</p>
<ol>
<li><strong>原始语料采集</strong>：覆盖网页、书籍、代码、学术论文、多语言对话等多模态来源。</li>
<li><strong>质量分层</strong>：通过多维度评分(信息密度、语言质量、事实准确性、时效性)将语料分为多个等级。</li>
<li><strong>知识图谱增强</strong>：将非结构化文本中的实体和关系抽取为结构化知识，在预训练中作为额外的监督信号。</li>
<li><strong>去重与去污染</strong>：采用近似重复检测(minhash/LSH)和敏感内容过滤，避免测试集泄漏和有害内容。</li>
</ol>
<blockquote>
<p><strong>差异化优势</strong>：多数大模型公司的数据团队来自 NLP 研究背景，擅长学术数据集; 而阶跃星辰的数据团队来自工业级搜索引擎，更擅长处理<strong>海量、 noisy、多语言、实时更新</strong>的真实互联网数据。</p>
</blockquote>
<hr>
<h2 id="5-xndw-bj-gpt-4-d-tg">5. 性能定位：逼近 GPT-4 的「体感」</h2>
<h3 id="5-1-nlhx">5.1 能力画像</h3>
<p>据阶跃星辰公开信息，Step-2 在以下维度「体感全面逼近 GPT-4」：</p>
<table>
<thead>
<tr>
<th>能力维度</th>
<th>Step-2 表现</th>
<th>备注</th>
</tr>
</thead>
<tbody><tr>
<td>数理逻辑</td>
<td>接近 GPT-4</td>
<td>专门的数学训练数据集</td>
</tr>
<tr>
<td>编程</td>
<td>接近 GPT-4</td>
<td>代码数据占比高</td>
</tr>
<tr>
<td>中文知识</td>
<td>接近 GPT-4</td>
<td>中文语料质量优势</td>
</tr>
<tr>
<td>英文知识</td>
<td>接近 GPT-4</td>
<td>必应团队的英文语料积累</td>
</tr>
<tr>
<td>指令跟随</td>
<td>接近 GPT-4</td>
<td>RLHF 对齐</td>
</tr>
<tr>
<td>多轮对话</td>
<td>接近 GPT-4</td>
<td>对话数据清洗精细</td>
</tr>
</tbody></table>
<h3 id="5-2-y-step-1-ddjdb">5.2 与 Step-1 的代际对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Step-1</th>
<th>Step-2</th>
<th>跃迁意义</th>
</tr>
</thead>
<tbody><tr>
<td>参数量</td>
<td>~千亿</td>
<td>~万亿</td>
<td><strong>10× 规模跃升</strong></td>
</tr>
<tr>
<td>架构</td>
<td>Dense</td>
<td>MoE</td>
<td>稀疏激活，效率突破</td>
</tr>
<tr>
<td>训练方式</td>
<td>标准预训练</td>
<td>从头训练 MoE</td>
<td>避免专家同质化</td>
</tr>
<tr>
<td>MFU</td>
<td>57%</td>
<td>未公开(预计类似)</td>
<td>系统能力复用</td>
</tr>
<tr>
<td>上下文</td>
<td>未公开</td>
<td>未公开</td>
<td>—</td>
</tr>
<tr>
<td>API 可用性</td>
<td>已开放</td>
<td>预览版邀请制</td>
<td>逐步开放</td>
</tr>
</tbody></table>
<hr>
<h2 id="6-jxxyfx">6. 局限性与风险</h2>
<h3 id="6-1-xxbtm">6.1 信息不透明</h3>
<p>Step-2 的核心技术细节(如专家数量、激活参数比例、具体的 MoE 拓扑结构、训练数据规模)<strong>未完全公开</strong>。上述分析基于公开演讲、新闻稿和行业研报的反推，存在不确定性。</p>
<h3 id="6-2-yzz-gpt-4-dcj">6.2 与真正 GPT-4 的差距</h3>
<p>「体感逼近 GPT-4」是阶跃星辰的自我评价，但缺乏独立第三方的严格复现。在 2024 年的第三方评测(如 C-Eval、CMMLU、MMLU)中，Step-2 的具体排名鲜有公开报道。</p>
<h3 id="6-3-tlcb">6.3 推理成本</h3>
<p>万亿参数 MoE 即使只激活部分专家，其推理所需的显存和带宽仍然巨大。Step-2 的<strong>商业化部署成本</strong>未公开，但对于中小企业而言，自托管可能不现实。</p>
<h3 id="6-4-hxdddkkzx">6.4 后续迭代的可扩展性</h3>
<p>从千亿到万亿是一次巨大的工程投入。继续 Scaling 到 10 万亿或更高，需要新的系统架构突破(如更多的专家并行维度、更细粒度的路由策略)，这并非线性扩展。</p>
<hr>
<h2 id="7-jsskjd">7. 技术思考节点</h2>
<h3 id="7-1-wsm-ctxl-moe-sssp">7.1 为什么「从头训练 MoE」是少数派？</h3>
<p>Upcycle 是 MoE 训练的「捷径」——将一个训练好的 Dense 模型改造成 MoE，几周即可得到万亿参数模型。但阶跃星辰选择了更难的从头训练路线。这一选择的启示：</p>
<ul>
<li><strong>长期主义</strong>：如果目标是 AGI，模型上限比训练速度更重要。</li>
<li><strong>技术自信</strong>：团队有万卡集群管理经验，敢于承担从头训练的风险。</li>
<li><strong>差异化壁垒</strong>：Upcycle 路线容易被复制，而从头训练的系统性能力难以短期模仿。</li>
</ul>
<h3 id="7-2-ssyqbjdsjnldjcydd">7.2 搜索引擎背景对数据能力的加成有多大？</h3>
<p>大模型领域的竞争正在从「谁的算法更好」转向「谁的数据更好」。搜索引擎团队在以下方面具有结构性优势：</p>
<ul>
<li><strong>数据清洗的工业化能力</strong>：不是写几个脚本，而是维护一个每天处理百亿级文档的 pipeline。</li>
<li><strong>质量评估的 metrics 设计</strong>：搜索相关性评估的方法论可直接迁移到语料质量评分。</li>
<li><strong>实时更新机制</strong>：搜索引擎需要索引最新网页，这种「数据新鲜度」能力对预训练同样重要。</li>
</ul>
<h3 id="7-3-wycssbs-by-d">7.3 万亿参数是不是「必要」的？</h3>
<p>2024 年的行业共识是 Scaling Law 仍然有效——更大的模型通常更好。但 2024 年下半年开始，「小模型+长思考」(如 DeepSeek-R1、OpenAI o1)路线挑战了这一共识。Step-2 的万亿参数路线代表了「 brute-force scaling」的极致，其长期价值取决于：模型能力的提升是否足以覆盖推理成本的增加？在 Agent 时代，模型的「工具使用能力」和「推理深度」可能比「参数规模」更重要。</p>
<hr>
<h2 id="8-mxpxdw">8. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: Step-1(千亿参数 Dense 架构，MFU 57%，GPT-3.5 级别)</li>
<li><strong>核心创新</strong>:<ul>
<li>万亿参数 MoE 从头训练(非 upcycle)</li>
<li>异构化专家设计 + 部分参数共享</li>
<li>6D 并行 + 万卡集群自动化运维</li>
<li>搜索引擎基因的数据工程体系</li>
</ul>
</li>
<li><strong>被后续工作影响</strong>:<ul>
<li>Step-3(引入 MFA、AFD、StepMesh 等更细粒度的架构优化)</li>
<li>Step-3.5-Flash(196B MoE，开源，350 TPS)</li>
</ul>
</li>
<li><strong>同期竞争</strong>:<ul>
<li>GPT-4(OpenAI，闭源，万亿级 Dense/MoE 混合)</li>
<li>Kimi K2(Moonshot，1T MoE，32B 激活)</li>
<li>DeepSeek-V2(DeepSeek，236B MoE，21B 激活)</li>
</ul>
</li>
<li><strong>技术定位</strong>: Step-2 是阶跃星辰从「追赶者」到「并跑者」的关键节点，证明了团队在算力、系统、数据、算法四个维度的综合实力，但技术细节的不透明使其难以被学术界深度复现和验证</li>
</ul>
<hr>
<blockquote>
<p>📚 <strong>关联阅读</strong></p>
<ul>
<li><a href="/llm-guide/14-models/14.7-stepfun/02-step-2/01-02-step-2-jsbgjy">D2 技术报告精译</a></li>
<li><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">返回 StepFun 家族总览</a></li>
</ul>
</blockquote>
<hr>
<blockquote>
<p>🔄 <strong>知识库同步</strong></p>
<ul>
<li>本文件已同步至 <code>5-主流模型全解/5.2-国内大模型/阶跃星辰-StepFun/05-Step-2-万亿MoE从头训练与系统协同优化.md</code></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxdwyfbbj","text":"1. 模型定位与发布背景"},{"level":2,"id":"2-hxjgjc-ctxl-vs-upcycle","text":"2. 核心架构决策：从头训练 vs Upcycle"},{"level":3,"id":"2-1-moe-xldlzfs","text":"2.1 MoE 训练的两种范式"},{"level":3,"id":"2-2-jyxcdxz-ctxl","text":"2.2 阶跃星辰的选择：从头训练"},{"level":2,"id":"3-xttp-wycsd-jj-tz","text":"3. 系统突破：万亿参数的「基建」挑战"},{"level":3,"id":"3-1-6d-bhcl","text":"3.1 6D 并行策略"},{"level":3,"id":"3-2-jzxcglyzdhyw","text":"3.2 极致显存管理与自动化运维"},{"level":3,"id":"3-3-mfu-yxslscs","text":"3.3 MFU：有效算力输出率"},{"level":2,"id":"4-sjgc-byjyd-zstplsx","text":"4. 数据工程：必应基因的「知识图谱流水线」"},{"level":3,"id":"4-1-tdbj","text":"4.1 团队背景"},{"level":3,"id":"4-2-zstplsx","text":"4.2 知识图谱流水线"},{"level":2,"id":"5-xndw-bj-gpt-4-d-tg","text":"5. 性能定位：逼近 GPT-4 的「体感」"},{"level":3,"id":"5-1-nlhx","text":"5.1 能力画像"},{"level":3,"id":"5-2-y-step-1-ddjdb","text":"5.2 与 Step-1 的代际对比"},{"level":2,"id":"6-jxxyfx","text":"6. 局限性与风险"},{"level":3,"id":"6-1-xxbtm","text":"6.1 信息不透明"},{"level":3,"id":"6-2-yzz-gpt-4-dcj","text":"6.2 与真正 GPT-4 的差距"},{"level":3,"id":"6-3-tlcb","text":"6.3 推理成本"},{"level":3,"id":"6-4-hxdddkkzx","text":"6.4 后续迭代的可扩展性"},{"level":2,"id":"7-jsskjd","text":"7. 技术思考节点"},{"level":3,"id":"7-1-wsm-ctxl-moe-sssp","text":"7.1 为什么「从头训练 MoE」是少数派？"},{"level":3,"id":"7-2-ssyqbjdsjnldjcydd","text":"7.2 搜索引擎背景对数据能力的加成有多大？"},{"level":3,"id":"7-3-wycssbs-by-d","text":"7.3 万亿参数是不是「必要」的？"},{"level":2,"id":"8-mxpxdw","text":"8. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.7-stepfun/02-step-2/05-step-2-wy-moe-ctxlyxtxtyh" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.7-stepfun/02-step-2/05-step-2-wy-moe-ctxlyxtxtyh" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Step-2 核心技术专题：万亿参数 MoE 的从头训练与系统协同优化</h1>
          <p className="text-paper-800/50">{t("From LLM Guide", "来自 LLM 指南")}</p>
        </header>
        <article
          className="paper-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen overflow-y-auto border-l border-paper-200 dark:border-slate-700 bg-paper-50 dark:bg-slate-900">
        <LlmGuideToc items={toc} />
      </aside>
    </div>
  );
}
