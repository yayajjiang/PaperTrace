"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Allen AI OLMo: 全开源大模型生态</h1>
<blockquote>
<p>本文介绍 Allen Institute for AI (AI2) 的 OLMo 系列项目——一个从数据处理到预训练、微调、评测全链路开源透明的大模型生态系统. </p>
</blockquote>
<hr>
<h2 id="1-wsm-olmo-sky-ai-ddf">1. 为什么 OLMo 是开源 AI 的典范</h2>
<p>大多数&quot;开源&quot;模型(如 Llama、Mistral)仅提供模型权重和部分代码，而 OLMo 开放了整个&quot;模型流水线&quot;: </p>
<ul>
<li><strong>完整训练数据</strong>: 包括原始语料、清洗脚本、数据混合比例</li>
<li><strong>完整训练代码</strong>: 从数据预处理到模型训练的全部代码</li>
<li><strong>完整训练日志</strong>: 每步的损失、学习率、梯度范数等</li>
<li><strong>完整评测代码</strong>: 确保结果可复现</li>
</ul>
<p>这使得 OLMo 成为研究者和开发者手中的&quot;教科书&quot;——任何人都可以从零开始复现一个 32B 参数的大模型. </p>
<hr>
<h2 id="2-olmo-djsz">2. OLMo 的技术栈</h2>
<h3 id="2-1-sjcl">2.1 数据处理</h3>
<p>** Dolma 数据集**: </p>
<ul>
<li>3 万亿 token 的预训练语料</li>
<li>包含网页、书籍、学术论文、代码、维基百科</li>
<li>完整的清洗和去重 pipeline 开源</li>
</ul>
<p><strong>数据混合策略</strong>: </p>
<ul>
<li>通过实验确定最优数据比例</li>
<li>不同数据源对模型能力的影响可量化分析</li>
</ul>
<h3 id="2-2-mxjg">2.2 模型架构</h3>
<ul>
<li>基于 Decoder-only Transformer</li>
<li>支持多种规模: 1B、7B、32B</li>
<li>使用 RoPE 位置编码、SwiGLU 激活、RMSNorm</li>
</ul>
<h3 id="2-3-xljcss">2.3 训练基础设施</h3>
<ul>
<li>基于 PyTorch 和 FSDP</li>
<li>支持多种并行策略: 数据并行、张量并行、流水线并行</li>
<li>训练脚本包含完整的超参数配置</li>
</ul>
<hr>
<h2 id="3-olmo-ddtjz">3. OLMo 的独特价值</h2>
<h3 id="3-1-kxyj">3.1 科学研究</h3>
<ul>
<li><strong>可复现性</strong>: 任何研究者都可以完全复现 OLMo 的训练过程</li>
<li><strong>消融实验</strong>: 可以修改数据比例、架构细节，观察对性能的影响</li>
<li><strong>故障分析</strong>: 完整的训练日志有助于分析训练过程中的异常</li>
</ul>
<h3 id="3-2-jyjz">3.2 教育价值</h3>
<ul>
<li><strong>学习材料</strong>: 对于想理解大模型训练全过程的学生，OLMo 是最佳教材</li>
<li><strong>实践平台</strong>: 可以在小规模(1B)上快速实验，再扩展到大规模</li>
</ul>
<h3 id="3-3-gyyy">3.3 工业应用</h3>
<ul>
<li><strong>定制化训练</strong>: 基于 OLMo 的数据和代码，可以快速构建领域专属模型</li>
<li><strong>合规审计</strong>: 全链路透明，满足数据合规和审计要求</li>
</ul>
<hr>
<h2 id="4-olmo-yqtkyxmddb">4. OLMo 与其他开源项目的对比</h2>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">OLMo</th>
<th align="left">Llama</th>
<th align="left">Mistral</th>
</tr>
</thead>
<tbody><tr>
<td align="left">模型权重</td>
<td align="left">✅</td>
<td align="left">✅</td>
<td align="left">✅</td>
</tr>
<tr>
<td align="left">训练代码</td>
<td align="left">✅</td>
<td align="left">⚠️ 部分</td>
<td align="left">⚠️ 部分</td>
</tr>
<tr>
<td align="left">训练数据</td>
<td align="left">✅</td>
<td align="left">❌</td>
<td align="left">❌</td>
</tr>
<tr>
<td align="left">数据清洗脚本</td>
<td align="left">✅</td>
<td align="left">❌</td>
<td align="left">❌</td>
</tr>
<tr>
<td align="left">训练日志</td>
<td align="left">✅</td>
<td align="left">❌</td>
<td align="left">❌</td>
</tr>
<tr>
<td align="left">评测代码</td>
<td align="left">✅</td>
<td align="left">⚠️ 部分</td>
<td align="left">⚠️ 部分</td>
</tr>
</tbody></table>
<hr>
<h2 id="5-rhsy-olmo">5. 如何使用 OLMo</h2>
<h3 id="5-1-ksks">5.1 快速开始</h3>
<pre><code class="language-bash"># 克隆仓库
git clone https://github.com/allenai/OLMo.git
cd OLMo

# 安装依赖
pip install -e .

# 下载预训练模型
olmo-download --model OLMo-7B

# 推理
python -m olmo.inference --model OLMo-7B --prompt &quot;Hello, world!&quot;
</code></pre>
<h3 id="5-2-ctxl">5.2 从头训练</h3>
<pre><code class="language-bash"># 准备数据
python scripts/prepare_data.py --config configs/data/dolma.yaml

# 启动训练
python scripts/train.py --config configs/OLMo-1B.yaml
</code></pre>
<hr>
<h2 id="6-zj">6. 总结</h2>
<p>OLMo 项目展示了大模型开源的终极形态——不仅是&quot;开放权重&quot;，而是&quot;开放整个过程&quot;. 这种极致的透明性虽然增加了维护成本，但为 AI 研究社区提供了前所未有的可复现性和学习资源. </p>
<blockquote>
<p>参考来源: <a href="https://zhuanlan.zhihu.com/p/2013235500232746266">Allen AI OLMo 全开源生态</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wsm-olmo-sky-ai-ddf","text":"1. 为什么 OLMo 是开源 AI 的典范"},{"level":2,"id":"2-olmo-djsz","text":"2. OLMo 的技术栈"},{"level":3,"id":"2-1-sjcl","text":"2.1 数据处理"},{"level":3,"id":"2-2-mxjg","text":"2.2 模型架构"},{"level":3,"id":"2-3-xljcss","text":"2.3 训练基础设施"},{"level":2,"id":"3-olmo-ddtjz","text":"3. OLMo 的独特价值"},{"level":3,"id":"3-1-kxyj","text":"3.1 科学研究"},{"level":3,"id":"3-2-jyjz","text":"3.2 教育价值"},{"level":3,"id":"3-3-gyyy","text":"3.3 工业应用"},{"level":2,"id":"4-olmo-yqtkyxmddb","text":"4. OLMo 与其他开源项目的对比"},{"level":2,"id":"5-rhsy-olmo","text":"5. 如何使用 OLMo"},{"level":3,"id":"5-1-ksks","text":"5.1 快速开始"},{"level":3,"id":"5-2-ctxl","text":"5.2 从头训练"},{"level":2,"id":"6-zj","text":"6. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/allen-ai-olmo-qkyst" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/allen-ai-olmo-qkyst" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Allen AI OLMo: 全开源大模型生态</h1>
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
