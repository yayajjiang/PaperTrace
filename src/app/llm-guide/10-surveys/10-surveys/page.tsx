"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>10. 综述与前沿论文</h1>
<h2 id="1-zjdwyjz">1. 章节定位与价值</h2>
<p>在大语言模型(LLM)领域，知识的半衰期正在以惊人的速度缩短. 三个月前的&quot;SOTA&quot;(State of the Art)模型，很可能在今天已经被新的架构或训练范式所超越; 曾经被奉为圭臬的理论假设，也可能因为一篇关键的实证研究而被彻底推翻. 在这样的环境下，&quot;跟踪前沿&quot;不再是一种锦上添花的能力，而是每一个希望在该领域建立深度认知的从业者与研究者的<strong>生存技能</strong>. </p>
<p>然而，前沿信息的爆炸式增长也带来了严峻的&quot;信息过载&quot;问题. arXiv 上每天新增的大模型相关论文数以百计，顶会(NeurIPS、ICML、ICLR、ACL、EMNLP 等)每届收录的论文总量超过数千篇. 如果一个研究者试图通读所有这些论文，不仅时间上不可能，认知上也是自杀式的——大量低质量、重复性、或者仅在某个极窄数据集上提升了 0.1% 的论文，会严重消耗宝贵的注意力资源. </p>
<p><strong>本章的核心使命，就是充当一个高质量的&quot;学术过滤器&quot;和&quot;知识导航仪&quot;</strong>. 我们不追求覆盖所有论文，而是聚焦于那些真正具有<strong>范式转移潜力</strong>、<strong>系统梳理价值</strong>或<strong>工程实践指导意义</strong>的综述文章与前沿论文. 本章的定位是知识库的&quot;前沿瞭望塔&quot;，它将帮助读者: </p>
<ol>
<li><p><strong>建立全景认知</strong>: 通过高质量的综述文章，快速了解某个子领域的全貌、核心问题、主流方法和未解挑战. </p>
</li>
<li><p><strong>识别关键突破</strong>: 通过精选的前沿论文，捕捉那些可能改变技术走向的关键创新. </p>
</li>
<li><p><strong>培养独立判断力</strong>: 通过系统性的论文阅读方法论，让读者最终能够独立筛选和评估论文的价值.</p>
</li>
</ol>
<p>本章的内容是<strong>动态更新</strong>的. 大模型领域的发展速度决定了任何一份&quot;静态清单&quot;都会在很短时间内过时. 因此，我们不仅提供当前的精选内容，更致力于建立一套可持续的筛选和更新机制，确保本章始终反映领域最值得关注的研究动态. </p>
<hr>
<h2 id="2-rhgxyddhlw">2. 如何高效阅读顶会论文</h2>
<p>阅读学术论文是一项需要刻意训练的技能. 对于刚入门的读者，面对一篇动辄十几页的顶会论文，往往会陷入&quot;每个字都认识，但连起来不知道在说什么&quot;的困境. 事实上，论文写作有其固定的结构和逻辑，掌握正确的阅读策略，可以将阅读效率提升数倍. </p>
<h3 id="2-1-sdsydf">2.1 三段式阅读法</h3>
<p>我们推荐采用**&quot;漏斗式&quot;三段阅读法**，根据阅读目的决定投入的深度: </p>
<p><strong>第一阶段: 5分钟速读(标题 → 摘要 → 结论)</strong> </p>
<p>这一阶段的目标是判断&quot;这篇论文是否值得我花时间&quot;. 首先看标题，判断是否与自己的研究方向相关. 然后读摘要(Abstract)，摘要通常包含四个核心信息: 问题定义、方法概述、关键结果、贡献声明. 如果摘要中的问题你不关心，或者结果提升微乎其微，就可以直接跳过. 最后扫一眼结论(Conclusion)，确认作者的最终发现和局限性. 经过这五分钟，你应该能回答一个问题: <strong>&quot;这篇论文的核心卖点是什么？&quot;</strong></p>
<p><strong>第二阶段: 15分钟精读(图表 → 方法 → 实验)</strong> </p>
<p>对于通过第一阶段筛选的论文，进入&quot;批判性阅读&quot;阶段. 先不要急着读引言，而是直接跳到<strong>图表和实验结果</strong>(Figures, Tables, Experiments). 好的论文，其核心贡献往往可以通过几张关键图表传达. 看看作者在哪些 benchmark 上做了实验，基线模型是什么，提升幅度有多大. 然后回到<strong>方法部分(Methodology)</strong> ，重点理解核心创新点——不要试图理解每一个细节，而是问自己: <strong>&quot;作者为了解决什么问题，提出了什么新思路？这个思路与之前的方法有什么本质不同？&quot;</strong> 最后读<strong>引言(Introduction)</strong> ，此时你已经知道了论文的方法，引言中的&quot;相关工作&quot;和&quot;动机阐述&quot;会变得更加清晰. </p>
<p><strong>第三阶段: 深度研读(公式推导 → 代码复现)</strong> </p>
<p>对于真正重要的、与你当前工作直接相关的论文，才值得投入数小时甚至数天的时间进行深度研读. 这一阶段需要<strong>逐行理解公式推导</strong>，检查作者是否遗漏了关键假设; 需要<strong>阅读开源代码</strong>(如果有的话)，验证论文中的描述是否与实现一致. 很多时候，论文中&quot;可以看出&quot;的步骤，在代码中可能隐藏着关键的设计选择. </p>
<h3 id="2-2-jllwgltx">2.2 建立论文管理体系</h3>
<p>除了阅读技巧，<strong>系统性地管理已读论文</strong>同样重要. 我们强烈推荐使用文献管理工具(如 Zotero、Mendeley、Notion 或 Obsidian)，并建立一个分类标签体系. 以下是一个针对 LLM 领域的分类框架，也是本章组织内容的核心逻辑: </p>
<hr>
<h2 id="3-lwflffl">3. 论文分类方法论</h2>
<p>面对浩如烟海的 LLM 文献，建立一个多维度的分类体系是高效检索和知识组织的基础. 本章采用三层分类法: <strong>按任务分类</strong>、<strong>按架构分类</strong>、<strong>按应用分类</strong>. </p>
<h3 id="3-1-arwfl-cyxldbsdqsmzq">3.1 按任务分类: 从预训练到部署的全生命周期</h3>
<p>这是最直接、最符合工程实践视角的分类方式. 它按照大模型从&quot;出生&quot;到&quot;服役&quot;的完整生命周期来组织: </p>
<p><strong>预训练(Pre-training)</strong> 
涉及数据构建与清洗、Tokenizer 设计、模型架构选择(Decoder-only vs Encoder-Decoder)、训练目标函数(Next Token Prediction、Masked Language Modeling)、Scaling Law 与涌现能力等核心议题. 预训练阶段的论文通常关注如何更高效地利用算力和数据，训练出更强的基础模型. </p>
<p><strong>后训练与对齐(Post-training &amp; Alignment)</strong> 
基础模型训练完成后，需要通过监督微调(SFT)、强化学习(RLHF、DPO、GRPO 等)来使其行为符合人类预期. 这一领域的论文关注如何让模型&quot;听话&quot;、&quot;有用&quot;且&quot;无害&quot;，同时也涉及指令遵循、多轮对话、工具使用等能力的注入. </p>
<p><strong>推理与生成(Inference &amp; Generation)</strong> 
模型训练好后，如何让它在实际应用中跑得更快、更省资源？这一类别涵盖 KV Cache 优化、量化、剪枝、投机解码、PagedAttention 等推理加速技术，以及束搜索、采样策略等生成质量优化方法. </p>
<p><strong>评估与分析(Evaluation &amp; Analysis)</strong> 
如何科学地衡量一个模型的能力？这一类别包括 benchmark 设计(如 MMLU、GSM8K、HumanEval)、能力拆解研究(如探测模型是否具备真正的推理能力)、幻觉检测、可解释性分析等. </p>
<h3 id="3-2-ajgfl-c-transformer-dxydjg">3.2 按架构分类: 从 Transformer 到下一代架构</h3>
<p>这种分类方式聚焦于&quot;模型长什么样&quot;，适合那些希望深入理解模型内部工作机制的读者: </p>
<p><strong>注意力机制变体</strong>
自注意力(Self-Attention)是 Transformer 的核心，但其 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的计算复杂度在序列变长时成为瓶颈. 这一方向的论文探索各种高效注意力机制，如线性注意力、稀疏注意力、局部-全局混合注意力、Mamba 及其衍生状态空间模型(SSM)等. </p>
<p><strong>混合专家模型(Mixture of Experts, MoE)</strong> 
MoE 通过将模型参数稀疏化，在不增加推理计算量的前提下扩大模型容量. 从早期的 Switch Transformer 到 DeepSeek-V3 的精细 MoE 设计，这一方向正在重新定义&quot;大模型&quot;的扩展路径. </p>
<p><strong>多模态架构</strong>
如何将视觉、音频、视频等信息与语言模型统一处理？这一类别涵盖视觉Encoder 设计(如 ViT、SigLIP)、投影层/适配器设计(如 Q-Former、MLP Adapter)、以及原生多模态架构(如 Gemini、GPT-4o)的研究. </p>
<p><strong>长上下文架构</strong>
如何将模型的上下文窗口从 4K 扩展到 128K、1M 甚至无限长？这一方向涉及位置编码改进(如 RoPE、ALiBi、YaRN)、上下文压缩、Ring Attention 等技术创新. </p>
<h3 id="3-3-ayyfl-cdmscdkxfx">3.3 按应用分类: 从代码生成到科学发现</h3>
<p>这种分类方式面向那些有明确应用目标的读者，按照&quot;模型用来做什么&quot;来组织: </p>
<p><strong>代码与软件工程</strong>
代码生成(Code Generation)、代码补全(Code Completion)、漏洞检测(Vulnerability Detection)、自动化测试生成等. 代表性工作包括 CodeLlama、StarCoder、DeepSeek-Coder 等. </p>
<p><strong>数学与科学推理</strong>
定理证明、数学问题求解、科学文献理解、实验设计优化等. 这一领域对模型的严谨推理能力要求极高，是检验 LLM 真实智能水平的重要试金石. </p>
<p><strong>Agent 与工具使用</strong>
让模型能够自主规划、调用工具、与环境交互，完成复杂的多步骤任务. 这一类别涵盖 ReAct、AutoGPT、各种 Agent 框架，以及 Function Calling、MCP 等标准化协议. </p>
<p><strong>创意与内容生成</strong>
创意写作、营销文案、角色扮演、故事生成等. 虽然这一领域的技术门槛相对较低，但其中的&quot;可控生成&quot;和&quot;风格一致性&quot;问题仍然具有研究价值. </p>
<hr>
<h2 id="4-bzjsldzswzdh">4. 本章节收录的综述文章导航</h2>
<p>综述文章(Survey Paper)是快速进入一个陌生子领域的最佳入口. 与单篇研究论文不同，综述文章由领域内的资深研究者撰写，经过系统的文献检索和批判性分析，能够为读者提供一个结构化、有深度的领域全景图. 本章将优先收录和解读以下类型的高质量综述: </p>
<h3 id="4-1-qjsdmxzs">4.1 全景式大模型综述</h3>
<p>这类综述试图覆盖 LLM 的方方面面，适合希望建立整体认知的读者. 最具代表性的包括: </p>
<ul>
<li><p><strong>《A Survey of Large Language Models》</strong>: 由中国人民大学等机构的研究者撰写，被广泛认为是中文社区最常被引用的 LLM 全景综述之一. 它系统性地梳理了从预训练到对齐的完整技术栈，并提供了详尽的模型发展时间线. </p>
</li>
<li><p><strong>《From Pre-training to Alignment: A Comprehensive Survey》</strong>: 聚焦于 LLM 的训练全流程，对数据准备、架构选择、训练目标、对齐方法进行了深度剖析，是理解&quot;如何训练一个大模型&quot;的必读材料.</p>
</li>
</ul>
<h3 id="4-2-zlysdzs">4.2 子领域深度综述</h3>
<p>这类综述聚焦于某个特定的技术方向，深度远超全景式综述. 本章将重点覆盖以下子领域: </p>
<p><strong>RAG(检索增强生成)综述</strong>
RAG 是当前 LLM 应用落地最重要的技术范式之一. 我们将收录梳理 RAG 技术演进路线的综述，从早期的 Naive RAG(直接拼接检索结果到 prompt)，到 Advanced RAG(引入重排序、查询改写、多路召回)，再到 Modular RAG(将检索、生成、后处理等环节解耦为可组合模块)的完整发展脉络. </p>
<p><strong>Agent(智能体)综述</strong>
Agent 是 2024-2025 年最炙手可热的研究方向. 我们将收录对 LLM-based Agent 的系统性综述，重点关注 Agent 的核心组件——<strong>规划(Planning)</strong> 、<strong>记忆(Memory)</strong> 、<strong>工具使用(Tool Use)</strong> ——的研究现状，以及单 Agent 与多 Agent 协作系统的设计范式. </p>
<p><strong>长上下文建模综述</strong>
随着模型上下文窗口的急剧扩展，长文本理解、长视频分析成为可能. 我们将收录总结长上下文技术路线的综述，包括位置编码改进、上下文压缩、注意力计算优化等关键技术. </p>
<p><strong>模型高效化综述</strong>
涵盖模型压缩(量化、剪枝、蒸馏)、推理加速(投机解码、KV Cache 优化)、训练加速(混合精度、梯度Checkpoint、ZeRO 优化)等方向的系统性综述. </p>
<h3 id="4-3-jsbgybps">4.3 技术报告与白皮书</h3>
<p>除了学术论文，工业界发布的技术报告和白皮书往往包含宝贵的工程实践经验. 本章也将精选收录: </p>
<ul>
<li><p><strong>Llama 系列技术报告</strong>: Meta 发布的 Llama 2、Llama 3 技术报告，详细披露了训练数据构成、后训练流程、安全对齐策略等关键细节. </p>
</li>
<li><p><strong>DeepSeek 系列技术报告</strong>: DeepSeek-V2/V3 的技术报告揭示了 MLA(Multi-head Latent Attention)和精细 MoE 架构的设计哲学. </p>
</li>
<li><p><strong>Google AI Agent 白皮书</strong>: Google 对 Agent 的定义、架构和发展路径的权威阐述.</p>
</li>
</ul>
<hr>
<h2 id="5-qylwzzcl">5. 前沿论文追踪策略</h2>
<p>综述文章提供的是&quot;全景图&quot;，而前沿论文(通常指近半年内发表、具有突破性贡献的研究)则是&quot;最新战报&quot;. 本章将采用以下策略筛选和解读前沿论文: </p>
<p><strong>1. 顶会 oral/spotlight 论文优先</strong>
顶会的 oral 和 spotlight 论文经过了审稿人和领域主席的多轮严格筛选，通常代表着该年度最重要的技术突破. 我们将重点关注 NeurIPS、ICML、ICLR、ACL、EMNLP、CVPR 等顶级会议的高分录用论文. </p>
<p><strong>2. 关注&quot;范式转移&quot;信号</strong>
不是所有新论文都值得追踪. 我们将优先关注那些可能引发&quot;范式转移&quot;的工作——例如，提出全新架构(如 Mamba 系列)、重新定义训练目标(如拒绝采样微调)、或者颠覆某个长期假设(如&quot;大模型必须很大才能涌现&quot;)的论文. </p>
<p><strong>3. 工业界与学术界并重</strong>
学术界论文往往理论扎实、实验严谨，但工业界论文(尤其是来自 OpenAI、Google DeepMind、Anthropic、Meta 等顶级实验室的技术报告)往往包含一手的工程实践和大规模实验结果. 两者互补，才能形成完整的认知. </p>
<p><strong>4. 建立&quot;待验证&quot;机制</strong>
对于特别前沿、尚未经过社区充分检验的论文，我们会明确标注其结论的置信度. 有些论文的实验结果可能难以复现，或者其声称的&quot;突破性&quot;在更广泛的数据集上不成立. 我们鼓励读者保持健康的怀疑态度，不盲目追随热点. </p>
<hr>
<h2 id="6-sybzdjy">6. 使用本章的建议</h2>
<p><strong>对于初学者</strong>: 建议从&quot;全景式综述&quot;和&quot;如何阅读论文&quot;部分开始，先建立对 LLM 领域的整体认知和论文阅读的基本技能. 不要急于阅读前沿论文，因为你可能缺乏判断其价值和局限性的背景知识. </p>
<p><strong>对于有一定基础的开发者</strong>: 可以根据自己的兴趣或工作需求，选择对应的&quot;子领域深度综述&quot;进行针对性阅读. 同时，定期浏览本章更新的&quot;前沿论文精选&quot;，保持对领域动态的敏感度. </p>
<p><strong>对于研究者</strong>: 本章的&quot;论文分类方法论&quot;和&quot;追踪策略&quot;或许能为你的文献管理体系提供一些参考. 更重要的是，我们希望你最终能够<strong>超越本章</strong>，建立起自己的论文筛选和评估标准——毕竟，独立判断能力是研究者最核心的素养之一. </p>
<hr>
<p><img src="/llm-guide/10-surveys/10-surveys/images/paper_funnel.png" alt="论文漏斗式筛选流程"></p>
<blockquote>
<p><strong>图 10.2 Paper Reading Funnel 漏斗式筛选模型</strong>
面对每日成百上千篇的新论文，建立严谨的漏斗过滤机制是防范信息过载的必要手段. 只有那些通过重重筛选，最终完成代码复现与知识库归档的少部分论文，才能沉淀为开发者的硬核实力. </p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-zjdwyjz","text":"1. 章节定位与价值"},{"level":2,"id":"2-rhgxyddhlw","text":"2. 如何高效阅读顶会论文"},{"level":3,"id":"2-1-sdsydf","text":"2.1 三段式阅读法"},{"level":3,"id":"2-2-jllwgltx","text":"2.2 建立论文管理体系"},{"level":2,"id":"3-lwflffl","text":"3. 论文分类方法论"},{"level":3,"id":"3-1-arwfl-cyxldbsdqsmzq","text":"3.1 按任务分类: 从预训练到部署的全生命周期"},{"level":3,"id":"3-2-ajgfl-c-transformer-dxydjg","text":"3.2 按架构分类: 从 Transformer 到下一代架构"},{"level":3,"id":"3-3-ayyfl-cdmscdkxfx","text":"3.3 按应用分类: 从代码生成到科学发现"},{"level":2,"id":"4-bzjsldzswzdh","text":"4. 本章节收录的综述文章导航"},{"level":3,"id":"4-1-qjsdmxzs","text":"4.1 全景式大模型综述"},{"level":3,"id":"4-2-zlysdzs","text":"4.2 子领域深度综述"},{"level":3,"id":"4-3-jsbgybps","text":"4.3 技术报告与白皮书"},{"level":2,"id":"5-qylwzzcl","text":"5. 前沿论文追踪策略"},{"level":2,"id":"6-sybzdjy","text":"6. 使用本章的建议"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/10-surveys" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/10-surveys" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">10 综述与前沿论文</h1>
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
