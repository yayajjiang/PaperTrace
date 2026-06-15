"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>ChatGLM 三代迭代与开源生态建设剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: ChatGLM: A Family of Large Language Models from GLM-130B to GLM-4 All Tools (arXiv:2406.12793v2)
发布日期: 2024 年 7 月 30 日
发布机构: Zhipu AI &amp; Tsinghua University (Team GLM)
开源协议: ChatGLM-6B 三代、GLM-4-9B 系列开源</p>
</blockquote>
<hr>
<h2 id="1-lsdw-zgkydmxd-pbz">1. 历史定位: 中国开源大模型的「破冰者」</h2>
<p>2023 年 3 月 14 日,ChatGPT 发布三个月后,智谱 AI 同时上线了两个模型:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数</th>
<th>定位</th>
<th>访问方式</th>
</tr>
</thead>
<tbody><tr>
<td>ChatGLM-130B</td>
<td>130B</td>
<td>对齐后的 GLM-130B,对标 GPT-3.5</td>
<td>API (chatglm.cn)</td>
</tr>
<tr>
<td>ChatGLM-6B</td>
<td>6.2B</td>
<td>消费级可部署的开源对话模型</td>
<td>Hugging Face 开源</td>
</tr>
</tbody></table>
<p>这一时间点极具战略意义. 在 2023 年初,中国市场上几乎没有可本地部署的开源中文对话模型. LLaMA 虽然开源,但 primarily English;BLOOM 支持多语言但中文能力有限. ChatGLM-6B 的发布填补了这一空白,成为中国开发者和研究者的「第一个开源中文大模型」.</p>
<p>这里需要停下来想一下. ChatGLM-6B 的成功并非偶然,而是智谱 AI 长期学术积累的产物. 从 2021 年的 GLM-10B 到 2022 年的 GLM-130B,团队已经在自回归空白填充架构、大规模预训练稳定性和中英文双语建模上积累了两年经验. 当 ChatGPT 引爆市场时,智谱 AI 不是从零开始追赶,而是将已有的 GLM-130B 进行对齐微调,并同时发布一个可部署的小版本. 这种「大模型 API + 小模型开源」的双轨策略,既满足了商业用户的需求,又建立了开发者社区——而社区反馈又成为后续迭代的重要输入.</p>
<hr>
<h2 id="2-sddd-qgyd-zgsd">2. 三代迭代: 七个月的「中国速度」</h2>
<p>从 2023 年 3 月到 2023 年 10 月,ChatGLM 完成了三代迭代,每代间隔仅三个月:</p>
<h3 id="2-1-chat-glm-6b-2023-03-pbzz">2.1 ChatGLM-6B (2023.03): 破冰之作</h3>
<table>
<thead>
<tr>
<th>指标</th>
<th>数值</th>
</tr>
</thead>
<tbody><tr>
<td>参数</td>
<td>6.2B</td>
</tr>
<tr>
<td>预训练数据</td>
<td>~1T token (中英文)</td>
</tr>
<tr>
<td>上下文</td>
<td>2K</td>
</tr>
<tr>
<td>对齐方式</td>
<td>主要 SFT</td>
</tr>
<tr>
<td>量化支持</td>
<td>INT4 (消费级 GPU 可部署)</td>
</tr>
<tr>
<td>关键性能</td>
<td>MMLU 25.2%, GSM8K 1.5%, HumanEval 0%</td>
</tr>
</tbody></table>
<p>ChatGLM-6B 的初始性能并不惊艳——GSM8K 仅 1.5%,HumanEval 为 0%. 但它的价值不在于绝对性能,而在于<strong>可及性</strong>: 6B 参数 + INT4 量化意味着单张 RTX 3060(12GB)即可运行,这让无数中国开发者第一次体验到了「本地部署大模型」的可能性.</p>
<h3 id="2-2-chat-glm2-6b-2023-06-jgsj">2.2 ChatGLM2-6B (2023.06): 架构升级</h3>
<table>
<thead>
<tr>
<th>升级项</th>
<th>技术</th>
<th>效果</th>
</tr>
</thead>
<tbody><tr>
<td>上下文扩展</td>
<td>FlashAttention</td>
<td>2K → 32K</td>
</tr>
<tr>
<td>注意力机制</td>
<td>Multi-Query Attention (MQA)</td>
<td>推理速度 +42%</td>
</tr>
<tr>
<td>数据质量</td>
<td>更多高质量数据</td>
<td>MMLU +23%, GSM8K +571%, BBH +60%</td>
</tr>
</tbody></table>
<p>MQA 的引入是一个关键决策. 标准 MHA 中每个头都有独立的 K/V 投影,导致 KV cache 随头数线性增长. MQA 让所有头共享同一组 K/V,将 KV cache 压缩为原来的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mi mathvariant="normal">/</mi><mi>h</mi></mrow><annotation encoding="application/x-tex">1/h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1/</span><span class="mord mathnormal">h</span></span></span></span>(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi></mrow><annotation encoding="application/x-tex">h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span></span></span></span> 为头数). 这使得 32K 上下文下的推理内存占用大幅降低,为长文档问答等场景打开了可能性.</p>
<p>这里值得停下来想一下. ChatGLM2-6B 的升级路径反映了 2023 年中期开源 LLM 的技术共识: FlashAttention 解决长上下文计算的内存瓶颈,MQA 解决长上下文推理的 KV cache 瓶颈. 这些技术并非智谱首创(LLaMA-2 同期也采用了 GQA,FlashAttention 来自 Tri Dao 2022 年的工作),但 ChatGLM2-6B 将它们整合到了中文开源模型中,并验证了在 6B 规模上的有效性. 更重要的是,团队在同一时期开发了 CodeGeeX2-6B——在额外 600B 代码 token 上预训练,HumanEval-X 上 Pass@1 提升 57%-83%. 这说明「小模型快速迭代」策略不仅适用于通用模型,也适用于领域特化模型.</p>
<h3 id="2-3-chat-glm3-6b-2023-10-agent-hzx">2.3 ChatGLM3-6B (2023.10): Agent 化转型</h3>
<p>ChatGLM3-6B 的核心变化不在架构,而在<strong>能力范围</strong>:</p>
<ul>
<li><strong>函数调用(function calling)</strong>: 模型可以理解外部工具接口并生成调用请求</li>
<li><strong>代码解释器(code interpreter)</strong>: 模型可以生成并执行 Python 代码</li>
<li><strong>Agent 任务</strong>: 模型可以执行多步规划、工具调用和错误恢复</li>
</ul>
<p>在 42 个基准上的评估显示,ChatGLM3-6B 在语义、数学、推理、代码和知识等维度登顶. 从性能数据看,第三代相比第一代的提升是跨越式的:</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>ChatGLM-6B</th>
<th>ChatGLM3-6B-Base</th>
<th>提升倍数</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>25.2%</td>
<td>61.4%</td>
<td>2.4×</td>
</tr>
<tr>
<td>GSM8K</td>
<td>1.5%</td>
<td>72.3%</td>
<td>48×</td>
</tr>
<tr>
<td>BBH</td>
<td>0.0%</td>
<td>66.1%</td>
<td>∞</td>
</tr>
<tr>
<td>HumanEval</td>
<td>0.0%</td>
<td>58.5%</td>
<td>∞</td>
</tr>
</tbody></table>
<p>这种跨越式提升不是简单的参数调整,而是<strong>预训练数据配方、对齐策略和架构改进的系统性重构</strong>. 从 HumanEval 0% 到 58.5% 的跃升尤其值得关注——第三代才真正具备了代码生成能力,这与 CodeGeeX2-6B 的代码预训练经验直接相关.</p>
<hr>
<h2 id="3-xmxxh-dgccl">3. 「小模型先行」的工程策略</h2>
<h3 id="3-1-clhx">3.1 策略核心</h3>
<p>智谱 AI 的迭代哲学可以概括为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>小模型探路</mtext><mo>→</mo><mtext>验证假设</mtext><mo>→</mo><mtext>大模型验证</mtext><mo>→</mo><mtext>产品化</mtext></mrow><annotation encoding="application/x-tex">\\text{小模型探路} \\rightarrow \\text{验证假设} \\rightarrow \\text{大模型验证} \\rightarrow \\text{产品化}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">小模型探路</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">验证假设</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">大模型验证</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">产品化</span></span></span></span></span></span><p>在 ChatGLM 的开发过程中,团队同时训练了 1.5B、3B、12B、32B、66B 和 130B 参数的模型,以验证观察结果并建立自己的 scaling laws. 这种多尺度实验设计使得团队能够在 6B 模型上快速试错(数周即可完成训练),然后将验证成功的技术迁移到更大规模.</p>
<h3 id="3-2-y-deep-seek-kyclddb">3.2 与 DeepSeek 开源策略的对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>智谱 AI (ChatGLM)</th>
<th>DeepSeek</th>
</tr>
</thead>
<tbody><tr>
<td>开源重点</td>
<td>完整模型家族(1.5B-130B)</td>
<td>最终大模型(V3 671B, R1)</td>
</tr>
<tr>
<td>迭代频率</td>
<td>每 3 个月一代</td>
<td>每 6-12 个月一代</td>
</tr>
<tr>
<td>小模型作用</td>
<td>快速验证和社区建设</td>
<td>主要用于技术报告对比</td>
</tr>
<tr>
<td>社区生态</td>
<td>1000 万+ 下载(2023 年)</td>
<td>主要受工业界关注</td>
</tr>
</tbody></table>
<p>这里需要停下来想一下. 两种策略各有优劣. 智谱的「完整家族开源」策略更适合学术研究和社区应用开发——研究者可以用 1.5B 模型做快速实验,用 6B 模型做原型验证,用 130B 模型做最终评估. 这种分层降低了参与门槛,但也分散了团队的维护精力. DeepSeek 的「终极模型开源」策略则更具冲击力——一个 671B 的 MoE 模型直接定义了开源模型的性能上限,但中小开发者很难在本地部署. 从结果看,智谱策略在 2023 年成功建立了中国开源 LLM 的最早社区,而 DeepSeek 策略在 2024-2025 年赢得了全球工业界的关注.</p>
<hr>
<h2 id="4-jsyc-c-chat-glm-d-glm-4">4. 技术遗产: 从 ChatGLM 到 GLM-4</h2>
<p>ChatGLM 三代的实验为 GLM-4 的每个设计选择提供了验证基础:</p>
<table>
<thead>
<tr>
<th>GLM-4 设计</th>
<th>ChatGLM 验证来源</th>
</tr>
</thead>
<tbody><tr>
<td>RMSNorm + SwiGLU</td>
<td>ChatGLM2-6B 验证稳定性优于 LayerNorm + ReLU</td>
</tr>
<tr>
<td>GQA</td>
<td>ChatGLM2-6B 的 MQA 验证 KV cache 压缩的有效性</td>
</tr>
<tr>
<td>32K → 128K 上下文</td>
<td>ChatGLM2-6B 的 FlashAttention 验证长上下文可行性</td>
</tr>
<tr>
<td>函数调用 + 代码解释器</td>
<td>ChatGLM3-6B 验证 Agent 能力的基础需求</td>
</tr>
<tr>
<td>150K 统一词表</td>
<td>三代 ChatGLM 验证中英双语 tokenization 的效率</td>
</tr>
</tbody></table>
<p>这种「技术遗产」的传承体现了系统工程的价值: 每个小模型的实验不仅服务于自身,更是为下一代大模型积累「已知可行」的技术清单. 这与 OpenAI 的闭源策略形成对比——外界无法得知 GPT-4 的哪些设计经过了 GPT-3.5 的验证,而智谱的开源家族让这一传承过程完全透明.</p>
<hr>
<h2 id="5-kyst-1000-wcxzzh">5. 开源生态: 1000 万次下载之后</h2>
<h3 id="5-1-sqyx">5.1 社区影响</h3>
<p>2023 年,ChatGLM-6B 三代累计 Hugging Face 下载量超过 1000 万次. 这一数字在当时的中国开源模型中是无与伦比的. 更重要的是,它催生了一系列衍生工作和应用场景:</p>
<ul>
<li><strong>垂直领域微调</strong>: 医疗、法律、金融等领域的 ChatGLM 微调模型</li>
<li><strong>模型压缩与部署</strong>: INT4/INT8 量化、ONNX 转换、移动端适配</li>
<li><strong>多模态扩展</strong>: CogVLM(视觉)、CogAgent(视觉 Agent)、CogView(文生图)</li>
<li><strong>代码模型</strong>: CodeGeeX 系列(从 13B 到 6B 的迭代)</li>
</ul>
<h3 id="5-2-jyjz">5.2 教育价值</h3>
<p>ChatGLM-6B 的 6B 规模使其成为 LLM 教育的理想教材. 相比 175B 的 GPT-3 或 671B 的 DeepSeek-V3,6B 模型可以在单张消费级 GPU 上完成全量微调,让学生和研究者能够亲身体验预训练、SFT 和 RLHF 的完整流程. 智谱 AI 随后发布的更小的 1.5B 和 3B 模型进一步降低了教育门槛.</p>
<hr>
<h2 id="6-mxpxdw">6. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: GLM-130B(ICLR 2023, 百亿级预训练验证)</li>
<li><strong>核心创新</strong>:<ul>
<li>「小模型先行」的快速迭代策略(6B 探路 → 大模型验证)</li>
<li>每 3 个月一代的迭代速度(2023 年 3 月-10 月三代)</li>
<li>ChatGLM2-6B: FlashAttention + MQA + 32K 上下文</li>
<li>ChatGLM3-6B: 函数调用 + 代码解释器 + Agent 任务</li>
<li>CodeGeeX2-6B: 600B 代码 token 预训练,多语言代码生成</li>
<li>CharacterGLM: 角色定制对话模型</li>
<li>完整模型家族开源(1.5B-130B),2023 年 Hugging Face 下载超 1000 万</li>
</ul>
</li>
<li><strong>同期竞争</strong>:<ul>
<li>百度文心一言(闭源,2023.03)</li>
<li>阿里通义千问(开源 7B/14B,2023.04)</li>
<li>Meta Llama-2(开源,2023.07, primarily English)</li>
</ul>
</li>
<li><strong>被后续工作影响</strong>:<ul>
<li>GLM-4(集三代经验之大成)</li>
<li>GLM-4-Voice(语音模态扩展)</li>
<li>GLM-4.5V/4.6V(视觉-语言模态扩展)</li>
<li>中国开源社区的多轮 ChatGLM 微调模型</li>
</ul>
</li>
<li><strong>历史意义</strong>:<ul>
<li>中国首个开源中文对话大模型</li>
<li>首个实现消费级 GPU 本地部署的中文 LLM</li>
<li>验证了「小模型快速迭代」策略在 LLM 领域的有效性</li>
</ul>
</li>
</ul>
<hr>
<p><em>本文档基于 GLM-4 技术报告中 ChatGLM 历史章节(arXiv:2406.12793v2)进行系统性架构剖析.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-lsdw-zgkydmxd-pbz","text":"1. 历史定位: 中国开源大模型的「破冰者」"},{"level":2,"id":"2-sddd-qgyd-zgsd","text":"2. 三代迭代: 七个月的「中国速度」"},{"level":3,"id":"2-1-chat-glm-6b-2023-03-pbzz","text":"2.1 ChatGLM-6B (2023.03): 破冰之作"},{"level":3,"id":"2-2-chat-glm2-6b-2023-06-jgsj","text":"2.2 ChatGLM2-6B (2023.06): 架构升级"},{"level":3,"id":"2-3-chat-glm3-6b-2023-10-agent-hzx","text":"2.3 ChatGLM3-6B (2023.10): Agent 化转型"},{"level":2,"id":"3-xmxxh-dgccl","text":"3. 「小模型先行」的工程策略"},{"level":3,"id":"3-1-clhx","text":"3.1 策略核心"},{"level":3,"id":"3-2-y-deep-seek-kyclddb","text":"3.2 与 DeepSeek 开源策略的对比"},{"level":2,"id":"4-jsyc-c-chat-glm-d-glm-4","text":"4. 技术遗产: 从 ChatGLM 到 GLM-4"},{"level":2,"id":"5-kyst-1000-wcxzzh","text":"5. 开源生态: 1000 万次下载之后"},{"level":3,"id":"5-1-sqyx","text":"5.1 社区影响"},{"level":3,"id":"5-2-jyjz","text":"5.2 教育价值"},{"level":2,"id":"6-mxpxdw","text":"6. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/02-chat-glm/05-chat-glm-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/02-chat-glm/05-chat-glm-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ChatGLM 三代迭代与开源生态建设剖析</h1>
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
