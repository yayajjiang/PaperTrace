"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Ling-Plus 技术报告摘要</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.16-Ling 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>报告标题</strong>: EVERY FLOP COUNTS: SCALING A 300B MIXTURE-OF-EXPERTS LING LLM WITHOUT PREMIUM GPUS
<strong>作者</strong>: Ling Team, AI@Ant Group
<strong>arXiv</strong>: 2503.05139
<strong>发布时间</strong>: 2025 年 3 月
<strong>模型规模</strong>: Ling-Plus (290B/28.8B)
<strong>开源地址</strong>: <a href="https://huggingface.co/inclusionAI">https://huggingface.co/inclusionAI</a></p>
</blockquote>
<hr>
<h2 id="hxgx">核心贡献</h2>
<p>蚂蚁集团 AI 团队开源了 Ling 系列 MoE 大模型，其中 <strong>Ling-Plus</strong> 是旗舰版本，核心目标是证明在低端硬件上也能训练出与行业标杆媲美的超大规模 MoE 大模型。主要贡献包括：</p>
<ol>
<li><strong>290B MoE 开源模型</strong>：Ling-Plus(290B 总参/28.8B 激活参)，性能与 Qwen2.5-72B、DeepSeek-V2.5 相当</li>
<li><strong>20% 成本降低</strong>：与高端 H100 训练相比，使用低端硬件训练成本降低约 20%</li>
<li><strong>跨 5 种异构硬件训练成功</strong>：在 A/B/C/D/E 五种不同 AI 加速器上完成 9T token 预训练</li>
<li><strong>工具使用领先</strong>：在 BFCL-v2 和 T-eval 工具使用基准上达到最佳性能</li>
<li><strong>完整技术栈开源</strong>：DLRover、XPUTimer、EDiT、PCache、Flood、Babel</li>
</ol>
<hr>
<h2 id="mxgg">模型规格</h2>
<table>
<thead>
<tr>
<th>指标</th>
<th>Ling-Plus</th>
</tr>
</thead>
<tbody><tr>
<td>总参数量</td>
<td>290B</td>
</tr>
<tr>
<td>激活参数量</td>
<td>28.8B</td>
</tr>
<tr>
<td>专家数量</td>
<td>256(路由)+ 1(共享)</td>
</tr>
<tr>
<td>上下文长度</td>
<td>16K</td>
</tr>
<tr>
<td>预训练数据</td>
<td>9T token(中文 1T + 英文 5.5T + 代码 2.5T)</td>
</tr>
<tr>
<td>训练硬件</td>
<td>异构集群(5 种加速器 A/B/C/D/E)</td>
</tr>
<tr>
<td>训练成本节省</td>
<td>~20%(对比全 H100 方案)</td>
</tr>
<tr>
<td>最长训练序列</td>
<td>16K(初始 4K → 长上下文 16K)</td>
</tr>
</tbody></table>
<hr>
<h2 id="gjjscx">关键技术创新</h2>
<h3 id="1-edit-dxfbsxl">1. EDiT：弹性分布式训练</h3>
<p>基于 Local SGD 的高效异步训练方法，专为异构硬件环境设计：</p>
<ul>
<li><strong>逐层同步</strong>：前向传播时逐层同步参数，单次通信数据量大幅减少</li>
<li><strong>伪梯度惩罚</strong>：通过异常消除、加权平均、梯度裁剪抑制损失尖峰</li>
<li><strong>基于时间的同步</strong>：快节点执行更多本地更新后同步，解决&quot;拖后腿&quot;问题</li>
<li><strong>加速效果</strong>：理想环境下加速比达 <strong>66.1%</strong></li>
</ul>
<blockquote>
<p>在 Ling-Plus 的 5 种硬件混合训练中，EDiT 是确保训练效率的核心技术。</p>
</blockquote>
<h3 id="2-sjlyyr-stochastic-routing-warmup">2. 随机路由预热(Stochastic Routing Warmup)</h3>
<p>MoE 训练稳定性创新：</p>
<ul>
<li>预热阶段在学到的 logits 和随机 logits 之间插值</li>
<li>防止早期训练中专家过载和崩溃</li>
<li>逐渐将控制权转移到学到的路由分布</li>
</ul>
<blockquote>
<p>对于 256 个路由专家的 Ling-Plus，路由预热是防止早期训练专家负载失衡的关键。</p>
</blockquote>
<h3 id="3-norm-head">3. NormHead</h3>
<p>LM-Head 输出层 L2 归一化，显著增强 MoE 模型训练稳定性：</p>
<ul>
<li>防止损失尖峰期间 LM-Head 输出范数的不稳定</li>
<li>确保权重幅度变化不会导致训练发散</li>
</ul>
<h3 id="4-zstpqdd-tool-use">4. 知识图谱驱动的 Tool Use</h3>
<p>基于知识图谱技术的数据合成策略：</p>
<ul>
<li>设计 <strong>14 种子图模式</strong> 和对应的一阶逻辑表示</li>
<li>扩展 <strong>30,000+ 系统指令模板</strong></li>
<li>在 BFCL-v2(67.92%)和 T-eval(85.58%)上达到最佳性能</li>
</ul>
<hr>
<h2 id="syjg">实验结果</h2>
<h3 id="yxlmxdb-vs-70b-jx">预训练模型对比(vs 70B+ 基线)</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>Ling-Plus-Base</th>
<th>Qwen2.5-72B-Base</th>
<th>DeepSeek-V2-Base</th>
<th>Llama-3.1-70B-Base</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>81.84</td>
<td>86.30</td>
<td>79.16</td>
<td>79.15</td>
</tr>
<tr>
<td>MMLU-Pro</td>
<td>55.18</td>
<td>61.40</td>
<td>54.17</td>
<td>51.42</td>
</tr>
<tr>
<td>HumanEval</td>
<td>84.76</td>
<td>81.70</td>
<td>63.41</td>
<td>56.10</td>
</tr>
<tr>
<td>GSM8K</td>
<td>88.55</td>
<td>89.69</td>
<td>83.78</td>
<td>83.62</td>
</tr>
<tr>
<td>MATH</td>
<td>56.96</td>
<td>60.72</td>
<td>43.60</td>
<td>41.76</td>
</tr>
<tr>
<td>C-Eval</td>
<td>90.93</td>
<td>88.40</td>
<td>82.16</td>
<td>68.60</td>
</tr>
</tbody></table>
<p><strong>结论</strong>: 代码、数学、中文与 Qwen2.5-72B 相当; 英文略低于 Qwen2.5-72B，超过 DeepSeek-V2 和 Llama-3.1-70B。</p>
<h3 id="hxlmxdb-vs-70b-chat">后训练模型对比(vs 70B+ Chat)</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>Ling-Plus</th>
<th>DeepSeek-V2.5</th>
<th>Qwen2.5-72B-Instruct</th>
<th>GPT4o-0806</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>82.33</td>
<td>80.74</td>
<td>84.30</td>
<td>86.46</td>
</tr>
<tr>
<td>MMLU-Pro</td>
<td>67.57</td>
<td>64.47</td>
<td>70.77</td>
<td>74.83</td>
</tr>
<tr>
<td>HumanEval</td>
<td>90.24</td>
<td>88.41</td>
<td>88.41</td>
<td>91.46</td>
</tr>
<tr>
<td>GSM8K</td>
<td>94.47</td>
<td>90.67</td>
<td>93.40</td>
<td>96.21</td>
</tr>
<tr>
<td>MATH</td>
<td>78.82</td>
<td>76.94</td>
<td>81.14</td>
<td>77.94</td>
</tr>
<tr>
<td>BFCL-v2</td>
<td>67.92</td>
<td>-</td>
<td>65.84</td>
<td>-</td>
</tr>
<tr>
<td>T-eval</td>
<td>85.58</td>
<td>-</td>
<td>76.64</td>
<td>-</td>
</tr>
</tbody></table>
<p><strong>关键发现</strong>:</p>
<ul>
<li>工具使用(BFCL-v2、T-eval)领先于所有对比模型</li>
<li>数学和代码与 DeepSeek-V2.5 和 Qwen2.5-72B 相当</li>
<li>不同加速器(Device-A vs Device-D)上性能几乎一致</li>
</ul>
<h3 id="aqxpg">安全性评估</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>安全性</th>
<th>过度拒绝</th>
<th>平均分</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Ling-Plus</strong></td>
<td>92.80</td>
<td>94.32</td>
<td><strong>93.56</strong></td>
</tr>
<tr>
<td>Qwen2.5-72B</td>
<td>94.38</td>
<td>87.98</td>
<td>91.18</td>
</tr>
<tr>
<td>DeepSeek-V2.5</td>
<td>85.88</td>
<td>94.58</td>
<td>90.23</td>
</tr>
<tr>
<td>Llama3.1-70B</td>
<td>86.01</td>
<td>80.06</td>
<td>83.53</td>
</tr>
</tbody></table>
<p>Ling-Plus 在安全性和有用性之间实现了最佳平衡。</p>
<hr>
<h2 id="xl-quot-ksdjx-quot">训练&quot;苦涩的教训&quot;</h2>
<h3 id="ssjfcl">损失尖峰处理</h3>
<ul>
<li>窄尖峰影响小，宽尖峰需立即干预</li>
<li>策略：跳过更新 → 样本重试 → 自动降学习率</li>
<li>结合 HeadNorm + z-loss + 平衡损失维持稳定</li>
</ul>
<h3 id="kptdq">跨平台对齐</h3>
<ul>
<li>基本操作(matmul)对齐只是第一步</li>
<li>框架层面(Attention、MLP、Router)对齐同样关键</li>
<li>反向传播中路由器组件的梯度传播最易出现不一致</li>
<li><strong>微小差异在多次迭代后会导致最终损失的显著偏差</strong></li>
</ul>
<blockquote>
<p>对于 Ling-Plus 这种在 5 种硬件上训练的模型，跨平台对齐是最大的工程挑战之一。</p>
</blockquote>
<hr>
<h2 id="yxggzddb">与相关工作的对比</h2>
<table>
<thead>
<tr>
<th>维度</th>
<th>Ling-Plus</th>
<th>DeepSeek-V3</th>
<th>Qwen2.5-72B</th>
<th>Llama-3.1-70B</th>
</tr>
</thead>
<tbody><tr>
<td>总参数量</td>
<td>290B</td>
<td>671B</td>
<td>72B (dense)</td>
<td>70B (dense)</td>
</tr>
<tr>
<td>激活参数量</td>
<td>28.8B</td>
<td>37B</td>
<td>72B</td>
<td>70B</td>
</tr>
<tr>
<td>训练硬件</td>
<td>异构低端</td>
<td>H100 集群</td>
<td>高端集群</td>
<td>高端集群</td>
</tr>
<tr>
<td>成本节省</td>
<td>20%</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>上下文长度</td>
<td>16K</td>
<td>128K</td>
<td>128K</td>
<td>128K</td>
</tr>
<tr>
<td>工具使用</td>
<td>⭐⭐⭐</td>
<td>⭐⭐</td>
<td>⭐⭐</td>
<td>⭐</td>
</tr>
<tr>
<td>代码能力</td>
<td>⭐⭐⭐</td>
<td>⭐⭐⭐</td>
<td>⭐⭐⭐</td>
<td>⭐⭐</td>
</tr>
</tbody></table>
<p><strong>Ling-Plus 的差异化优势</strong>:</p>
<ul>
<li>激活参数量最少(28.8B)，推理成本最低</li>
<li>唯一在异构低端硬件上训练成功的 300B 级 MoE</li>
<li>工具使用能力强于同级别模型</li>
</ul>
<hr>
<h2 id="zjpj">总结评价</h2>
<p>Ling-Plus 的最大价值在于<strong>证明了超大规模 MoE 模型可以在异构低端硬件上高效训练</strong>。在算力日益紧张、高端 GPU 供应受限的当下，这一方向具有重要的工程实践意义：</p>
<ol>
<li><strong>成本效益</strong>：20% 的成本降低对于 290B 模型 9T token 的预训练意味着千万级人民币的节省</li>
<li><strong>技术普惠</strong>：为资源有限的研究团队和中小企业提供了可行的训练路径</li>
<li><strong>系统创新</strong>：EDiT、XPUTimer、PCache、Flood 等组件构成了完整的低成本训练-推理生态</li>
<li><strong>差异化优势</strong>：知识图谱驱动的 Tool Use 能力在 Agent 时代具有独特竞争力</li>
</ol>
<p>局限：</p>
<ul>
<li>上下文长度仅 16K，落后于当前主流(128K-1M)</li>
<li>预训练数据量(9T)相对较小</li>
<li>总参数量 290B 虽大，但激活参数 28.8B 在 70B+ 级别中属于较低水平</li>
<li>模型尚未经过广泛的第三方独立评估</li>
</ul>
<hr>
<p><strong>关键词</strong>: MoE, 混合专家, 异构训练, 低成本训练, 工具使用, 知识图谱, 蚂蚁集团, 百灵, Ling-Plus</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"hxgx","text":"核心贡献"},{"level":2,"id":"mxgg","text":"模型规格"},{"level":2,"id":"gjjscx","text":"关键技术创新"},{"level":3,"id":"1-edit-dxfbsxl","text":"1. EDiT：弹性分布式训练"},{"level":3,"id":"2-sjlyyr-stochastic-routing-warmup","text":"2. 随机路由预热(Stochastic Routing Warmup)"},{"level":3,"id":"3-norm-head","text":"3. NormHead"},{"level":3,"id":"4-zstpqdd-tool-use","text":"4. 知识图谱驱动的 Tool Use"},{"level":2,"id":"syjg","text":"实验结果"},{"level":3,"id":"yxlmxdb-vs-70b-jx","text":"预训练模型对比(vs 70B+ 基线)"},{"level":3,"id":"hxlmxdb-vs-70b-chat","text":"后训练模型对比(vs 70B+ Chat)"},{"level":3,"id":"aqxpg","text":"安全性评估"},{"level":2,"id":"xl-quot-ksdjx-quot","text":"训练&quot;苦涩的教训&quot;"},{"level":3,"id":"ssjfcl","text":"损失尖峰处理"},{"level":3,"id":"kptdq","text":"跨平台对齐"},{"level":2,"id":"yxggzddb","text":"与相关工作的对比"},{"level":2,"id":"zjpj","text":"总结评价"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.16-ling/02-ling-plus/01-ling-plus-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.16-ling/02-ling-plus/01-ling-plus-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Ling-Plus 技术报告摘要</h1>
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
