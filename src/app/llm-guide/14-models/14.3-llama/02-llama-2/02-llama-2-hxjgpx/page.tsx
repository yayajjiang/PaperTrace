"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Llama-2 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong></p>
</blockquote>
<p>本文档针对 Llama-2 的核心架构设计进行深度剖析，重点覆盖 Tokenizer 原理、分组查询注意力(Grouped-Query Attention, GQA)、均方根归一化(RMSNorm)、以及用于对齐的强化学习人类反馈(RLHF)接口设计等关键技术点。Llama-2 在 Llama-1 的基础上进行了多项改进，以适应更长上下文和更高的推理效率。</p>
<hr>
<h2 id="1-sjdjyhxjgdc">1. 设计动机与核心架构洞察</h2>
<p>Llama-2 的整体架构主要沿用了主流的仅解码器(Decoder-only)Transformer 结构，但 Meta 团队在此基础上做出了几项至关重要的微调，从而在不显著增加参数量的前提下，大幅提升了模型的性能、上下文窗口(从 2048 翻倍至 4096)以及推理吞吐量。</p>
<p>核心设计洞察包括：</p>
<ul>
<li><strong>推理内存瓶颈</strong>：随着序列长度和模型尺寸的增加，自回归解码时的 KV Cache 成为最大的显存与内存带宽瓶颈。传统的 Multi-Head Attention (MHA) 在推理阶段面临严重的 memory-bound 问题。</li>
<li><strong>归一化开销</strong>：传统 LayerNorm 需要计算均值，这一操作不仅带来了额外的计算开销，也需要在硬件层面进行更多的状态同步。</li>
<li><strong>对齐与多轮对话控制</strong>：为了打造安全且实用的 Llama-2-Chat，必须设计一套鲁棒的系统级 Prompt 接口，并引入 Ghost Attention (GAtt) 机制以解决多轮对话中模型&quot;遗忘&quot;初始设定的问题。</li>
</ul>
<pre><code class="language-mermaid">graph TD
    A[Llama-2 Input Token] --&gt; B(Embedding Layer)
    B --&gt; C(Pre-RMSNorm)
    C --&gt; D{Transformer Block x N}
    
    subgraph Transformer Block
        D1[GQA - Grouped-Query Attention]
        D2[RoPE - Rotary Position Embedding]
        D3[SwiGLU FFN]
        D4[Pre-RMSNorm]
        
        D4 --&gt; D1
        D1 --&gt; D2
        D2 --&gt; ADD1((+))
        ADD1 --&gt; D4_2[Pre-RMSNorm]
        D4_2 --&gt; D3
        D3 --&gt; ADD2((+))
    end
    
    D --&gt; E(Final RMSNorm)
    E --&gt; F[LM Head]
    F --&gt; G(Output Probabilities)
</code></pre>
<hr>
<h2 id="2-tokenizer-jzsdjx">2. Tokenizer 机制深度解析</h2>
<p>Llama-2 延用了基于字节对编码(Byte-Pair Encoding, BPE)的 SentencePiece 分词器。分词器的质量直接决定了模型对未见词汇(OOV)、多语言代码、数字和特殊字符的泛化能力。</p>
<h3 id="2-1-bpe-yfccl">2.1 BPE 与分词策略</h3>
<p>BPE 的核心思想是从字符级(或字节级)开始，迭代合并语料库中出现频率最高的相邻符号对，直到达到预设的词表大小(Llama-2 词表大小为 32,000)。相较于 WordPiece，BPE 在合并时不考虑生成概率，只关注频率。</p>
<p>Llama-2 分词器的几个关键特性：</p>
<ol>
<li><strong>Fallback to Bytes</strong>：当遇到未在词表中的罕见字符或特殊符号时，模型不会将其转换为单一的 <code>&lt;UNK&gt;</code> token，而是将其拆解为 UTF-8 的底层字节。这使得模型理论上能够处理任何语言，即便该语言在预训练语料中占比极小。</li>
<li><strong>数字拆解(Split Digits)</strong>：所有的数字通常会被拆分成单个数字(例如 <code>2023</code> -&gt; <code>2</code>, <code>0</code>, <code>2</code>, <code>3</code>)。这对于数学计算和推理至关重要，防止了诸如 <code>123</code> 和 <code>12</code> 被映射到毫无关联的嵌入向量。</li>
<li><strong>前缀空格保留</strong>：SentencePiece 会将前缀空格视为特殊的下划线符号 <code>_</code> (U+2581)。</li>
</ol>
<h3 id="2-2-tokenizer-dmtj">2.2 Tokenizer 代码探究</h3>
<p>在使用 HuggingFace 的 <code>transformers</code> 库加载 Llama-2 Tokenizer 时，我们可以看到其特殊 token 的定义：</p>
<pre><code class="language-python">from transformers import LlamaTokenizer

tokenizer = LlamaTokenizer.from_pretrained(&quot;meta-llama/Llama-2-7b-hf&quot;)
print(f&quot;Vocab size: {tokenizer.vocab_size}&quot;) # 32000
print(f&quot;BOS Token: {tokenizer.bos_token} (ID: {tokenizer.bos_token_id})&quot;) # &lt;s&gt;
print(f&quot;EOS Token: {tokenizer.eos_token} (ID: {tokenizer.eos_token_id})&quot;) # &lt;/s&gt;
print(f&quot;UNK Token: {tokenizer.unk_token} (ID: {tokenizer.unk_token_id})&quot;) # &lt;unk&gt;
</code></pre>
<hr>
<h2 id="3-gqa-grouped-query-attention">3. GQA: Grouped-Query Attention</h2>
<p>GQA(分组查询注意力)是 Llama-2(特别是 34B 和 70B 模型)中最为重要的架构升级之一。为了加速推理并减少显存占用，GQA 在标准的多头注意力(MHA)和多查询注意力(MQA)之间取得了完美的平衡。</p>
<h3 id="3-1-djytd">3.1 动机与痛点</h3>
<p>在自回归解码(Generation)阶段，每生成一个新 token，模型都需要访问之前所有 token 的 Key (K) 和 Value (V)。为了避免重复计算，这部分数据会被缓存下来，即 <strong>KV Cache</strong>。</p>
<ul>
<li><strong>MHA 瓶颈</strong>：在 MHA 中，如果模型有 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>H</mi></mrow><annotation encoding="application/x-tex">H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span> 个 Query 头，也会有 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>H</mi></mrow><annotation encoding="application/x-tex">H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span> 个 Key 头和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>H</mi></mrow><annotation encoding="application/x-tex">H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span> 个 Value 头。对于大模型(长上下文)，KV Cache 的大小会以 GB 为单位增长，导致严重的内存带宽受限(Memory Bandwidth Bound)。</li>
<li><strong>MQA 缺陷</strong>：MQA 让所有 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>H</mi></mrow><annotation encoding="application/x-tex">H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span> 个 Query 头共享<strong>1个</strong> Key 头和 1个 Value 头。虽然极大地缩小了 KV Cache，但牺牲了模型的表达能力和性能，导致质量下降。</li>
</ul>
<h3 id="3-2-gqa-yltd">3.2 GQA 原理推导</h3>
<p>GQA 将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>H</mi></mrow><annotation encoding="application/x-tex">H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span> 个 Query 头划分为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi></mrow><annotation encoding="application/x-tex">G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span></span></span></span> 个组，每组共享 1 个 Key 头和 1 个 Value 头。
设注意力头数为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>H</mi></mrow><annotation encoding="application/x-tex">H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span>，组数为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi></mrow><annotation encoding="application/x-tex">G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span></span></span></span>，则每组包含 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mi>H</mi><mi>G</mi></mfrac></mrow><annotation encoding="application/x-tex">\\frac{H}{G}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2173em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8723em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span> 个 Query 头。</p>
<p>在数学上，注意力计算如下(忽略缩放因子)：</p>
<p>对于第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi></mrow><annotation encoding="application/x-tex">g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span> 组(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>≤</mo><mi>g</mi><mo>≤</mo><mi>G</mi></mrow><annotation encoding="application/x-tex">1 \\le g \\le G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7804em;vertical-align:-0.136em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8304em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span></span></span></span>)中的第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi></mrow><annotation encoding="application/x-tex">h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span></span></span></span> 个 Query 头(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>≤</mo><mi>h</mi><mo>≤</mo><mfrac><mi>H</mi><mi>G</mi></mfrac></mrow><annotation encoding="application/x-tex">1 \\le h \\le \\frac{H}{G}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7804em;vertical-align:-0.136em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8304em;vertical-align:-0.136em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2173em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8723em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span>)：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>Q</mi><mrow><mi>g</mi><mo separator="true">,</mo><mi>h</mi></mrow></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>L</mi><mo>×</mo><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">Q_{g, h} \\in \\mathbb{R}^{L \\times d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8991em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">L</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span></span>
<p>整个第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi></mrow><annotation encoding="application/x-tex">g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span> 组共享一对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>K</mi><mi>g</mi></msub><mo separator="true">,</mo><msub><mi>V</mi><mi>g</mi></msub></mrow><annotation encoding="application/x-tex">K_g, V_g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>K</mi><mi>g</mi></msub><mo separator="true">,</mo><msub><mi>V</mi><mi>g</mi></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>L</mi><mo>×</mo><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">K_g, V_g \\in \\mathbb{R}^{L \\times d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8991em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">L</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span></span><p>注意力输出 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>O</mi><mrow><mi>g</mi><mo separator="true">,</mo><mi>h</mi></mrow></msub></mrow><annotation encoding="application/x-tex">O_{g, h}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 的计算公式为：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><msub><mi>Q</mi><mrow><mi>g</mi><mo separator="true">,</mo><mi>h</mi></mrow></msub><mo separator="true">,</mo><msub><mi>K</mi><mi>g</mi></msub><mo separator="true">,</mo><msub><mi>V</mi><mi>g</mi></msub><mo stretchy="false">)</mo><mo>=</mo><mtext>Softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>Q</mi><mrow><mi>g</mi><mo separator="true">,</mo><mi>h</mi></mrow></msub><msubsup><mi>K</mi><mi>g</mi><mi>T</mi></msubsup></mrow><msqrt><mi>d</mi></msqrt></mfrac><mo fence="true">)</mo></mrow><msub><mi>V</mi><mi>g</mi></msub></mrow><annotation encoding="application/x-tex">\\text{Attention}(Q_{g,h}, K_g, V_g) = \\text{Softmax}\\left(\\frac{Q_{g,h} K_g^T}{\\sqrt{d}}\\right) V_g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="mord text"><span class="mord">Softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6144em;"><span style="top:-2.1778em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9322em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">d</span></span></span><span style="top:-2.8922em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1078em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7731em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.453em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><ul>
<li>当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi><mo>=</mo><mi>H</mi></mrow><annotation encoding="application/x-tex">G = H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span> 时，GQA 等价于 MHA。</li>
<li>当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi><mo>=</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">G = 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 时，GQA 等价于 MQA。</li>
<li>Llama-2 的超大杯通常选择 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi><mo>=</mo><mn>8</mn></mrow><annotation encoding="application/x-tex">G=8</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">8</span></span></span></span>(即 8 个 KV 头)，以不到 MHA 1/8 的显存开销，达到了极度接近 MHA 的性能。</li>
</ul>
<h3 id="3-3-jgdbtj">3.3 架构对比图解</h3>
<pre><code class="language-mermaid">flowchart TD
    subgraph MHA [Multi-Head Attention]
        Q1_mha[Q1] --&gt; Attention1
        K1_mha[K1] --&gt; Attention1
        V1_mha[V1] --&gt; Attention1
        
        Q2_mha[Q2] --&gt; Attention2
        K2_mha[K2] --&gt; Attention2
        V2_mha[V2] --&gt; Attention2
    end
    
    subgraph MQA [Multi-Query Attention]
        Q1_mqa[Q1] --&gt; Attention1_mqa
        Q2_mqa[Q2] --&gt; Attention2_mqa
        K_mqa[K_shared] --&gt; Attention1_mqa
        K_mqa --&gt; Attention2_mqa
        V_mqa[V_shared] --&gt; Attention1_mqa
        V_mqa --&gt; Attention2_mqa
    end

    subgraph GQA [Grouped-Query Attention]
        Q1_gqa[Q1] --&gt; Attention1_gqa
        Q2_gqa[Q2] --&gt; Attention2_gqa
        K1_gqa[K_group1] --&gt; Attention1_gqa
        K1_gqa --&gt; Attention2_gqa
        V1_gqa[V_group1] --&gt; Attention1_gqa
        V1_gqa --&gt; Attention2_gqa
        
        Q3_gqa[Q3] --&gt; Attention3_gqa
        Q4_gqa[Q4] --&gt; Attention4_gqa
        K2_gqa[K_group2] --&gt; Attention3_gqa
        K2_gqa --&gt; Attention4_gqa
        V2_gqa[V_group2] --&gt; Attention3_gqa
        V2_gqa --&gt; Attention4_gqa
    end
</code></pre>
<h3 id="3-4-gqa-d-py-torch-wdmsx">3.4 GQA 的 PyTorch 伪代码实现</h3>
<pre><code class="language-python">import torch
import torch.nn as nn

class GroupedQueryAttention(nn.Module):
    def __init__(self, d_model, num_heads, num_kv_groups):
        super().__init__()
        self.num_heads = num_heads
        self.num_kv_groups = num_kv_groups
        self.head_dim = d_model // num_heads
        
        self.q_proj = nn.Linear(d_model, num_heads * self.head_dim)
        # K 和 V 的投影维度由 num_kv_groups 决定，而非 num_heads
        self.k_proj = nn.Linear(d_model, num_kv_groups * self.head_dim)
        self.v_proj = nn.Linear(d_model, num_kv_groups * self.head_dim)
        self.o_proj = nn.Linear(num_heads * self.head_dim, d_model)

    def forward(self, x):
        B, L, D = x.shape
        
        # [B, L, num_heads, head_dim]
        q = self.q_proj(x).view(B, L, self.num_heads, self.head_dim)
        # [B, L, num_kv_groups, head_dim]
        k = self.k_proj(x).view(B, L, self.num_kv_groups, self.head_dim)
        v = self.v_proj(x).view(B, L, self.num_kv_groups, self.head_dim)
        
        # 扩展 K 和 V 以匹配 Query 头数
        # repeat_interleave 会将类似 [K1, K2] 变为 [K1, K1, K1..., K2, K2, K2...]
        num_repeats = self.num_heads // self.num_kv_groups
        k = torch.repeat_interleave(k, repeats=num_repeats, dim=2)
        v = torch.repeat_interleave(v, repeats=num_repeats, dim=2)
        
        # 转置以便于矩阵乘法 [B, num_heads, L, head_dim]
        q = q.transpose(1, 2)
        k = k.transpose(1, 2)
        v = v.transpose(1, 2)
        
        # 注意力计算
        scores = torch.matmul(q, k.transpose(-2, -1)) / (self.head_dim ** 0.5)
        attn = torch.softmax(scores, dim=-1)
        out = torch.matmul(attn, v)
        
        # 合并多头
        out = out.transpose(1, 2).contiguous().view(B, L, -1)
        return self.o_proj(out)
</code></pre>
<hr>
<h2 id="4-rms-norm-jfggyh">4. RMSNorm：均方根归一化</h2>
<p>为了提高训练的稳定性和计算效率，Llama-2 继续使用了 Pre-Normalization 架构，并选用了 <strong>RMSNorm</strong>(Root Mean Square Normalization)替代标准的 LayerNorm。</p>
<h3 id="4-1-layer-norm-y-rms-norm-dsxdb">4.1 LayerNorm 与 RMSNorm 的数学对比</h3>
<p>标准的 LayerNorm 会对输入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span> 计算均值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>μ</mi></mrow><annotation encoding="application/x-tex">\\mu</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">μ</span></span></span></span> 和方差 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>σ</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\sigma^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>μ</mi><mo>=</mo><mfrac><mn>1</mn><mi>d</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>d</mi></munderover><msub><mi>x</mi><mi>i</mi></msub><mo separator="true">,</mo><mspace width="1em"/><msup><mi>σ</mi><mn>2</mn></msup><mo>=</mo><mfrac><mn>1</mn><mi>d</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>d</mi></munderover><mo stretchy="false">(</mo><msub><mi>x</mi><mi>i</mi></msub><mo>−</mo><mi>μ</mi><msup><mo stretchy="false">)</mo><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\mu = \\frac{1}{d} \\sum_{i=1}^{d} x_i, \\quad \\sigma^2 = \\frac{1}{d} \\sum_{i=1}^{d} (x_i - \\mu)^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">μ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.1138em;vertical-align:-1.2777em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">d</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8641em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.1138em;vertical-align:-1.2777em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">d</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1141em;vertical-align:-0.25em;"></span><span class="mord mathnormal">μ</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8641em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span></span>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>y</mi><mo>=</mo><mi>γ</mi><mfrac><mrow><mi>x</mi><mo>−</mo><mi>μ</mi></mrow><msqrt><mrow><msup><mi>σ</mi><mn>2</mn></msup><mo>+</mo><mi>ϵ</mi></mrow></msqrt></mfrac><mo>+</mo><mi>β</mi></mrow><annotation encoding="application/x-tex">y = \\gamma \\frac{x - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}} + \\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1903em;vertical-align:-0.93em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.2603em;"><span style="top:-2.1966em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9134em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7401em;"><span style="top:-2.989em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">ϵ</span></span></span><span style="top:-2.8734em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1266em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">μ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span></span><p>而 RMSNorm 认为，<strong>均值的平移不重要，仅仅通过尺度(Scale)的缩放即可带来训练稳定性</strong>。因此，它去掉了减去均值的步骤：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>RMS</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><msqrt><mrow><mfrac><mn>1</mn><mi>d</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>d</mi></munderover><msubsup><mi>x</mi><mi>i</mi><mn>2</mn></msubsup></mrow></msqrt></mrow><annotation encoding="application/x-tex">\\text{RMS}(x) = \\sqrt{\\frac{1}{d} \\sum_{i=1}^{d} x_i^2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">RMS</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.3415em;vertical-align:-1.2777em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.0639em;"><span class="svg-align" style="top:-5.3015em;"><span class="pstrut" style="height:5.3015em;"></span><span class="mord" style="padding-left:1.056em;"><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">d</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7959em;"><span style="top:-2.4231em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.0448em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span></span></span><span style="top:-4.0239em;"><span class="pstrut" style="height:5.3015em;"></span><span class="hide-tail" style="min-width:0.742em;height:3.3815em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="3.3815em" viewBox="0 0 400000 3381" preserveAspectRatio="xMinYMin slice"><path d="M702 80H40000040
H742v3247l-4 4-4 4c-.667.7 -2 1.5-4 2.5s-4.167 1.833-6.5 2.5-5.5 1-9.5 1
h-12l-28-84c-16.667-52-96.667 -294.333-240-727l-212 -643 -85 170
c-4-3.333-8.333-7.667-13 -13l-13-13l77-155 77-156c66 199.333 139 419.667
219 661 l218 661zM702 80H400000v40H742z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span></span></span></span></span>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>y</mi><mo>=</mo><mi>γ</mi><mfrac><mi>x</mi><mrow><mtext>RMS</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>+</mo><mi>ϵ</mi></mrow></mfrac></mrow><annotation encoding="application/x-tex">y = \\gamma \\frac{x}{\\text{RMS}(x) + \\epsilon}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0436em;vertical-align:-0.936em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1076em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">RMS</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">ϵ</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span>
<p>由于无需计算均值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>μ</mi></mrow><annotation encoding="application/x-tex">\\mu</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">μ</span></span></span></span>，RMSNorm 在前向传播和反向传播中都节约了约 10% - 20% 的计算量。此外，RMSNorm 只有一个可学习参数(增益参数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>γ</mi></mrow><annotation encoding="application/x-tex">\\gamma</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span></span></span></span>)，没有偏置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span>。</p>
<h3 id="4-2-gjdsxxj">4.2 高精度实现细节</h3>
<p>由于在大模型训练中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>x</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">x^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span> 可能会产生溢出或精度损失，Llama-2 的实现要求 RMSNorm 在计算缩放因子时必须使用 <code>float32</code> 精度，即使输入数据是 <code>float16</code> 或 <code>bfloat16</code>。</p>
<pre><code class="language-python">class RMSNorm(nn.Module):
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        # 唯一的可学习增益参数 gamma
        self.weight = nn.Parameter(torch.ones(dim))

    def _norm(self, x):
        # 必须显式提升精度计算以防溢出
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps)

    def forward(self, x):
        # 1. 提升至 float32 计算 norm
        output = self._norm(x.float()).type_as(x)
        # 2. 乘以可学习参数
        return output * self.weight
</code></pre>
<hr>
<h2 id="5-rlhf-y-ghost-attention-jksj">5. RLHF 与 Ghost Attention 接口设计</h2>
<p>Llama-2 最引人注目的突破在于其 Chat 模型通过 RLHF (Reinforcement Learning from Human Feedback) 展现出的卓越对齐能力。为了处理多轮对话的上下文约束，Meta 引入了 Ghost Attention (GAtt)。</p>
<h3 id="5-1-rlhf-jlmxy-ppo">5.1 RLHF 奖励模型与 PPO</h3>
<p>Llama-2 收集了海量的人类偏好数据，并训练了两个独立的奖励模型 (Reward Model)：</p>
<ol>
<li><strong>Helpfulness RM</strong>：评估回答的有用性。</li>
<li><strong>Safety RM</strong>：评估回答的安全性(避免仇恨、暴力等)。</li>
</ol>
<p>通过两个分离的模型，可以在 PPO (Proximal Policy Optimization) 强化学习阶段，灵活调节安全性和有用性的权重，从而打破传统的&quot;安全惩罚导致模型变傻&quot;(Alignment Tax)困局。</p>
<h3 id="5-2-llama-2-chat-tscgs-prompt-format">5.2 Llama-2 Chat 提示词格式 (Prompt Format)</h3>
<p>Llama-2-Chat 有着极其严格的控制接口，特殊的控制符被用于分隔系统指令(System Prompt)和用户对话(User Input)：</p>
<pre><code class="language-text">&lt;s&gt;[INST] &lt;&lt;SYS&gt;&gt;
You are a helpful, respectful and honest assistant.
&lt;&lt;/SYS&gt;&gt;

Hi, how are you? [/INST] I am fine, thank you! &lt;/s&gt;&lt;s&gt;[INST] Can you write a poem? [/INST]
</code></pre>
<ul>
<li><code>&lt;s&gt;</code>: BOS token，表示对话开始。</li>
<li><code>[INST]</code> 与 <code>[/INST]</code>：包裹用户的话语与指令。</li>
<li><code>&lt;&lt;SYS&gt;&gt;</code> 与 <code>&lt;&lt;/SYS&gt;&gt;</code>：包裹核心系统提示词(System Prompt)。</li>
</ul>
<p>如果模型在推理时没有严格按照该格式注入输入，性能将会呈现断崖式下跌。</p>
<h3 id="5-3-ghost-attention-gatt-jz">5.3 Ghost Attention (GAtt) 机制</h3>
<p>在长对话中，模型经常会&quot;遗忘&quot;最初设置的 System Prompt(例如：&quot;你必须全程用法语回答&quot;)。以往的做法是在每轮对话前面都加上这段系统指令，但这会导致冗余并耗尽上下文。</p>
<p><strong>GAtt 训练方法：</strong></p>
<ol>
<li><strong>指令拼凑(Context Injection)</strong>：在 SFT(监督微调)阶段，对于长对话，Meta 通过编程手段，人为地在每一轮 user 语句后拼接上 System Prompt。</li>
<li><strong>Ghosting</strong>：但是在计算损失函数(Loss)时，不仅不计算 User prompt 的 loss(常规做法)，还要把那些后期手动拼接的 System Prompt 对应的 token 标记为 Loss 屏蔽(Masking them out)，使模型隐式地在注意力分布中将系统约束泛化到后面的轮数，如同&quot;幽灵&quot;一般存在于注意力权重中。</li>
</ol>
<p>通过 GAtt，Llama-2-Chat 可以在多轮对话后依然牢记角色的语气和指令约束。</p>
<hr>
<h2 id="6-ytljsdzhdb">6. 与同类技术的综合对比</h2>
<table>
<thead>
<tr>
<th align="left">架构特性</th>
<th align="left">Llama-2 7B / 13B</th>
<th align="left">Llama-2 70B</th>
<th align="left">Llama 1 (全系列)</th>
<th align="left">ChatGPT / GPT-4 (推测)</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>位置编码</strong></td>
<td align="left">RoPE</td>
<td align="left">RoPE</td>
<td align="left">RoPE</td>
<td align="left">可能为 RoPE 或 ALiBi</td>
</tr>
<tr>
<td align="left"><strong>注意力架构</strong></td>
<td align="left">MHA</td>
<td align="left"><strong>GQA</strong> (Group=8)</td>
<td align="left">MHA</td>
<td align="left">MQA / GQA 混合</td>
</tr>
<tr>
<td align="left"><strong>归一化</strong></td>
<td align="left">RMSNorm</td>
<td align="left">RMSNorm</td>
<td align="left">RMSNorm</td>
<td align="left">LayerNorm / RMSNorm</td>
</tr>
<tr>
<td align="left"><strong>激活函数</strong></td>
<td align="left">SwiGLU</td>
<td align="left">SwiGLU</td>
<td align="left">SwiGLU</td>
<td align="left">GeGLU / SwiGLU</td>
</tr>
<tr>
<td align="left"><strong>上下文窗口</strong></td>
<td align="left">4096</td>
<td align="left">4096</td>
<td align="left">2048</td>
<td align="left">8K - 128K</td>
</tr>
<tr>
<td align="left"><strong>对齐策略</strong></td>
<td align="left">PPO + GAtt</td>
<td align="left">PPO + GAtt</td>
<td align="left">无</td>
<td align="left">PPO / DPO</td>
</tr>
</tbody></table>
<hr>
<h2 id="7-jxxygjkj">7. 局限性与改进空间</h2>
<p>尽管 Llama-2 是一代里程碑，但在实际工程应用中，依然暴露出了一些局限：</p>
<ol>
<li><strong>上下文依然不够长</strong>：虽然相比 Llama-1 提升至 4096，但在处理长文档分析、RAG(检索增强生成)场景下依然捉襟见肘。社区后续通过 NTK-aware RoPE Scaling 将其外推至 16K-32K。</li>
<li><strong>多语言支持薄弱</strong>：预训练语料中超过 89% 都是英文，导致 Llama-2 在中文、日文等语言上表现不佳，常常需要在下游进行二次预训练(如 Chinese-Llama 方案)。</li>
<li><strong>安全对齐过度(Over-safety)</strong>：Llama-2 的 Safety Reward Model 惩罚权重较高，导致模型容易因为过于保守而拒绝回答中性问题。</li>
</ol>
<h2 id="8-zsktbyckwx">8. 知识库同步与参考文献</h2>
<ul>
<li>同步位置：<code>docs/sections/llm-guide/14.3-LLaMA/02-Llama-2/</code></li>
<li>参考来源：<a href="https://arxiv.org/abs/2307.09288">Llama 2: Open Foundation and Fine-Tuned Chat Models (Touvron et al., 2023)</a></li>
</ul>
<hr>
<p><em>编者注：在研读 Llama-2 的架构时，请特别关注 GQA 与 RoPE 结合的代码逻辑，这是当今主流开源大模型最通用的设计范式。</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdjyhxjgdc","text":"1. 设计动机与核心架构洞察"},{"level":2,"id":"2-tokenizer-jzsdjx","text":"2. Tokenizer 机制深度解析"},{"level":3,"id":"2-1-bpe-yfccl","text":"2.1 BPE 与分词策略"},{"level":3,"id":"2-2-tokenizer-dmtj","text":"2.2 Tokenizer 代码探究"},{"level":2,"id":"3-gqa-grouped-query-attention","text":"3. GQA: Grouped-Query Attention"},{"level":3,"id":"3-1-djytd","text":"3.1 动机与痛点"},{"level":3,"id":"3-2-gqa-yltd","text":"3.2 GQA 原理推导"},{"level":3,"id":"3-3-jgdbtj","text":"3.3 架构对比图解"},{"level":3,"id":"3-4-gqa-d-py-torch-wdmsx","text":"3.4 GQA 的 PyTorch 伪代码实现"},{"level":2,"id":"4-rms-norm-jfggyh","text":"4. RMSNorm：均方根归一化"},{"level":3,"id":"4-1-layer-norm-y-rms-norm-dsxdb","text":"4.1 LayerNorm 与 RMSNorm 的数学对比"},{"level":3,"id":"4-2-gjdsxxj","text":"4.2 高精度实现细节"},{"level":2,"id":"5-rlhf-y-ghost-attention-jksj","text":"5. RLHF 与 Ghost Attention 接口设计"},{"level":3,"id":"5-1-rlhf-jlmxy-ppo","text":"5.1 RLHF 奖励模型与 PPO"},{"level":3,"id":"5-2-llama-2-chat-tscgs-prompt-format","text":"5.2 Llama-2 Chat 提示词格式 (Prompt Format)"},{"level":3,"id":"5-3-ghost-attention-gatt-jz","text":"5.3 Ghost Attention (GAtt) 机制"},{"level":2,"id":"6-ytljsdzhdb","text":"6. 与同类技术的综合对比"},{"level":2,"id":"7-jxxygjkj","text":"7. 局限性与改进空间"},{"level":2,"id":"8-zsktbyckwx","text":"8. 知识库同步与参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/02-llama-2/02-llama-2-hxjgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/02-llama-2/02-llama-2-hxjgpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Llama-2 核心架构剖析</h1>
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
