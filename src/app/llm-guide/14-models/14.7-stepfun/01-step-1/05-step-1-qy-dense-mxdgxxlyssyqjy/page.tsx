"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Step-1 核心技术专题：千亿 Dense 模型的高效训练与搜索引擎基因</h1>
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
<td><strong>训练完成</strong></td>
<td>2023 年 8 月</td>
</tr>
<tr>
<td><strong>正式对外发布</strong></td>
<td>2024 年 3 月 23 日，全球开发者先锋大会(上海)</td>
</tr>
<tr>
<td><strong>发布机构</strong></td>
<td>阶跃星辰(StepFun)，2023 年 4 月成立</td>
</tr>
<tr>
<td><strong>创始人</strong></td>
<td>姜大昕(前微软全球副总裁、小冰负责人)</td>
</tr>
<tr>
<td><strong>总参数量</strong></td>
<td>千亿级(~100B+)</td>
</tr>
<tr>
<td><strong>架构</strong></td>
<td>Dense(稠密)</td>
</tr>
<tr>
<td><strong>训练时长</strong></td>
<td><strong>仅两个月，一次性训练成功</strong></td>
</tr>
</tbody></table>
<p>Step-1 是阶跃星辰的「开山之作」。在一个成立仅 4 个月、团队尚在组建的创业公司，用两个月时间一次性训练出千亿参数模型并超越 GPT-3.5，这本身就是一项惊人的工程成就。它证明了阶跃星辰核心团队(尤其是来自微软必应的系统班底)在万卡集群管理和超大规模训练上的深厚积累。</p>
<hr>
<h2 id="2-lgyycxcg-dyhyy">2. 「两个月一次性成功」的隐含意义</h2>
<h3 id="2-1-dmxxld-ak-md">2.1 大模型训练的「暗坑」密度</h3>
<p>千亿参数模型的预训练是一个高风险的工程赌注。业内常见的问题包括：</p>
<table>
<thead>
<tr>
<th>问题类型</th>
<th>具体表现</th>
<th>典型修复时间</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Loss 发散</strong></td>
<td>学习率设置不当，训练中期 loss 陡增</td>
<td>数天(需重新调参)</td>
</tr>
<tr>
<td><strong>数值溢出/下溢</strong></td>
<td>FP16/BF16 混合精度中的异常值</td>
<td>数小时至数天</td>
</tr>
<tr>
<td><strong>数据污染</strong></td>
<td>测试集泄漏导致虚假高性能</td>
<td>数周(需重新清洗数据)</td>
</tr>
<tr>
<td><strong>硬件故障</strong></td>
<td>万卡集群中的单卡/节点故障</td>
<td>数小时(自动化运维可缩短)</td>
</tr>
<tr>
<td><strong>数据分布漂移</strong></td>
<td>多数据源拼接导致训练不稳定</td>
<td>数天至数周</td>
</tr>
</tbody></table>
<p><strong>「一次性训练成功」意味着上述所有问题在训练开始前就被系统性预防或解决。</strong> 这不是运气，而是团队将此前在微软万卡集群上的经验转化为了一套可复现的训练 playbook。</p>
<h3 id="2-2-yhyjzddb">2.2 与行业基准的对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>参数规模</th>
<th>训练周期</th>
<th>训练结果</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-3</td>
<td>2020</td>
<td>175B</td>
<td>数月</td>
<td>多次调参迭代</td>
</tr>
<tr>
<td>LLaMA-1</td>
<td>2023.02</td>
<td>65B</td>
<td>~数月</td>
<td>公开训练细节</td>
</tr>
<tr>
<td><strong>Step-1</strong></td>
<td><strong>2023.08</strong></td>
<td><strong>~千亿</strong></td>
<td><strong>2 个月</strong></td>
<td><strong>一次性成功</strong></td>
</tr>
<tr>
<td>国内同期竞品</td>
<td>2023</td>
<td>千亿级</td>
<td>3-6 个月</td>
<td>多数需多次迭代</td>
</tr>
</tbody></table>
<p>两个月的时间窗口极短——它要求数据 pipeline、系统配置、超参数搜索、监控告警全部在训练启动前达到「生产就绪」状态，而非在训练过程中逐步调试。</p>
<hr>
<h2 id="3-xtxs-mfu-57-dhjl">3. 系统效率：MFU 57% 的含金量</h2>
<h3 id="3-1-mfu-ddyyhysp">3.1 MFU 的定义与行业水平</h3>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>MFU</mtext><mo>=</mo><mfrac><mtext>实际完成的模型 FLOPs</mtext><mrow><mtext>GPU 理论峰值 FLOPs</mtext><mo>×</mo><mtext>训练时间</mtext></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\text{MFU} = \\frac{\\text{实际完成的模型 FLOPs}}{\\text{GPU 理论峰值 FLOPs} \\times \\text{训练时间}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">MFU</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1297em;vertical-align:-0.7693em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">GPU </span><span class="mord cjk_fallback">理论峰值</span><span class="mord"> FLOPs</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord cjk_fallback">训练时间</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord cjk_fallback">实际完成的模型</span><span class="mord"> FLOPs</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7693em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>MFU 衡量的是：你花了多少钱买 GPU、花了多少时间，其中真正用于「有效计算」的比例是多少。其余部分被通信、同步、数据加载、故障恢复等开销消耗。</p>
<table>
<thead>
<tr>
<th>模型/项目</th>
<th>MFU</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-3(公开估算)</td>
<td>~21%</td>
<td>2020 年技术</td>
</tr>
<tr>
<td>Megatron-LM 最佳实践</td>
<td>~30-40%</td>
<td>NVIDIA 官方优化</td>
</tr>
<tr>
<td>LLaMA-2(70B)</td>
<td>~40%</td>
<td>Meta 2023 年报告</td>
</tr>
<tr>
<td><strong>Step-1</strong></td>
<td><strong>57%</strong></td>
<td><strong>阶跃星辰公开数据</strong></td>
</tr>
<tr>
<td>行业顶尖(2024)</td>
<td>50-60%</td>
<td>需要极致优化</td>
</tr>
</tbody></table>
<p><strong>57% 的 MFU 意味着什么？</strong> 假设同样的硬件预算，MFU 从 30% 提升到 57%，等效于训练速度提升 <strong>90%</strong>——或者说，同样的模型可以用几乎一半的算力成本训练完成。</p>
<h3 id="3-2-g-mfu-djsys">3.2 高 MFU 的技术要素</h3>
<p>阶跃星辰的系统负责人朱亦博博士拥有多次<strong>单集群万卡以上</strong>的系统建设与管理实践经验。高 MFU 的实现通常依赖以下技术栈：</p>
<ul>
<li><strong>3D/4D 并行策略的精细调优</strong>：数据并行、张量并行、流水线并行、序列并行的组合需要根据模型 shape 和集群拓扑反复调优。</li>
<li><strong>通信-计算重叠</strong>：在梯度同步的同时进行下一 batch 的计算，隐藏通信延迟。</li>
<li><strong>极致显存优化</strong>：梯度检查点、激活重计算、优化器状态分片，释放显存以支持更大的 batch size。</li>
<li><strong>自动化故障恢复</strong>：万卡集群平均每天都有 GPU 故障，秒级检测和负载迁移避免了训练中断。</li>
</ul>
<hr>
<h2 id="4-sjgc-ssyqjyd-jwdj">4. 数据工程：搜索引擎基因的「降维打击」</h2>
<h3 id="4-1-tdbjddtx">4.1 团队背景的独特性</h3>
<p>阶跃星辰数据团队的核心骨干来自<strong>微软必应(Bing)搜索引擎</strong>，曾支持全球 100 多种语言、为 200 多个国家和地区提供服务。这与典型的大模型公司(研究团队多来自学术界 NLP 背景)形成了鲜明对比：</p>
<table>
<thead>
<tr>
<th>能力维度</th>
<th>学术 NLP 背景</th>
<th>搜索引擎背景</th>
</tr>
</thead>
<tbody><tr>
<td>语料来源理解</td>
<td>依赖公开数据集</td>
<td>深刻理解互联网语料分布</td>
</tr>
<tr>
<td>数据清洗规模</td>
<td>百万/千万级文档</td>
<td>十亿/百亿级网页</td>
</tr>
<tr>
<td>质量评估</td>
<td>人工抽样检查</td>
<td>自动化多维评分系统</td>
</tr>
<tr>
<td>去重技术</td>
<td>精确去重</td>
<td>近似去重(minhash/LSH)</td>
</tr>
<tr>
<td>实时更新</td>
<td>静态数据集</td>
<td>持续抓取和更新</td>
</tr>
<tr>
<td>知识结构化</td>
<td>有限</td>
<td>大规模知识图谱构建</td>
</tr>
</tbody></table>
<h3 id="4-2-zstplsx">4.2 知识图谱流水线</h3>
<p>阶跃星辰建立了**「数据处理 + 知识图谱」双流水线**：</p>
<ol>
<li><strong>多源采集</strong>：网页、书籍、代码、论文、对话等多模态语料。</li>
<li><strong>质量分层</strong>：信息密度、语言质量、事实准确性、时效性等多维度评分。</li>
<li><strong>结构化增强</strong>：将非结构化文本中的实体和关系抽取为知识图谱，作为预训练的额外监督信号。</li>
<li><strong>去重与去污染</strong>：minhash/LSH 近似去重 + 敏感内容过滤，避免测试集泄漏。</li>
</ol>
<blockquote>
<p><strong>关键洞察</strong>：搜索引擎团队对「什么网页是高价值的」有数十年的工业级经验。这种经验直接转化为大模型预训练的语料筛选标准——不是简单地「爬更多网页」，而是「爬对网页」。</p>
</blockquote>
<hr>
<h2 id="5-xndw-qmcy-gpt-3-5">5. 性能定位：全面超越 GPT-3.5</h2>
<h3 id="5-1-nlhx">5.1 能力画像</h3>
<p>据阶跃星辰公开信息，Step-1 在以下维度全面超越 GPT-3.5：</p>
<table>
<thead>
<tr>
<th>能力维度</th>
<th>Step-1</th>
<th>GPT-3.5</th>
<th>超越意义</th>
</tr>
</thead>
<tbody><tr>
<td>逻辑推理</td>
<td>超越</td>
<td>基线</td>
<td>复杂链条推理更准确</td>
</tr>
<tr>
<td>中文知识</td>
<td>显著超越</td>
<td>较弱</td>
<td>中文语料质量优势</td>
</tr>
<tr>
<td>英文知识</td>
<td>超越</td>
<td>基线</td>
<td>必应团队的英文语料积累</td>
</tr>
<tr>
<td>数学</td>
<td>超越</td>
<td>基线</td>
<td>专门的数学训练数据</td>
</tr>
<tr>
<td>代码</td>
<td>超越</td>
<td>基线</td>
<td>代码数据占比高</td>
</tr>
</tbody></table>
<h3 id="5-2-y-step-1v-dxt">5.2 与 Step-1V 的协同</h3>
<p>Step-1 的成功直接支撑了 Step-1V(千亿参数多模态模型)的训练：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>Step-1</th>
<th>Step-1V</th>
</tr>
</thead>
<tbody><tr>
<td>发布时间</td>
<td>2023.08</td>
<td>2023.11</td>
</tr>
<tr>
<td>参数规模</td>
<td>千亿</td>
<td>千亿</td>
</tr>
<tr>
<td>模态</td>
<td>纯文本</td>
<td>文本 + 图像 + 视频</td>
</tr>
<tr>
<td>OpenCompass</td>
<td>—</td>
<td><strong>多模态评测第一</strong></td>
</tr>
<tr>
<td>与 GPT-4V 对比</td>
<td>—</td>
<td><strong>比肩/超越</strong>(DocVQA、OCRBench)</td>
</tr>
</tbody></table>
<p>Step-1V 在文档理解和 OCR 上超越了 GPT-4V，这一优势直接源于 Step-1 强大的语言基座能力——多模态模型的「理解」最终依赖于语言模型对视觉内容的语义解析。</p>
<hr>
<h2 id="6-jxxyfx">6. 局限性与风险</h2>
<h3 id="6-1-jsxjbtm">6.1 技术细节不透明</h3>
<p>Step-1 的具体架构细节(层数、头数、隐藏维度、训练数据规模、训练 token 数)<strong>未完全公开</strong>。上述分析基于公开演讲、新闻稿和行业研报的反推。</p>
<h3 id="6-2-dense-jgdkzpj">6.2 Dense 架构的扩展瓶颈</h3>
<p>Step-1 采用 Dense 架构，这限制了其继续 Scaling 的空间：</p>
<ul>
<li><strong>显存瓶颈</strong>：千亿 Dense 模型在 FP16 下约需 200GB+ 显存，推理需要多卡张量并行。</li>
<li><strong>计算瓶颈</strong>：每个 token 需要激活全部千亿参数，推理成本随长度线性增长。</li>
<li><strong>扩展成本</strong>：从千亿到万亿，Dense 架构的算力需求呈超线性增长，这也是阶跃星辰在 Step-2 转向 MoE 的根本原因。</li>
</ul>
<h3 id="6-3-cy-gpt-3-5-dkfxx">6.3 「超越 GPT-3.5」的可复现性</h3>
<p>阶跃星辰的自我评测缺乏独立第三方的严格复现。虽然 OpenCompass 等第三方评测中 Step-1V 表现优异，但纯文本的 Step-1 在标准学术 benchmark(MMLU、HellaSwag、ARC 等)上的具体分数鲜有公开报道。</p>
<hr>
<h2 id="7-jsskjd">7. 技术思考节点</h2>
<h3 id="7-1-wsm-lgycg-b-wycs-gzdyj">7.1 为什么「两个月成功」比「万亿参数」更值得研究？</h3>
<p>Step-2 的万亿参数获得了更多媒体关注，但 Step-1 的「两个月一次性训练成功」对行业的启示更大：</p>
<ul>
<li><strong>工程能力的「下限」决定研究的上限</strong>：一个连千亿模型都训练不稳定的公司，不可能成功训练万亿模型。</li>
<li><strong>时间就是金钱</strong>：两个月的训练周期 vs 行业平均的 3-6 个月，意味着 2-3 倍的迭代速度和资本效率。</li>
<li><strong>团队经验的复利效应</strong>：微软必应的万卡集群经验不是可以短期复制的——它需要经历过无数次故障、调优和深夜排错才能内化为直觉。</li>
</ul>
<h3 id="7-2-ssyqbjsfs-by-d">7.2 搜索引擎背景是否是「必要」的？</h3>
<p>2024 年的「百模大战」中，最终存活并持续迭代的公司(阶跃星辰、智谱、月之暗面、MiniMax)都有一个共同点：<strong>核心团队拥有大规模工业系统经验</strong>。纯学术背景的团队在模型规模超过百亿后，往往会在系统工程上遇到瓶颈。</p>
<p>搜索引擎团队的独特价值在于：</p>
<ul>
<li><strong>数据处理的工业化 mindset</strong>：不是「处理一个数据集」，而是「维护一个每天处理十亿文档的 pipeline」。</li>
<li><strong>质量评估的 metrics 设计</strong>：搜索相关性评估的方法论可直接迁移到语料质量评分。</li>
<li><strong>分布式系统的肌肉记忆</strong>：万卡集群和万节点搜索引擎在通信模式、故障处理、负载均衡上高度相似。</li>
</ul>
<h3 id="7-3-dense-vs-moe-step-1-d-step-2-dlxqhsmlsm">7.3 Dense vs MoE：Step-1 到 Step-2 的路线切换说明了什么？</h3>
<p>阶跃星辰在 Step-1 上证明了 Dense 架构的极限(千亿级、MFU 57%)，然后在 Step-2 上转向了 MoE。这一切换反映了行业的共识：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>Dense(Step-1)</th>
<th>MoE(Step-2)</th>
</tr>
</thead>
<tbody><tr>
<td>参数上限</td>
<td>~千亿(受显存/计算约束)</td>
<td>万亿+</td>
</tr>
<tr>
<td>训练难度</td>
<td>中等</td>
<td>极高(路由稳定性)</td>
</tr>
<tr>
<td>推理成本</td>
<td>高(全参数激活)</td>
<td>可控(稀疏激活)</td>
</tr>
<tr>
<td>系统要求</td>
<td>高</td>
<td>极高(6D 并行)</td>
</tr>
<tr>
<td>适用阶段</td>
<td>快速验证、产品化</td>
<td>能力探索、AGI 预研</td>
</tr>
</tbody></table>
<p>Step-1 的 Dense 路线是务实的选择——在团队刚成立、需要快速证明能力时，Dense 架构的训练更可控、调试更简单。当团队积累了足够的系统能力和数据 pipeline 后，才敢于挑战 MoE 的复杂性。</p>
<hr>
<h2 id="8-mxpxdw">8. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: 无(阶跃星辰首款模型)</li>
<li><strong>核心创新</strong>:<ul>
<li>两个月一次性训练成功的工程效率</li>
<li>57% MFU 的系统优化水平</li>
<li>搜索引擎基因的数据工程体系</li>
<li>千亿 Dense 架构的极限探索</li>
</ul>
</li>
<li><strong>被后续工作影响</strong>:<ul>
<li>Step-1V(多模态扩展，OpenCompass 第一)</li>
<li>Step-2(万亿 MoE，从头训练)</li>
<li>Step-1X(图像生成，DiT 架构)</li>
</ul>
</li>
<li><strong>同期竞争</strong>:<ul>
<li>GPT-3.5(OpenAI，2022)</li>
<li>LLaMA-1(Meta，2023.02)</li>
<li>ChatGLM-2(智谱，2023.06)</li>
<li>Baichuan-2(百川，2023.09)</li>
</ul>
</li>
<li><strong>技术定位</strong>: Step-1 是阶跃星辰的「 proof of capability」——证明团队具备从头训练千亿级模型的综合能力。它不是参数最大的模型，也不是性能最强的模型，但它代表了一种「后发先至」的工程效率：用更短的时间、更高的资源利用率，达到同等的性能水平。</li>
</ul>
<hr>
<blockquote>
<p>📚 <strong>关联阅读</strong></p>
<ul>
<li><a href="/llm-guide/14-models/14.7-stepfun/01-step-1/01-01-step-1-jsbgjy">D2 技术报告精译</a></li>
<li><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">返回 StepFun 家族总览</a></li>
</ul>
</blockquote>
<hr>
<blockquote>
<p>🔄 <strong>知识库同步</strong></p>
<ul>
<li>本文件已同步至 <code>5-主流模型全解/5.2-国内大模型/阶跃星辰-StepFun/05-Step-1-千亿Dense模型的高效训练与搜索引擎基因.md</code></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxdwyfbbj","text":"1. 模型定位与发布背景"},{"level":2,"id":"2-lgyycxcg-dyhyy","text":"2. 「两个月一次性成功」的隐含意义"},{"level":3,"id":"2-1-dmxxld-ak-md","text":"2.1 大模型训练的「暗坑」密度"},{"level":3,"id":"2-2-yhyjzddb","text":"2.2 与行业基准的对比"},{"level":2,"id":"3-xtxs-mfu-57-dhjl","text":"3. 系统效率：MFU 57% 的含金量"},{"level":3,"id":"3-1-mfu-ddyyhysp","text":"3.1 MFU 的定义与行业水平"},{"level":3,"id":"3-2-g-mfu-djsys","text":"3.2 高 MFU 的技术要素"},{"level":2,"id":"4-sjgc-ssyqjyd-jwdj","text":"4. 数据工程：搜索引擎基因的「降维打击」"},{"level":3,"id":"4-1-tdbjddtx","text":"4.1 团队背景的独特性"},{"level":3,"id":"4-2-zstplsx","text":"4.2 知识图谱流水线"},{"level":2,"id":"5-xndw-qmcy-gpt-3-5","text":"5. 性能定位：全面超越 GPT-3.5"},{"level":3,"id":"5-1-nlhx","text":"5.1 能力画像"},{"level":3,"id":"5-2-y-step-1v-dxt","text":"5.2 与 Step-1V 的协同"},{"level":2,"id":"6-jxxyfx","text":"6. 局限性与风险"},{"level":3,"id":"6-1-jsxjbtm","text":"6.1 技术细节不透明"},{"level":3,"id":"6-2-dense-jgdkzpj","text":"6.2 Dense 架构的扩展瓶颈"},{"level":3,"id":"6-3-cy-gpt-3-5-dkfxx","text":"6.3 「超越 GPT-3.5」的可复现性"},{"level":2,"id":"7-jsskjd","text":"7. 技术思考节点"},{"level":3,"id":"7-1-wsm-lgycg-b-wycs-gzdyj","text":"7.1 为什么「两个月成功」比「万亿参数」更值得研究？"},{"level":3,"id":"7-2-ssyqbjsfs-by-d","text":"7.2 搜索引擎背景是否是「必要」的？"},{"level":3,"id":"7-3-dense-vs-moe-step-1-d-step-2-dlxqhsmlsm","text":"7.3 Dense vs MoE：Step-1 到 Step-2 的路线切换说明了什么？"},{"level":2,"id":"8-mxpxdw","text":"8. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.7-stepfun/01-step-1/05-step-1-qy-dense-mxdgxxlyssyqjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.7-stepfun/01-step-1/05-step-1-qy-dense-mxdgxxlyssyqjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Step-1 核心技术专题：千亿 Dense 模型的高效训练与搜索引擎基因</h1>
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
