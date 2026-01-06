import { Search, Calendar, Tag, ArrowRight, TrendingUp, Clock, Eye, X, Share2, ThumbsUp, MessageCircle, User, Send, Heart } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  author: string;
  views: number;
  image: string;
  tags: string[];
  featured?: boolean;
  likes?: number;
  comments?: Comment[];
}

interface Comment {
  id: number;
  author: string;
  avatar?: string;
  content: string;
  date: string;
  likes: number;
  replies?: Comment[];
}

export function NewsCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [likedArticles, setLikedArticles] = useState<Set<number>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showComments, setShowComments] = useState(false);
  
  const categories = ['全部', '新闻动态', '会员动态', '技术成果', '政策法规', '行业资讯', '活动报道'];
  
  const [articles, setArticles] = useState<NewsArticle[]>([
    {
      id: 1,
      title: '专委会成功举办2024年度给排水技术创新论坛',
      excerpt: '本次论坛汇聚了200余位行业专家，围绕智慧水务、海绵城市、二次供水等热点话题展开深入探讨，推动给排水行业技术创新与应用...',
      content: `
        <p>2024年12月20日，广东省土木建筑学会给水排水专业委员会在广州成功举办了"2024年度给排水技术创新论坛"。本次论坛汇聚了来自全省各地的200余位行业专家、学者及企业代表，围绕智慧水务、海绵城市、二次供水等热点话题展开了深入探讨。</p>
        
        <h3>论坛亮点</h3>
        <p>论坛邀请了多位行业知名专家作主题报告，包括：</p>
        <ul>
          <li>中国工程院院士张教授分享了《智慧水务技术发展趋势与应用》</li>
          <li>华南理工大学李教授介绍了《海绵城市建设的广东实践》</li>
          <li>广州市水务局王局长解读了《城市供水管网优化升级策略》</li>
          <li>深圳水务集团陈总工程师分享了《二次供水设施智能化管理经验》</li>
        </ul>
        
        <h3>技术交流与讨论</h3>
        <p>在下午的分论坛环节，与会代表围绕以下议题进行了热烈讨论：</p>
        <ul>
          <li>智慧水务平台建设与数据应用</li>
          <li>海绵城市建设中的给排水系统设计</li>
          <li>二次供水设施的运维管理创新</li>
          <li>老旧小区供水管网改造技术</li>
        </ul>
        
        <h3>成果与展望</h3>
        <p>论坛取得了丰硕成果，与会专家达成多项共识，并就技术标准编制、产学研合作等方面形成了合作意向。专委会将继续发挥平台作用，推动给排水行业技术创新与应用，为广东省城市水务事业发展贡献力量。</p>
        
        <p>本次论坛得到了上海荷瑞展览有限公司、多家设备制造企业及会员单位的大力支持。</p>
      `,
      category: '活动报道',
      date: '2024-12-20',
      author: '专委会秘书处',
      views: 1580,
      image: 'https://images.unsplash.com/photo-1687945727613-a4d06cc41024?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb25mZXJlbmNlJTIwbWVldGluZ3xlbnwxfHx8fDE3NjY1NzIyMzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['技术论坛', '智慧水务', '行业交流'],
      featured: true,
      likes: 15,
      comments: [
        {
          id: 1,
          author: '张三',
          avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdmF0YXJ8ZW58MXx8fHwxNzM2NTcyNzI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
          content: '非常精彩的论坛，学到了很多新知识！',
          date: '2024-12-21',
          likes: 5,
          replies: [
            {
              id: 2,
              author: '李四',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdmF0YXJ8ZW58MXx8fHwxNzM2NTcyNzI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
              content: '同意，这次论坛确实很有启发性。',
              date: '2024-12-22',
              likes: 3,
            },
          ],
        },
        {
          id: 3,
          author: '王五',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdmF0YXJ8ZW58MXx8fHwxNzM2NTcyNzI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
          content: '期待下次论坛！',
          date: '2024-12-23',
          likes: 2,
        },
      ],
    },
    {
      id: 2,
      title: '广东省建筑给排水设计规范修订工作正式启动',
      excerpt: '为适应新时代建筑给排水技术发展需求，专委会组织行业专家启动《广东省建筑给排水设计规范》修订工作，预计2025年完成...',
      content: `
        <p>2024年12月18日，《广东省建筑给排水设计规范》修订工作启动会在广州召开。本次修订工作由广东省土木建筑学会给水排水专业委员会牵头组织，汇集了省内30余位给排水领域的顶尖专家和技术骨干。</p>
        
        <h3>修订背景</h3>
        <p>现行《广东省建筑给排水设计规范》自2015年发布实施以来，对规范全省建筑给排水设计、提升工程质量发挥了重要作用。然而，随着城市建设的快速发展和技术的不断进步，现行规范在以下方面已不能完全适应新形势需要：</p>
        <ul>
          <li>智慧建筑与智慧水务的融合应用</li>
          <li>绿色建筑与节水技术的新要求</li>
          <li>二次供水设施的安全与智能化管理</li>
          <li>建筑排水系统的雨污分流与资源化利用</li>
        </ul>
        
        <h3>修订重点</h3>
        <p>本次修订将重点关注以下内容：</p>
        <ul>
          <li>完善建筑给水系统设计标准，强化水质安全保障</li>
          <li>优化建筑排水系统设计要求，提升雨水资源化利用水平</li>
          <li>增加智慧水务技术应用相关条款</li>
          <li>补充二次供水设施设计与管理规定</li>
          <li>更新节水器具和设备的技术参数</li>
        </ul>
        
        <h3>工作计划</h3>
        <p>修订工作分为四个阶段：</p>
        <ol>
          <li>调研与资料收集阶段（2024年12月-2025年3月）</li>
          <li>标准编制阶段（2025年4月-2025年8月）</li>
          <li>征求意见与完善阶段（2025年9月-2025年11月）</li>
          <li>审查与报批阶段（2025年12月）</li>
        </ol>
        
        <p>预计新版规范将于2025年底完成修订并发布实施，为广东省建筑给排水设计提供更加科学、先进的技术支撑。</p>
      `,
      category: '技术成果',
      date: '2024-12-18',
      author: '技术部',
      views: 2350,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N1bWVudCUyMHdvcmt8ZW58MXx8fHwxNzM2NTcyNzI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['设计规范', '标准编制', '技术创新'],
      featured: true,
    },
    {
      id: 3,
      title: '新增8家单位会员，会员规模持续扩大',
      excerpt: '本月新增8家优质单位会员，涵盖设备制造、工程设计、施工建设等多个领域，会员总数突破310家，行业影响力持续提升...',
      content: '',
      category: '会员动态',
      date: '2024-12-15',
      author: '会员服务部',
      views: 890,
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBoYW5kc2hha2V8ZW58MXx8fHwxNzM2NTcyNzI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['会员发展', '行业合作'],
    },
    {
      id: 4,
      title: '住建部发布《城市供水管网漏损控制及评定标准》',
      excerpt: '住房和城乡建设部发布新版《城市供水管网漏损控制及评定标准》，将于2025年3月1日起实施，对供水企业漏损率提出更高要求...',
      content: '',
      category: '政策法规',
      date: '2024-12-12',
      author: '政策研究部',
      views: 3200,
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzM2NTcyNzI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['政策法规', '管网漏损', '标准规范'],
      featured: true,
    },
    {
      id: 5,
      title: '智慧水务技术应用研讨会圆满举办',
      excerpt: '专委会联合多家单位成功举办智慧水务技术应用研讨会，80余位行业专家参会，分享智慧水务最新技术与实践案例...',
      content: '',
      category: '活动报道',
      date: '2024-12-10',
      author: '专委会秘书处',
      views: 1450,
      image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwc2VtaW5hcnxlbnwxfHx8fDE3MzY1NzI3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['智慧水务', '技术研讨', '案例分享'],
    },
    {
      id: 6,
      title: '《二次供水设施技术规程》编制工作取得重要进展',
      excerpt: '由专委会主编的《二次供水设施技术规程》编制工作取得重要进展，已完成初稿并开始征求意见，预计2025年上半年正式发布...',
      content: '',
      category: '技术成果',
      date: '2024-12-08',
      author: '技术部',
      views: 1820,
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjB3b3JrfGVufDF8fHx8MTczNjU3MjcyN3ww&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['二次供水', '技术规程', '标准编制'],
    },
    {
      id: 7,
      title: '2025年广东国际泵管阀展览会筹备工作全面启动',
      excerpt: '2025年广东国际泵管阀展览会筹备工作全面启动，展会规模预计达60,000平方米，预计吸引600家参展企业，25,000名专业观众...',
      content: '',
      category: '新闻动态',
      date: '2024-12-05',
      author: '展会组委会',
      views: 2680,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGhpYml0aW9uJTIwaGFsbHxlbnwxfHx8fDE3MzY1NzI3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['泵阀展', '行业展会', '商业合作'],
    },
    {
      id: 8,
      title: '海绵城市建设技术指南发布，助力城市韧性提升',
      excerpt: '国家发改委、住建部联合发布《海绵城市建设技术指南（2024版）》，为各地海绵城市建设提供技术支撑，推动城市排水系统升级改造...',
      content: '',
      category: '行业资讯',
      date: '2024-12-03',
      author: '行业观察',
      views: 2100,
      image: 'https://images.unsplash.com/photo-1533158388470-9a56699990c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNpdHl8ZW58MXx8fHwxNzM2NTcyNzI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['海绵城市', '技术指南', '城市建设'],
    },
    {
      id: 9,
      title: '专委会专家团队赴深圳开展技术咨询服务',
      excerpt: '应深圳市水务局邀请，专委会组织5位专家赴深圳开展供水管网优化技术咨询服务，为深圳市供水系统升级改造提供专业建议...',
      content: '',
      category: '会员动态',
      date: '2024-12-01',
      author: '专家服务部',
      views: 1320,
      image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZXxlbnwxfHx8fDE3MzY1NzI3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['技术咨询', '专家服务', '供水管网'],
    },
  ]);

  const filteredNews = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === '全部' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredNews = articles.filter(article => article.featured);
  const latestNews = articles.slice(0, 5);

  // Get related news (same category, exclude current article)
  const getRelatedNews = (article: NewsArticle) => {
    return articles
      .filter(a => a.id !== article.id && a.category === article.category)
      .slice(0, 3);
  };

  const handleReadArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setShowComments(false); // Reset comments visibility when opening new article
    setReplyingTo(null); // Reset reply state
    setCommentText(''); // Clear comment input
    setReplyText(''); // Clear reply input
    // Scroll to top when opening article
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLikeArticle = (articleId: number) => {
    setLikedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const handleLikeComment = (commentId: number) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleAddComment = () => {
    if (selectedArticle && commentText.trim()) {
      const newComment: Comment = {
        id: Date.now(),
        author: '匿名用户',
        content: commentText,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
      };
      setArticles(prev => {
        return prev.map(article => {
          if (article.id === selectedArticle.id) {
            const updatedArticle = {
              ...article,
              comments: [...(article.comments || []), newComment],
            };
            setSelectedArticle(updatedArticle); // Update selected article state
            return updatedArticle;
          }
          return article;
        });
      });
      setCommentText('');
    }
  };

  const handleAddReply = () => {
    if (selectedArticle && replyingTo && replyText.trim()) {
      const newReply: Comment = {
        id: Date.now(),
        author: '匿名用户',
        content: replyText,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
      };
      setArticles(prev => {
        return prev.map(article => {
          if (article.id === selectedArticle.id) {
            return {
              ...article,
              comments: article.comments?.map(comment => {
                if (comment.id === replyingTo) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), newReply],
                  };
                }
                return comment;
              }),
            };
          }
          return article;
        });
      });
      setReplyText('');
      setReplyingTo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* News Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            {/* Modal Header with Cover Image */}
            <div className="relative h-64 md:h-96">
              <ImageWithFallback
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Article Meta on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {selectedArticle.category}
                  </span>
                  {selectedArticle.featured && (
                    <span className="px-3 py-1 bg-red-500/80 backdrop-blur-sm rounded-full text-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      推荐
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl mb-4 leading-tight">
                  {selectedArticle.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedArticle.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{selectedArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{selectedArticle.views} 阅读</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-10 max-h-[60vh] overflow-y-auto">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-200">
                {selectedArticle.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content || `<p>${selectedArticle.excerpt}</p>` }}
                style={{
                  lineHeight: '1.8'
                }}
              />

              {/* Article Footer Actions */}
              <div className="mt-10 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeArticle(selectedArticle.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ThumbsUp
                        className="w-4 h-4"
                        fill={likedArticles.has(selectedArticle.id) ? 'blue' : 'none'}
                      />
                      <span className="text-sm">点赞</span>
                    </button>
                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">评论</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">分享</span>
                  </button>
                </div>

                {/* Related News */}
                {getRelatedNews(selectedArticle).length > 0 && (
                  <div>
                    <h3 className="text-lg text-gray-900 mb-4">相关新闻</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {getRelatedNews(selectedArticle).map((article) => (
                        <div
                          key={article.id}
                          onClick={() => handleReadArticle(article)}
                          className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors group"
                        >
                          <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                            <ImageWithFallback
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <h4 className="text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{article.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                {showComments && (
                  <div className="mt-6">
                    <h3 className="text-lg text-gray-900 mb-4">评论</h3>
                    <div className="space-y-4">
                      {selectedArticle.comments?.map(comment => (
                        <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                              {comment.avatar ? (
                                <ImageWithFallback
                                  src={comment.avatar}
                                  alt={comment.author}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {comment.author}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{comment.date}</span>
                                <span>·</span>
                                <Eye className="w-3 h-3" />
                                <span>{comment.likes} 点赞</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <ThumbsUp
                                className="w-4 h-4"
                                fill={likedComments.has(comment.id) ? 'blue' : 'none'}
                              />
                              <span className="text-sm">点赞</span>
                            </button>
                            <button
                              onClick={() => setReplyingTo(comment.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm">回复</span>
                            </button>
                          </div>
                          {comment.replies?.map(reply => (
                            <div key={reply.id} className="bg-gray-100 p-4 rounded-lg mt-2 ml-8">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                  {reply.avatar ? (
                                    <ImageWithFallback
                                      src={reply.avatar}
                                      alt={reply.author}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {reply.author}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{reply.date}</span>
                                    <span>·</span>
                                    <Eye className="w-3 h-3" />
                                    <span>{reply.likes} 点赞</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">{reply.content}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <button
                                  onClick={() => handleLikeComment(reply.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  <ThumbsUp
                                    className="w-4 h-4"
                                    fill={likedComments.has(reply.id) ? 'blue' : 'none'}
                                  />
                                  <span className="text-sm">点赞</span>
                                </button>
                              </div>
                            </div>
                          ))}
                          {replyingTo === comment.id && (
                            <div className="mt-2 ml-8">
                              <input
                                type="text"
                                placeholder="回复评论..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                              />
                              <button
                                onClick={handleAddReply}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                              >
                                发送
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <input
                        type="text"
                        placeholder="添加评论..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                      />
                      <button
                        onClick={handleAddComment}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                      >
                        发送
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">新闻中心</h1>
          <p className="text-gray-600">了解专委会最新动态与行业资讯</p>
        </div>

        {/* Featured News - Top Banner */}
        {featuredNews.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-64 lg:h-auto">
                  <ImageWithFallback
                    src={featuredNews[0].image}
                    alt={featuredNews[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:hidden"></div>
                </div>
                
                {/* Content */}
                <div className="p-8 md:p-10 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                      头条推荐
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                      {featuredNews[0].category}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl mb-4 leading-tight">
                    {featuredNews[0].title}
                  </h2>
                  <p className="text-white/90 mb-6 leading-relaxed">
                    {featuredNews[0].excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-white/80 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredNews[0].date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{featuredNews[0].views} 阅读</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleReadArticle(featuredNews[0])}
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2"
                  >
                    <span>阅读全文</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索新闻标题、内容或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            找到 {filteredNews.length} 条新闻
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - News List */}
          <div className="lg:col-span-2 space-y-6">
            {filteredNews.map((article) => (
              <div
                key={article.id}
                onClick={() => handleReadArticle(article)}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {/* Image */}
                  <div className="relative h-48 md:h-auto overflow-hidden">
                    <ImageWithFallback
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {article.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          推荐
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="md:col-span-2 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {article.date}
                      </span>
                    </div>

                    <h3 className="text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{article.author}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.views}</span>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 text-blue-600 text-sm group-hover:gap-2 transition-all">
                        <span>阅读全文</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Latest News */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg text-gray-900">最新动态</h3>
              </div>
              <div className="space-y-4">
                {latestNews.map((article, index) => (
                  <div
                    key={article.id}
                    onClick={() => handleReadArticle(article)}
                    className="pb-4 border-b border-gray-100 last:border-0 last:pb-0 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{article.date}</span>
                          <span>·</span>
                          <Eye className="w-3 h-3" />
                          <span>{article.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot Tags */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg text-gray-900">热门标签</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(articles.flatMap(article => article.tags))).slice(0, 12).map((tag, index) => (
                  <button
                    key={index}
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-lg mb-3">订阅资讯</h3>
              <p className="text-sm text-blue-100 mb-4">
                订阅我们的新闻通讯，第一时间获取行业最新资讯
              </p>
              <input
                type="email"
                placeholder="请输入您的邮箱"
                className="w-full px-4 py-2 rounded-lg text-gray-900 mb-3 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
              <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                立即订阅
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">未找到相关新闻</p>
            <p className="text-sm text-gray-500">请尝试其他搜索条件</p>
          </div>
        )}
      </div>
    </div>
  );
}