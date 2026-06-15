"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>人工智能学习路线</h1>
<p>话不多说,先上路线图:</p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_0.jpg" alt=""><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_1.webp" alt=""></p>
<p>2023年的今天,无论是否科班出身的同学,人工智能都是不能绕过的热门话题. 对于不熟悉的朋友,AI好似一个黑盒,背后蕴含了智慧和潜力,正待探索.</p>
<p>但当大家有一定了解后,会发现人工智能如今已面向各行各业,其实,不需过多的基础,就可参与其中.</p>
<p>如果你对编程了解不多？不必担心. 现在的许多<strong>AI工具和框架,使得构建和训练AI模型变得简单易懂</strong>. Python以及一些丰富好用的开源库的存在降低了大家使用AI的成本.</p>
<p>对于数学背景,有则加分. <strong>数学基础绝对是成为顶尖高手的必备要素</strong>. 线性代数、微积分、概率统计等数学知识,是相关算法设计的关键依据.</p>
<p>人工智能是一个超级大的范围,包括机器学习、深度学习、自然语言处理、计算机视觉等各种领域. 机器学习让计算机从数据中学习,深度学习通过模拟人脑神经元的工作方式,让机器更聪明. 自然语言处理(NLP)则是让机器读懂人类语言,进行翻译外语、分析情感,甚至写文章和对话. 计算机视觉(CV)则是让机器“看见”世界的技术,可以识别物体、分析图像.</p>
<p>新手可以从基础开始,学习编程和数学,然后慢慢深入研究这些领域. <strong>各种</strong>在线资源和教程都将让学习变得更加简单有趣.</p>
<p>如果你想系统入门人工智能,我为大家整理了一份<strong>总计一万五千字的超详细保姆级机器/深度学习新手入门规划,带你打基础、打比赛、刷论文！</strong></p>
<p>学习路线主要分为 6 个部分: </p>
<ol>
<li>数学基础2. 编程3. 机器学习入门4. 深度学习入门5. 科研入门6. 项目与实习</li>
</ol>
<p>下面开始上干货:</p>
<h2 id="1-sxjc">1. 数学基础</h2>
<p>在深度学习算法中,涉及到最为重要的数学基本知识有四门: <strong>线性代数</strong>、<strong>微积分</strong>、<strong>概率论</strong>和<strong>数学优化</strong>.</p>
<p>前面三门也是理工科同学本科的必修课了,如果<strong>知识早已还给老师</strong>,也没关系,<strong>查漏补缺</strong>.</p>
<p>对于这部分的学习,大家千万<strong>不要试图掌握所有的相关数学知识再开始深度学习</strong>,只需要先掌握最基本的知识就可以上手了.</p>
<h3 id="1-1-xxds">1.1 <strong>线性代数</strong></h3>
<p>一般来说,神经网络是基于数学模型构建的,里面涉及到了大量的数据运算. 而<strong>线性代数</strong>则是这一过程实现的核心,矩阵乘法、向量求导等概念在深度学习中非常常见.</p>
<p>若论深度学习最基础的一门数学,<strong>线性代数</strong>当之无愧. 针对深度学习,要求大家掌握线性代数中有关<strong>矩阵运算、</strong><a href="https://www.zhihu.com/search?q=%E7%BA%BF%E6%80%A7%E6%96%B9%E7%A8%8B%E7%BB%84%E6%B1%82%E8%A7%A3&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3121957796%7D">线性方程组求解</a>** 、线性变换、矩阵分解**的相关内容.</p>
<p><strong>视频</strong>: 推荐来自<strong>3Blue1Brown的《线性代数的本质》</strong>,动画视频,通俗易懂. 线性代数研究的是线性空间的性质,数据通常会被表示为欧式空间中的点,而这些点经过一系列变换后会映射到另一个空间,在新的空间中隐藏在数据中的规律才得以显现. 这部课程以动画视频的方式让大家轻松理解线性代数的运算原理,直观且有趣,每年都拯救了一大批濒临挂科的同学. 
如何有小白觉得英文不好,那么B站有足够多具有<strong>中文字幕</strong>的视频供你学习.</p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_2.jpg" alt=""></p>
<p><strong>视频</strong>: 推荐来自MIT 教授 <strong>Gilbert Strang 的线性代数上课视频</strong>. Gilbert Strang把线性代数讲得清晰而且直观,深入线代的精髓,非常透彻,许多同学将之称之为<a href="https://zhida.zhihu.com/search?content_id=599127741&content_type=Answer&match_order=1&q=%E7%BA%BF%E6%80%A7%E4%BB%A3%E6%95%B0%E6%95%99%E7%A8%8B&zhida_source=entity">线性代数教程</a>天花板.</p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_3.jpg" alt=""></p>
<p><strong>教材: <strong><em><strong>推荐《</strong></em><a href="https://zhida.zhihu.com/search?content_id=599127741&content_type=Answer&match_order=1&q=%E7%BA%BF%E6%80%A7%E4%BB%A3%E6%95%B0%E5%8F%8A%E5%85%B6%E5%BA%94%E7%94%A8&zhida_source=entity">线性代数及其应用</a></strong> <em>》,作者是 David C. Lay . 这本书详细介绍了线性代数在几何学、计算机图形学、经济学、概率论、信号与系统、微分方程等领域的应用,使读者可以直观地理解其应用. 认真讲,我并不推荐同学们全面系统地看书复习,因为效率不高. 大家可以把资料书当作针对疑难杂症的工具.</em></strong> 
<em><strong>教材: 推荐</strong></em><a href="https://www.zhihu.com/search?q=%E5%90%B4%E5%86%9B&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3121957796%7D">吴军</a>** 的《<strong><a href="https://zhida.zhihu.com/search?content_id=599127741&content_type=Answer&match_order=1&q=%E6%95%B0%E5%AD%A6%E4%B9%8B%E7%BE%8E&zhida_source=entity">数学之美</a></strong> 》****: 深入浅出、妙趣横生面向IT类同学讲解自然语言处理与搜索方向的数学原理.*<em><strong>教材</strong>: 推荐《数学要素》</em>*: 对于线性痛点问题讲的很透彻,书中融入编程计算以及图形化展示,可以说通俗易懂. 姜博士作品,该书之前在GitHub上大火,不少朋友应该有所耳闻. ** 
<strong>教材: 推荐</strong>《矩阵力量》: 数据科学与机器学习的完美结合,本书颜值极高.</p>
<h3 id="1-2-wjf">1.2 <strong>微积分</strong></h3>
<p><strong>微积分</strong>是优化算法的基础. 深度学习模型的训练过程涉及到梯度计算和参数更新通常依赖于微积分的知识,比如反向传播算法中涉及到链式法则,需要对复合函数进行求导.</p>
<p>微积分的知识比较多,大家不需要专门进行复习,只需要把深度学习涉及到的内容复习到即可,大致内容包含<strong>导数和偏导数、梯度和链式法则</strong>.</p>
<h3 id="1-3-gsl">1.3 <strong>概率论</strong></h3>
<p><strong>概率论</strong>是数据分析和推断的基础. 对于概率论来说,深度学习中的许多任务,如分类、生成模型等,都涉及到概率分布的建模和推断.</p>
<p>大家<strong>不需要完全掌握概率论再去上手深度学习</strong>,时间紧迫的同学们可以先跳过这部分知识. 当然不是说它不重要,尤其是概率分布部分的内容,非常重要. 跳过这部分知识的同学们后续遇到相关应用的时候一定记得回来补习.</p>
<p>大家可以选择挑选一本评分不错的书来入门学习这门课程.</p>
<p><strong>教材1: 推荐陈希儒的《</strong><a href="https://zhida.zhihu.com/search?content_id=599127741&content_type=Answer&match_order=1&q=%E6%A6%82%E7%8E%87%E8%AE%BA%E4%B8%8E%E6%95%B0%E7%90%86%E7%BB%9F%E8%AE%A1&zhida_source=entity">概率论与数理统计</a>** 》**,他在书中详细地讲解了概率与统计的知识,就像是听一个老者分享自己的概率与统计心得. 相信读者们会从中获得很多收益. 
<strong>教材2</strong>: 推荐<a href="https://zhida.zhihu.com/search?content_id=599127741&content_type=Answer&match_order=1&q=%E6%9D%8E%E8%88%AA&zhida_source=entity">李航</a>的《统计学习方法》,可以多看几遍,好评颇多. 这本书对机器学习的原理解释和公式推导非常详细,目前已经发布第二版. 相信读完你会有所体会,机器学习不是玄学.</p>
<h3 id="1-4-sxyh">1.4 <strong>数学优化</strong></h3>
<p><strong>数学优化</strong>是寻找最优解的数学工具.</p>
<p>对于非数学系的很多小伙伴来说,数值分析是一门很令人头秃的课,其实这里不需要大家掌握太多,入门小白只需了解数值优化的思路和应用即可.</p>
<p>如果大家要学习这门课,强力推荐一本<strong>教材《Convex Optimization》</strong>,这本书实力级碾压多数国内教材.</p>
<h2 id="2-bc">2. 编程</h2>
<p>编程语言,最好掌握两门, <strong>Python</strong> 和 <strong>C++</strong>. 但一般来说,python就足够大家的日常使用.</p>
<h3 id="2-1-python">2.1 <strong>python</strong></h3>
<p><strong>Python</strong> 是一门非常适合初学者的编程语言,不仅易于上手,而且功能强大. 在机器学习算法开发中,Python也是主流语言之一,尤其在数据处理和实现模型方面,更是被广泛应用.</p>
<p>如果你有其他编程语言基础,那么python的学习对你来说小菜一碟,去B站二倍速观看高赞视频即可入门. 
<strong>教材</strong>: 推荐《<a href="https://zhida.zhihu.com/search?content_id=599127741&content_type=Answer&match_order=1&q=%E6%B5%81%E7%95%85%E7%9A%84Python&zhida_source=entity">流畅的Python</a>》**,搭配视频学习相信小白可以快速入门. ** 
<strong>教材: 推荐</strong>《<a href="https://www.zhihu.com/search?q=%E5%BB%96%E9%9B%AA%E5%B3%B0&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3121957796%7D">廖雪峰</a>-Python3教程》: 内容适合初学者,非常全面,通俗易懂. 描述的知识点有: Python 基础、函数、高级特性、函数式编程、模块、面向对象编程、面向对象高级编程、错误、调试和测试、IO 编程、进程和线程、正则表达式、常用内建模块、常用第三方模块、图形界面、网络编程、异步IO 等内容. 
<em>网站: <strong><strong>推荐</strong></strong>Dataquest</em>,它提供一系列与数据分析相关的Python教程,涵盖了从Python基本语法到数据分析的基本函数,再到PANDAS包的使用方法,还包括机器学习中常用的Python指令. 此外,它还提供了详细的教程,教你如何在Kaggle上进行数据分析. 这些教程非常贴心,特别适合初学者. 当然,如果想掌握高级技巧,最好是通过实战项目来积累经验.</p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_4.jpg" alt=""></p>
<p>熟练掌握 Python 编程语言对于学习和实践机器学习和深度学习来说非常重要,<strong>大家要灵活掌握pandas、</strong><a href="https://www.zhihu.com/search?q=numpy&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3121957796%7D">numpy</a>、scikit-learn等好用到飞起的库. </p>
<p>如何安装python,<a href="https://link.zhihu.com/?target=https%3A//www.continuum.io/downloads">Download Anaconda now!</a></p>
<p>为了更加丝滑地使用python进行深度学习,我们还需要掌握一种<strong>深度学习框架</strong>、一些<strong>Linux常用指令</strong>以及一个好用的<strong>IDE</strong>.</p>
<p>熟练应用一个深度学习框架可以极大方便大家的炼丹之旅,小白上手首推<strong>tensorflow</strong>或<strong>pytorch</strong>.</p>
<ol>
<li>TensorFlow: TensorFlow是由Google开发的开源深度学习框架. 它提供了一个灵活的计算图模型,支持静态图和动态图的定义方式. TensorFlow具有广泛的应用领域,并且拥有强大的生态系统和丰富的社区支持.2. PyTorch: PyTorch是由Facebook开发的开源深度学习框架. 与TensorFlow相比,PyTorch更加易于使用和调试,采用动态图模型,具有直观的API和灵活性. PyTorch在研究领域广泛应用,拥有活跃的社区和大量的<a href="https://www.zhihu.com/search?q=%E9%A2%84%E8%AE%AD%E7%BB%83%E6%A8%A1%E5%9E%8B&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3121957796%7D">预训练模型</a>.</li>
</ol>
<p>个人认为,入门阶段,<strong>pytorch</strong>更适合小白上手,更新迭代很快,并且API稳定.</p>
<p>如何学习pytorch框架？最好的方法还得是<strong>官方文档</strong>.</p>
<p>大家可以按照基本配置、张量、模型定义和操作、数据预处理、模型训练和测试的流程去了解pytorch.</p>
<p>对于阅读代码,大家一定要灵活使用chatGPT. 它可以对我们不熟悉的代码进行详细解释,对于代码片段也会试图理解并猜测其可能功能.</p>
<p>至于IDE,你永远可以相信<strong>VScode</strong>,适配性无敌. 但考虑到方便调试、洁面舒适性的问题,<a href="https://www.zhihu.com/search?q=pycharm&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3121957796%7D">pycharm</a>** 与jupyter**排行不分先后,方便好用,你的不三之选.</p>
<h3 id="2-2-c">2.2 <strong>C++</strong></h3>
<p>之所以前文提到两门编程语言,是因为有一些视觉或者语音的方向,工作或科研中,C++不可缺席. 这里大家可以结合自己的研究方向进行学习.</p>
<p>一般来说,C++的学习成本远高于python,如果你是零入门小白,可能需要花上数十周的时间才能基本学完C++的内容.</p>
<p>无论你从事算法、开发还是测试等领域,掌握面向对象的编程语言C++都对你有很大的帮助意义. 它是一门基础的编程语言,学会了C++之后,学习其他编程语言也会更加得心应手.</p>
<p>推荐经典教材《C++ Primer》,可以帮助你深入理解和掌握这门语言.<br><em><strong>推荐教材</strong></em><em>《C++20高级编程(第5版)》</em>: 本书包含面向现实世界编程的实用指导,是程序员深入研究C++的理想机会. 第5版涵盖了C++20的内容.</p>
<h3 id="2-3-sfnl">2.3 <strong>算法能力</strong></h3>
<p>无论大家日后选择工作还是科研,良好的coding能力绝对是我们最强的武器. 如果是为了找工作的小伙伴,强烈推荐大家日常leetcode刷题. <strong>数据结构与算法</strong>绝对是每一个程序员的必修课.</p>
<p>如果是为了做科研,算法能力是模型的设计与实现的基础. 空有想法,工程能力跟不上也是一种悲哀.</p>
<p>推荐教材《大话数据结构》: 本书中穿插了大量“接地气”的类比案例,可以帮助大家迅速理解抽象概念.<br><em><strong>推荐教材</strong></em><em>《算法竞赛》</em>: 这本书非常适合作为参加算法竞赛的同学们阅读.</p>
<p>好在这部分只要努力就可以实现显著性的提高,程序员万万不要说自己不行.</p>
<h3 id="2-4-rjpz-linux">2.4 <strong>软件配置: Linux</strong></h3>
<p>尽管如今Windows操作起来也很容易,但如果要做机器学习和深度学习,软件配置建议还是<strong>Linux</strong>. 它可以极大地提高工作效率,并且操作简单. 当使用Linux时,可以更容易地编写,编译,阅读和理解机器学习代码,更容易对机器学习工具进行调试,节省时间和精力.</p>
<p>其次,Linux具备很高的稳定性和安全性,它与TensorFlow,Keras,Caffe,PyTorch等工具兼容,还可以支持大量机器学习框架,支持多种机器学习任务.</p>
<p>对于构建、部署和管理大规模的机器学习管道,可以使用框架,配置环境,运行预处理任务,训练模型,保持模型,生成新数据集等,同时可以运行多个模型等任务都非常方便.</p>
<p>推荐教材《原子嵌入式Linux驱动开发详解与实战》</p>
<h3 id="2-5-yjpz-gpu">2.5 <strong>硬件配置: GPU</strong></h3>
<p>软实力已有,硬实力也不可缺. 新手小白上手第一坑“<em>Torch not complied with CUDA enabled</em>”.</p>
<p>玩转深度学习,怎么能没有显卡呢？</p>
<p>没有显卡,你只能玩转<strong>CPU 版本的深度学习</strong>. 运算实力大削,不知你会不会为感人的速度哭泣.</p>
<p>如果只是想测试算法的效果,可以试试用CPU运行,不过要注意的是,有些算法即使是进行测试,可能也需要十几分钟的时间.</p>
<p>但是,如果要进行算法的训练阶段,GPU是必选项.</p>
<p><strong>如何白嫖GPU？</strong></p>
<p><strong>阿里云天池</strong> 除了上传速度慢,没有别的缺点.</p>
<p>显卡: V100、P100、T4 等训练主流显卡,显存 16 G.</p>
<p>磁盘存储: 5 G.</p>
<p>时间限制: 每次 8 个小时.</p>
<p><strong>Kaggle</strong> Kaggle加载页面速度有些慢. 不过你可以用VPN来改善这一现象.</p>
<p>显卡: V100、P100、T4 等训练主流显卡,显存 16 G.</p>
<p>磁盘存储: 5 G.</p>
<p>时间限制: 每次 12 个小时.</p>
<p><strong>Colab</strong> 总体而言,Colab是最好的选择之一. 许多开源算法都提供了Colab的运行脚本,这样就无需配置开发环境,可以直接运行并体验算法效果. 当然,Colab也存在明显的问题,需要VPN. 只需在Google Drive上安装Colab,就可以轻松使用. 如果需要上传数据,可以将其上传到Google Drive并在Colab中挂载,这样就可以<a href="https://www.zhihu.com/search?q=%E7%9B%B4%E6%8E%A5%E8%AE%BF%E9%97%AE&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3121957796%7D">直接访问</a>了.</p>
<p>Colab支持主流训练显卡,如V100、P100和T4等,具有16GB的显存.</p>
<p>存储方面,Colab提供15GB的磁盘空间,如果不够用,还可以通过Google Drive进行扩容.</p>
<p>时间限制: 每次 12 个小时.</p>
<p><strong>如果你看到了这儿,证明你是个非常爱学习的人,如果我讲的东西对你有所帮助,希望你花一秒钟的时间帮忙点个赞,再继续慢慢读,谢谢啦~</strong></p>
<h2 id="3-jqxxrm">3. 机器学习入门</h2>
<p>一般来说,相比深度学习,机器学习的内容更多一些,部分模型原理比深度学习更加复杂,不是非常容易理解.</p>
<p>深度学习是机器学习的一个分支,因此它们之间并不是互相排斥的关系. 实际上,深度学习可以被视为机器学习中的一种特定方法,它利用多层神经网络进行学习和预测.</p>
<p>机器学习的内容比较多,简单可以分为监督学习、非监督学习与强化学习等,大家在初次学习过程中不需要面面俱到,完全掌握.</p>
<p>机器学习入门分为两部分: <strong>理论学习</strong>+<strong>实践</strong></p>
<h3 id="3-1-llxx">3.1 <strong>理论学习</strong></h3>
<p>请查收你的小白的机器学习入门套餐:</p>
<p>推荐视频课程: <strong>Andrew Ng的机器学习</strong>,适合新手和来自工业界对数学要求不是很高的同学. 
推荐视频课程: 李宏毅机器学习,用有趣的视角带你了解机器学习,适合新手,强烈推荐. 课程中,他用了一个类比的方式来解释机器学习的基本原理. 他将宝可梦的类型、属性和技能看作是输入特征,将战斗结果看作是输出结果,以此来说明机器学习中的监督学习和分类问题. 他还引入了训练集和测试集的概念,并通过宝可梦的“捕捉”过程来讲解模型的评估方法和过拟合问题. 非常适合听课无法专注的小伙伴.</p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_5.jpg" alt=""></p>
<p>书籍: 《机器学习》如果同学们的数学基础ok,热爱读书同时不怕枯燥,那么推荐这本书. 建议大家看过视频有一定基础了再来翻阅这本书.</p>
<h3 id="3-2-sj">3.2 <strong>实践</strong></h3>
<p>实践部分推荐大家适度参加竞赛. Kaggle和阿里天池竞赛是两个非常受欢迎的平台,提供了丰富的数据集和挑战任务,可以帮助你在真实问题上应用机器学习算法并与其他人进行竞争.</p>
<p>除了参加竞赛,还可以研究<a href="https://zhida.zhihu.com/search?content_id=599127741&content_type=Answer&match_order=1&q=%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE&zhida_source=entity">开源项目</a>、早早进入实验室研究等~</p>
<p>一些实践tips:</p>
<ol>
<li>学习基础知识: 在开始实践之前,建议先掌握机器学习的基本概念、算法和工具. 了解常用的机器学习算法(如线性回归、决策树、支持向量机等),学习数据预处理、特征工程和模型评估等技术.2. 数据理解和准备: 对数据进行探索性分析,了解数据的特征、分布和相关性. 清洗和预处理数据,填补缺失值、处理异常值,进行特征选择和转换等操作,以便为机器学习算法准备好合适的输入.3. 模型选择和训练: 根据问题类型和数据特点,选择适当的机器学习算法. 建立模型并使用训练数据进行参数调整和优化. 可以尝试不同的算法,并使用交叉验证等技术评估模型的性能.4. 模型评估和改进: 使用测试数据集评估模型的性能,并进行模型改进. 调整超参数、改变特征工程方法或尝试其他算法,以提高模型的准确性和泛化能力.</li>
</ol>
<h2 id="4-sdxxrm">4. 深度学习入门</h2>
<p>深度学习入门分为两部分: <strong>理论学习</strong>+<strong>实践</strong></p>
<h3 id="4-1-llxx">4.1 <strong>理论学习</strong></h3>
<p>理论学习部分,小白深度学习一个月入门的不二之选: </p>
<p>视频课: 吴恩达的《深度学习专项系列课程(Deep Learning Specialization)》/李宏毅《机器学习与深度学习》+ 书籍: Ian Goodfellow的《深度学习》.<br><strong>吴恩达的深度学习视频课</strong>,内容浅显易懂且注重实践,非常适用于初学者. 可能是因为视频看多了,每次看到Andrew Ng的头像,我都倍感亲切.</p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_6.jpg" alt=""></p>
<p>该系列课程由五门子课程组成,包括: _神经网络和深度学习: 介绍神经网络、深度学习的基本概念和应用,以及构建深度神经网络的方法. _ _改善深层神经网络: 涵盖优化算法、超参数调整、正则化和优化等技术,以提高神经网络的性能. _ *结构化机器学习项目: 教授如何构建和组织机器学习项目,并探讨数据集的特点、指标选择和验证集设计等问题. _ *<a href="https://www.zhihu.com/search?q=%E5%8D%B7%E7%A7%AF%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3121957796%7D">卷积神经网络</a>: 重点介绍卷积神经网络以及在计算机视觉任务中的应用,如图像分类和目标检测. _ _序列模型: 主要介绍递归神经网络(RNN)、长短期记忆网络(LSTM)等序列模型及其应用,如语言模型和机器翻译. _ 视频以简洁明了的方式介绍了深度学习的基本概念、原理和应用,并提供了一些实践项目和编程作业. 假如大家可以认真学习并自己动手实践,相信上手深度学习不在话下. 
李宏毅《机器学习与深度学习》视频课程涵盖了广泛的主题,包括线性回归、逻辑回归、支持向量机、神经网络、卷积神经网络、循环神经网络等. 课程内容既包括基础知识的讲解,也包括一些前沿的研究进展和应用案例. 李宏毅教授将复杂的数学和技术概念以简明易懂的方式传达给学生. 他善于通过直观的图示和具体的实例来解释抽象的概念,使得初学者更容易理解和掌握. 该视频受到很多同学好评,也非常适合小白入门.</p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_7.jpg" alt=""></p>
<p><strong>3bule1brown的神经网络讲解视频</strong>,没错,还是它. 深入浅出,看了它还怎么会有人无法理解神经网络呢？</p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_8.jpg" alt=""></p>
<p>推荐教材: <strong>Ian Goodfellow的</strong>《深度学习》*这本书涵盖了深度学习的基础概念、算法和应用,并且提供了数学和技术细节方面的深入讲解. 这使得它在理论性和技术性方面都非常全面. 然而,这也意味着对于初学者来说,可能需要更多的时间和努力来理解书中的内容. 如果你是一个完全的深度学习小白,可能会发现书中的数学推导和详细技术描述有些复杂.</p>
<ul>
<li></li>
</ul>
<p><em><strong>因此,我建议大家在阅读《深度学习》之前,先掌握一些基本的数学和机器学习知识,以便更好地理解书中的内容. 大家可以把这本书当作深度学习视频的</strong></em><em>辅助资料</em>.</p>
<p>关于深度学习的学习资料太多了,大家不要迷失其中,以上三个推荐绝对是大浪淘沙经过众多同学学习检验留下的精品,足够大家入门学习.</p>
<p><strong>细分方向: 计算机视觉(CV)</strong> </p>
<p><strong>CS231n</strong> 是顶级院校斯坦福出品的深度学习与计算机视觉方向专业课程,核心内容覆盖神经网络、CNN、图像识别、RNN、神经网络训练、注意力机制、生成模型、目标检测、图像分割等内容.</p>
<p>作为入门学习者,在看完一部分课程后,大家可以完成相应的作业. 如果需要入门和练习 Python,这个课程中也提供了非常优秀的学习资源.</p>
<p>以下是新版斯坦福CS231n课程的内容介绍 
第1部分 Lecture1-3 深度学习背景知识简单介绍 课程引入与介绍、KNN 和线性分类器、Softmax 和 SVM 两种损失函数、优化算法(SGD等). 
第2部分 Lecture4-9 卷积神经网络 CNN及各种层次结构(卷积、池化、全连接)、反向传播及计算方法、优化的训练方法(Adam、Momentum、Dropout、Batch-Normalization)、训练 CNN 的注意事项(参数初始化与调优)、深度学习框架(TensorFlow、Caffe、Pytorch)、线性CNN结构(AlexNet、VGGNet、GoogLeNet、ResNet). 
第3部分 Lecture10-16 计算机视觉应用 RNN(语言模型,image captioning等)、目标检测(R-CNN、Fast / Faster R-CNN、YOLO、SSD等)、语义分割(FCN、Unet、SegNet、deeplab等)、神经网络可视化与可解释性、生成模型与 GAN、深度强化学习.</p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_9.jpg" alt=""></p>
<p>此外,推荐<strong>教材</strong>: 《深度学习计算机视觉》: 这本书用基础的代数知识阐明视觉直觉背后的概念,数学逻辑讲述清晰.</p>
<p><strong>CV入门建议</strong></p>
<p>粗略来分,计算机视觉的五大任务分为<strong>目标检测、目标跟踪、图像分割、图像分类</strong>以及<strong>图像生成</strong>. 仔细来分的话,大大小小可以包括至少30个以上的方向.</p>
<p>一般来说,图像分类、图像分割和目标检测被认为是最基础、最底层的任务. 一旦掌握了这些任务,大家就能够更快地转移到其他方向,比如目标识别、目标跟踪和图像增强等领域.</p>
<p><strong>细分方向: 自然语言处理(NLP)</strong> </p>
<p>进入B站,搜索自然语言处理方向课程<strong>CS224n</strong>,共包含18讲的内容. 通过该课程的学习,大家应该可以掌握词向量、RNN、GRU、LSTM、Seq2Seq、CNN以及注意力机制等的相关知识. 同样的,课程附带作业,大家可以尝试完成.</p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_10.jpg" alt=""></p>
<p>其他关于NLP的学习资源:</p>
<p>Dan Jurafsky 和 Chris Manning: 自然语言处理<a href="https://link.zhihu.com/?target=https%3A//www.youtube.com/watch%3Fv%3DnfoudtpBV68%26list%3DPL6397E4B26D00A269">https://www.youtube.com/watch?v=nfoudtpBV68&amp;list=PL6397E4B26D00A269</a> 
言语和语言处理(Daniel Jurafsky和James H. Martin)<a href="https://link.zhihu.com/?target=https%3A//web.stanford.edu/~jurafsky/slp3/">https://web.stanford.edu/~jurafsky/slp3/</a> 
斯坦福CS224d: 自然语言处理的深度学习<a href="https://link.zhihu.com/?target=http%3A//cs224d.stanford.edu/syllabus.html">http://cs224d.stanford.edu/syllabus.html</a> 
Coursera: 自然语言处理简介<a href="https://link.zhihu.com/?target=https%3A//www.coursera.org/learn/natural-language-processing">https://www.coursera.org/learn/natural-language-processing</a></p>
<p>其他深度学习资料推荐:</p>
<p><strong>推荐斯坦福大学的CS229</strong> CS229由斯坦福大学的教授Andrew Ng教授主讲,涵盖了机器学习和深度学习的广泛内容,包括算法原理、模型训练和应用等方面. 课程既有理论的讲解,也有实践的演示. 
<strong>李沐的《动手深度学习》</strong>: 本书采用交互式学习的方式,不仅讲解了深度学习算法的原理,还提供了代码运行和实现的示例. 全书内容分为三个部分: 第一部分介绍了深度学习的背景,提供了必备的预备知识,并包括深度学习最基础的概念和技术. 第二部分详细描述了深度学习计算的重要组成部分,同时解释了近年来卷积神经网络和循环神经网络在多个领域取得巨大成功的原因. 第三部分探讨了评价和优化算法,同时考察了影响深度学习计算性能的重要因素,并列举了深度学习在计算机视觉和自然语言处理等领域中的重要应用案例. 
<strong>《神经网络与深度学习》</strong> 这本书详细解释了神经网络和深度学习的概念、原理和实践方法,并使用直观的图示和简单易懂的语言进行讲解. 作者从基础概念出发,逐步介绍了神经网络、反向传播算法、卷积神经网络、循环神经网络等深度学习相关的知识点. 
<strong>《PyTorch深度学习实战》</strong> 这本书提供了丰富的示例代码和实际项目,帮助读者从零开始构建深度学习模型. 涵盖了PyTorch的基础知识、数据预处理、模型构建、训练与评估等方面的内容. 书中通过具体的案例和实验,展示了如何使用PyTorch进行图像分类、目标检测、语言处理等任务. 此外,书中还涵盖了迁移学习、生成对抗网络(GANs)和强化学习等高级主题. 
<strong>《深度学习图解》</strong>: 从基础的每一行代码指导搭建深度学习网络. 
<strong>《深度学习模式与实践》</strong>: Andrew Ferlitsch著,适合需要深入了解深度学习的朋友学习. Pytorch教程: <a href="https://link.zhihu.com/?target=https%3A//github.com/pytorch/tutorials">https://github.com/pytorch/tutorials</a>** YouTube**上的两分钟读论文的系列视频,可以帮你快速了解全球深度学习的最热门进展. 以及阅读一些优秀的博客,加入深度学习社区.</p>
<h3 id="4-2-sj">4.2 <strong>实践</strong></h3>
<p>实践非常重要. 仅仅学习知识是远远不够的,更重要的是能够独立思考并实践所学.</p>
<p>尽管你可能跟随着视频或文章的思路进行学习,但这缺少了独立思考的过程. 你需要自己动手完成一个项目,包括数据处理、问题分析和选择适当的算法解决方案等等.</p>
<p>竞争激烈的算法工程师岗位需要有与众不同的竞争力. 为了脱颖而出,我们需要以个人或团队的形式独立完成一些项目. 只有这样,你才能真正具备竞争力.</p>
<p>对于学生来说,参加竞赛是最简单直接的做项目的方法之一. 通过参加竞赛,你可以锻炼自己的技能,并将所学应用到实际项目中.</p>
<p><strong>kaggle</strong>和阿里天池竞赛的学习赛对于小白入门学习数据分析、计算机视觉和自然语言处理等领域是一个很好的选择. </p>
<p>Kaggle: <a href="https://link.zhihu.com/?target=https%3A//www.kaggle.com/">https://www.kaggle.com/</a></p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_11.jpg" alt=""></p>
<p>阿里天池: <a href="https://link.zhihu.com/?target=https%3A//tianchi.aliyun.com/competition/gameList/activeList">https://tianchi.aliyun.com/competition/gameList/activeList</a></p>
<p><img src="/llm-guide/1-intro/1.1-roadmap/ai-learning-route/ai-learning-route/images/image_12.jpg" alt=""></p>
<p>例如,在天池竞赛的学习赛中,大家可以选择参与各种不同主题的竞赛项目. 这些竞赛项目通常提供了一些基本的数据集和问题,同时也会给出一些baseline代码作为参考,帮助大家开始入门学习.</p>
<p>对于初学者来说,竞赛项目提供了真实的数据和实际问题,能够将学到的知识直接应用到实践中.</p>
<p>在竞赛中,可以找到大量的学习资源,包括baseline代码、经验分享、论坛讨论等. 这些资源可以帮助大家理解问题的解决方法和技巧.</p>
<p>参与竞赛需要进行数据预处理、特征工程、算法实现等任务,可以锻炼编程和问题解决能力.</p>
<p>然而,需要注意的是,虽然天池竞赛的学习赛提供了baseline代码作为参考,但这并不意味着直接复制代码就能得到好的结果. 对于小白来说,更重要的是理解代码背后的原理和思想,并根据自己的理解进行修改和优化.</p>
<p>看完以上内容,如果你对DL基础学习还有疑问,欢迎私信我. </p>
<h2 id="5-kyrm">5. 科研入门</h2>
<p>说起科研,是一个很沉重的话题. 有的同学本科期间即被探测出灵根,爆发出无穷的潜力,顶会N篇起. 也有的同学研究生即将毕业,面临小论文难产,苦不堪言,终日郁郁寡欢,不知毕业为何物.</p>
<p>无论大家处于何种目的,入了这个门,都是研究生,都要“热爱科研”.</p>
<p><strong>1)确定研究方向</strong></p>
<p>当大家有了一定的数学与深度学习基础之后,科研小白们可以广泛了解各种基于深度学习的方向,从中发现自己的兴趣所在.</p>
<p>深度学习有很多细分方向,如自然语言处理(Natural Language Processing, NLP)、计算机视觉(Computer Vision)、强化学习、推荐系统、语音等. 如果深度学习安全也算的话,范围更宽一步.</p>
<p>确定方向不是一个简单的问题,有的同学以粗暴地掷骰子的方式选择了自己的的方向,有的同学依靠导师颜值间接决定了自己未来的三年的研究对象,也有的同学先入为主,了解了一个方向,好,那就它了.</p>
<p>以上种种听天由命行为,不予苟同！最近几年尤其流行一句话“<strong>选择大于努力</strong>”. 看起来平平无奇,实为精髓无比.</p>
<p>确定研究方向有三个要素: <strong>兴趣</strong>+<strong>就业难度</strong>+<strong>写论文难度</strong>.</p>
<p>如果你了解了一个方向,无比痴迷,已经做好决定,未来就是它了. 那么流程到此结束,未来只需努力.</p>
<p>如果你对每个方向都感到懵懵懂懂、毫无感觉,那么看向下一步: <strong>就业难度</strong>.</p>
<p>有些方向如今已是卷中卷,如果已入内卷大军,就只好勇往直前. 同样的,有的方向比较有<strong>钱景</strong>,有的方向比较有<strong>浅景</strong>,命运牢牢抓在自己手中.</p>
<p>写论文难度同理,不同方向差距不小,望君慎选.</p>
<p><strong>2)选择导师</strong></p>
<p>理论上,选择导师并不属于我们今天的题目. 但看到许多同学误选良人,研究生生涯苦不堪言,我听后深表同情,不禁掩面而泣.</p>
<p>选导师实为技术活,大家定要慎重. 许多同学依靠颜值择师,粗暴无比,最后不禁怀疑,到底是谁眼神不好.</p>
<p>如果有同学存在选导师方面的疑问,欢迎留言给我,下期详细为大家介绍如何“<strong>擦亮双眼选导师</strong>”,还你一个快乐研究生生活.</p>
<p><strong>3)如何入门研究方向</strong></p>
<p>听过很多刚入门的研究生同学抱怨,自己只有一个老师分配的大方向,在老板放羊的情况下手足无措,不知怎么下手. 我想告诉大家,不必多虑,学习生涯一定牢记: <strong>阅读文献才是正解</strong>.</p>
<p>以推荐系统方向为例,下面给出一个可参考的学习教程:</p>
<p><strong>阅读相关的经典论文和书籍</strong>,了解推荐系统的基本概念、发展历程以及主要技术和算法. 经典的推荐系统书籍如《 <a href="https://zhida.zhihu.com/search?content_id=599127741&content_type=Answer&match_order=1&q=%E6%8E%A8%E8%8D%90%E7%B3%BB%E7%BB%9F%E5%AE%9E%E8%B7%B5&zhida_source=entity">推荐系统实践</a>》.</p>
<p>相比书籍,我更推荐大家阅读最新的相关<a href="https://zhida.zhihu.com/search?content_id=599127741&content_type=Answer&match_order=1&q=%E7%BB%BC%E8%BF%B0%E6%96%87%E7%AB%A0&zhida_source=entity">综述文章</a>. 一般来说,阅读综述文章的好处有以下几点:</p>
<ul>
<li>综述文章通常会介绍推荐系统的<strong>基本概念</strong>、定义和发展历程,从宏观层面上概述了推荐系统的研究背景和重要性.- 对目前的推荐算法给出一个<strong>大致分类</strong>. 例如根据推荐方法可以分为基于内容的推荐、协同过滤推荐、混合推荐等; 也可以根据应用领域进行分类,如会话推荐、序列推荐、社交推荐等. 这有助于大家了解推荐系统的不同类型和应用场景.- 了解推荐系统的<strong>关键问题</strong>. 综述文章通常会列举并介绍推荐系统中的一些关键问题和挑战,如冷启动问题、数据稀疏性、长尾推荐、算法可解释性等. 了解这些问题可以帮助我们认识到推荐系统研究中需要解决的难点和实际应用中的挑战.- 了解<strong>经典的推荐算法和模型</strong>: 综述文章通常会概述一些经典的推荐算法和模型,如经典的基于矩阵分解的模型以及最近应用较多的基于深度学习的模型.- 了解推荐系统中常用的<strong>评价指标</strong>和<strong>实验方法</strong>,如准确率、召回率、覆盖率、AUC等.- 很重要的一点,了解<strong>最新研究进展</strong>和<strong>趋势</strong>: 综述文章通常会提到最新的研究进展和趋势,包括推荐系统领域的新兴研究方向、最新的算法和技术,以及与其他领域的交叉研究等. 或许这一点可以对我们日后细化研究方向给出建议.</li>
</ul>
<p>通过阅读综述文章,大家应该可以对自己的研究方向有了一个全面系统的认识. 但具体的算法细节可能还不得而知.</p>
<p><strong>4)阅读文献</strong></p>
<p>精度经典文献会让我们快速打好基础. 在精度重要论文的同时,我们要同步阅读代码,了解相关领域代码的实现过程,同时加深我们对论文算法的理解.</p>
<p><strong>如何寻找经典论文？</strong></p>
<p>通过前面综述阅读,大家应该会了解到一些重要的论文,如《Neural Graph Collaborative Filtering》、《Self-Attentive Sequential Recommendation》等.</p>
<p>其次,用好检索方法.</p>
<p>大家在<a href="https://zhida.zhihu.com/search?content_id=599127741&content_type=Answer&match_order=1&q=%E8%B0%B7%E6%AD%8C%E5%AD%A6%E6%9C%AF&zhida_source=entity">谷歌学术</a>、arxiv、Aminer、<strong>Web of Science</strong>等网站上输入英文关键字,检索响应主题的论文. 检索论文注意查看<strong>发表年份</strong>、<strong>引用数量</strong>.</p>
<p>同样的,在论文的related work中也会强调本研究的一些代表工作,大家可以系统阅读.</p>
<p><strong>如何确定研究热点？</strong></p>
<p>关注前沿研究进展: 了解当前推荐系统领域的研究热点和最新进展. 关注推荐系统相关<strong>顶会顶刊</strong>,阅读最新的研究论文,了解该领域的最新动态. 最核心的一点,关注最新论文是<strong>如何创新</strong>的,这可能会给后续你的想法带来很大启发.</p>
<p>其次,大家可以查看顶会论文的出处,关注前沿科研大组和工业界的动态. 一般来说,强势科研大组近期的研究方向就是热点所在.</p>
<p>核心: 论文读的多了,心中自然有所把握.</p>
<p><strong>相关会议</strong></p>
<ul>
<li><strong>机器学习人工智能</strong>: NeurIPS、ICML、ICLR、AAAI、IJCAI、UAI、COLT- 计算机视觉: CVPR、ECCV、ICCV- 自然语言处理: ACL、EMNLP、NAACL- 数据挖掘: SIGMOD、SIGKDD、SIGIR、WSDM、VLDB、ICDE</li>
</ul>
<p>一个关键问题,如何高效阅读文献. </p>
<p>掌握<strong>阅读论文技巧</strong>,例如如何确定阅读目标、如何筛选对自己有帮助的论文,怎样精度和粗读. 如果有朋友有需要,后续我会为大家专门介绍如何高效阅读文献.</p>
<p><strong>5)进行创新,写出论文</strong></p>
<p>回忆前面我们提到的,为什么有的同学写顶会如同吃饭,又有的同学写论文如同历劫？常言道,喜乐都是别人的,只有苦楚是自己的. 写论文一方面受到实验室条件的影响,另一方面就是自己的努力与悟性了.</p>
<p>总体而言关键点还是在于<strong>论文的大量阅读</strong>+<strong>敏锐的科研嗅觉</strong>+<strong>过关的英文写作</strong>+<strong>运气</strong>.</p>
<p>有些同学可能心存不解,真的没有技巧可言吗？</p>
<p>那必然不是,毕竟,没有什么是没有套路的. 如果有同学感兴趣,欢迎留言,后续为大家介绍,别人口中的“那些同学”,是怎么三个月出一篇论文的.</p>
<h2 id="6-xmysx">6. 项目与实习</h2>
<h3 id="6-1-xm">6.1 <strong>项目</strong></h3>
<p>如果你想做比赛,可以参考一下网站:</p>
<p><strong>Kaggle,天池****京东JDATA,DataFountain,Kesci,DataCastle等</strong> 
<strong>腾讯,中国平安等</strong> 
<strong>SIGKDD,CIKM,IJCAI等</strong></p>
<p>为了参加以上数据科学比赛,大家需要有一定的基础知识以及相关准备.</p>
<ul>
<li><strong>数学基础</strong>: 微积分、线性代数、概率论与数理统计、优化理论 <strong>Python</strong>: 《Python基础教程》《利用Python进行数据分析》《机器学习实战》- <strong>机器学习理论</strong>: 李航《统计机器学习》、Ian Goodfellow和Youshua Bengo《Deep Learning》- 软件配置:  开发环境: Anaconda、Jupyter Notebook/Pycharm 开源库: 数据处理: Numpy Scipy Matplotlib Pandas等;  机器学习: Sklearn XGBoost LightGBM Keras TensorFlow Pytorch等- <strong>硬件配置</strong>: Linux+服务器</li>
</ul>
<p>参加比赛的流程一般可以分为: <strong>赛题分析,数据探索,数据预处理,特征构造,特征选择,模型选择,模型优化,模型融合,预测提交</strong>.</p>
<ul>
<li><p><strong>赛题分析</strong>: 首先要仔细阅读比赛提供的赛题说明和数据集,了解比赛的背景和目标,明确要解决的问题以及评估指标,探明题目动机. 其次,大家要明确比赛的规则,例如每日提交次数. 明确好时间线,组好队.</p>
</li>
<li><p><strong>数据探索</strong>: 对提供的数据进行探索性分析,了解数据的特征、分布和缺失情况,发现数据中的规律、异常值或噪声,并进行可视化展示. 在这个过程中,对于特征重要性较高的变量,一定要做重点分析.</p>
</li>
<li><p><strong>数据预处理</strong>: 根据探索性分析的结果,对数据进行清洗、转换和填充缺失值等处理,以确保数据的质量和一致性.</p>
</li>
<li><p><strong>特征构造</strong>: 根据对赛题的理解和对数据的分析,从原始数据中提取或创建新的特征,以增强模型的表达能力. 这可能包括数值特征的变换、文本特征的提取、时间序列特征的处理等.</p>
</li>
<li><p><strong>特征选择</strong>: 对构造的特征进行评估和选择,筛选出对目标变量具有重要影响的特征,以减少模型的复杂性和提高预测性能. 请留意,特征工程非常重要,以至于有这样一句话: “数据和特征决定了机器学习的上限,而模型和算法只能去逼近这个上限”. 把至少一半的时间放在特征工程的工作是值得的.</p>
</li>
<li><p><strong>模型选择</strong>: 根据比赛的特点和要求,选择适合问题的机器学习或深度学习模型,如决策树、支持向量机、神经网络等. 大家要提前了解LightGBM、XGBoost等模型,非常好用.</p>
</li>
<li><p><strong>模型优化</strong>: 对选定的模型进行参数调优、模型结构优化等操作,以提高模型的泛化能力和预测准确性. 一般来说,比赛中常用留出法和K折交叉验证法.</p>
</li>
<li><p><strong>模型融合</strong>: 通过将多个训练良好的模型进行组合,如集成学习、堆叠模型等方法,以获得更好的预测结果.</p>
</li>
<li><p><strong>预测提交</strong>: 使用优化后的模型对测试数据进行预测,并按照比赛规则提交预测结果,通常会生成一个提交文件,其中包含对测试集样本的预测值.</p>
</li>
</ul>
<p>一般来说,新手小白选择<strong>Kaggle</strong>和<strong>阿里云天池</strong>就很适合,可以帮助你获得项目经验.</p>
<p>例如,在Kaggle上,你可以找到许多真实世界的数据科学竞赛和挑战,从优秀的案例上学习方法和技巧. Kaggle提供了大量的数据集和内置工具,方便进行数据探索、建模和预测等任务,并且很多比赛是有奖金的.</p>
<p>通常,参与比赛的人可以分为两类,一类是以奖金和排名为目标的职业选手,他们靠参加比赛来谋生. 另一类是业余爱好者和在校学生,他们参加比赛主要是为了提升自己的技能和背景.</p>
<p>从背景来看,业余爱好者和在校学生通常具备一定的技术能力,但经验相对较少,他们通过参加比赛来学习和锻炼自己,获得项目经验.</p>
<p><strong>小白如何上手kaggle</strong></p>
<p>通常情况下,参加Kaggle比赛的人最好具备统计、计算机或数学相关背景,并且掌握一定的编程技能,对机器学习和深度学习有基本的了解. 虽然Kaggle任务不限制使用编程语言,但大多数团队会选择Python和R.</p>
<p>预先的理论学习是必须的. 在此基础上,熟悉特征工程可以为你的比赛能力增色不少. 大家可以去Github上学习Kaggle冠军方案,代码质量非常之高.</p>
<p>以下三个项目案例受到众多朋友好评,在此推荐:</p>
<ol>
<li><strong>Titanic</strong></li>
</ol>
<p>中文教程: <a href="https://link.zhihu.com/?target=http%3A//blog.csdn.net/han_xiaoyang/article/details/49797143">逻辑回归应用之Kaggle泰坦尼克之灾</a></p>
<p>英文教程: <a href="https://link.zhihu.com/?target=https%3A//www.kaggle.com/helgejo/titanic/an-interactive-data-science-tutorial">An Interactive Data Science Tutorial</a></p>
<p><strong>2.</strong> Digital Recognition</p>
<p>中文教程: <a href="https://link.zhihu.com/?target=http%3A//blog.csdn.net/u012162613/article/details/41929171">大数据竞赛平台—Kaggle 入门</a></p>
<p>英文教程: <a href="https://link.zhihu.com/?target=https%3A//www.kaggle.com/arthurtok/digit-recognizer/interactive-intro-to-dimensionality-reduction">Interactive Intro to Dimensionality Reduction</a></p>
<p><strong>3.</strong> House Prices: Advanced Regression Techniques</p>
<p>中文教程: <a href="https://link.zhihu.com/?target=https%3A//www.cnblogs.com/irenelin/p/7400388.html">Kaggle竞赛 — 2017年房价预测</a></p>
<p>英文教程: <a href="https://link.zhihu.com/?target=https%3A//www.kaggle.com/neviadomski/house-prices-advanced-regression-techniques/how-to-get-to-top-25-with-simple-model-sklearn">How to get to TOP 25% with Simple Model using sklearn</a></p>
<p><strong>阿里云天池</strong>也是一个面向数据科学与人工智能竞赛的平台. 它与Kaggle类似,提供了各种竞赛项目,涵盖了如图像识别、自然语言处理、推荐系统等领域. 参与天池竞赛,可以利用阿里云的计算资源和数据处理能力.</p>
<h3 id="6-2-sx">6.2 <strong>实习</strong></h3>
<p>如果你还是本科生,那么到达大三之后,可以尽早<strong>进入实验室</strong>. 实验室给了本科生一个深入学习小方向的机会. 参与学校各个实验室里的相关项目,在解决实际问题时提高自己. 许多真实的例子表明,如果运气不错,部分同学可以以一二作身份获取一篇顶会. 本科的科研经历对于保研、申博以及找工作都十分有帮助.</p>
<p>完成了<strong>基础知识</strong>的积累,在校期间也完成了一到两个<strong>项目</strong>,已经达到了可以<strong>实习</strong>的阶段了. 在这个阶段,大家可以继续参与学校的项目,但要留出时间来专门准备实习面试. 按照当前的内卷形式,可能一些实习已经开始要求论文了.</p>
<p>面试通常包括三个方面: <strong>项目经验</strong>、<strong>编程能力</strong>和<strong>理论基础</strong>. 结合刷题目录尽可能多地过一遍中等难度的leetcode,然后开始系统地复习相关专业方向的知识. 同时,多看一些面试经验分享,这一过程可能会花掉2到3个月的时间.</p>
<h3 id="6-3-mxgs">6.3 <strong>迈向高手</strong></h3>
<p>以上学习过程可能会花到零基础小白3-6个月时间,但良好的基础绝对是日后成功的强大助力.</p>
<p>无论是在代码学习还是文献阅读过程中,遇到困难,大家都可以利用chatgpt进行强力辅助. 学习不难,关键在于何时开始. 让我们共同努力,眼前困境不在话下. 最后给大家推荐一份超详细的书单,对于学习人工智能的同学帮助非常大,且十分系统: </p>
<p><a href="https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzg3NzY2ODIzOA%3D%3D%26mid%3D2247530055%26idx%3D1%26sn%3D0ce284dcdd4316d7502359433f62a0e3%26chksm%3Dcf1d44a6f86acdb03221a975e37974a40807724e3779884d0dcd162f0f48f33b945860019e91%26token%3D742321105%26lang%3Dzh_CN%23rd">书单: 书单推荐,少即是多(含下载方式)</a></p>
<p>书单里的资料我会不断维护与更新～</p>
<p>最后如果对你有帮助的话,欢迎给</p>
<p><a href="//www.zhihu.com/people/ba243e181b981ab78893f6d0ff3e60e0">@对白</a></p>
<p>点赞收藏哦～</p>
<p>作者: 对白 
链接: <a href="https://www.zhihu.com/question/327809761/answer/3129735632">https://www.zhihu.com/question/327809761/answer/3129735632</a></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sxjc","text":"1. 数学基础"},{"level":3,"id":"1-1-xxds","text":"1.1 线性代数"},{"level":3,"id":"1-2-wjf","text":"1.2 微积分"},{"level":3,"id":"1-3-gsl","text":"1.3 概率论"},{"level":3,"id":"1-4-sxyh","text":"1.4 数学优化"},{"level":2,"id":"2-bc","text":"2. 编程"},{"level":3,"id":"2-1-python","text":"2.1 python"},{"level":3,"id":"2-2-c","text":"2.2 C++"},{"level":3,"id":"2-3-sfnl","text":"2.3 算法能力"},{"level":3,"id":"2-4-rjpz-linux","text":"2.4 软件配置: Linux"},{"level":3,"id":"2-5-yjpz-gpu","text":"2.5 硬件配置: GPU"},{"level":2,"id":"3-jqxxrm","text":"3. 机器学习入门"},{"level":3,"id":"3-1-llxx","text":"3.1 理论学习"},{"level":3,"id":"3-2-sj","text":"3.2 实践"},{"level":2,"id":"4-sdxxrm","text":"4. 深度学习入门"},{"level":3,"id":"4-1-llxx","text":"4.1 理论学习"},{"level":3,"id":"4-2-sj","text":"4.2 实践"},{"level":2,"id":"5-kyrm","text":"5. 科研入门"},{"level":2,"id":"6-xmysx","text":"6. 项目与实习"},{"level":3,"id":"6-1-xm","text":"6.1 项目"},{"level":3,"id":"6-2-sx","text":"6.2 实习"},{"level":3,"id":"6-3-mxgs","text":"6.3 迈向高手"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="1-intro/1.1-roadmap/ai-learning-route/ai-learning-route" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="1-intro/1.1-roadmap/ai-learning-route/ai-learning-route" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">人工智能学习路线</h1>
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
