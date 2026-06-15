"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>02-GPT-2 核心技术专题：规模扩展的涌现效应与 Zero-shot 能力的发现</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.12-openai/14.12-openai">返回 14.12-OpenAI 家族总览</a></strong></p>
</blockquote>
<h2 id="y-fbbjyhxfx">一、发布背景与核心发现</h2>
<p>2019 年 2 月，OpenAI 发表了论文《Language Models are Unsupervised Multitask Learners》，发布了 <strong>GPT-2</strong>。这款拥有 <strong>15 亿参数</strong> 的模型，不仅是 GPT-1 的 13 倍放大版，更重要的是，它揭示了一个改变 AI 发展轨迹的现象：<strong>Zero-shot 能力的涌现</strong>。</p>
<h3 id="1-1-quot-twx-quot-dmx">1.1 &quot;太危险&quot;的模型</h3>
<p>GPT-2 的发布过程在大模型史上堪称传奇。OpenAI 最初以&quot;<strong>担心被恶意使用</strong>&quot;为由，<strong>拒绝发布完整模型</strong>，只公布了小版本(124M 参数)。这一决定引发了学术界对&quot;AI 安全&quot;和&quot;研究开放性&quot;的激烈争论。</p>
<p><strong>OpenAI 的担忧</strong>：</p>
<ul>
<li>GPT-2 可以生成逼真的假新闻</li>
<li>可能被用于制造虚假信息、钓鱼邮件</li>
<li>社交媒体上的自动化垃圾内容</li>
</ul>
<p><strong>逐步发布的策略</strong>：</p>
<table>
<thead>
<tr>
<th>时间</th>
<th>发布版本</th>
<th>参数量</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>2019.02</td>
<td>Small</td>
<td>124M</td>
<td>初始发布</td>
</tr>
<tr>
<td>2019.05</td>
<td>Medium</td>
<td>355M</td>
<td>延迟发布</td>
</tr>
<tr>
<td>2019.08</td>
<td>Large</td>
<td>774M</td>
<td>进一步延迟</td>
</tr>
<tr>
<td>2019.11</td>
<td>XL (Full)</td>
<td>1.5B</td>
<td>完整模型</td>
</tr>
</tbody></table>
<p>这种谨慎的发布策略虽然备受争议，但也反映了 OpenAI 对模型能力的深刻认识——<strong>规模扩展带来的能力跃升可能超出预期</strong>。</p>
<h3 id="1-2-hxfx-zero-shot-yx">1.2 核心发现：Zero-shot 涌现</h3>
<p>GPT-1 需要微调才能处理下游任务，但 GPT-2 发现：<strong>当模型足够大时，仅凭预训练就可以处理从未见过的新任务</strong>。</p>
<p>这一发现后来被称为 <strong>Zero-shot Learning 的涌现(Emergence of Zero-shot Capability)</strong>：</p>
<pre><code>GPT-1 (117M): 预训练 → 微调 → 任务
GPT-2 (1.5B): 预训练 → 直接 Zero-shot → 任务
</code></pre>
<p><strong>关键洞察</strong>：</p>
<blockquote>
<p>&quot;当模型在足够多样和大量的网页数据上训练时，它会在预训练过程中隐式地学习多种任务的解决模式。&quot;</p>
</blockquote>
<h2 id="e-gmkzdgcsj">二、规模扩展的工程实践</h2>
<h3 id="2-1-c-117m-d-1-5b-13-bdkz">2.1 从 117M 到 1.5B：13 倍的扩展</h3>
<p>GPT-2 在 GPT-1 的基础上进行了全面的规模扩展：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>GPT-1</th>
<th>GPT-2</th>
<th>扩展倍数</th>
</tr>
</thead>
<tbody><tr>
<td>参数量</td>
<td>117M</td>
<td><strong>1.5B</strong></td>
<td>13x</td>
</tr>
<tr>
<td>层数</td>
<td>12</td>
<td><strong>48</strong></td>
<td>4x</td>
</tr>
<tr>
<td>注意力头</td>
<td>12</td>
<td><strong>16</strong></td>
<td>1.3x</td>
</tr>
<tr>
<td>隐藏维度</td>
<td>768</td>
<td><strong>1600</strong></td>
<td>2.1x</td>
</tr>
<tr>
<td>FFN 维度</td>
<td>3072</td>
<td><strong>6400</strong></td>
<td>2.1x</td>
</tr>
<tr>
<td>最大序列长度</td>
<td>512</td>
<td><strong>1024</strong></td>
<td>2x</td>
</tr>
<tr>
<td>词汇量</td>
<td>40K</td>
<td><strong>50K</strong></td>
<td>1.25x</td>
</tr>
<tr>
<td>批次大小</td>
<td>64</td>
<td><strong>512</strong></td>
<td>8x</td>
</tr>
<tr>
<td>预训练数据</td>
<td>800M words</td>
<td><strong>40GB WebText</strong></td>
<td>~50x</td>
</tr>
</tbody></table>
<h3 id="2-2-web-text-sjj">2.2 WebText 数据集</h3>
<p>GPT-2 的预训练数据 <strong>WebText</strong> 是 GPT-1 的 BooksCorpus 的重大升级：</p>
<p><strong>数据收集</strong>：</p>
<ul>
<li>来源：Reddit 上获得至少 3 个 karma 的外链</li>
<li>规模：约 40GB 文本，约 <strong>100 亿</strong>个单词</li>
<li>覆盖：数百万网页，涵盖新闻、博客、论坛、百科等多种类型</li>
<li>多样性：比 BooksCorpus 的单一书籍来源丰富得多</li>
</ul>
<p><strong>数据预处理</strong>：</p>
<ol>
<li>提取网页正文(去除 HTML 标签、导航栏、广告)</li>
<li>使用 dragnet 等工具进行正文抽取</li>
<li>去重处理(MinHash 等近似去重算法)</li>
<li>过滤低质量内容</li>
</ol>
<p><strong>与后续数据集的对比</strong>：</p>
<table>
<thead>
<tr>
<th>数据集</th>
<th>规模</th>
<th>来源</th>
<th>质量</th>
</tr>
</thead>
<tbody><tr>
<td>BooksCorpus (GPT-1)</td>
<td>800M words</td>
<td>书籍</td>
<td>高</td>
</tr>
<tr>
<td>WebText (GPT-2)</td>
<td>10B words</td>
<td>Reddit 外链</td>
<td>中高</td>
</tr>
<tr>
<td>Common Crawl (GPT-3)</td>
<td>410B tokens</td>
<td>全网爬取</td>
<td>中(经过滤)</td>
</tr>
<tr>
<td>MassiveText (Gopher)</td>
<td>2.35T tokens</td>
<td>多源混合</td>
<td>高(经严格过滤)</td>
</tr>
</tbody></table>
<h3 id="2-3-layer-norm-wztz">2.3 LayerNorm 位置调整</h3>
<p>GPT-2 对 GPT-1 的架构做了一处关键修改：<strong>LayerNorm 位置调整</strong>。</p>
<p><strong>GPT-1(Pre-LN)</strong>：</p>
<pre><code>Input → LayerNorm → Attention → Add → LayerNorm → FFN → Add → Output
</code></pre>
<p><strong>GPT-2(Post-LN)</strong>：</p>
<pre><code>Input → Attention → Add → LayerNorm → FFN → Add → LayerNorm → Output
</code></pre>
<p>实际上 GPT-2 使用的是 <strong>Pre-LN</strong>(LayerNorm 在子层之前)，这与 GPT-1 不同：</p>
<table>
<thead>
<tr>
<th>变体</th>
<th>LayerNorm 位置</th>
<th>训练稳定性</th>
<th>代表模型</th>
</tr>
</thead>
<tbody><tr>
<td>Post-LN</td>
<td>子层之后</td>
<td>较差</td>
<td>原始 Transformer</td>
</tr>
<tr>
<td>Pre-LN</td>
<td>子层之前</td>
<td><strong>较好</strong></td>
<td>GPT-2, GPT-3</td>
</tr>
</tbody></table>
<p>Pre-LN 的优势：</p>
<ul>
<li>梯度传播更稳定</li>
<li>可以使用更大的学习率</li>
<li>减少训练早期的梯度消失/爆炸</li>
</ul>
<h3 id="2-4-chbkzy-bpe">2.4 词汇表扩展与 BPE</h3>
<p>GPT-2 将词汇量从 40K 扩展到 50K，使用 <strong>Byte-level BPE(Byte Pair Encoding)</strong>：</p>
<p><strong>标准 BPE vs Byte-level BPE</strong>：</p>
<table>
<thead>
<tr>
<th>特性</th>
<th>标准 BPE(GPT-1)</th>
<th>Byte-level BPE(GPT-2)</th>
</tr>
</thead>
<tbody><tr>
<td>基础单元</td>
<td>字符</td>
<td><strong>字节</strong></td>
</tr>
<tr>
<td>未知词处理</td>
<td><code>&lt;UNK&gt;</code> Token</td>
<td><strong>无未知词</strong></td>
</tr>
<tr>
<td>多语言支持</td>
<td>有限</td>
<td><strong>任意 Unicode 字符</strong></td>
</tr>
<tr>
<td>词汇表大小</td>
<td>40K</td>
<td>50K</td>
</tr>
</tbody></table>
<p>Byte-level BPE 的核心优势：</p>
<ul>
<li><strong>无未知词</strong>：任何 Unicode 字符都可以被表示</li>
<li><strong>更好的多语言支持</strong>：无需为每种语言单独设计 Tokenizer</li>
<li><strong>更高效的编码</strong>：常见子词被压缩为单个 Token</li>
</ul>
<h3 id="2-5-xljcss">2.5 训练基础设施</h3>
<p>GPT-2 的训练使用了大规模分布式系统：</p>
<ul>
<li><strong>硬件</strong>：32 块 V100 GPU(每台 8 卡，共 4 台服务器)</li>
<li><strong>并行策略</strong>：数据并行(Data Parallelism)</li>
<li><strong>训练时间</strong>：约数周</li>
<li><strong>优化器</strong>：Adam，学习率预热后余弦衰减</li>
<li><strong>精度</strong>：混合精度训练(FP16 + FP32)</li>
</ul>
<p>对比 GPT-1 的 8 块 P600，GPT-2 的算力提升了约 <strong>50-100 倍</strong>。</p>
<h2 id="s-zero-shot-nldsyyz">三、Zero-shot 能力的实验验证</h2>
<h3 id="3-1-ydlj-coqa-fg">3.1 阅读理解(CoQA 风格)</h3>
<p>GPT-2 可以在<strong>没有任何微调</strong>的情况下回答阅读理解问题：</p>
<pre><code>上下文: John 决定去商店买牛奶。他在路上遇到了 Mary。
问题: John 要去哪里？
GPT-2 生成: 商店
</code></pre>
<p>GPT-2 在 CoQA 数据集上的 Zero-shot 表现：</p>
<ul>
<li>F1 分数：约 55%(对比微调模型的 90%+)</li>
<li>虽然远低于监督学习，但证明了 Zero-shot 的可行性</li>
</ul>
<h3 id="3-2-jqfy">3.2 机器翻译</h3>
<p>GPT-2 在<strong>从未见过平行语料</strong>的情况下，可以进行简单的英法翻译：</p>
<pre><code>输入: &quot;The cat sat on the mat.&quot; = &quot;Le chat s&#39;est assis sur le tapis.&quot;
提示: &quot;The dog ran in the park.&quot; =
GPT-2 生成: &quot;Le chien a couru dans le parc.&quot;
</code></pre>
<p>在 WMT-14 英法翻译上：</p>
<ul>
<li>Zero-shot BLEU：约 5(对比监督模型的 35+)</li>
<li>效果有限，但再次验证了 Zero-shot 的潜力</li>
</ul>
<h3 id="3-3-wbzy">3.3 文本摘要</h3>
<p>GPT-2 可以进行简单的文本摘要：</p>
<pre><code>输入: 文章正文 TL;DR:
GPT-2 生成: 文章的一句话摘要
</code></pre>
<p>在 CNN/DailyMail 数据集上：</p>
<ul>
<li>Zero-shot ROUGE-2：约 15(对比监督模型的 35+)</li>
<li>通过&quot;TL;DR:&quot;提示触发摘要生成</li>
</ul>
<h3 id="3-4-wdxt">3.4 问答系统</h3>
<p>GPT-2 在 Natural Questions 数据集上的表现：</p>
<ul>
<li>Zero-shot 准确率：约 4%(对比监督模型的 30%+)</li>
<li>提示格式：&quot;Question: ... Answer: ...&quot;</li>
</ul>
<h3 id="3-5-nlyxdlhfx">3.5 能力涌现的量化分析</h3>
<p>GPT-2 的不同规模版本在 Zero-shot 任务上的表现：</p>
<table>
<thead>
<tr>
<th>模型规模</th>
<th>参数量</th>
<th>CoQA F1</th>
<th>翻译 BLEU</th>
<th>摘要 ROUGE-2</th>
</tr>
</thead>
<tbody><tr>
<td>Small</td>
<td>124M</td>
<td>45%</td>
<td>2</td>
<td>10</td>
</tr>
<tr>
<td>Medium</td>
<td>355M</td>
<td>49%</td>
<td>3</td>
<td>12</td>
</tr>
<tr>
<td>Large</td>
<td>774M</td>
<td>52%</td>
<td>4</td>
<td>13</td>
</tr>
<tr>
<td><strong>XL</strong></td>
<td><strong>1.5B</strong></td>
<td><strong>55%</strong></td>
<td><strong>5</strong></td>
<td><strong>15</strong></td>
</tr>
</tbody></table>
<p><strong>关键发现</strong>：随着模型规模增加，Zero-shot 能力<strong>单调提升</strong>。这暗示了更大规模模型可能带来更强的 Zero-shot 能力——这一假设在 GPT-3 中得到了验证。</p>
<h2 id="s-wbscdzlyfx">四、文本生成的质量与风险</h2>
<h3 id="4-1-sczldtp">4.1 生成质量的突破</h3>
<p>GPT-2 的文本生成质量相比 GPT-1 有了质的飞跃：</p>
<p><strong>GPT-1 生成</strong>(提示：&quot;The cat&quot;)：</p>
<pre><code>The cat sat on the mat. It was a nice day. The cat looked out the window.
</code></pre>
<p><strong>GPT-2 生成</strong>(提示：&quot;The cat&quot;)：</p>
<pre><code>The cat sat on the mat and looked out the window. Outside, the sun was 
setting over the city skyline, casting long shadows across the room. 
The cat&#39;s tail twitched as a bird landed on the windowsill, chirping 
softly before flying away into the evening sky.
</code></pre>
<p>GPT-2 的生成文本具有：</p>
<ul>
<li><strong>更长的连贯性</strong>：可以维持数百词的连贯段落</li>
<li><strong>更丰富的细节</strong>：自动添加环境描写和情感色彩</li>
<li><strong>更自然的风格</strong>：接近人类写作水平</li>
</ul>
<h3 id="4-2-jxwscsl">4.2 假新闻生成示例</h3>
<p>OpenAI 展示了一个令人担忧的示例：</p>
<pre><code>提示: &quot;In a shocking finding, scientist discovered a herd of unicorns 
living in a remote, previously unexplored valley, in the Andes Mountains. 
Even more surprising to the researchers was the fact that the unicorns 
spoke perfect English.&quot;

GPT-2 续写: &quot;The scientist named the population, after their distinctive 
horn, Ovid&#39;s Unicorn. These four-horned, silver-white unicorns were 
previously unknown to science. Now, after almost two centuries, the 
mystery of what sparked this odd phenomenon is finally solved.&quot;
</code></pre>
<p>这个虚构的&quot;独角兽新闻&quot;展示了 GPT-2 生成<strong>看似真实但完全虚假</strong>内容的能力。</p>
<h3 id="4-3-fxhjcs">4.3 风险缓解措施</h3>
<p>OpenAI 采取的风险缓解措施：</p>
<ol>
<li><strong>分阶段发布</strong>：逐步释放模型，给社会适应时间</li>
<li><strong>检测工具开发</strong>：研究自动检测 AI 生成文本的方法</li>
<li><strong>政策研究</strong>：与政策制定者讨论 AI 安全的治理框架</li>
<li><strong>社区教育</strong>：提高公众对 AI 生成内容的辨识能力</li>
</ol>
<p>这些措施为后续 GPT-3、GPT-4 的安全发布奠定了基础。</p>
<h2 id="w-y-gpt-1-djsdb">五、与 GPT-1 的技术对比</h2>
<h3 id="5-1-jgyj">5.1 架构演进</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>GPT-1</th>
<th>GPT-2</th>
<th>演进</th>
</tr>
</thead>
<tbody><tr>
<td>核心架构</td>
<td>Decoder-only Transformer</td>
<td><strong>相同</strong></td>
<td>保持一致</td>
</tr>
<tr>
<td>LayerNorm</td>
<td>Post-LN</td>
<td><strong>Pre-LN</strong></td>
<td>训练更稳定</td>
</tr>
<tr>
<td>词汇表</td>
<td>40K (char BPE)</td>
<td><strong>50K (byte BPE)</strong></td>
<td>无未知词</td>
</tr>
<tr>
<td>初始化</td>
<td>标准</td>
<td><strong>改进的初始化</strong></td>
<td>更稳定</td>
</tr>
<tr>
<td>残差连接</td>
<td>标准</td>
<td><strong>缩放因子 1/√N</strong></td>
<td>深层训练更稳定</td>
</tr>
</tbody></table>
<h3 id="5-2-xlfsyj">5.2 训练范式演进</h3>
<table>
<thead>
<tr>
<th>范式</th>
<th>GPT-1</th>
<th>GPT-2</th>
<th>演进</th>
</tr>
</thead>
<tbody><tr>
<td>预训练</td>
<td>BooksCorpus</td>
<td><strong>WebText</strong></td>
<td>数据更多样</td>
</tr>
<tr>
<td>微调</td>
<td>必需</td>
<td><strong>可选</strong></td>
<td>Zero-shot 可行</td>
</tr>
<tr>
<td>提示工程</td>
<td>简单拼接</td>
<td><strong>自然语言提示</strong></td>
<td>更灵活</td>
</tr>
<tr>
<td>任务数量</td>
<td>单一任务微调</td>
<td><strong>多任务 Zero-shot</strong></td>
<td>质的飞跃</td>
</tr>
</tbody></table>
<h2 id="l-jxxylsdw">六、局限性与历史定位</h2>
<h3 id="6-1-yzjx">6.1 已知局限</h3>
<ol>
<li><strong>Zero-shot 能力仍弱</strong>：虽然涌现了 Zero-shot 能力，但与监督学习仍有巨大差距</li>
<li><strong>长程依赖</strong>：1024 的最大长度限制了长文档理解</li>
<li><strong>事实准确性</strong>：生成的内容经常包含事实错误</li>
<li><strong>偏见问题</strong>：WebText 中的社会偏见被模型学习并放大</li>
<li><strong>计算成本</strong>：1.5B 参数的模型在当时已属庞然大物</li>
</ol>
<h3 id="6-2-lsdw">6.2 历史定位</h3>
<p>GPT-2 在大模型发展史上具有承前启后的关键地位：</p>
<p><strong>承前</strong>：</p>
<ul>
<li>验证了 GPT-1 的预训练范式的可扩展性</li>
<li>证明了 Decoder-only 架构可以扩展到更大规模</li>
</ul>
<p><strong>启后</strong>：</p>
<ul>
<li><strong>Zero-shot 的发现</strong>直接启发了 GPT-3 的 In-Context Learning 研究</li>
<li><strong>规模扩展</strong>的实践为 GPT-3 的 175B 参数提供了工程经验</li>
<li><strong>数据多样性</strong>的重要性为后续模型的数据工程提供了方向</li>
</ul>
<h3 id="6-3-dhydsyyx">6.3 对行业的深远影响</h3>
<p>GPT-2 的发布引发了三个深远影响：</p>
<ol>
<li><p><strong>Scaling Law 的研究</strong>：GPT-2 的实验数据表明，模型能力随规模单调提升，这启发了后续的 Scaling Law 研究(Kaplan et al., 2020)</p>
</li>
<li><p><strong>AI 安全讨论的升温</strong>：GPT-2 的&quot;假新闻&quot;能力使 AI 安全从学术讨论变为公共议题</p>
</li>
<li><p><strong>预训练模型的民主化</strong>：虽然 OpenAI 谨慎发布，但 GPT-2 的架构和训练方法被开源社区广泛复制(如 RoBERTa、XLNet 等)</p>
</li>
</ol>
<h2 id="q-zj">七、总结</h2>
<p>GPT-2 是大模型发展史上的<strong>关键转折点</strong>。它不仅是 GPT-1 的简单放大，更重要的是揭示了<strong>规模扩展带来的涌现效应</strong>——当模型足够大、数据足够多时，预训练模型可以在没有任何微调的情况下处理新任务。</p>
<p>核心贡献：</p>
<ol>
<li><strong>Zero-shot 能力的发现</strong>：证明了大规模语言模型具有隐式多任务学习能力，无需微调即可处理新任务</li>
<li><strong>规模扩展的实践</strong>：从 117M 到 1.5B 的成功扩展，为后续 GPT-3 的 175B 提供了工程蓝图</li>
<li><strong>WebText 数据集</strong>：展示了多样化网页数据在预训练中的价值</li>
<li><strong>AI 安全的先声</strong>：通过谨慎发布策略，开启了大型 AI 模型的安全治理讨论</li>
</ol>
<p>GPT-2 的论文标题《Language Models are Unsupervised Multitask Learners》精准概括了其核心发现——<strong>语言模型本身就是无监督的多任务学习器</strong>。这一发现为 GPT-3 的 In-Context Learning 和当今大模型的通用能力奠定了理论基础。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbjyhxfx","text":"一、发布背景与核心发现"},{"level":3,"id":"1-1-quot-twx-quot-dmx","text":"1.1 &quot;太危险&quot;的模型"},{"level":3,"id":"1-2-hxfx-zero-shot-yx","text":"1.2 核心发现：Zero-shot 涌现"},{"level":2,"id":"e-gmkzdgcsj","text":"二、规模扩展的工程实践"},{"level":3,"id":"2-1-c-117m-d-1-5b-13-bdkz","text":"2.1 从 117M 到 1.5B：13 倍的扩展"},{"level":3,"id":"2-2-web-text-sjj","text":"2.2 WebText 数据集"},{"level":3,"id":"2-3-layer-norm-wztz","text":"2.3 LayerNorm 位置调整"},{"level":3,"id":"2-4-chbkzy-bpe","text":"2.4 词汇表扩展与 BPE"},{"level":3,"id":"2-5-xljcss","text":"2.5 训练基础设施"},{"level":2,"id":"s-zero-shot-nldsyyz","text":"三、Zero-shot 能力的实验验证"},{"level":3,"id":"3-1-ydlj-coqa-fg","text":"3.1 阅读理解(CoQA 风格)"},{"level":3,"id":"3-2-jqfy","text":"3.2 机器翻译"},{"level":3,"id":"3-3-wbzy","text":"3.3 文本摘要"},{"level":3,"id":"3-4-wdxt","text":"3.4 问答系统"},{"level":3,"id":"3-5-nlyxdlhfx","text":"3.5 能力涌现的量化分析"},{"level":2,"id":"s-wbscdzlyfx","text":"四、文本生成的质量与风险"},{"level":3,"id":"4-1-sczldtp","text":"4.1 生成质量的突破"},{"level":3,"id":"4-2-jxwscsl","text":"4.2 假新闻生成示例"},{"level":3,"id":"4-3-fxhjcs","text":"4.3 风险缓解措施"},{"level":2,"id":"w-y-gpt-1-djsdb","text":"五、与 GPT-1 的技术对比"},{"level":3,"id":"5-1-jgyj","text":"5.1 架构演进"},{"level":3,"id":"5-2-xlfsyj","text":"5.2 训练范式演进"},{"level":2,"id":"l-jxxylsdw","text":"六、局限性与历史定位"},{"level":3,"id":"6-1-yzjx","text":"6.1 已知局限"},{"level":3,"id":"6-2-lsdw","text":"6.2 历史定位"},{"level":3,"id":"6-3-dhydsyyx","text":"6.3 对行业的深远影响"},{"level":2,"id":"q-zj","text":"七、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.12-openai/02-gpt-2/05-02-gpt-2-hxjszt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.12-openai/02-gpt-2/05-02-gpt-2-hxjszt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">02-GPT-2 核心技术专题：规模扩展的涌现效应与 Zero-shot 能力的发现</h1>
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
